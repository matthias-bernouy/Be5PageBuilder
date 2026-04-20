import type { Cms } from "src/Cms";
import contains from "src/server/helpers";
import type { TPage } from "src/contracts/Repository/TModels";
import { isReservedPath } from "src/server/reservedPaths";
import { isValidPathFormat } from "src/shared/validation";
import { P9R_CACHE } from "src/constants/p9r-constants";

export default async function updatePage(req: Request, cms: Cms) {

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
    if (isReservedPath(newPath, cms)) {
        return new Response(`Path "${newPath}" is reserved by the framework.`, { status: 400 });
    }

    await cms.repository.createPage(
        { ...body, identifier: newIdentifier },
        { path: oldPath, identifier: oldIdentifier }
    );

    // Dynamically expose the new path if it wasn't already a known route
    cms.registerPageRoute(newPath);

    // Invalidate cache for both the old and the new (path, identifier) in case
    // the user renamed the page — either key could be stale
    cms.cache.delete(P9R_CACHE.page(oldPath, oldIdentifier));
    cms.cache.delete(P9R_CACHE.page(newPath, newIdentifier));

    // Kick off image-srcset optimization in the background. Each enqueue
    // bumps the queue's generation counter for that key, so a fast double
    // save just triggers one final optimization rather than racing.
    // The optimizer needs a real running server to navigate to — we trust
    // the request's origin since this endpoint already requires admin auth.
    const origin = url.origin;
    cms.imageOptimizer.enqueuePageOptimization(newPath, newIdentifier, origin);

    return new Response("Page updated");
}
