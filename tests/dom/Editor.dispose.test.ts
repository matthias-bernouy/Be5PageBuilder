import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/core/Editor/core/Editor";

class TrackingEditor extends Editor {
    public viewEditorCalls = 0;
    public viewClientCalls = 0;

    override init() {}
    override restore() {}

    override viewEditor() {
        this.viewEditorCalls++;
        super.viewEditor();
    }

    override viewClient() {
        this.viewClientCalls++;
        super.viewClient();
    }
}

function resetState() {
    (document as any).compIdentifierToEditor = new Map();
    document.querySelectorAll("style").forEach((n) => n.remove());
    (Editor as any).bodyStyle = new Map();
}

describe("Editor lifecycle (dispose leak fix)", () => {
    beforeEach(() => {
        resetState();
    });

    test("SWITCH_MODE listener is active after construction", () => {
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new TrackingEditor(node, "");
        const base = editor.viewClientCalls + editor.viewEditorCalls;

        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, { detail: p9r.mode.VIEW }));
        expect(editor.viewClientCalls).toBe(1);
        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, { detail: p9r.mode.EDITOR }));
        expect(editor.viewEditorCalls).toBe(1);
        // Sanity: both handlers ran exactly once past the baseline.
        expect(editor.viewClientCalls + editor.viewEditorCalls).toBe(base + 2);
    });

    test("dispose() removes the SWITCH_MODE listener — subsequent dispatches are ignored", () => {
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new TrackingEditor(node, "");

        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, { detail: p9r.mode.VIEW }));
        const viewClientBefore = editor.viewClientCalls;

        editor.dispose();

        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, { detail: p9r.mode.VIEW }));
        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, { detail: p9r.mode.EDITOR }));

        expect(editor.viewClientCalls).toBe(viewClientBefore);
    });

    test("dispose() does not leak across many instances", () => {
        // Regression guard: create N editors, dispose each, then dispatch a
        // single SWITCH_MODE — nothing should fire. Before the fix, all N
        // listeners would still be attached and all N editors would respond.
        const editors: TrackingEditor[] = [];
        for (let i = 0; i < 10; i++) {
            const node = document.createElement("div");
            document.body.appendChild(node);
            editors.push(new TrackingEditor(node, ""));
        }
        editors.forEach((e) => e.dispose());

        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, { detail: p9r.mode.VIEW }));

        for (const e of editors) {
            expect(e.viewClientCalls).toBe(0);
        }
    });
});
