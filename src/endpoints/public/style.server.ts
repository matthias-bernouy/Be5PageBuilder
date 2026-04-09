import type { PageBuilder } from "src/PageBuilder";
import { cachedResponseAsync, compress } from "src/server/compression";

export const STYLE_CACHE_KEY = "style:main";

/**
 * Serves the raw CSS configured in system.site.theme. Every rendered public
 * page links to `/style`, so editing the theme in settings requires
 * invalidating this cache key (see admin-api/system.post.ts).
 */
export default async function getStyle(req: Request, system: PageBuilder) {
    return cachedResponseAsync(req, STYLE_CACHE_KEY, system.cache, async () => {
        const settings = await system.repository.getSystem();
        return compress(settings.site?.theme || "", "text/css");
    });
}
