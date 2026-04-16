import { describe, test, expect } from "bun:test";
import MediaEndpoints from "src/interfaces/default-provider/Media/MediaEndpoints";
import { VariantCache } from "src/interfaces/default-provider/Media/VariantCache";

// 1×1 transparent PNG.
const onePxPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
);

function fakeRunner() {
    const handlers = new Map<string, (req: Request) => Promise<Response>>();
    return {
        handlers,
        get: (p: string, fn: (req: Request) => Promise<Response>) => {
            handlers.set("GET " + p, fn);
        },
    };
}

function makeSystem(opts: {
    cache?: VariantCache;
    onResize?: () => void;
} = {}) {
    const cache = opts.cache ?? new VariantCache(50, 10_000_000);
    let resizeCount = 0;
    return {
        variantCache: cache,
        getItem: async () => ({
            type: "image" as const,
            mimetype: "image/png",
            content: onePxPng,
            label: "x.png",
        }),
        get resizeCount() { return resizeCount; },
        // Sharp is the real thing here — these tests run against the actual
        // resize path because the cache contract is "second call returns
        // bytes equal to the first call without going through sharp again".
        // That guarantee is only meaningful end-to-end.
        // We track invocations indirectly via cache size.
    };
}

function reg(system: any) {
    const r = fakeRunner();
    MediaEndpoints(r as any, system);
    return r.handlers.get("GET /media")!;
}

describe("/media — ladder whitelist", () => {
    test("accepts a ladder width", async () => {
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a&w=400"));
        expect(res.status).toBe(200);
    });

    test("accepts a ladder width + height pair", async () => {
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a&w=800&h=600"));
        expect(res.status).toBe(200);
    });

    test("rejects an off-ladder width with 400", async () => {
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a&w=450"));
        expect(res.status).toBe(400);
    });

    test("rejects the legacy admin width that the migration replaced", async () => {
        // 360 was the old GridMedia thumbnail width. It must now 400 since
        // the migration to ladder values bumped it to 400.
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a&w=360&h=270"));
        expect(res.status).toBe(400);
    });

    test("rejects a width above the cap", async () => {
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a&w=4096"));
        expect(res.status).toBe(400);
    });

    test("rejects a width below the floor", async () => {
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a&w=200"));
        expect(res.status).toBe(400);
    });

    test("no width / height still serves the original bytes", async () => {
        const handler = reg(makeSystem());
        const res = await handler(new Request("http://x/media?id=a"));
        expect(res.status).toBe(200);
    });
});

describe("/media — variant cache wiring", () => {
    test("first request populates the cache; second request hits the same key", async () => {
        const cache = new VariantCache(50, 10_000_000);
        const handler = reg(makeSystem({ cache }));

        const res1 = await handler(new Request("http://x/media?id=a&w=400&h=300"));
        expect(res1.status).toBe(200);
        expect(cache.size).toBe(1);

        const cachedKey = VariantCache.keyFor("a", 400, 300);
        expect(cache.get(cachedKey)).toBeDefined();

        // Second call must reuse the cached bytes (size still 1, no new key).
        const res2 = await handler(new Request("http://x/media?id=a&w=400&h=300"));
        expect(res2.status).toBe(200);
        expect(cache.size).toBe(1);
    });

    test("different (w, h) tuples create different cache entries", async () => {
        const cache = new VariantCache(50, 10_000_000);
        const handler = reg(makeSystem({ cache }));

        await handler(new Request("http://x/media?id=a&w=400&h=300"));
        await handler(new Request("http://x/media?id=a&w=800&h=600"));

        expect(cache.size).toBe(2);
        expect(cache.get(VariantCache.keyFor("a", 400, 300))).toBeDefined();
        expect(cache.get(VariantCache.keyFor("a", 800, 600))).toBeDefined();
    });
});
