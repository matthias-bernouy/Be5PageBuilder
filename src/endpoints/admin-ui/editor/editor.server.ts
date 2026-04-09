import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import type { PageBuilder } from 'src/PageBuilder';
import { expandSnippets } from 'src/server/expandSnippets';

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
                    // Check if EditorManager is available on the document
                    if (window.document && document.EditorManager) {
                        try {
                            ${bloc.editorJS}
                        } catch (e) {
                            console.error("Error executing bloc ${bloc.id}:", e);
                        }
                    } else {
                        // Not available yet, wait 10ms and retry
                        setTimeout(init, 10);
                    }
                };
                init();
            })();
        `;
    }).join("\n");

    const inlineScript = document.createElement("script");
    inlineScript.textContent = script;
    inlineScript.defer = true;
    scripts.push(inlineScript);


    blocs.forEach((bloc) => {
        let script = document.createElement("script");
        script.src = `/bloc?tag=${bloc.id}`;
        scripts.push(script);
    })

    document.head.append(...scripts);

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
        // SSR-expand snippet references so the ObserverManager picks up the
        // current content on load, without a client-side fetch race.
        const content = page?.content || "<p></p>";
        editor.innerHTML = await expandSnippets(content, system);
    } else {
        return Response.redirect("/page-builder/admin/pages", 302);
    }

    return send_html(document.toString());
}