import { parseHTML } from "linkedom";
import type { PageBuilder } from "src/PageBuilder";
import { join } from "node:path";
import { cachedResponseAsync, compress } from "src/server/compression";
import { expandSnippets } from "src/server/expandSnippets";

export default async function ViewPageServer(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";

    if (!identifier) {
        return new Response("Missing identifier", { status: 400 });
    }

    return cachedResponseAsync(req, `article:${identifier}`, system.cache, async () => {
        const page = await system.repository.getPageByIdentifier(identifier);

        if (!page) throw new Error("Page not found");

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

        // Expand snippet references before rendering (SSR)
        const expandedContent = await expandSnippets(page.content, system);

        // Page content
        document.body.innerHTML = expandedContent;

        // Find be5-* tags used in the expanded content and add their scripts
        const usedTags = extractBlocTags(expandedContent);

        for (const tag of usedTags) {
            const script = document.createElement("script");
            script.setAttribute("src", `/bloc?tag=${tag}`);
            document.body.appendChild(script);
        }

        return compress(document.toString(), "text/html");
    }).catch(() => new Response("Page not found", { status: 404 }));
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

