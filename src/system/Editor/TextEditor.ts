import { ActionBar } from "../Component/Actionbar/Actionbar";
import { Editor } from "../base/Editor";
import type { PageMode } from "../base/EditorManager";

const cssStyle = `
:is(h1, h2, h3, h4, h5, h6, p, span, li, blockquote):empty::before {
    content: attr(data-placeholder);
    color: #aaa;
    pointer-events: none;
    display: inline-block;
    font-style: italic;
    font-weight: 300;
    /* On s'assure que le placeholder ne prend pas toute la largeur */
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
`

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
    private isBlocAvailable: boolean = false;
    private isTextEditable: boolean = false;

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        this.viewEditor();
        this.observeAttributes();
    }

    observeAttributes(){
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-')) {
                    if ( document.EditorManager.getMode() === "editor-mode" ){
                        this.init();
                    }
                }
            }
        });

        document.addEventListener("switch-mode", (e: any) => {
            const mode: PageMode = e.detail;
            if ( mode === "editor-mode" ) {
                observer.observe(this.target, {
                    attributes: true,
                    attributeFilter: ["data-editor-bloc-managment", "data-editor-text-editable"]
                })
            } else {
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

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();

            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            
            const splitRange = document.createRange();
            splitRange.setStart(range.startContainer, range.startOffset);
            splitRange.setEndAfter(this.target.lastChild || this.target);

            const extractedContent = splitRange.extractContents();

            const nextEl = document.createElement("p");
            nextEl.appendChild(extractedContent);

            this.target.after(nextEl);

            requestAnimationFrame(() => {
                nextEl.focus();
                const newSelection = window.getSelection();
                const newRange = document.createRange();
                newRange.setStart(nextEl, 0);
                newRange.collapse(true);
                newSelection?.removeAllRanges();
                newSelection?.addRange(newRange);
            });
        }

        if (e.key === "Backspace" && this.target.innerHTML === "" && this.isBlocAvailable){
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

        if (this.target.innerText === "/" && this.isBlocAvailable) {
            const actionbar = ActionBar.open(document.menuItems);
            actionbar.addEventListener("select", (e: any) => {
                const new_node = document.createElement(e.detail.htmlTag);
                this.target.replaceWith(new_node);
            }, { once: true });
        }
    }

    init() {
        const editable = this.target.dataset.editorTextEditable = "true";
        this.isTextEditable = editable != null && editable === "true";
        const blocManageur = this.target.dataset.editorBlocManagment = "true";
        this.isBlocAvailable = blocManageur != null && blocManageur === "true";

        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
        this.target.removeEventListener("paste", this.onPaste);

        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("input", this.onInput);
        this.target.addEventListener("paste", this.onPaste);

        if ( this.isTextEditable ){
            this.target.tabIndex = 0;
            this.target.contentEditable = "true";
            if (this.isBlocAvailable){
                this.target.dataset.placeholder = "Tapez / ou écrivez du texte";
            } else {
                this.target.dataset.placeholder = "Tapez du texte";
            }
            requestAnimationFrame(() => {
                if (this.target.isConnected) {
                    this.target.focus();
                }
            });
        }
    }

    restore() {
        this.target.removeAttribute('tabIndex');
        this.target.removeAttribute('contentEditable');
        this.target.removeAttribute('data-placeholder');

        this.target.removeAttribute('data-editor-bloc-managment');
        this.target.removeAttribute('data-editor-text-editable');

        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
        this.target.removeEventListener("paste", this.onPaste);
    }
}