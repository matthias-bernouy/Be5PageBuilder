import { ConfigPanel } from "../configuration/ConfigPanel";

export abstract class Editor {

    private targetIdentifier: string;
    private static styleElement: Map<string, HTMLStyleElement>;
    public         target:       HTMLElement;
    public         _panelConfig: ConfigPanel | null = null;
    private        _actionBarFeatures: Map<string, boolean> = new Map([
        ["delete", true],
        ["edit", true],
        ["duplicate", true],
        ["addBefore", false],
        ["addAfter", false],
        ["changeComponent", false],
        ["saveAsTemplate", false]
    ]);

    constructor(target: HTMLElement, styles: string, editor?: string) {
        this.target = target;

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

        document.addEventListener("switch-mode", (e: CustomEventInit) => {
            if (e.detail === "editor-mode") {
                this.viewEditor();
            } else {
                this.viewClient();
            }
        })

        if (Editor.styleElement == null) Editor.styleElement = new Map()
        if (!Editor.styleElement.has(this.target.tagName)) {
            const styleElem = document.createElement("style")
            styleElem.innerHTML = styles;
            Editor.styleElement.set(this.target.tagName, styleElem);
        }

        if (document.EditorManager?.getBlocActionGroup()){
            document.EditorManager.getBlocActionGroup().close();
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

        Editor.styleElement.forEach((v, k) => {
            v.remove();
        })
        this.target.removeAttribute(p9r.attr.EDITOR.IS_EDITOR)
        this.target.classList.remove("editor-block")
        this.target.removeAttribute("draggable")
        if (this.target.getAttribute("class") === "") {
            this.target.removeAttribute("class");
        }

        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_EDIT);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER);
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT)
        this.target.removeAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE)
        this.target.removeAttribute(p9r.attr.ACTION.INLINE_ADDING)

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

        Editor.styleElement.forEach((v, k) => {
            document.body.append(v)
        })


        this.target.setAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE, "true");
        this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier)
        this.target.classList.add("editor-block")
        this.target.setAttribute(p9r.attr.EDITOR.IS_EDITOR, "true")

        this.target.draggable = true;
        if ( this.target.hasAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)){
            this.target.removeAttribute("draggable");
        }

        this._actionBarFeatures.set("delete", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DELETE) !== "true");
        this._actionBarFeatures.set("edit", this.target.getAttribute(p9r.attr.ACTION.DISABLE_EDIT) !== "true");
        this._actionBarFeatures.set("duplicate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE) !== "true");
        this._actionBarFeatures.set("addBefore", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE) !== "true");
        this._actionBarFeatures.set("addAfter", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER) !== "true");
        this._actionBarFeatures.set("changeComponent", this.target.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT) !== "true");
        this._actionBarFeatures.set("saveAsTemplate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE) !== "true");

        if (this._actionBarFeatures.values().some(v => v === true)){
            this.target.addEventListener("mouseenter", this.handleHover);
        }

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

    abstract init(): void;
    abstract restore(): void;
}

