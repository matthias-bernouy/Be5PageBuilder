import { join } from 'node:path';
import type { Cms } from 'src/Cms';
import { renderEditorShell } from 'src/server/rendering/editorShell';

export default async function SnippetEditorServer(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const identifier = url.searchParams.get("identifier");

    const snippet = id
        ? await cms.repository.getSnippetById(id)
        : identifier
            ? await cms.repository.getSnippetByIdentifier(identifier)
            : null;

    const configAttributes: Record<string, string> = {};
    if (snippet) {
        configAttributes["default-id"]          = snippet.id!;
        configAttributes["default-identifier"]  = snippet.identifier;
        configAttributes["default-name"]        = snippet.name;
        configAttributes["default-description"] = snippet.description || "";
        configAttributes["default-category"]    = snippet.category || "";
    }

    return renderEditorShell({
        htmlFilePath: join(__dirname, "./editor.html"),
        cms,
        content: snippet?.content || "<p></p>",
        configElement: "w13c-snippet-information",
        configAttributes,
    });
}
