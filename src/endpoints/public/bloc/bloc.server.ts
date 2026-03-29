import { send_js } from 'be5-system';
import type { PageBuilder } from 'src/PageBuilder';

export default async function BlocServerClient(req: Request, system: PageBuilder){

    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    if (!tag) return Response.error()

    const js = await system.datastore.getBlocViewJS(tag);

    if (!js) return Response.error();

    return send_js(js);

}