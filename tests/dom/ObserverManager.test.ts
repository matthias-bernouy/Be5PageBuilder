import { describe, test, expect, beforeEach } from "bun:test";
import { ObserverManager } from "src/core/Editor/core/ObserverManager";
import { Editor } from "src/core/Editor/core/Editor";

// A minimal Editor subclass that tracks lifecycle calls without touching the
// heavy editor infrastructure (no styles, no panel, no hover bar).
class FakeEditor extends Editor {
    public static instances: FakeEditor[] = [];
    public disposed = false;
    public initCalls = 0;
    public restoreCalls = 0;

    constructor(node: HTMLElement) {
        super(node, "");
        FakeEditor.instances.push(this);
    }

    override init() { this.initCalls++; }
    override restore() { this.restoreCalls++; }

    override dispose() {
        this.disposed = true;
        super.dispose();
    }
}

function resetGlobalState() {
    FakeEditor.instances = [];
    (document as any).compIdentifierToEditor = new Map();
    // Clear any style elements registered by earlier Editor instances.
    document.querySelectorAll("style").forEach((n) => n.remove());
    // Clear bodyStyle cache so styles re-append across tests.
    (Editor as any).bodyStyle = new Map();
}

async function flushMicrotasks() {
    // MutationObserver deliveries are queued as microtasks.
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    await new Promise<void>((resolve) => queueMicrotask(resolve));
}

function makeObserver(initialHTML = "") {
    const workingElement = document.createElement("div");
    workingElement.innerHTML = initialHTML;
    document.body.appendChild(workingElement);
    const observer = new ObserverManager(workingElement);
    // Register a fake bloc tag the tests will exercise.
    observer.register_editor({
        tag: "fake-bloc",
        label: "fake-bloc",
        cl: FakeEditor as any,
    });
    return { workingElement, observer };
}

describe("ObserverManager", () => {
    beforeEach(() => {
        resetGlobalState();
    });

    test("editorizes matching nodes present at construction", () => {
        const workingElement = document.createElement("div");
        workingElement.innerHTML = `<fake-bloc></fake-bloc><fake-bloc></fake-bloc>`;
        document.body.appendChild(workingElement);
        const observer = new ObserverManager(workingElement);
        observer.register_editor({ tag: "fake-bloc", label: "fake-bloc", cl: FakeEditor as any });
        expect(FakeEditor.instances).toHaveLength(2);
    });

    test("mutation observer picks up dynamically added nodes", async () => {
        const { workingElement } = makeObserver();
        expect(FakeEditor.instances).toHaveLength(0);

        const node = document.createElement("fake-bloc");
        workingElement.appendChild(node);
        await flushMicrotasks();

        expect(FakeEditor.instances).toHaveLength(1);
        expect(FakeEditor.instances[0]?.target).toBe(node);
    });

    test("mutation observer editorizes nested descendants of added subtree", async () => {
        const { workingElement } = makeObserver();

        const wrap = document.createElement("section");
        wrap.innerHTML = `<fake-bloc></fake-bloc><div><fake-bloc></fake-bloc></div>`;
        workingElement.appendChild(wrap);
        await flushMicrotasks();

        expect(FakeEditor.instances).toHaveLength(2);
    });

    test("disposes editors when their node is removed", async () => {
        const { workingElement } = makeObserver(`<fake-bloc></fake-bloc>`);
        const editor = FakeEditor.instances[0]!;
        expect(editor.disposed).toBe(false);

        workingElement.querySelector("fake-bloc")!.remove();
        await flushMicrotasks();

        expect(editor.disposed).toBe(true);
        expect((document as any).compIdentifierToEditor.size).toBe(0);
    });

    test("batch resilience: a removed TextNode does NOT abort processing of added nodes in the same batch", async () => {
        // This is the regression we just fixed: the old code used `return`
        // inside the mutation loop when a removedNode had no `getAttribute`,
        // which aborted the entire batch. With the fix (`continue`), a batch
        // that both removes a text node and adds a fake-bloc should still
        // editorize the new bloc.
        const { workingElement } = makeObserver();
        workingElement.appendChild(document.createTextNode("hello"));
        await flushMicrotasks();
        FakeEditor.instances = []; // ignore anything from the text node

        // Trigger both operations in the same task → same MutationObserver batch.
        workingElement.firstChild!.remove(); // remove text node (no getAttribute)
        workingElement.appendChild(document.createElement("fake-bloc"));
        await flushMicrotasks();

        expect(FakeEditor.instances).toHaveLength(1);
    });

    test("opaque sealing: descendants of an opaque root are not editorized", async () => {
        // Pre-populate with an opaque-bloc containing a fake-bloc descendant.
        const workingElement = document.createElement("div");
        workingElement.innerHTML = `<opaque-bloc><fake-bloc></fake-bloc></opaque-bloc>`;
        document.body.appendChild(workingElement);

        const observer = new ObserverManager(workingElement);
        observer.register_editor({ tag: "fake-bloc", label: "fake-bloc", cl: FakeEditor as any });
        // The inner fake-bloc was editorized before the opaque registration.
        expect(FakeEditor.instances).toHaveLength(1);
        const innerEditor = FakeEditor.instances[0]!;

        observer.register_editor_opaque({
            tag: "opaque-bloc",
            label: "opaque-bloc",
            cl: FakeEditor as any,
        });

        // The opaque root itself gets an editor (parent-level action bar)...
        const opaqueRoot = workingElement.querySelector("opaque-bloc")!;
        expect(opaqueRoot.getAttribute("p9r-opaque")).toBe("true");
        // ...and the previously-editorized descendant is sealed: disposed + removed
        // from the identifier map.
        expect(innerEditor.disposed).toBe(true);
        expect((document as any).compIdentifierToEditor.has(
            innerEditor.target.getAttribute("p9r-comp-id") ?? ""
        )).toBe(false);
    });

    test("opaque sealing: new nodes added inside an opaque subtree are NOT editorized", async () => {
        const { workingElement, observer } = makeObserver();
        observer.register_editor_opaque({
            tag: "opaque-bloc",
            label: "opaque-bloc",
            cl: FakeEditor as any,
        });

        const opaque = document.createElement("opaque-bloc");
        workingElement.appendChild(opaque);
        await flushMicrotasks();

        FakeEditor.instances = []; // ignore the opaque root itself

        const innerBloc = document.createElement("fake-bloc");
        opaque.appendChild(innerBloc);
        await flushMicrotasks();

        expect(FakeEditor.instances).toHaveLength(0);
    });
});
