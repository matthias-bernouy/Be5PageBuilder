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