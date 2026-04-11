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
        try {
            const subject = await system.auth.guardAuthenticated(req);
            if (subject.role !== "admin") throw new Error("Not connected")

            return await next();
        } catch (error) {
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

