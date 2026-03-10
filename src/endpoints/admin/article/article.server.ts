import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import { pages } from 'src/data/Pages';

export default async function ArticleServerAdmin(req: Request){
    const html = await Bun.file(join(__dirname, "./article.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");

    const linkPage = document.getElementById("link-page")! as HTMLLinkElement;
    linkPage.href = "/article?identifier=" + identifier;


    if ( identifier ){
        const actualContent = pages.get(identifier);
        const editor = document.getElementById("editor")!;
        editor.innerHTML = actualContent?.content || "<p></p>";
    } else {
        return Response.redirect("/admin/dashboard");
    }

    return send_html(document.toString());
}