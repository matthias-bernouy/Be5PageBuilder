import { Component } from "../../Component";
import "src/system/Component/LateralDialog/LateralDialog"
import "src/system/Component/Form/Input/Input"
import "src/system/Component/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "src/system/Component/LateralDialog/LateralDialog";

export class Configuration extends Component {

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    show(){
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog")! as LateralDialog
        dialog.show()
    }


}

customElements.define("w13c-page-information", Configuration)