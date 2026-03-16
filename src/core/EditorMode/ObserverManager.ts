import { ImageEditor } from "./Component/ImageEditor";
import { TextEditor, textTags } from "./Component/TextEditor";
import { ListEditor } from "./Component/ListEditor";
import "src/core/EditorMode/Component/MediaCenter/MediaCenter"
import type { Editor } from "../Editor";

export class ObserverManager {

    private editors: Map<string, {
        cl: new (node: HTMLElement) => Editor,
        visible: boolean,
        tag: string
    }> = new Map();

    constructor(workingElement: HTMLElement) {

        textTags.forEach((tag) => {
            if (["p", "span"].includes(tag)){
                this.register_editor(tag, TextEditor, false);
            } else {
                this.register_editor(tag, TextEditor);
            }
        })
        this.register_editor("img", ImageEditor);
        this.register_editor("ul", ListEditor);
        this.register_editor("ol", ListEditor);

        const existingElements = workingElement.querySelectorAll('*');
        existingElements.forEach((el: any) => this.make_it_editor(el));

        const callback = (mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: Node) => {
                        if (node instanceof HTMLElement) {

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

    getItems(){
        return this.editors.values().filter(v => v.visible).map(v => v.tag);
    }

    register_editor<T extends Editor>(htmlTag: string, cl: new (node: HTMLElement) => T, visible = true): void {
        this.editors.set(htmlTag, {
            cl: cl,
            visible: visible,
            tag: htmlTag
        });
    }

    make_it_editor(node: HTMLElement) {
        const tag = node.tagName.toLowerCase();
        const cl = this.editors.get(tag)?.cl;
        if (cl) new cl(node);
    }
}