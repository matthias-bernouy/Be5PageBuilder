import { HorizontalActionGroup } from 'w13c/core/HorizontalActionGroup/HorizontalActionGroup';
import type { Editor } from '../core/Editor';

export class BlocActionGroup extends HorizontalActionGroup {

    private _target: HTMLElement | null = null;
    private _editor: Editor | null = null;
    private _lastConfigKey: string = ""; // Pour éviter les render inutiles

    constructor() {
        super();
        // Configuration initiale "invisible" pour le CLS
        this.style.position = "absolute";
        this.style.left = "0";
        this.style.top = "0";
        this.style.visibility = "hidden";
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
        this.style.padding = "8px 32px 8px 16px";
        this.style.zIndex = "10000";
        this.style.willChange = "transform, opacity"; // Optimisation GPU
        this.style.transition = "opacity 0.1s ease-out"; // Optionnel : transition fluide
    }

    setEditor(editor: Editor) {
        const allDisabled = Array.from(editor.actionBarConfiguration.values()).every(v => v === false);
        if (allDisabled) {
            this.close();
            return;
        }
        this._editor = editor;
        this._target = editor.target;
    }

    open() {
        if (!this._editor || !this._target) return;

        // 1. Mise à jour du contenu seulement si la config change
        this.smartRender();

        // 2. Calcul de position (Read)
        const rect = this._target!.getBoundingClientRect();
        const x = rect.left + window.scrollX;
        const y = rect.bottom + window.scrollY;

        // 3. Application via Transform (Write - Pas de Layout Shift)
        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        
        // 4. Affichage
        this.style.visibility = "visible";
        this.style.opacity = "1";
        this.style.pointerEvents = "auto";

        this.addEventListeners();
    }

    close() {
        this.style.visibility = "hidden";
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
        this.removeEventListeners();
    }

    private addEventListeners() {
        this.addEventListener("action-click" as any, this.handleBlocActionClick);
        this.addEventListener("mouseleave", this.handleLeave);
        this._target?.addEventListener("mouseleave", this.handleLeave);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    private removeEventListeners() {
        this.removeEventListener("action-click" as any, this.handleBlocActionClick);
        this.removeEventListener("mouseleave", this.handleLeave);
        this._target?.removeEventListener("mouseleave", this.handleLeave);
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") this.close();
    }

    private handleLeave = (e: MouseEvent) => {
        const toElement = e.relatedTarget as HTMLElement;
        if (this.contains(toElement)) return;
        this.close();
    }

    private handleBlocActionClick = (e: CustomEvent) => {
        const action = e.detail.action;
        const p = document.createElement("p");

        switch (action) {
            case "delete":
                this._target?.remove();
                this.close();
                break;
            case "edit":
                this._editor?.showConfigPanel();
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
        }
    }

    private smartRender(): void {
        const config = this._editor!.actionBarConfiguration;
        const hasConfig = this._editor!._panelConfig != null;
        
        const currentConfigKey = JSON.stringify(Array.from(config.entries())) + hasConfig;

        if (this._lastConfigKey === currentConfigKey) return;
        
        this._lastConfigKey = currentConfigKey;

        this.innerHTML = `
            ${config.get("addBefore") ? `
                <button data-action="add-before" title="Add before">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="9 5 12 2 15 5"></polyline><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                </button>` : ''}

            ${config.get("addAfter") ? `
                <button data-action="add-after" title="Add after">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="9 19 12 22 15 19"></polyline><line x1="12" y1="12" x2="12" y2="22"></line></svg>
                </button>` : ''}

            ${(config.get("addBefore") || config.get("addAfter")) ? `<div class="separator"></div>` : ''}

            ${hasConfig ? `
                <button data-action="edit" title="Edit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>` : ''}

            ${config.get("duplicate") ? `
                <button data-action="duplicate" title="Duplicate">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>` : ''}

            ${config.get("delete") ? `
                <div class="separator"></div>
                <button data-action="delete" class="danger" title="Delete">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>` : ''}
        `;
    }
}

if (!customElements.get("p9r-bloc-action-group")) {
    customElements.define("p9r-bloc-action-group", BlocActionGroup);
}