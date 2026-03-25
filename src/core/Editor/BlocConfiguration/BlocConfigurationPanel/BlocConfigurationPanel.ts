import { Component } from "../../../Utilities/Component";
import "src/core/Editor/Component/Dialog/LateralDialog/LateralDialog"
import "src/core/Editor/Component/Form/Input/Input"
import "src/core/Editor/Component/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "src/core/Editor/Component/Dialog/LateralDialog/LateralDialog";
import type { BlocConfiguration } from "../BlocConfiguration";

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

    show(blocksConfig: BlocConfiguration[]) {
        this.replaceChildren();
        blocksConfig.forEach(ele => {
            this.append(ele.htmlElement);
        })
        this.dialog?.show();
    }

}

customElements.define("w13c-element-panel-configuration", BlocConfigurationPanel)