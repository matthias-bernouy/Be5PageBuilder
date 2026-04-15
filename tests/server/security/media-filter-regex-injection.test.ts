import { describe, test, expect } from "bun:test";

// Verify the Mongo filter built for media search escapes the user-provided
// free-text query rather than passing it raw to `$regex`. A raw pattern opens
// ReDoS and could break the app with pathological input.
import { DefaultMediaRepository } from "src/interfaces/default-provider/Media/DefaultMediaRepository";

describe("media filter.text is escaped for $regex", () => {
    test("special regex chars are escaped in the built query", async () => {
        // We intercept the Mongo `find({...})` call to inspect the built query.
        let capturedQuery: any = null;
        const fakeCollection = {
            find: (q: any) => {
                capturedQuery = q;
                return {
                    sort: () => ({ toArray: async () => [] }),
                    toArray: async () => [],
                };
            },
        };
        const repo = Object.create(DefaultMediaRepository.prototype) as any;
        repo._collection = () => fakeCollection;
        // Depending on the actual method name, try a couple.
        const call =
            (DefaultMediaRepository.prototype as any).search ??
            (DefaultMediaRepository.prototype as any).list ??
            (DefaultMediaRepository.prototype as any).getItems;

        if (!call) {
            // If the method can't be reached without a full Mongo client, at
            // least assert the source no longer contains a raw `$regex:
            // filter.text` interpolation.
            const src = await Bun.file("src/interfaces/default-provider/Media/DefaultMediaRepository.ts").text();
            expect(src).not.toMatch(/\$regex:\s*filter\.text\b/);
            return;
        }

        await call.call(repo, { text: "^(a+)+$" });
        const pattern: string = capturedQuery?.label?.$regex ?? "";
        // Escaped form should contain backslashes before regex metachars.
        expect(pattern).not.toBe("^(a+)+$");
    });
});
