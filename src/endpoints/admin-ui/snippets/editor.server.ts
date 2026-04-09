import { join } from 'node:path';
import type { PageBuilder } from 'src/PageBuilder';
import { renderEditorShell } from 'src/server/editorShell';

export default async function SnippetEditorServer(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const identifier = url.searchParams.get("identifier");

    const snippet = id
        ? await system.repository.getSnippetById(id)
        : identifier
            ? await system.repository.getSnippetByIdentifier(identifier)
            : null;

    const configAttributes: Record<string, string> = {};
    if (snippet) {
        configAttributes["default-identifier"]  = snippet.identifier;
        configAttributes["default-name"]        = snippet.name;
        configAttributes["default-description"] = snippet.description || "";
        configAttributes["default-category"]    = snippet.category || "";
    }

    return renderEditorShell({
        htmlFilePath: join(__dirname, "./editor.html"),
        system,
        content: snippet?.content || "<p></p>",
        configElement: "w13c-snippet-information",
        configAttributes,
    });
}
