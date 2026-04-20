import type { Cms } from "src/Cms";

/**
 * Exposes the blocs needed by an external editor client (the `p9r dev` CLI).
 * Returns the same shape as `repository.getBlocsEditorJS()` — one entry per
 * registered bloc with its tag (`id`) and its editor-side IIFE snippet.
 * The bloc's view JS is still fetched lazily via `GET /bloc?tag=<id>`.
 */
export default async function getBlocs(_req: Request, cms: Cms) {
    const blocs = await cms.repository.getBlocsEditorJS();
    return new Response(JSON.stringify(blocs), {
        headers: { "Content-Type": "application/json" }
    });
}
