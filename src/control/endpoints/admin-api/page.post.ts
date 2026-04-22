import type { ControlCms } from "src/control/ControlCms";
import contains from "src/control/server/formData";
import type { TPage } from "src/socle/contracts/Repository/TModels";
import { isValidPathFormat } from "src/socle/utils/validation";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

export default async function updatePage(req: Request, cms: ControlCms) {

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

    await cms.repository.createPage(
        { ...body, identifier: newIdentifier },
        { path: oldPath, identifier: oldIdentifier }
    );


    // Invalidate cache for both the old and the new (path, identifier) in case
    // the user renamed the page — either key could be stale
    cms.cache.delete(P9R_CACHE.page(oldPath, oldIdentifier));
    cms.cache.delete(P9R_CACHE.page(newPath, newIdentifier));

    return new Response("Page updated");
}
