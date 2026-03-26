import { HorizontalActionGroup } from 'w13c/HorizontalActionGroup/HorizontalActionGroup';
import type { Editor } from './Editor';

export class BlocActionGroup extends HorizontalActionGroup {

    private _target: HTMLElement | null = null;
    private _editor: Editor | null = null;

    constructor() {
        super();
        this.style.position = "absolute";
        this.style.display = "none";
        this.style.padding = "8px 32px 8px 16px";
        this.style.zIndex = "10000";
    }

    setEditor(editor: Editor) {
        if (editor.actionBarConfiguration.values().every(v => v === false)) {
            this.style.display = "none";
            return;
        }
        this._editor = editor;
        this._target = editor.target;
    }

    open() {
        if (!this._editor || !this._target) return;
        this.render();
        if (this._editor?.actionBarConfiguration.values().every(v => v === false)) {
            return;
        }
        this.style.display = "flex";
        const rect = this._target!.getBoundingClientRect();

        this.style.top = `${rect.bottom + window.scrollY}px`;
        this.style.left = `${rect.left + window.scrollX}px`;

        this.addEventListener("action-click" as any, this.handleBlocActionClick);
        this.addEventListener("mouseleave", this.handleLeave);
        this._target!.addEventListener("mouseleave", this.handleLeave);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    close() {
        if (!this._editor || !this._target) return;
        this.style.display = "none";
        this.removeEventListener("action-click" as any, this.handleBlocActionClick);
        this.removeEventListener("mouseleave", this.handleLeave);
        this._target!.removeEventListener("mouseleave", this.handleLeave);
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            this.close();
        }
    }

    private handleBlocActionClick = (e: CustomEvent) => {
        const action = e.detail.action;
        const p = document.createElement("p");

        switch (action) {
            case "delete":
                this._target!.remove();
                this.close();
                break;

            case "edit":
                document.EditorManager.getBlocConfigPanel().show(this._editor!.configurations);
                break;

            case "duplicate":
                const clone = this._target!.cloneNode(true) as HTMLElement;
                clone.removeAttribute("data-is-editor");
                this._target!.after(clone);
                this.close();
                break;

            case "add-before":
                this._target!.parentElement?.insertBefore(p, this._target!);
                this.close();
                break;

            case "add-after":
                this._target!.parentElement?.insertBefore(p, this._target!.nextSibling);
                this.close();
                break;

            default:
                break;
        }
    }

    private handleLeave = (e: MouseEvent) => {
        const toElement = e.relatedTarget as HTMLElement;
        if (this.contains(toElement)) return;
        this.close();
    }

    private render(): void {
        const hasConfig = this._editor!.configurations.length > 0;
        const config = this._editor!.actionBarConfiguration;

        this.innerHTML = `
            ${config.get("addBefore") ? `
        <button data-action="add-before" title="Add node before">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="9 5 12 2 15 5"></polyline>
                <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
        </button> ` : ''}

        ${config.get("addAfter") ? `
        <button data-action="add-after" title="Add node after">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="9 19 12 22 15 19"></polyline>
                <line x1="12" y1="12" x2="12" y2="22"></line>
            </svg>
        </button> ` : ''}

        ${config.get("addBefore") || config.get("addAfter") ? `<div class="separator"></div>` : ''}

        ${hasConfig ? `
        <button data-action="edit" title="Edit configuration">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>` : ''}

        ${config.get("duplicate") ? `
        <button data-action="duplicate" title="Duplicate">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button> ` : ''}

        ${config.get("saveAsTemplate") ? `
        <button data-action="save-as-template" title="Save as template">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        </button>
        ` : ''}

        ${(config.get("delete") && (config.get("addBefore") || config.get("addAfter") || hasConfig || config.get("duplicate") || config.get("saveAsTemplate"))) ? ` 
        <div class="separator"></div> ` : ''}

        ${config.get("delete") ? `
        <button data-action="delete" class="danger" title="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button> ` : ''}
    `;
    }

    override connectedCallback(): void {
        super.connectedCallback();
    }

}

if (!customElements.get("p9r-bloc-action-group")) {
    customElements.define("p9r-bloc-action-group", BlocActionGroup);
}