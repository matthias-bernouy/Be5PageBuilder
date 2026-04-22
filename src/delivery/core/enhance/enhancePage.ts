import type DeliveryCms from "src/delivery/DeliveryCms";
import { compress } from "src/control/server/compression";
import { computeSrcset } from "src/delivery/core/enhance/computeSrcset";
import { rewriteHTML, isOptimizable, type ImageRewrite } from "src/delivery/core/enhance/rewriteHTML";
import { classifyImages } from "src/delivery/core/enhance/classifyImage";
import { VIEWPORT_HEIGHT } from "src/delivery/core/enhance/viewports";
import type { PlaywrightSession, ImageMeasurement } from "src/delivery/core/enhance/PlaywrightSession";

export type EnhancePagePayload = {
    /** Path of the page route to load (e.g. "/about" or "/"). */
    path: string;
    /** Origin of the running server, e.g. "http://localhost:3000". */
    origin: string;
    /** Cache key under which the rendered page is stored. */
    cacheKey: string;
};

/**
 * One end-to-end enhancement pass. Steps:
 *  1. Drive Playwright to the page URL and measure every `<img>` at every
 *     viewport. The inner request hits Delivery again — that's a cache hit
 *     (the caller populated the entry before calling us), so no recursion.
 *  2. Read the cache entry that the populate step wrote. If it's missing
 *     (an invalidation landed between populate and here), bail.
 *  3. For each measured image, compute the (widths, sizes) pair.
 *  4. Rewrite the HTML with `srcset` + `sizes` + `loading` + `fetchpriority`.
 *  5. Pre-warm the variant URLs so the first real visitor doesn't pay the
 *     origin-fetch cost on the storage backend.
 *  6. Replace the cached entry — but only if what's currently in cache is
 *     still the same bytes we started from (hash check). If someone wrote
 *     a fresher version while we were measuring, don't stomp it.
 */
export async function enhancePage(
    payload: EnhancePagePayload,
    session: PlaywrightSession,
    delivery: DeliveryCms,
): Promise<void> {
    const url = `${payload.origin}${payload.path}`;
    const measurements = await session.measureImages(url);
    if (!measurements || measurements.length === 0) return;

    const baseEntry = delivery.cache.get(payload.cacheKey);
    if (!baseEntry) return;
    const sourceHtml = new TextDecoder().decode(baseEntry.raw);

    const ladder   = delivery.media.imageConfig.ladderWidths;
    const rewrites = buildRewrites(measurements, ladder);
    if (rewrites.length === 0) return;

    const enhancedHtml  = rewriteHTML(sourceHtml, rewrites, delivery.media);
    const enhancedEntry = compress(enhancedHtml, baseEntry.contentType);

    await preWarmVariants(rewrites, measurements, delivery);

    // Stale-write guard: only commit if the cache still holds the bytes we
    // based the rewrite on. An invalidation (admin save, TTL, manual clear)
    // between start and here means the base is no longer authoritative.
    const current = delivery.cache.get(payload.cacheKey);
    if (!current || current.hash !== baseEntry.hash) return;
    delivery.cache.set(payload.cacheKey, enhancedEntry);
}

function buildRewrites(
    measurements: readonly ImageMeasurement[],
    ladder: readonly number[],
): ImageRewrite[] {
    const classifications = classifyImages(measurements, VIEWPORT_HEIGHT);
    const out: ImageRewrite[] = [];

    for (const m of measurements) {
        const classification = classifications.get(m.index);
        let widths: number[] = [];
        let sizes = "";

        if (isOptimizable(m.src) && m.naturalWidth > 0) {
            const opt = computeSrcset(m.perViewport, m.naturalWidth, ladder);
            widths = opt.widths;
            sizes  = opt.sizes;
        }

        if (widths.length === 0 && !classification) continue;

        out.push({
            index: m.index,
            widths,
            sizes,
            ...(classification ? {
                loading: classification.loading,
                fetchpriority: classification.fetchpriority,
            } : {}),
        });
    }

    return out;
}

/**
 * Pre-warm the media backend for every variant we just committed to. Runs
 * best-effort and sequential to avoid a bandwidth spike when many pages
 * are re-optimized back-to-back.
 */
async function preWarmVariants(
    rewrites: readonly ImageRewrite[],
    measurements: readonly ImageMeasurement[],
    delivery: DeliveryCms,
): Promise<void> {
    const byIndex = new Map(measurements.map(m => [m.index, m]));
    for (const rw of rewrites) {
        const m = byIndex.get(rw.index);
        if (!m || !isOptimizable(m.src)) continue;
        for (const w of rw.widths) {
            try {
                const variant = delivery.media.formatImageUrl({ url: m.src, width: w }).toString();
                await fetch(variant);
            } catch {
                // Best-effort — a transient failure just means the first
                // real visitor pays the origin cost.
            }
        }
    }
}
