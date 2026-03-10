import { ImageEditor } from "../Editor/ImageEditor";
import { TextEditor, textTags } from "../Editor/TextEditor";
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

        if (textTags.has(tag)) {
            new TextEditor(node);
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