import { parseHTML } from "linkedom";
import type { ControlCms } from "src/control/ControlCms";
import { P9R_ID } from "src/socle/constants/p9r-constants";
import { send_html } from "../send_html";

/**
 * Shared logic for the three editor flavors (page / template / snippet).
 *
 * Control mounts under whatever `basePath` the runner carries, so the HTML
 * shell cannot use absolute paths. Each flavor keeps its own `editor.html`
 * next to its `editor.server.ts` with depth-appropriate relative URLs; this
 * helper takes care of the shared server-side work: injecting the bloc
 * editor scripts, stamping attributes on `#editor-cms`, creating the
 * configuration element and hydrating `#editor` with the content.
 */
export type EditorShellOptions = {
    /** Absolute path to the flavor's `editor.html` file. */
    htmlFilePath: string;
    cms: ControlCms;
    /** HTML that becomes `#editor.innerHTML` — must already be snippet-expanded. */
    content: string;
    /** Tag name of the configuration element to append to `#editor-cms`. */
    configElement: string;
    /** Attributes to set on the configuration element. */
    configAttributes: Record<string, string>;
    /** Optional attributes to set on `#editor-cms` (e.g. data-layout-category). */
    editorSystemAttributes?: Record<string, string>;
};

/**
 * Builds the editor page for any flavor: injects bloc editor scripts, stamps
 * any requested attributes on `#editor-cms`, creates the configuration
 * element and hydrates `#editor` with `content`.
 *
 * Script ordering — every script in `<head>` is deferred, so execution
 * happens in document order after HTML parsing:
 *   1. `./editor.js` (from the HTML)           — installs `window.p9r.*`
 *   2. `./script.js` (from the HTML)           — admin-shell widgets
 *   3. `<basePath>/admin/editor-blocs`         — concatenated editor bundles
 *   4. `<basePath>/api/bloc?tag=<id>` × N      — per-bloc view bundles
 * The bloc bundles read `window.p9r.Component` at execution time; the
 * defer-order guarantees `editor.js` has run first.
 */
export async function renderEditorShell(options: EditorShellOptions): Promise<Response> {
    const html = await Bun.file(options.htmlFilePath).text();
    const { document } = parseHTML(html);

    // ── API base path meta tag ──────────────────────────────────────────
    // Control mounts under whatever basePath the runner carries, so the
    // client cannot hardcode `/cms/api/`. We bake the resolved basePath
    // into <meta> tags that `EditorManager.getApiBasePath()` reads at
    // runtime.
    const basePath = options.cms.basePath;
    const apiBaseMeta = document.createElement("meta");
    apiBaseMeta.setAttribute("name", "p9r-api-base");
    apiBaseMeta.setAttribute("content", `${basePath}/api/`);
    const basPathMeta = document.createElement("meta");
    basPathMeta.setAttribute("name", "p9r-base-path");
    basPathMeta.setAttribute("content", `${basePath}/`);
    document.head.appendChild(apiBaseMeta);
    document.head.appendChild(basPathMeta);

    // ── Bloc editor scripts ─────────────────────────────────────────────
    // Each bloc ships an editorJS snippet that must run once
    // `document.EditorManager` is ready, and a view-JS that defines the
    // real custom element. Both are served from this Control instance so
    // the editor never has to cross over to Delivery (avoids CORS and the
    // need for an absolute `deliveryUrl`).
    const blocs = await options.cms.repository.getBlocsEditorJS();

    const editorBlocsScript = document.createElement("script");
    editorBlocsScript.src = `${basePath}/admin/editor-blocs`;
    editorBlocsScript.defer = true;
    document.head.appendChild(editorBlocsScript);

    for (const bloc of blocs) {
        const s = document.createElement("script");
        s.src = `${basePath}/api/bloc?tag=${bloc.id}`;
        s.defer = true;
        document.head.appendChild(s);
    }

    // ── #editor-cms + configuration element ─────────────────────────
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
