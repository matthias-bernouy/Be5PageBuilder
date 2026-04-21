import type { Cms } from 'src/Cms';
import type { CacheEntry } from 'src/contracts/Cache/Cache';
import { cachedResponseAsync, compress, publicAssetCacheControl } from 'src/server/compression';
import { P9R_CACHE } from 'src/constants/p9r-constants';

export async function generateBlocEntry(tag: string, cms: Cms): Promise<CacheEntry> {
    const js = await cms.repository.getBlocViewJS(tag);
    if (!js) throw new Error(`Bloc not found: ${tag}`);
    return compress(js, "text/javascript");
}

export default async function BlocServerClient(req: Request, cms: Cms){

    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    if (!tag) return Response.error();

    return cachedResponseAsync(
        req,
        P9R_CACHE.bloc(tag),
        cms.cache,
        () => generateBlocEntry(tag, cms),
        publicAssetCacheControl(req),
    ).catch(() => Response.error());

}