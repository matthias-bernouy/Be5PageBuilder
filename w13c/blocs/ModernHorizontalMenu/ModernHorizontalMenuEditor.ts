import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { Editor } from "src/core/Editor/Base/Editor";
import { disableBlocActions } from "src/Be5System/disableBlocActions";

class NavBarEditor extends Editor {
    private logo: HTMLImageElement;
    private nav: HTMLElement;
    private actions: HTMLElement;

    constructor(target: HTMLElement) {
        super(target, "mon-style-css-mode-editor");

        // Slot logo — image unique
        this.logo =
            (this.target.querySelector('[slot="logo"]') as HTMLImageElement) ||
            (createDefaultElement(this.target, "logo", "img", "") as HTMLImageElement);
        if (!this.logo.getAttribute("src")) {
            this.logo.setAttribute("alt", "Logo");
        }

        // Slot nav — conteneur de NavBarItem (répétable)
        this.nav =
            (this.target.querySelector('[slot="nav"]') as HTMLElement) ||
            createDefaultElement(this.target, "nav", "div", "");

        // Slot actions — conteneur d'éléments d'action (répétable)
        this.actions =
            (this.target.querySelector('[slot="actions"]') as HTMLElement) ||
            createDefaultElement(this.target, "actions", "div", "");

        this.viewEditor();
    }

    init(): void {
        // Seul le logo est un contenu fixe non répétable
        disableBlocActions([this.logo]);
    }

    restore(): void {}
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: NavBarEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED",
});