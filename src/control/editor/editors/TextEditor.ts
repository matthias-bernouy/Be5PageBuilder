import { BlocLibrary } from "../components/BlocLibrary/BlocLibrary";
import { Editor } from "../runtime/Editor";

const cssStyle = `
:is(h1, h2, h3, h4, h5, h6, p, span, blockquote, a):empty::before {
    content: attr(p9r-text-placeholder);
    color: var(--text-muted, #aaa);
    pointer-events: none;
    display: block;
    font-style: italic;
    font-weight: 300;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
    :is(h1, h2, h3, h4, h5, h6, p, span, blockquote):empty {
        display: flex
    }
`

export const textTags = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "a", "b", "i", "u"]);

export type TextEditorOptions = {
    createBloc: boolean;
    writingRichText: boolean;
    writingText: boolean;
    deleteSelf: boolean;
}

export class TextEditor extends Editor {
    private onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    private onInput = (e: Event) => this.handleInput(e);
    private onPaste = (e: ClipboardEvent) => this.handlePaste(e);
    private isInitializing = false;

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        this.observeAttributes();
    }

    private attrObserver?: MutationObserver;

    observeAttributes(){
        this.attrObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('p9r-')) {
                    if ( document.EditorManager.getMode() === p9r.mode.EDITOR ){
                        if ( !this.isInitializing ){
                            this.isInitializing = true;
                            this.init();
                        }
                    }
                }
            }
        });
    }

    /**
     * Used to be an anonymous `document.addEventListener(SWITCH_MODE)` that
     * was never removed — one leaked closure per TextEditor. Folded into the
     * registry-driven hook so lifecycle is explicit.
     */
    public override onSwitchMode(mode: string) {
        super.onSwitchMode(mode);
        if (!this.attrObserver) return;
        if (mode === p9r.mode.EDITOR) {
            this.attrObserver.observe(this.target, {
                attributes: true,
                attributeFilter: [p9r.attr.TEXT.BLOC_MANAGEMENT, p9r.attr.TEXT.EDITABLE],
            });
        } else {
            this.isInitializing = false;
            this.attrObserver.disconnect();
        }
    }

    private handlePaste(e: ClipboardEvent) {
        e.preventDefault();
        const text = e.clipboardData?.getData("text/plain") || "";

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        selection.deleteFromDocument();
        const textNode = document.createTextNode(text);

        const range = selection.getRangeAt(0);
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    private static _editorAttrs = new Set([
        'contenteditable', 'tabindex', 'draggable',
    ]);

    private createElement(tag: string){
        const element = document.createElement(tag) as HTMLElement;
        Array.from(this.target.attributes).forEach(attr => {
            if (attr.name.startsWith('p9r-')) return;
            if (attr.name === 'class') return;
            if (TextEditor._editorAttrs.has(attr.name)) return;
            element.setAttribute(attr.name, attr.value);
        });
        // Preserve the parent-identifier so ObserverManager can notify the
        // parent (onChildrenAdded) and its CompSync re-applies slot
        // attributes (DISABLE_CHANGE_COMPONENT, etc.) on the new node.
        const parentId = this.target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (parentId) element.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
        element.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        return element;
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();
            e.stopImmediatePropagation()

            // Enter inserts a sibling — block it when the action bar forbids
            // adding after (e.g. a non-multiple p9r-comp-sync slot).
            if (this.isAddAfterDisabled) return;

            const nextEl = this.createElement("p")
            // Make nextEl focusable BEFORE the sync focus call: `TextEditor.init()`
            // only sets contentEditable/tabIndex inside a rAF (post-microtask),
            // so a bare `focus()` here would be a no-op and OS key-repeat would
            // keep firing on `this.target`, stacking every sibling behind the
            // same anchor in reverse order.
            nextEl.contentEditable = "true";
            nextEl.tabIndex = 0;

            // Split the target at the caret: everything after the caret moves
            // into the new sibling. Non-collapsed selections are dropped first
            // so "Hello [World]" + Enter leaves "Hello" / "" rather than
            // "Hello " / "World".
            const sel = window.getSelection();
            if (sel && sel.rangeCount && sel.anchorNode && this.target.contains(sel.anchorNode) && this.target.lastChild) {
                const range = sel.getRangeAt(0);
                if (!range.collapsed) range.deleteContents();
                const tail = range.cloneRange();
                // End AFTER the last child (inside target), not after target
                // itself — the latter spans the target's closing boundary and
                // extractContents would pull the target node itself into the
                // fragment, producing a nested <p>.
                tail.setEndAfter(this.target.lastChild);
                const fragment = tail.extractContents();
                nextEl.appendChild(fragment);
            }

            this.target.after(nextEl)
            // Wire the new <p> as an editor synchronously. Without this, the
            // MutationObserver path is async — a second Enter pressed before
            // it fires lands on an unbound element and falls through to the
            // native contentEditable behavior (which inserts a nested <p>).
            const observer = document.EditorManager?.getObserver?.();
            if (observer) {
                observer.make_it_editor(nextEl);
            } else {
                const e = new TextEditor(nextEl);
                e.viewEditor();
            }
            this._focusWithCaret(nextEl, "start");
        }

        if (e.key === "Backspace" && this.target.innerHTML === "" && !this.isDeleteDisabled) {
            // Must stop propagation: BAG's window-level keydown would otherwise
            // receive the same Backspace and, if the user was hovering the
            // parent, delete the parent as well.
            e.preventDefault();
            e.stopImmediatePropagation();
            this.restore();
            const previous = this.target.previousElementSibling as HTMLElement | null;
            const next = this.target.nextElementSibling as HTMLElement | null;
            if ( previous ) previous.focus();
            if ( !previous && next ) next.focus();
            this.target.remove();
        }

        if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const isUp = e.key === "ArrowUp";
            const onEdge = isUp ? this._isCaretOnFirstLine() : this._isCaretOnLastLine();
            if (!onEdge) return;
            const adjacent = this._findAdjacentTextEditor(isUp ? "prev" : "next");
            if (!adjacent) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            this._focusWithCaret(adjacent, isUp ? "end" : "start");
        }
    }

    private _isCaretOnFirstLine(): boolean {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return false;
        if (this.target.innerHTML === "") return true;
        const range = sel.getRangeAt(0);
        const rects = range.getClientRects();
        const targetTop = this.target.getBoundingClientRect().top;
        const first = rects[0];
        if (!first) {
            // Collapsed caret at a boundary may yield no rect — fall back to
            // the element rect so the first keystroke still navigates.
            return true;
        }
        return Math.abs(first.top - targetTop) < 5;
    }

    private _isCaretOnLastLine(): boolean {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return false;
        if (this.target.innerHTML === "") return true;
        const range = sel.getRangeAt(0);
        const rects = range.getClientRects();
        const targetBottom = this.target.getBoundingClientRect().bottom;
        const last = rects[rects.length - 1];
        if (!last) return true;
        return Math.abs(last.bottom - targetBottom) < 5;
    }

    private _findAdjacentTextEditor(direction: "prev" | "next"): HTMLElement | null {
        const selector = Array.from(textTags).map(t => `${t}[contenteditable="true"]`).join(",");
        const all = Array.from(document.querySelectorAll<HTMLElement>(selector));
        const idx = all.indexOf(this.target);
        if (idx === -1) return null;
        return direction === "prev" ? (all[idx - 1] ?? null) : (all[idx + 1] ?? null);
    }

    private _focusWithCaret(el: HTMLElement, position: "start" | "end") {
        el.focus();
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.createRange();
        if (el.innerHTML === "") {
            range.setStart(el, 0);
            range.collapse(true);
        } else if (position === "start") {
            range.selectNodeContents(el);
            range.collapse(true);
        } else {
            range.selectNodeContents(el);
            range.collapse(false);
        }
        sel.removeAllRanges();
        sel.addRange(range);
    }

    private handleInput(e: Event) {
        if (this.target.innerHTML === "<br>") {
            this.target.innerHTML = "";
        }
        if (this.target.innerText === "/" && this.isBlocManagementEnabled && !this.isChangeComponentDisabled) {
            e.stopPropagation();
            e.stopImmediatePropagation()
            const actionbar = BlocLibrary.open();
            actionbar.addEventListener("insert", (e: any) => {
                if (e.detail.type === 'template') {
                    const fragment = document.createRange().createContextualFragment(e.detail.html);
                    this.target.replaceWith(fragment);
                } else if (e.detail.type === 'snippet') {
                    const new_node = document.createElement('w13c-snippet');
                    new_node.setAttribute('identifier', e.detail.identifier);
                    this.target.replaceWith(new_node);
                } else {
                    const new_node = this.createElement(e.detail.id);
                    this.target.replaceWith(new_node);
                }
            }, { once: true });
        }
    }

    init() {
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
        this.target.removeEventListener("paste", this.onPaste);

        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("input", this.onInput);
        this.target.addEventListener("paste", this.onPaste);
        
        if ( this.isTextEditable ){
            this.target.tabIndex = 0;
            this.target.contentEditable = "true";
            if (this.isBlocManagementEnabled && !this.isChangeComponentDisabled){
                this.target.setAttribute(p9r.attr.TEXT.PLACEHOLDER, "Type / or write text");
            } else {
                this.target.setAttribute(p9r.attr.TEXT.PLACEHOLDER, "Type text");
            }
            requestAnimationFrame(() => {
                if (this.target.isConnected) {
                    this.target.focus();
                }
            });
        }
    }

    private get isDeleteDisabled(){
        const deleteAttr = this.target.getAttribute(p9r.attr.ACTION.DISABLE_DELETE);
        return deleteAttr ? deleteAttr === "true" : false;
    }

    // Text blocs are driven by keyboard: Enter adds a sibling, Backspace on
    // empty deletes, "/" opens the component picker. The standard action-bar
    // buttons are all redundant — hide them by default so the bar disappears
    // unless the bloc has a config panel, custom actions or state-syncs.
    // `p9r-force-delete-button` / `p9r-force-duplicate-button` opt individual
    // buttons back in (e.g. a decorative heading the user never empties).
    override refreshActionBarFeatures() {
        super.refreshActionBarFeatures();
        this._actionBarFeatures.set("addBefore", false);
        this._actionBarFeatures.set("addAfter", false);
        this._actionBarFeatures.set("changeComponent", false);
        if (!this.target.hasAttribute("p9r-force-delete-button")) {
            this._actionBarFeatures.set("delete", false);
        }
        if (!this.target.hasAttribute("p9r-force-duplicate-button")) {
            this._actionBarFeatures.set("duplicate", false);
        }
    }

    private get isAddAfterDisabled(){
        return this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER) === "true";
    }

    private get isChangeComponentDisabled(){
        return this.target.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT) === "true";
    }

    private get isBlocManagementEnabled(){
        const blocManagementAttr = this.target.getAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT);
        return blocManagementAttr ? blocManagementAttr === "true" : true;
    }

    private get isTextEditable(){
        const textEditableAttr = this.target.getAttribute(p9r.attr.TEXT.EDITABLE);
        return textEditableAttr ? textEditableAttr === "true" : true;
    }

    restore() {
        this.target.removeAttribute('tabIndex');
        this.target.removeAttribute('contentEditable');
        this.target.removeAttribute(p9r.attr.TEXT.PLACEHOLDER);

        this.target.removeAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT);
        this.target.removeAttribute(p9r.attr.TEXT.EDITABLE);

        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
        this.target.removeEventListener("paste", this.onPaste);
    }

    public override dispose() {
        // If disposed while in EDITOR mode, the observer is still connected —
        // disconnect explicitly so the callback closure (and its capture of
        // `this`) doesn't keep the editor + target alive.
        this.attrObserver?.disconnect();
        this.attrObserver = undefined;
        // Pair the add in init(): without this, removing a text bloc leaves
        // three listeners (keydown/input/paste) bound to the detached node,
        // each holding the editor + target alive through the handler closure.
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
        this.target.removeEventListener("paste", this.onPaste);
        super.dispose();
    }
}