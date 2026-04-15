import { ConfigPanel } from "../configuration/ConfigPanel";
import type { StateSync } from "../configuration/Sync/StateSync";
import { PinMode } from "./PinMode";

export type CustomAction = {
    action: string;
    title: string;
    icon: string;
    handler: () => void;
};

export abstract class Editor {

    private targetIdentifier: string;
    public target: HTMLElement;
    private styleElement: HTMLStyleElement;
    // Shared per-tag stylesheet + refcount. Each light-DOM editor of a tag
    // holds one ref; the shared <style> is appended on the first ref and
    // removed on the last. Previously this was a boolean flag keyed by tag,
    // which meant (a) disposing the first editor yanked the style element
    // that every sibling still relied on, and (b) viewClient deleted the
    // map entry even when other editors of the same tag were still active.
    private static bodyStyle: Map<string, { el: HTMLStyleElement, count: number }> = new Map();
    private _holdsBodyStyle = false;
    public _panelConfig: ConfigPanel | null = null;
    public variant: string = "default";
    public customActions: CustomAction[] = [];
    public stateSyncs: StateSync[] = [];
    private _pinMode: PinMode;
    protected _actionBarFeatures: Map<string, boolean> = new Map([
        ["delete", true],
        ["duplicate", true],
        ["addBefore", false],
        ["addAfter", false],
        ["changeComponent", false],
        ["saveAsTemplate", false]
    ]);

    constructor(target: HTMLElement, styles: string, editor?: string) {
        this.target = target;
        this.styleElement = document.createElement("style");
        this.styleElement.innerHTML = styles;

        this.targetIdentifier = crypto.randomUUID();
        this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier);

        if (!document.compIdentifierToEditor) document.compIdentifierToEditor = new Map();
        if (document.compIdentifierToEditor.has(this.targetIdentifier)) {
            throw new Error("Critial Random Error: UUID duplication for " + this.target);
        }

        document.compIdentifierToEditor.set(this.targetIdentifier, this);

        this._pinMode = new PinMode(this.target, this.stateSyncs, () => {
            this.stateSyncs.forEach(s => s.unpin());
            this.notifyPinStateChanged();
        });

        if (editor) {
            this._panelConfig = document.createElement("p9r-config-panel") as ConfigPanel;
            this._panelConfig.innerHTML += editor;
            this._setPanelItemIdentifiers();
            document.EditorManager.getEditorSystemHTMLElement().append(this._panelConfig)
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.target.removeAttribute(p9r.attr.EDITOR.IS_CREATING);
            });
        });

        if (document.EditorManager?.getBlocActionGroup()) {
            document.EditorManager.getBlocActionGroup().close();
        }
    }

    /**
     * Called by EditorManager on every mode change. Replaces the per-editor
     * `document.addEventListener(SWITCH_MODE, ...)` we used to attach — see
     * EditorManager.registerEditor for the rationale. Subclasses override to
     * add their own mode-dependent work (e.g. TextEditor toggles a
     * MutationObserver); always call super to keep the view swap.
     */
    public onSwitchMode(mode: string) {
        if (mode === p9r.mode.EDITOR) this.viewEditor();
        else this.viewClient();
    }

    private _setPanelItemIdentifiers(): void {
        if (!this._panelConfig) return;
        const panelItems = this._panelConfig.querySelectorAll('*') as unknown as any[];
        panelItems.forEach((item) => {
            item.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.targetIdentifier);
        });
    }

    private handleHover = (e: MouseEvent) => {
        document.EditorManager.getBlocActionGroup().setEditor(this);
        document.EditorManager.getBlocActionGroup().open(e.clientX, e.clientY);
    }

    public refreshActionBarFeatures() {
        this._actionBarFeatures.set("delete", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DELETE) !== "true");
        this._actionBarFeatures.set("duplicate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE) !== "true");
        this._actionBarFeatures.set("addBefore", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE) !== "true");
        this._actionBarFeatures.set("addAfter", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER) !== "true");
        this._actionBarFeatures.set("changeComponent", this.target.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT) !== "true");
        this._actionBarFeatures.set("saveAsTemplate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE) !== "true");
    }

    public registerStateSync(sync: StateSync) {
        if (!this.stateSyncs.includes(sync)) this.stateSyncs.push(sync);
    }

    public unregisterStateSync(sync: StateSync) {
        const i = this.stateSyncs.indexOf(sync);
        if (i >= 0) this.stateSyncs.splice(i, 1);
    }

    public onEditorPinState?(pinned: boolean, stateSync?: StateSync): void;

    /**
     * Called by the action bar after toggling a <p9r-state-sync>. While any
     * state is pinned, PinMode suppresses hover and shows a floating "Unpin"
     * button — see PinMode.ts for the UX rationale.
     */
    public notifyPinStateChanged(stateSync?: StateSync) {
        const anyPinned = this.stateSyncs.some(s => s.isPinned);
        if (anyPinned) {
            this.target.removeEventListener("mouseenter", this.handleHover);
            document.EditorManager?.getBlocActionGroup()?.close();
            this._pinMode.enter();
        } else {
            this._pinMode.exit();
            if (this._hasInteractiveFeatures()) {
                this.target.addEventListener("mouseenter", this.handleHover);
            }
        }
        this.onEditorPinState?.(anyPinned, stateSync);
    }

    private _hasInteractiveFeatures(): boolean {
        return this._actionBarFeatures.values().some(v => v === true)
            || this.stateSyncs.length > 0
            || this.customActions.length > 0;
    }

    public viewClient() {
        this.stateSyncs.forEach(s => s.unpin());
        this._pinMode.exit();
        this.restore();

        this.target.removeEventListener("mouseenter", this.handleHover);

        this.target.style.removeProperty("pointer-events");
        if (this.target.getAttribute("style") === "") {
            this.target.removeAttribute("style");
        }

        this._releaseBodyStyle();
        // Shadow-DOM case: the styleElement lives in the target's shadow root
        // and is unique per editor instance, so always safe to remove.
        if (this.target.shadowRoot) this.styleElement.remove();

        this.target.removeAttribute(p9r.attr.EDITOR.IS_EDITOR)
        this.target.classList.remove("editor-block")
        this.target.removeAttribute("draggable")
        if (this.target.getAttribute("class") === "") {
            this.target.removeAttribute("class");
        }

        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT)
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE)
        this.target.removeAttribute(p9r.attr.ACTION.INLINE_ADDING)
        this.target.removeAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE)

        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)
        this.target.removeAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT)


        this.target.removeAttribute(p9r.attr.EDITOR.IDENTIFIER)
        this.target.removeAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)

    }

    public viewEditor() {
        // Default values
        this._setPanelItemIdentifiers();
        this._panelConfig?.init();
        this.init();

        if (!this.target.shadowRoot) {
            this._acquireBodyStyle();
        } else {
            this.target.shadowRoot.append(this.styleElement);
        }

        this.target.setAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE, "true");
        this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier)
        this.target.classList.add("editor-block")
        this.target.setAttribute(p9r.attr.EDITOR.IS_EDITOR, "true")

        // `removeAttribute("draggable")` resets to the HTML default "auto",
        // which still allows drag on contenteditable text (the native browser
        // behaviour) — we need an explicit "false" to actually lock it.
        if (this.target.hasAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)) {
            this.target.setAttribute("draggable", "false");
        } else {
            this.target.draggable = true;
        }

        this.target.style.setProperty("pointer-events", "auto", "important");

        this.refreshActionBarFeatures();

        // viewEditor can be re-called after a sync (CompSync/ImageSync) flips
        // DISABLE_* flags. Always detach first so the listener state mirrors
        // the current feature map — otherwise an action bar keeps opening on
        // hover after every button has been disabled.
        this.target.removeEventListener("mouseenter", this.handleHover);
        if (this._actionBarFeatures.values().some(v => v === true) || this.stateSyncs.length > 0 || this.customActions.length > 0) {
            this.target.addEventListener("mouseenter", this.handleHover);
        }

    }

    public dispose() {
        // Source of truth for teardown — any caller (ObserverManager,
        // _sealOpaqueSubtree, tests…) gets the map cleanup for free.
        document.compIdentifierToEditor?.delete(this.targetIdentifier);
        this.target.removeEventListener("mouseenter", this.handleHover);
        this._pinMode.exit();
        this._panelConfig?.remove();
        this._panelConfig = null;
        this._releaseBodyStyle();
        this.styleElement.remove();
    }

    private _acquireBodyStyle() {
        if (this._holdsBodyStyle) return;
        const tag = this.target.tagName;
        let entry = Editor.bodyStyle.get(tag);
        if (!entry) {
            // First editor of this tag — promote this instance's styleElement
            // to the shared one and mount it on <body>.
            document.body.append(this.styleElement);
            entry = { el: this.styleElement, count: 0 };
            Editor.bodyStyle.set(tag, entry);
        }
        entry.count++;
        this._holdsBodyStyle = true;
    }

    private _releaseBodyStyle() {
        if (!this._holdsBodyStyle) return;
        const tag = this.target.tagName;
        const entry = Editor.bodyStyle.get(tag);
        this._holdsBodyStyle = false;
        if (!entry) return;
        entry.count--;
        if (entry.count <= 0) {
            entry.el.remove();
            Editor.bodyStyle.delete(tag);
        }
    }

    onChildrenRemoved() {
        this._panelConfig?.init();
    }

    onChildrenAdded(addedNode?: HTMLElement) {
        this._panelConfig?.init(addedNode);
    }

    get actionBarConfiguration() {
        return this._actionBarFeatures;
    }

    get ensurePersistentIdentifier(): string {
        if (!this.target.hasAttribute(p9r.attr.EDITOR.PERSISTENT_IDENTIFIER)) {
            const generatedId = "ID-" + crypto.randomUUID();
            this.target.setAttribute(p9r.attr.EDITOR.PERSISTENT_IDENTIFIER, generatedId);
        }
        return this.target.getAttribute(p9r.attr.EDITOR.PERSISTENT_IDENTIFIER)!;
    }

    get persistentIdentifierAttrName(): string {
        return p9r.attr.EDITOR.PERSISTENT_IDENTIFIER;
    }

    showConfigPanel() {
        this._panelConfig?.show();
    };

    protected addCustomAction(action: CustomAction) {
        this.customActions.push(action);
    }

    abstract init(): void;
    abstract restore(): void;
}

