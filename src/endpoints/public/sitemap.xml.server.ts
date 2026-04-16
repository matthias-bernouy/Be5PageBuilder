import type { PageBuilder } from "src/PageBuilder";
import { compress, sendCompressed } from "src/server/compression";
import { isReservedPath } from "src/server/reservedPaths";

const XML_ESCAPE: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
};

function escapeXml(s: string): string {
    return s.replace(/[<>&'"]/g, (c) => XML_ESCAPE[c]!);
}

export default async function sitemapXml(req: Request, system: PageBuilder) {
    const origin = new URL(req.url).origin;
    const pages = await system.repository.getAllPages();

    const urls: string[] = [];
    let hasLiteralRoot = false;

    for (const p of pages) {
        if (!p.visible) continue;
        if (isReservedPath(p.path, system)) continue;
        if (p.path === "/") hasLiteralRoot = true;

        const pathWithQuery = p.identifier
            ? `${p.path}?identifier=${encodeURIComponent(p.identifier)}`
            : p.path;
        urls.push(`  <url><loc>${escapeXml(origin + pathWithQuery)}</loc></url>`);
    }

    // The home route resolves through site.home when no literal `/` page exists.
    if (!hasLiteralRoot) {
        const settings = await system.repository.getSystem();
        if (settings.site?.home) {
            urls.unshift(`  <url><loc>${escapeXml(origin + "/")}</loc></url>`);
        }
    }

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        "</urlset>",
        "",
    ].join("\n");

    return sendCompressed(req, compress(xml, "application/xml; charset=utf-8"));
}
