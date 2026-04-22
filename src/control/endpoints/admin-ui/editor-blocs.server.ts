import type { ControlCms } from "src/control/ControlCms";
import { cachedResponseAsync, compress } from "src/socle/server/compression";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";

/**
 * Serves every registered bloc's editor JS as a single concatenated bundle.
 *
 * The editor page used to inline this code into its HTML, which required
 * `script-src 'unsafe-inline'` in the CSP. Moving it to an external script
 * lets us keep the CSP strict (only `'self'`) without touching the runtime
 * behavior. The IIFE wrapper and retry loop are identical to what the shell
 * used to build inline.
 *
 * Cached under `EDITOR_BLOCS` and invalidated by `bloc.post.ts` whenever a
 * bloc is created or replaced. There is no bloc-delete endpoint yet; add the
 * same invalidation there when one is introduced.
 */
export default async function EditorBlocsScript(req: Request, cms: ControlCms) {
    return cachedResponseAsync(req, P9R_CACHE.EDITOR_BLOCS, cms.cache, async () => {
        const blocs = await cms.repository.getBlocsEditorJS();

        const js = blocs.map(bloc => `
(function() {
    const init = () => {
        if (window.document && document.EditorManager) {
            try {
                ${bloc.editorJS}
            } catch (e) {
                console.error("Error executing bloc ${bloc.id}:", e);
            }
        } else {
            setTimeout(init, 10);
        }
    };
    init();
})();
`).join("\n");

        return compress(js, "application/javascript");
    });
}
