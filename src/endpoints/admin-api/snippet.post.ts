import type { PageBuilder } from "src/PageBuilder";
import type { TSnippet } from "src/interfaces/contract/Repository/TModels";

const IDENTIFIER_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default async function postSnippet(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json() as Partial<TSnippet>;

    if (id) {
        // Update — identifier is immutable, stripped in repository
        const updated = await system.repository.updateSnippet(id, body);
        if (!updated) return new Response("Not found", { status: 404 });

        // Invalidate article cache for every page that references this snippet
        const usages = await system.repository.findPagesUsingSnippet(updated.identifier);
        for (const page of usages) {
            system.cache.delete(`article:${page.identifier}`);
        }

        return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // Create
    if (!body.identifier || !body.name || body.content === undefined) {
        return new Response("Missing required fields: identifier, name, content", { status: 400 });
    }

    if (!IDENTIFIER_REGEX.test(body.identifier)) {
        return new Response("Invalid identifier. Use kebab-case (lowercase letters, digits, hyphens).", { status: 400 });
    }

    const existing = await system.repository.getSnippetByIdentifier(body.identifier);
    if (existing) {
        return new Response(`Snippet with identifier "${body.identifier}" already exists`, { status: 409 });
    }

    const now = new Date();
    const snippet: TSnippet = {
        identifier: body.identifier,
        name: body.name,
        description: body.description || "",
        content: body.content,
        category: body.category || "",
        createdAt: now,
        updatedAt: now
    };

    const created = await system.repository.createSnippet(snippet);
    return new Response(JSON.stringify(created), {
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
}
