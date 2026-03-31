import { BlocLibrary } from "../components/BlocLibrary/BlocLibrary";
import { Editor } from "../core/Editor";
import type { PageMode } from "../core/EditorManager";

const cssStyle = `
:is(h1, h2, h3, h4, h5, h6, p, span, blockquote):empty::before {
    content: attr(data-placeholder);
    //color: #aaa;
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
    private isBlocAvailable: boolean = false;
    private isTextEditable: boolean = false;
    private isInitializing = false; // Verrou pour éviter l'auto-déclenchement

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        this.observeAttributes();
    }

    observeAttributes(){
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-')) {
                    if ( document.EditorManager.getMode() === "editor-mode" ){
                        if ( !this.isInitializing ){
                            this.isInitializing = true;
                            this.init();
                        }
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

    private isManaged(){
       return this.target.parentElement?.closest('w13c-quote, w13c-article');
    }

    private createElement(tag: string){
        const element = document.createElement(tag) as HTMLElement;
        Array.from(this.target.attributes).forEach(attr => {
            element.setAttribute(attr.name, attr.value);
        });
        delete element.dataset.isEditor;
        if ( !textTags.has(tag) ) {
            delete element.dataset.editorTextEditable;
            delete element.dataset.editorBlocManagment;
            delete element.dataset.placeholder;
            element.removeAttribute("tabindex");
            element.removeAttribute("contenteditable");
        }
        return element;
    }

    static createPElement(){
        const p = document.createElement("p");
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();
            e.stopImmediatePropagation()

            const nextEl = this.createElement("p")
            this.target.after(nextEl)

            requestAnimationFrame(() => {
                nextEl.focus();
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
            e.stopPropagation();
            e.stopImmediatePropagation()
            const actionbar = BlocLibrary.open();
            actionbar.addEventListener("insert", (e: any) => {
                const new_node = this.createElement(e.detail.id);
                this.target.replaceWith(new_node);
            }, { once: true });
        }
    }

    init() {
        this.target.dataset.editorTextEditable  = "true";
        if (!this.isManaged()) {
            this.target.dataset.editorBlocManagment = "true";
        } else {
            this.target.draggable = false;
        }

        const editable = this.target.dataset.editorTextEditable;
        this.isTextEditable = editable != null && editable === "true";
        const blocManageur = this.target.dataset.editorBlocManagment;
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