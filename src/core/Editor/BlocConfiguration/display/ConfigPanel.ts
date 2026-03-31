import "w13c/core/Dialog/LateralDialog/LateralDialog"
import "w13c/core/Form/Input/Input"
import "w13c/core/Form/Checkbox/Checkbox"
import type { LateralDialog } from "w13c/core/Dialog/LateralDialog/LateralDialog";
import { Component } from "src/core/Utilities/Component";

import "../Items/ComponentConfigItem";
import "w13c/core/Form/FormSection";

export class ConfigPanel extends Component {

    private dialog : LateralDialog | null = null;

    constructor() {
        super({
            css: "",
            template: `
            <w13c-lateral-dialog>
                <slot></slot>
                <span slot="title">Element Configuration</span>
            </w13c-lateral-dialog>
            `
        });
    }

    connectedCallback() {
        this.dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
    }

    show(element: HTMLElement) {
        this.replaceChildren(element);
        this.dialog?.show();
    }

    close(){
        this.dialog?.close();
    }

}

customElements.define("p9r-bloc-configuration", ConfigPanel)