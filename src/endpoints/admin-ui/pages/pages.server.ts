import { parseHTML } from 'linkedom';
import type { PageBuilder } from 'src/PageBuilder';
import template from "./pages.html";
import { send_html } from 'src/server/send_html';

export default async function Server(req: Request, system: PageBuilder) {
    const { document } = parseHTML(await Bun.file(template.index).text());

    const pageList = await system.repository.getAllPages();
    const tableBody = document.querySelector("p9r-table")!;

    for (const page of pageList) {
        const statusVariant = page.visible ? 'success' : 'danger';
        const statusLabel = page.visible ? 'Published' : 'Draft';
        let tags: unknown[];
        if (Array.isArray(page.tags)) {
            tags = page.tags;
        } else if (typeof page.tags === "string" && page.tags.trim().startsWith("[")) {
            try { tags = JSON.parse(page.tags); } catch { tags = []; }
        } else {
            tags = [];
        }

        const editorQuery = page.identifier
            ? `path=${encodeURIComponent(page.path)}&identifier=${encodeURIComponent(page.identifier)}`
            : `path=${encodeURIComponent(page.path)}`;
        const publicUrl = page.identifier
            ? `${page.path}?identifier=${encodeURIComponent(page.identifier)}`
            : page.path;

        // DOM APIs rather than `innerHTML +=` so every DB-sourced field is
        // serialized with proper HTML escaping (stored-XSS safe).
        const row = document.createElement("p9r-row");
        row.setAttribute("href", `./editor?${editorQuery}`);

        const titleCell = document.createElement("p9r-cell");
        const strong = document.createElement("strong");
        strong.textContent = page.title || "Untitled";
        titleCell.appendChild(strong);
        row.appendChild(titleCell);

        const pathCell = document.createElement("p9r-cell");
        const pathTag = document.createElement("p9r-tag");
        pathTag.textContent = publicUrl;
        pathCell.appendChild(pathTag);
        row.appendChild(pathCell);

        const tagsCell = document.createElement("p9r-cell");
        for (const t of tags) {
            const tagEl = document.createElement("p9r-tag");
            tagEl.setAttribute("style", "background: var(--primary-muted); border:none; color: var(--primary-contrasted);");
            tagEl.textContent = String(t);
            tagsCell.appendChild(tagEl);
        }
        row.appendChild(tagsCell);

        const statusCell = document.createElement("p9r-cell");
        const statusTag = document.createElement("p9r-tag");
        statusTag.setAttribute("color", statusVariant);
        statusTag.textContent = statusLabel;
        statusCell.appendChild(statusTag);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    }

    return send_html(document.toString());
}
