import type { ControlCms } from "src/control/ControlCms";
import contains from "src/control/server/formData";
import type { TPage } from "src/socle/contracts/Repository/TModels";
import { isValidPathFormat } from "src/socle/utils/validation";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

export default async function updatePage(req: Request, cms: ControlCms) {

    const body = await req.json() as TPage;

    // The primary key is `path`. The current (pre-save) path comes from the
    // query string so we can locate the existing document for upsert; the
    // new path comes from the request body.
    const url = new URL(req.url);
    const oldPath = url.searchParams.get("path");

    if (!oldPath) {
        return new Response("Missing argument path", { status: 400 });
    }

    try {
        contains(body, ["content", "description", "path", "visible", "title", "tags"]);
    } catch (e: any) {
        return new Response(e, { status: 400 });
    }

    const newPath = body.path;

    if (!isValidPathFormat(newPath)) {
        return new Response("Invalid path format. Must start with '/' and contain no '?', '#' or ':'.", { status: 400 });
    }

    await cms.repository.createPage(body, oldPath);

    // Invalidate cache for both the old and new path in case of a rename.
    cms.cache.delete(P9R_CACHE.page(oldPath));
    cms.cache.delete(P9R_CACHE.page(newPath));

    return new Response("Page updated");
}
