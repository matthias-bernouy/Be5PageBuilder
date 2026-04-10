import { send_html } from 'src/server/send_html';
import { parseHTML } from 'linkedom';
import { join } from "node:path";
import type { PageBuilder } from 'src/PageBuilder';

export default async function TemplatesPage(_req: Request, system: PageBuilder) {
    const html = await Bun.file(join(__dirname, "./templates.html")).text();
    const { document } = parseHTML(html);

    const templates = await system.repository.getAllTemplates();
    const tableBody = document.querySelector("p9r-table")!;

    for (const tpl of templates) {
        const createdAt = tpl.createdAt
            ? new Date(tpl.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "—";

        tableBody.innerHTML += `
        <p9r-row href="./templates/editor?id=${tpl.id}">
            <p9r-cell>${tpl.name}</p9r-cell>
            <p9r-cell>${tpl.category || "—"}</p9r-cell>
            <p9r-cell>${createdAt}</p9r-cell>
            <p9r-cell>
                <button class="btn-delete-tpl" data-id="${tpl.id}" onclick="event.preventDefault(); event.stopPropagation(); deleteTemplate('${tpl.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </p9r-cell>
        </p9r-row>
        `;
    }

    const script = document.createElement("script");
    script.textContent = `
        async function deleteTemplate(id) {
            if (!confirm("Delete this template?")) return;
            const res = await fetch("../api/template?id=" + id, { method: "DELETE" });
            if (res.ok) window.location.reload();
        }
    `;
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.textContent = `
        .btn-delete-tpl {
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
        .btn-delete-tpl:hover {
            color: var(--danger-base, #ef4444);
            border-color: var(--danger-base, #ef4444);
        }
    `;
    document.head.appendChild(style);

    return send_html(document.toString());
}
