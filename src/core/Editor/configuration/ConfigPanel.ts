import "src/ui/core/Dialog/LateralDialog/LateralDialog"
import "src/ui/core/Form/Checkbox/Checkbox"
import "src/ui/core/Form/FormSection"

import type { LateralDialog } from "src/ui/core/Dialog/LateralDialog/LateralDialog";
import { Component } from "src/core/Editor/core/Component";

import "./Sync/AttrSync";
import "./Sync/CompSync";
import "./Sync/ImageSync";
import "./Sync/StateSync";
import "./Inputs/P9rSelect";
import "./Inputs/P9rRange";
import "./Inputs/P9rLink";
import "./Inputs/P9rSizesSelect";

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

    override connectedCallback() {
        this.dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
    }

    show() {
        this.dialog?.show();
    }

    close(){
        this.dialog?.close();
    }

    init(opts?: { added?: HTMLElement; removed?: HTMLElement }){
        const elements = Array.from(this.querySelectorAll("*")) as any[];
        for ( const element of elements ) {
            if ( element.init ) element.init(opts);
        }
    }

}

if ( !customElements.get("p9r-config-panel") ){
    customElements.define("p9r-config-panel", ConfigPanel)
}