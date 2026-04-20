import { join } from 'node:path';
import type { Cms } from 'src/Cms';
import { expandSnippets } from 'src/server/rendering/expandSnippets';
import { renderEditorShell } from 'src/server/rendering/editorShell';

export default async function ArticleServerAdmin(req: Request, cms: Cms) {
    const url = new URL(req.url);
    // New URL scheme: (path, identifier) as the key, both overridable via query.
    // `identifier` is optional (empty string = default variant for a path).
    const path = url.searchParams.get("path");
    const identifier = url.searchParams.get("identifier") || "";

    if (!path) {
        return Response.redirect("/cms/admin/pages", 302);
    }

    const page = await cms.repository.getPage(path, identifier);

    // Brand-new page (no document in DB yet) + a configured layout category
    // → signal the client to pop the BlocLibrary in locked "pick a layout"
    // mode. Empty attribute = feature disabled.
    const editorSystemAttributes: Record<string, string> = {};
    if (!page) {
        const settings = await cms.repository.getSystem();
        const layoutCategory = settings.editor?.layoutCategory;
        if (layoutCategory) {
            editorSystemAttributes["data-layout-category"] = layoutCategory;
        }
    }

    // SSR-expand snippet references so the ObserverManager picks up the
    // current content on load, without a client-side fetch race.
    const content = await expandSnippets(page?.content || "<p></p>", cms);

    return renderEditorShell({
        htmlFilePath: join(__dirname, "./editor.html"),
        cms,
        content,
        configElement: "w13c-page-information",
        configAttributes: {
            "default-title":       page?.title || url.searchParams.get("title") || "Default Title",
            "default-description": page?.description || "Default Description",
            "default-identifier":  page?.identifier ?? identifier,
            "default-path":        page?.path || path,
            "default-visible":     page?.visible ? "on" : "off",
            "default-tags":        JSON.parse(page?.tags as unknown as string || "[]").join(','),
        },
        editorSystemAttributes,
    });
}
