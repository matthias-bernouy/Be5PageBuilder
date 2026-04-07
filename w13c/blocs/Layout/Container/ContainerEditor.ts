import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };

export class ContainerEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", configuration as unknown as string);
    }

    init() {
        // Logique d'initialisation spécifique si nécessaire
    }

    restore() {
        // Logique de restauration des états
    }
}

registerEditor({
    cl: ContainerEditor
});