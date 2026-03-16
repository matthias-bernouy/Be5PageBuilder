import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import { getEditorBlocsJavascript } from 'src/target/data/queries/getEditorBlocsJavascript';
import { getPage } from 'src/target/data/queries/getPage';
import type { Be5PageBuilder } from 'src/Be5PageBuilder';

export default async function ArticleServerAdmin(req: Request, system: Be5PageBuilder){
    const html = await Bun.file(join(__dirname, "./article.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");

    const blocs = await getEditorBlocsJavascript(system);

    let scripts = [];

    let script = document.createElement("script");
    script.src = "/admin/editor"
    scripts.push(script);

    blocs.forEach((bloc) => {
        let script = document.createElement("script");
        script.src = `/bloc?tag=${bloc.htmlTag}`;
        scripts.push(script);
    })

    document.body.append(...scripts);

    if ( identifier ){
        const page = await getPage(system, identifier);
        const editor = document.getElementById("editor")!;
        editor.innerHTML = page?.content || "<p></p>";
    } else {
        return Response.redirect("/admin/dashboard");
    }

    return send_html(document.toString());
}