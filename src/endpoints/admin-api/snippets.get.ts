import type { PageBuilder } from "src/PageBuilder";

export default async function getSnippets(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");
    const usages = url.searchParams.get("usages") === "true";

    if (identifier && usages) {
        const pages = await system.repository.findPagesUsingSnippet(identifier);
        return new Response(JSON.stringify({
            identifier,
            pages: pages.map(p => ({ identifier: p.identifier, title: p.title, path: p.path }))
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (identifier) {
        const snippet = await system.repository.getSnippetByIdentifier(identifier);
        if (!snippet) return new Response("Not found", { status: 404 });
        return new Response(JSON.stringify(snippet), {
            headers: { "Content-Type": "application/json" }
        });
    }

    const snippets = await system.repository.getAllSnippets();
    return new Response(JSON.stringify(snippets), {
        headers: { "Content-Type": "application/json" }
    });
}
