import { Editor } from "./Editor";

export class EmptyEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, "");
    }

    init() {
    }

    restore() {
    } 
}


export function registerEditor(props: {
    suffix?: string,
    cl?: new (node: HTMLElement) => Editor
}) {
    document.EditorManager.getObserver().register_editor({
        tag: "BE5_TAG_TO_BE_REPLACED" + (props.suffix || ""),
        cl: props.cl || EmptyEditor,
        label: "BE5_LABEL_TO_BE_REPLACED" + (props.suffix || ""),
        group: "BE5_GROUP_TO_BE_REPLACED"
    });
}

/**
 * Register a bloc as opaque. The bloc itself still gets the parent-level action
 * bar (move, delete, duplicate, change), but its entire subtree is sealed: no
 * descendant will be editorized. Used when a bloc is deployed without an
 * Editor module.
 */
export function registerEditor_opaque() {
    document.EditorManager.getObserver().register_editor_opaque({
        tag:   "BE5_TAG_TO_BE_REPLACED",
        cl:    EmptyEditor,
        label: "BE5_LABEL_TO_BE_REPLACED",
        group: "BE5_GROUP_TO_BE_REPLACED",
    });
}