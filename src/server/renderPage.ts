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

    const settings = await system.repository.getSystem();

    // <html lang="..."> when the site language is configured.
    const language = settings.site?.language?.trim() ?? "";
    if (language) document.documentElement.setAttribute("lang", language);

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

    // Canonical link when a host is configured. The trailing slash of the
    // host is stripped so we don't emit `https://site.com//about`.
    const host = settings.site?.host?.trim().replace(/\/+$/, "") ?? "";
    if (host) {
        const query = page.identifier
            ? `?identifier=${encodeURIComponent(page.identifier)}`
            : "";
        const canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        canonical.setAttribute("href", `${host}${page.path}${query}`);
        document.head.appendChild(canonical);
    }

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

    // Synchronous global runtime — must come first in <head> so the bloc
    // IIFEs below can read `window.p9r.Component` at evaluation time.
    const globalScript = document.createElement("script");
    globalScript.setAttribute("src", "/assets/component.js");
    document.head.prepend(globalScript);

    for (const tag of usedTags) {
        const script = document.createElement("script");
        script.setAttribute("src", `/bloc?tag=${tag}`);
        document.head.appendChild(script);
    }

    return compress(document.toString(), "text/html");
}
