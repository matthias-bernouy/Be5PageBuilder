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

function buildScene(opts: { disableAll?: boolean; noParent?: boolean }) {
    reset();
    let parentId = "";
    if (!opts.noParent) {
        const parent = document.createElement("div");
        document.body.appendChild(parent);
        new BareEditor(parent, "");
        parentId = parent.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!;
    }

    const child = document.createElement("div");
    if (parentId) child.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
    if (opts.disableAll) {
        child.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
        child.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
        child.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
        child.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
        child.setAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT, "true");
    }
    document.body.appendChild(child);
    const childEditor = new BareEditor(child, "");
    childEditor.viewEditor();

    const bag = new BlocActionGroup();
    (bag as any)._editor = childEditor;
    (bag as any)._target = child;
    document.body.appendChild(bag);
    (bag as any).smartRender();
    return { bag };
}

describe("BlocActionGroup — select-parent visibility", () => {
    beforeEach(() => reset());

    test("has parent + at least one button → select-parent shown", () => {
        const { bag } = buildScene({ disableAll: false });
        expect(bag.querySelector('[data-action="select-parent"]')).not.toBeNull();
    });

    test("has parent + no button → select-parent hidden", () => {
        const { bag } = buildScene({ disableAll: true });
        expect(bag.querySelector('[data-action="select-parent"]')).toBeNull();
    });

    test("no parent + has button → select-parent hidden", () => {
        const { bag } = buildScene({ disableAll: false, noParent: true });
        expect(bag.querySelector('[data-action="select-parent"]')).toBeNull();
    });
});
