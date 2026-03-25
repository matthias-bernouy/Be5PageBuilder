import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { PageModel } from 'src/target/data/model/PageModel';
import type { Be5PageBuilder } from 'src/Be5PageBuilder';
import template from "./pages.html";

export default async function Server(req: Request, system: Be5PageBuilder){
    const { document } = parseHTML(await Bun.file(template.index).text());

    const repo = system.db.getRepository(PageModel);
    const pageList = await repo.findAll();

    const tableBody = document.querySelector("p9r-table")!;

for (const page of pageList) {
    const statusVariant = page.visible ? 'success' : 'danger';
    const statusLabel = page.visible ? 'Published' : 'Draft';
    page.tags = JSON.parse(page.tags as unknown as string || "[]")

    tableBody.innerHTML += `
        <p9r-row href="./article?identifier=${page.identifier}">
            <p9r-cell><strong>${page.title || 'Untitled'}</strong></p9r-cell>
            
            <p9r-cell>
                <p9r-tag>${page.path}?identifier=${page.identifier}</p9r-tag>
            </p9r-cell>

            <p9r-cell>
                ${page.tags.map((tag) => `
                    <p9r-tag style="background: var(--primary-muted); border:none; color: var(--primary-contrasted);">
                        ${tag}
                    </p9r-tag>
                `).join('')}
            </p9r-cell>

            <p9r-cell>
                <p9r-badge variant="${statusVariant}">${statusLabel}</p9r-badge>
            </p9r-cell>
        </p9r-row>
    `;
}


    return send_html(document.toString());
}