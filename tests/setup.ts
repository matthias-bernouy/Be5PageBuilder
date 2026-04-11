import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { P9R_ATTR } from "types/editor-attributs";
import { P9R_CACHE, P9R_EVENT, P9R_ID, P9R_MODE } from "types/p9r-constants";

GlobalRegistrator.register();

(globalThis as any).p9r = {
    attr:  P9R_ATTR,
    mode:  P9R_MODE,
    event: P9R_EVENT,
    id:    P9R_ID,
    cache: P9R_CACHE,
};

(document as any).compIdentifierToEditor = new Map();

const editorSystem = document.createElement("div");
editorSystem.id = P9R_ID.EDITOR_SYSTEM;
document.body.appendChild(editorSystem);

(document as any).EditorManager = {
    getEditorSystemHTMLElement: () => editorSystem,
    getBlocActionGroup: () => ({
        close: () => {},
        open: () => {},
        setEditor: () => {},
    }),
};
