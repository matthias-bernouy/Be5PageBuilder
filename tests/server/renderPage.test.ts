import { describe, test, expect } from "bun:test";
import { renderPage } from "src/server/renderPage";
import type { Cms } from "src/Cms";
import type { TPage, TSnippet, TSystem } from "src/contracts/Repository/TModels";

function page(over: Partial<TPage> = {}): TPage {
    return {
        path: "/about",
        identifier: "",
        title: "About Us",
        description: "About description",
        content: "<p>body</p>",
        visible: true,
        tags: [],
        ...over,
    };
}

function makeSystem(opts: {
    blocs?: { id: string; name: string; group: string; description: string }[];
    snippets?: Record<string, string>;
    settings?: Partial<TSystem["site"]>;
} = {}): Cms {
    const site: TSystem["site"] = {
        name: "",
        favicon: "",
        visible: true,
        host: "",
        language: "",
        theme: "",
        notFound: null,
        serverError: null,
        ...opts.settings,
    };
    const cms: TSystem = {
        initializationStep: 0,
        site,
        editor: { layoutCategory: "" },
    };
    return {
        repository: {
            getSystem: async () => cms,
            getBlocsList: async () => opts.blocs ?? [],
            getSnippetByIdentifier: async (id: string): Promise<TSnippet | null> => {
                if (!opts.snippets || !(id in opts.snippets)) return null;
                return {
                    identifier: id,
                    name: id,
                    description: "",
                    content: opts.snippets[id]!,
                    category: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            },
        },
    } as unknown as Cms;
}

async function renderToString(p: TPage, cms: Cms): Promise<string> {
    const entry = await renderPage(p, cms);
    return new TextDecoder().decode(entry.raw);
}

describe("renderPage — meta", () => {
    test("emits text/html as the cache content type", async () => {
        const entry = await renderPage(page(), makeSystem());
        expect(entry.contentType).toBe("text/html");
    });

    test("uses the page title and description", async () => {
        const html = await renderToString(
            page({ title: "My Title", description: "My desc" }),
            makeSystem(),
        );
        // Note: linkedom serializes attributes in alphabetical order, so we
        // assert presence of each attribute rather than the exact element string.
        expect(html).toContain("<title>My Title</title>");
        expect(html).toMatch(/<meta\b[^>]*\bname="description"[^>]*>/);
        expect(html).toMatch(/<meta\b[^>]*\bcontent="My desc"[^>]*>/);
    });

    test("includes charset, viewport, favicon and theme stylesheet", async () => {
        const html = await renderToString(page(), makeSystem());
        expect(html).toContain('charset="UTF-8"');
        expect(html).toContain('content="width=device-width, initial-scale=1.0"');
        expect(html).toMatch(/<link\b[^>]*\brel="icon"[^>]*>/);
        // Default favicon when the settings.site.favicon is empty.
        expect(html).toContain('href="/assets/favicon"');
        expect(html).toMatch(/<link\b[^>]*\brel="stylesheet"[^>]*>/);
        expect(html).toContain('href="/style"');
    });

    test("uses the configured site favicon when one is set and pins the icon-tier width", async () => {
        const html = await renderToString(
            page(),
            makeSystem({ settings: { favicon: "/media?id=abc" } }),
        );
        // Force the 64px icon-tier variant regardless of source dimensions.
        expect(html).toContain('href="/media?id=abc&w=64"');
        expect(html).not.toContain('href="/assets/favicon"');
    });

    test("overrides any existing w= param on a media favicon href", async () => {
        const html = await renderToString(
            page(),
            makeSystem({ settings: { favicon: "/media?id=abc&w=400&h=300" } }),
        );
        // URLSearchParams reorders keys; h stays, w is forced to 64.
        expect(html).toMatch(/href="\/media\?[^"]*\bw=64\b[^"]*"/);
        expect(html).toMatch(/href="\/media\?[^"]*\bh=300\b[^"]*"/);
        expect(html).toMatch(/href="\/media\?[^"]*\bid=abc\b[^"]*"/);
        expect(html).not.toContain("w=400");
    });

    test("does not append w= to non-media favicon URLs", async () => {
        const html = await renderToString(
            page(),
            makeSystem({ settings: { favicon: "https://cdn.example.com/icon.png" } }),
        );
        expect(html).toContain('href="https://cdn.example.com/icon.png"');
        expect(html).not.toContain("w=64");
    });

    test("default /assets/favicon fallback is passed through unchanged", async () => {
        const html = await renderToString(page(), makeSystem());
        expect(html).toContain('href="/assets/favicon"');
        expect(html).not.toContain("w=64");
    });

    test("falls back to the default favicon when the setting is whitespace", async () => {
        const html = await renderToString(
            page(),
            makeSystem({ settings: { favicon: "   " } }),
        );
        expect(html).toContain('href="/assets/favicon"');
    });

    test("emits a <link rel=preload as=script> for the global runtime", async () => {
        const html = await renderToString(page(), makeSystem());
        expect(html).toMatch(
            /<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="script")(?=[^>]*\bhref="\/assets\/component\.js")[^>]*>/
        );
    });

    test("emits a <link rel=preload as=style> for the theme stylesheet", async () => {
        const html = await renderToString(page(), makeSystem());
        expect(html).toMatch(
            /<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="style")(?=[^>]*\bhref="\/style")[^>]*>/
        );
    });

    test("emits a preload for every used bloc tag's script", async () => {
        const html = await renderToString(
            page({ content: `<my-card></my-card>` }),
            makeSystem({
                blocs: [{ id: "my-card", name: "Card", group: "g", description: "" }],
            }),
        );
        expect(html).toMatch(
            /<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="script")(?=[^>]*\bhref="\/bloc\?tag=my-card")[^>]*>/
        );
    });

    test("preloads appear before the deferred script tags", async () => {
        const html = await renderToString(
            page({ content: `<my-card></my-card>` }),
            makeSystem({
                blocs: [{ id: "my-card", name: "Card", group: "g", description: "" }],
            }),
        );
        const preload = html.indexOf('rel="preload"');
        const firstScript = html.indexOf("<script");
        expect(preload).toBeGreaterThanOrEqual(0);
        expect(firstScript).toBeGreaterThan(preload);
    });

    test("every script in <head> is deferred and in execution order (component first)", async () => {
        const html = await renderToString(
            page({ content: `<my-card></my-card><other-bloc></other-bloc>` }),
            makeSystem({
                blocs: [
                    { id: "my-card",    name: "Card",  group: "g", description: "" },
                    { id: "other-bloc", name: "Other", group: "g", description: "" },
                ],
            }),
        );
        const scriptTags = [...html.matchAll(/<script\b[^>]*>/g)].map(m => m[0]);
        expect(scriptTags.length).toBe(3);
        for (const tag of scriptTags) expect(tag).toContain("defer");
        // Document order → execution order: component.js must come first so
        // the bloc IIFEs can read `window.p9r.Component`.
        const componentIdx = html.search(/<script\b[^>]*\bsrc="\/assets\/component\.js"/);
        const myCardIdx    = html.search(/<script\b[^>]*\bsrc="\/bloc\?tag=my-card"/);
        const otherIdx     = html.search(/<script\b[^>]*\bsrc="\/bloc\?tag=other-bloc"/);
        expect(componentIdx).toBeGreaterThan(-1);
        expect(myCardIdx).toBeGreaterThan(componentIdx);
        expect(otherIdx).toBeGreaterThan(componentIdx);
    });
});

describe("renderPage — lang & canonical", () => {
    test("does not set <html lang> when language setting is empty", async () => {
        const html = await renderToString(page(), makeSystem());
        expect(html).not.toMatch(/<html[^>]*\blang=/);
    });

    test("sets <html lang> from the site language setting", async () => {
        const html = await renderToString(page(), makeSystem({ settings: { language: "fr" } }));
        expect(html).toMatch(/<html[^>]*\blang="fr"/);
    });

    test("does not emit a canonical link when host is empty", async () => {
        const html = await renderToString(page(), makeSystem());
        expect(html).not.toMatch(/rel="canonical"/);
    });

    test("emits a canonical link from host + page path", async () => {
        const html = await renderToString(
            page({ path: "/about" }),
            makeSystem({ settings: { host: "https://example.com" } }),
        );
        expect(html).toContain('rel="canonical"');
        expect(html).toContain('href="https://example.com/about"');
    });

    test("strips trailing slash from the configured host", async () => {
        const html = await renderToString(
            page({ path: "/about" }),
            makeSystem({ settings: { host: "https://example.com/" } }),
        );
        expect(html).toContain('href="https://example.com/about"');
    });

    test("appends the identifier query param in canonical for non-default variants", async () => {
        const html = await renderToString(
            page({ path: "/article", identifier: "foo bar" }),
            makeSystem({ settings: { host: "https://example.com" } }),
        );
        expect(html).toContain('href="https://example.com/article?identifier=foo%20bar"');
    });
});

describe("renderPage — body & snippet expansion", () => {
    test("places the page content inside <body>", async () => {
        const html = await renderToString(
            page({ content: "<section>hello world</section>" }),
            makeSystem(),
        );
        expect(html).toContain("<section>hello world</section>");
    });

    test("expands <w13c-snippet> wrappers via the repository before rendering", async () => {
        const html = await renderToString(
            page({ content: `<w13c-snippet identifier="hero">stale</w13c-snippet>` }),
            makeSystem({ snippets: { hero: "<h1>Live</h1>" } }),
        );
        expect(html).toContain("<h1>Live</h1>");
        expect(html).not.toContain("stale");
    });
});

describe("renderPage — bloc script injection", () => {
    test("injects a script for every registered tag that appears in the content", async () => {
        const html = await renderToString(
            page({ content: `<my-card></my-card><other-bloc></other-bloc>` }),
            makeSystem({
                blocs: [
                    { id: "my-card",     name: "Card",  group: "g", description: "" },
                    { id: "other-bloc",  name: "Other", group: "g", description: "" },
                    { id: "unused-bloc", name: "Skip",  group: "g", description: "" },
                ],
            }),
        );
        expect(html).toContain('src="/bloc?tag=my-card"');
        expect(html).toContain('src="/bloc?tag=other-bloc"');
        // Unused tag is registered but never appears in content — must NOT
        // be injected (otherwise every page downloads every bloc bundle).
        expect(html).not.toContain('src="/bloc?tag=unused-bloc"');
    });

    test("matches tags case-insensitively but does not double-count", async () => {
        const html = await renderToString(
            page({ content: `<MY-CARD></MY-CARD><my-card></my-card>` }),
            makeSystem({
                blocs: [{ id: "my-card", name: "Card", group: "g", description: "" }],
            }),
        );
        const matches = html.match(/src="\/bloc\?tag=my-card"/g) ?? [];
        expect(matches).toHaveLength(1);
    });

    test("self-closing usage is detected (e.g. <hero-image />)", async () => {
        const html = await renderToString(
            page({ content: `<hero-image/>` }),
            makeSystem({
                blocs: [{ id: "hero-image", name: "Hero", group: "g", description: "" }],
            }),
        );
        expect(html).toContain('src="/bloc?tag=hero-image"');
    });

    test("a tag that appears only as a substring is NOT injected", async () => {
        // `<my-card-extra>` should not match `my-card` — the regex requires
        // the next char after the tag to be whitespace, `>` or `/`.
        const html = await renderToString(
            page({ content: `<my-card-extra></my-card-extra>` }),
            makeSystem({
                blocs: [{ id: "my-card", name: "Card", group: "g", description: "" }],
            }),
        );
        expect(html).not.toContain('src="/bloc?tag=my-card"');
    });

    test("injects scripts also for tags that appear inside an expanded snippet", async () => {
        const html = await renderToString(
            page({ content: `<w13c-snippet identifier="hero">x</w13c-snippet>` }),
            makeSystem({
                snippets: { hero: `<my-card></my-card>` },
                blocs: [{ id: "my-card", name: "Card", group: "g", description: "" }],
            }),
        );
        expect(html).toContain('src="/bloc?tag=my-card"');
    });
});
