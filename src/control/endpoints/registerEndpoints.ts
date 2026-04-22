import { registerUIFolder, registerAPIFolder, registerResourcesFolder } from "src/control/server/routing";
import { join } from "node:path"
import type { ControlCms } from "src/control/ControlCms";
import type { Middleware } from "@bernouy/socle";

function res(str: string){
    return join(import.meta.dir, str);
}

/**
 * Auth + CSRF guard applied to every endpoint registered by Control. Assumes
 * the runner is already scoped — all requests reaching this middleware are
 * admin-scope by construction, so no path-prefix check is needed.
 *
 * Non-admin authenticated users receive 403 (no redirect). Unauthenticated
 * users are redirected to the auth provider's login URL.
 */
export const createAuthGuard = (cms: ControlCms): Middleware => {
    return async (req, next) => {
        const url = new URL(req.url);

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
                return new Response("Forbidden", { status: 403 });
            }
            throw new Error("Not connected");
        } catch (error) {
            const loginUrl = cms.auth.buildLoginUrl(url.pathname);
            return new Response(null, {
                status: 302,
                headers: { "Location": loginUrl }
            });
        }
    };
};

/**
 * Wire every Control endpoint onto `cms.runner`. The runner is already
 * scoped (consumer called `rootRunner.group(prefix, ...)` before passing
 * it in), so routes are registered at paths relative to `basePath`. The
 * inner `group("", ...)` is used purely to attach `authGuard` to every
 * endpoint without shifting paths.
 */
export function registerEndpoints(cms: ControlCms){

    cms.runner.group("", (r) => {
        registerUIFolder       ("/admin",     res("admin-ui"),        cms, r);
        registerAPIFolder      ("/api",       res("admin-api"),       cms, r);
        registerResourcesFolder("/resources", res("admin-resources"), r);
    }, [createAuthGuard(cms)]);

}
