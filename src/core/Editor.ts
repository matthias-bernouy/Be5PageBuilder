export abstract class Editor {

    private static styleElement: Map<string, HTMLStyleElement>;
    private rawStyles: string;
    protected target: HTMLElement;

    constructor(target: HTMLElement, styles: string) {
        this.rawStyles = styles;
        this.target = target;

        document.addEventListener("switch-mode", (e: CustomEventInit) => {
            if (e.detail === "editor-mode") {
                this.viewEditor();
            } else {
                this.viewClient();
            }
        })

        if ( Editor.styleElement == null ) Editor.styleElement = new Map()
        if ( !Editor.styleElement.has(this.target.tagName) ){
            const styleElem = document.createElement("style")
            styleElem.innerHTML = styles;
            Editor.styleElement.set(this.target.tagName, styleElem);
        }

    }

    public viewClient() {
        Editor.styleElement.forEach((v, k) => {
            v.remove();
        })
        this.target.removeAttribute("data-is-editor")
        this.target.classList.remove("editor-block")
        this.target.removeAttribute("draggable")
        if (this.target.getAttribute("class") === ""){
            this.target.removeAttribute("class");
        }
        this.restore();
    }

    public viewEditor() {
        Editor.styleElement.forEach((v, k) => {
            document.body.append(v)
        })
        this.target.draggable = true;
        this.target.classList.add("editor-block")
        this.target.setAttribute("data-is-editor", "true")

        this.init();
    }

    private openConfigPanel() {

    }

    public setConfigPanel(){

    }

    abstract init(): void;
    abstract restore(): void;
}

