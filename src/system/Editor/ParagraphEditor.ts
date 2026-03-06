import { ActionBar } from "../Component/Actionbar/Actionbar";
import { Editor } from "../base/Editor";

const cssStyle = `
    p:empty::before,
    span:empty::before{
        content: attr(data-placeholder);
        color: #aaa;
        pointer-events: none;
        display: block;
    }
`

export class ParagraphEditor extends Editor {
    // On stocke les références pour pouvoir les "détacher" plus tard
    private onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    private onInput = (e: Event) => this.handleInput(e);

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        this.viewEditor();
    }

    init() {
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);

        this.target.tabIndex = 0;
        this.target.contentEditable = "true";
        this.target.dataset.placeholder = "Tapez / ou écrivez du texte";

        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("input", this.onInput);

        this.target.focus();
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();
            const nextEl = document.createElement("p");
            this.target.after(nextEl);
        }

        if (e.key === "Backspace" && this.target.innerHTML === ""){
            this.restore();
            const previous = this.target.previousElementSibling as HTMLElement | null;
            const next = this.target.nextElementSibling as HTMLElement | null;
            if ( previous ) previous.focus();
            if ( !previous && next ) next.focus();
            this.target.remove();
        }
    }

    private handleInput(e: Event) {
        console.log(this.target.tagName + " - " + this.target.innerHTML)
        if (this.target.innerHTML === "<br>") {
            this.target.innerHTML = "";
        }

        if (this.target.innerText === "/") {
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

        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("input", this.onInput);
    }
}