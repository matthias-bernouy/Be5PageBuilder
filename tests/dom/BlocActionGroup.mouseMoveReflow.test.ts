import { describe, test, expect, beforeEach } from "bun:test";
import { BlocActionGroup } from "src/control/editor/components/BlocActionGroup/BlocActionGroup";
import { Editor } from "src/control/editor/runtime/Editor";

class BareEditor extends Editor {
    override init() {}
    override restore() {}
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

function flushRaf() {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
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
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return 100; } });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get() { return 40; } });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
}

describe("BlocActionGroup — mouse move reflow", () => {
    beforeEach(() => reset());

    test("mousemove on hover anchor updates transform to follow cursor X", async () => {
        const el = document.createElement("div");
        stubRect(el, makeRect(0, 200, 1000, 300));
        document.body.appendChild(el);

        const editor = new BareEditor(el, "");
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        bag.open(100, 250);
        const first = bag.style.transform;

        el.dispatchEvent(new MouseEvent("mousemove", { clientX: 800, clientY: 250, bubbles: false }));
        await flushRaf();

        const second = bag.style.transform;
        expect(second).not.toBe(first);
        // barWidth=100, so x = 800 - 50 = 750; clamped inside rect 0..900
        expect(second).toContain("750px");
    });

    test("mousemove re-decides vAnchor when Y crosses the target center", async () => {
        const el = document.createElement("div");
        // Center Y = 350. Top-anchored when mouseY < 350, bottom when >= 350.
        stubRect(el, makeRect(0, 200, 1000, 300));
        document.body.appendChild(el);

        const editor = new BareEditor(el, "");
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        // Open with cursor near the top half → vAnchor "top" → y = rect.top - barHeight = 160
        bag.open(500, 220);
        expect(bag.style.transform).toContain("160px");

        // Move cursor into the bottom half → vAnchor flips to "bottom" → y = rect.bottom = 500
        el.dispatchEvent(new MouseEvent("mousemove", { clientX: 500, clientY: 480, bubbles: false }));
        await flushRaf();
        expect(bag.style.transform).toContain("500px");
    });

    test("rapid mousemove events are coalesced into a single reflow per frame", async () => {
        const el = document.createElement("div");
        stubRect(el, makeRect(0, 200, 1000, 300));
        document.body.appendChild(el);

        const editor = new BareEditor(el, "");
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        bag.open(100, 250);

        let reflowCalls = 0;
        const orig = (bag as any)._reflow.bind(bag);
        (bag as any)._reflow = () => { reflowCalls++; orig(); };

        for (let i = 0; i < 10; i++) {
            el.dispatchEvent(new MouseEvent("mousemove", { clientX: 100 + i * 50, clientY: 250, bubbles: false }));
        }
        await flushRaf();

        expect(reflowCalls).toBe(1);
    });

    test("close cancels any pending reflow frame", async () => {
        const el = document.createElement("div");
        stubRect(el, makeRect(0, 200, 1000, 300));
        document.body.appendChild(el);

        const editor = new BareEditor(el, "");
        editor.viewEditor();

        const bag = new BlocActionGroup();
        document.body.appendChild(bag);
        bag.setEditor(editor);
        bag.open(100, 250);

        el.dispatchEvent(new MouseEvent("mousemove", { clientX: 700, clientY: 250, bubbles: false }));
        bag.close();

        let reflowCalls = 0;
        const orig = (bag as any)._reflow.bind(bag);
        (bag as any)._reflow = () => { reflowCalls++; orig(); };

        await flushRaf();
        expect(reflowCalls).toBe(0);
    });
});
