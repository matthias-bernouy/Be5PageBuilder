import { describe, test, expect } from "bun:test";
import getPages from "src/endpoints/admin-api/pages.get";

describe("pages.get encodes identifiers for the URL", () => {
    test("special characters in identifier are URL-encoded", async () => {
        const system: any = {
            repository: {
                getAllPages: async () => [
                    { title: "X", path: "/a", identifier: "a b&c=d", visible: true },
                ],
            },
        };
        const res = await getPages(new Request("http://x"), system);
        const body = await res.json();
        const link = body[0].path as string;

        // Raw unencoded delimiters must not end up in the query string.
        expect(link).not.toContain("identifier=a b&c=d");
        expect(link).toContain(encodeURIComponent("a b&c=d"));
    });
});
