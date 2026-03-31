import type { Be5_Runner, IBe5_Runner } from "be5-interfaces";
import { send_html, send_js, type Be5System } from "be5-system";
import { basename, dirname, join } from "node:path";
import type { PageBuilder } from "src/PageBuilder";

export async function registerUIFolder(baseUrl: string, absolutePath: string, system: PageBuilder, runner: IBe5_Runner) {
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
            const serverHandler = module.default as (req: Request, system: PageBuilder) => Promise<Response>;
            runner.addEndpoint("GET", urlPath, async (req: Request) => {
                return await serverHandler(req, system);
            });
        } else if (htmlFile) {
            runner.addEndpoint("GET", urlPath, () => {
                return new Response(Bun.file(htmlFile));
            });
        }

        if (clientFile) {
            runner.addEndpoint("GET", urlPath + ".js", async () => {
                try {
                    const result = await Bun.build({ entrypoints: [clientFile], format: "iife" });
                    return send_js(await result.outputs[0]!.text());
                } catch (e) {
                    console.error("Error building client script for", urlPath, e);
                    return new Response("// Error building client script", {
                        headers: { "Content-Type": "text/javascript" }
                    });
                }
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


export async function registerCSSFolder(url: string, absoluteFolderPath: string, system: PageBuilder, runner: IBe5_Runner) {
    const glob = new Bun.Glob("**/*.css");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        runner.addEndpoint("GET", endpointUrl, () => {
            return new Response(Bun.file(fullPath), {
                headers: { "Content-Type": "text/css" }
            });
        });
    }
}

export async function registerJSFolder(url: string, absoluteFolderPath: string, system: PageBuilder, runner: IBe5_Runner) {
    const glob = new Bun.Glob("**/*.js");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        runner.addEndpoint("GET", endpointUrl, () => {
            return new Response(Bun.file(fullPath), {
                headers: { "Content-Type": "text/javascript" }
            });
        });
    }
}

export async function registerAPIFolder(url: string, absoluteFolderPath: string, system: PageBuilder, runner: IBe5_Runner) {
    const glob = new Bun.Glob("**/*.ts");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        
        const parts = file.split('.');
        
        const baseName = parts[0] || ""; 
        const method = parts[1]?.toUpperCase() || "GET";
        const endpointUrl = join(url, baseName).replace(/\\/g, '/');

        const module = await import(fullPath);
        const handler = module.default;

        if (typeof handler === 'function') {
            runner.addEndpoint(method as any, endpointUrl, (req: Request) => {
                return handler(req, system)
            });
        } else {
            console.warn(`[API] No default export found in ${file}`);
        }
    }
}