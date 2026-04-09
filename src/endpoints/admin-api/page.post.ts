import type { PageBuilder } from "src/PageBuilder";
import contains from "src/server/helpers";
import type { TPage } from "src/interfaces/contract/Repository/TModels";
import { isReservedPath, isValidPathFormat } from "src/server/reservedPaths";
import { pageCacheKey } from "src/server/renderPage";

export default async function updatePage(req: Request, system: PageBuilder) {

    const body = await req.json() as TPage & { identifier?: string };

    const url = new URL(req.url);
    // The primary key is (path, identifier). Current (pre-save) values come
    // from query params so we can locate the old document for upsert; new
    // values come from the request body.
    const oldPath = url.searchParams.get("path");
    const oldIdentifier = url.searchParams.get("identifier") || "";

    if (!oldPath) {
        return new Response("Missing argument path", { status: 400 });
    }

    try {
        contains(body, ["content", "description", "path", "visible", "title", "tags"]);
    } catch (e: any) {
        return new Response(e, { status: 400 });
    }

    const newPath = body.path;
    const newIdentifier = body.identifier || "";

    if (!isValidPathFormat(newPath)) {
        return new Response("Invalid path format. Must start with '/' and contain no '?', '#' or ':'.", { status: 400 });
    }
    if (isReservedPath(newPath, system)) {
        return new Response(`Path "${newPath}" is reserved by the framework.`, { status: 400 });
    }

    await system.repository.createPage(
        { ...body, identifier: newIdentifier },
        { path: oldPath, identifier: oldIdentifier }
    );

    // Dynamically expose the new path if it wasn't already a known route
    system.registerPageRoute(newPath);

    // Invalidate cache for both the old and the new (path, identifier) in case
    // the user renamed the page — either key could be stale
    system.cache.delete(pageCacheKey(oldPath, oldIdentifier));
    system.cache.delete(pageCacheKey(newPath, newIdentifier));

    return new Response("Page updated");
}
