import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import type { PageBuilder } from 'src/PageBuilder';

export default async function ArticleServerAdmin(req: Request, system: PageBuilder) {

    const html = await Bun.file(join(__dirname, "./editor.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");

    const blocs = await system.repository.getBlocsEditorJS();

    let scripts: HTMLElement[] = [];

    const script = blocs.map(bloc => {
        return `
            (function() {
                const init = () => {
                    // On vérifie si l'EditorManager est bien présent sur le document
                    if (window.document && document.EditorManager) {
                        try {
                            ${bloc.editorJS}
                        } catch (e) {
                            console.error("Erreur lors de l'exécution du bloc ${bloc.id}:", e);
                        }
                    } else {
                        // Si pas encore là, on attend 10ms et on réessaie
                        setTimeout(init, 10);
                    }
                };
                init();
            })();
        `;
    }).join("\n");

    const inlineScript = document.createElement("script");
    inlineScript.textContent = script;
    scripts.push(inlineScript);


    blocs.forEach((bloc) => {
        let script = document.createElement("script");
        script.src = `/bloc?tag=${bloc.id}`;
        scripts.push(script);
    })

    document.body.append(...scripts);

    if (identifier) {
        const page = await system.repository.getPageByIdentifier(identifier);
        const editorSystem = document.getElementById("editor-system")!;
        const editor = document.getElementById("editor")!;

        const config = document.createElement("w13c-page-information");

        config.setAttribute("default-title", page?.title || url.searchParams.get("title") || "Default Title")
        config.setAttribute("default-description", page?.description || "Default Description")
        config.setAttribute("default-identifier", page?.identifier || identifier)
        config.setAttribute("default-path", page?.path || url.searchParams.get("path") || "/article")
        config.setAttribute("default-visible", page?.visible ? "on" : "off")
        config.setAttribute("default-tags", JSON.parse(page?.tags as unknown as string || "[]").join(','))

        editorSystem.append(config);
        editor.innerHTML = page?.content || "<p></p>";
    } else {
        return Response.redirect("/page-builder/admin/pages", 302);
    }

    return send_html(document.toString());
}