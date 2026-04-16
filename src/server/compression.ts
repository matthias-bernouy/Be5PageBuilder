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
 */
export const SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
} as const;

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

    if (accept.includes("br")) {
        return new Response(entry.brotli as BodyInit, {
            headers: {
                "Content-Type": entry.contentType,
                "Content-Encoding": "br",
                ...SECURITY_HEADERS,
            },
        });
    }

    if (accept.includes("gzip")) {
        return new Response(entry.gzip as BodyInit, {
            headers: {
                "Content-Type": entry.contentType,
                "Content-Encoding": "gzip",
                ...SECURITY_HEADERS,
            },
        });
    }

    return new Response(entry.raw as BodyInit, {
        headers: {
            "Content-Type": entry.contentType,
            ...SECURITY_HEADERS,
        },
    });
}
