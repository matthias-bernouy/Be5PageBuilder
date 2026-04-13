import { ConfigPanel } from "../configuration/ConfigPanel";

export type CustomAction = {
    action: string;
    title: string;
    icon: string;
    handler: () => void;
};

export abstract class Editor {

    private targetIdentifier: string;
    public         target:       HTMLElement;
    private styleElement: HTMLStyleElement;
    private static bodyStyle: Map<string, boolean> = new Map();
    public         _panelConfig: ConfigPanel | null = null;
    public         variant: string = "default";
    public         customActions: CustomAction[] = [];
    private        _actionBarFeatures: Map<string, boolean> = new Map([
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

        if ( !document.compIdentifierToEditor ) document.compIdentifierToEditor = new Map();
        if ( document.compIdentifierToEditor.has(this.targetIdentifier) ){
            throw new Error("Critial Random Error: UUID duplication for " + this.target);
        }

        document.compIdentifierToEditor.set(this.targetIdentifier, this);

        if ( editor ) {
            this._panelConfig = document.createElement("p9r-config-panel") as ConfigPanel;
            this._panelConfig.innerHTML += editor;
            this._setPanelItemIdentifiers();
            document.EditorManager.getEditorSystemHTMLElement().append(this._panelConfig)
        }

        document.addEventListener(p9r.event.SWITCH_MODE, this.handleModeSwitch);

        if (document.EditorManager?.getBlocActionGroup()){
            document.EditorManager.getBlocActionGroup().close();
        }
    }

    private handleModeSwitch = (e: CustomEvent) => {
        if (e.detail === p9r.mode.EDITOR) {
            this.viewEditor();
        } else {
            this.viewClient();
        }
    }

    private _setPanelItemIdentifiers(): void {
        if ( !this._panelConfig ) return;
        const panelItems = this._panelConfig.querySelectorAll('*') as unknown as any[];
        panelItems.forEach((item) => {
            item.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.targetIdentifier);
        });
    }

    private handleHover = (e: MouseEvent) => {
        document.EditorManager.getBlocActionGroup().setEditor(this);
        document.EditorManager.getBlocActionGroup().open(e.clientX, e.clientY);
    }

    public viewClient() {
        this.restore();
        this.target.removeEventListener("mouseenter", this.handleHover);

        this.target.style.removeProperty("pointer-events");
        if (this.target.getAttribute("style") === "") {
            this.target.removeAttribute("style");
        }

        this.styleElement.remove();

        Editor.bodyStyle.delete(this.target.tagName);

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
            if (!Editor.bodyStyle.has(this.target.tagName)){
                Editor.bodyStyle.set(this.target.tagName, true)
                document.body.append(this.styleElement);
            };
        } else {
            this.target.shadowRoot?.append(this.styleElement);
        }



        this.target.setAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE, "true");
        this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier)
        this.target.classList.add("editor-block")
        this.target.setAttribute(p9r.attr.EDITOR.IS_EDITOR, "true")

        this.target.draggable = true;
        if ( this.target.hasAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)){
            this.target.removeAttribute("draggable");
        }

        this.target.style.setProperty("pointer-events", "auto", "important");

        this._actionBarFeatures.set("delete", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DELETE) !== "true");
        this._actionBarFeatures.set("duplicate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE) !== "true");
        this._actionBarFeatures.set("addBefore", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE) !== "true");
        this._actionBarFeatures.set("addAfter", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER) !== "true");
        this._actionBarFeatures.set("changeComponent", this.target.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT) !== "true");
        this._actionBarFeatures.set("saveAsTemplate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE) !== "true");

        if (this._actionBarFeatures.values().some(v => v === true)){
            this.target.addEventListener("mouseenter", this.handleHover);
        }

    }

    public dispose() {
        document.removeEventListener(p9r.event.SWITCH_MODE, this.handleModeSwitch);
        this.target.removeEventListener("mouseenter", this.handleHover);
        this._panelConfig?.remove();
        this.styleElement.remove();
    }

    onChildrenRemoved(){
        this._panelConfig?.init();
    }

    onChildrenAdded(){
        this._panelConfig?.init();
    }

    get actionBarConfiguration(){
        return this._actionBarFeatures;
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

