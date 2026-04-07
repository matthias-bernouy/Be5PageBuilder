import { HorizontalActionGroup } from 'w13c/core/HorizontalActionGroup/HorizontalActionGroup';
import type { Editor } from '../../core/Editor';
import css from './style.css' with { type: 'text' };
import template from './template.html' with { type: 'text' };

export class BlocActionGroup extends HorizontalActionGroup {

    private _target: HTMLElement | null = null;
    private _editor: Editor | null = null;
    private _lastConfigKey: string = "";

    constructor() {
        super();
        const style = document.createElement('style');
        style.textContent = css as unknown as string;
        this.shadowRoot!.appendChild(style);
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

        this.smartRender();

        const rect = this._target!.getBoundingClientRect();
        const x = rect.left + window.scrollX;
        const y = rect.bottom + window.scrollY;

        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;

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
                clone.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
                clone.querySelectorAll(`[${p9r.attr.EDITOR.IS_EDITOR}]`).forEach(el => {
                    el.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
                });
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

    private _toggle(action: string, show: boolean) {
        this.querySelector(`[data-action="${action}"]`)?.toggleAttribute("hidden", !show);
    }

    private smartRender(): void {
        const config = this._editor!.actionBarConfiguration;
        const hasConfig = this._editor!._panelConfig != null;

        console.log(config, hasConfig)

        const currentConfigKey = JSON.stringify(Array.from(config.entries())) + hasConfig;
        if (this._lastConfigKey === currentConfigKey) return;
        this._lastConfigKey = currentConfigKey;

        this.innerHTML = template as unknown as string;

        this._toggle("add-before", config.get("addBefore")!);
        this._toggle("add-after", config.get("addAfter")!);
        this._toggle("edit", hasConfig);
        this._toggle("duplicate", config.get("duplicate")!);
        this._toggle("delete", config.get("delete")!);

        const showAdd = config.get("addBefore") || config.get("addAfter");
        this.querySelector('[data-group="add"]')?.toggleAttribute("hidden", !showAdd);
        this.querySelector('[data-group="delete"]')?.toggleAttribute("hidden", !config.get("delete"));
    }
}

if (!customElements.get("p9r-bloc-action-group")) {
    customElements.define("p9r-bloc-action-group", BlocActionGroup);
}
