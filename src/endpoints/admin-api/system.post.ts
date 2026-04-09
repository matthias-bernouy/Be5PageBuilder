import type { PageBuilder } from "src/PageBuilder";
import type { TSystem } from "src/interfaces/contract/Repository/TModels";
import { STYLE_CACHE_KEY } from "src/endpoints/public/style.server";
import { pageCacheKey } from "src/server/renderPage";

export default async function updateSystem(req: Request, system: PageBuilder) {
    const body = await req.json() as Partial<TSystem>;

    if (!body || typeof body !== "object") {
        return new Response("Invalid body", { status: 400 });
    }

    const updated = await system.repository.updateSystem(body);

    // Theme CSS is served from `/style` through a single cache entry.
    system.cache.delete(STYLE_CACHE_KEY);
    // `/` is the home route — its cached rendering may now point to a
    // different page (or a different theme link). 404/500 fallbacks are
    // rendered without caching so nothing else to invalidate here.
    system.cache.delete(pageCacheKey("/", ""));

    return new Response(JSON.stringify(updated), {
        headers: { "Content-Type": "application/json" },
    });
}
