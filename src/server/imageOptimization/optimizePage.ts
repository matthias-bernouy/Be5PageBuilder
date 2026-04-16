import type { PageBuilder } from "src/PageBuilder";
import { compress } from "src/server/compression";
import type { MediaImage } from "src/interfaces/contract/Media/MediaRepository";
import { computeSrcset } from "./computeSrcset";
import { rewriteHTML, extractMediaId, type ImageRewrite } from "./rewriteHTML";
import type { PlaywrightSession, ImageMeasurement } from "./PlaywrightSession";

export type OptimizePagePayload = {
    /** Path of the page route to load (e.g. "/about" or "/"). */
    path: string;
    /** Page identifier query (empty string for the default variant). */
    identifier: string;
    /** Origin of the running server, e.g. "http://localhost:4999". */
    origin: string;
    /** Cache key under which the rendered page is stored. */
    cacheKey: string;
};

/**
 * One end-to-end optimization pass. Steps:
 *  1. Drive Playwright to the page URL and measure every `<img>` at every
 *     viewport. This same navigation also warms `system.cache` for the
 *     page (renderPage runs server-side as part of serving the request),
 *     which we rely on in step 2.
 *  2. Read the cache entry that the navigation populated. If it's still
 *     missing (page handler errored, route doesn't exist…), bail.
 *  3. For each measured image, compute the (widths, sizes) pair.
 *  4. Rewrite the HTML with `srcset` + `sizes`.
 *  5. Pre-warm the variant cache so the first visitor doesn't pay sharp.
 *  6. Replace the cached entry with the optimized bytes — but only if the
 *     queue's `isCurrent()` still holds (a newer save would have bumped
 *     the generation and queued a fresh job).
 */
export async function optimizePage(
    payload: OptimizePagePayload,
    session: PlaywrightSession,
    system: PageBuilder,
    isCurrent: () => boolean,
): Promise<void> {
    const url = `${payload.origin}${buildPath(payload.path, payload.identifier)}`;
    const measurements = await session.measureImages(url);
    if (!measurements || measurements.length === 0) return;
    if (!isCurrent()) return;

    const baseEntry = system.cache.get(payload.cacheKey);
    if (!baseEntry) return;
    const sourceHtml = new TextDecoder().decode(baseEntry.raw);

    const rewrites = await buildRewrites(measurements, system);
    if (rewrites.length === 0) return;

    const optimizedHtml = rewriteHTML(sourceHtml, rewrites);
    const optimizedEntry = compress(optimizedHtml, baseEntry.contentType);

    // Pre-warm the resize endpoint for every (id, w) combination we just
    // committed to. Sequential to avoid a sharp memory spike when several
    // pages get re-optimized back-to-back.
    await preWarmVariants(rewrites, measurements, payload.origin);

    if (!isCurrent()) return;
    system.cache.set(payload.cacheKey, optimizedEntry);
}

function buildPath(path: string, identifier: string): string {
    if (!identifier) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}identifier=${encodeURIComponent(identifier)}`;
}

async function buildRewrites(
    measurements: readonly ImageMeasurement[],
    system: PageBuilder,
): Promise<ImageRewrite[]> {
    const out: ImageRewrite[] = [];
    // Cache MediaImage lookups within this pass — a page with N copies of
    // the same image hits the repository once.
    const itemCache = new Map<string, MediaImage | null>();

    for (const m of measurements) {
        const id = extractMediaId(m.src);
        if (!id) continue;

        let item: MediaImage | null;
        if (itemCache.has(id)) {
            item = itemCache.get(id)!;
        } else {
            const raw = await system.mediaRepository.getItem(id).catch(() => null);
            item = raw && raw.type === "image" ? (raw as MediaImage) : null;
            itemCache.set(id, item);
        }
        if (!item) continue;
        if (item.mimetype === "image/svg+xml") continue;

        const naturalWidth = item.width || m.naturalWidth;
        if (!naturalWidth) continue;

        const opt = computeSrcset(m.perViewport, naturalWidth);
        if (opt.widths.length === 0) continue;

        out.push({ index: m.index, widths: opt.widths, sizes: opt.sizes });
    }

    return out;
}

async function preWarmVariants(
    rewrites: readonly ImageRewrite[],
    measurements: readonly ImageMeasurement[],
    origin: string,
): Promise<void> {
    const byIndex = new Map(measurements.map(m => [m.index, m]));
    for (const rw of rewrites) {
        const m = byIndex.get(rw.index);
        if (!m) continue;
        const id = extractMediaId(m.src);
        if (!id) continue;
        for (const w of rw.widths) {
            try {
                await fetch(`${origin}/media?id=${encodeURIComponent(id)}&w=${w}`);
            } catch {
                // Pre-warm is best-effort — a transient failure just means
                // the first real visitor pays the sharp cost.
            }
        }
    }
}
