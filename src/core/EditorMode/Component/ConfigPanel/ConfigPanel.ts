import { Component } from "../../../Component";
import "src/core/EditorMode/Component/LateralDialog/LateralDialog"
import "src/core/EditorMode/Component/Form/Input/Input"
import "src/core/EditorMode/Component/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "src/core/EditorMode/Component/LateralDialog/LateralDialog";

export class ElementPanelConfig extends Component {

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    connectedCallback() {
        console.log("Connected")
        //this.show();
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}
customElements.define("w13c-element-panel-configuration", ElementPanelConfig)