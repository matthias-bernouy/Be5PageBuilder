import { send_html } from 'src/server/send_html';
import { parseHTML } from 'linkedom';
import { join } from "node:path";
import type { Cms } from 'src/Cms';

const DELETE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

export default async function TemplatesPage(_req: Request, cms: Cms) {
    const html = await Bun.file(join(__dirname, "./templates.html")).text();
    const { document } = parseHTML(html);

    const templates = await cms.repository.getAllTemplates();
    const tableBody = document.querySelector("p9r-table")!;

    for (const tpl of templates) {
        const createdAt = tpl.createdAt
            ? new Date(tpl.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "—";

        // DOM APIs rather than `innerHTML +=` so every DB-sourced field is
        // serialized with proper HTML escaping (stored-XSS safe).
        const row = document.createElement("p9r-row");
        row.setAttribute("href", `./templates/editor?id=${encodeURIComponent(tpl.id!)}`);

        const nameCell = document.createElement("p9r-cell");
        nameCell.textContent = tpl.name;
        row.appendChild(nameCell);

        const catCell = document.createElement("p9r-cell");
        catCell.textContent = tpl.category || "—";
        row.appendChild(catCell);

        const createdCell = document.createElement("p9r-cell");
        createdCell.textContent = createdAt;
        row.appendChild(createdCell);

        const actCell = document.createElement("p9r-cell");
        const btn = document.createElement("button");
        btn.setAttribute("class", "btn-delete-tpl");
        // Pre-URL-encode so `<` cannot appear raw inside the attribute
        // (linkedom leaves `<` unescaped in attribute values).
        btn.setAttribute("data-id", encodeURIComponent(tpl.id!));
        btn.innerHTML = DELETE_ICON;
        actCell.appendChild(btn);
        row.appendChild(actCell);

        tableBody.appendChild(row);
    }

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
