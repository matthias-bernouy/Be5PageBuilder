import { createDefaultElement } from "../../src/core/Utilities/createDefaultElement";
import { Editor } from "../../src/core/Editor/Base/Editor";

export class HeroSectionEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "");
        this.viewEditor();

        createDefaultElement(this.target, "title", "span", "Title");
        createDefaultElement(this.target, "content", "span", "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ");
        createDefaultElement(this.target, "footer", 'span', 'footer');

        if (!this.target.querySelector('img')) {
            const img = document.createElement("img");
            img.setAttribute("slot", "image");
            img.src = "https://picsum.photos/200";
            this.target.append(img);
        }
    }

    init() {
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