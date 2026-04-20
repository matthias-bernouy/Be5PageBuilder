import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/core/Editor/runtime/Editor";

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
    };
    (Editor as any).bodyStyle = new Map();
}

describe("Editor.viewEditor — draggable attribute reflects DISABLE_DRAGGING", () => {
    beforeEach(() => reset());

    test("no DISABLE_DRAGGING: element is draggable", () => {
        const el = document.createElement("div");
        document.body.appendChild(el);
        const editor = new BareEditor(el, "");
        editor.viewEditor();
        expect(el.draggable).toBe(true);
    });

    test("DISABLE_DRAGGING=true: draggable=\"false\" (not just removed)", () => {
        // Removing the attribute resets to "auto", which still permits drag
        // on contenteditable text. Only an explicit "false" actually locks it.
        const el = document.createElement("p");
        el.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
        document.body.appendChild(el);
        const editor = new BareEditor(el, "");
        editor.viewEditor();
        expect(el.getAttribute("draggable")).toBe("false");
    });
});
