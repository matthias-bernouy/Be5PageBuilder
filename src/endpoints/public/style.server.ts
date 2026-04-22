import type { Cms } from "src/Cms";
import type { CacheEntry } from "src/socle/contracts/Cache/Cache";
import { cachedResponseAsync, compress, publicAssetCacheControl } from "src/server/compression";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

export async function generateStyleEntry(cms: Cms): Promise<CacheEntry> {
    const settings = await cms.repository.getSystem();
    return compress(settings.site?.theme || "", "text/css");
}

/**
 * Serves the raw CSS configured in cms.site.theme. Every rendered public
 * page links to `/style`, so editing the theme in settings requires
 * invalidating `P9R_CACHE.STYLE` (see admin-api/cms.post.ts).
 */
export default async function getStyle(req: Request, cms: Cms) {
    return cachedResponseAsync(
        req,
        P9R_CACHE.STYLE,
        cms.cache,
        () => generateStyleEntry(cms),
        publicAssetCacheControl(req),
    );
}
