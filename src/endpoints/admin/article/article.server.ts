import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import { getEditorBlocsJavascript } from 'src/data/queries/getEditorBlocsJavascript';
import { getPage } from 'src/data/queries/getPage';
import type { Be5PageBuilder } from 'src/plugin/Be5PageBuilder';

export default async function ArticleServerAdmin(req: Request, system: Be5PageBuilder){
    const html = await Bun.file(join(__dirname, "./article.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");

    const blocs = await getEditorBlocsJavascript(system);

    const regexEditorClass = /class\s+([a-zA-Z_$][\w\d_$]*)\s+extends\s+Editor/;
    const regexComponentClass = /class\s+([a-zA-Z_$][\w\d_$]*)\s+extends\s+Component/;

    const script = blocs.map(bloc => {
        const matchEditor = bloc.editorJavascript.match(regexEditorClass);
        if (!matchEditor) return;
        const clEditor = matchEditor[1]
        console.log(clEditor)
        const matchComponent = bloc.clientJavascript.match(regexComponentClass);
        if (!matchComponent) return;
        const clComponent = matchComponent[1]
        console.log(clComponent)

        return `
            customElements.define("${bloc.htmlTag}", ${clComponent});
            ${bloc.editorJavascript}
            document.EditorManager.getObserver().register_editor("${bloc.htmlTag}", ${clEditor})
        `
    }).join("\n")

    const importComponents = blocs.map((bloc) => {
        return `<script src='/api/bloc?tag=${bloc.htmlTag}'></script>`
    }).join("\n")

    const scriptElement = document.createElement("script");
    scriptElement.innerHTML = script;
    document.body.append(scriptElement)
    document.body.innerHTML += importComponents;

    if ( identifier ){
        const page = await getPage(system, identifier);
        const editor = document.getElementById("editor")!;
        editor.innerHTML = page?.content || "<p></p>";
    } else {
        return Response.redirect("/admin/dashboard");
    }

    return send_html(document.toString());
}