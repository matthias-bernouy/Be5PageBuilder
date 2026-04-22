import type { Cms } from "src/Cms";
import type { TSystem } from "src/socle/contracts/Repository/TModels";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";
import { invalidateAllPages } from "src/server/cache/invalidation";

export default async function updateSystem(req: Request, cms: Cms) {
    const body = await req.json() as Partial<TSystem>;

    if (!body || typeof body !== "object") {
        return new Response("Invalid body", { status: 400 });
    }

    const updated = await cms.repository.updateSystem(body);

    // Theme CSS is served from `/style` through a single cache entry.
    cms.cache.delete(P9R_CACHE.STYLE);
    // Every rendered page carries `<link href="/style?v=<hash>">`, and the
    // hash depends on the theme's content. Any system change can shift the
    // hash (or the lang / favicon / host / 404-500 refs baked into the HTML),
    // so every cached page must be re-rendered on its next hit.
    invalidateAllPages(cms);

    return new Response(JSON.stringify(updated), {
        headers: { "Content-Type": "application/json" },
    });
}
