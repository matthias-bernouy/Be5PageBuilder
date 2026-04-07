import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };

export class QuoteEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", configuration as unknown as string);
    }

    init() {
    }

    restore() {
    }
}

registerEditor({
    cl: QuoteEditor
})