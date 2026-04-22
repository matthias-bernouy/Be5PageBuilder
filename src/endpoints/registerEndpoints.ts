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

/**
 * Escape a string for safe interpolation inside an HTML attribute value that
 * is wrapped in double quotes. Covers the four characters that could break
 * out of the attribute or the surrounding tag.
 */
function escapeHtmlAttr(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Inject `<meta>` tags carrying CMS-global values into every admin page's
 * `<head>`. AdminLayout reads these at connectedCallback to wire up links
 * that depend on runtime configuration (logout URL, etc.) without any
 * build-time placeholder replacement.
 */
function buildAdminHtmlTransform(cms: Cms): (html: string) => string {
    const logoutUrl = escapeHtmlAttr(cms.auth.logoutUrl);
    const metaTags = `    <meta name="admin-logout-url" content="${logoutUrl}">\n`;
    return (html: string) => html.replace(/<\/head>/i, metaTags + "</head>");
}

export function registerEndpoints(cms: Cms){

    const adminHtmlTransform = buildAdminHtmlTransform(cms);

    cms.runner.group(cms.config.adminPathPrefix || "/cms", (r) => {

        registerUIFolder   ("/admin", res("admin-ui"),    cms, r, { htmlTransform: adminHtmlTransform });
        registerAPIFolder  ("/api",   res("admin-api"),   cms, r);
        registerCSSFolder  ("/css",   res("admin-css"),   cms, r);
        registerFontsFolder("/fonts", res("admin-fonts"), cms, r);

    }, [createAuthGuard(cms)]);


    registerUIFolder(cms.config.clientPathPrefix || "/", res("public"), cms, cms.runner);

}

