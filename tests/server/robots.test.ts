import { describe, test, expect } from "bun:test";
import robotsTxt from "src/endpoints/public/robots.txt.server";
import type { PageBuilder } from "src/PageBuilder";

function makeSystem(adminPathPrefix?: string): PageBuilder {
    return { config: { adminPathPrefix } } as unknown as PageBuilder;
}

function makeRequest(url: string): Request {
    return new Request(url, { headers: {} });
}

describe("robots.txt", () => {
    test("returns 200 with text/plain content type", async () => {
        const res = await robotsTxt(makeRequest("http://example.com/robots.txt"), makeSystem());
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    });

    test("body declares User-agent, Allow and Disallow lines", async () => {
        const res = await robotsTxt(makeRequest("http://example.com/robots.txt"), makeSystem());
        const body = await res.text();
        expect(body).toContain("User-agent: *");
        expect(body).toContain("Allow: /");
        expect(body).toContain("Disallow: /page-builder/");
    });

    test("Sitemap line uses the request origin (absolute URL)", async () => {
        const res = await robotsTxt(makeRequest("https://www.acme.io/robots.txt"), makeSystem());
        const body = await res.text();
        expect(body).toContain("Sitemap: https://www.acme.io/sitemap.xml");
    });

    test("Disallow line honours a custom admin prefix", async () => {
        const res = await robotsTxt(makeRequest("http://example.com/robots.txt"), makeSystem("/cms"));
        const body = await res.text();
        expect(body).toContain("Disallow: /cms/");
        expect(body).not.toContain("Disallow: /page-builder/");
    });

    test("sets nosniff to prevent content-type guessing", async () => {
        const res = await robotsTxt(makeRequest("http://example.com/robots.txt"), makeSystem());
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });
});
