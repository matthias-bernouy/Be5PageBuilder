import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path";
import type { PageBuilder } from 'src/PageBuilder';

export default async function TemplateEditorServer(req: Request, system: PageBuilder) {
    const html = await Bun.file(join(__dirname, "./editor.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // Load bloc scripts (same as page editor)
    const blocs = await system.repository.getBlocsEditorJS();

    const script = blocs.map(bloc => {
        return `
            (function() {
                const init = () => {
                    if (window.document && document.EditorManager) {
                        try {
                            ${bloc.editorJS}
                        } catch (e) {
                            console.error("Error executing bloc ${bloc.id}:", e);
                        }
                    } else {
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
    document.head.appendChild(inlineScript);

    blocs.forEach((bloc) => {
        const s = document.createElement("script");
        s.src = `/bloc?tag=${bloc.id}`;
        document.head.appendChild(s);
    });

    // Create template configuration element
    const editorSystem = document.getElementById("editor-system")!;
    const editor = document.getElementById("editor")!;
    const config = document.createElement("w13c-template-information");

    if (id) {
        const template = await system.repository.getTemplateById(id);
        if (template) {
            config.setAttribute("default-name", template.name);
            config.setAttribute("default-description", template.description || "");
            config.setAttribute("default-category", template.category || "");
            editor.innerHTML = template.content || "<p></p>";
        } else {
            editor.innerHTML = "<p></p>";
        }
    } else {
        editor.innerHTML = "<p></p>";
    }

    editorSystem.append(config);

    return send_html(document.toString());
}
