import type { Runner } from "@bernouy/socle";
import { basename, dirname, join } from "node:path";
import type { ControlCms } from "src/control/ControlCms";
import { cachedResponseAsync, compress, publicAssetCacheControl } from "src/control/server/compression";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

/**
 * Compiled client bundles referenced from rendered public pages with a
 * content hash (`?v=...`). The endpoint checks the presence of `?v=` via
 * `publicAssetCacheControl` and picks between `immutable` (hashed) and
 * `no-cache` (unhashed, editor/dev contexts).
 */
const HASHED_CLIENT_ASSETS = new Set(["/assets/component"]);

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
            const hashed = HASHED_CLIENT_ASSETS.has(urlPath);
            runner.addEndpoint("GET", urlPath + ".js", async (req: Request) => {
                return cachedResponseAsync(
                    req,
                    cacheKey,
                    cms.cache,
                    async () => {
                        const result = await Bun.build({ entrypoints: [clientFile], format: "iife" });
                        return compress(await result.outputs[0]!.text(), "text/javascript");
                    },
                    hashed ? publicAssetCacheControl(req) : undefined,
                );
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


export async function registerCSSFolder(url: string, absoluteFolderPath: string, cms: ControlCms, runner: Runner) {
    const glob = new Bun.Glob("**/*.css");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        const cacheKey = P9R_CACHE.css(endpointUrl);
        runner.addEndpoint("GET", endpointUrl, async (req: Request) => {
            return cachedResponseAsync(req, cacheKey, cms.cache, async () => {
                const content = await Bun.file(fullPath).text();
                return compress(content, "text/css");
            });
        });
    }
}

/**
 * Serve every `.woff2` found under `absoluteFolderPath` at `<url>/<file>`.
 * woff2 is already Brotli-compressed internally; the extra gzip/brotli pass
 * done by `compress()` is a no-op in practice but keeps the asset pipeline
 * uniform (one cache shape, one response builder).
 */
export async function registerFontsFolder(url: string, absoluteFolderPath: string, cms: ControlCms, runner: Runner) {
    const glob = new Bun.Glob("**/*.woff2");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        const cacheKey = P9R_CACHE.font(endpointUrl);
        runner.addEndpoint("GET", endpointUrl, async (req: Request) => {
            return cachedResponseAsync(req, cacheKey, cms.cache, async () => {
                const content = await Bun.file(fullPath).arrayBuffer();
                return compress(content, "font/woff2");
            });
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