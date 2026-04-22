import type DeliveryCms from "src/delivery/DeliveryCms";
import type { CacheEntry } from "src/socle/contracts/Cache/Cache";
import { compress } from "src/server/compression";

/**
 * Build the view bundle entry for a bloc. The repository returns the raw
 * JS string (already compiled by the import pipeline); we compress it into
 * a CacheEntry so every consumer — the endpoint, `resolveAssets` — hits the
 * same cached bytes.
 *
 * Throws on unknown tag so the caller can surface a 404/5xx; the endpoint
 * swallows that into `Response.error()` and `renderPage`'s `Promise.all`
 * propagates it to the page's renderer fallback.
 */
export async function generateBlocEntry(tag: string, delivery: DeliveryCms): Promise<CacheEntry> {
    const js = await delivery.repository.getBlocViewJS(tag);
    if (!js) throw new Error(`Bloc not found: ${tag}`);
    return compress(js, "text/javascript");
}
