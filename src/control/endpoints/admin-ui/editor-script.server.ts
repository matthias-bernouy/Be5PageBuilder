import { join } from "node:path";
import type { ControlCms } from "src/control/ControlCms";
import { cachedResponseAsync, compress } from "src/socle/server/compression";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

/**
 * Consolidated editor bundle served at `<basePath>/admin/editor-script`.
 *
 * Everything the editor page needs runs inside a single `<script>`:
 *   1. The static editor runtime (`window.p9r`, `EditorManager`, every
 *      configuration custom element) — built from
 *      `src/control/editor/editor-script-entry.ts`.
 *   2. Every bloc's compiled `editorJS` — runs immediately after the
 *      runtime has installed `document.EditorManager`, so no retry loop.
 *   3. Every bloc's compiled `viewJS` — self-registers the real custom
 *      elements that the edited content references.
 *
 * Lexical ordering in one file replaces the three-script defer cascade we
 * used to have (`editor.js` + `/admin/editor-blocs` + N × `/api/bloc?tag=X`).
 *
 * Cached under `P9R_CACHE.EDITOR_SCRIPT` and invalidated from
 * `bloc.post.ts` whenever a bloc is created or replaced. Admin is low-
 * traffic, so regenerating the whole bundle on every bloc import (rare) is
 * cheaper than juggling multiple cache lifecycles.
 */
const ENTRY_PATH = join(import.meta.dir, "../../editor/editor-script-entry.ts");
const COMPONENT_PATH = join(import.meta.dir, "../../editor/editor-script-entry.ts");

export default async function EditorScript(req: Request, cms: ControlCms) {
    return cachedResponseAsync(req, P9R_CACHE.EDITOR_SCRIPT, cms.cache, async () => {
        const [runtime, blocs] = await Promise.all([
            buildRuntime(),
            cms.repository.getBlocsJS(),
        ]);

        const editorPayload = blocs
            .map(b => `try { ${b.editorJS} } catch (e) { console.error("Error in bloc ${b.id} editorJS:", e); }`)
            .join("\n");

        const viewPayload = blocs
            .map(b => `try { ${b.viewJS} } catch (e) { console.error("Error in bloc ${b.id} viewJS:", e); }`)
            .join("\n");

        return compress(`
            ${runtime}\n,
            ${viewPayload}\n,
            ${editorPayload}\n
            `, 
        "text/javascript");
    });
}

async function buildRuntime(): Promise<string> {
    const result = await Bun.build({ entrypoints: [ENTRY_PATH], format: "iife" });
    const output = result.outputs[0];
    if (!output) {
        const logs = result.logs.map(l => l.message).join("\n");
        throw new Error(`editor-script runtime build failed: ${logs || "no output"}`);
    }
    return output.text();
}
