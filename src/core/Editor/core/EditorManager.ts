import { DragManager } from "./DragManager";
import { ObserverManager } from "./ObserverManager";
import { MediaCenter } from "../components/MediaCenter/MediaCenter";
import { FloatingToolbar } from "../components/FloatingToolbar/FloatingToolbar";
import { EditorToolbar } from "../components/RichTextBar/RichTextBar";
import "../configuration/ConfigPanel";
import { BlocActionGroup } from "../components/BlocActionGroup/BlocActionGroup";

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
    private blocActionGroup: BlocActionGroup;

    private observer: ObserverManager;

    private backPath?: string;
    publicRoot: string = "/";

    constructor(workingElement: HTMLElement, backPath?: string) {
        this.backPath = backPath;
        this.workingElement = workingElement;
        this.editorSystem   = document.getElementById("editor-system")!;

        this.mediaCenter        = new MediaCenter();
        this.toolbar            = new FloatingToolbar();
        this.blocActionGroup    = new BlocActionGroup();

        this.editorSystem.append(this.mediaCenter)
        this.editorSystem.append(this.toolbar)
        this.editorSystem.append(new EditorToolbar())
        this.editorSystem.append(this.blocActionGroup)

        new DragManager(workingElement);

        document.EditorManager = this;

        this.observer = new ObserverManager(workingElement);

    }

    dashboard(){
        if ( this.backPath ) {
            window.location.href = this.backPath;
            return;
        }
        window.location.href = "./pages"
    }

    getBlocActionGroup(){
        return this.blocActionGroup;
    }

    getEditorSystemHTMLElement(){
        return this.editorSystem;
    }

    getObserver(){
        return this.observer;
    }

    getConfiguration(){
        return this.editorSystem.querySelector("w13c-page-information")
            || this.editorSystem.querySelector("w13c-template-information");
    }

    getMediaCenter(){
        return this.mediaCenter;
    }

    getApiBasePath(){
        return window.location.origin + "/page-builder/api/";
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

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const currentIdentifier = urlParams.get('identifier');

        const body = {
            content: article,
            path: props.path,
            title: props.title,
            description: props.description,
            visible: props.visible,
            tags: props.tags,
            identifier: currentIdentifier
        }

        target.searchParams.set("identifier", props.identifier);
        fetch(target, {
            method: "POST",
            body: JSON.stringify(body)
        })
        this.switchMode("editor-mode");
    }

    getContent(): string {
        this.switchMode("view-mode");
        const content = this.workingElement.innerHTML;
        this.switchMode("editor-mode");
        return content;
    }

    getMode(){
        return this.mode;
    }

}
