import type { Cms } from "src/Cms";
import type { TSystem } from "src/contracts/Repository/TModels";
import { P9R_CACHE } from "src/constants/p9r-constants";

export default async function updateSystem(req: Request, cms: Cms) {
    const body = await req.json() as Partial<TSystem>;

    if (!body || typeof body !== "object") {
        return new Response("Invalid body", { status: 400 });
    }

    const updated = await cms.repository.updateSystem(body);

    // Theme CSS is served from `/style` through a single cache entry.
    cms.cache.delete(P9R_CACHE.STYLE);
    // `/` is the home route — its cached rendering may now point to a
    // different page (or a different theme link). 404/500 fallbacks are
    // rendered without caching so nothing else to invalidate here.
    cms.cache.delete(P9R_CACHE.page("/", ""));

    return new Response(JSON.stringify(updated), {
        headers: { "Content-Type": "application/json" },
    });
}
