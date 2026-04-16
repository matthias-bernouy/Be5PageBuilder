import { gzipSync } from "bun";
import { brotliCompressSync } from "node:zlib";
import type { Cache, CacheEntry } from "src/interfaces/contract/Cache/Cache";

/**
 * Static security headers applied to every compressed response.
 *
 * - nosniff: prevents MIME-type confusion on user-uploaded media.
 * - HSTS (1y, no includeSubDomains): forces HTTPS on future hits;
 *   omitting includeSubDomains lets plain-HTTP subdomains keep working.
 * - X-Frame-Options DENY: no iframes anywhere in this codebase, so
 *   clickjacking via <iframe> is always a bug.
 * - Referrer-Policy strict-origin-when-cross-origin: leaks only the
 *   origin (not the path/query) to third parties.
 * - Permissions-Policy: disables browser APIs we never use, so a
 *   DOM-XSS payload can't invoke them either.
 * - COOP same-origin: isolates our window from any cross-origin
 *   popup's opener reference (Spectre / tabnabbing mitigation).
 * - CORP same-origin: an external site can't load our bloc bundles,
 *   theme CSS or media through <script>/<img>/<link> tags. Tradeoff:
 *   external blogs can't hotlink our images either — acceptable for a
 *   CMS where the same instance also serves the published pages.
 */
export const SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
} as const;

/**
 * CSP applied to HTML responses only (it is meaningless on JS/CSS/image
 * responses — CSP governs how the *loading* document may fetch sub-resources,
 * so it belongs on the document itself).
 *
 * Report-Only mode: violations are logged to the browser console but nothing
 * is actually blocked. The goal of this phase is observation — we want to
 * discover which inline styles / innerHTML patterns / external sources would
 * break under an enforcing policy before switching over.
 *
 * Directives chosen to be as strict as possible so *any* real-world deviation
 * surfaces:
 * - default-src 'self': no external sub-resource by default
 * - base-uri 'self': forbid <base href=evil> rewrite of relative URLs
 * - form-action 'self': forbid <form action=https://evil> exfil
 * - object-src 'none': no <object>/<embed>/<applet>
 * - frame-ancestors 'none': superset of X-Frame-Options: DENY
 *
 * Add a `report-uri` (or `report-to` group) once a collector endpoint exists.
 */
/**
 * `style-src 'self' 'unsafe-inline'` is pragmatic: every Web Component in
 * this codebase ships its shadow-DOM CSS via an inline `<style>` tag inside
 * its template (and configuration panels use `style="..."` attributes).
 * Hashing each style block is impractical because bloc authors add new
 * components constantly. Inline *styles* can't execute JS, so the residual
 * risk is a style-only injection (CSS-based phishing) — accepted tradeoff.
 * Inline *scripts* remain forbidden via the stricter default-src 'self'.
 */
export const HTML_CSP_HEADER = {
    "Content-Security-Policy-Report-Only":
        "default-src 'self'; style-src 'self' 'unsafe-inline'; " +
        "base-uri 'self'; form-action 'self'; " +
        "object-src 'none'; frame-ancestors 'none'",
} as const;

function withCspIfHtml(contentType: string): Record<string, string> {
    if (!contentType.startsWith("text/html")) return {};
    return HTML_CSP_HEADER;
}

export function compress(raw: string | ArrayBuffer | Uint8Array, contentType: string): CacheEntry {
    const rawBytes = typeof raw === "string" ? new TextEncoder().encode(raw) : new Uint8Array(raw);
    const brotliResult = brotliCompressSync(rawBytes);

    return {
        raw: rawBytes,
        brotli: new Uint8Array(brotliResult.buffer, brotliResult.byteOffset, brotliResult.byteLength),
        gzip: new Uint8Array(gzipSync(rawBytes)),
        contentType,
    };
}

export function cachedResponse(
    req: Request,
    key: string,
    cache: Cache,
    generate: () => CacheEntry
): Response {
    let entry = cache.get(key);

    if (!entry) {
        entry = generate();
        cache.set(key, entry);
    }

    return sendCompressed(req, entry);
}

export async function cachedResponseAsync(
    req: Request,
    key: string,
    cache: Cache,
    generate: () => Promise<CacheEntry>
): Promise<Response> {
    let entry = cache.get(key);

    if (!entry) {
        entry = await generate();
        cache.set(key, entry);
    }

    return sendCompressed(req, entry);
}

export function sendCompressed(req: Request, entry: CacheEntry): Response {
    const accept = req.headers.get("accept-encoding") || "";

    const csp = withCspIfHtml(entry.contentType);

    if (accept.includes("br")) {
        return new Response(entry.brotli as BodyInit, {
            headers: {
                "Content-Type": entry.contentType,
                "Content-Encoding": "br",
                ...SECURITY_HEADERS,
                ...csp,
            },
        });
    }

    if (accept.includes("gzip")) {
        return new Response(entry.gzip as BodyInit, {
            headers: {
                "Content-Type": entry.contentType,
                "Content-Encoding": "gzip",
                ...SECURITY_HEADERS,
                ...csp,
            },
        });
    }

    return new Response(entry.raw as BodyInit, {
        headers: {
            "Content-Type": entry.contentType,
            ...SECURITY_HEADERS,
            ...csp,
        },
    });
}
