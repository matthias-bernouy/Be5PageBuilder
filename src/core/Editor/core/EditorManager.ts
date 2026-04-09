
import "src/core/Editor/components/Snippet/SnippetElement"
import { DragManager } from "./DragManager";
import { ObserverManager } from "./ObserverManager";
import { MediaCenter } from "../components/MediaCenter/MediaCenter";
import { FloatingToolbar } from "../components/FloatingToolbar/FloatingToolbar";
import { EditorToolbar } from "../components/RichTextBar/RichTextBar";
import "../configuration/ConfigPanel";
import { BlocActionGroup } from "../components/BlocActionGroup/BlocActionGroup";
import type { P9RMode } from "types/p9r-constants";

export type PageMode = P9RMode;

export class EditorManager{

    private mode: PageMode = p9r.mode.EDITOR;

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
        this.editorSystem   = document.getElementById(p9r.id.EDITOR_SYSTEM)!;

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
            || this.editorSystem.querySelector("w13c-template-information")
            || this.editorSystem.querySelector("w13c-snippet-information");
    }

    getMediaCenter(){
        return this.mediaCenter;
    }

    getApiBasePath(){
        return window.location.origin + "/page-builder/api/";
    }

    switchMode(mode?: PageMode){
        if ( this.mode === p9r.mode.EDITOR ){
            this.mode = p9r.mode.VIEW;
        } else {
            this.mode = p9r.mode.EDITOR;
        }
        if ( mode ) this.mode = mode;
        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, {
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
        this.switchMode(p9r.mode.VIEW);
        const article = this.workingElement.innerHTML;

        const target = new URL("../api/page", window.location.href);

        // The current URL identifies the page being edited via (?path, ?identifier).
        // Those become the "old key" we send to the API so the upsert can find
        // the existing document even if the user just renamed its path/identifier.
        const urlParams = new URLSearchParams(window.location.search);
        const currentPath = urlParams.get("path") || props.path;
        const currentIdentifier = urlParams.get("identifier") || "";

        const body = {
            content: article,
            path: props.path,
            title: props.title,
            description: props.description,
            visible: props.visible,
            tags: props.tags,
            identifier: props.identifier
        };

        target.searchParams.set("path", currentPath);
        target.searchParams.set("identifier", currentIdentifier);
        fetch(target, {
            method: "POST",
            body: JSON.stringify(body)
        });
        this.switchMode(p9r.mode.EDITOR);
    }

    getContent(): string {
        this.switchMode(p9r.mode.VIEW);
        const content = this.workingElement.innerHTML;
        this.switchMode(p9r.mode.EDITOR);
        return content;
    }

    getMode(){
        return this.mode;
    }

}
