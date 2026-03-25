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

    let scripts: HTMLElement[] = [];

    blocs.forEach((bloc) => {
        let script = document.createElement("script");
        script.src = `/bloc?tag=${bloc.id}`;
        scripts.push(script);
    })

    document.body.append(...scripts);

    if ( identifier ){
        const page = await getPage(system, identifier);
        const editorSystem = document.getElementById("editor-system")!;
        const editor = document.getElementById("editor")!;

        const config = document.createElement("w13c-page-information");

        config.setAttribute("default-title",       page?.title || url.searchParams.get("title") || "Default Title")
        config.setAttribute("default-description", page?.description || "Default Description")
        config.setAttribute("default-identifier",  page?.identifier || identifier)
        config.setAttribute("default-path",        page?.path || url.searchParams.get("path") || "/article")
        config.setAttribute("default-visible",     page?.visible ? "on" : "off")
        config.setAttribute("default-tags",        JSON.parse(page?.tags as unknown as string || "[]").join(','))

        editorSystem.append(config);
        editor.innerHTML = page?.content || "<p></p>";
    } else {
        return Response.redirect("/admin/dashboard");
    }

    return send_html(document.toString());
}