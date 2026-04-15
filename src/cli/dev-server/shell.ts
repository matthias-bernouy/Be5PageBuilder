import { parseHTML } from "linkedom";
import { readFile } from "node:fs/promises";
import type { BuiltBloc } from "./build";
import type { ScratchPage } from "./scratch";

export type RemoteBloc = { id: string; editorJS: string };

export type ShellContext = {
    editorHtmlPath: string;
    adminPrefix: string;
    devBlocs: Map<string, BuiltBloc>;
    remoteBlocs: RemoteBloc[];
    scratch: ScratchPage;
};

/**
 * Assembles the editor HTML for local dev. Mirrors `renderEditorShell` on the
 * server side: injects the API-base meta tag, the inline bloc bootstrap script
 * (one retry-loop IIFE per bloc) and one `<script src="/bloc?tag=X">` per bloc.
 * The bloc list is the union of remote CMS blocs (snapshot at startup) and
 * locally-built dev blocs, with dev blocs shadowing CMS ones that share the
 * same tag.
 */
export async function buildShell(ctx: ShellContext): Promise<string> {
    const merged = new Map<string, RemoteBloc>();
    for (const r of ctx.remoteBlocs) merged.set(r.id, r);
    for (const [tag, b] of ctx.devBlocs) {
        if (b.editorJS) merged.set(tag, { id: tag, editorJS: b.editorJS });
        else merged.delete(tag);
    }

    const rawHtml = await readFile(ctx.editorHtmlPath, "utf-8");
    const { document } = parseHTML(rawHtml);

    const apiBase = document.createElement("meta");
    apiBase.setAttribute("name", "p9r-api-base");
    apiBase.setAttribute("content", `${ctx.adminPrefix}/api/`);
    document.head.appendChild(apiBase);

    const initScript = [...merged.values()].map(b => `
        (function() {
            const init = () => {
                if (window.document && document.EditorManager) {
                    try {
                        ${b.editorJS}
                    } catch (e) {
                        console.error("Error executing bloc ${b.id}:", e);
                    }
                } else {
                    setTimeout(init, 10);
                }
            };
            init();
        })();
    `).join("\n");

    const inline = document.createElement("script");
    inline.textContent = initScript;
    inline.setAttribute("defer", "");
    document.head.appendChild(inline);

    // Synchronous global runtime — must come first in <head> so the bloc
    // IIFEs below can read `window.p9r.Component` at evaluation time.
    const globalScript = document.createElement("script");
    globalScript.setAttribute("src", "/assets/component.js");
    document.head.prepend(globalScript);

    for (const id of merged.keys()) {
        const s = document.createElement("script");
        s.setAttribute("src", `/bloc?tag=${id}`);
        document.head.appendChild(s);
    }

    const editorSystem = document.getElementById("editor-system");
    const editor = document.getElementById("editor");

    const scratch = ctx.scratch;
    const pageInfo = document.createElement("w13c-page-information");
    pageInfo.setAttribute("default-title",       scratch.title);
    pageInfo.setAttribute("default-description", scratch.description);
    pageInfo.setAttribute("default-identifier",  scratch.identifier);
    pageInfo.setAttribute("default-path",        scratch.path);
    pageInfo.setAttribute("default-visible",     scratch.visible ? "on" : "off");
    pageInfo.setAttribute("default-tags",        scratch.tags);
    editorSystem?.append(pageInfo);

    if (editor) editor.innerHTML = scratch.content || "<p></p>";

    const liveReload = document.createElement("script");
    liveReload.textContent = LIVE_RELOAD_SCRIPT;
    document.head.appendChild(liveReload);

    return document.toString();
}

const LIVE_RELOAD_SCRIPT = `
(function() {
    if (window.__p9rLiveReload) return;
    window.__p9rLiveReload = true;
    const connect = () => {
        const es = new EventSource("/dev/reload");
        es.addEventListener("reload", (ev) => {
            console.log("[p9r-dev] Rebuilt " + ev.data + " — reloading");
            location.reload();
        });
        es.addEventListener("error", () => {
            es.close();
            setTimeout(connect, 1000);
        });
    };
    connect();
})();
`;

/**
 * Fetched once at startup instead of per-request so a flaky or offline CMS
 * doesn't spam the logs on every editor reload (hot reload reopens the shell
 * many times in a short window).
 */
export async function fetchRemoteBlocs(adminBase: URL, token: string): Promise<RemoteBloc[]> {
    const url = new URL("api/blocs", adminBase).href;
    try {
        const res = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) {
            console.warn(`[remote] GET ${url} → ${res.status} — continuing with dev blocs only`);
            return [];
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
            console.warn(`[remote] GET ${url} did not return an array — ignoring`);
            return [];
        }
        return data as RemoteBloc[];
    } catch (e) {
        console.warn(`[remote] Failed to reach CMS at ${url}: ${e instanceof Error ? e.message : e}`);
        console.warn(`[remote] Continuing with dev blocs only. Fix P9R_URL or start the CMS and restart \`p9r dev\`.`);
        return [];
    }
}
