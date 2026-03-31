import "w13c/Dialog/LateralDialog/LateralDialog"
import "w13c/Base/Form/Input/Input"
import "w13c/Base/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "w13c/Dialog/LateralDialog/LateralDialog";
import { Component } from "src/core/Utilities/Component";

import "../SelectComponent";
import "../SectionComponent";

export class BlocConfigurationPanel extends Component {

    private dialog : LateralDialog | null = null;

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    connectedCallback() {
        this.dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
    }

    show(element: HTMLElement[]) {
        this.replaceChildren();
        element.forEach((ele) => {
            this.append(ele);
        })
        this.dialog?.show();
    }

    close(){
        this.dialog?.close();
    }

}

customElements.define("p9r-bloc-configuration", BlocConfigurationPanel)