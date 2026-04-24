import { describe, test, expect } from "bun:test";
import postSnippet from "src/control/api/snippet/snippet.post";
import { P9R_CACHE } from "src/socle/constants/p9r-constants";
import type { TSnippet, TPage } from "src/socle/contracts/Repository/TModels";

function makeSystem(opts: {
    existingByIdentifier?: Record<string, TSnippet | null>;
    existingSnippetById?: TSnippet | null;
    pagesUsingSnippet?: Record<string, TPage[]>;
} = {}) {
    const createCalls: TSnippet[] = [];
    const updateCalls: { id: string; data: Partial<TSnippet> }[] = [];
    const deleteSpy: string[] = [];
    const cms: any = {
        repository: {
            getSnippetByIdentifier: async (id: string) => {
                return opts.existingByIdentifier?.[id] ?? null;
            },
            createSnippet: async (s: TSnippet) => {
                createCalls.push(s);
                return { ...s, id: "snip-id" };
            },
            updateSnippet: async (id: string, data: Partial<TSnippet>) => {
                updateCalls.push({ id, data });
                if (opts.existingSnippetById === null) return null;
                return {
                    identifier: "kept-identifier",
                    name: "n",
                    description: "",
                    content: "",
                    category: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ...opts.existingSnippetById,
                    ...data,
                    id,
                };
            },
            findPagesUsingSnippet: async (identifier: string) => {
                return opts.pagesUsingSnippet?.[identifier] ?? [];
            },
        },
        cache: {
            get: () => null,
            set: () => {},
            delete: (k: string) => { deleteSpy.push(k); },
            clear: () => {},
        },
    };
    return { cms, createCalls, updateCalls, deleteSpy };
}

function makeRequest(query: Record<string, string>, body: Partial<TSnippet>) {
    const url = new URL("http://localhost/cms/api/snippet");
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new Request(url.toString(), {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}

describe("snippet.post — create", () => {
    test("400 when identifier missing", async () => {
        const { cms } = makeSystem();
        const res = await postSnippet(
            makeRequest({}, { name: "n", content: "c" }),
            cms
        );
        expect(res.status).toBe(400);
    });

    test("400 when name missing", async () => {
        const { cms } = makeSystem();
        const res = await postSnippet(
            makeRequest({}, { identifier: "hero", content: "c" }),
            cms
        );
        expect(res.status).toBe(400);
    });

    test("400 when content is undefined (but empty string is allowed)", async () => {
        const { cms } = makeSystem();
        const missing = await postSnippet(
            makeRequest({}, { identifier: "hero", name: "n" }),
            cms
        );
        expect(missing.status).toBe(400);

        const empty = await postSnippet(
            makeRequest({}, { identifier: "hero", name: "n", content: "" }),
            cms
        );
        expect(empty.status).toBe(201);
    });

    test.each([
        ["Hero"],
        ["hero_section"],
        ["hero section"],
        ["-leading"],
        ["trailing-"],
        ["double--dash"],
        [""],
    ])("400 on invalid kebab identifier %p", async (identifier) => {
        const { cms } = makeSystem();
        const res = await postSnippet(
            makeRequest({}, { identifier, name: "n", content: "c" }),
            cms
        );
        expect(res.status).toBe(400);
    });

    test.each([["hero"], ["hero-section"], ["a1-b2-c3"], ["x"]])(
        "201 on valid kebab identifier %p",
        async (identifier) => {
            const { cms } = makeSystem();
            const res = await postSnippet(
                makeRequest({}, { identifier, name: "n", content: "c" }),
                cms
            );
            expect(res.status).toBe(201);
        }
    );

    test("409 when identifier already exists", async () => {
        const { cms, createCalls } = makeSystem({
            existingByIdentifier: {
                hero: {
                    identifier: "hero",
                    name: "Hero",
                    description: "",
                    content: "",
                    category: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
        });
        const res = await postSnippet(
            makeRequest({}, { identifier: "hero", name: "n", content: "c" }),
            cms
        );
        expect(res.status).toBe(409);
        expect(createCalls).toHaveLength(0);
    });
});

describe("snippet.post — update", () => {
    test("404 when target does not exist", async () => {
        const { cms } = makeSystem({ existingSnippetById: null });
        const res = await postSnippet(
            makeRequest({ id: "missing" }, { name: "new" }),
            cms
        );
        expect(res.status).toBe(404);
    });

    test("invalidates cache for every page using the snippet", async () => {
        const { cms, deleteSpy } = makeSystem({
            pagesUsingSnippet: {
                "kept-identifier": [
                    { path: "/a", content: "", title: "", description: "", visible: true, tags: [] },
                    { path: "/b", content: "", title: "", description: "", visible: true, tags: [] },
                ],
            },
        });
        const res = await postSnippet(
            makeRequest({ id: "snip-1" }, { content: "fresh" }),
            cms
        );
        expect(res.status).toBe(200);
        expect(deleteSpy).toContain(P9R_CACHE.page("/a"));
        expect(deleteSpy).toContain(P9R_CACHE.page("/b"));
    });

    test("no cache deletes when no page references the snippet", async () => {
        const { cms, deleteSpy } = makeSystem();
        await postSnippet(
            makeRequest({ id: "snip-1" }, { content: "fresh" }),
            cms
        );
        expect(deleteSpy).toHaveLength(0);
    });
});
