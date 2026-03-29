import type { PageBuilder } from "src/PageBuilder";
import contains from "src/Be5System/contains";
import type { TPage } from "src/interfaces/contract/Repository/TModels";

export default async function updatePage(req: Request, system: PageBuilder) {
    
    const body = await req.json() as TPage;

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");

    if (!identifier) {
        return new Response("Missing argument identifier", {
            status: 400
        })
    }

    try {
        contains(body, ["content", "description", 'path', "visible", "title", "tags"]);
    } catch (e: any) {
        return new Response(e, {
            status: 400
        })
    }


    await system.datastore.createPage({
        ...body,
        identifier: identifier
    }, body.identifier ?? undefined);

    return new Response("Page updated");
}