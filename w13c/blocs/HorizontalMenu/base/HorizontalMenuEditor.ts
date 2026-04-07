import { Editor } from "src/core/Editor/core/Editor";
import Config from "../configuration.html" with { type: 'text' }
import { EmptyEditor } from "src/core/Editor/core/EmptyEditor";

export class HorizontalMenuEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Config as unknown as string);
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

document.EditorManager.getObserver().register_sub_components([
    "BE5_TAG_TO_BE_REPLACED-item"
])