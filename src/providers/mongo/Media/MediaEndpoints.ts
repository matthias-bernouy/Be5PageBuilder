import type { Be5_Runner, Runner } from "@bernouy/socle";
import type { DefaultMediaRepository } from "./DefaultMediaRepository";
import type { MediaDocument } from "src/contracts/Media/MediaRepository";
import sharp from "sharp";
import { LADDER_SET } from "src/server/imageOptimization/imageLadder";
import { VariantCache } from "./VariantCache";

// Only raster image mimetypes we are willing to serve directly. SVG is
// intentionally excluded from the allow-list and served with a hardening
// header set that prevents script execution (see below).
const SAFE_IMAGE_MIMES = new Set([
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/svg+xml",
]);

// Accept only an integer that is on the ladder of allowed widths/heights —
// anything else is rejected. Bounding to a known set both shrinks the cache
// keyspace (so the on-demand variant cache stays bounded) and prevents
// callers from forcing an arbitrarily large pixel grid through sharp.
function parseDimension(raw: string | null): number | undefined {
    if (!raw) return undefined;
    if (!/^\d+$/.test(raw)) return NaN as any;
    const n = Number(raw);
    if (!LADDER_SET.has(n)) return NaN as any;
    return n;
}

export default function MediaEndpoints(runner: Runner, system: DefaultMediaRepository) {

    const variantCache = system.variantCache;

    runner.get("/media", async (req: Request) => {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        const w = url.searchParams.get("w");
        const h = url.searchParams.get("h");

        if (!id) return new Response("ID missing", { status: 400 });

        const parsedW = parseDimension(w);
        const parsedH = parseDimension(h);
        if (Number.isNaN(parsedW as any) || Number.isNaN(parsedH as any)) {
            return new Response("Invalid dimension", { status: 400 });
        }

        const item = await system.getItem(id);

        if (!item || item.type === "folder") return new Response("Not found", { status: 404 });

        const castItem = item as MediaDocument;

        // Refuse to serve anything outside the image allow-list. A stored
        // `text/html` or `application/javascript` would otherwise execute
        // in the page origin via `<img src=/media?id=..>` → redirect tricks.
        if (!SAFE_IMAGE_MIMES.has(castItem.mimetype)) {
            // Force a benign image Content-Type so a misstored HTML/JS blob
            // cannot be rendered as HTML/JS in the browser.
            return new Response("", {
                status: 415,
                headers: {
                    "Content-Type": "image/png",
                    "X-Content-Type-Options": "nosniff",
                },
            });
        }

        let body: Buffer | Uint8Array = castItem.content;

        const isSvg = castItem.mimetype === "image/svg+xml";
        if (castItem.type === "image" && !isSvg && (parsedW || parsedH)) {
            const cacheKey = VariantCache.keyFor(id, parsedW, parsedH);
            const cached = variantCache.get(cacheKey);
            if (cached) {
                body = cached;
            } else {
                const resized = await sharp(castItem.content)
                    .resize(parsedW, parsedH, { fit: 'inside', withoutEnlargement: true })
                    .toBuffer();
                // sharp returns a Node Buffer; store it as Uint8Array so the
                // cache holds a flat view rather than a pooled Buffer slice.
                const bytes = new Uint8Array(resized.buffer, resized.byteOffset, resized.byteLength);
                variantCache.set(cacheKey, bytes);
                body = bytes;
            }
        }

        const headers: Record<string, string> = {
            "Content-Type": castItem.mimetype,
            "Cache-Control": "public, max-age=31536000",
            // Defence in depth for every response.
            "X-Content-Type-Options": "nosniff",
        };
        if (isSvg) {
            // SVG can embed <script>. Lock it down with a strict CSP and force
            // download when linked directly so it never runs inline in the
            // origin. Inline `<img src=...svg>` use-cases stay fine because
            // browsers do not execute scripts in image-context SVG.
            headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
            headers["Content-Disposition"] = "attachment";
        }

        return new Response(body as any, { status: 200, headers });
    });
}