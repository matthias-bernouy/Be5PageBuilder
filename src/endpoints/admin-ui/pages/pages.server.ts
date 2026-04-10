import { parseHTML } from 'linkedom';
import type { PageBuilder } from 'src/PageBuilder';
import template from "./pages.html";
import { send_html } from 'src/server/send_html';

export default async function Server(req: Request, system: PageBuilder){
    const { document } = parseHTML(await Bun.file(template.index).text());

    const pageList = await system.repository.getAllPages();

    const tableBody = document.querySelector("p9r-table")!;

for (const page of pageList) {
    const statusVariant = page.visible ? 'success' : 'danger';
    const statusLabel = page.visible ? 'Published' : 'Draft';
    page.tags = JSON.parse(page.tags as unknown as string || "[]")

    const editorQuery = page.identifier
        ? `path=${encodeURIComponent(page.path)}&identifier=${encodeURIComponent(page.identifier)}`
        : `path=${encodeURIComponent(page.path)}`;
    const publicUrl = page.identifier
        ? `${page.path}?identifier=${page.identifier}`
        : page.path;

    tableBody.innerHTML += `
        <p9r-row href="./editor?${editorQuery}">
            <p9r-cell><strong>${page.title || 'Untitled'}</strong></p9r-cell>

            <p9r-cell>
                <p9r-tag>${publicUrl}</p9r-tag>
            </p9r-cell>

            <p9r-cell>
                ${page.tags.map((tag) => `
                    <p9r-tag style="background: var(--primary-muted); border:none; color: var(--primary-contrasted);">
                        ${tag}
                    </p9r-tag>
                `).join('')}
            </p9r-cell>

            <p9r-cell>
                <p9r-tag color="${statusVariant === 'success' ? 'success' : 'danger'}"">${statusLabel}</p9r-tag>
            </p9r-cell>
        </p9r-row>
    `;
}


    return send_html(document.toString());
}