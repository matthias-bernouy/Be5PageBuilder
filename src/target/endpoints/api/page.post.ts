import { PageModel, type IPage } from "src/target/data/model/PageModel";
import type { Be5PageBuilder } from "src/Be5PageBuilder";

export default async function updatePage(req: Request, system: Be5PageBuilder) {

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";
    const title = url.searchParams.get("title") || "Titre par défaut";
    const path = url.searchParams.get("path") || "/article";

    const repo = system.getDatabase().getRepository(PageModel);

    const newPage: IPage = {
        path: path,
        identifier: identifier,
        title: title,
        content: await req.text()
    };


    await repo.upsert(newPage, {
        onConflictFields: ['identifier'],
        onConflictAction: 'merge'
    });


    return new Response("");
}