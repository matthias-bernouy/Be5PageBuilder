import type DeliveryCms from "src/delivery/DeliveryCms";
import { getOrGenerateEntryAsync } from "src/control/server/compression";
import { generateBlocEntry } from "src/delivery/core/blocs/buildBloc";
import { generateStyleEntry } from "src/delivery/core/assets/buildStyle";
import { generateComponentJsEntry } from "src/delivery/core/assets/buildComponent";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

/**
 * Content-addressed URLs for every asset a page references. The hash is the
 * entry's sha256 digest — a content change produces a new hash, hence a new
 * URL, which lets the endpoints serve these assets with `Cache-Control:
 * immutable` (1-year browser cache, zero revalidation).
 */
export type AssetsManifest = {
    componentUrl: string;
    styleUrl:     string;
    /** Parallel array with the `usedTags` passed in to `resolveAssets`. */
    blocUrls:     string[];
    /** `[componentUrl, ...blocUrls]` — convenience for emission in order. */
    scriptUrls:   string[];
};

/**
 * Resolve every asset entry through the delivery cache (warming on miss)
 * and produce the hashed public URLs that go into `<head>`. Parallel
 * resolution is a no-op on the warm path and only pays when the process
 * just started.
 */
export async function resolveAssets(
    delivery: DeliveryCms,
    usedTags: string[],
): Promise<AssetsManifest> {
    const prefix              = delivery.cmsPathPrefix;
    const componentJsUrl      = `${prefix}/assets/component.js`;
    const componentJsCacheKey = P9R_CACHE.js(componentJsUrl);

    const [componentEntry, styleEntry, ...blocEntries] = await Promise.all([
        getOrGenerateEntryAsync(componentJsCacheKey, delivery.cache, generateComponentJsEntry),
        getOrGenerateEntryAsync(P9R_CACHE.STYLE,     delivery.cache, () => generateStyleEntry(delivery)),
        ...usedTags.map(tag => getOrGenerateEntryAsync(
            P9R_CACHE.bloc(tag), delivery.cache, () => generateBlocEntry(tag, delivery),
        )),
    ]);

    const componentUrl = `${componentJsUrl}?v=${componentEntry!.hash}`;
    const styleUrl     = `${prefix}/style?v=${styleEntry!.hash}`;
    const blocUrls     = usedTags.map((tag, i) => `${prefix}/bloc?tag=${tag}&v=${blocEntries[i]!.hash}`);
    const scriptUrls   = [componentUrl, ...blocUrls];

    return { componentUrl, styleUrl, blocUrls, scriptUrls };
}
