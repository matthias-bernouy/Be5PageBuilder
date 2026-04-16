import { describe, test, expect, beforeEach, mock } from "bun:test";

mock.module("src/core/Editor/components/BlocLibrary/BlocLibrary", () => ({
    BlocLibrary: { open: () => new EventTarget() },
}));

const { TextEditor } = await import("src/core/Editor/editors/TextEditor");

function reset() {
    (document as any).compIdentifierToEditor = new Map();
    document.body.innerHTML = "";
    const host = document.createElement("div");
    host.id = p9r.id.EDITOR_SYSTEM;
    document.body.appendChild(host);
    (document as any).EditorManager = {
        getEditorSystemHTMLElement: () => host,
        getBlocActionGroup: () => ({ close: () => {}, open: () => {}, setEditor: () => {} }),
        getMode: () => p9r.mode.EDITOR,
    };
}

// happy-dom's Range rect APIs return zeroed rects. Stub them to simulate a
// caret positioned on the first/last visual line of the element.
function stubCaretAt(el: HTMLElement, edge: "top" | "bottom") {
    const bounds = { top: 10, bottom: 30, left: 0, right: 100, width: 100, height: 20, x: 0, y: 10 };
    el.getBoundingClientRect = () => bounds as DOMRect;
    const line = edge === "top"
        ? { top: 10, bottom: 20, left: 0, right: 10, width: 10, height: 10, x: 0, y: 10 }
        : { top: 20, bottom: 30, left: 0, right: 10, width: 10, height: 10, x: 0, y: 20 };
    const origGetRange = Range.prototype.getClientRects;
    Range.prototype.getClientRects = function () {
        return [line] as unknown as DOMRectList;
    };
    return () => { Range.prototype.getClientRects = origGetRange; };
}

function placeCaretIn(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

function makeEditors(tags: string[]) {
    const editors: { target: HTMLElement }[] = [];
    for (const tag of tags) {
        const el = document.createElement(tag);
        el.textContent = "x";
        document.body.appendChild(el);
        const editor = new TextEditor(el);
        editor.init();
        editors.push({ target: el });
    }
    return editors;
}

describe("TextEditor — ArrowUp/ArrowDown cross-bloc navigation", () => {
    beforeEach(() => reset());

    test("ArrowDown on last line jumps to next text editor", () => {
        const [a, b] = makeEditors(["p", "p"]);
        placeCaretIn(a!.target);
        const restore = stubCaretAt(a!.target, "bottom");

        a!.target.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(b!.target);
        restore();
    });

    test("ArrowUp on first line jumps to previous text editor", () => {
        const [a, b] = makeEditors(["p", "p"]);
        placeCaretIn(b!.target);
        const restore = stubCaretAt(b!.target, "top");

        b!.target.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(a!.target);
        restore();
    });

    test("ArrowDown on last editor does nothing (no wrap, no crash)", () => {
        const [a] = makeEditors(["p"]);
        placeCaretIn(a!.target);
        const restore = stubCaretAt(a!.target, "bottom");
        a!.target.focus();

        const ev = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
        a!.target.dispatchEvent(ev);

        expect(document.activeElement).toBe(a!.target);
        expect(ev.defaultPrevented).toBe(false);
        restore();
    });

    test("ArrowUp with shiftKey is ignored (native selection preserved)", () => {
        const [a, b] = makeEditors(["p", "p"]);
        placeCaretIn(b!.target);
        b!.target.focus();
        const restore = stubCaretAt(b!.target, "top");

        const ev = new KeyboardEvent("keydown", { key: "ArrowUp", shiftKey: true, bubbles: true, cancelable: true });
        b!.target.dispatchEvent(ev);

        expect(document.activeElement).toBe(b!.target);
        expect(ev.defaultPrevented).toBe(false);
        restore();
    });

    test("navigation crosses heterogeneous text tags (p → h2)", () => {
        const [a, b] = makeEditors(["p", "h2"]);
        placeCaretIn(a!.target);
        const restore = stubCaretAt(a!.target, "bottom");

        a!.target.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));

        expect(document.activeElement).toBe(b!.target);
        restore();
    });

    test("empty element is always edge on both sides", () => {
        const [a, b, c] = makeEditors(["p", "p", "p"]);
        b!.target.textContent = "";
        placeCaretIn(b!.target);
        b!.target.focus();

        b!.target.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(a!.target);

        placeCaretIn(b!.target);
        b!.target.focus();
        b!.target.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
        expect(document.activeElement).toBe(c!.target);
    });
});
