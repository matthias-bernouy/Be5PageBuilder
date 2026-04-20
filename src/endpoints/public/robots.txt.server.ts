import type { Cms } from "src/Cms";
import { compress, sendCompressed } from "src/server/compression";

export default async function robotsTxt(req: Request, cms: Cms) {
    const origin = new URL(req.url).origin;
    const adminPrefix = cms.config.adminPathPrefix || "/cms";

    const body = [
        "User-agent: *",
        "Allow: /",
        `Disallow: ${adminPrefix}/`,
        `Sitemap: ${origin}/sitemap.xml`,
        "",
    ].join("\n");

    return sendCompressed(req, compress(body, "text/plain; charset=utf-8"));
}
