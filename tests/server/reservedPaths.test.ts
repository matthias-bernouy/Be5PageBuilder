import { describe, test, expect } from "bun:test";
import { isReservedPath } from "src/server/reservedPaths";
import type { PageBuilder } from "src/PageBuilder";

const sys = (prefix?: string) => ({
    config: { adminPathPrefix: prefix },
}) as unknown as PageBuilder;

describe("isReservedPath", () => {
    test("reserves the default admin prefix itself", () => {
        expect(isReservedPath("/page-builder", sys())).toBe(true);
    });

    test("reserves everything under the admin prefix", () => {
        expect(isReservedPath("/page-builder/pages", sys())).toBe(true);
        expect(isReservedPath("/page-builder/api/blocs", sys())).toBe(true);
    });

    test("a path that starts with the prefix as a substring but not as a segment is NOT reserved", () => {
        // "/page-builder-ish" happens to start with the prefix but the guard
        // only accepts `{prefix}/` as the sub-match, so this is actually
        // reserved by the current implementation. Documenting actual behavior:
        expect(isReservedPath("/page-builder-ish", sys())).toBe(false);
    });

    test("honours a custom admin prefix", () => {
        expect(isReservedPath("/cms", sys("/cms"))).toBe(true);
        expect(isReservedPath("/cms/pages", sys("/cms"))).toBe(true);
        expect(isReservedPath("/page-builder", sys("/cms"))).toBe(false);
    });

    test.each([
        ["/bloc"],
        ["/style"],
        ["/media"],
        ["/font"],
        ["/robots.txt"],
        ["/sitemap.xml"],
    ])("reserves %s (framework exact path)", (path) => {
        expect(isReservedPath(path, sys())).toBe(true);
    });

    test("does NOT reserve /bloc/sub (only exact match)", () => {
        expect(isReservedPath("/bloc/foo", sys())).toBe(false);
    });

    test("does NOT reserve ordinary paths", () => {
        expect(isReservedPath("/", sys())).toBe(false);
        expect(isReservedPath("/about", sys())).toBe(false);
        expect(isReservedPath("/bloc-something", sys())).toBe(false);
    });
});
