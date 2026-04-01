import "../configuration/DataConfigItem";
import "../configuration/ListConfigItem";

export abstract class Editor {

    private targetIdentifier: string;
    private static styleElement: Map<string, HTMLStyleElement>;
    public         target:       HTMLElement;
    public         _panelConfig: HTMLElement | null = null;
    private        _actionBarFeatures: Map<string, boolean> = new Map([
        ["delete", true],
        ["edit", true],
        ["duplicate", true],
        ["addBefore", true],
        ["addAfter", true],
        ["saveAsTemplate", false]
    ]);

    private registerOnEditorMode: (() => void)[] = [];

    constructor(target: HTMLElement, styles: string, editor?: string) {
        this.target = target;

        this.targetIdentifier = crypto.randomUUID();
        this.target.setAttribute("data-identifier", this.targetIdentifier)

        if ( editor ) {
            this._panelConfig = document.createElement("div");
            this._panelConfig.innerHTML = editor;
            this._setPanelItemIdentifiers();
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
            item.setAttribute('data-component-identifier', this.targetIdentifier);
            if ( item.init ) item.init();
            if ( item.onEditorMode ) {
                this.registerOnEditorMode.push(item.onEditorMode);
            }
        });
    }

    private handleHover = () => {
        document.EditorManager.getBlocActionGroup().setEditor(this);
        document.EditorManager.getBlocActionGroup().open();
    }

    public viewClient() {
        this.restore();
        this.target.removeEventListener("mouseenter", this.handleHover);

        Editor.styleElement.forEach((v, k) => {
            v.remove();
        })
        this.target.removeAttribute("data-is-editor")
        this.target.classList.remove("editor-block")
        this.target.removeAttribute("draggable")
        if (this.target.getAttribute("class") === "") {
            this.target.removeAttribute("class");
        }

        this.target.removeAttribute("data-disable-delete");
        this.target.removeAttribute("data-disable-edit");
        this.target.removeAttribute("data-disable-duplicate");
        this.target.removeAttribute("data-disable-add-before");
        this.target.removeAttribute("data-disable-add-after");
        this.target.removeAttribute("data-disable-save-as-template");

        this.target.removeAttribute("data-identifier")

    }

    public viewEditor() {
        this.init();
        this.registerOnEditorMode.forEach((ele) => {
            ele();
        })
        this.target.addEventListener("mouseenter", this.handleHover);

        Editor.styleElement.forEach((v, k) => {
            document.body.append(v)
        })

        this.target.draggable = true;
        this.target.classList.add("editor-block")
        this.target.setAttribute("data-is-editor", "true")
        this.target.setAttribute("data-identifier", this.targetIdentifier)

        if (this.target.getAttribute("data-disable-delete") === "true") {
            this._actionBarFeatures.set("delete", false);
        }
        if (this.target.getAttribute("data-disable-edit") === "true") {
            this._actionBarFeatures.set("edit", false);
        }
        if (this.target.getAttribute("data-disable-duplicate") === "true") {
            this._actionBarFeatures.set("duplicate", false);
        }
        if (this.target.getAttribute("data-disable-add-before") === "true") {
            this._actionBarFeatures.set("addBefore", false);
        }
        if (this.target.getAttribute("data-disable-add-after") === "true") {
            this._actionBarFeatures.set("addAfter", false);
        }
        if (this.target.getAttribute("data-disable-save-as-template") === "true") {
            this._actionBarFeatures.set("saveAsTemplate", false);
        }

    }

    public render(){
        
    }

    get actionBarConfiguration(){
        return this._actionBarFeatures;
    }

    get panelConfig(): HTMLElement | null {
        return this._panelConfig;
    };

    abstract init(): void;
    abstract restore(): void;
}

