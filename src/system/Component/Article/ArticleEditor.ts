import { createDefaultElement } from "src/system/base/createDefaultElement";
import { Editor } from "src/system/base/Editor";

if ( !document.menuItems ){
    document.menuItems = [];
}

document.menuItems.push({
    htmlTag: "w13c-article",
    description: "Article",
    icon: "",
    shortcut: "Q",
    title: "Article"
})

export class ArticleEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "");

        createDefaultElement(this.target, "content");

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