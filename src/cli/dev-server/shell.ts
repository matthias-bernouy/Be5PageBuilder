import { parseHTML } from "linkedom";
import { readFile } from "node:fs/promises";
import type { BuiltBloc } from "./build";
import type { ScratchPage } from "./scratch";

export type ShellContext = {
    editorHtmlPath: string;
    adminPrefix: string;
    adminBase: URL;
    token: string;
    devBlocs: Map<string, BuiltBloc>;
    scratch: ScratchPage;
};

type RemoteBloc = { id: string; editorJS: string };

/**
 * Assembles the editor HTML for local dev. Mirrors `renderEditorShell` on the
 * server side: injects the API-base meta tag, the inline bloc bootstrap script
 * (one retry-loop IIFE per bloc) and one `<script src="/bloc?tag=X">` per bloc.
 * The bloc list is the union of remote CMS blocs and locally-built dev blocs,
 * with dev blocs shadowing CMS ones that share the same tag.
 */
export async function buildShell(ctx: ShellContext): Promise<string> {
    const remote = await fetchRemoteBlocs(ctx);

    const merged = new Map<string, RemoteBloc>();
    for (const r of remote) merged.set(r.id, r);
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

async function fetchRemoteBlocs(ctx: ShellContext): Promise<RemoteBloc[]> {
    const url = new URL("api/blocs", ctx.adminBase).href;
    try {
        const res = await fetch(url, {
            headers: { "Authorization": `Bearer ${ctx.token}` },
        });
        if (!res.ok) {
            console.warn(`[shell] Remote GET ${url} returned ${res.status} — continuing with dev blocs only`);
            return [];
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
            console.warn(`[shell] Remote GET ${url} did not return an array — ignoring`);
            return [];
        }
        return data as RemoteBloc[];
    } catch (e) {
        console.warn(`[shell] Failed to fetch remote blocs: ${e instanceof Error ? e.message : e}`);
        return [];
    }
}
