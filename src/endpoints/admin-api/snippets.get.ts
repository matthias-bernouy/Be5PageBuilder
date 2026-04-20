import type { Cms } from "src/Cms";

export default async function getSnippets(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");
    const usages = url.searchParams.get("usages") === "true";

    if (identifier && usages) {
        const pages = await cms.repository.findPagesUsingSnippet(identifier);
        return new Response(JSON.stringify({
            identifier,
            pages: pages.map(p => ({ identifier: p.identifier, title: p.title, path: p.path }))
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (identifier) {
        const snippet = await cms.repository.getSnippetByIdentifier(identifier);
        if (!snippet) return new Response("Not found", { status: 404 });
        return new Response(JSON.stringify(snippet), {
            headers: { "Content-Type": "application/json" }
        });
    }

    const snippets = await cms.repository.getAllSnippets();
    return new Response(JSON.stringify(snippets), {
        headers: { "Content-Type": "application/json" }
    });
}
