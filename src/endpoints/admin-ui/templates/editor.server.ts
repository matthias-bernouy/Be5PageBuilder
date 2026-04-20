import { join } from 'node:path';
import type { Cms } from 'src/Cms';
import { expandSnippets } from 'src/server/rendering/expandSnippets';
import { renderEditorShell } from 'src/server/rendering/editorShell';

export default async function TemplateEditorServer(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    const template = id ? await cms.repository.getTemplateById(id) : null;

    const configAttributes: Record<string, string> = {};
    if (template) {
        configAttributes["default-name"]        = template.name;
        configAttributes["default-description"] = template.description || "";
        configAttributes["default-category"]    = template.category || "";
    }

    // SSR-expand snippet references so the ObserverManager picks up the
    // current content on load, without a client-side fetch race.
    const content = await expandSnippets(template?.content || "<p></p>", cms);

    return renderEditorShell({
        htmlFilePath: join(__dirname, "./editor.html"),
        cms,
        content,
        configElement: "w13c-template-information",
        configAttributes,
    });
}
