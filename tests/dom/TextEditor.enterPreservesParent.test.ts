import { describe, test, expect, beforeEach, mock } from "bun:test";

mock.module("src/control/editor/components/BlocLibrary/BlocLibrary", () => ({
    BlocLibrary: { open: () => new EventTarget() },
}));

const { TextEditor } = await import("src/control/editor/editors/TextEditor");

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

describe("TextEditor — Enter preserves parent-identifier on the new sibling", () => {
    beforeEach(() => reset());

    test("new element inherits parent-identifier so CompSync can re-apply slot attrs", () => {
        const parent = document.createElement("section");
        document.body.appendChild(parent);

        const p = document.createElement("p");
        p.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, "parent-id-123");
        parent.appendChild(p);
        const editor = new TextEditor(p);
        (editor as any).viewEditor();

        p.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        const next = p.nextElementSibling as HTMLElement;
        expect(next).not.toBeNull();
        expect(next.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)).toBe("parent-id-123");
    });
});
