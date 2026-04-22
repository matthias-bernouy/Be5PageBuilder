import { registerUIFolder, registerCSSFolder, registerAPIFolder, registerFontsFolder } from "src/server/routing";
import { join } from "node:path"
import type { Cms } from "src/Cms";
import type { Middleware } from "@bernouy/socle";

function res(str: string){
    return join(import.meta.dir, str);
}

export const createAuthGuard = (cms: Cms): Middleware => {
    return async (req, next) => {
        const url = new URL(req.url);
        if ( !url.pathname.startsWith(cms.config.adminPathPrefix || "/cms") ) return await next();

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
            const subject = await cms.auth.getSubject(req);
            if (subject){
                if ( subject.role === "admin" ) {
                    return await next();
                }
                else {
                    return new Response(null, {
                        status: 302,
                        headers: { "Location": cms.config.clientPathPrefix || "/" }
                    });
                }
            } else {
                throw new Error("Not connected")
            }
        } catch (error) {
            const currentPath = new URL(req.url).pathname;
            const loginUrl = cms.auth.buildLoginUrl(currentPath);
            return new Response(null, {
                status: 302,
                headers: { "Location": loginUrl }
            });
        }
    };
};

export function registerEndpoints(cms: Cms){

    cms.runner.group(cms.config.adminPathPrefix || "/cms", (r) => {

        registerUIFolder   ("/admin", res("admin-ui"),    cms, r);
        registerAPIFolder  ("/api",   res("admin-api"),   cms, r);
        registerCSSFolder  ("/css",   res("admin-css"),   cms, r);
        registerFontsFolder("/fonts", res("admin-fonts"), cms, r);

    }, [createAuthGuard(cms)]);


    registerUIFolder(cms.config.clientPathPrefix || "/", res("public"), cms, cms.runner);

}

