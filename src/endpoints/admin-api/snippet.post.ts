import type { Cms } from "src/Cms";
import type { TSnippet } from "src/socle/contracts/Repository/TModels";
import { isValidSnippetIdentifier } from "src/socle/utils/validation";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

export default async function postSnippet(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json() as Partial<TSnippet>;

    if (id) {
        // Update — identifier is immutable, stripped in repository
        const updated = await cms.repository.updateSnippet(id, body);
        if (!updated) return new Response("Not found", { status: 404 });

        // Invalidate rendered-page cache for every page that references this snippet
        const usages = await cms.repository.findPagesUsingSnippet(updated.identifier);
        for (const page of usages) {
            cms.cache.delete(P9R_CACHE.page(page.path, page.identifier));
        }

        return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // Create
    if (!body.identifier || !body.name || body.content === undefined) {
        return new Response("Missing required fields: identifier, name, content", { status: 400 });
    }

    if (!isValidSnippetIdentifier(body.identifier)) {
        return new Response("Invalid identifier. Use kebab-case (lowercase letters, digits, hyphens).", { status: 400 });
    }

    const existing = await cms.repository.getSnippetByIdentifier(body.identifier);
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

    const created = await cms.repository.createSnippet(snippet);
    return new Response(JSON.stringify(created), {
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
}
