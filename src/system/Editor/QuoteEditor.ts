import { ActionBar } from "../Component/Actionbar/Actionbar";
import { Editor } from "../base/Editor";

const cssStyle = `
    p {
        color: #000;
        outline: none;
    }

    p:empty::before{
        content: attr(data-placeholder);
        color: #aaa;
        pointer-events: none;
        display: block;
    }
`

export class QuoteEditor extends Editor {

    private text: HTMLElement;
    private author: HTMLElement;

    constructor(target: HTMLElement) {
        super(target, "");

        const defaultText = this.target.querySelector("[slot=text]") as HTMLElement
        const defaultAuthor = this.target.querySelector("[slot=text]") as HTMLElement

        if (!defaultText) {
            this.text = document.createElement("span");
            this.text.innerHTML = "Ce qui compte ne peut pas toujours être compté, et ce qui peut être compté ne compte pas forcément."
            this.text.setAttribute("slot", "text");
            this.target.append(this.text);
        } else {
            this.text = defaultText;
        }

        if (!defaultAuthor) {
            this.author = document.createElement("span");
            this.author.innerText = "Albert Einstein"
            this.author.setAttribute("slot", "author");
            this.target.append(this.author);
        } else {
            this.author = defaultAuthor;
        }

        this.viewEditor();
    }

    init() {
        this.author.setAttribute("data-editor-bloc-managment", "true");


        this.text.focus();
    }

    restore() {
        this.author.removeAttribute("data-editor-bloc-managment");
    }
}