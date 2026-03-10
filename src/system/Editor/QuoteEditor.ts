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
        createDefaultElement(this.target, "text", "span", "Je ne suis pas athée. Je ne sais pas si je peux me définir comme panthéiste. Le problème est trop vaste pour nos esprits limités.");
        createDefaultElement(this.target, "author", "span", "Albert Einstein");
        this.viewEditor();
    }

    init() {
    }

    restore() {
    }
}