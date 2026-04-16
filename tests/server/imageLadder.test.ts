import { describe, test, expect } from "bun:test";
import { LADDER_WIDTHS, LADDER_SET, isLadderDimension } from "src/server/imageLadder";

describe("LADDER_WIDTHS shape", () => {
    test("starts at 300 and ends at 4000", () => {
        expect(LADDER_WIDTHS[0]).toBe(300);
        expect(LADDER_WIDTHS[LADDER_WIDTHS.length - 1]).toBe(4000);
    });

    test("uses a 100px linear step (38 entries)", () => {
        expect(LADDER_WIDTHS).toHaveLength(38);
        for (let i = 1; i < LADDER_WIDTHS.length; i++) {
            expect(LADDER_WIDTHS[i]! - LADDER_WIDTHS[i - 1]!).toBe(100);
        }
    });

    // The whole point of a linear step is that the worst-case overshoot —
    // the gap between a request the browser would naturally pick (anywhere
    // in the supported range) and the next ladder rung — stays bounded by a
    // constant pixel count, not a percentage. A geometric ladder would let
    // overshoot grow to hundreds of px at the high end.
    test("absolute overshoot to next rung is at most 100px across the range", () => {
        for (let i = 1; i < LADDER_WIDTHS.length; i++) {
            const gap = LADDER_WIDTHS[i]! - LADDER_WIDTHS[i - 1]!;
            expect(gap).toBeLessThanOrEqual(100);
        }
    });
});

describe("LADDER_SET / isLadderDimension", () => {
    test("LADDER_SET mirrors LADDER_WIDTHS exactly", () => {
        expect(LADDER_SET.size).toBe(LADDER_WIDTHS.length);
        for (const w of LADDER_WIDTHS) expect(LADDER_SET.has(w)).toBe(true);
    });

    test("rejects values just off the rungs", () => {
        expect(isLadderDimension(299)).toBe(false);
        expect(isLadderDimension(301)).toBe(false);
        expect(isLadderDimension(450)).toBe(false);
        expect(isLadderDimension(4001)).toBe(false);
    });

    test("rejects values outside [300, 4000]", () => {
        expect(isLadderDimension(0)).toBe(false);
        expect(isLadderDimension(100)).toBe(false);
        expect(isLadderDimension(200)).toBe(false);
        expect(isLadderDimension(5000)).toBe(false);
        expect(isLadderDimension(-300)).toBe(false);
    });

    test("accepts every multiple of 100 in [300, 4000]", () => {
        for (let w = 300; w <= 4000; w += 100) {
            expect(isLadderDimension(w)).toBe(true);
        }
    });
});
