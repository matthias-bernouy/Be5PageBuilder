import { send_js } from 'be5-system';
import { getClientBlocJavascript } from 'src/data/queries/getClientBlocJavascript';
import type { Be5PageBuilder } from 'src/plugin/Be5PageBuilder';
import { initBlocs } from 'src/plugin/initBlocs';

export default async function BlocServerClient(req: Request, system: Be5PageBuilder){

    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");

    if (!tag) return Response.error()

    initBlocs(system);

    const js = await getClientBlocJavascript(system, tag);

    if (!js) return Response.error();

    return send_js(js);

}