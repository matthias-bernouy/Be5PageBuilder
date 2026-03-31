import { Editor } from "src/core/Editor/core/Editor";
import Panel from "./panel-config.html" with { type: 'text' }

export class HeroSectionEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Panel as unknown as string);
    }

    init() {
    }

    restore() {
    }
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: HeroSectionEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
});