import { describe, test, expect, beforeEach } from "bun:test";
import { BlocActionGroup } from "src/core/Editor/components/BlocActionGroup/BlocActionGroup";
import { Editor } from "src/core/Editor/core/Editor";

class BareEditor extends Editor {
    override init() {}
    override restore() {}
}

/** Labels keyed by tag name, plugged into the EditorManager mock so the
 *  breadcrumb can look them up via the public getLabel() API. */
function installEditorManager(labels: Record<string, string>) {
    const host = document.createElement("div");
    host.id = p9r.id.EDITOR_SYSTEM;
    document.body.appendChild(host);
    (document as any).EditorManager = {
        getEditorSystemHTMLElement: () => host,
        getBlocActionGroup: () => ({ close: () => {}, open: () => {}, setEditor: () => {} }),
        getObserver: () => ({
            getLabel: (tag: string) => labels[tag],
        }),
    };
}

function reset(labels: Record<string, string> = {}) {
    (document as any).compIdentifierToEditor = new Map();
    document.body.innerHTML = "";
    installEditorManager(labels);
    (Editor as any).bodyStyle = new Map();
}

/** Builds a chain of editors of the given tags, where the last tag is the
 *  "current" element the BAG is attached to, and returns the mounted BAG.
 *  Tags are passed root → leaf. */
function buildChain(tags: string[], labels: Record<string, string>): {
    bag: BlocActionGroup;
    editors: BareEditor[];
} {
    reset(labels);
    const editors: BareEditor[] = [];
    let parent: HTMLElement | null = null;
    for (const tag of tags) {
        const el = document.createElement(tag);
        if (parent) {
            el.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parent.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!);
        }
        document.body.appendChild(el);
        const ed = new BareEditor(el, "");
        ed.viewEditor();
        editors.push(ed);
        parent = el;
    }
    const leaf = editors[editors.length - 1]!;
    const bag = new BlocActionGroup();
    document.body.appendChild(bag);
    bag.setEditor(leaf);
    (bag as any)._updateMeta();
    return { bag, editors };
}

function metaEl(bag: BlocActionGroup): HTMLElement {
    return bag.shadowRoot!.querySelector(".p9r-bag-meta") as HTMLElement;
}

function itemLabels(bag: BlocActionGroup): string[] {
    return Array.from(metaEl(bag).children)
        .filter(el => !el.classList.contains("p9r-bag-meta__sep"))
        .map(el => el.textContent?.trim() ?? "");
}

describe("BlocActionGroup — breadcrumb rendering", () => {

    test("renders labels from the observer registry, not the raw tag names", () => {
        const { bag } = buildChain(
            ["section", "my-card", "a"],
            { section: "Section", "my-card": "Card", a: "Link" },
        );
        expect(itemLabels(bag)).toEqual(["Section", "Card", "Link"]);
    });

    test("current item (last) is an accent span, ancestors are clickable buttons", () => {
        const { bag } = buildChain(
            ["section", "a"],
            { section: "Section", a: "Link" },
        );
        const items = Array.from(metaEl(bag).children).filter(
            el => !el.classList.contains("p9r-bag-meta__sep"),
        );
        expect(items[0]!.tagName.toLowerCase()).toBe("button");
        expect(items[0]!.className).toBe("p9r-bag-meta__parent");
        expect(items[items.length - 1]!.tagName.toLowerCase()).toBe("span");
        expect(items[items.length - 1]!.className).toBe("p9r-bag-meta__current");
    });

    test("ancestors without a registered label are skipped", () => {
        const { bag } = buildChain(
            ["section", "unknown-wrapper", "a"],
            // No "unknown-wrapper" label → should drop out of the breadcrumb
            { section: "Section", a: "Link" },
        );
        expect(itemLabels(bag)).toEqual(["Section", "Link"]);
    });

    test("chain of 5 renders all 5 (no ellipsis)", () => {
        const { bag } = buildChain(
            ["section", "div", "my-card", "span", "a"],
            { section: "Section", div: "Div", "my-card": "Card", span: "Span", a: "Link" },
        );
        expect(itemLabels(bag)).toEqual(["Section", "Div", "Card", "Span", "Link"]);
        expect(metaEl(bag).querySelector(".p9r-bag-meta__ellipsis")).toBeNull();
    });

    test("chain of 7 collapses the middle to an ellipsis (root + last 3 + current)", () => {
        // Chain: Section › Div › Card › List › Nav › Span › Link
        // Max 5 visible: root, …, last 3 → Section, …, Nav, Span, Link
        const { bag } = buildChain(
            ["section", "div", "my-card", "ul", "nav", "span", "a"],
            {
                section: "Section", div: "Div", "my-card": "Card",
                ul: "List", nav: "Nav", span: "Span", a: "Link",
            },
        );
        const labels = itemLabels(bag);
        expect(labels).toEqual(["Section", "…", "Nav", "Span", "Link"]);
        expect(metaEl(bag).querySelector(".p9r-bag-meta__ellipsis")).not.toBeNull();
    });

    test("breadcrumb clears when BAG setEditor yields no current target", () => {
        const { bag, editors } = buildChain(
            ["section", "a"],
            { section: "Section", a: "Link" },
        );
        expect(metaEl(bag).children.length).toBeGreaterThan(0);
        // Simulate detach — close() clears target. Re-invoking _updateMeta
        // with a null target should empty the meta element.
        bag.close();
        (bag as any)._target = null;
        (bag as any)._editor = null;
        (bag as any)._updateMeta();
        expect(metaEl(bag).children.length).toBe(0);
        expect(editors.length).toBe(2); // fixture sanity
    });

    test("ancestor without any visible ancestor in the chain produces an empty breadcrumb", () => {
        // Current element has no parent — chain = [current]. With its label
        // it still renders (single current item). Without a label → empty.
        const { bag } = buildChain(["div"], {});
        expect(metaEl(bag).children.length).toBe(0);
    });

    test("ancestor item button carries an event listener that switches BAG target", () => {
        const { bag, editors } = buildChain(
            ["section", "a"],
            { section: "Section", a: "Link" },
        );
        const rootEditor = editors[0]!;
        const btn = metaEl(bag).querySelector(".p9r-bag-meta__parent") as HTMLButtonElement;
        expect(btn).not.toBeNull();

        // Clicking must switch the BAG to the ancestor editor. We drive this
        // via setEditor being called on the bag; the real method freezes
        // transform, but here we just check that the click handler runs.
        btn.click();
        expect((bag as any)._editor).toBe(rootEditor);
        expect((bag as any)._target).toBe(rootEditor.target);
    });

    test("hovering an ancestor item toggles .p9r-breadcrumb-hover on its target", () => {
        const { bag, editors } = buildChain(
            ["section", "a"],
            { section: "Section", a: "Link" },
        );
        const rootTarget = editors[0]!.target;
        const btn = metaEl(bag).querySelector(".p9r-bag-meta__parent") as HTMLButtonElement;

        btn.dispatchEvent(new Event("mouseenter"));
        expect(rootTarget.classList.contains("p9r-breadcrumb-hover")).toBe(true);

        btn.dispatchEvent(new Event("mouseleave"));
        expect(rootTarget.classList.contains("p9r-breadcrumb-hover")).toBe(false);
    });

    test("close() clears any lingering .p9r-breadcrumb-hover on ancestors", () => {
        const { bag, editors } = buildChain(
            ["section", "a"],
            { section: "Section", a: "Link" },
        );
        const rootTarget = editors[0]!.target;
        // Simulate a mouseenter that never got its matching leave (BAG closed
        // while hovering an item).
        rootTarget.classList.add("p9r-breadcrumb-hover");
        bag.close();
        expect(rootTarget.classList.contains("p9r-breadcrumb-hover")).toBe(false);
    });
});
