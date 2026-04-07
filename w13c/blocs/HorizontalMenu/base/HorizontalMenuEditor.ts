import { Editor } from "src/core/Editor/core/Editor";
import Config from "../configuration.html" with { type: 'text' }
import { registerEditor } from "src/core/Editor/core/registerEditor";
export class HorizontalMenuEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Config as unknown as string);
    }

    init() {
    }

    restore() {
    }
}

registerEditor({
    cl: HorizontalMenuEditor
})

registerEditor({
    suffix: "-item"
})