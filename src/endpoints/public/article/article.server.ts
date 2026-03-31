import { parseHTML } from "linkedom";
import type { PageBuilder } from "src/PageBuilder";
import { join } from "node:path";
import { send_html } from "be5-system";

export default async function ViewPageServer(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";

    if (!identifier) {
        return new Response("Missing identifier", { status: 400 });
    }

    const page = await system.repository.getPageByIdentifier(identifier);

    if (!page) {
        return new Response("Page not found", { status: 404 });
    }

    const html = await Bun.file(join(__dirname, "./index.html")).text();
    const { document } = parseHTML(html);

    // Meta
    document.title = page.title;

    const metaDescription = document.querySelector('meta[name="description"]')
        || document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute("content", page.description);
    document.head.appendChild(metaDescription);

    // Favicon
    const favicon = document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("href", "/media?type=favicon");
    document.head.appendChild(favicon);

    // Theme CSS
    const themeLink = document.createElement("link");
    themeLink.setAttribute("rel", "stylesheet");
    themeLink.setAttribute("href", "/style");
    document.head.appendChild(themeLink);

    // Contenu de la page
    document.body.innerHTML = page.content;

    // Trouver les tags be5-* utilisés dans le contenu et ajouter leurs scripts
    const usedTags = extractBlocTags(page.content);

    for (const tag of usedTags) {
        const script = document.createElement("script");
        script.setAttribute("src", `/bloc?tag=${tag}`);
        document.body.appendChild(script);
    }

    return send_html(document.toString());
}

function extractBlocTags(content: string): string[] {
    const tags = new Set<string>();
    const regex = /<(be5-[a-z0-9-]+)/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
        tags.add(match[1]!);
    }

    return [...tags];
}
