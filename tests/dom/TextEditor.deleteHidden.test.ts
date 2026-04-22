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

function make(attrs: Record<string, string> = {}) {
    const p = document.createElement("p");
    for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
    document.body.appendChild(p);
    const editor = new TextEditor(p);
    (editor as any).viewEditor();
    return { target: p, features: (editor as any)._actionBarFeatures as Map<string, boolean> };
}

describe("TextEditor — standard action-bar features hidden (keyboard-driven)", () => {
    beforeEach(() => reset());

    test("all standard buttons are hidden by default", () => {
        const { features } = make();
        expect(features.get("delete")).toBe(false);
        expect(features.get("duplicate")).toBe(false);
        expect(features.get("addBefore")).toBe(false);
        expect(features.get("addAfter")).toBe(false);
        expect(features.get("changeComponent")).toBe(false);
    });
});

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

    test("duplicate is hidden by default on text blocs", () => {
        const { features } = make();
        expect(features.get("duplicate")).toBe(false);
    });

    test("p9r-force-duplicate-button opts duplicate back in", () => {
        const { features } = make({ "p9r-force-duplicate-button": "" });
        expect(features.get("duplicate")).toBe(true);
    });

    test("force-duplicate + DISABLE_DUPLICATE stays false", () => {
        const { features } = make({
            "p9r-force-duplicate-button": "",
            [p9r.attr.ACTION.DISABLE_DUPLICATE]: "true",
        });
        expect(features.get("duplicate")).toBe(false);
    });
});
