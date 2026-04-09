import type { PageBuilder } from 'src/PageBuilder';
import { cachedResponseAsync, compress } from 'src/server/compression';
import { P9R_CACHE } from 'types/p9r-constants';

export default async function BlocServerClient(req: Request, system: PageBuilder){

    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    if (!tag) return Response.error();

    return cachedResponseAsync(req, P9R_CACHE.bloc(tag), system.cache, async () => {
        const js = await system.repository.getBlocViewJS(tag);
        if (!js) throw new Error("Bloc not found");
        return compress(js, "text/javascript");
    }).catch(() => Response.error());

}