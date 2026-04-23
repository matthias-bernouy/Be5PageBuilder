import { registerUIFolder, registerAPIFolder, registerResourcesFolder } from "src/control/server/routing";
import { join } from "node:path"
import type { ControlCms } from "src/control/ControlCms";
import type { Middleware } from "@bernouy/socle";
import { compress, cachedResponseAsync } from "src/socle/server/compression";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

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

        // No landing page at /admin yet — bounce to the pages listing so the
        // admin opens on something meaningful. Uses a plain 302 (not a
        // permanent redirect) so adding a real dashboard later just flips
        // the target without invalidating bookmarked URLs.
        r.get("/admin", () => new Response(null, {
            status:  302,
            headers: { Location: `${cms.basePath}/admin/pages` },
        }));

        // Browser bootstrap for the active Media provider. We ship the
        // class source (via `constructor.toString()`) plus a JSON snapshot
        // of the instance state, and rehydrate on the client into
        // `window._cms.Media`. Works for self-contained classes (no
        // top-level imports referenced from method bodies, no closures over
        // module scope). Cached for the lifetime of the cache entry — if
        // the provider mutates state after boot, invalidate this key to
        // re-serialize.
        r.get("/_cms/media.js", (req: Request) =>
            cachedResponseAsync(req, P9R_CACHE.js("cms-media-client"), cms.cache, async () =>
                compress(buildMediaHydrationScript(cms.media), "text/javascript"),
            ),
        );
    }, [createAuthGuard(cms)]);

}

/**
 * Serialize the Media instance to a browser-side script that reconstructs it
 * and binds to `window._cms.Media`. Relies on `constructor.toString()` for
 * the class body and a tagged-JSON replacer for the instance state.
 *
 * Limitations worth knowing:
 * - The class must be self-contained: any identifier the method bodies
 *   reference must be resolvable from the browser's global scope or from
 *   the class itself (static helpers, inherited members). Top-level imports
 *   and module-scoped helpers are invisible to `toString()`.
 * - Private fields (`#foo`) are not enumerable and won't survive the
 *   JSON snapshot; use `_foo` conventions if you need to rehydrate state.
 * - `Map`, `Set`, `Date`, `Uint8Array` are preserved via the tagged replacer
 *   below. Anything else serializable-looking goes through `JSON.stringify`
 *   as-is.
 */
function buildMediaHydrationScript(media: ControlCms["media"]): string {
    const className   = media.constructor.name;
    const classSource = media.constructor.toString();
    const state       = JSON.stringify(media, taggedReplacer);
    // `(0, eval)` runs in the global scope so the class declaration is
    // parsed as an expression and returned. Wrapping the source in `(…)`
    // forces expression context for `class X { … }`.
    return `(() => {
    const __src = ${JSON.stringify(classSource)};
    const Klass = (0, eval)("(" + __src + ")");
    const revive = (_k, v) => {
        if (v && typeof v === "object" && v.__cms_type) {
            if (v.__cms_type === "Date")       return new Date(v.v);
            if (v.__cms_type === "Map")        return new Map(v.v);
            if (v.__cms_type === "Set")        return new Set(v.v);
            if (v.__cms_type === "Uint8Array") return new Uint8Array(v.v);
        }
        return v;
    };
    const state = JSON.parse(${JSON.stringify(state)}, revive);
    const instance = Object.create(Klass.prototype);
    Object.assign(instance, state);
    window._cms = window._cms || {};
    window._cms.Media = instance;
    if (${JSON.stringify(className)} && !(instance instanceof Klass)) {
        console.warn("[cms] hydrated Media instance is not an instance of", ${JSON.stringify(className)});
    }
})();`;
}

function taggedReplacer(_key: string, value: unknown): unknown {
    if (value instanceof Date)       return { __cms_type: "Date",       v: value.toISOString() };
    if (value instanceof Map)        return { __cms_type: "Map",        v: [...value.entries()] };
    if (value instanceof Set)        return { __cms_type: "Set",        v: [...value] };
    if (value instanceof Uint8Array) return { __cms_type: "Uint8Array", v: Array.from(value) };
    return value;
}
