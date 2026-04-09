import { join } from 'node:path';
import type { PageBuilder } from 'src/PageBuilder';
import { expandSnippets } from 'src/server/expandSnippets';
import { renderEditorShell } from 'src/server/editorShell';

export default async function TemplateEditorServer(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const template = id ? await system.repository.getTemplateById(id) : null;

    const configAttributes: Record<string, string> = {};
    if (template) {
        configAttributes["default-name"]        = template.name;
        configAttributes["default-description"] = template.description || "";
        configAttributes["default-category"]    = template.category || "";
    }

    // SSR-expand snippet references so the ObserverManager picks up the
    // current content on load, without a client-side fetch race.
    const content = await expandSnippets(template?.content || "<p></p>", system);

    return renderEditorShell({
        htmlFilePath: join(__dirname, "./editor.html"),
        system,
        content,
        configElement: "w13c-template-information",
        configAttributes,
    });
}
