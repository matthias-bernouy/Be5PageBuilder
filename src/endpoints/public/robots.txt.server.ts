import type { PageBuilder } from "src/PageBuilder";
import { compress, sendCompressed } from "src/server/compression";

export default async function robotsTxt(req: Request, system: PageBuilder) {
    const origin = new URL(req.url).origin;
    const adminPrefix = system.config.adminPathPrefix || "/page-builder";

    const body = [
        "User-agent: *",
        "Allow: /",
        `Disallow: ${adminPrefix}/`,
        `Sitemap: ${origin}/sitemap.xml`,
        "",
    ].join("\n");

    return sendCompressed(req, compress(body, "text/plain; charset=utf-8"));
}
