import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { Editor } from "src/core/Editor/core/Editor";

export class ArticleEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "");

        createDefaultElement(this.target, "content");
        createDefaultElement(this.target, "badge", "span", "Évènement");
        createDefaultElement(this.target, "time", "span", "5 min de lecture");
        createDefaultElement(this.target, "author-name", "span", "Bertrand Vittecoq");
        createDefaultElement(this.target, "publish-date", "span", "10 Janvier 1970");
        createDefaultElement(this.target, "title", "span", "Le titre de votre histoire");
        createDefaultElement(this.target, "lead", "span", "Un chapô captivant qui résume l'article et incite à la lecture.");
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