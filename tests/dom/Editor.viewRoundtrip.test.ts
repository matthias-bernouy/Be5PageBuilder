import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/core/Editor/runtime/Editor";

class BareEditor extends Editor {
    override init() {}
    override restore() {}
}

function resetState() {
    (document as any).compIdentifierToEditor = new Map();
    document.body.querySelectorAll("*").forEach((n) => {
        if ((n as HTMLElement).id !== p9r.id.EDITOR_SYSTEM) n.remove();
    });
    (Editor as any).bodyStyle = new Map();
}

// `viewClient()` is the contract the public site relies on: once the user
// switches back to view mode, no editor-only state should remain on the
// rendered DOM (otherwise the saved HTML pollutes production with `p9r-*`
// attributes, the `editor-block` class, draggable, and an inline
// `pointer-events: auto`). These tests pin that contract.
describe("Editor — viewEditor / viewClient roundtrip", () => {
    beforeEach(() => resetState());

    test("viewEditor sets the editor markers on the target", () => {
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new BareEditor(node, "");

        editor.viewEditor();

        expect(node.getAttribute(p9r.attr.EDITOR.IS_EDITOR)).toBe("true");
        expect(node.classList.contains("editor-block")).toBe(true);
        expect(node.getAttribute(p9r.attr.EDITOR.IDENTIFIER)).not.toBeNull();
        expect(node.style.getPropertyValue("pointer-events")).toBe("auto");
        expect(node.draggable).toBe(true);
    });

    test("viewClient strips every editor marker added by viewEditor", () => {
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new BareEditor(node, "");

        editor.viewEditor();
        editor.viewClient();

        // No editor lifecycle attribute should survive into client view.
        expect(node.hasAttribute(p9r.attr.EDITOR.IS_EDITOR)).toBe(false);
        expect(node.hasAttribute(p9r.attr.EDITOR.IDENTIFIER)).toBe(false);
        expect(node.hasAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)).toBe(false);
        expect(node.classList.contains("editor-block")).toBe(false);
        expect(node.hasAttribute("draggable")).toBe(false);
        // Empty `style=""` and `class=""` get cleaned up too.
        expect(node.hasAttribute("style")).toBe(false);
        expect(node.hasAttribute("class")).toBe(false);
    });

    test("viewClient strips every DISABLE_* action attribute viewEditor may have set", () => {
        const node = document.createElement("div");
        // Pre-set a couple of disable flags as a bloc would, to assert they're
        // wiped by viewClient regardless of who set them.
        node.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
        node.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
        node.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
        node.setAttribute(p9r.attr.ACTION.INLINE_ADDING, "true");
        node.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
        node.setAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT, "true");
        document.body.appendChild(node);
        const editor = new BareEditor(node, "");

        editor.viewEditor();
        editor.viewClient();

        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_DELETE)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.INLINE_ADDING)).toBe(false);
        expect(node.hasAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE)).toBe(false);
        expect(node.hasAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT)).toBe(false);
    });

    test("viewClient preserves user-provided attributes outside the editor namespace", () => {
        const node = document.createElement("div");
        node.setAttribute("data-user", "kept");
        node.setAttribute("aria-label", "Hero");
        node.classList.add("user-class");
        document.body.appendChild(node);
        const editor = new BareEditor(node, "");

        editor.viewEditor();
        editor.viewClient();

        expect(node.getAttribute("data-user")).toBe("kept");
        expect(node.getAttribute("aria-label")).toBe("Hero");
        expect(node.classList.contains("user-class")).toBe(true);
    });

    test("repeated viewEditor → viewClient cycles converge to the same client DOM", () => {
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new BareEditor(node, "");

        // Reach a known client-view baseline.
        editor.viewEditor();
        editor.viewClient();
        const baseline = node.outerHTML;

        for (let i = 0; i < 5; i++) {
            editor.viewEditor();
            editor.viewClient();
        }

        expect(node.outerHTML).toBe(baseline);
    });

    test("viewClient with DISABLE_DRAGGING set leaves no draggable=false residue", () => {
        const node = document.createElement("div");
        node.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
        document.body.appendChild(node);
        const editor = new BareEditor(node, "");

        // viewEditor branches on DISABLE_DRAGGING and writes draggable="false"
        // explicitly (default would be "auto"). viewClient must remove both.
        editor.viewEditor();
        expect(node.getAttribute("draggable")).toBe("false");

        editor.viewClient();
        expect(node.hasAttribute("draggable")).toBe(false);
    });

    test("viewEditor → viewClient releases the shared body stylesheet (light DOM)", () => {
        const node = document.createElement("div");
        document.body.appendChild(node);
        const editor = new BareEditor(node, ".marker { color: red; }");

        editor.viewEditor();
        const styleAttached = Array.from(document.body.querySelectorAll("style"))
            .some((s) => s.textContent?.includes(".marker"));
        expect(styleAttached).toBe(true);

        editor.viewClient();
        const styleStillAttached = Array.from(document.body.querySelectorAll("style"))
            .some((s) => s.textContent?.includes(".marker"));
        expect(styleStillAttached).toBe(false);
    });
});
