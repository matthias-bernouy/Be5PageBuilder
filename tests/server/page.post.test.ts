import { describe, test, expect } from "bun:test";
import updatePage from "src/endpoints/admin-api/page.post";
import { InMemoryCache } from "src/providers/memory/Cache/InMemoryCache";
import { P9R_CACHE } from "types/p9r-constants";
import type { TPage, TSystem } from "src/contracts/Repository/TModels";

type CreatePageCall = { page: TPage; oldKey?: { path: string; identifier: string } };

function makeSystem(opts: {
    adminPathPrefix?: string;
} = {}) {
    const createPageCalls: CreatePageCall[] = [];
    const registeredRoutes: string[] = [];
    const cache = new InMemoryCache();
    const deleteSpy: string[] = [];
    const originalDelete = cache.delete.bind(cache);
    cache.delete = (key: string) => {
        deleteSpy.push(key);
        originalDelete(key);
    };

    const system: any = {
        config: { adminPathPrefix: opts.adminPathPrefix ?? "/page-builder" },
        cache,
        repository: {
            createPage: async (page: TPage, oldKey?: { path: string; identifier: string }) => {
                createPageCalls.push({ page, oldKey });
                return page;
            },
            getSystem: async (): Promise<TSystem> => ({
                initializationStep: 0,
                site: {
                    name: "Test",
                    favicon: "",
                    visible: true,
                    host: "",
                    language: "",
                    theme: "",
                    notFound: null,
                    serverError: null,
                },
                editor: { layoutCategory: "" },
            }),
        },
        registerPageRoute: (path: string) => { registeredRoutes.push(path); },
        imageOptimizer: { enqueuePageOptimization: () => {} },
    };

    return { system, createPageCalls, registeredRoutes, deleteSpy };
}

function makeRequest(query: Record<string, string>, body: Partial<TPage> & { identifier?: string }) {
    const url = new URL("http://localhost/page-builder/api/page");
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new Request(url.toString(), {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}

const fullBody = (over: Partial<TPage> = {}): Partial<TPage> => ({
    content: "<p>hi</p>",
    description: "d",
    path: "/about",
    visible: true,
    title: "About",
    tags: [],
    identifier: "",
    ...over,
});

describe("page.post", () => {
    test("400 when query ?path is missing", async () => {
        const { system } = makeSystem();
        const res = await updatePage(makeRequest({}, fullBody()), system);
        expect(res.status).toBe(400);
    });

    test("400 when body is missing required keys", async () => {
        const { system } = makeSystem();
        const req = makeRequest({ path: "/about" }, { path: "/about" });
        const res = await updatePage(req, system);
        expect(res.status).toBe(400);
    });

    test("400 when new path has invalid format", async () => {
        const { system } = makeSystem();
        const req = makeRequest({ path: "/about" }, fullBody({ path: "about" }));
        const res = await updatePage(req, system);
        expect(res.status).toBe(400);
        expect(await res.text()).toContain("Invalid path format");
    });

    test("400 when new path is reserved (admin prefix)", async () => {
        const { system } = makeSystem();
        const req = makeRequest({ path: "/about" }, fullBody({ path: "/page-builder/foo" }));
        const res = await updatePage(req, system);
        expect(res.status).toBe(400);
        expect(await res.text()).toContain("reserved");
    });

    test("400 when new path is an exact reserved path", async () => {
        const { system } = makeSystem();
        const req = makeRequest({ path: "/about" }, fullBody({ path: "/bloc" }));
        const res = await updatePage(req, system);
        expect(res.status).toBe(400);
    });

    test("happy path: creates page, registers route, returns 200", async () => {
        const { system, createPageCalls, registeredRoutes } = makeSystem();
        const req = makeRequest({ path: "/about" }, fullBody());
        const res = await updatePage(req, system);
        expect(res.status).toBe(200);
        expect(createPageCalls).toHaveLength(1);
        expect(createPageCalls[0]?.page.path).toBe("/about");
        expect(registeredRoutes).toContain("/about");
    });

    test("rename: passes oldKey from query params to createPage", async () => {
        const { system, createPageCalls } = makeSystem();
        const req = makeRequest(
            { path: "/old-path", identifier: "v1" },
            fullBody({ path: "/new-path", identifier: "v2" })
        );
        const res = await updatePage(req, system);
        expect(res.status).toBe(200);
        expect(createPageCalls[0]?.oldKey).toEqual({ path: "/old-path", identifier: "v1" });
        expect(createPageCalls[0]?.page.path).toBe("/new-path");
        expect(createPageCalls[0]?.page.identifier).toBe("v2");
    });

    test("rename: invalidates cache for both old and new (path, identifier)", async () => {
        const { system, deleteSpy } = makeSystem();
        const req = makeRequest(
            { path: "/old", identifier: "a" },
            fullBody({ path: "/new", identifier: "b" })
        );
        await updatePage(req, system);
        expect(deleteSpy).toContain(P9R_CACHE.page("/old", "a"));
        expect(deleteSpy).toContain(P9R_CACHE.page("/new", "b"));
    });
});
