
import { ImageEditor } from "src/control/core/editorSystem/defaultEditors/ImageEditor/ImageEditor";
import type { Editor } from "../../../core/editorSystem/Editor/Editor";
import { EmptyEditor } from "../../../core/editorSystem/registerEditor";
import { TextEditor, textTags } from "src/control/core/editorSystem/defaultEditors/TextEditor";
import { ListEditor } from "src/control/core/editorSystem/defaultEditors/ListEditor";
import { SnippetEditor } from "src/control/core/editorSystem/defaultEditors/SnippetEditor";

export type TagElement = {
    cl: new (node: HTMLElement) => Editor,
    visible?: boolean,
    tag: string,
    group?: string,
    label: string
}

export class ObserverManager {

    private workingElement: HTMLElement;
    private observer?: MutationObserver;

    private editors: Map<string, TagElement> = new Map();

    private groups: Set<string> = new Set(["default"])

    /** Tags registered as opaque via `register_editor_opaque`. Nodes of these
     *  tags still receive their (default) editor for parent-level actions, but
     *  are marked with `p9r-opaque` so the walker never descends into them. */
    private opaqueTags: Set<string> = new Set();

    constructor(workingElement: HTMLElement) {

        this.workingElement = workingElement;
        textTags.forEach((tag) => {
            if (["span", "a"].includes(tag)) {
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

        this.register_editor({
            tag: "w13c-snippet",
            cl: SnippetEditor,
            label: "snippet",
            visible: false
        });

        const existingElements = workingElement.querySelectorAll('*');
        existingElements.forEach((el: any) => this.make_it_editor(el));

        const callback = (mutationsList: MutationRecord[]) => {

            // Collect every node added in this batch so we can recognise
            // DOM moves (node in both removedNodes AND addedNodes).
            const allAdded = new Set<Node>();
            for (const mutation of mutationsList) {
                for (const node of Array.from(mutation.addedNodes)) {
                    allAdded.add(node);
                }
            }

            for (const mutation of mutationsList) {

                for (const removeNode of Array.from(mutation.removedNodes)) {
                    const node = removeNode as any;
                    if (!node.getAttribute) continue;
                    const identifier = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
                    if (!identifier) continue;
                    const componentParent = node.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);

                    if (allAdded.has(node)) {
                        // DOM move — notify old parent but keep the editor (and subtree) alive
                        document.compIdentifierToEditor.get(componentParent)?.onChildrenRemoved(node as HTMLElement);
                        continue;
                    }

                    document.compIdentifierToEditor.get(componentParent)?.onChildrenRemoved(node as HTMLElement);
                    // MutationObserver only reports the top-level removed node.
                    // Walk the subtree so editorized descendants get disposed too —
                    // otherwise removing a container leaks every nested editor
                    // (and its listeners, observers, panels) into the registry.
                    this._disposeSubtree(node);
                    document.compIdentifierToEditor.get(identifier)?.dispose();
                }

                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: Node) => {
                        if (node instanceof HTMLElement) {

                            // Moved node (already editorized) — notify new parent
                            if (node.getAttribute(p9r.attr.EDITOR.IS_EDITOR)) {
                                const newParentId = node.parentElement?.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
                                if (newParentId) {
                                    document.compIdentifierToEditor.get(newParentId)?.onChildrenAdded(node);
                                }
                                return;
                            }

                            this.make_it_editor(node);

                            node.querySelectorAll('*').forEach((child: Element) => {
                                const htmlChild = child as HTMLElement;
                                this.make_it_editor(htmlChild);
                            });
                        }
                    });
                }
            }
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(workingElement, {
            childList: true,
            subtree: true
        });
    }

    dispose() {
        this.observer?.disconnect();
        this.observer = undefined;
        // Tear down every editor this manager spawned.
        const map = document.compIdentifierToEditor;
        if (!map) return;
        const descendants = this.workingElement.querySelectorAll(`[${p9r.attr.EDITOR.IDENTIFIER}]`);
        descendants.forEach((node) => {
            const id = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
            if (id) map.get(id)?.dispose();
        });
    }

    private _disposeSubtree(root: HTMLElement) {
        if (!root.querySelectorAll) return;
        const descendants = root.querySelectorAll(`[${p9r.attr.EDITOR.IDENTIFIER}]`);
        descendants.forEach((node) => {
            const id = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
            if (id) document.compIdentifierToEditor?.get(id)?.dispose();
        });
    }

    getGroups() {
        return this.groups;
    }

    getItemsByGroup(group: string) {
        return this.editors.values().filter(v => v.visible && v.group === group);
    }

    getItems() {
        return this.editors.values().filter(v => v.visible);
    }

    /** Display label registered for a tag (via `register_editor`). Used by
     *  BAG's breadcrumb to name ancestors without reaching into the private
     *  `editors` Map. Returns undefined for unregistered tags. */
    getLabel(tag: string): string | undefined {
        return this.editors.get(tag)?.label;
    }

    register_editor(element: TagElement): void {
        this.editors.set(element.tag, {
            ...element,
            group: element.group || "default",
            visible: element.visible ?? true
        });
        this.groups.add(element.group || "default")
        const existingElements = this.workingElement.querySelectorAll(element.tag);
        existingElements.forEach((el: any) => this.make_it_editor(el));
    }

    register_editor_opaque(element: TagElement): void {
        this.opaqueTags.add(element.tag);
        this.register_editor(element);
        // Opaque registration usually fires *after* the initial walk, so any
        // descendants of an opaque root may already have been editorized. Walk
        // each matching root and strip editor decorations from its subtree.
        const roots = this.workingElement.querySelectorAll(element.tag);
        roots.forEach((root) => this._sealOpaqueSubtree(root as HTMLElement));
    }

    private _sealOpaqueSubtree(root: HTMLElement): void {
        const descendants = root.querySelectorAll(`[${p9r.attr.EDITOR.IDENTIFIER}]`);
        descendants.forEach((node) => {
            const id = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
            if (!id) return;
            const editor = document.compIdentifierToEditor?.get(id);
            if (editor) {
                editor.viewClient();
                editor.dispose();
            }
        });
    }

    register_sub_components(tag: string[]) {
        tag.forEach(t => {
            this.editors.set(t, {
                cl: EmptyEditor,
                tag: t,
                label: t,
                visible: false
            })
            const existingElements = this.workingElement.querySelectorAll(t);
            existingElements.forEach((el: any) => this.make_it_editor(el));
        })

    }

    make_it_editor(node: HTMLElement) {
        if (node.getAttribute(p9r.attr.EDITOR.IS_EDITOR)) return;
        // If any ancestor is an opaque bloc, the entire subtree is sealed.
        if (node.parentElement?.closest(`[${p9r.attr.EDITOR.OPAQUE}]`)) return;
        const tag = node.tagName.toLowerCase();
        if (!this.editors.has(tag)) return
        const cl = this.editors.get(tag)?.cl;
        if (cl) {
            const editor = new cl(node);
            editor.viewEditor();
        }
        // Mark opaque roots *after* editorizing so the bloc itself still gets
        // its parent-level action bar. The walker / mutation observer visits
        // parents before children, so descendants see the marker and bail.
        if (this.opaqueTags.has(tag)) {
            node.setAttribute(p9r.attr.EDITOR.OPAQUE, "true");
        }
        const parentComponent = node.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if ( parentComponent ){
            document.compIdentifierToEditor.get(parentComponent)?.onChildrenAdded(node);
        }
    }
}