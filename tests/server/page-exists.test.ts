import { describe, test, expect } from "bun:test";
import pageExists from "src/endpoints/admin-api/page-exists.get";
import type { TPage } from "src/contracts/Repository/TModels";

function makeSystem(pages: Array<{ path: string; identifier: string }>, adminPathPrefix = "/page-builder") {
    const system: any = {
        config: { adminPathPrefix },
        repository: {
            getPage: async (path: string, identifier: string): Promise<TPage | null> => {
                const match = pages.find(p => p.path === path && p.identifier === identifier);
                if (!match) return null;
                return {
                    path: match.path,
                    identifier: match.identifier,
                    title: "",
                    description: "",
                    content: "",
                    visible: true,
                    tags: [],
                };
            },
        },
    };
    return system;
}

function makeRequest(query: Record<string, string>): Request {
    const url = new URL("http://localhost/page-builder/api/page-exists");
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new Request(url.toString());
}

describe("GET /api/page-exists", () => {

    test("returns 400 when `path` is missing", async () => {
        const res = await pageExists(makeRequest({}), makeSystem([]));
        expect(res.status).toBe(400);
    });

    test("returns { exists: true, reason: 'taken' } when an existing page matches", async () => {
        const system = makeSystem([{ path: "/article", identifier: "" }]);
        const res = await pageExists(makeRequest({ path: "/article" }), system);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ exists: true, reason: "taken" });
    });

    test("returns { exists: false } when no page matches", async () => {
        const system = makeSystem([{ path: "/other", identifier: "" }]);
        const res = await pageExists(makeRequest({ path: "/article" }), system);
        expect(await res.json()).toEqual({ exists: false });
    });

    test("treats missing `identifier` as empty string", async () => {
        const system = makeSystem([{ path: "/article", identifier: "" }]);
        const res = await pageExists(makeRequest({ path: "/article" }), system);
        expect(await res.json()).toEqual({ exists: true, reason: "taken" });
    });

    test("matches on (path, identifier) tuple — same path, different identifier is NOT a match", async () => {
        const system = makeSystem([{ path: "/article", identifier: "v1" }]);
        const res = await pageExists(
            makeRequest({ path: "/article", identifier: "v2" }),
            system,
        );
        expect(await res.json()).toEqual({ exists: false });
    });

    test("flags a path reserved by the framework as { exists: true, reason: 'reserved' }", async () => {
        const system = makeSystem([]);
        const res = await pageExists(makeRequest({ path: "/bloc" }), system);
        expect(await res.json()).toEqual({ exists: true, reason: "reserved" });
    });

    test("flags a path under the admin prefix as reserved", async () => {
        const system = makeSystem([]);
        const res = await pageExists(makeRequest({ path: "/page-builder/anything" }), system);
        expect(await res.json()).toEqual({ exists: true, reason: "reserved" });
    });

    test("reserved-path check honours a custom admin prefix", async () => {
        const system = makeSystem([], "/cms");
        const res = await pageExists(makeRequest({ path: "/cms" }), system);
        expect(await res.json()).toEqual({ exists: true, reason: "reserved" });
    });

    test("self-match takes precedence over reserved (grandfathered path)", async () => {
        const system = makeSystem([]);
        const res = await pageExists(
            makeRequest({
                path: "/bloc",
                "current-path": "/bloc",
            }),
            system,
        );
        expect(await res.json()).toEqual({ exists: false });
    });

    test("ignores the collision when it is the page editing itself", async () => {
        const system = makeSystem([{ path: "/article", identifier: "" }]);
        const res = await pageExists(
            makeRequest({
                path: "/article",
                identifier: "",
                "current-path": "/article",
                "current-identifier": "",
            }),
            system,
        );
        expect(await res.json()).toEqual({ exists: false });
    });

    test("still flags the collision when current-path differs from the candidate", async () => {
        const system = makeSystem([{ path: "/article", identifier: "" }]);
        // User renamed from /old to /article — /article is occupied by someone else.
        const res = await pageExists(
            makeRequest({
                path: "/article",
                "current-path": "/old",
            }),
            system,
        );
        expect(await res.json()).toEqual({ exists: true, reason: "taken" });
    });

    test("self-match check distinguishes by identifier, not just path", async () => {
        const system = makeSystem([{ path: "/article", identifier: "v2" }]);
        // Editing v1 on /article, renaming to v2 which already exists.
        const res = await pageExists(
            makeRequest({
                path: "/article",
                identifier: "v2",
                "current-path": "/article",
                "current-identifier": "v1",
            }),
            system,
        );
        expect(await res.json()).toEqual({ exists: true, reason: "taken" });
    });
});
