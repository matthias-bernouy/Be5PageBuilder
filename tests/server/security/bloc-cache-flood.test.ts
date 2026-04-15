import { describe, test, expect } from "bun:test";
import BlocServer from "src/endpoints/public/bloc.server";

describe("/bloc does not flood the cache with unknown tags", () => {
    test("unknown tags do not create cache entries", async () => {
        const cacheMap = new Map<string, unknown>();
        const system: any = {
            repository: { getBlocViewJS: async () => null },
            cache: {
                get: (k: string) => cacheMap.get(k) ?? null,
                set: (k: string, v: unknown) => { cacheMap.set(k, v); },
                delete: (k: string) => { cacheMap.delete(k); },
                clear: () => cacheMap.clear(),
            },
        };

        for (let i = 0; i < 50; i++) {
            await BlocServer(new Request(`http://x/bloc?tag=unknown-${i}`), system);
        }

        // None of the unknown tags should have been cached. Cache should
        // either stay empty or at most contain successful lookups.
        expect(cacheMap.size).toBe(0);
    });
});
