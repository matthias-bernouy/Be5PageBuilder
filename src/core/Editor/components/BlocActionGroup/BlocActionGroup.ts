import { HorizontalActionGroup } from 'w13c/core/HorizontalActionGroup/HorizontalActionGroup';
import type { Editor } from '../../core/Editor';
import css from './style.css' with { type: 'text' };
import template from './template.html' with { type: 'text' };
import insertBtnCss from './insert-btn.css' with { type: 'text' };
import insertBtnHtml from './insert-btn.html' with { type: 'text' };
import { computeGroupPosition, positionInsertButtons, type VAnchor } from './positioning';
import { resolveActionBarAnchor } from './anchor';
import { duplicateSibling, insertBlankSibling, openChangeComponentPicker } from './actions';
import { ICON_PARENT, ICON_PIN } from '../../icons';
import type { StateSync } from '../../configuration/Sync/StateSync';

export class BlocActionGroup extends HorizontalActionGroup {

    private _target: HTMLElement | null = null;
    private _editor: Editor | null = null;
    // Element mouseleave is bound to. Defaults to _target, but an Editor can
    // override `getActionBarAnchor()` to return an inner element — then BAG
    // closes when the pointer leaves that element rather than the whole bloc.
    private _hoverEl: HTMLElement | null = null;
    private _insertTarget: HTMLElement | null = null;
    // Editor whose target hosts the + buttons — used to resolve its anchor so
    // insert buttons flank the visible sub-element (e.g. `.header`) rather
    // than the whole bloc when the editor overrides `getActionBarAnchor()`.
    private _insertEditor: Editor | null = null;
    private _insertConfig: { before: boolean; after: boolean } = { before: false, after: false };
    private _lastConfigKey: string = "";
    private _btnBefore: HTMLButtonElement;
    private _btnAfter: HTMLButtonElement;
    private _cooldown: boolean = false;
    private _resizeObserver: ResizeObserver;
    private _pinMenu: HTMLElement | null = null;
    private _metaEl: HTMLElement;
    // When the user clicks "select parent", we rebind to the parent editor but
    // keep the bar under the cursor. This flag tells _reflow() to stop
    // recomputing position from the target rect so the initial ResizeObserver
    // callback (fires async after observe()) doesn't yank the bar to the
    // parent's natural position. Cleared on close().
    private _positionLocked = false;

    constructor() {
        super();

        const style = document.createElement('style');
        style.textContent = css as unknown as string;
        this.shadowRoot!.appendChild(style);

        this._metaEl = document.createElement('div');
        this._metaEl.className = 'p9r-bag-meta';
        this.shadowRoot!.insertBefore(this._metaEl, this.shadowRoot!.querySelector('nav'));

        BlocActionGroup._injectInsertBtnStyles();

        this._btnBefore = this._createInsertButton('before');
        this._btnAfter = this._createInsertButton('after');
        this._btnBefore.addEventListener('click', () => this._insertBlank('before'));
        this._btnAfter.addEventListener('click', () => this._insertBlank('after'));

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
        const hasCustomActions = editor.customActions.length > 0;
        const hasStateSyncs = editor.stateSyncs.length > 0;
        if (allDisabled && !hasCustomActions && !hasStateSyncs && !editor.hasConfigPanel) {
            // Nothing to render — clear so a subsequent open() is a no-op
            // instead of showing an empty circle.
            this.close();
            this._editor = null;
            this._target = null;
            return;
        }
        // open() binds `mouseleave` on the current hover anchor. When setEditor
        // swaps editor without going through close() first (the hover path
        // calls setEditor + open without an intervening close if BAG is
        // already visible on another bloc), the old anchor keeps the
        // listener — one leak per hovered bloc for the life of the page.
        if (this._listenersAttached) {
            this._hoverEl?.removeEventListener("mouseleave", this.handleLeave);
            this._hoverEl?.removeEventListener("mousemove", this.handleMouseMove);
        }
        this._target?.classList.remove("p9r-active");
        this._editor = editor;
        this._target = editor.target;
        this._hoverEl = editor.getActionBarAnchor?.() ?? editor.target;
        if (this._listenersAttached) {
            this._hoverEl.addEventListener("mouseleave", this.handleLeave);
            this._hoverEl.addEventListener("mousemove", this.handleMouseMove);
        }
        this._resolveInsertTarget();
    }

    private _resolveInsertTarget() {
        let ed: Editor | null = this._editor;
        let target: HTMLElement | null = this._target;
        while (ed && target) {
            const cfg = ed.actionBarConfiguration;
            if (cfg.get("addBefore") || cfg.get("addAfter")) {
                this._insertTarget = target;
                this._insertEditor = ed;
                this._insertConfig = { before: !!cfg.get("addBefore"), after: !!cfg.get("addAfter") };
                return;
            }
            const parentId = target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
            if (!parentId) break;
            const parentEd = document.compIdentifierToEditor?.get(parentId) as Editor | undefined;
            if (!parentEd) break;
            ed = parentEd;
            target = parentEd.target;
        }
        this._insertTarget = this._target;
        this._insertEditor = this._editor;
        this._insertConfig = { before: false, after: false };
    }

    open(mouseX?: number, mouseY?: number) {
        if (!this._editor || !this._target || this._cooldown) return;

        this.smartRender();
        this._updateMeta();

        const targetRect = this._target!.getBoundingClientRect();
        const { rect: anchorRect, element: anchorEl } = resolveActionBarAnchor(this._target!, this._editor);
        this._hoverEl = anchorEl;
        const mx = mouseX ?? this._lastMouseX;
        const my = mouseY ?? (this._lastVAnchor === "top" ? anchorRect.top : anchorRect.bottom);
        const { x, y, vAnchor } = computeGroupPosition({
            rect: anchorRect,
            barWidth: this.offsetWidth,
            barHeight: this.offsetHeight,
            mouseX: mx,
            mouseY: my,
        });
        this._lastMouseX = mx;
        this._lastMouseY = my;
        this._lastVAnchor = vAnchor;
        this.setAttribute("data-v-anchor", vAnchor);

        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        this.style.visibility = "visible";
        this.style.opacity = "1";
        this.style.pointerEvents = "auto";

        this._positionInsertButtons(targetRect);
        this._resizeObserver.disconnect();
        this._resizeObserver.observe(this._target!);
        if (anchorEl && anchorEl !== this._target) {
            this._resizeObserver.observe(anchorEl);
        }
        this._target!.classList.add("p9r-active");
        this.addEventListeners();
    }

    close() {
        this._closePinMenu();
        this._target?.classList.remove("p9r-active");
        this.style.visibility = "hidden";
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
        this._btnBefore.style.display = "none";
        this._btnAfter.style.display = "none";
        this._resizeObserver.disconnect();
        this.removeEventListeners();
        this._positionLocked = false;
    }

    private _lastMouseX: number = 0;
    private _lastMouseY: number = 0;
    private _lastVAnchor: VAnchor = "bottom";
    private _mouseMoveRaf: number | null = null;

    private _reflow() {
        if (!this._target) return;
        const targetRect = this._target.getBoundingClientRect();
        if (!this._positionLocked) {
            const { rect: anchorRect } = resolveActionBarAnchor(this._target, this._editor);
            const { x, y, vAnchor } = computeGroupPosition({
                rect: anchorRect,
                barWidth: this.offsetWidth,
                barHeight: this.offsetHeight,
                mouseX: this._lastMouseX,
                mouseY: this._lastMouseY,
            });
            this._lastVAnchor = vAnchor;
            this.setAttribute("data-v-anchor", vAnchor);
            this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        this._btnBefore.style.display = "none";
        this._btnAfter.style.display = "none";
        this._positionInsertButtons(targetRect);
    }

    private handleMouseMove = (e: MouseEvent) => {
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
        if (this._mouseMoveRaf !== null) return;
        this._mouseMoveRaf = requestAnimationFrame(() => {
            this._mouseMoveRaf = null;
            if (!this._listenersAttached) return;
            this._reflow();
        });
    };

    private _positionInsertButtons(_rect: DOMRect) {
        if (!this._insertTarget) return;
        const { rect: insertRect } = resolveActionBarAnchor(this._insertTarget, this._insertEditor);
        const isInline = this._insertTarget.hasAttribute(p9r.attr.ACTION.INLINE_ADDING);
        positionInsertButtons(this._btnBefore, this._btnAfter, insertRect, isInline, this._insertConfig);
    }

    private _insertBlank(position: 'before' | 'after') {
        if (!this._insertTarget) return;
        insertBlankSibling(this._insertTarget, position);
        this.close();
        this._cooldown = true;
        requestAnimationFrame(() => { this._cooldown = false; });
    }

    private _duplicate() {
        if (!this._target) return;
        duplicateSibling(this._target, 'after');
        this.close();
        this._cooldown = true;
        requestAnimationFrame(() => { this._cooldown = false; });
    }

    private _changeComponent() {
        if (!this._target) return;
        openChangeComponentPicker(this._target, () => this.close());
    }

    // ── Event listeners ──

    private _listenersAttached = false;

    private addEventListeners() {
        if (this._listenersAttached) return;
        this.addEventListener("action-click" as any, this.handleBlocActionClick);
        this.addEventListener("mouseleave", this.handleLeave);
        this._hoverEl?.addEventListener("mouseleave", this.handleLeave);
        this._hoverEl?.addEventListener("mousemove", this.handleMouseMove);
        this._btnBefore.addEventListener("mouseenter", this.handleInsertBtnEnter);
        this._btnAfter.addEventListener("mouseenter", this.handleInsertBtnEnter);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("click", this.handleClickOutside);
        this._listenersAttached = true;
    }

    private removeEventListeners() {
        if (!this._listenersAttached) return;
        this.removeEventListener("action-click" as any, this.handleBlocActionClick);
        this.removeEventListener("mouseleave", this.handleLeave);
        this._hoverEl?.removeEventListener("mouseleave", this.handleLeave);
        this._hoverEl?.removeEventListener("mousemove", this.handleMouseMove);
        this._btnBefore.removeEventListener("mouseenter", this.handleInsertBtnEnter);
        this._btnAfter.removeEventListener("mouseenter", this.handleInsertBtnEnter);
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("click", this.handleClickOutside);
        if (this._mouseMoveRaf !== null) {
            cancelAnimationFrame(this._mouseMoveRaf);
            this._mouseMoveRaf = null;
        }
        this._listenersAttached = false;
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
        if (this._pinMenu?.contains(target)) return;
        if (target === this._btnBefore || target === this._btnAfter) return;
        if (this._target?.contains(target)) return;
        this.close();
    }

    private handleLeave = (e: MouseEvent) => {
        const toElement = e.relatedTarget as HTMLElement;
        if (this.contains(toElement)) return;
        if (this._pinMenu?.contains(toElement)) return;
        if (toElement === this._btnBefore || toElement === this._btnAfter) return;

        // If leaving a child but staying within a parent editor, re-open on the parent
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
            case "duplicate":    this._duplicate(); break;
            case "changeComponent": this._changeComponent(); break;
            case "pin-state":    this._handlePinClick(); break;
            case "select-parent": this._selectParent(); break;
            default: {
                const custom = this._editor?.customActions.find(a => a.action === e.detail.action);
                custom?.handler();
            }
        }
    }

    private _parentEditor(): Editor | null {
        const parentId = this._target?.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (!parentId) return null;
        return (document.compIdentifierToEditor?.get(parentId) as Editor | undefined) ?? null;
    }

    private _updateMeta() {
        if (!this._target) { this._metaEl.textContent = ""; return; }
        const parents: string[] = [];
        let el: HTMLElement = this._target;
        while (parents.length < 4) {
            const pid = el.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
            if (!pid) break;
            const pEd = document.compIdentifierToEditor?.get(pid) as Editor | undefined;
            if (!pEd) break;
            parents.push(BlocActionGroup._prettyTag(pEd.target.tagName));
            el = pEd.target;
        }
        this._metaEl.innerHTML = "";
        for (let i = parents.length - 1; i >= 0; i--) {
            const p = document.createElement("span");
            p.className = "p9r-bag-meta__parent";
            p.textContent = parents[i]!;
            this._metaEl.appendChild(p);
            const sep = document.createElement("span");
            sep.className = "p9r-bag-meta__sep";
            sep.textContent = "›";
            this._metaEl.appendChild(sep);
        }
        const current = document.createElement("span");
        current.className = "p9r-bag-meta__current";
        current.textContent = BlocActionGroup._prettyTag(this._target.tagName);
        this._metaEl.appendChild(current);
    }

    private static _prettyTag(tagName: string): string {
        const raw = tagName.toLowerCase().replace(/^(w13c|hub|p9r)-/, "");
        return raw.replace(/(?:^|-)(.)/g, (_, c: string) => " " + c.toUpperCase()).trim();
    }

    private _selectParent() {
        const parent = this._parentEditor();
        if (!parent) return;
        // Freeze the bar at its current on-screen position. If we let open()
        // recompute position from the parent's anchor rect, the bar jumps
        // away from the cursor — the user then has to chase it and the
        // intervening `mouseleave` closes the bar before they can click
        // anything. Rebinding editor/target in place keeps the bar right
        // under the pointer.
        const savedTransform = this.style.transform;
        this._positionLocked = true;
        this.setEditor(parent);
        this.open();
        this.style.transform = savedTransform;
    }

    private _handlePinClick() {
        const syncs = this._editor?.stateSyncs ?? [];
        if (syncs.length === 0) return;
        if (syncs.length === 1) {
            this._togglePin(syncs[0]!);
            this._refreshPinButton();
            return;
        }
        this._togglePinMenu(syncs);
    }

    private _togglePin(sync: StateSync) {
        sync.toggle();
        this._editor?.notifyPinStateChanged(sync);
    }

    private _refreshPinButton() {
        const btn = this.querySelector('[data-action="pin-state"]') as HTMLElement | null;
        if (!btn) return;
        const anyPinned = this._editor?.stateSyncs.some(s => s.isPinned) ?? false;
        btn.toggleAttribute("data-active", anyPinned);
    }

    private _togglePinMenu(syncs: StateSync[]) {
        if (this._pinMenu) { this._closePinMenu(); return; }

        const btn = this.querySelector('[data-action="pin-state"]') as HTMLElement | null;
        if (!btn) return;

        const menu = document.createElement("div");
        menu.className = "p9r-pin-menu";

        const title = document.createElement("div");
        title.className = "p9r-pin-menu__title";
        title.textContent = "Pin state";
        menu.appendChild(title);

        const renderItem = (sync: StateSync) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "p9r-pin-menu__item";
            item.innerHTML = `
                <span class="p9r-pin-menu__icon">${ICON_PIN}</span>
                <span class="p9r-pin-menu__label"></span>
            `;
            (item.querySelector(".p9r-pin-menu__label") as HTMLElement).textContent = sync.label;
            const setState = () => item.toggleAttribute("data-active", sync.isPinned);
            setState();
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                this._togglePin(sync);
                setState();
                this._refreshPinButton();
            });
            return item;
        };

        for (const sync of syncs) menu.appendChild(renderItem(sync));

        const rect = btn.getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom}px`;
        document.body.appendChild(menu);
        this._pinMenu = menu;
    }

    private _closePinMenu() {
        this._pinMenu?.remove();
        this._pinMenu = null;
    }

    private _toggle(action: string, show: boolean) {
        this.querySelector(`[data-action="${action}"]`)?.toggleAttribute("hidden", !show);
    }

    private smartRender(): void {
        const config = this._editor!.actionBarConfiguration;
        const hasConfig = this._editor!.hasConfigPanel;
        const variant = this._editor!.variant;
        const customActions = this._editor!.customActions;

        const customKey = customActions.map(a => a.action).join(",");
        const stateSyncCount = this._editor!.stateSyncs.length;
        const parent = this._parentEditor();
        const hasAnyButton =
            hasConfig ||
            !!config.get("duplicate") ||
            !!config.get("delete") ||
            !!config.get("changeComponent") ||
            customActions.length > 0 ||
            stateSyncCount > 0;
        const showSelectParent = !!parent && hasAnyButton;
        const currentConfigKey = JSON.stringify(Array.from(config.entries())) + hasConfig + variant + customKey + "|s=" + stateSyncCount + "|p=" + showSelectParent;
        if (this._lastConfigKey === currentConfigKey) return;
        this._lastConfigKey = currentConfigKey;

        this.setAttribute("data-variant", variant);
        this.innerHTML = template as unknown as string;

        if (showSelectParent) {
            const btn = document.createElement("button");
            btn.setAttribute("data-action", "select-parent");
            btn.setAttribute("title", "Select parent");
            btn.innerHTML = ICON_PARENT;
            this.insertBefore(btn, this.firstChild);
        }

        this._toggle("edit", hasConfig);
        this._toggle("duplicate", config.get("duplicate")!);
        this._toggle("changeComponent", config.get("changeComponent")!);
        this._toggle("delete", config.get("delete")!);

        // Insert custom action buttons before the "delete" separator
        if (customActions.length > 0) {
            const separator = this.querySelector('[data-group="delete"]');
            for (const action of customActions) {
                const btn = document.createElement("button");
                btn.setAttribute("data-action", action.action);
                btn.setAttribute("title", action.title);
                btn.innerHTML = action.icon;
                this.insertBefore(btn, separator);
            }
        }

        // Pin button: visible if the editor has at least one <p9r-state-sync>.
        if (stateSyncCount > 0) {
            const separator = this.querySelector('[data-group="delete"]');
            const btn = document.createElement("button");
            btn.setAttribute("data-action", "pin-state");
            btn.setAttribute("title", stateSyncCount === 1
                ? `Pin: ${this._editor!.stateSyncs[0]!.label}`
                : "Pin state");
            btn.innerHTML = ICON_PIN;
            this.insertBefore(btn, separator);
            this._refreshPinButton();
        }

        const hasLeftButtons = hasConfig
            || config.get("duplicate")
            || config.get("changeComponent")
            || customActions.length > 0
            || stateSyncCount > 0;
        this.querySelector('[data-group="delete"]')?.toggleAttribute("hidden", !config.get("delete") || !hasLeftButtons);
    }
}

if (!customElements.get("p9r-bloc-action-group")) {
    customElements.define("p9r-bloc-action-group", BlocActionGroup);
}
