import { registerUIFolder, registerCSSFolder, registerAPIFolder } from "src/server/routing";
import { join } from "node:path"
import type { PageBuilder } from "src/PageBuilder";
import type { Middleware } from "@bernouy/socle";

function res(str: string){
    return join(import.meta.dir, str);
}

export const createAuthGuard = (system: PageBuilder): Middleware => {
    return async (req, next) => {
        const url = new URL(req.url);
        if ( !url.pathname.startsWith(system.config.adminPathPrefix || "/page-builder") ) return await next();

        // CSRF: mutating methods must come from the same origin.
        const method = req.method.toUpperCase();
        if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
            const origin = req.headers.get("origin") || req.headers.get("referer");
            if (origin) {
                try {
                    const oHost = new URL(origin).host;
                    if (oHost !== url.host) {
                        return new Response("CSRF: cross-origin request blocked", { status: 403 });
                    }
                } catch {
                    return new Response("CSRF: invalid origin", { status: 403 });
                }
            }
        }

        try {
            const subject = await system.auth.guardAuthenticated(req);
            if (subject.role !== "admin") throw new Error("Not connected")
            return await next();
        } catch (error) {
            console.log(error)
            const currentPath = new URL(req.url).pathname;
            const loginUrl = system.auth.withRedirect(system.auth.loginPage, currentPath);
            
            return new Response(null, {
                status: 302,
                headers: { "Location": loginUrl }
            });
        }
    };
};

export function registerEndpoints(system: PageBuilder){

    system.runner.group(system.config.adminPathPrefix || "/page-builder", (r) => {

        registerUIFolder ("/admin", res("admin-ui"), system, r);
        registerAPIFolder("/api", res("admin-api"), system, r);
        registerCSSFolder("/css", res("admin-css"), system, r);

    }, [createAuthGuard(system)]);


    registerUIFolder(system.config.clientPathPrefix || "/", res("public"), system, system.runner);

}

