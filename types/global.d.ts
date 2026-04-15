import type { EditorManager } from "src/core/Editor/core/EditorManager";
import type { Editor } from "src/core/Editor/core/Editor";
import type { Component } from "src/core/Editor/core/Component";
import type { registerEditor, registerEditor_opaque } from "src/core/Editor/core/registerEditor";
import { P9R_ATTR } from "./editor-attributs";
import { P9R_CACHE, P9R_EVENT, P9R_ID, P9R_MODE } from "./p9r-constants";

// NOTE: wildcard module declarations for `*.css` / `*.html` live in
// `./assets.d.ts`, NOT here. This file has top-level imports and is
// therefore a module — wildcard `declare module` entries would be
// scoped instead of reaching global scope.

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
        readonly Component: typeof Component;
        readonly Editor: typeof Editor;
        readonly registerEditor: typeof registerEditor;
        readonly registerEditor_opaque: typeof registerEditor_opaque;
    };

}

export {};