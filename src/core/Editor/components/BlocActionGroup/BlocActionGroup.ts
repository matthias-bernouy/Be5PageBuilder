import { HorizontalActionGroup } from 'w13c/core/HorizontalActionGroup/HorizontalActionGroup';
import type { Editor } from '../../core/Editor';
import { BlocLibrary } from '../BlocLibrary/BlocLibrary';
import css from './style.css' with { type: 'text' };
import template from './template.html' with { type: 'text' };
import insertBtnCss from './insert-btn.css' with { type: 'text' };
import insertBtnHtml from './insert-btn.html' with { type: 'text' };

export class BlocActionGroup extends HorizontalActionGroup {

    private _target: HTMLElement | null = null;
    private _editor: Editor | null = null;
    private _lastConfigKey: string = "";
    private _btnBefore: HTMLButtonElement;
    private _btnAfter: HTMLButtonElement;
    private _cooldown: boolean = false;
    private _resizeObserver: ResizeObserver;

    constructor() {
        super();

        const style = document.createElement('style');
        style.textContent = css as unknown as string;
        this.shadowRoot!.appendChild(style);

        BlocActionGroup._injectInsertBtnStyles();

        this._btnBefore = this._createInsertButton('before');
        this._btnAfter = this._createInsertButton('after');
        this._btnBefore.addEventListener('click', () => this._insertClone('before'));
        this._btnAfter.addEventListener('click', () => this._insertClone('after'));

        this._resizeObserver = new ResizeObserver(() => this._reflow());
    }

    private static _stylesInjected = false;
    private static _injectInsertBtnStyles() {
        if (BlocActionGroup._stylesInjected) return;
        const style = document.createElement('style');
        style.textContent = insertBtnCss as unknown as string;
        document.head.appendChild(style);
        BlocActionGroup._stylesInjected = true;
    }

    private _createInsertButton(position: 'before' | 'after'): HTMLButtonElement {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = (insertBtnHtml as unknown as string).trim();
        const btn = wrapper.firstElementChild as HTMLButtonElement;
        btn.classList.add(`p9r-insert-btn--${position}`);
        return btn;
    }

    override connectedCallback() {
        super.connectedCallback();
        this.parentElement?.appendChild(this._btnBefore);
        this.parentElement?.appendChild(this._btnAfter);
    }

    setEditor(editor: Editor) {
        const allDisabled = Array.from(editor.actionBarConfiguration.values()).every(v => v === false);
        if (allDisabled) {
            this.close();
            return;
        }
        this._target?.classList.remove("p9r-active");
        this._editor = editor;
        this._target = editor.target;
    }

    open(mouseX?: number, mouseY?: number) {
        if (!this._editor || !this._target || this._cooldown) return;

        this.smartRender();

        const rect = this._target!.getBoundingClientRect();
        const { x, y } = this._computePosition(rect, mouseX, mouseY);

        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        this.style.visibility = "visible";
        this.style.opacity = "1";
        this.style.pointerEvents = "auto";

        this._positionInsertButtons(rect);
        this._resizeObserver.observe(this._target!);
        this._target!.classList.add("p9r-active");
        this.addEventListeners();
    }

    close() {
        this._target?.classList.remove("p9r-active");
        this.style.visibility = "hidden";
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
        this._btnBefore.style.display = "none";
        this._btnAfter.style.display = "none";
        this._resizeObserver.disconnect();
        this.removeEventListeners();
    }

    private _lastMouseX: number = 0;
    private _lastVAnchor: 'top' | 'bottom' = 'bottom';

    private _computePosition(rect: DOMRect, mouseX?: number, mouseY?: number): { x: number; y: number } {
        const centerY = rect.top + rect.height / 2;
        const anchorTop = mouseY != null && mouseY < centerY;
        this._lastVAnchor = anchorTop ? 'top' : 'bottom';

        const mx = mouseX ?? this._lastMouseX;
        this._lastMouseX = mx;

        const halfWidth = this.offsetWidth / 2;
        let x = mx + window.scrollX - halfWidth;
        const minX = rect.left + window.scrollX;
        const maxX = rect.right + window.scrollX - this.offsetWidth;
        x = Math.max(minX, Math.min(maxX, x));

        const y = anchorTop
            ? rect.top + window.scrollY - this.offsetHeight
            : rect.bottom + window.scrollY;

        return { x, y };
    }

    private _reflow() {
        if (!this._target) return;
        const rect = this._target.getBoundingClientRect();
        const { x, y } = this._computePosition(
            rect,
            this._lastMouseX,
            this._lastVAnchor === 'top' ? rect.top : rect.bottom,
        );
        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        this._btnBefore.style.display = "none";
        this._btnAfter.style.display = "none";
        this._positionInsertButtons(rect);
    }

    private _positionInsertButtons(rect: DOMRect) {
        const config = this._editor!.actionBarConfiguration;
        const showBefore = config.get("addBefore");
        const showAfter = config.get("addAfter");

        if (!showBefore && !showAfter) return;

        const isInline = this._target!.hasAttribute(p9r.attr.ACTION.INLINE_ADDING);
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        this._btnBefore.classList.toggle('p9r-insert-btn--inline', isInline);
        this._btnAfter.classList.toggle('p9r-insert-btn--inline', isInline);

        if (isInline) {
            const centerY = rect.top + scrollY + rect.height / 2 - 12;
            if (showBefore) {
                this._btnBefore.style.left = `${rect.left + scrollX - 12}px`;
                this._btnBefore.style.top = `${centerY}px`;
                this._btnBefore.style.display = "flex";
            }
            if (showAfter) {
                this._btnAfter.style.left = `${rect.right + scrollX - 12}px`;
                this._btnAfter.style.top = `${centerY}px`;
                this._btnAfter.style.display = "flex";
            }
        } else {
            const centerX = rect.left + scrollX + rect.width / 2 - 12;
            if (showBefore) {
                this._btnBefore.style.left = `${centerX}px`;
                this._btnBefore.style.top = `${rect.top + scrollY - 12}px`;
                this._btnBefore.style.display = "flex";
            }
            if (showAfter) {
                this._btnAfter.style.left = `${centerX}px`;
                this._btnAfter.style.top = `${rect.bottom + scrollY - 12}px`;
                this._btnAfter.style.display = "flex";
            }
        }
    }

    private _insertClone(position: 'before' | 'after') {
        if (!this._target) return;
        const clone = this._target.cloneNode(true) as HTMLElement;
        clone.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
        clone.querySelectorAll(`[${p9r.attr.EDITOR.IS_EDITOR}]`).forEach(el => {
            el.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
        });
        if (position === 'before') {
            this._target.before(clone);
        } else {
            this._target.after(clone);
        }
        this.close();
        this._cooldown = true;
        requestAnimationFrame(() => { this._cooldown = false; });
    }

    private _changeComponent() {
        if (!this._target) return;
        const library = BlocLibrary.open();
        library.addEventListener('insert', ((e: CustomEvent) => {
            const newEl = document.createElement(e.detail.id);

            if (this._target!.hasAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)) {
                newEl.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this._target!.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)!);
            }

            if (this._target!.hasAttribute("slot")) {
                newEl.setAttribute("slot", this._target!.getAttribute("slot")!);
            }

            newEl.innerHTML = this._target!.innerHTML;

            this._target!.replaceWith(newEl);
            this.close();
        }) as EventListener);
    }

    // ── Event listeners ──

    private addEventListeners() {
        this.addEventListener("action-click" as any, this.handleBlocActionClick);
        this.addEventListener("mouseleave", this.handleLeave);
        this._target?.addEventListener("mouseleave", this.handleLeave);
        this._btnBefore.addEventListener("mouseenter", this.handleInsertBtnEnter);
        this._btnAfter.addEventListener("mouseenter", this.handleInsertBtnEnter);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("click", this.handleClickOutside);
    }

    private removeEventListeners() {
        this.removeEventListener("action-click" as any, this.handleBlocActionClick);
        this.removeEventListener("mouseleave", this.handleLeave);
        this._target?.removeEventListener("mouseleave", this.handleLeave);
        this._btnBefore.removeEventListener("mouseenter", this.handleInsertBtnEnter);
        this._btnAfter.removeEventListener("mouseenter", this.handleInsertBtnEnter);
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("click", this.handleClickOutside);
    }

    private handleInsertBtnEnter = () => {}

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") this.close();
        if ((e.key === "Delete" || e.key === "Backspace") && this._target) {
            const active = document.activeElement;
            if (active && (active as HTMLElement).isContentEditable) return;
            const canDelete = this._editor?.actionBarConfiguration.get("delete");
            if (!canDelete) return;
            e.preventDefault();
            this._target.remove();
            this.close();
        }
    }

    private handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (this.contains(target)) return;
        if (target === this._btnBefore || target === this._btnAfter) return;
        if (this._target?.contains(target)) return;
        this.close();
    }

    private handleLeave = (e: MouseEvent) => {
        const toElement = e.relatedTarget as HTMLElement;
        if (this.contains(toElement)) return;
        if (toElement === this._btnBefore || toElement === this._btnAfter) return;

        // Si on quitte un enfant mais qu'on reste dans un parent éditeur, ré-ouvrir sur le parent
        const parentEditor = toElement?.closest?.(`[${p9r.attr.EDITOR.IS_EDITOR}]`) as HTMLElement | null;
        if (parentEditor && parentEditor.contains(this._target)) {
            parentEditor.dispatchEvent(new MouseEvent('mouseenter', { clientX: e.clientX, clientY: e.clientY, bubbles: false }));
            return;
        }

        this.close();
    }

    private handleBlocActionClick = (e: CustomEvent) => {
        switch (e.detail.action) {
            case "delete":       this._target?.remove(); this.close(); break;
            case "edit":         this._editor?.showConfigPanel(); break;
            case "duplicate":    this._insertClone('after'); break;
            case "changeComponent": this._changeComponent(); break;
        }
    }

    private _toggle(action: string, show: boolean) {
        this.querySelector(`[data-action="${action}"]`)?.toggleAttribute("hidden", !show);
    }

    private smartRender(): void {
        const config = this._editor!.actionBarConfiguration;
        const hasConfig = this._editor!._panelConfig != null;

        const currentConfigKey = JSON.stringify(Array.from(config.entries())) + hasConfig;
        if (this._lastConfigKey === currentConfigKey) return;
        this._lastConfigKey = currentConfigKey;

        this.innerHTML = template as unknown as string;

        this._toggle("edit", hasConfig);
        this._toggle("duplicate", config.get("duplicate")!);
        this._toggle("changeComponent", config.get("changeComponent")!);
        this._toggle("delete", config.get("delete")!);

        this.querySelector('[data-group="delete"]')?.toggleAttribute("hidden", !config.get("delete"));
    }
}

if (!customElements.get("p9r-bloc-action-group")) {
    customElements.define("p9r-bloc-action-group", BlocActionGroup);
}
