import { pages, type PageDefinition } from "src/data/Pages";
import { PageModel } from "src/model/PageModel";
import type { Be5PageBuilder } from "src/plugin/Be5PageBuilder";

export default async function updatePage(req: Request, system: Be5PageBuilder) {

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";
    const title = url.searchParams.get("title") || "Titre par défaut";
    const path = url.searchParams.get("path") || "/article";

    const repo = system.getDatabase().getRepository(PageModel);

    const newPage: PageDefinition = {
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