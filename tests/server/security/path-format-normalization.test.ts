import { describe, test, expect } from "bun:test";
import { isReservedPath } from "src/server/reservedPaths";
import { isValidPathFormat } from "src/utils/validation";

describe("path format & reservation checks", () => {
    test("isValidPathFormat rejects paths with traversal segments", () => {
        expect(isValidPathFormat("/foo/../bar")).toBe(false);
        expect(isValidPathFormat("/a/../../etc")).toBe(false);
    });

    test("isValidPathFormat rejects double slashes", () => {
        expect(isValidPathFormat("//evil")).toBe(false);
        expect(isValidPathFormat("/foo//bar")).toBe(false);
    });

    test("traversal paths that normalize to a reserved prefix are rejected", () => {
        const system: any = { config: { adminPathPrefix: "/cms" } };
        // A path that collapses to /cms must be flagged reserved.
        expect(isReservedPath("/cms/../cms", system)).toBe(true);
        expect(isReservedPath("/foo/../bloc", system)).toBe(true);
    });
});
