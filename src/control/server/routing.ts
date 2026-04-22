import type { Runner } from "@bernouy/socle";
import { basename, dirname, join } from "node:path";
import type { ControlCms } from "src/control/ControlCms";
import { cachedResponseAsync, compress, SECURITY_HEADERS } from "src/socle/server/compression";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

// Mirrors the union accepted by socle's `Runner.addEndpoint`. Centralized
// here so the API-folder router can validate filenames against it without
// an `as any` cast in two places.
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
const ALLOWED_METHODS: readonly HTTPMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

function isHTTPMethod(s: string): s is HTTPMethod {
    return (ALLOWED_METHODS as readonly string[]).includes(s);
}

export async function registerUIFolder(baseUrl: string, absolutePath: string, cms: ControlCms, runner: Runner) {
    type PageEntry = { serverFile?: string; clientFile?: string; htmlFile?: string };
    const pages = new Map<string, PageEntry>();

    const fileTypes = [
        { glob: "**/*.html",      suffix: ".html",      key: "htmlFile"   },
        { glob: "**/*.server.ts", suffix: ".server.ts", key: "serverFile" },
        { glob: "**/*.client.ts", suffix: ".client.ts", key: "clientFile" },
    ] as const;

    for (const { glob, suffix, key } of fileTypes) {
        for await (const file of new Bun.Glob(glob).scan(absolutePath)) {
            const routeKey = toRouteKey(file, suffix);
            const entry = pages.get(routeKey) || {};
            (entry as any)[key] = join(absolutePath, file);
            pages.set(routeKey, entry);
        }
    }

    for (const [routeKey, { serverFile, clientFile, htmlFile }] of pages) {
        const urlPath = join(baseUrl, routeKey).replace(/\\/g, '/');

        if (serverFile) {
            const module = await import(serverFile);
            const serverHandler = module.default as (req: Request, cms: ControlCms) => Promise<Response>;
            runner.addEndpoint("GET", urlPath, async (req: Request) => {
                return await serverHandler(req, cms);
            });
        } else if (htmlFile) {
            const cacheKey = P9R_CACHE.html(urlPath);
            runner.addEndpoint("GET", urlPath, async (req: Request) => {
                return cachedResponseAsync(req, cacheKey, cms.cache, async () => {
                    const content = await Bun.file(htmlFile).text();
                    return compress(content, "text/html");
                });
            });
        }

        if (clientFile) {
            const cacheKey = P9R_CACHE.js(urlPath);
            runner.addEndpoint("GET", urlPath + ".js", async (req: Request) => {
                return cachedResponseAsync(req, cacheKey, cms.cache, async () => {
                    const result = await Bun.build({ entrypoints: [clientFile], format: "iife" });
                    return compress(await result.outputs[0]!.text(), "text/javascript");
                });
            });
        }
    }
}

function toRouteKey(filePath: string, suffix: string): string {
    const base = filePath.slice(0, -suffix.length);
    const dir = dirname(base);
    const name = basename(base);

    if (dir === ".") return name;
    if (name === basename(dir)) return dir;
    return base;
}


/**
 * Serve every file under `absoluteFolderPath` verbatim. Content-Type is
 * inferred from the file extension by `Bun.file`. No compression and no
 * in-memory caching — the admin is authenticated, low-traffic, and `.woff2`
 * is already Brotli-compressed internally anyway. Attach security headers
 * so the response matches the posture of the rest of the admin surface.
 *
 * Subfolders are preserved: a file at `<root>/css/style.css` is served at
 * `<url>/css/style.css`. This keeps relative `@import` and `url()`
 * references inside CSS working without rewrites.
 */
export async function registerResourcesFolder(url: string, absoluteFolderPath: string, runner: Runner) {
    const glob = new Bun.Glob("**/*");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        runner.addEndpoint("GET", endpointUrl, async () => {
            return new Response(Bun.file(fullPath), { headers: SECURITY_HEADERS });
        });
    }
}

export async function registerAPIFolder(url: string, absoluteFolderPath: string, cms: ControlCms, runner: Runner) {
    const glob = new Bun.Glob("**/*.ts");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        
        const parts = file.split('.');
        
        const baseName = parts[0] || "";
        const rawMethod = parts[1]?.toUpperCase() || "GET";
        if (!isHTTPMethod(rawMethod)) {
            console.warn(`[API] Ignored "${file}" — unknown HTTP method "${rawMethod}"`);
            continue;
        }
        const method: HTTPMethod = rawMethod;
        const endpointUrl = join(url, baseName).replace(/\\/g, '/');

        const module = await import(fullPath);
        const handler = module.default;

        if (typeof handler === 'function') {
            runner.addEndpoint(method, endpointUrl, (req: Request) => {
                return handler(req, cms)
            });
        } else {
            console.warn(`[API] No default export found in ${file}`);
        }
    }
}