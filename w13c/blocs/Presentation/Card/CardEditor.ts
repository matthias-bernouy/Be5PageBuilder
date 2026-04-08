import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };

const editorStyle = `
    .card:hover {
        box-shadow: unset;
    }
    .card:hover .card-media ::slotted(img) {
        transform: unset;
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
