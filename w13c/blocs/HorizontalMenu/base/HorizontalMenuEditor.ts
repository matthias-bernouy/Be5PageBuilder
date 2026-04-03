import { Editor } from "src/core/Editor/core/Editor";
import Config from "../configuration.html" with { type: 'text' }

export class HorizontalMenuEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Config as unknown as string);
    }

    init() {
    }

    restore() {
    }
}

export class EmptyEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, "", "");
    }

    init() {
    }

    restore() {
    } 
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: HorizontalMenuEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
});

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED-item",
    cl: EmptyEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED",
    visible: false 
})