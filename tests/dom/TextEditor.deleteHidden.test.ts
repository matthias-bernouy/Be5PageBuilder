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

function make(attrs: Record<string, string> = {}) {
    const p = document.createElement("p");
    for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
    document.body.appendChild(p);
    const editor = new TextEditor(p);
    (editor as any).viewEditor();
    return { target: p, features: (editor as any)._actionBarFeatures as Map<string, boolean> };
}

describe("TextEditor — delete button hidden by default (backspace-on-empty handles it)", () => {
    beforeEach(() => reset());

    test("default text bloc: delete feature is false", () => {
        const { features } = make();
        expect(features.get("delete")).toBe(false);
    });

    test("p9r-force-delete-button opts back in: delete follows DISABLE_DELETE rule", () => {
        const { features } = make({ "p9r-force-delete-button": "" });
        expect(features.get("delete")).toBe(true);
    });

    test("force flag + DISABLE_DELETE=true: delete stays false", () => {
        const { features } = make({
            "p9r-force-delete-button": "",
            [p9r.attr.ACTION.DISABLE_DELETE]: "true",
        });
        expect(features.get("delete")).toBe(false);
    });
});
