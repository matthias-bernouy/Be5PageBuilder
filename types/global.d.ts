import type { EditorManager } from "src/core/Editor/core/EditorManager";
import type { Editor } from "src/core/Editor/core/Editor";
import { P9R_ATTR } from "./editor-attributs";

declare module "*.css" {
    const content: string;
    export default content;
}

declare module "*.html" {
    const content: string;
    export default content;
}

declare global {
	
    interface Document {
        EditorManager: EditorManager;
        compIdentifierToEditor: Map<string, Editor>;
    }

    var p9r: {
        readonly attr: typeof P9R_ATTR;
    };

}

export {};