import { ActionBar } from "../Component/Actionbar/Actionbar";
import { Editor } from "../base/Editor";

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
    private isBlocAvailable: boolean = false;
    private isTextEditable: boolean = false;

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        const blocAvailable = this.target.dataset.editorBlocManagment;
        const textEditable = this.target.dataset.editorTextEditable;
        this.isBlocAvailable = blocAvailable != null && blocAvailable === "true";
        this.isTextEditable = textEditable != null && textEditable === "true";
        this.viewEditor();
    }

    init() {
        if (this.isBlocAvailable) {
            this.target.dataset.editorBlocManagment = "true"
        }
        if (this.isTextEditable) {
            this.target.dataset.editorTextEditable = "true"
        }

        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);

        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("input", this.onInput);

        if ( this.isTextEditable ){
            this.target.tabIndex = 0;
            this.target.contentEditable = "true";
            if (this.isBlocAvailable){
                this.target.dataset.placeholder = "Tapez / ou écrivez du texte";
            } else {
                this.target.dataset.placeholder = "Tapez du texte";
            }
            this.target.focus();
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();
            const nextEl = document.createElement("p");
            this.target.after(nextEl);
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

    restore() {
        this.target.removeAttribute('tabIndex');
        this.target.removeAttribute('contentEditable');
        this.target.removeAttribute('data-placeholder');

        this.target.removeAttribute('data-editor-bloc-managment');
        this.target.removeAttribute('data-editor-text-editable');

        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
    }
}