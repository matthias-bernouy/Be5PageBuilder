import { disableBlocActions } from "src/Be5System/disableBlocActions";
import { Editor } from "src/core/Editor/Base/Editor";
import { createDefaultElement } from "src/core/Utilities/createDefaultElement";

export class HeroSectionEditor extends Editor {

    private _imageSlot: HTMLImageElement;
    private _titleSlot: HTMLElement;
    private _contentSlot: HTMLElement;
    private _footerSlot: HTMLElement;

    constructor(target: HTMLElement) {
        super(target, "");

        this._titleSlot = createDefaultElement(this.target, "title", "span", "Title");
        this._contentSlot = createDefaultElement(this.target, "content", "span", "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ");
        this._footerSlot = createDefaultElement(this.target, "footer", 'span', 'footer');

        if (!this.target.querySelector('img')) {
            const img = document.createElement("img");
            img.setAttribute("slot", "image");
            img.src = "https://picsum.photos/200";
            this.target.append(img);
            this._imageSlot = img;
        } else {
            this._imageSlot = this.target.querySelector('img')!;
        }
    }

    init() {
        disableBlocActions([
            this._imageSlot,
            this._titleSlot,
            this._contentSlot,
            this._footerSlot
        ])
    }

    restore() {
    }
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: HeroSectionEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED"
});