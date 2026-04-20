import { describe, test, expect } from "bun:test";
import { computeSrcset, type Measurement } from "src/server/imageOptimization/computeSrcset";
import { LADDER_WIDTHS } from "src/server/imageOptimization/imageLadder";

const m = (viewport: number, cssWidth: number): Measurement => ({ viewport, cssWidth });

describe("computeSrcset — empty / degenerate inputs", () => {
    test("no measurements → empty result", () => {
        const r = computeSrcset([], 1000);
        expect(r.widths).toEqual([]);
        expect(r.sizes).toBe("");
    });

    test("all measurements at 0 width → empty result", () => {
        const r = computeSrcset([m(320, 0), m(1920, 0)], 1000);
        expect(r.widths).toEqual([]);
        expect(r.sizes).toBe("");
    });

    test("naturalWidth of 0 → empty result (we can't serve anything sized)", () => {
        const r = computeSrcset([m(320, 100)], 0);
        expect(r.widths).toEqual([]);
        expect(r.sizes).toBe("");
    });
});

describe("computeSrcset — width snapping", () => {
    test("snaps each (cssWidth × DPR) to the next ladder rung up", () => {
        // 350 cssW → effective 350, 700, 1050 px → ladder 400, 700, 1100
        const r = computeSrcset([m(1024, 350)], 4000);
        expect(r.widths).toEqual([400, 700, 1100]);
    });

    test("requests above naturalWidth fall back to the largest serveable rung", () => {
        // cssW 1000 × DPR 3 = 3000 effective, but source is only 1500 →
        // largest ladder rung ≤ 1500 is 1500 itself (it's a multiple of 100).
        const r = computeSrcset([m(1920, 1000)], 1500);
        // DPR 1 → 1000 → snap to 1000 (≤ 1500, kept).
        // DPR 2 → 2000 → snap to 2000 → cap at 1500.
        // DPR 3 → 3000 → snap to 3000 → cap at 1500.
        expect(r.widths).toEqual([1000, 1500]);
    });

    test("a naturalWidth that lies between rungs caps at the rung below", () => {
        // Source is 950 — largest ladder rung ≤ 950 is 900.
        const r = computeSrcset([m(1920, 800)], 950);
        // DPR 1 → 800 → snap 800 → ≤ 950 ✓
        // DPR 2 → 1600 → cap 900
        // DPR 3 → 2400 → cap 900
        expect(r.widths).toEqual([800, 900]);
    });

    test("never produces a width above the ladder cap (4000)", () => {
        const cap = LADDER_WIDTHS[LADDER_WIDTHS.length - 1]!;
        const r = computeSrcset([m(3840, 3500)], 100_000);
        for (const w of r.widths) expect(w).toBeLessThanOrEqual(cap);
    });
});

describe("computeSrcset — sizes attribute composition", () => {
    test("emits one entry per viewport, descending, fallback last (no media query)", () => {
        const r = computeSrcset(
            [m(320, 100), m(768, 200), m(1920, 400)],
            4000,
        );
        // Highest viewport first, smallest as bare fallback.
        expect(r.sizes).toBe("(min-width: 1920px) 400px, (min-width: 768px) 200px, 100px");
    });

    test("collapses adjacent entries with identical widths (the higher viewport wins)", () => {
        // Both 768 and 1920 render at 400px → the 1920 entry covers them
        // both; the 768 entry is dropped.
        const r = computeSrcset(
            [m(320, 100), m(768, 400), m(1920, 400)],
            4000,
        );
        expect(r.sizes).toBe("(min-width: 1920px) 400px, 100px");
    });

    test("caps each per-viewport width at naturalWidth", () => {
        const r = computeSrcset([m(320, 200), m(1920, 800)], 500);
        // 800 capped to 500.
        expect(r.sizes).toBe("(min-width: 1920px) 500px, 200px");
    });

    test("sub-pixel widths are ceiled (199.4 → 200)", () => {
        const r = computeSrcset([m(320, 199.4)], 4000);
        // Effective 200, 400, 600 → snapped to 200? No, 200 isn't on the
        // ladder (floor is 300). So 200 → 300, 400 → 400, 600 → 600.
        expect(r.widths).toEqual([300, 400, 600]);
        expect(r.sizes).toBe("200px");
    });
});

describe("computeSrcset — single-viewport shortcut", () => {
    test("a single visible viewport produces a single sizes entry", () => {
        const r = computeSrcset([m(1024, 500)], 4000);
        expect(r.sizes).toBe("500px");
    });
});
