import { describe, test, expect, beforeEach } from "bun:test";
import { BlocActionGroup } from "src/core/Editor/components/BlocActionGroup/BlocActionGroup";
import { Editor } from "src/core/Editor/core/Editor";

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

describe("BlocActionGroup — empty bar must not open", () => {
    beforeEach(() => reset());

    test("setEditor on an all-disabled editor clears target so open() is a no-op", () => {
        const el = document.createElement("div");
        el.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
        el.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
        el.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
        el.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
        el.setAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT, "true");
        document.body.appendChild(el);
        const editor = new BareEditor(el, "");
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        bag.open(10, 10);

        expect(bag.style.visibility).not.toBe("visible");
    });
});
