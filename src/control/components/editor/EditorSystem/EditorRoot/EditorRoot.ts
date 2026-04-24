import css  from "./style.css"     with { type: "text" }
import html from "./template.html" with { type: "text" }
import { isToggable } from "src/control/core/isToggable";
import type { EDITOR_SYSTEM_MODE } from "types/w13c/EditorSystem";
import { ObserverManager } from "src/control/components/editor/EditorSystem/ObserverManager";
import { DragManager } from "src/control/components/editor/EditorSystem/DragManager";


export default class EditorRoot extends HTMLElement {

    private mode: EDITOR_SYSTEM_MODE = "editor";

    private _observer: ObserverManager | null = null;
    private _dragmanager: DragManager | null = null;

    constructor(){
        super();
        this.attachShadow({ mode: "open"} );
        const style    = document.createElement("style") as HTMLStyleElement;
        const template = document.createElement("template");
        style.innerHTML = css;
        template.innerHTML = html as unknown as string;
        this.shadowRoot?.append(style);
        this.shadowRoot?.append(template);
    }

    connectedCallback(){

        requestAnimationFrame(() => {

            const workingElement = this.shadowRoot?.querySelector("#workingElement") as HTMLElement;
            this._observer    = new ObserverManager(workingElement);
            this._dragmanager = new DragManager(workingElement);

        })

    }

    save(){
        const ele = this.shadowRoot?.querySelector("#workingElement") as HTMLElement;
        const content = ele.innerHTML;
        this.dispatchEvent(new CustomEvent("editor-system-save", {
            bubbles: true,
            detail: content
        }))
    }

    openConfig(){
        const ele = this.shadowRoot?.querySelector("[slot=configuration]") as HTMLElement;
        if ( !ele || !isToggable(ele) ) throw new Error("Element should be have the open function");
        ele.open();
    }

    switchMode(){
        const newMode = ( this.mode === "editor" ) ? "view" : "editor";
        this.dispatchEvent(new CustomEvent("editor-system-switch-mode", {
            bubbles: true,
            detail: newMode
        }))
    }

    get observer(){
        if ( !this._observer ) throw new Error("You try to get observer before his initialization")
        return this._observer;
    }

    get dragManager(){
        if ( !this._dragmanager ) throw new Error("You try to get dragManager before his initialization");
        return this._dragmanager;
    }

}

if ( !customElements.get("cms-editor-system") ){
    customElements.define("cms-editor-system", EditorRoot)
}