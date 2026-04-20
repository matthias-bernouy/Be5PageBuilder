import type { Cms } from "src/Cms";
import { cachedResponseAsync, compress } from "src/server/compression";
import { P9R_CACHE } from "types/p9r-constants";

/**
 * Serves the raw CSS configured in cms.site.theme. Every rendered public
 * page links to `/style`, so editing the theme in settings requires
 * invalidating `P9R_CACHE.STYLE` (see admin-api/cms.post.ts).
 */
export default async function getStyle(req: Request, cms: Cms) {
    return cachedResponseAsync(req, P9R_CACHE.STYLE, cms.cache, async () => {
        const settings = await cms.repository.getSystem();
        return compress(settings.site?.theme || "", "text/css");
    });
}
