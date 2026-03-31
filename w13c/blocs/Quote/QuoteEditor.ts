import { disableBlocActions } from "src/Be5System/disableBlocActions";
import { Editor } from "src/core/Editor/core/Editor";
import { createDefaultElement } from "src/core/Utilities/createDefaultElement";

export class QuoteEditor extends Editor {

    private _textSlot: HTMLElement;
    private _authorSlot: HTMLElement;

    constructor(target: HTMLElement) {
        super(target, "");
        this._textSlot = createDefaultElement(this.target, "text", "span", "Je ne suis pas athée. Je ne sais pas si je peux me définir comme panthéiste. Le problème est trop vaste pour nos esprits limités.");
        this._authorSlot = createDefaultElement(this.target, "author", "span", "Albert Einstein");
        this.viewEditor();
    }

    init() {
        disableBlocActions([
            this._textSlot,
            this._authorSlot
        ]);
    }

    restore() {
    }
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: QuoteEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
});