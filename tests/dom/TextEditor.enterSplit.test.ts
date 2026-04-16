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

function placeCaretAt(el: HTMLElement, offset: number) {
    const textNode = el.firstChild;
    const range = document.createRange();
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        range.setStart(textNode, offset);
        range.collapse(true);
    } else {
        range.selectNodeContents(el);
        range.collapse(true);
    }
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

function makeTarget(text: string) {
    const p = document.createElement("p");
    p.textContent = text;
    document.body.appendChild(p);
    const editor = new TextEditor(p);
    editor.init();
    return p;
}

describe("TextEditor — Enter splits the target at the caret", () => {
    beforeEach(() => reset());

    test("caret in middle: 'Hello World' with caret after 'Hello' → 'Hello' / ' World'", () => {
        const p = makeTarget("Hello World");
        placeCaretAt(p, 5);

        p.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        expect(p.textContent).toBe("Hello");
        const next = p.nextElementSibling as HTMLElement;
        expect(next?.tagName).toBe("P");
        expect(next?.textContent).toBe(" World");
    });

    test("caret at end: new sibling is empty", () => {
        const p = makeTarget("Hello");
        placeCaretAt(p, 5);

        p.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        expect(p.textContent).toBe("Hello");
        const next = p.nextElementSibling as HTMLElement;
        expect(next?.textContent).toBe("");
    });

    test("caret at start: all content moves to new sibling", () => {
        const p = makeTarget("Hello");
        placeCaretAt(p, 0);

        p.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        expect(p.textContent).toBe("");
        const next = p.nextElementSibling as HTMLElement;
        expect(next?.textContent).toBe("Hello");
    });

    test("non-collapsed selection: selected range is dropped, remainder splits", () => {
        const p = makeTarget("Hello World");
        const textNode = p.firstChild!;
        const range = document.createRange();
        range.setStart(textNode, 5);
        range.setEnd(textNode, 6);
        const sel = window.getSelection()!;
        sel.removeAllRanges();
        sel.addRange(range);

        p.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        expect(p.textContent).toBe("Hello");
        const next = p.nextElementSibling as HTMLElement;
        expect(next?.textContent).toBe("World");
    });
});
