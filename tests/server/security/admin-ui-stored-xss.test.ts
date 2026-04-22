import { describe, test, expect } from "bun:test";
import SnippetsPage from "src/control/endpoints/admin-ui/snippets/snippets.server";
import TemplatesPage from "src/control/endpoints/admin-ui/templates/templates.server";
import PagesPage from "src/control/endpoints/admin-ui/pages/pages.server";

const XSS = `"><script>fetch('/pwned')</script><x "`;

function sys(data: Record<string, any[]>) {
    return {
        repository: {
            getAllSnippets: async () => data.snippets ?? [],
            getAllTemplates: async () => data.templates ?? [],
            getAllPages:     async () => data.pages ?? [],
        },
    } as any;
}

async function bodyOf(res: Response): Promise<string> {
    return await res.text();
}

describe("admin UI escapes DB-sourced text", () => {
    test("snippets page escapes snippet.name / category / id", async () => {
        const res = await SnippetsPage({} as any, sys({
            snippets: [{ id: XSS, identifier: "ok", name: XSS, category: XSS, updatedAt: Date.now() }],
        }));
        const html = await bodyOf(res);
        expect(html).not.toContain("<script>fetch('/pwned')");
    });

    test("templates page escapes tpl.name / category / id", async () => {
        const res = await TemplatesPage({} as any, sys({
            templates: [{ id: XSS, name: XSS, category: XSS }],
        }));
        const html = await bodyOf(res);
        expect(html).not.toContain("<script>fetch('/pwned')");
    });

    test("pages page escapes page.title / tags / path", async () => {
        const res = await PagesPage(new Request("http://x"), sys({
            pages: [{ id: "x", title: XSS, tags: XSS, path: XSS, visible: true }],
        }));
        const html = await bodyOf(res);
        expect(html).not.toContain("<script>fetch('/pwned')");
    });
});
