import { createDefaultElement } from "../../src/core/createDefaultElement";
import { Editor } from "../../src/core/Editor";

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

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: QuoteEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
});