import { join } from 'node:path';
import type { ControlCms } from 'src/control/ControlCms';
import { expandSnippets } from 'src/control/core/expandSnippets';
import { renderEditorShell } from 'src/control/core/server/rendering/editorShell';

export default async function TemplateEditorServer(req: Request, cms: ControlCms) {
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
        htmlFilePath: join(__dirname, "../editor/editor.html"),
        cms,
        flavor: "template",
        content,
        configElement: "w13c-template-information",
        configAttributes,
    });
}
