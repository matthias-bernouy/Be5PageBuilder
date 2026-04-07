import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import Config from "./configuration.html" with { type: 'text' };

export class ButtonEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Config as unknown as string);
    }

    init() {
    }

    restore() {
    }
}

registerEditor({
    cl: ButtonEditor
});
