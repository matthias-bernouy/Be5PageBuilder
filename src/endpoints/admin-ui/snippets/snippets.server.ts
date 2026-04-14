import { send_html } from 'src/server/send_html';
import { parseHTML } from 'linkedom';
import { join } from "node:path";
import type { PageBuilder } from 'src/PageBuilder';

export default async function SnippetsPage(_req: Request, system: PageBuilder) {
    const html = await Bun.file(join(__dirname, "./snippets.html")).text();
    const { document } = parseHTML(html);

    const snippets = await system.repository.getAllSnippets();
    const tableBody = document.querySelector("p9r-table")!;

    for (const snippet of snippets) {
        const updatedAt = snippet.updatedAt
            ? new Date(snippet.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "—";

        tableBody.innerHTML += `
        <p9r-row href="./snippets/editor?identifier=${encodeURIComponent(snippet.identifier)}">
            <p9r-cell><code>${snippet.identifier}</code></p9r-cell>
            <p9r-cell>${snippet.name}</p9r-cell>
            <p9r-cell>${snippet.category || "—"}</p9r-cell>
            <p9r-cell>${updatedAt}</p9r-cell>
            <p9r-cell>
                <button class="btn-delete-snippet" data-id="${snippet.id}" onclick="event.preventDefault(); event.stopPropagation(); deleteSnippet('${snippet.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </p9r-cell>
        </p9r-row>
        `;
    }

    const script = document.createElement("script");
    script.textContent = `
        async function deleteSnippet(id) {
            if (!confirm("Delete this snippet?")) return;
            const res = await fetch("../api/snippet?id=" + id, { method: "DELETE" });
            if (res.status === 409) {
                const body = await res.json();
                const pageList = body.pages.map(p => "• " + (p.title || p.identifier)).join("\\n");
                if (!confirm("This snippet is used on " + body.pages.length + " page(s):\\n\\n" + pageList + "\\n\\nDelete anyway? References will break.")) return;
                const forceRes = await fetch("../api/snippet?id=" + id + "&force=true", { method: "DELETE" });
                if (forceRes.ok) window.location.reload();
                return;
            }
            if (res.ok) window.location.reload();
        }
    `;
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.textContent = `
        .btn-delete-snippet {
            background: none;
            border: 1px solid transparent;
            border-radius: 6px;
            padding: 4px 6px;
            cursor: pointer;
            color: var(--text-muted, #94a3b8);
            display: inline-flex;
            align-items: center;
            transition: color 0.15s, border-color 0.15s;
        }
        .btn-delete-snippet:hover {
            color: var(--danger-base, #ef4444);
            border-color: var(--danger-base, #ef4444);
        }
        p9r-cell code {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.85em;
            background: var(--bg-surface, #f1f5f9);
            padding: 2px 6px;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    return send_html(document.toString());
}
