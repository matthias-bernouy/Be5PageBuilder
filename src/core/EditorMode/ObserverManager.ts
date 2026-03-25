import { ImageEditor } from "./Component/ImageEditor";
import { TextEditor, textTags } from "./Component/TextEditor";
import { ListEditor } from "./Component/ListEditor";
import "src/core/EditorMode/Component/MediaCenter/MediaCenter"
import type { Editor } from "../Editor";

type Element = {
    cl: new (node: HTMLElement) => Editor,
    visible: boolean,
    tag: string,
    group?: string,
    label: string
}

export class ObserverManager {

    private workingElement: HTMLElement;

    private editors: Map<string, Element> = new Map();

    private groups: Set<string> = new Set(["default"])

    constructor(workingElement: HTMLElement) {

        this.workingElement = workingElement;
        textTags.forEach((tag) => {
            if (["p", "span"].includes(tag)){
                this.register_editor(tag, TextEditor, false);
            } else {
                this.register_editor(tag, TextEditor);
            }
        })
        this.register_editor("img", ImageEditor);
        this.register_editor("ul", ListEditor);
        this.register_editor("ol", ListEditor, true, "test");

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
        return this.editors.values().filter(v => v.visible && v.group === group);
    }

    register_editor<T extends Editor>(htmlTag: string, cl: new (node: HTMLElement) => T, visible = true, group?: string, label?: string): void {
        this.editors.set(htmlTag, {
            cl: cl,
            visible: visible,
            tag: htmlTag,
            group: group || "default",
            label: label || "label"
        });
        this.groups.add(group || "default")
        const existingElements = this.workingElement.querySelectorAll(htmlTag);
        existingElements.forEach((el: any) => this.make_it_editor(el));
    }

    make_it_editor(node: HTMLElement) {
        const tag = node.tagName.toLowerCase();
        const cl = this.editors.get(tag)?.cl;
        if (cl) new cl(node);
    }
}