import { createDefaultElement } from "../../createDefaultElement";
import { Editor } from "../../Editor";

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

document.EditorManager.getObserver().register_editor("w13c-quote", QuoteEditor)
