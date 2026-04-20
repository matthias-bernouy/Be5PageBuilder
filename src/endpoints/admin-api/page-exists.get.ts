import type { PageBuilder } from "src/PageBuilder";
import { isReservedPath } from "src/server/reservedPaths";

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
 *   - `{ exists: false }`                       : available
 *   - `{ exists: true, reason: "taken" }`       : another page uses this key
 *   - `{ exists: true, reason: "reserved" }`    : path is reserved by the framework
 */
export default async function pageExists(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path) {
        return new Response("Missing argument `path`", { status: 400 });
    }

    const identifier = url.searchParams.get("identifier") || "";
    const currentPath = url.searchParams.get("current-path");
    const currentIdentifier = url.searchParams.get("current-identifier") || "";

    // Editing the same page is not a collision. Checked first so the user
    // can still save a page whose path happens to live on a reserved prefix
    // that was grandfathered in.
    if (currentPath !== null && currentPath === path && currentIdentifier === identifier) {
        return json({ exists: false });
    }

    if (isReservedPath(path, system)) {
        return json({ exists: true, reason: "reserved" });
    }

    const match = await system.repository.getPage(path, identifier);
    if (match !== null) return json({ exists: true, reason: "taken" });
    return json({ exists: false });
}

function json(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json" },
    });
}
