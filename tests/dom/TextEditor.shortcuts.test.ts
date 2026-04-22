import { describe, test, expect, beforeEach, mock } from "bun:test";

// Stub BlocLibrary before importing TextEditor so "/" doesn't pull in the
// full library UI (shadow DOM, Component base, etc).
const openCalls: number[] = [];
const fakeLibrary = new EventTarget();
mock.module("src/control/editor/components/BlocLibrary/BlocLibrary", () => ({
    BlocLibrary: {
        open: () => {
            openCalls.push(Date.now());
            return fakeLibrary;
        },
    },
}));

const { TextEditor } = await import("src/control/editor/editors/TextEditor");

function reset() {
    openCalls.length = 0;
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

function makeTarget(attrs: Record<string, string> = {}) {
    const p = document.createElement("p");
    for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
    document.body.appendChild(p);
    const editor = new TextEditor(p);
    editor.init();
    return { target: p, editor };
}

describe("TextEditor — Enter respects DISABLE_ADD_AFTER", () => {
    beforeEach(() => reset());

    test("default: Enter inserts a sibling <p>", () => {
        const { target } = makeTarget();
        target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
        expect(target.nextElementSibling?.tagName).toBe("P");
    });

    test("DISABLE_ADD_AFTER=true: Enter does NOT insert a sibling", () => {
        const { target } = makeTarget({ [p9r.attr.ACTION.DISABLE_ADD_AFTER]: "true" });
        target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
        expect(target.nextElementSibling).toBeNull();
    });
});

describe("TextEditor — '/' respects DISABLE_CHANGE_COMPONENT", () => {
    beforeEach(() => reset());

    test("default: typing '/' opens the BlocLibrary", () => {
        const { target } = makeTarget();
        target.innerText = "/";
        target.dispatchEvent(new Event("input", { bubbles: true }));
        expect(openCalls.length).toBe(1);
    });

    test("DISABLE_CHANGE_COMPONENT=true: typing '/' does NOT open the library", () => {
        const { target } = makeTarget({ [p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT]: "true" });
        target.innerText = "/";
        target.dispatchEvent(new Event("input", { bubbles: true }));
        expect(openCalls.length).toBe(0);
    });
});
