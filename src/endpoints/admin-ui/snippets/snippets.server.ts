import { send_html } from 'src/server/send_html';
import { parseHTML } from 'linkedom';
import { join } from "node:path";
import type { PageBuilder } from 'src/PageBuilder';

const DELETE_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;

export default async function SnippetsPage(_req: Request, system: PageBuilder) {
    const html = await Bun.file(join(__dirname, "./snippets.html")).text();
    const { document } = parseHTML(html);

    const snippets = await system.repository.getAllSnippets();
    const tableBody = document.querySelector("p9r-table")!;

    for (const snippet of snippets) {
        const updatedAt = snippet.updatedAt
            ? new Date(snippet.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "—";

        // Build the row via DOM APIs — every DB-sourced value flows through
        // `textContent` / `setAttribute`, so linkedom's serializer escapes
        // angle brackets, quotes and ampersands uniformly (stored-XSS safe).
        const row = document.createElement("p9r-row");
        row.setAttribute("href", `./snippets/editor?identifier=${encodeURIComponent(snippet.identifier)}`);

        const idCell = document.createElement("p9r-cell");
        const code = document.createElement("code");
        code.textContent = snippet.identifier;
        idCell.appendChild(code);
        row.appendChild(idCell);

        const nameCell = document.createElement("p9r-cell");
        nameCell.textContent = snippet.name;
        row.appendChild(nameCell);

        const catCell = document.createElement("p9r-cell");
        catCell.textContent = snippet.category || "—";
        row.appendChild(catCell);

        const updCell = document.createElement("p9r-cell");
        updCell.textContent = updatedAt;
        row.appendChild(updCell);

        const actCell = document.createElement("p9r-cell");
        const btn = document.createElement("button");
        btn.setAttribute("class", "btn-delete-snippet");
        // URL-encode the id before it hits an HTML attribute: linkedom
        // does not escape `<` / `>` inside attribute values, so unencoded
        // content could still surface raw `<script>` text in the serialized
        // HTML (valid but alarming and trips automated XSS scanners).
        btn.setAttribute("data-id", encodeURIComponent(snippet.id));
        btn.innerHTML = DELETE_ICON;
        actCell.appendChild(btn);
        row.appendChild(actCell);

        tableBody.appendChild(row);
    }

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
