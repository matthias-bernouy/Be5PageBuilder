import { parseHTML } from "linkedom";
import type DeliveryCms from "src/delivery/DeliveryCms";
import type { TPage } from "src/socle/contracts/Repository/TModels";
import type { CacheEntry } from "src/socle/contracts/Cache/Cache";
import { compress } from "src/server/compression";
import { expandSnippets } from "src/delivery/core/html/expandSnippets";
import { findUsedBlocTags } from "src/delivery/core/head/findUsedBlocs";
import { resolveAssets } from "src/delivery/core/assets/resolveAssets";
import { buildHtmlBasics } from "src/delivery/core/head/buildHtmlBasics";
import { buildAssetPreloads, buildFoucShell, buildStylesheetLink } from "src/delivery/core/head/buildAssets";
import { buildPreconnect } from "src/delivery/core/head/buildPreconnect";
import { buildScriptTags } from "src/delivery/core/head/buildScriptTags";
import { defineMetaTags } from "src/delivery/core/seo/defineMetaTags";

/**
 * Render a page to a compressed CacheEntry. Thin orchestrator — every piece
 * of `<head>` construction lives in a dedicated helper; this function only
 * fixes document order and wires the repository calls.
 *
 * <head> layout: preloads are emitted early so the browser starts
 * downloading the runtime + theme before reaching the deferred `<script>`
 * tags at the bottom. All scripts use `defer`, which keeps execution in
 * document order: `component.js` runs before any bloc IIFE, and the parser
 * is never blocked.
 *
 * Returns a CacheEntry (not a Response) because `cachedResponseAsync` is
 * the only caller and it expects the pre-compressed bytes.
 */
export async function renderPage(page: TPage, delivery: DeliveryCms): Promise<CacheEntry> {
    const { document } = parseHTML("<!DOCTYPE html><html><head></head><body></body></html>");
    const head = document.head;

    const settings = await delivery.repository.getSystem();

    const expandedContent = await expandSnippets(page.content, delivery.repository);
    document.body.innerHTML = expandedContent;

    const blocList = await delivery.repository.getBlocsList();
    const usedTags = findUsedBlocTags(expandedContent, blocList);
    const assets   = await resolveAssets(delivery, usedTags);

    // <head> assembly, in exact document order
    buildHtmlBasics    (document, head, settings);
    buildPreconnect    (document, head);
    buildAssetPreloads (document, head, assets);
    buildFoucShell     (document, head, usedTags);
    defineMetaTags     (document, head, page, settings, delivery.cmsPathPrefix);
    buildStylesheetLink(document, head, assets);
    buildScriptTags    (document, head, assets);

    return compress(document.toString(), "text/html");
}
