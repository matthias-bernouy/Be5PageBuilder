import { Component } from "@bernouy/cms/component";
import { Editor, registerEditor, registerEditor_opaque } from "@bernouy/cms/editor";
import { P9R_ATTR } from "src/socle/constants/editorAttributes";


(window as any).p9r = {
    attr: P9R_ATTR,

    Component,
    Editor,
    registerEditor,
    registerEditor_opaque
}