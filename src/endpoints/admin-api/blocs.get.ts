import type { PageBuilder } from "src/PageBuilder";

/**
 * Exposes the blocs needed by an external editor client (the `p9r dev` CLI).
 * Returns the same shape as `repository.getBlocsEditorJS()` — one entry per
 * registered bloc with its tag (`id`) and its editor-side IIFE snippet.
 * The bloc's view JS is still fetched lazily via `GET /bloc?tag=<id>`.
 */
export default async function getBlocs(_req: Request, system: PageBuilder) {
    const blocs = await system.repository.getBlocsEditorJS();
    return new Response(JSON.stringify(blocs), {
        headers: { "Content-Type": "application/json" }
    });
}
