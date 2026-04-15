import { BlocLibrary } from "../components/BlocLibrary/BlocLibrary";
import { Editor } from "../core/Editor";

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

export const textTags = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "a"]);

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

    observeAttributes(){
        const observer = new MutationObserver((mutations) => {
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

        document.addEventListener(p9r.event.SWITCH_MODE, (e) => {
            if ( e.detail === p9r.mode.EDITOR ) {
                observer.observe(this.target, {
                    attributes: true,
                    attributeFilter: [p9r.attr.TEXT.BLOC_MANAGEMENT, p9r.attr.TEXT.EDITABLE]
                })
            } else {
                this.isInitializing = false;
                observer.disconnect();
            }
        })

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
            this.target.after(nextEl)

            // Inside a comp-sync, `onChildrenAdded` re-runs `viewEditor()` on
            // every sibling slot, each scheduling its own rAF focus. Wait two
            // frames so our focus is the last one applied.
            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (nextEl.isConnected) nextEl.focus();
            }));
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
}