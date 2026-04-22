import { P9R_ATTR } from "src/socle/constants/editorAttributes";
import { P9R_CACHE, P9R_EVENT, P9R_ID, P9R_MODE } from "src/socle/constants/p9r-constants";
import { Component } from "src/core/Editor/runtime/Component";
import { Editor } from "src/core/Editor/runtime/Editor";
import { registerEditor, registerEditor_opaque } from "src/core/Editor/runtime/registerEditor";

(window as any).p9r = {
    attr:  P9R_ATTR,
    mode:  P9R_MODE,
    event: P9R_EVENT,
    id:    P9R_ID,
    cache: P9R_CACHE,

    // Runtime exposed to bloc bundles. The CLI/server build marks
    // `@bernouy/cms/component` and `/editor` as external and rewrites
    // them to read from this global, so every bloc shares a single copy of
    // these base classes instead of re-bundling them.
    Component,
    Editor,
    registerEditor,
    registerEditor_opaque,
}
