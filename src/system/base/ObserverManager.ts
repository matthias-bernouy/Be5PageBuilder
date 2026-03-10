import { ImageEditor } from "../Editor/ImageEditor";
import { TextEditor } from "../Editor/TextEditor";
import { QuoteEditor } from "../Editor/QuoteEditor";
import { ArticleEditor } from "../Component/Article/ArticleEditor";

export class ObserverManager {

    constructor(workingElement: HTMLElement) {
        const existingElements = workingElement.querySelectorAll('*');
        existingElements.forEach((el: any) => this.make_it_editor(el));

        const callback = (mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: Node) => {
                        if (node instanceof HTMLElement) {

                            console.log("NEW NODE ", node.tagName,  node);
                            if (!node.dataset.isEditor) {
                                this.make_it_editor(node);
                            }

                            node.querySelectorAll('*').forEach((child: Element) => {
                                const htmlChild = child as HTMLElement;
                                if (!htmlChild.dataset.isEditor) {
                                    this.make_it_editor(htmlChild);
                                }
                            });
                        }
                    });
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(workingElement, {
            childList: true,
            subtree: true
        });
    }

    make_it_editor(node: HTMLElement) {
        const tag = node.tagName.toLowerCase();
        console.log("make it editor ", node.tagName);

        const textTags = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "li"]);
        const isManaged = node.parentElement?.closest('w13c-quote, w13c-article');
        console.log("is managed ", isManaged)

        if (textTags.has(tag)) {
            node.setAttribute("data-editor-text-editable", "true")
            if ( isManaged ) {
                console.log("EDITOR PARAGRAPH CREATION MANAGED")
                new TextEditor(node);
            } else {
                console.log("EDITOR PARAGRAPH CREATION")
                node.setAttribute("data-editor-bloc-managment", "true")
                new TextEditor(node);
            }
            return;
        }

        switch (tag) {
            case "img":
                new ImageEditor(node);
                break;

            case "w13c-quote":
                new QuoteEditor(node);
                break;
            
            case "w13c-article":
                new ArticleEditor(node);
                break;

            default:
                break;
        }
    }

}