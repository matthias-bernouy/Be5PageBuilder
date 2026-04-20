import { describe, test, expect } from "bun:test";
import snippetExists from "src/endpoints/admin-api/snippet-exists.get";
import type { TSnippet } from "src/interfaces/contract/Repository/TModels";

function makeSystem(identifiers: string[]) {
    const system: any = {
        repository: {
            getSnippetByIdentifier: async (identifier: string): Promise<TSnippet | null> => {
                if (!identifiers.includes(identifier)) return null;
                return {
                    identifier,
                    name: "",
                    description: "",
                    category: "",
                    content: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            },
        },
    };
    return system;
}

function makeRequest(query: Record<string, string>): Request {
    const url = new URL("http://localhost/page-builder/api/snippet-exists");
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new Request(url.toString());
}

describe("GET /api/snippet-exists", () => {

    test("returns 400 when `identifier` is missing", async () => {
        const res = await snippetExists(makeRequest({}), makeSystem([]));
        expect(res.status).toBe(400);
    });

    test("returns { exists: true } when a snippet with that identifier exists", async () => {
        const system = makeSystem(["hero-v1"]);
        const res = await snippetExists(makeRequest({ identifier: "hero-v1" }), system);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ exists: true });
    });

    test("returns { exists: false } when no snippet matches", async () => {
        const system = makeSystem(["hero-v1"]);
        const res = await snippetExists(makeRequest({ identifier: "hero-v2" }), system);
        expect(await res.json()).toEqual({ exists: false });
    });

    test("match is case-sensitive", async () => {
        const system = makeSystem(["hero-v1"]);
        const res = await snippetExists(makeRequest({ identifier: "HERO-V1" }), system);
        expect(await res.json()).toEqual({ exists: false });
    });
});
