import { describe, test, expect, beforeEach } from "bun:test";
import { Editor } from "src/control/core/editorSystem/Editor/Editor";
import { CompSync } from "src/control/components/editor/componentSync/sync/CompSync";

// Exposes the live action-bar feature map populated by `Editor.viewEditor()`.
class SlotEditor extends Editor {
    constructor(node: HTMLElement) { super(node, ""); }
    override init() {}
    override restore() {}
    get features() {
        return (this as any)._actionBarFeatures as Map<string, boolean>;
    }
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

function buildSlotThroughCompSync(compSyncAttrs: string) {
    reset();

    // The "parent component" — needs an EDITOR.IDENTIFIER attribute so the
    // CompSync can find it via querySelector, and an actual `<fake-slot slot="body">`
    // child that the CompSync will manage. We add a no-op `connectedCallback`
    // because CompSync.connectedCallback chain-calls `this._component?.connectedCallback()`.
    const parentId = crypto.randomUUID();
    const parent = document.createElement("div");
    parent.setAttribute(p9r.attr.EDITOR.IDENTIFIER, parentId);
    (parent as any).connectedCallback = () => {};
    document.body.appendChild(parent);

    const slot = document.createElement("fake-slot");
    slot.setAttribute("slot", "body");
    parent.appendChild(slot);

    // Editorize the slot FIRST so CompSync.init() can call its viewEditor().
    const slotEditor = new SlotEditor(slot);

    // Instantiate via `new` because happy-dom's createElement does not always
    // upgrade custom elements synchronously.
    const compSync = new CompSync();
    for (const attr of compSyncAttrs.split(/\s+/).filter(Boolean)) {
        compSync.setAttribute(attr, "");
    }
    const template = document.createElement("fake-slot");
    template.setAttribute("slot", "body");
    compSync.appendChild(template);
    compSync.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
    document.body.appendChild(compSync);

    // `connectedCallback` queues work in rAF; happy-dom runs rAFs in a
    // microtask queue, so we drive it synchronously by calling init() directly
    // against the now-wired-up _component.
    (compSync as any)._component = parent;
    compSync.init();

    return { slot, slotEditor, parent, compSync };
}

describe("CompSync (non-multiple) — action bar state", () => {
    beforeEach(() => reset());

    test("no flags: modify=ON by default, delete=OFF, duplicate=OFF, add=OFF", () => {
        const { slotEditor } = buildSlotThroughCompSync("");
        const f = slotEditor.features;
        expect(f.get("changeComponent")).toBe(true);
        expect(f.get("delete")).toBe(false);
        expect(f.get("duplicate")).toBe(false);
        expect(f.get("addBefore")).toBe(false);
        expect(f.get("addAfter")).toBe(false);
    });

    test("optionnal: delete=ON, modify=ON (still on by default)", () => {
        const { slotEditor } = buildSlotThroughCompSync("optionnal");
        const f = slotEditor.features;
        expect(f.get("delete")).toBe(true);
        expect(f.get("changeComponent")).toBe(true);
        expect(f.get("duplicate")).toBe(false);
    });

    test("disable-others-components: modify=OFF (explicit opt-out)", () => {
        const { slotEditor } = buildSlotThroughCompSync("disable-others-components");
        const f = slotEditor.features;
        expect(f.get("changeComponent")).toBe(false);
        expect(f.get("delete")).toBe(false);
    });

    test("optionnal + disable-others-components: delete=ON, modify=OFF", () => {
        const { slotEditor } = buildSlotThroughCompSync("optionnal disable-others-components");
        const f = slotEditor.features;
        expect(f.get("delete")).toBe(true);
        expect(f.get("changeComponent")).toBe(false);
    });
});

// Regression: an optional (single-slot) comp-sync with its element deleted
// used to be a dead-end — the add button stayed hidden because it was gated
// solely on `isMultiple`. Users had no way to re-add the slot content.
describe("CompSync — add button availability", () => {
    beforeEach(() => reset());

    function addBtnOf(compSync: CompSync) {
        return compSync.shadowRoot!.querySelector("button.add") as HTMLButtonElement;
    }

    function clearSlot(parent: HTMLElement) {
        parent.querySelectorAll(':scope > [slot="body"]').forEach((n) => n.remove());
    }

    test("optionnal + empty: add button is visible and enabled", () => {
        const { compSync, parent } = buildSlotThroughCompSync("optionnal");
        clearSlot(parent);
        compSync.init();
        const btn = addBtnOf(compSync);
        expect(btn.hidden).toBe(false);
        expect(btn.disabled).toBe(false);
    });

    test("optionnal + populated: add button stays hidden (single-slot cap)", () => {
        const { compSync } = buildSlotThroughCompSync("optionnal");
        const btn = addBtnOf(compSync);
        expect(btn.hidden).toBe(true);
    });

    test("non-optionnal non-multiple: add button stays hidden", () => {
        const { compSync, parent } = buildSlotThroughCompSync("");
        clearSlot(parent);
        compSync.init();
        const btn = addBtnOf(compSync);
        expect(btn.hidden).toBe(true);
    });

    test("clicking the add button on an empty optional slot re-inserts the template", () => {
        const { compSync, parent } = buildSlotThroughCompSync("optionnal");
        clearSlot(parent);
        compSync.init();

        addBtnOf(compSync).click();

        const slots = parent.querySelectorAll(':scope > [slot="body"]');
        expect(slots.length).toBe(1);
        expect(slots[0]!.getAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe("true");
    });

    test("allow-multiple below max: add button enabled", () => {
        const { compSync } = buildSlotThroughCompSync("allow-multiple");
        const btn = addBtnOf(compSync);
        expect(btn.hidden).toBe(false);
        expect(btn.disabled).toBe(false);
    });

    // Regression: the incremental `init({added})` branch (hit when
    // onChildrenAdded fires after `_add()` appends a clone) only updated the
    // panel list and count — it never recomputed the add-button state. So an
    // `optionnal` single-slot with `disable-others-components` kept the add
    // button visible/enabled after the user clicked it, even though the slot
    // was now full.
    test("optionnal + disable-others-components: add button hides after incremental add", () => {
        const { compSync, parent } = buildSlotThroughCompSync("optionnal disable-others-components");
        clearSlot(parent);
        compSync.init();

        const btn = addBtnOf(compSync);
        expect(btn.hidden).toBe(false);
        expect(btn.disabled).toBe(false);

        btn.click();
        const added = parent.querySelector(':scope > [slot="body"]') as HTMLElement;
        expect(added).not.toBeNull();

        compSync.init({ added });

        expect(btn.hidden).toBe(true);
    });

    // Same bug, list flavour: reaching `max` via an incremental add should
    // disable the button but did not.
    test("allow-multiple: add button disables when max is reached via incremental add", () => {
        const { compSync, parent } = buildSlotThroughCompSync("allow-multiple");
        compSync.setAttribute("data-max", "2");
        compSync.init();

        const btn = addBtnOf(compSync);
        expect(btn.disabled).toBe(false);

        btn.click();
        const slots = parent.querySelectorAll(':scope > [slot="body"]');
        expect(slots.length).toBe(2);
        compSync.init({ added: slots[1] as HTMLElement });

        expect(btn.disabled).toBe(true);
    });
});
