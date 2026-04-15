import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/core/Editor/core/Editor";

class BareEditor extends Editor {
    override init() {}
    override restore() {}
}

function resetState() {
    (document as any).compIdentifierToEditor = new Map();
    document.body.querySelectorAll("*").forEach((n) => {
        if ((n as HTMLElement).id !== p9r.id.EDITOR_SYSTEM) n.remove();
    });
}

function nextFrames(count: number): Promise<void> {
    return new Promise((resolve) => {
        const tick = (left: number) => {
            if (left === 0) resolve();
            else requestAnimationFrame(() => tick(left - 1));
        };
        tick(count);
    });
}

describe("Editor removes IS_CREATING after construction", () => {
    beforeEach(() => {
        resetState();
    });

    // Regression: previously the removeAttribute sat inside `if (editor)`, so
    // editors built without a configuration panel (e.g. top-level <p> spawned
    // by TextEditor on Enter) kept p9r-is-creating forever.
    test("is removed when the editor has NO configuration panel", async () => {
        const node = document.createElement("p");
        node.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        document.body.appendChild(node);

        new BareEditor(node, "");
        await nextFrames(3);

        expect(node.hasAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe(false);
    });

    test("is removed when the editor HAS a configuration panel", async () => {
        const node = document.createElement("div");
        node.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        document.body.appendChild(node);

        new BareEditor(node, "", "<p9r-config-panel-item></p9r-config-panel-item>");
        await nextFrames(3);

        expect(node.hasAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe(false);
    });

    test("no element in the document retains IS_CREATING after editors settle", async () => {
        const a = document.createElement("p");
        const b = document.createElement("div");
        const c = document.createElement("section");
        [a, b, c].forEach((n) => {
            n.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
            document.body.appendChild(n);
        });

        new BareEditor(a, "");
        new BareEditor(b, "", "<p9r-config-panel-item></p9r-config-panel-item>");
        new BareEditor(c, "");

        await nextFrames(3);

        const stragglers = document.querySelectorAll(`[${p9r.attr.EDITOR.IS_CREATING}]`);
        expect(stragglers.length).toBe(0);
    });
});
