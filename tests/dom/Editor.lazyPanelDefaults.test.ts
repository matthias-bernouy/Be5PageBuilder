import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/control/core/editorSystem/Editor/Editor";
import "src/control/components/editor/componentSync/sync/CompSync";
import "src/control/components/editor/componentSync/sync/ImageSync/ImageSync";
import "src/control/components/editor/componentSync/sync/AttrSync";

class BareEditor extends Editor {
    override init() {}
    override restore() {}
}

function reset() {
    (document as any).compIdentifierToEditor = new Map();
    document.body.querySelectorAll("*").forEach((n) => {
        if ((n as HTMLElement).id !== p9r.id.EDITOR_SYSTEM) n.remove();
    });
}

// The lazy-panel optimization parses the editor HTML into a *detached*
// DocumentFragment and only attaches it to the real DOM when the user opens
// the panel. Before this change, syncs ran their slot/attr defaulting from
// connectedCallback — which never fired on a freshly-created bloc until the
// panel was opened. We moved that work into a `prepare()` hook called eagerly
// by Editor._initPanelFragment. These tests pin the contract: defaults must
// be applied on construction *without* the panel ever being opened.
describe("Editor lazy panel — default seeding without opening the panel", () => {
    beforeEach(() => reset());

    test("CompSync seeds a missing slot child with IS_CREATING", () => {
        const target = document.createElement("div");
        (target as any).connectedCallback = () => {};
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-comp-sync>
                <fake-bloc slot="body"></fake-bloc>
            </p9r-comp-sync>
        `;

        new BareEditor(target, "", editorHtml);

        const seeded = target.querySelector(':scope > [slot="body"]');
        expect(seeded).not.toBeNull();
        expect(seeded!.tagName.toLowerCase()).toBe("fake-bloc");
        expect(seeded!.getAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe("true");

        // Panel stayed detached.
        expect((target.ownerDocument!.querySelector("p9r-config-panel"))).toBeNull();
    });

    test("CompSync does NOT overwrite an existing slot child", () => {
        const target = document.createElement("div");
        (target as any).connectedCallback = () => {};
        const existing = document.createElement("fake-bloc");
        existing.setAttribute("slot", "body");
        existing.setAttribute("data-user", "kept");
        target.appendChild(existing);
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-comp-sync>
                <fake-bloc slot="body"></fake-bloc>
            </p9r-comp-sync>
        `;
        new BareEditor(target, "", editorHtml);

        const slots = target.querySelectorAll(':scope > [slot="body"]');
        expect(slots.length).toBe(1);
        expect(slots[0]!.getAttribute("data-user")).toBe("kept");
        expect(slots[0]!.hasAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe(false);
    });

    test("CompSync with `optionnal` + IS_CREATING parent: seeds default", () => {
        const target = document.createElement("div");
        (target as any).connectedCallback = () => {};
        target.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-comp-sync optionnal>
                <fake-bloc slot="body"></fake-bloc>
            </p9r-comp-sync>
        `;
        new BareEditor(target, "", editorHtml);

        const seeded = target.querySelector(':scope > [slot="body"]');
        expect(seeded).not.toBeNull();
    });

    test("CompSync with `optionnal` on a non-creating parent: does NOT seed", () => {
        const target = document.createElement("div");
        (target as any).connectedCallback = () => {};
        // No IS_CREATING — represents a previously-saved bloc where the user
        // deliberately removed the optional slot.
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-comp-sync optionnal>
                <fake-bloc slot="body"></fake-bloc>
            </p9r-comp-sync>
        `;
        new BareEditor(target, "", editorHtml);

        expect(target.querySelector(':scope > [slot="body"]')).toBeNull();
    });

    test("ImageSync seeds a default <img> with the configured src", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-image-sync slotTarget="cover" default="https://placehold.co/800x450"></p9r-image-sync>
        `;
        new BareEditor(target, "", editorHtml);

        const img = target.querySelector('img[slot="cover"]') as HTMLImageElement | null;
        expect(img).not.toBeNull();
        expect(img!.getAttribute("src")).toBe("https://placehold.co/800x450");
    });

    test("ImageSync locks DISABLE_* actions on the seeded <img>", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-image-sync slotTarget="cover" default="https://placehold.co/800x450"></p9r-image-sync>
        `;
        new BareEditor(target, "", editorHtml);

        const img = target.querySelector('img[slot="cover"]')!;
        expect(img.getAttribute(p9r.attr.ACTION.DISABLE_DELETE)).toBe("true");
        expect(img.getAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE)).toBe("true");
        expect(img.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT)).toBe("true");
        expect(img.getAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)).toBe("true");
    });

    test("ImageSync with `optionnal` + no IS_CREATING: does NOT seed", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-image-sync slotTarget="cover" default="https://placehold.co/800x450" optionnal></p9r-image-sync>
        `;
        new BareEditor(target, "", editorHtml);

        expect(target.querySelector('img[slot="cover"]')).toBeNull();
    });

    test("AttrSync seeds defaults from input values onto the component", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-attr-sync>
                <input name="variant" value="primary">
                <input name="size" value="large">
            </p9r-attr-sync>
        `;
        new BareEditor(target, "", editorHtml);

        expect(target.getAttribute("variant")).toBe("primary");
        expect(target.getAttribute("size")).toBe("large");
    });

    test("AttrSync does NOT overwrite pre-existing attributes", () => {
        const target = document.createElement("div");
        target.setAttribute("variant", "ghost");
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-attr-sync>
                <input name="variant" value="primary">
            </p9r-attr-sync>
        `;
        new BareEditor(target, "", editorHtml);

        expect(target.getAttribute("variant")).toBe("ghost");
    });

    test("panel fragment stays detached after construction", () => {
        const target = document.createElement("div");
        (target as any).connectedCallback = () => {};
        document.body.appendChild(target);

        const editorHtml = `
            <p9r-attr-sync>
                <input name="v" value="x">
            </p9r-attr-sync>
            <p9r-comp-sync>
                <fake-bloc slot="body"></fake-bloc>
            </p9r-comp-sync>
        `;
        const editor = new BareEditor(target, "", editorHtml);

        // hasConfigPanel reports true (fragment exists) but _panelConfig is
        // still null and no <p9r-config-panel> is in the document.
        expect(editor.hasConfigPanel).toBe(true);
        expect((editor as any)._panelConfig).toBeNull();
        expect(document.querySelector("p9r-config-panel")).toBeNull();
    });
});
