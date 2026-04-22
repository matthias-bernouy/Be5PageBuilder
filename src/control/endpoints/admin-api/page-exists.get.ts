import type { ControlCms } from "src/control/ControlCms";

/**
 * Cheap availability check for the (path, identifier) primary key. Used by
 * <w13c-page-information> to warn the user that their new URL is taken
 * before they submit.
 *
 * Query:
 *   - `path`               : candidate path (required)
 *   - `identifier`         : candidate identifier (optional, defaults to "")
 *   - `current-path`       : path of the page currently being edited (optional)
 *   - `current-identifier` : identifier of the page currently being edited (optional)
 *
 * When the candidate (path, identifier) equals (current-path, current-identifier)
 * the collision is the page editing itself, so the endpoint returns available.
 *
 * Response:
 *   - `{ exists: false }`                   : available
 *   - `{ exists: true, reason: "taken" }`   : another page uses this key
 */
export default async function pageExists(req: Request, cms: ControlCms) {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path) {
        return new Response("Missing argument `path`", { status: 400 });
    }

    const identifier = url.searchParams.get("identifier") || "";
    const currentPath = url.searchParams.get("current-path");
    const currentIdentifier = url.searchParams.get("current-identifier") || "";

    // Editing the same page is not a collision — short-circuit before the
    // repository lookup.
    if (currentPath !== null && currentPath === path && currentIdentifier === identifier) {
        return json({ exists: false });
    }

    const match = await cms.repository.getPage(path, identifier);
    if (match !== null) return json({ exists: true, reason: "taken" });
    return json({ exists: false });
}

function json(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json" },
    });
}
