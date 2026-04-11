import { describe, test, expect } from "bun:test";
import { expandSnippets } from "src/server/expandSnippets";
import type { PageBuilder } from "src/PageBuilder";
import type { TSnippet } from "src/interfaces/contract/Repository/TModels";

function makeSystem(snippets: Record<string, string>) {
    const fetchLog: string[] = [];
    const system = {
        repository: {
            getSnippetByIdentifier: async (id: string): Promise<TSnippet | null> => {
                fetchLog.push(id);
                if (id in snippets) {
                    return {
                        identifier: id,
                        name: id,
                        description: "",
                        content: snippets[id]!,
                        category: "",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                }
                return null;
            },
        },
    } as unknown as PageBuilder;
    return { system, fetchLog };
}

describe("expandSnippets", () => {
    test("returns content unchanged when there are no snippet wrappers", async () => {
        const { system, fetchLog } = makeSystem({});
        const out = await expandSnippets("<p>hello</p>", system);
        expect(out).toBe("<p>hello</p>");
        expect(fetchLog).toHaveLength(0);
    });

    test("replaces a single snippet wrapper with its current content", async () => {
        const { system } = makeSystem({ hero: "<h1>Hi</h1>" });
        const out = await expandSnippets(
            `before<w13c-snippet identifier="hero">stale</w13c-snippet>after`,
            system
        );
        expect(out).toBe(`before<w13c-snippet identifier="hero"><h1>Hi</h1></w13c-snippet>after`);
    });

    test("replaces multiple distinct snippets independently", async () => {
        const { system } = makeSystem({ a: "A", b: "B" });
        const out = await expandSnippets(
            `<w13c-snippet identifier="a">x</w13c-snippet><w13c-snippet identifier="b">y</w13c-snippet>`,
            system
        );
        expect(out).toContain(`identifier="a">A</w13c-snippet>`);
        expect(out).toContain(`identifier="b">B</w13c-snippet>`);
    });

    test("deduplicates repository fetches when the same identifier appears twice", async () => {
        const { system, fetchLog } = makeSystem({ hero: "H" });
        await expandSnippets(
            `<w13c-snippet identifier="hero">1</w13c-snippet><w13c-snippet identifier="hero">2</w13c-snippet>`,
            system
        );
        expect(fetchLog).toEqual(["hero"]);
    });

    test("missing snippets expand to empty content", async () => {
        const { system } = makeSystem({});
        const out = await expandSnippets(
            `<w13c-snippet identifier="ghost">stale</w13c-snippet>`,
            system
        );
        expect(out).toBe(`<w13c-snippet identifier="ghost"></w13c-snippet>`);
    });

    test("wrapper without identifier attribute is passed through with empty body", async () => {
        const { system } = makeSystem({});
        const out = await expandSnippets(
            `<w13c-snippet class="hero">stale</w13c-snippet>`,
            system
        );
        expect(out).toBe(`<w13c-snippet class="hero"></w13c-snippet>`);
    });

    test("matches are case-insensitive on the tag — and output is normalized to lowercase", async () => {
        const { system } = makeSystem({ a: "A" });
        const out = await expandSnippets(
            `<W13C-SNIPPET identifier="a">x</W13C-SNIPPET>`,
            system
        );
        // The regex matches the uppercase variant, but the replacement writes
        // `w13c-snippet` in lowercase. Documenting this normalization.
        expect(out).toContain(`<w13c-snippet identifier="a">A</w13c-snippet>`);
    });

    test("single-quoted identifier attribute is recognized", async () => {
        const { system } = makeSystem({ a: "A" });
        const out = await expandSnippets(
            `<w13c-snippet identifier='a'>x</w13c-snippet>`,
            system
        );
        expect(out).toContain(`>A</w13c-snippet>`);
    });

    test("does NOT touch unrelated tags", async () => {
        const { system } = makeSystem({ a: "A" });
        const input = `<article><p>hello</p></article>`;
        const out = await expandSnippets(input, system);
        expect(out).toBe(input);
    });
});
