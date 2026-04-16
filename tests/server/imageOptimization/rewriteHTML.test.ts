import { describe, test, expect } from "bun:test";
import { rewriteHTML, extractMediaId, type ImageRewrite } from "src/server/imageOptimization/rewriteHTML";

const wrap = (body: string) => `<!DOCTYPE html><html><head></head><body>${body}</body></html>`;

describe("rewriteHTML — basic injection", () => {
    test("adds srcset + sizes to a single img", () => {
        const html = wrap(`<img src="/media?id=ABC&w=400&h=300">`);
        const out = rewriteHTML(html, [
            { index: 0, widths: [400, 800, 1200], sizes: "(min-width: 1024px) 800px, 100vw" },
        ]);
        expect(out).toContain('srcset="/media?id=ABC&w=400 400w, /media?id=ABC&w=800 800w, /media?id=ABC&w=1200 1200w"');
        expect(out).toContain('sizes="(min-width: 1024px) 800px, 100vw"');
    });

    test("strips existing w/h from the base URL when building srcset", () => {
        const html = wrap(`<img src="/media?id=ABC&w=400&h=300&extra=keep">`);
        const out = rewriteHTML(html, [{ index: 0, widths: [400], sizes: "100vw" }]);
        // `extra=keep` survives, `w`/`h` are stripped from the srcset base
        // before the rung is appended. The original `src` attribute is left
        // alone — only srcset is rewritten.
        const srcset = (out.match(/srcset="([^"]+)"/) || [])[1] || "";
        expect(srcset).toBe("/media?id=ABC&extra=keep&w=400 400w");
        expect(srcset).not.toContain("h=300");
    });

    test("leaves images without a /media src untouched", () => {
        const html = wrap(`<img src="https://cdn.example.com/x.jpg">`);
        const out = rewriteHTML(html, [{ index: 0, widths: [400], sizes: "100vw" }]);
        expect(out).not.toContain("srcset");
        expect(out).not.toContain("sizes");
    });

    test("leaves data: URIs untouched", () => {
        const html = wrap(`<img src="data:image/png;base64,iVBOR">`);
        const out = rewriteHTML(html, [{ index: 0, widths: [400], sizes: "100vw" }]);
        expect(out).not.toContain("srcset");
    });

    test("leaves /media srcs missing the id query untouched", () => {
        const html = wrap(`<img src="/media?type=favicon">`);
        const out = rewriteHTML(html, [{ index: 0, widths: [400], sizes: "100vw" }]);
        expect(out).not.toContain("srcset");
    });
});

describe("rewriteHTML — multi-image / index alignment", () => {
    test("rewrites match by document order index", () => {
        const html = wrap(
            `<img src="/media?id=A">` +
            `<img src="/media?id=B">` +
            `<img src="/media?id=C">`
        );
        const out = rewriteHTML(html, [
            { index: 0, widths: [400], sizes: "100vw" },
            { index: 2, widths: [800], sizes: "200px" },
            // index 1 deliberately omitted.
        ]);
        expect(out).toContain("/media?id=A&w=400 400w");
        expect(out).toContain("/media?id=C&w=800 800w");
        // The middle image must remain untouched.
        const middleImgChunk = out.split('id=B')[1] || "";
        expect(middleImgChunk.split(">", 1)[0]).not.toContain("srcset");
    });

    test("widths=[] is a no-op even with sizes provided", () => {
        const html = wrap(`<img src="/media?id=A">`);
        const out = rewriteHTML(html, [{ index: 0, widths: [], sizes: "100vw" }]);
        expect(out).not.toContain("srcset");
        expect(out).not.toContain("sizes");
    });

    test("empty rewrites array returns the input untouched", () => {
        const html = wrap(`<img src="/media?id=A">`);
        expect(rewriteHTML(html, [])).toBe(html);
    });
});

describe("rewriteHTML — preserves other img attributes", () => {
    test("alt, loading, class are untouched", () => {
        const html = wrap(`<img src="/media?id=A" alt="hero" loading="lazy" class="bg">`);
        const out = rewriteHTML(html, [{ index: 0, widths: [400], sizes: "100vw" }]);
        expect(out).toContain('alt="hero"');
        expect(out).toContain('loading="lazy"');
        expect(out).toContain('class="bg"');
    });
});

describe("extractMediaId", () => {
    test("returns the id from a /media URL", () => {
        expect(extractMediaId("/media?id=ABC&w=400")).toBe("ABC");
    });

    test("returns null for non-/media URLs", () => {
        expect(extractMediaId("https://example.com/x.jpg")).toBeNull();
        expect(extractMediaId("data:image/png;base64,xx")).toBeNull();
        expect(extractMediaId("/assets/foo.svg")).toBeNull();
    });

    test("returns null when /media has no id query", () => {
        expect(extractMediaId("/media?type=favicon")).toBeNull();
    });

    test("returns null for null / empty src", () => {
        expect(extractMediaId(null)).toBeNull();
        expect(extractMediaId("")).toBeNull();
    });
});
