import { parseHTML } from "linkedom";
import type { PageBuilder } from "src/PageBuilder";
import type { TPage } from "src/interfaces/contract/Repository/TModels";
import type { CacheEntry } from "src/interfaces/contract/Cache/Cache";
import { compress } from "src/server/compression";
import { expandSnippets } from "src/server/expandSnippets";

/**
 * Render a page to a compressed CacheEntry. Shared between every page
 * route registered dynamically by `PageBuilder.registerPageRoute()`. Handles
 * snippet expansion and bloc script injection identically to how the old
 * file-based `/article` endpoint did.
 *
 * Returns a CacheEntry (not a Response) because `cachedResponseAsync` is the
 * only caller and it expects the pre-compressed bytes.
 */
export async function renderPage(page: TPage, system: PageBuilder): Promise<CacheEntry> {
    const { document } = parseHTML("<!DOCTYPE html><html><head></head><body></body></html>");

    // Meta
    document.title = page.title;

    const metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute("content", page.description);
    document.head.appendChild(metaDescription);

    const viewport = document.createElement("meta");
    viewport.setAttribute("name", "viewport");
    viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
    document.head.appendChild(viewport);

    const charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    document.head.appendChild(charset);

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

    document.body.innerHTML = expandedContent;

    // Inject a script for every registered bloc whose tag appears in the
    // expanded content. The set of valid tags comes from the repository so
    // arbitrary prefixes (e.g. `acme-card`, `ta-hero`) work — not just `be5-*`.
    const blocList = await system.repository.getBlocsList();
    const usedTags = new Set<string>();
    for (const bloc of blocList) {
        const re = new RegExp(`<${bloc.id}(\\s|>|/)`, "i");
        if (re.test(expandedContent)) usedTags.add(bloc.id);
    }

    for (const tag of usedTags) {
        const script = document.createElement("script");
        script.setAttribute("src", `/bloc?tag=${tag}`);
        document.head.appendChild(script);
    }

    return compress(document.toString(), "text/html");
}
