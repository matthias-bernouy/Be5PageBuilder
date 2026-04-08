import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };

const editorStyle = `
    .card:hover {
        box-shadow: unset !important;
        transform: unset !important;
        border-color: unset !important;
    }
    .card:hover .card-media ::slotted(img) {
        transform: unset !important;
    }
`;

export class CardEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, editorStyle, configuration as unknown as string);
    }

    init() {}
    restore() {}
}

registerEditor({ cl: CardEditor });
