import { createDefaultElement } from "../base/createDefaultElement";
import { Editor } from "../base/Editor";

const cssStyle = ``

if ( !document.menuItems ){
    document.menuItems = [];
}

document.menuItems.push({
    htmlTag: "w13c-quote",
    description: "Quote",
    icon: "",
    shortcut: "Q",
    title: "Quote"
})

export class QuoteEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, "");

        createDefaultElement(this.target, "text", "span");
        createDefaultElement(this.target, "author", "span");
        this.viewEditor();
    }

    init() {
    }

    restore() {
    }
}