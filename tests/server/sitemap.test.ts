import { describe, test, expect } from "bun:test";
import sitemapXml from "src/endpoints/public/sitemap.xml.server";
import type { PageBuilder } from "src/PageBuilder";
import type { TPage, TPageRef, TSystem } from "src/interfaces/contract/Repository/TModels";

function page(over: Partial<TPage> = {}): TPage {
    return {
        path: "/about",
        identifier: "",
        content: "<p>hi</p>",
        title: "About",
        description: "",
        visible: true,
        tags: [],
        ...over,
    };
}

function makeSystem(opts: {
    pages?: TPage[];
    home?: TPageRef;
    adminPathPrefix?: string;
} = {}): PageBuilder {
    const sys: any = {
        config: { adminPathPrefix: opts.adminPathPrefix ?? "/page-builder" },
        repository: {
            getAllPages: async () => opts.pages ?? [],
            getSystem: async (): Promise<TSystem> => ({
                initializationStep: 0,
                site: {
                    name: "Test",
                    favicon: "",
                    visible: true,
                    host: "",
                    language: "",
                    theme: "",
                    home: opts.home ?? null,
                    notFound: null,
                    serverError: null,
                },
                seo: { titleTemplate: "", defaultDescription: "", defaultOgImage: "" },
                editor: { layoutCategory: "" },
            }),
        },
    };
    return sys as PageBuilder;
}

function makeRequest(url = "https://example.com/sitemap.xml"): Request {
    return new Request(url, { headers: {} });
}

describe("sitemap.xml", () => {
    test("returns 200 with application/xml content type", async () => {
        const res = await sitemapXml(makeRequest(), makeSystem());
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
    });

    test("starts with the XML declaration and urlset element", async () => {
        const res = await sitemapXml(makeRequest(), makeSystem());
        const body = await res.text();
        expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
        expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        expect(body.trimEnd().endsWith("</urlset>")).toBe(true);
    });

    test("lists every visible page with an absolute URL built from the request origin", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [
                page({ path: "/about" }),
                page({ path: "/contact" }),
            ],
        }));
        const body = await res.text();
        expect(body).toContain("<loc>https://acme.io/about</loc>");
        expect(body).toContain("<loc>https://acme.io/contact</loc>");
    });

    test("excludes pages where visible is false", async () => {
        const res = await sitemapXml(makeRequest(), makeSystem({
            pages: [
                page({ path: "/public" }),
                page({ path: "/draft", visible: false }),
            ],
        }));
        const body = await res.text();
        expect(body).toContain("/public");
        expect(body).not.toContain("/draft");
    });

    test("defensively excludes reserved paths", async () => {
        const res = await sitemapXml(makeRequest(), makeSystem({
            pages: [
                page({ path: "/about" }),
                page({ path: "/bloc" }),
                page({ path: "/page-builder/leak" }),
            ],
        }));
        const body = await res.text();
        expect(body).toContain("/about");
        expect(body).not.toContain("/bloc<");
        expect(body).not.toContain("/page-builder/leak");
    });

    test("encodes identifier as a query parameter when present", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [
                page({ path: "/article", identifier: "v2" }),
            ],
        }));
        const body = await res.text();
        expect(body).toContain("<loc>https://acme.io/article?identifier=v2</loc>");
    });

    test("URL-encodes special characters inside the identifier", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [
                page({ path: "/article", identifier: "a b/c" }),
            ],
        }));
        const body = await res.text();
        expect(body).toContain("a%20b%2Fc");
    });

    test("escapes XML-significant characters present in the path itself", async () => {
        // `isValidPathFormat` accepts `&` in a page path, so the sitemap must
        // turn it into `&amp;` to keep the XML well-formed.
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [page({ path: "/foo&bar" })],
        }));
        const body = await res.text();
        expect(body).toContain("<loc>https://acme.io/foo&amp;bar</loc>");
        expect(body).not.toContain("/foo&bar<");
    });

    test("emits multiple URLs when the same path has different identifiers", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [
                page({ path: "/article", identifier: "" }),
                page({ path: "/article", identifier: "v2" }),
            ],
        }));
        const body = await res.text();
        expect(body).toContain("<loc>https://acme.io/article</loc>");
        expect(body).toContain("<loc>https://acme.io/article?identifier=v2</loc>");
    });

    test("adds `/` when site.home is configured and no literal `/` page exists", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [page({ path: "/about" })],
            home: { path: "/about", identifier: "" },
        }));
        const body = await res.text();
        expect(body).toContain("<loc>https://acme.io/</loc>");
    });

    test("does NOT add `/` when site.home is not configured", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [page({ path: "/about" })],
            home: null,
        }));
        const body = await res.text();
        expect(body).not.toContain("<loc>https://acme.io/</loc>");
    });

    test("does NOT duplicate `/` when a literal page at `/` already exists", async () => {
        const res = await sitemapXml(makeRequest("https://acme.io/sitemap.xml"), makeSystem({
            pages: [page({ path: "/" })],
            home: { path: "/", identifier: "" },
        }));
        const body = await res.text();
        const matches = body.match(/<loc>https:\/\/acme\.io\/<\/loc>/g) ?? [];
        expect(matches).toHaveLength(1);
    });

    test("returns an empty <urlset> when no pages exist and no home is set", async () => {
        const res = await sitemapXml(makeRequest(), makeSystem());
        const body = await res.text();
        expect(body).not.toContain("<url>");
        expect(body).toContain("<urlset");
        expect(body).toContain("</urlset>");
    });

    test("sets nosniff to prevent content-type guessing", async () => {
        const res = await sitemapXml(makeRequest(), makeSystem());
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });
});
