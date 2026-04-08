import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { Editor } from "src/core/Editor/core/Editor";

export class ArticleEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "");

        createDefaultElement(this.target, "content");
        createDefaultElement(this.target, "badge", "span", "Event");
        createDefaultElement(this.target, "time", "span", "5 min read");
        createDefaultElement(this.target, "author-name", "span", "Bertrand Vittecoq");
        createDefaultElement(this.target, "publish-date", "span", "January 10, 1970");
        createDefaultElement(this.target, "title", "span", "Your story title");
        createDefaultElement(this.target, "lead", "span", "A captivating lead that summarizes the article and invites the reader.");
        createDefaultElement(this.target, "cover-image", "img");

        this.viewEditor();
    }

    init() {
        const content = this.target.querySelectorAll("[slot=content]");
        content.forEach((v) => {
            const ele = v as HTMLElement;
            ele.dataset.editorBlocManagment = "true"
        })
    }

    restore() {
    }
}