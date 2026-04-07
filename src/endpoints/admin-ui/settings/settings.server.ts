import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import type { PageBuilder } from 'src/PageBuilder';
import template from "./settings.html";

export default async function Server(req: Request, system: PageBuilder) {
    const { document } = parseHTML(await Bun.file(template.index).text());

    const settings = await system.repository.getSystem();
    const pages = await system.repository.getAllPages();

    // Populate page selects with options
    const pageSelects = ["site-homePage", "site-page404", "site-page500"];
    for (const selectId of pageSelects) {
        const select = document.getElementById(selectId);
        if (!select) continue;
        select.innerHTML += `<option value="">-- None --</option>`;
        for (const page of pages) {
            select.innerHTML += `<option value="${page.identifier}">${page.title || page.identifier}</option>`;
        }
    }

    // Set current values
    const values: Record<string, string> = {
        "site-name":                  settings.site?.name ?? "",
        "site-favicon":               settings.site?.favicon ?? "",
        "site-homePage":              settings.site?.homePage ?? "",
        "site-page404":               settings.site?.page404 ?? "",
        "site-page500":               settings.site?.page500 ?? "",
        "seo-titleTemplate":          settings.seo?.titleTemplate ?? "%s",
        "seo-defaultDescription":     settings.seo?.defaultDescription ?? "",
        "seo-defaultOgImage":         settings.seo?.defaultOgImage ?? "",
        "editor-blocAtPageCreation":  settings.editor?.blocAtPageCreation ?? "",
    };

    for (const [id, value] of Object.entries(values)) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.setAttribute("value", value);
    }

    return send_html(document.toString());
}
