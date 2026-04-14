import { parseHTML } from "linkedom";
import type { PageBuilder } from "src/PageBuilder";
import { P9R_ID } from "types/p9r-constants";
import { send_html } from "./send_html";

/**
 * Shared logic for the three editor flavors (page / template / snippet).
 *
 * PageBuilder is a plugin the host app mounts under a configurable prefix, so
 * the HTML shell cannot use absolute paths. Each flavor keeps its own
 * `editor.html` next to its `editor.server.ts` with depth-appropriate relative
 * URLs, and this helper takes care of the shared server-side work: injecting
 * the bloc editor scripts, stamping attributes on `#editor-system`, creating
 * the configuration element and hydrating `#editor` with the content.
 */
export type EditorShellOptions = {
    /** Absolute path to the flavor's `editor.html` file. */
    htmlFilePath: string;
    system: PageBuilder;
    /** HTML that becomes `#editor.innerHTML` — must already be snippet-expanded. */
    content: string;
    /** Tag name of the configuration element to append to `#editor-system`. */
    configElement: string;
    /** Attributes to set on the configuration element. */
    configAttributes: Record<string, string>;
    /** Optional attributes to set on `#editor-system` (e.g. data-layout-category). */
    editorSystemAttributes?: Record<string, string>;
};

/**
 * Builds the editor page for any flavor: injects bloc editor scripts, stamps
 * any requested attributes on `#editor-system`, creates the configuration
 * element and hydrates `#editor` with `content`.
 */
export async function renderEditorShell(options: EditorShellOptions): Promise<Response> {
    const html = await Bun.file(options.htmlFilePath).text();
    const { document } = parseHTML(html);

    // ── API base path meta tag ──────────────────────────────────────────
    // PageBuilder is mounted under a host-configurable prefix, so the client
    // cannot hardcode `/page-builder/api/`. We bake the resolved prefix into
    // a <meta> tag that `EditorManager.getApiBasePath()` reads at runtime.
    const adminPrefix = options.system.config.adminPathPrefix || "/page-builder";
    const apiBaseMeta = document.createElement("meta");
    apiBaseMeta.setAttribute("name", "p9r-api-base");
    apiBaseMeta.setAttribute("content", `${adminPrefix}/api/`);
    const basPathMeta = document.createElement("meta");
    basPathMeta.setAttribute("name", "p9r-base-path");
    basPathMeta.setAttribute("content", `${adminPrefix}/`);
    document.head.appendChild(apiBaseMeta);
    document.head.appendChild(basPathMeta);

    // ── Bloc editor scripts ─────────────────────────────────────────────
    // Each bloc ships an editorJS snippet that must run once `document.EditorManager`
    // is ready. We wrap every snippet in a retry loop and append the combined
    // script once, then a <script src="/bloc?tag=..."> for each bloc so its
    // view-side code is available to the editor preview.
    const blocs = await options.system.repository.getBlocsEditorJS();

    const initScript = blocs.map(bloc => `
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

    const inlineScript = document.createElement("script");
    inlineScript.textContent = initScript;
    inlineScript.defer = true;
    document.head.appendChild(inlineScript);

    for (const bloc of blocs) {
        const s = document.createElement("script");
        s.src = `/bloc?tag=${bloc.id}`;
        document.head.appendChild(s);
    }

    // ── #editor-system + configuration element ─────────────────────────
    const editorSystem = document.getElementById(P9R_ID.EDITOR_SYSTEM)!;
    const editor = document.getElementById(P9R_ID.EDITOR)!;

    if (options.editorSystemAttributes) {
        for (const [key, value] of Object.entries(options.editorSystemAttributes)) {
            editorSystem.setAttribute(key, value);
        }
    }

    const config = document.createElement(options.configElement);
    for (const [key, value] of Object.entries(options.configAttributes)) {
        config.setAttribute(key, value);
    }
    editorSystem.append(config);

    editor.innerHTML = options.content;

    return send_html(document.toString());
}
