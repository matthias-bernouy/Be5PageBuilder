import type { BlocConfiguration } from "../BlocConfiguration/BlocConfiguration";

export abstract class Editor {

    private static styleElement: Map<string, HTMLStyleElement>;
    public         target:       HTMLElement;
    private        _actionBarFeatures: Map<string, boolean> = new Map([
        ["delete", true],
        ["edit", true],
        ["duplicate", true],
        ["addBefore", true],
        ["addAfter", true],
        ["saveAsTemplate", false]
    ]);

    constructor(target: HTMLElement, styles: string) {
        this.target = target;

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

    private handleHover = () => {
        document.EditorManager.getBlocActionGroup().setEditor(this);
        document.EditorManager.getBlocActionGroup().open();
    }

    public onConfigChange(key: string, value: any) {
        console.log("Config change", key, value)
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

    }

    public viewEditor() {
        this.init();
        this.target.addEventListener("mouseenter", this.handleHover);

        Editor.styleElement.forEach((v, k) => {
            document.body.append(v)
        })

        this.target.draggable = true;
        this.target.classList.add("editor-block")
        this.target.setAttribute("data-is-editor", "true")

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

    get actionBarConfiguration(){
        return this._actionBarFeatures;
    }

    get configurations(): BlocConfiguration[] {
        return [];
    };

    abstract init(): void;
    abstract restore(): void;
}

