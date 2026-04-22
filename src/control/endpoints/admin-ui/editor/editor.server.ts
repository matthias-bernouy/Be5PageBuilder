import { join } from 'node:path';
import type { ControlCms } from 'src/control/ControlCms';
import { expandSnippets } from 'src/control/server/rendering/expandSnippets';
import { renderEditorShell } from 'src/control/server/rendering/editorShell';

export default async function ArticleServerAdmin(req: Request, cms: ControlCms) {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");

    if (!path) {
        return Response.redirect("/cms/admin/pages", 302);
    }

    const page = await cms.repository.getPage(path);

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
            "default-path":        page?.path || path,
            "default-visible":     page?.visible ? "on" : "off",
            "default-tags":        JSON.parse(page?.tags as unknown as string || "[]").join(','),
        },
        editorSystemAttributes,
    });
}
