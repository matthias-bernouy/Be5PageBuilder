import { DragManager } from "./DragManager";
import { ObserverManager } from "./ObserverManager";
import { editable_style } from "./styles/editable_style";

export type PageModeEnum = [
    "editor-mode",
    "view-mode"
];

export type PageMode = PageModeEnum[number];

export class EditorManager{

    private mode: PageMode = "editor-mode";
    private workingElement: HTMLElement;

    constructor(workingElement: HTMLElement){
        document.body.append(editable_style())
        this.workingElement = workingElement;
        document.EditorManager = this;
        new DragManager(workingElement)
        new ObserverManager(workingElement)
    }

    switchMode(mode?: PageMode){
        if ( this.mode === "editor-mode" ){
            this.mode = "view-mode";
        } else {
            this.mode = "editor-mode";
        }
        if ( mode ) this.mode = mode;
        document.dispatchEvent(new CustomEvent("switch-mode", {
            detail: this.mode
        }))
    }

    export(){
        this.switchMode("view-mode");
        console.log(this.workingElement.innerHTML)
    }

}
