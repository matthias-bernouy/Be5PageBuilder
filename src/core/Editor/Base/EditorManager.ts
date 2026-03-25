import { DragManager } from "./DragManager";
import { ObserverManager } from "./ObserverManager";
import { MediaCenter } from "../MediaCenter/MediaCenter";
import { FloatingToolbar } from "../FloatingToolbar/FloatingToolbar";
import { EditorToolbar } from "../RichTextBar/RichTextBar";
import { BlocConfigurationPanel } from "../BlocConfiguration/BlocConfigurationPanel/BlocConfigurationPanel";

export type PageModeEnum = [
    "editor-mode",
    "view-mode"
];

export type PageMode = PageModeEnum[number];

export class EditorManager{

    private mode: PageMode = "editor-mode";

    private workingElement: HTMLElement;
    private editorSystem: HTMLElement;

    private mediaCenter: MediaCenter;
    private toolbar: FloatingToolbar;
    private elementPanelConfig: BlocConfigurationPanel;

    private observer: ObserverManager;

    constructor(workingElement: HTMLElement){
        this.workingElement = workingElement;
        this.editorSystem   = document.getElementById("editor-system")!;

        this.mediaCenter        = new MediaCenter();
        this.toolbar            = new FloatingToolbar();
        this.elementPanelConfig = new BlocConfigurationPanel();

        this.editorSystem.append(this.mediaCenter)
        this.editorSystem.append(this.toolbar)
        this.editorSystem.append(new EditorToolbar())
        this.editorSystem.append(this.elementPanelConfig)

        new DragManager(workingElement);
        this.observer = new ObserverManager(workingElement);

        document.EditorManager = this;
    }

    dashboard(){
        window.location.href = "./pages"
    }

    getObserver(){
        return this.observer;
    }

    getPanelBlockConfig(){
        return this.elementPanelConfig;
    }

    getConfiguration(){
        return this.editorSystem.querySelector("w13c-page-information");
    }

    getMediaCenter(){
        this.mediaCenter.addImage("https://picsum.photos/201", "qsdfqsddsf")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        this.mediaCenter.addImage("https://picsum.photos/200", "")
        return this.mediaCenter;
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

    save(props: {
        path: string,
        title: string;
        description: string;
        visible: boolean;
        identifier: string;
        tags: string;
    }){
        this.switchMode("view-mode");
        const article = this.workingElement.innerHTML;

        
        const target = new URL("../api/page", window.location.href);


        const body = {
            content: article,
            path: props.path,
            title: props.title,
            description: props.description,
            visible: props.visible,
            tags: props.tags
        }

        target.searchParams.set("identifier", props.identifier);
        const res = fetch(target, {
            method: "POST",
            body: JSON.stringify(body)
        })
        res.then((a) => {
            //console.log(a)
        })
        this.switchMode("editor-mode");
    }

    getMode(){
        return this.mode;
    }

}
