import { send_html, send_js, type Be5System } from "be5-system";
import { basename, dirname, join } from "node:path";
import type { Be5PageBuilder } from "src/Be5PageBuilder";

export async function registerUIFolder(baseUrl: string, absolutePath: string, system: Be5PageBuilder) {
    const glob = new Bun.Glob("**/*.html");

    for await (const htmlFile of glob.scan(absolutePath)) {
        const relativeDir = dirname(htmlFile);
        const fileName = basename(htmlFile, ".html");
        
        let urlParts = [baseUrl];

        if (relativeDir !== ".") {
            urlParts.push(relativeDir);
        }

        if (fileName !== relativeDir && fileName !== "index") {
            urlParts.push(fileName);
        }

        const urlPath = join(...urlParts).replace(/\\/g, '/');

        const pageDir = join(absolutePath, relativeDir);

        const findFile = async (suffix: string) => {
            const scanner = new Bun.Glob(`*${suffix}`);
            for await (const file of scanner.scan({ cwd: pageDir })) return join(pageDir, file);
            return null;
        };

        const serverFile = await findFile(".server.ts");
        const clientFile = await findFile(".client.ts");
        const htmlPath   = await findFile(".html") || "index.html";

        if (serverFile){
            const module = await import(serverFile);
            const serverHandler = module.default as (req: Request, system: Be5PageBuilder) => Promise<Response>;
            system.runner.addEndpoint("GET", urlPath, async (req: Request) => {
                return await serverHandler(req, system);
            });
        } else {
            system.runner.addEndpoint("GET", urlPath, () => {
                return new Response(Bun.file(htmlPath));
            });
        }

        if (clientFile) {
            system.runner.addEndpoint("GET", urlPath + ".js", async () => {
                const result = await Bun.build({ entrypoints: [clientFile] });
                return send_js(await result.outputs[0]!.text());
            });
        }
    }
}


export async function registerCSSFolder(url: string, absoluteFolderPath: string, system: Be5PageBuilder) {
    const glob = new Bun.Glob("**/*.css");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        system.runner.addEndpoint("GET", endpointUrl, () => {
            return new Response(Bun.file(fullPath), {
                headers: { "Content-Type": "text/css" }
            });
        });
    }
}

export async function registerJSFolder(url: string, absoluteFolderPath: string, system: Be5PageBuilder) {
    const glob = new Bun.Glob("**/*.js");

    for await (const file of glob.scan(absoluteFolderPath)) {
        const fullPath = join(absoluteFolderPath, file);
        const endpointUrl = join(url, file).replace(/\\/g, '/');
        system.runner.addEndpoint("GET", endpointUrl, () => {
            return new Response(Bun.file(fullPath), {
                headers: { "Content-Type": "text/javascript" }
            });
        });
    }
}

export async function registerAPIFolder(url: string, absoluteFolderPath: string, system: Be5PageBuilder) {
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
            system.runner.addEndpoint(method as any, endpointUrl, (req) => {
                return handler(req, system)
            });
        } else {
            console.warn(`[API] No default export found in ${file}`);
        }
    }
}