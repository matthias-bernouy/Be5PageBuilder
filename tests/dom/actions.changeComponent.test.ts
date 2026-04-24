import { describe, test, expect, beforeEach, mock } from "bun:test";

// Stub BlocLibrary before importing actions.ts — the real module pulls in
// Component/shadow-DOM machinery we don't need for this pure-DOM regression.
class FakeLibrary extends EventTarget {}
const fakeLibrary = new FakeLibrary();

mock.module("src/control/editor/components/BlocLibrary/BlocLibrary", () => ({
    BlocLibrary: { open: () => fakeLibrary },
}));

const { openChangeComponentPicker } = await import("src/control/core/editorSystem/components/BlocActionGroup/actions");

function resetState() {
    document.body.querySelectorAll("*").forEach((n) => {
        if ((n as HTMLElement).id !== p9r.id.EDITOR_SYSTEM) n.remove();
    });
}

describe("openChangeComponentPicker — template branch marks IS_CREATING", () => {
    beforeEach(() => resetState());

    test("single-root template fragment: root element gets IS_CREATING", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);
        openChangeComponentPicker(target, () => {});

        fakeLibrary.dispatchEvent(new CustomEvent("insert", {
            detail: { type: "template", html: "<section><p>hi</p></section>" },
        }));

        const section = document.querySelector("section")!;
        expect(section.getAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe("true");
        // Nested children should NOT be marked — only root-level children of
        // the fragment, matching the bloc/snippet branches' behaviour.
        expect(section.querySelector("p")!.hasAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe(false);
    });

    test("multi-root template fragment: every top-level element gets IS_CREATING", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);
        openChangeComponentPicker(target, () => {});

        fakeLibrary.dispatchEvent(new CustomEvent("insert", {
            detail: { type: "template", html: "<h1>A</h1><p>B</p><span>C</span>" },
        }));

        ["h1", "p", "span"].forEach(tag => {
            expect(document.querySelector(tag)!.getAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe("true");
        });
    });

    test("template text-node siblings don't blow up (no attr on text)", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);
        openChangeComponentPicker(target, () => {});

        expect(() => {
            fakeLibrary.dispatchEvent(new CustomEvent("insert", {
                detail: { type: "template", html: "plain text<section></section>" },
            }));
        }).not.toThrow();

        expect(document.querySelector("section")!.getAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe("true");
    });
});
