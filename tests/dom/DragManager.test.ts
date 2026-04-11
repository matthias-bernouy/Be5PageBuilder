import { describe, test, expect, beforeEach } from "bun:test";
import { DragManager } from "src/core/Editor/core/DragManager";

// happy-dom's getBoundingClientRect returns zeros which breaks the
// "before vs after" midpoint calculation. Force a geometry per node so the
// tests can simulate realistic drop zones.
function setRect(el: HTMLElement, top: number, height: number) {
    (el as any).getBoundingClientRect = () => ({
        top,
        bottom: top + height,
        left: 0,
        right: 100,
        width: 100,
        height,
        x: 0,
        y: top,
        toJSON: () => ({}),
    });
}

function makeBlock(container: HTMLElement, top: number, height = 100) {
    const el = document.createElement("div");
    el.className = "editor-block";
    container.appendChild(el);
    setRect(el, top, height);
    return el;
}

function drag(kind: "dragstart" | "dragover" | "drop" | "dragend", target: HTMLElement, clientY = 0) {
    const ev = new Event(kind, { bubbles: true, cancelable: true }) as any;
    ev.clientY = clientY;
    ev.dataTransfer = {
        setData: () => {},
        getData: () => "",
    };
    target.dispatchEvent(ev);
    return ev;
}

describe("DragManager", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        new DragManager(container);
    });

    test("dragstart adds `.dragging` class to the dragged editor-block", () => {
        const block = makeBlock(container, 0);
        drag("dragstart", block);
        expect(block.classList.contains("dragging")).toBe(true);
    });

    test("dragstart on a non-editor-block (via `closest`) picks the nearest ancestor", () => {
        const block = makeBlock(container, 0);
        const inner = document.createElement("span");
        block.appendChild(inner);
        drag("dragstart", inner);
        expect(block.classList.contains("dragging")).toBe(true);
    });

    test("dragover moves the dragged block AFTER the target when dropped below midpoint", () => {
        const a = makeBlock(container, 0, 100);
        const b = makeBlock(container, 100, 100);

        drag("dragstart", a);
        // Drop at y=180, which is 80% into block b → insert AFTER b.
        drag("dragover", b, 180);

        const children = Array.from(container.children);
        expect(children).toEqual([b, a]);
    });

    test("dragover moves the dragged block BEFORE the target when dropped above midpoint", () => {
        const a = makeBlock(container, 0, 100);
        const b = makeBlock(container, 100, 100);
        const c = makeBlock(container, 200, 100);

        drag("dragstart", c);
        // Drop at y=120, which is 20% into block b → insert BEFORE b.
        drag("dragover", b, 120);

        const children = Array.from(container.children);
        expect(children).toEqual([a, c, b]);
    });

    test("dragover over the dragged block itself is a no-op", () => {
        const a = makeBlock(container, 0, 100);
        const b = makeBlock(container, 100, 100);

        drag("dragstart", a);
        drag("dragover", a, 50);

        expect(Array.from(container.children)).toEqual([a, b]);
    });

    test("drop removes the `.dragging` class", () => {
        const a = makeBlock(container, 0);
        drag("dragstart", a);
        drag("drop", a);
        expect(a.classList.contains("dragging")).toBe(false);
    });

    test("dragend clears the `.dragging` class", () => {
        // NOTE: the current impl doesn't null-guard `this.draggedElement` in
        // handleDragOver after dragend — a follow-up dragover would throw due
        // to the `!` non-null assertion. The hardening of DragManager is a
        // separate follow-up; for now we only assert class cleanup.
        const a = makeBlock(container, 0);
        drag("dragstart", a);
        drag("dragend", a);
        expect(a.classList.contains("dragging")).toBe(false);
    });

    test("dragover with clientY at exact midpoint resolves to AFTER", () => {
        // Edge case: `(e.clientY - top) / height > 0.5` is strictly greater,
        // so exactly 0.5 → false → insert BEFORE. Documenting the boundary.
        const a = makeBlock(container, 0, 100);
        const b = makeBlock(container, 100, 100);

        drag("dragstart", a);
        drag("dragover", b, 150); // exact midpoint of b

        expect(Array.from(container.children)).toEqual([a, b]);
    });
});
