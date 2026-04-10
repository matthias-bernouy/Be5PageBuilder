import { join } from "node:path";
import type { BuiltBloc } from "./build";
import { buildShell } from "./shell";
import { findBlockingRule, blockedResponse } from "./write-guard";
import { proxyRequest } from "./proxy";

export type ServerConfig = {
    port: number;
    host: string;
    adminBase: URL;
    publicOrigin: string;
    token: string;
    devBlocs: Map<string, BuiltBloc>;
    packageRoot: string;
};

export type ServerHandle = {
    url: string;
    editorUrl: string;
    stop: () => void;
};

export function startDevServer(config: ServerConfig): ServerHandle {
    const adminPrefix = config.adminBase.pathname.replace(/\/$/, "") || "";
    const editorHtmlPath = join(config.packageRoot, "src/endpoints/admin-ui/editor/editor.html");
    const editorPath = `${adminPrefix}/admin/editor`;

    const server = Bun.serve({
        port: config.port,
        hostname: config.host,
        async fetch(req) {
            const url = new URL(req.url);
            const path = url.pathname;

            // Root → editor
            if (path === "/" || path === "") {
                return Response.redirect(editorPath, 302);
            }

            // Editor shell — assembled locally
            if (req.method === "GET" && path === editorPath) {
                try {
                    const html = await buildShell({
                        editorHtmlPath,
                        adminPrefix,
                        adminBase: config.adminBase,
                        token: config.token,
                        devBlocs: config.devBlocs,
                    });
                    return new Response(html, {
                        headers: { "Content-Type": "text/html; charset=utf-8" },
                    });
                } catch (e) {
                    console.error(`[shell] ${e instanceof Error ? e.message : e}`);
                    return new Response("Failed to assemble editor shell", { status: 500 });
                }
            }

            // /bloc?tag=X — local dev bloc shadows remote
            if (req.method === "GET" && path === "/bloc") {
                const tag = url.searchParams.get("tag") || "";
                const dev = config.devBlocs.get(tag);
                if (dev) {
                    return new Response(dev.viewJS, {
                        headers: { "Content-Type": "application/javascript; charset=utf-8" },
                    });
                }
                return proxyRequest(req, `${config.publicOrigin}/bloc?tag=${encodeURIComponent(tag)}`, config);
            }

            // Write guard on admin API
            if (path.startsWith(`${adminPrefix}/api/`)) {
                const rule = findBlockingRule(req.method, path);
                if (rule) {
                    console.log(`[guard] Blocked ${req.method} ${path} (${rule.label})`);
                    return blockedResponse(rule, path);
                }
            }

            // Everything else → proxy to the remote CMS (admin UI assets, CSS,
            // API reads, public routes, …)
            return proxyRequest(req, `${config.publicOrigin}${path}${url.search}`, config);
        },
    });

    return {
        url: `http://${config.host}:${server.port}`,
        editorUrl: `http://${config.host}:${server.port}${editorPath}`,
        stop: () => server.stop(),
    };
}
