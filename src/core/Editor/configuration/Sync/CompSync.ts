import type { Component } from "src/core/Component/core/Component";
import { disableBlocActions } from "../../editors/disableBlocActions";
import type { Editor } from "../../core/Editor";

/**
 * @param data-multiple        - default: true
 * @param data-number-creation - default: 1
 * @param data-minimum         - default: 1
 * 
 */
export class CompSync extends HTMLElement {

    private _component: Component | null = null;


    connectedCallback() {
        this.style.display = "none";
        const componentIdentifier = this.getAttribute("data-component-identifier");
        if (componentIdentifier) {
            this._component = document.querySelector(`[data-identifier="${componentIdentifier}"]`);
        }
        requestAnimationFrame(() => {
            this._sync();
            this.init();
        });
    }

    private _sync() {
        const child = this.firstElementChild;
        const slotName = child?.getAttribute("slot");
        if ( !slotName || !child ) {
            throw new Error("p9r-comp-sync require a child with attribute 'slot'");
        }
        if ( !this._component?.querySelector(`[slot="${slotName}"]`) ) {
            const toAppend = child.cloneNode(true);
            this._component?.append(toAppend);
        }
    }

    init(){
        const child = this.firstElementChild;
        const slotName = child?.getAttribute("slot");
        if ( !slotName || !child ) {
            throw new Error("p9r-comp-sync require a child with attribute 'slot'");
        }
        const slots = Array.from(this._component?.querySelectorAll(`[slot="${slotName}"]`)!) as Component[];
        slots.forEach((slot) => {
            slot.setAttribute("data-component-identifier", this.getAttribute("data-component-identifier")!)
            if (this.isMultiple){
                slot.setAttribute("data-disable-add-before", "true");
                slot.setAttribute("data-disable-add-after", "true");
                if ( slots.length == this.min ) {
                    slot.setAttribute("data-disable-delete", "true");
                } else {
                    slot.removeAttribute("data-disable-delete")
                }
            } else {
                disableBlocActions(slot);
            }
            const editor = document.compIdentifierToEditor.get(slot.getAttribute("data-identifier")!);
            editor?.viewEditor();
        })
    }

    get isMultiple(){
        return this.hasAttribute("allow-multiple");
    }

    get min(){
        return 1;
    }

    get max(){
        return 999;
    }

}

if (!customElements.get("p9r-comp-sync")) {
    customElements.define("p9r-comp-sync", CompSync)
}
