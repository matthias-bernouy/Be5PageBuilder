import { Editor } from "src/core/Editor/Base/Editor";
import { SectionComponent } from "src/core/Editor/BlocConfiguration/SectionComponent";
import { SelectComponent } from "src/core/Editor/BlocConfiguration/SelectComponent";

export class HeroSectionEditor extends Editor {

    override configuration: HTMLElement[];

    constructor(target: HTMLElement) {

        super(target, "");

        console.log("création")
        this.configuration = [];

        const components = new SelectComponent();
        components.setInfo("components", this);
        components.setMultiple(true);

        const textSection = SectionComponent.create("Contenu", [
            components
        ]);

        this.configuration.push(textSection);

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