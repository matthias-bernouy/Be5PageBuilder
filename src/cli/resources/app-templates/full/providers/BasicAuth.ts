import type { Authentication, Runner, Subject } from "@bernouy/socle";
import type { CMS_ROLES } from "@bernouy/cms";

export type BasicAuthUser = {
    username:     string;
    passwordHash: string;
    role:         CMS_ROLES;
    displayName?: string;
};

export type BasicAuthConfig = {
    users:           BasicAuthUser[];
    /** Path prefix for login / logout / profile pages. Defaults to `/auth`. */
    basePath?:       string;
    /** Cookie name for the opaque session token. Defaults to `be5-session`. */
    cookieName?:     string;
    /** Session lifetime in seconds. Defaults to 7 days. */
    sessionTtlSec?:  number;
    /** Forces the `Secure` cookie attribute. Defaults to `false` (dev-friendly). */
    cookieSecure?:   boolean;
};

/**
 * Username/password `Authentication` provider. Stores sessions in an
 * in-process `Map` (opaque random token as cookie, subject kept server-side).
 *
 * No dependencies, no cookie signing — swapping the cookie across instances
 * doesn't authenticate anyone because the session token is only a key into
 * this instance's map. Sessions are lost on restart.
 *
 * For production, swap for an OIDC consumer (e.g. `KeycloakConsumer` from
 * `@bernouy/socle`) and persistent session storage.
 */
export class BasicAuth implements Authentication<CMS_ROLES> {

    readonly loginUrl:   string;
    readonly logoutUrl:  string;
    readonly profileUrl: string;

    private readonly _users: Map<string, BasicAuthUser>;
    private readonly _basePath:      string;
    private readonly _cookieName:    string;
    private readonly _sessionTtlSec: number;
    private readonly _cookieSecure:  boolean;
    private readonly _sessions = new Map<string, { subject: Subject<CMS_ROLES>; expiresAt: number }>();

    constructor(runner: Runner, config: BasicAuthConfig) {
        this._users         = new Map(config.users.map((u) => [u.username, u]));
        this._basePath      = stripTrailingSlash(config.basePath ?? "/auth");
        this._cookieName    = config.cookieName ?? "be5-session";
        this._sessionTtlSec = config.sessionTtlSec ?? 7 * 24 * 3600;
        this._cookieSecure  = config.cookieSecure ?? false;

        const rootBase = runner.basePath === "/" ? "" : runner.basePath;
        this.loginUrl   = `${rootBase}${this._basePath}/login`;
        this.logoutUrl  = `${rootBase}${this._basePath}/logout`;
        this.profileUrl = `${rootBase}${this._basePath}/profile`;

        runner.group(this._basePath, (r) => {
            r.get ("/login",   (req) => this._renderLoginPage(req));
            r.post("/login",   (req) => this._handleLogin(req));
            r.get ("/logout",  (req) => this._handleLogout(req));
            r.get ("/profile", (req) => this._renderProfilePage(req));
        });
    }

    buildLoginUrl(returnTo: string): string {
        return `${this.loginUrl}?returnTo=${encodeURIComponent(returnTo)}`;
    }

    buildLogoutUrl(returnTo: string): string {
        return `${this.logoutUrl}?returnTo=${encodeURIComponent(returnTo)}`;
    }

    async getSubject(req: Request): Promise<Subject<CMS_ROLES> | null> {
        const token = this._readCookie(req, this._cookieName);
        if (!token) return null;
        const session = this._sessions.get(token);
        if (!session) return null;
        if (session.expiresAt <= Date.now()) {
            this._sessions.delete(token);
            return null;
        }
        return session.subject;
    }

    private _renderLoginPage(req: Request, error?: string): Response {
        const url = new URL(req.url);
        const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"), "/");
        const errorHtml = error ? `<p class="error">${escapeHtml(error)}</p>` : "";
        return htmlResponse(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Sign in</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 360px; margin: 4rem auto; padding: 0 1rem; color: #1a1a1a; }
  h1 { margin-bottom: 1.5rem; }
  label { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; }
  input { width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
  button { width: 100%; padding: 0.6rem; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
  .error { color: #b00020; margin-bottom: 1rem; }
</style></head>
<body>
<h1>Sign in</h1>
${errorHtml}
<form method="POST" action="${escapeHtml(this.loginUrl)}">
  <input type="hidden" name="returnTo" value="${escapeHtml(returnTo)}"/>
  <label for="username">Username</label>
  <input id="username" name="username" required autocomplete="username"/>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" required autocomplete="current-password"/>
  <button type="submit">Sign in</button>
</form>
</body></html>`);
    }

    private async _handleLogin(req: Request): Promise<Response> {
        const form = await req.formData();
        const username = form.get("username")?.toString() ?? "";
        const password = form.get("password")?.toString() ?? "";
        const returnTo = sanitizeReturnTo(form.get("returnTo")?.toString() ?? "", "/");

        const user = this._users.get(username);
        const ok = user ? await Bun.password.verify(password, user.passwordHash) : false;
        if (!user || !ok) return this._renderLoginPage(req, "Invalid credentials");

        const token = crypto.randomUUID() + crypto.randomUUID();
        this._sessions.set(token, {
            subject: {
                identifier:  user.username,
                role:        user.role,
                displayName: user.displayName,
            },
            expiresAt: Date.now() + this._sessionTtlSec * 1000,
        });
        return new Response(null, {
            status:  302,
            headers: {
                Location:     returnTo,
                "Set-Cookie": this._serializeCookie(this._cookieName, token, this._sessionTtlSec),
            },
        });
    }

    private _handleLogout(req: Request): Response {
        const token = this._readCookie(req, this._cookieName);
        if (token) this._sessions.delete(token);
        const url = new URL(req.url);
        const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"), "/");
        return new Response(null, {
            status:  302,
            headers: {
                Location:     returnTo,
                "Set-Cookie": this._serializeCookie(this._cookieName, "", 0),
            },
        });
    }

    private async _renderProfilePage(req: Request): Promise<Response> {
        const subject = await this.getSubject(req);
        if (!subject) {
            return new Response(null, {
                status:  302,
                headers: { Location: this.buildLoginUrl(this.profileUrl) },
            });
        }
        return htmlResponse(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><title>Profile</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 420px; margin: 4rem auto; padding: 0 1rem; }
  .card { border: 1px solid #e5e5e5; padding: 1rem; border-radius: 6px; }
  code { background: #f7f7f7; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style></head>
<body>
<h1>Profile</h1>
<div class="card">
  <p>Identifier: <code>${escapeHtml(subject.identifier)}</code></p>
  <p>Display name: <strong>${escapeHtml(subject.displayName ?? subject.identifier)}</strong></p>
  <p>Role: <code>${escapeHtml(subject.role)}</code></p>
</div>
<p><a href="${escapeHtml(this.logoutUrl)}">Sign out</a></p>
</body></html>`);
    }

    private _readCookie(req: Request, name: string): string | null {
        const header = req.headers.get("cookie");
        if (!header) return null;
        for (const chunk of header.split(";")) {
            const [k, ...rest] = chunk.trim().split("=");
            if (k === name) return decodeURIComponent(rest.join("="));
        }
        return null;
    }

    private _serializeCookie(name: string, value: string, maxAgeSec: number): string {
        const parts = [
            `${name}=${encodeURIComponent(value)}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            `Max-Age=${maxAgeSec}`,
        ];
        if (this._cookieSecure) parts.push("Secure");
        return parts.join("; ");
    }
}

function stripTrailingSlash(s: string): string {
    return s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s;
}

function sanitizeReturnTo(candidate: string | null, fallback: string): string {
    if (!candidate) return fallback;
    if (!candidate.startsWith("/")) return fallback;
    if (candidate.startsWith("//")) return fallback;
    return candidate;
}

function escapeHtml(s: string): string {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function htmlResponse(body: string, status = 200): Response {
    return new Response(body, {
        status,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
