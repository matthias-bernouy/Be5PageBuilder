import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import { pages } from 'src/data/Pages';
import { PageModel } from 'src/model/PageModel';
import type { Be5PageBuilder } from 'src/plugin/Be5PageBuilder';

export default async function ArticleServerAdmin(req: Request, system: Be5PageBuilder){
    const html = await Bun.file(join(__dirname, "./article.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");

    if ( identifier ){
        const repo = system.getDatabase().getRepository(PageModel);
        const actualContent = await repo.findOne({
            identifier: identifier
        })
        const editor = document.getElementById("editor")!;
        editor.innerHTML = actualContent?.content || "<p></p>";
    } else {
        return Response.redirect("/admin/dashboard");
    }

    return send_html(document.toString());
}