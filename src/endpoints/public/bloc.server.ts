import type { PageBuilder } from 'src/PageBuilder';
import { cachedResponseAsync, compress } from 'src/server/compression';

export default async function BlocServerClient(req: Request, system: PageBuilder){

    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    if (!tag) return Response.error();

    return cachedResponseAsync(req, `bloc:${tag}`, system.cache, async () => {
        console.log("No cache");
        const js = await system.repository.getBlocViewJS(tag);
        if (!js) throw new Error("Bloc not found");
        return compress(js, "text/javascript");
    }).catch(() => Response.error());

}