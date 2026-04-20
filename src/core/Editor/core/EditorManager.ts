
import "src/core/Editor/components/Snippet/Snippet"
import { DragManager } from "./DragManager";
import { ObserverManager } from "./ObserverManager";
import { MediaCenter } from "../components/MediaCenter/MediaCenter";
import { FloatingToolbar } from "../components/FloatingToolbar/FloatingToolbar";
import { EditorToolbar } from "../components/RichTextBar/RichTextBar";
import "../configuration/ConfigPanel";
import { BlocActionGroup } from "../components/BlocActionGroup/BlocActionGroup";
import { EDITOR_MANAGER_READY_EVENT } from "./editorManagerReady";
import type { P9RMode } from "types/p9r-constants";

export type PageMode = P9RMode;

export class EditorManager{

    private mode: PageMode = p9r.mode.EDITOR;

    private workingElement: HTMLElement;
    private editorSystem: HTMLElement;

    private mediaCenter: MediaCenter;
    private toolbar: FloatingToolbar;
    private blocActionGroup: BlocActionGroup;
    private richTextBar: EditorToolbar;

    private observer: ObserverManager;
    private dragManager: DragManager;

    private backPath?: string;
    publicRoot: string = "/";

    constructor(workingElement: HTMLElement, backPath?: string) {
        this.backPath = backPath;
        this.workingElement = workingElement;
        this.editorSystem   = document.getElementById(p9r.id.EDITOR_SYSTEM)!;

        this.mediaCenter        = new MediaCenter();
        this.toolbar            = new FloatingToolbar();
        this.blocActionGroup    = new BlocActionGroup();
        this.richTextBar        = new EditorToolbar();

        this.editorSystem.append(this.mediaCenter)
        this.editorSystem.append(this.toolbar)
        this.editorSystem.append(this.richTextBar)
        this.editorSystem.append(this.blocActionGroup)

        this.dragManager = new DragManager(workingElement);

        document.EditorManager = this;

        this.observer = new ObserverManager(workingElement);

        // Unblock any custom elements that upgraded before us and are
        // waiting for `document.EditorManager` via `whenEditorManagerReady`.
        document.dispatchEvent(new CustomEvent(EDITOR_MANAGER_READY_EVENT));
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

    /**
     * Absolute API base URL for this editor.
     *
     * Cms is a plugin mounted under a host-configurable prefix, so
     * the client cannot hardcode `/cms/api/`. The server bakes the
     * resolved prefix into a `<meta name="p9r-api-base">` tag in the editor
     * shell (see `src/server/editorShell.ts`); we read it here and resolve
     * it against the current document URL so the result is always absolute.
     */
    getApiBasePath(){
        const meta = document.querySelector('meta[name="p9r-api-base"]') as HTMLMetaElement | null;
        const base = meta?.content || "/cms/api/";
        return new URL(base, window.location.href).href;
    }

    get basePath(){
        const meta = document.querySelector('meta[name="p9r-base-path"]') as HTMLMetaElement | null;
        return meta?.content || "/cms"
    }

    switchMode(mode?: PageMode){
        if ( this.mode === p9r.mode.EDITOR ){
            this.mode = p9r.mode.VIEW;
            this.richTextBar.remove();
        } else {
            this.mode = p9r.mode.EDITOR;
            this.editorSystem.append(this.richTextBar);
        }
        if ( mode ) this.mode = mode;
        // Direct dispatch via the editor registry Editor already maintains
        // (`document.compIdentifierToEditor`). Used to be a per-editor
        // `document.addEventListener(SWITCH_MODE)` — 2 listeners per editor
        // (Editor base + TextEditor observer toggle), so a 400-item grid
        // ended up with 800 handlers on `document`.
        const editors = document.compIdentifierToEditor;
        if (editors) for (const ed of editors.values()) ed.onSwitchMode(this.mode);
        // Keep the broadcast for external listeners (custom blocs, MediaCenter…)
        // that still hook into the document bus.
        document.dispatchEvent(new CustomEvent(p9r.event.SWITCH_MODE, {
            detail: this.mode
        }))
    }

    async save(props: {
        path: string,
        title: string;
        description: string;
        visible: boolean;
        identifier: string;
        tags: string;
    }){
        this.switchMode(p9r.mode.VIEW);
        const article = this.workingElement.innerHTML;

        const target = new URL("page", this.getApiBasePath());

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
        try {
            const res = await fetch(target, {
                method: "POST",
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                throw new Error(`Save failed: ${res.status} ${await res.text()}`);
            }
        } finally {
            this.switchMode(p9r.mode.EDITOR);
        }
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

    dispose() {
        this.observer.dispose();
        this.dragManager.dispose();
        this.mediaCenter.remove();
        this.toolbar.remove();
        this.richTextBar.remove();
        this.blocActionGroup.remove();
        if (document.EditorManager === this) delete (document as any).EditorManager;
    }

}
