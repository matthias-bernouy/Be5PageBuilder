import { describe, test, expect, beforeEach, mock } from "bun:test";

mock.module("src/control/editor/components/BlocLibrary/BlocLibrary", () => ({
    BlocLibrary: { open: () => new EventTarget() },
}));

const { TextEditor } = await import("src/control/core/editorSystem/editors/TextEditor");
const { BlocActionGroup } = await import("src/control/core/editorSystem/components/BlocActionGroup/BlocActionGroup");
const { Editor } = await import("@bernouy/cms/editor");

class BareEditor extends Editor {
    override init() {}
    override restore() {}
}

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
    (Editor as any).bodyStyle = new Map();
}

describe("TextEditor — Backspace-empty must not cascade to parent BAG", () => {
    beforeEach(() => reset());

    test("backspace on empty text deletes only the text, even when BAG is on parent", () => {
        const parent = document.createElement("div");
        document.body.appendChild(parent);
        const parentEditor = new BareEditor(parent, "");
        parentEditor.viewEditor();

        const span = document.createElement("span");
        parent.appendChild(span);
        const textEditor = new TextEditor(span);
        (textEditor as any).viewEditor();

        const bag = new BlocActionGroup();
        (bag as any)._editor = parentEditor;
        (bag as any)._target = parent;
        document.body.appendChild(bag);
        (bag as any).addEventListeners();

        span.innerHTML = "";
        const ev = new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true });
        span.dispatchEvent(ev);

        expect(span.isConnected).toBe(false);
        expect(parent.isConnected).toBe(true);
    });
});
