import type { PageBuilder } from "src/PageBuilder";
import { pageCacheKey } from "src/server/renderPage";

export default async function deleteSnippet(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const force = url.searchParams.get("force") === "true";

    if (!id) return new Response("Missing id", { status: 400 });

    const snippet = await system.repository.getSnippetById(id);
    if (!snippet) return new Response("Not found", { status: 404 });

    const usages = await system.repository.findPagesUsingSnippet(snippet.identifier);

    if (!force && usages.length > 0) {
        return new Response(JSON.stringify({
            error: "Snippet is in use",
            pages: usages.map(p => ({ identifier: p.identifier, title: p.title }))
        }), {
            status: 409,
            headers: { "Content-Type": "application/json" }
        });
    }

    await system.repository.deleteSnippet(id);

    // Invalidate rendered-page cache for every page that referenced this snippet
    for (const page of usages) {
        system.cache.delete(pageCacheKey(page.path, page.identifier));
    }

    return new Response("Deleted", { status: 200 });
}
