import type { ControlCms } from "src/control/ControlCms";
import MissingParam from "src/control/errors/Http/MissingParam";

export default async function getPage(req: Request, cms: ControlCms) {

    const url = new URL(req.url);

    const id = url.searchParams.get("id");

    if ( !id ) throw new MissingParam("id");

    const res = await cms.repository.getPageById(id);

    return new Response(JSON.stringify(res));
}
