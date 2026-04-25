import type EditorRoot from "src/control/components/editor/EditorSystem/EditorRoot/EditorRoot";
import { SyncPanel } from "../../../components/editor/componentSync/SyncPanel";
import type { StateSync } from "../../../components/editor/componentSync/sync/StateSync";
import { PinMode } from "./PinMode";
import getClosestEditorSystem from "../../dom/getClosestEditorSystem";

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
    private static bodyStyle: Map<string, { el: HTMLStyleElement, count: number }> = new Map();
    private _holdsBodyStyle = false;
    public _panelConfig: SyncPanel | null = null;
    private _panelFragment: DocumentFragment | null = null;
    private _panelSyncs: HTMLElement[] = [];
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
        console.debug("NEW EDITOR", target)
        this.target = target;
        this.styleElement = document.createElement("style");
        this.styleElement.innerHTML = styles;

        this.targetIdentifier = crypto.randomUUID();
        this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier);

        if (!document.compIdentifierToEditor) document.compIdentifierToEditor = new Map();
        document.compIdentifierToEditor.set(this.targetIdentifier, this);

        this._pinMode = new PinMode(this.target, this.stateSyncs, () => {
            this.stateSyncs.forEach(s => s.unpin());
            this.notifyPinStateChanged();
        });

        if (editor) {
            this._initPanelFragment(editor);
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.target.removeAttribute(p9r.attr.EDITOR.IS_CREATING);
            });
        });

        getClosestEditorSystem(this.target).blocActions.close();
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

    private _initPanelFragment(editor: string): void {
        // Must use createContextualFragment (not <template>.content): a
        // template's content lives in a separate inert document, whose custom
        // elements are not upgraded by the main document's registry — so
        // customElements.upgrade() would silently do nothing and prepare()
        // would run against un-upgraded HTMLElement instances. The contextual
        // fragment is created in `document`, so upgrade() sees the registry.
        this._panelFragment = document.createRange().createContextualFragment(editor);

        // Upgrade every custom element in the fragment — otherwise their
        // prepare() method doesn't exist yet (class not instantiated) and
        // our default-seeding pass would be a no-op.
        try { customElements.upgrade(this._panelFragment); } catch {}

        // Stamp PARENT_IDENTIFIER on every descendant so syncs (at any depth)
        // can resolve their component without relying on the panel DOM.
        this._panelFragment.querySelectorAll('*').forEach((el) => {
            el.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.targetIdentifier);
        });

        // Collect syncs so we can route init()/onChildrenAdded notifications
        // directly to them while the panel is still detached.
        this._panelSyncs = Array.from(
            this._panelFragment.querySelectorAll(
                "p9r-comp-sync, p9r-image-sync, p9r-attr-sync, p9r-state-sync"
            )
        ) as HTMLElement[];

        // Eager prepare pass: slot defaulting, attr locking, StateSync
        // registration. Must run now so IS_CREATING blocs get their
        // default children & attrs before the user interacts.
        for (const sync of this._panelSyncs) {
            (sync as any).prepare?.(this.target, this);
        }
    }

    private _ensurePanelBuilt(): void {
        if (this._panelConfig || !this._panelFragment) return;
        this._panelConfig = document.createElement("p9r-config-panel") as SyncPanel;
        this._panelConfig.appendChild(this._panelFragment);
        this._panelFragment = null;

        
        getClosestEditorSystem(this.target).editorDOM.append(this._panelConfig);
    }

    /**
     * True when this editor declared a configuration panel — even if we
     * haven't instantiated it yet. BAG & action resolvers use this rather
     * than `_panelConfig != null` since the latter lies during the lazy
     * window.
     */
    public get hasConfigPanel(): boolean {
        return this._panelConfig != null || this._panelFragment != null;
    }

    /**
     * Query panel children regardless of whether the panel is built or
     * still sitting in the detached fragment. Used by action resolvers that
     * need to introspect `<p9r-comp-sync>` templates.
     */
    public queryPanelChildren<T extends Element = Element>(selector: string): T[] {
        if (this._panelConfig) return Array.from(this._panelConfig.querySelectorAll(selector)) as T[];
        if (this._panelFragment) return Array.from(this._panelFragment.querySelectorAll(selector)) as T[];
        return [];
    }

    private _notifyPanelSyncs(opts?: { added?: HTMLElement; removed?: HTMLElement }): void {
        if (this._panelConfig) {
            this._panelConfig.init(opts);
            return;
        }
        for (const sync of this._panelSyncs) {
            (sync as any).init?.(opts);
        }
    }

    private handleHover = (e: MouseEvent) => {
        console.log("Handle Hover");
        const editorSystem = getClosestEditorSystem(this.target);
        console.log("Handle Hover", editorSystem);
        editorSystem.blocActions.setEditor(this);
        editorSystem.blocActions.open(e.clientX, e.clientY);
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
     * Override to anchor the floating action bar against a sub-element rather
     * than the whole target. The returned element controls BOTH where BAG
     * positions itself AND when it opens/closes — `mouseenter`/`mouseleave`
     * are bound to this element, not the target. State-dependent anchors are
     * supported: call `viewEditor()` again after a state change to re-bind.
     * Return `null` (default) to use the target.
     */
    public getActionBarAnchor(): HTMLElement | null {
        return null;
    }

    /**
     * Element currently bound to the `mouseenter` listener. Tracked so we can
     * rebind cleanly when the anchor changes (otherwise the old listener
     * leaks and BAG opens on both old and new anchors).
     */
    private _hoverElement: HTMLElement | null = null;

    /**
     * Called by the action bar after toggling a <p9r-state-sync>. While any
     * state is pinned, PinMode suppresses hover and shows a floating "Unpin"
     * button — see PinMode.ts for the UX rationale.
     */
    public notifyPinStateChanged(stateSync?: StateSync) {
        const anyPinned = this.stateSyncs.some(s => s.isPinned);
        if (anyPinned) {
            this._unbindHover();
            const editorSystem = getClosestEditorSystem(this.target);
            editorSystem.blocActions.close();
            this._pinMode.enter();
        } else {
            this._pinMode.exit();
            if (this._hasInteractiveFeatures()) {
                this._bindHover();
            }
        }
        this.onEditorPinState?.(anyPinned, stateSync);
    }

    private _bindHover() {
        this._unbindHover();
        this._hoverElement = this.getActionBarAnchor() ?? this.target;
        this._hoverElement.addEventListener("mouseenter", this.handleHover);
    }

    private _unbindHover() {
        this._hoverElement?.removeEventListener("mouseenter", this.handleHover);
        this._hoverElement = null;
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

        this._unbindHover();

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
        // Default values. Routed through _notifyPanelSyncs so syncs run even
        // when the panel hasn't been instantiated yet (lazy panel mode).
        this._setPanelItemIdentifiers();
        this._notifyPanelSyncs();
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
        this._unbindHover();
        if (this._actionBarFeatures.values().some(v => v === true) || this.stateSyncs.length > 0 || this.customActions.length > 0) {
            this._bindHover();
        }

    }

    public dispose() {
        // Source of truth for teardown — any caller (ObserverManager,
        // _sealOpaqueSubtree, tests…) gets the map cleanup for free.
        document.compIdentifierToEditor?.delete(this.targetIdentifier);
        this._unbindHover();
        this._pinMode.exit();
        this._panelConfig?.remove();
        this._panelConfig = null;
        this._panelFragment = null;
        this._panelSyncs = [];
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

    onChildrenRemoved(removedNode?: HTMLElement) {
        this._notifyPanelSyncs({ removed: removedNode });
    }

    onChildrenAdded(addedNode?: HTMLElement) {
        this._notifyPanelSyncs({ added: addedNode });
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
        this._ensurePanelBuilt();
        this._panelConfig?.show();
    };

    protected addCustomAction(action: CustomAction) {
        this.customActions.push(action);
    }

    abstract init(): void;
    abstract restore(): void;
}

