import { describe, test, expect, beforeEach } from "bun:test";
import { BlocActionGroup } from "src/control/core/editorSystem/components/BlocActionGroup/BlocActionGroup";
import { Editor } from "src/control/core/editorSystem/Editor/Editor";

class BareEditor extends Editor {
    override init() {}
    override restore() {}
}

class AnchoredEditor extends Editor {
    public anchorEl: HTMLElement | null = null;
    override init() {}
    override restore() {}
    override getActionBarAnchor(): HTMLElement | null {
        return this.anchorEl;
    }
}

function makeRect(x: number, y: number, w: number, h: number): DOMRect {
    return {
        x, y, width: w, height: h,
        top: y, left: x, right: x + w, bottom: y + h,
        toJSON: () => ({}),
    } as DOMRect;
}

function stubRect(el: HTMLElement, rect: DOMRect) {
    (el as any).getBoundingClientRect = () => rect;
}

type Spy = { setEditor: number; open: number; close: number };

function reset(): Spy {
    (document as any).compIdentifierToEditor = new Map();
    document.body.innerHTML = "";
    const host = document.createElement("div");
    host.id = p9r.id.EDITOR_SYSTEM;
    document.body.appendChild(host);
    const spy: Spy = { setEditor: 0, open: 0, close: 0 };
    (document as any).EditorManager = {
        getEditorSystemHTMLElement: () => host,
        getBlocActionGroup: () => ({
            close: () => { spy.close++; },
            open: () => { spy.open++; },
            setEditor: () => { spy.setEditor++; },
        }),
    };
    (Editor as any).bodyStyle = new Map();
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return 100; } });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get() { return 40; } });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    return spy;
}

describe("BlocActionGroup — anchor positioning", () => {
    beforeEach(() => reset());

    test("uses target rect by default", () => {
        const el = document.createElement("div");
        const targetRect = makeRect(200, 300, 400, 200);
        stubRect(el, targetRect);
        document.body.appendChild(el);

        const editor = new BareEditor(el, "");
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        bag.open(400, 350);

        expect(bag.style.transform).toContain("260px"); // top - barHeight
    });

    test("editor hook anchor overrides the target rect", () => {
        const el = document.createElement("div");
        stubRect(el, makeRect(0, 0, 800, 600));
        const anchor = document.createElement("div");
        stubRect(anchor, makeRect(500, 400, 100, 30));
        document.body.appendChild(el);

        const editor = new AnchoredEditor(el, "");
        editor.anchorEl = anchor;
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        bag.open(550, 410);

        expect(bag.style.transform).toContain("360px"); // 400 - 40
    });
});

describe("BlocActionGroup — anchor hover binding", () => {

    test("mouseenter on the anchor opens BAG; mouseenter on the target does not", () => {
        const spy = reset();
        const el = document.createElement("div");
        document.body.appendChild(el);
        const anchor = document.createElement("div");
        el.appendChild(anchor);

        const editor = new AnchoredEditor(el, "");
        editor.anchorEl = anchor;
        editor.viewEditor();

        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
        expect(spy.open).toBe(0);

        anchor.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
        expect(spy.open).toBe(1);
        expect(spy.setEditor).toBe(1);
    });

    test("no override: mouseenter on the target opens BAG", () => {
        const spy = reset();
        const el = document.createElement("div");
        document.body.appendChild(el);

        const editor = new BareEditor(el, "");
        editor.viewEditor();

        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
        expect(spy.open).toBe(1);
    });

    test("dispose unbinds: later mouseenter on the old anchor is a no-op", () => {
        const spy = reset();
        const el = document.createElement("div");
        document.body.appendChild(el);
        const anchor = document.createElement("div");
        el.appendChild(anchor);

        const editor = new AnchoredEditor(el, "");
        editor.anchorEl = anchor;
        editor.viewEditor();
        editor.dispose();

        anchor.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
        expect(spy.open).toBe(0);
    });

    test("viewEditor rebinds cleanly when the anchor changes", () => {
        const spy = reset();
        const el = document.createElement("div");
        document.body.appendChild(el);
        const anchorA = document.createElement("div");
        const anchorB = document.createElement("div");
        el.appendChild(anchorA);
        el.appendChild(anchorB);

        const editor = new AnchoredEditor(el, "");
        editor.anchorEl = anchorA;
        editor.viewEditor();

        editor.anchorEl = anchorB;
        editor.viewEditor();

        // Old anchor should no longer fire BAG
        anchorA.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
        expect(spy.open).toBe(0);

        // New anchor should
        anchorB.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
        expect(spy.open).toBe(1);
    });
});
