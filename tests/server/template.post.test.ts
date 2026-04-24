import { describe, test, expect } from "bun:test";
import postTemplate from "src/control/api/template/template.post";
import type { TTemplate } from "src/socle/contracts/Repository/TModels";

type CreateCall = { template: TTemplate };
type UpdateCall = { id: string; data: Partial<TTemplate> };

function makeSystem(opts: {
    existingTemplate?: TTemplate | null;
} = {}) {
    const createCalls: CreateCall[] = [];
    const updateCalls: UpdateCall[] = [];
    const cms: any = {
        repository: {
            createTemplate: async (template: TTemplate) => {
                createCalls.push({ template });
                return { ...template, id: "generated-id" };
            },
            updateTemplate: async (id: string, data: Partial<TTemplate>) => {
                updateCalls.push({ id, data });
                if (opts.existingTemplate === null) return null;
                return { ...(opts.existingTemplate ?? {} as TTemplate), ...data, id };
            },
        },
    };
    return { cms, createCalls, updateCalls };
}

function makeRequest(query: Record<string, string>, body: Partial<TTemplate>) {
    const url = new URL("http://localhost/cms/api/template");
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new Request(url.toString(), {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}

describe("template.post", () => {
    test("400 when creating without name", async () => {
        const { cms, createCalls } = makeSystem();
        const res = await postTemplate(makeRequest({}, { content: "c" }), cms);
        expect(res.status).toBe(400);
        expect(createCalls).toHaveLength(0);
    });

    test("400 when creating without content", async () => {
        const { cms } = makeSystem();
        const res = await postTemplate(makeRequest({}, { name: "n" }), cms);
        expect(res.status).toBe(400);
    });

    test("201 on successful create with default description / category", async () => {
        const { cms, createCalls } = makeSystem();
        const res = await postTemplate(
            makeRequest({}, { name: "Card", content: "<div/>" }),
            cms
        );
        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.id).toBe("generated-id");
        expect(createCalls[0]?.template.name).toBe("Card");
        expect(createCalls[0]?.template.description).toBe("");
        expect(createCalls[0]?.template.category).toBe("");
        expect(createCalls[0]?.template.createdAt).toBeInstanceOf(Date);
    });

    test("update path: calls updateTemplate when ?id is set", async () => {
        const { cms, updateCalls, createCalls } = makeSystem({
            existingTemplate: {
                name: "old",
                description: "",
                content: "",
                category: "",
                createdAt: new Date(),
            },
        });
        const res = await postTemplate(
            makeRequest({ id: "tpl-1" }, { name: "new" }),
            cms
        );
        expect(res.status).toBe(200);
        expect(updateCalls).toHaveLength(1);
        expect(updateCalls[0]?.id).toBe("tpl-1");
        expect(updateCalls[0]?.data.name).toBe("new");
        expect(createCalls).toHaveLength(0);
    });

    test("update path: 404 when template does not exist", async () => {
        const { cms } = makeSystem({ existingTemplate: null });
        const res = await postTemplate(
            makeRequest({ id: "missing" }, { name: "new" }),
            cms
        );
        expect(res.status).toBe(404);
    });

    test("update path: does NOT run create-time validation", async () => {
        // Update must be allowed even when the partial body omits name/content.
        const { cms, updateCalls } = makeSystem({
            existingTemplate: {
                name: "old",
                description: "",
                content: "",
                category: "",
                createdAt: new Date(),
            },
        });
        const res = await postTemplate(
            makeRequest({ id: "tpl-1" }, { description: "just a touch" }),
            cms
        );
        expect(res.status).toBe(200);
        expect(updateCalls[0]?.data.description).toBe("just a touch");
    });
});
