import { gzipSync } from "bun";
import { brotliCompressSync } from "node:zlib";
import type { Cache, CacheEntry } from "src/interfaces/contract/Cache/Cache";

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

function sendCompressed(req: Request, entry: CacheEntry): Response {
    const accept = req.headers.get("accept-encoding") || "";

    if (accept.includes("br")) {
        return new Response(entry.brotli as BodyInit, {
            headers: {
                "Content-Type": entry.contentType,
                "Content-Encoding": "br",
                "X-Content-Type-Options": "nosniff",
            },
        });
    }

    if (accept.includes("gzip")) {
        return new Response(entry.gzip as BodyInit, {
            headers: {
                "Content-Type": entry.contentType,
                "Content-Encoding": "gzip",
                "X-Content-Type-Options": "nosniff",
            },
        });
    }

    return new Response(entry.raw as BodyInit, {
        headers: {
            "Content-Type": entry.contentType,
            "X-Content-Type-Options": "nosniff",
        },
    });
}
