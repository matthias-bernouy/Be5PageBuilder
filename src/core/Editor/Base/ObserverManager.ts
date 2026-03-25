import "src/core/Editor/MediaCenter/MediaCenter"

import { ImageEditor } from "../Component/ImageEditor";
import { TextEditor, textTags } from "../Component/TextEditor";
import { ListEditor } from "../Component/ListEditor";
import type { Editor } from "./Editor";

export type TagElement = {
    cl: new (node: HTMLElement) => Editor,
    visible?: boolean,
    tag: string,
    group?: string,
    label: string
}

export class ObserverManager {

    private workingElement: HTMLElement;

    private editors: Map<string, TagElement> = new Map();

    private groups: Set<string> = new Set(["default"])

    constructor(workingElement: HTMLElement) {

        this.workingElement = workingElement;
        textTags.forEach((tag) => {
            if (["p", "span"].includes(tag)){
                this.register_editor({
                    tag, 
                    cl: TextEditor,
                    visible: false,
                    label: tag
                });
            } else {
                this.register_editor({
                    tag,
                    label: tag,
                    cl: TextEditor
                });
            }
        })

        this.register_editor({
            tag: "img",
            label: "image",
            cl: ImageEditor
        });

        this.register_editor({
            tag: "ul",
            cl: ListEditor,
            label: "ul"
        });

        this.register_editor({
            tag: "ol",
            cl: ListEditor,
            label: "ol"
        });

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

    getGroups(){
        return this.groups;
    }

    getItemsByGroup(group: string){
        console.log(this.editors.values())
        return this.editors.values().filter(v => v.visible && v.group === group);
    }

    register_editor(element: TagElement): void {
        this.editors.set(element.tag, {
            ...element,
            group: element.group || "default",
            visible: element.visible || true
        });
        this.groups.add(element.group || "default")
        const existingElements = this.workingElement.querySelectorAll(element.tag);
        existingElements.forEach((el: any) => this.make_it_editor(el));
    }

    make_it_editor(node: HTMLElement) {
        const tag = node.tagName.toLowerCase();
        const cl = this.editors.get(tag)?.cl;
        if (cl) new cl(node);
    }
}