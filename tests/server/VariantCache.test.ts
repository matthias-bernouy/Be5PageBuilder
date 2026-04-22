import { describe, test, expect } from "bun:test";
import { VariantCache } from "src/socle/providers/mongo/Media/VariantCache";

const u8 = (n: number) => new Uint8Array(n);

describe("VariantCache.keyFor", () => {
    test("encodes id, width and height", () => {
        expect(VariantCache.keyFor("abc", 400, 300)).toBe("abc:400:300");
    });

    test("missing dimensions become empty segments", () => {
        expect(VariantCache.keyFor("abc")).toBe("abc::");
        expect(VariantCache.keyFor("abc", 400)).toBe("abc:400:");
        expect(VariantCache.keyFor("abc", undefined, 300)).toBe("abc::300");
    });

    test("prefixFor matches every variant of an id (and only that id)", () => {
        const prefix = VariantCache.prefixFor("abc");
        expect(VariantCache.keyFor("abc", 400, 300).startsWith(prefix)).toBe(true);
        expect(VariantCache.keyFor("abc").startsWith(prefix)).toBe(true);
        // Different id with overlapping prefix must not match.
        expect(VariantCache.keyFor("abcd", 400, 300).startsWith(prefix)).toBe(false);
    });
});

describe("VariantCache get/set", () => {
    test("returns the bytes set under a key", () => {
        const cache = new VariantCache(10, 1_000_000);
        const bytes = u8(123);
        cache.set("k", bytes);
        expect(cache.get("k")).toBe(bytes);
    });

    test("returns undefined for a missing key", () => {
        const cache = new VariantCache(10, 1_000_000);
        expect(cache.get("missing")).toBeUndefined();
    });

    test("set overwrites and updates byte accounting", () => {
        const cache = new VariantCache(10, 1_000_000);
        cache.set("k", u8(100));
        expect(cache.bytesUsed).toBe(100);
        cache.set("k", u8(50));
        expect(cache.bytesUsed).toBe(50);
        expect(cache.size).toBe(1);
    });
});

describe("VariantCache LRU eviction", () => {
    test("evicts oldest entry when count exceeds maxEntries", () => {
        const cache = new VariantCache(2, 1_000_000);
        cache.set("a", u8(1));
        cache.set("b", u8(1));
        cache.set("c", u8(1));
        // "a" is the oldest insert and was never read, so it goes.
        expect(cache.get("a")).toBeUndefined();
        expect(cache.get("b")).toBeDefined();
        expect(cache.get("c")).toBeDefined();
        expect(cache.size).toBe(2);
    });

    test("get bumps recency so the touched entry survives eviction", () => {
        const cache = new VariantCache(2, 1_000_000);
        cache.set("a", u8(1));
        cache.set("b", u8(1));
        // Touch "a" — now "b" becomes the oldest.
        cache.get("a");
        cache.set("c", u8(1));
        expect(cache.get("a")).toBeDefined();
        expect(cache.get("b")).toBeUndefined();
        expect(cache.get("c")).toBeDefined();
    });

    test("evicts by byte budget independently of entry count", () => {
        const cache = new VariantCache(100, 300);
        cache.set("a", u8(100));
        cache.set("b", u8(100));
        cache.set("c", u8(100));
        // All three fit (300 bytes). Adding one more must drop the oldest.
        cache.set("d", u8(100));
        expect(cache.get("a")).toBeUndefined();
        expect(cache.size).toBe(3);
        expect(cache.bytesUsed).toBe(300);
    });

    test("a single entry larger than maxBytes is not stored", () => {
        const cache = new VariantCache(10, 100);
        cache.set("a", u8(50));
        cache.set("huge", u8(500));
        // The oversized entry must not be stored, and must not have evicted
        // the smaller cached one as a side effect of trying.
        expect(cache.get("huge")).toBeUndefined();
        expect(cache.get("a")).toBeDefined();
        expect(cache.bytesUsed).toBe(50);
    });
});

describe("VariantCache invalidatePrefix", () => {
    test("drops every variant of an id and only those", () => {
        const cache = new VariantCache(100, 1_000_000);
        cache.set(VariantCache.keyFor("a", 400, 300), u8(10));
        cache.set(VariantCache.keyFor("a", 800, 600), u8(20));
        cache.set(VariantCache.keyFor("a"), u8(30));
        cache.set(VariantCache.keyFor("b", 400, 300), u8(40));

        cache.invalidatePrefix(VariantCache.prefixFor("a"));

        expect(cache.get(VariantCache.keyFor("a", 400, 300))).toBeUndefined();
        expect(cache.get(VariantCache.keyFor("a", 800, 600))).toBeUndefined();
        expect(cache.get(VariantCache.keyFor("a"))).toBeUndefined();
        expect(cache.get(VariantCache.keyFor("b", 400, 300))).toBeDefined();
        expect(cache.bytesUsed).toBe(40);
    });

    test("is safe when no key matches the prefix", () => {
        const cache = new VariantCache(10, 1_000_000);
        cache.set("kept:1:1", u8(5));
        cache.invalidatePrefix("nothing:");
        expect(cache.bytesUsed).toBe(5);
        expect(cache.size).toBe(1);
    });

    test("an id whose prefix overlaps another id is not falsely matched", () => {
        // `${id}:` in prefixFor exists exactly to prevent "ab" from
        // accidentally invalidating "abc". This pins that contract.
        const cache = new VariantCache(10, 1_000_000);
        cache.set(VariantCache.keyFor("ab", 400, 300), u8(10));
        cache.set(VariantCache.keyFor("abc", 400, 300), u8(20));

        cache.invalidatePrefix(VariantCache.prefixFor("ab"));

        expect(cache.get(VariantCache.keyFor("ab", 400, 300))).toBeUndefined();
        expect(cache.get(VariantCache.keyFor("abc", 400, 300))).toBeDefined();
    });
});

describe("VariantCache clear", () => {
    test("empties the cache and resets accounting", () => {
        const cache = new VariantCache(10, 1_000_000);
        cache.set("a", u8(10));
        cache.set("b", u8(20));
        cache.clear();
        expect(cache.size).toBe(0);
        expect(cache.bytesUsed).toBe(0);
        expect(cache.get("a")).toBeUndefined();
    });
});
