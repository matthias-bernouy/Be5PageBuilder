import { send_js } from 'be5-system';
import type { Be5PageBuilder } from 'src/Be5PageBuilder';
import { getClientBlocJavascript } from 'src/data/queries/bloc/getClientBlocJavascript';

export default async function BlocServerClient(req: Request, system: Be5PageBuilder){

    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    if (!tag) return Response.error()

    const js = await getClientBlocJavascript(system, tag);

    if (!js) return Response.error();

    return send_js(js);

}