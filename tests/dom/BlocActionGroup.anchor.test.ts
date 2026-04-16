import { describe, test, expect } from "bun:test";
import { resolveActionBarAnchor } from "src/core/Editor/components/BlocActionGroup/anchor";

function makeRect(x: number, y: number, w: number, h: number): DOMRect {
    return {
        x, y, width: w, height: h,
        top: y, left: x, right: x + w, bottom: y + h,
        toJSON: () => ({}),
    } as DOMRect;
}

function stubRect(el: HTMLElement, rect: DOMRect) {
    (el as any).getBoundingClientRect = () => rect;
}

describe("resolveActionBarAnchor", () => {

    test("defaults to the target when no editor hook", () => {
        const target = document.createElement("div");
        const rect = makeRect(10, 20, 100, 50);
        stubRect(target, rect);

        const { rect: resolved, element } = resolveActionBarAnchor(target);

        expect(resolved).toBe(rect);
        expect(element).toBe(target);
    });

    test("uses the element returned by the editor hook", () => {
        const target = document.createElement("div");
        stubRect(target, makeRect(0, 0, 500, 500));
        const inner = document.createElement("div");
        const innerRect = makeRect(40, 40, 80, 20);
        stubRect(inner, innerRect);

        const editor = { getActionBarAnchor: () => inner };

        const { rect, element } = resolveActionBarAnchor(target, editor);

        expect(rect).toBe(innerRect);
        expect(element).toBe(inner);
    });

    test("editor hook returning null falls back to target", () => {
        const target = document.createElement("div");
        const targetRect = makeRect(0, 0, 500, 500);
        stubRect(target, targetRect);

        const editor = { getActionBarAnchor: () => null };

        const { rect, element } = resolveActionBarAnchor(target, editor);

        expect(rect).toBe(targetRect);
        expect(element).toBe(target);
    });

    test("editor without getActionBarAnchor uses target", () => {
        const target = document.createElement("div");
        const targetRect = makeRect(5, 5, 50, 50);
        stubRect(target, targetRect);

        const editor = {} as any;

        const { rect, element } = resolveActionBarAnchor(target, editor);

        expect(rect).toBe(targetRect);
        expect(element).toBe(target);
    });

    test("hook is called fresh every invocation (dynamic anchor)", () => {
        const target = document.createElement("div");
        stubRect(target, makeRect(0, 0, 100, 100));

        const elA = document.createElement("div");
        const rectA = makeRect(1, 1, 10, 10);
        stubRect(elA, rectA);
        const elB = document.createElement("div");
        const rectB = makeRect(2, 2, 20, 20);
        stubRect(elB, rectB);

        let call = 0;
        const editor = {
            getActionBarAnchor: () => (++call === 1 ? elA : elB),
        };

        expect(resolveActionBarAnchor(target, editor).element).toBe(elA);
        expect(resolveActionBarAnchor(target, editor).element).toBe(elB);
    });
});
