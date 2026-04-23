import "@bernouy/socle"
import "@bernouy/socle"
import "@bernouy/socle"

import type { LateralDialog } from "@bernouy/socle";
import { Component } from "@bernouy/cms/component";

import "./sync/AttrSync";
import "./sync/CompSync";
import "./sync/ImageSync";
import "./sync/StateSync";
import "@bernouy/socle";
import "@bernouy/socle";
import "./P9rLink";
import "@bernouy/socle";

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