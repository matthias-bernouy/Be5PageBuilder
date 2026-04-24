import { describe, test, expect, beforeEach, mock } from "bun:test";

mock.module("src/control/editor/components/BlocLibrary/BlocLibrary", () => ({
    BlocLibrary: { open: () => new EventTarget() },
}));

const { TextEditor } = await import("src/control/core/editorSystem/editors/TextEditor");

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

function dispatchEnterOnActive() {
    const active = document.activeElement as HTMLElement | null;
    if (!active) throw new Error("no active element");
    active.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
}

describe("TextEditor — pressing Enter twice on a <p>", () => {
    beforeEach(() => reset());

    test("two Enters produce three <p> as direct siblings, none nested", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const p = document.createElement("p");
        container.appendChild(p);
        const editor = new TextEditor(p);
        editor.init();
        p.focus();

        dispatchEnterOnActive();
        dispatchEnterOnActive();

        // Three direct <p> children of the container — not two with a nested <p>.
        const directChildren = Array.from(container.children);
        expect(directChildren.length).toBe(3);
        expect(directChildren.every(c => c.tagName === "P")).toBe(true);

        // And no <p> contains another <p> (rules out native contentEditable fallback
        // inserting a paragraph inside the freshly-created sibling).
        const nested = container.querySelector("p p");
        expect(nested).toBeNull();
    });
});
