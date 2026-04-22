import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/control/editor/runtime/Editor";

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

    test("onSwitchMode dispatches viewEditor / viewClient", () => {
        // EditorManager drives mode changes by iterating compIdentifierToEditor
        // and calling onSwitchMode() directly — no per-editor document listener.
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new TrackingEditor(node, "");
        const base = editor.viewClientCalls + editor.viewEditorCalls;

        editor.onSwitchMode(p9r.mode.VIEW);
        expect(editor.viewClientCalls).toBe(1);
        editor.onSwitchMode(p9r.mode.EDITOR);
        expect(editor.viewEditorCalls).toBe(1);
        expect(editor.viewClientCalls + editor.viewEditorCalls).toBe(base + 2);
    });

    test("dispose() removes the editor from compIdentifierToEditor", () => {
        // EditorManager.switchMode() iterates the registry; once an editor is
        // gone from the map, no future mode change can reach it.
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new TrackingEditor(node, "");
        const sizeBefore = document.compIdentifierToEditor!.size;

        editor.dispose();

        expect(document.compIdentifierToEditor!.size).toBe(sizeBefore - 1);
    });

    test("dispose() does not leak across many instances", () => {
        // Regression guard: create N editors, dispose each — the registry
        // must return to its pre-creation size.
        const sizeBefore = document.compIdentifierToEditor!.size;
        const editors: TrackingEditor[] = [];
        for (let i = 0; i < 10; i++) {
            const node = document.createElement("div");
            document.body.appendChild(node);
            editors.push(new TrackingEditor(node, ""));
        }
        editors.forEach((e) => e.dispose());

        expect(document.compIdentifierToEditor!.size).toBe(sizeBefore);
    });
});
