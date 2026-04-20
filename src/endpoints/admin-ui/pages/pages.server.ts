import { parseHTML } from 'linkedom';
import type { PageBuilder } from 'src/PageBuilder';
import template from "./pages.html";
import { send_html } from 'src/server/send_html';

type PageRow = {
    title: string;
    identifier: string;
    path: string;
    visible: boolean;
    tags: string[];
    editorHref: string;
    publicUrl: string;
};

type PagesData = {
    pages: PageRow[];
};

export default async function Server(req: Request, system: PageBuilder) {
    const { document } = parseHTML(await Bun.file(template.index).text());

    const pageList = await system.repository.getAllPages();

    const pages: PageRow[] = pageList.map(page => {
        let tags: string[];
        if (Array.isArray(page.tags)) {
            tags = page.tags.map(String);
        } else if (typeof page.tags === "string" && (page.tags as string).trim().startsWith("[")) {
            try { tags = (JSON.parse(page.tags as unknown as string) as unknown[]).map(String); }
            catch { tags = []; }
        } else {
            tags = [];
        }

        const editorHref = page.identifier
            ? `./editor?path=${encodeURIComponent(page.path)}&identifier=${encodeURIComponent(page.identifier)}`
            : `./editor?path=${encodeURIComponent(page.path)}`;
        const publicUrl = page.identifier
            ? `${page.path}?identifier=${encodeURIComponent(page.identifier)}`
            : page.path;

        return {
            title: page.title || "",
            identifier: page.identifier || "",
            path: page.path,
            visible: !!page.visible,
            tags,
            editorHref,
            publicUrl,
        };
    });

    const data: PagesData = { pages };

    // `<script type="application/json">` is a data island (not executed), so
    // it is not subject to the strict `script-src 'self'` CSP. Still escape
    // `</script` and `<` to prevent HTML-parser breakout via stored values.
    const json = JSON.stringify(data)
        .replace(/<\/script/gi, '<\\/script')
        .replace(/</g, '\\u003c');

    const dataScript = document.createElement("script");
    dataScript.setAttribute("id", "pages-data");
    dataScript.setAttribute("type", "application/json");
    dataScript.textContent = json;
    document.body.appendChild(dataScript);

    return send_html(document.toString());
}
