import { PageModel, type IPage } from "src/target/data/model/PageModel";
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import contains from "src/Be5System/contains";

export default async function updatePage(req: Request, system: Be5PageBuilder) {

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";
    
    const body = await req.json() as IPage;

    try {
        contains(body, ["content", "description", 'path', "visible", "title", "tags"]);
    } catch (e: any) {
        return new Response(e, {
            status: 400
        })
    }

    const repo = system.db.getRepository(PageModel);

    const newPage: IPage = {
        path: body.path,
        identifier: identifier,
        title: body.title,
        content: body.content,
        visible: body.visible,
        description: body.description,
        tags: body.tags
    };

    await repo.upsert(newPage, {
        onConflictFields: ['identifier'],
        onConflictAction: 'merge'
    });

    return new Response("Page updated");
}