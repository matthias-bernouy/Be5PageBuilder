import { parseHTML } from "linkedom";
import type { PageBuilder } from "src/PageBuilder";
import type { TPage } from "src/contracts/Repository/TModels";
import type { CacheEntry } from "src/contracts/Cache/Cache";
import { compress } from "src/server/compression";
import { expandSnippets } from "src/server/expandSnippets";

const COMPONENT_JS = "/assets/component.js";

/**
 * Force any favicon URL that targets the `/media` endpoint to request the
 * 64px icon-tier variant. Otherwise a user who picks a 2000×2000 source
 * would ship multi-MB bytes to every visitor for a tab icon. SVG media
 * items reach the same param but `MediaEndpoints` skips the resize for
 * them — they stay scalable. Non-media URLs (external, `/assets/favicon`)
 * pass through untouched.
 */
function normalizeFaviconHref(href: string): string {
    const qIdx = href.indexOf("?");
    if (qIdx < 0 || !href.slice(0, qIdx).endsWith("/media")) return href;
    const params = new URLSearchParams(href.slice(qIdx + 1));
    params.set("w", "64");
    return `${href.slice(0, qIdx)}?${params.toString()}`;
}

/**
 * Render a page to a compressed CacheEntry. Shared between every page
 * route registered dynamically by `PageBuilder.registerPageRoute()`. Handles
 * snippet expansion and bloc script injection identically to how the old
 * file-based `/article` endpoint did.
 *
 * <head> layout — resources are preloaded at the top so the browser starts
 * downloading them in parallel before reaching the deferred script tags at
 * the bottom of <head>. All scripts use `defer`, which keeps execution in
 * document order: `component.js` runs before any bloc IIFE, and the parser
 * is never blocked.
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

    // ── Body & bloc-script discovery (needed upfront to emit preloads) ──
    const expandedContent = await expandSnippets(page.content, system);
    document.body.innerHTML = expandedContent;

    const blocList = await system.repository.getBlocsList();
    const usedTags: string[] = [];
    for (const bloc of blocList) {
        const re = new RegExp(`<${bloc.id}(\\s|>|/)`, "i");
        if (re.test(expandedContent)) usedTags.push(bloc.id);
    }
    const scriptUrls = [COMPONENT_JS, ...usedTags.map(tag => `/bloc?tag=${tag}`)];

    // ── <head> assembly, in exact document order ──
    const head = document.head;

    const charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    head.appendChild(charset);

    const viewport = document.createElement("meta");
    viewport.setAttribute("name", "viewport");
    viewport.setAttribute("content", "width=device-width, initial-scale=1.0");
    head.appendChild(viewport);

    // Preloads — kick off fetches for every known script + the stylesheet
    // as early as possible. The speculative parser already does this for
    // resources it discovers later in the head, but emitting explicit
    // preloads makes the priority hints deterministic and survives edge
    // cases (e.g. heavy inline content before the script tags).
    const stylePreload = document.createElement("link");
    stylePreload.setAttribute("rel", "preload");
    stylePreload.setAttribute("as", "style");
    stylePreload.setAttribute("href", "/style");
    head.appendChild(stylePreload);

    for (const src of scriptUrls) {
        const preload = document.createElement("link");
        preload.setAttribute("rel", "preload");
        preload.setAttribute("as", "script");
        preload.setAttribute("href", src);
        head.appendChild(preload);
    }

    // Anti-FOUC shell: while any bloc custom element on the page is still
    // undefined (JS not yet executed), hide the body entirely and paint a
    // plain white page. As soon as every bloc registers its tag the `:has`
    // rules stop matching and the real content flips in at its final
    // layout — no partial-render jump. Uses the exact same tag list as
    // the bloc script injection, so the rule is scoped only to the blocs
    // actually present on this page.
    if (usedTags.length > 0) {
        const htmlSel = usedTags.map(tag => `html:has(${tag}:not(:defined))`).join(",");
        const bodySel = usedTags.map(tag => `html:has(${tag}:not(:defined)) body`).join(",");
        const foucStyle = document.createElement("style");
        foucStyle.textContent = `${htmlSel}{background:#fff}${bodySel}{visibility:hidden}`;
        head.appendChild(foucStyle);
    }

    // Title + description
    const title = document.createElement("title");
    title.textContent = page.title;
    head.appendChild(title);

    const metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute("content", page.description);
    head.appendChild(metaDescription);

    // Favicon: picked from settings.site.favicon (a media URL chosen via
    // the MediaCenter picker in the Settings admin UI). Falls back to the
    // built-in PageBuilder icon at /assets/favicon when no favicon is set.
    const favicon = document.createElement("link");
    favicon.setAttribute("rel", "icon");
    const rawFavicon = settings.site?.favicon?.trim() || "/assets/favicon";
    favicon.setAttribute("href", normalizeFaviconHref(rawFavicon));
    head.appendChild(favicon);

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
        head.appendChild(canonical);
    }

    // Theme CSS
    const themeLink = document.createElement("link");
    themeLink.setAttribute("rel", "stylesheet");
    themeLink.setAttribute("href", "/style");
    head.appendChild(themeLink);

    // Deferred scripts — downloaded in parallel, executed in document order
    // after HTML parsing. `component.js` is emitted first so every bloc IIFE
    // can read `window.p9r.Component` at execution time.
    for (const src of scriptUrls) {
        const script = document.createElement("script");
        script.setAttribute("defer", "");
        script.setAttribute("src", src);
        head.appendChild(script);
    }

    return compress(document.toString(), "text/html");
}
