import "w13c/Dialog/LateralDialog/LateralDialog"
import "w13c/Base/Form/Input/Input"
import "w13c/Base/Form/Checkbox/Checkbox"
import type { LateralDialog } from "w13c/Dialog/LateralDialog/LateralDialog";
import { Component } from "src/core/Utilities/Component";

import "./PanelComponentItem";
import "./SectionComponent";

export class BlocConfigurationPanel extends Component {

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

customElements.define("p9r-bloc-configuration", BlocConfigurationPanel)