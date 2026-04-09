import type { EditorManager } from "src/core/Editor/core/EditorManager";
import type { Editor } from "src/core/Editor/core/Editor";
import { P9R_ATTR } from "./editor-attributs";
import { P9R_CACHE, P9R_EVENT, P9R_ID, P9R_MODE } from "./p9r-constants";

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
        readonly attr:  typeof P9R_ATTR;
        readonly mode:  typeof P9R_MODE;
        readonly event: typeof P9R_EVENT;
        readonly id:    typeof P9R_ID;
        readonly cache: typeof P9R_CACHE;
    };

}

export {};