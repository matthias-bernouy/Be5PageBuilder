import { describe, test, expect } from "bun:test";
import { LADDER_WIDTHS, LADDER_SET, isLadderDimension } from "src/server/imageOptimization/imageLadder";

const ICON_RUNGS = [16, 32, 64, 128] as const;

describe("LADDER_WIDTHS shape", () => {
    test("starts at 16 (icon tier) and ends at 4000 (content cap)", () => {
        expect(LADDER_WIDTHS[0]).toBe(16);
        expect(LADDER_WIDTHS[LADDER_WIDTHS.length - 1]).toBe(4000);
    });

    test("icon tier is exactly 16/32/64/128", () => {
        expect(LADDER_WIDTHS.slice(0, ICON_RUNGS.length)).toEqual([...ICON_RUNGS]);
    });

    test("content tier is 300→4000 in 100px steps (38 entries)", () => {
        const contentTier = LADDER_WIDTHS.slice(ICON_RUNGS.length);
        expect(contentTier).toHaveLength(38);
        expect(contentTier[0]).toBe(300);
        expect(contentTier[contentTier.length - 1]).toBe(4000);
        for (let i = 1; i < contentTier.length; i++) {
            expect(contentTier[i]! - contentTier[i - 1]!).toBe(100);
        }
    });

    // The whole point of the linear step in the content tier is that the
    // worst-case overshoot — the gap between a request the browser would
    // naturally pick (anywhere in the supported range) and the next ladder
    // rung — stays bounded by a constant pixel count, not a percentage. A
    // geometric ladder would let overshoot grow to hundreds of px at the
    // high end. The icon tier is doubling-cadence on purpose: byte cost is
    // negligible and a 100px step would drown the whole tier.
    test("content-tier overshoot to next rung is at most 100px", () => {
        const contentTier = LADDER_WIDTHS.slice(ICON_RUNGS.length);
        for (let i = 1; i < contentTier.length; i++) {
            const gap = contentTier[i]! - contentTier[i - 1]!;
            expect(gap).toBeLessThanOrEqual(100);
        }
    });
});

describe("LADDER_SET / isLadderDimension", () => {
    test("LADDER_SET mirrors LADDER_WIDTHS exactly", () => {
        expect(LADDER_SET.size).toBe(LADDER_WIDTHS.length);
        for (const w of LADDER_WIDTHS) expect(LADDER_SET.has(w)).toBe(true);
    });

    test("accepts every icon rung", () => {
        for (const w of ICON_RUNGS) expect(isLadderDimension(w)).toBe(true);
    });

    test("rejects values just off the rungs", () => {
        expect(isLadderDimension(17)).toBe(false);
        expect(isLadderDimension(299)).toBe(false);
        expect(isLadderDimension(301)).toBe(false);
        expect(isLadderDimension(450)).toBe(false);
        expect(isLadderDimension(4001)).toBe(false);
    });

    test("rejects values in the icon↔content gap (129…299)", () => {
        expect(isLadderDimension(129)).toBe(false);
        expect(isLadderDimension(200)).toBe(false);
        expect(isLadderDimension(256)).toBe(false);
        expect(isLadderDimension(299)).toBe(false);
    });

    test("rejects values outside [16, 4000]", () => {
        expect(isLadderDimension(0)).toBe(false);
        expect(isLadderDimension(15)).toBe(false);
        expect(isLadderDimension(5000)).toBe(false);
        expect(isLadderDimension(-300)).toBe(false);
    });

    test("accepts every multiple of 100 in [300, 4000]", () => {
        for (let w = 300; w <= 4000; w += 100) {
            expect(isLadderDimension(w)).toBe(true);
        }
    });
});
