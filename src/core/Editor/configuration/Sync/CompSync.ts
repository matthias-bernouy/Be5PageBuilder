import type { Component } from "src/core/Component/core/Component";

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
        requestAnimationFrame(() => {
            const slots = Array.from(this._component?.querySelectorAll(`[slot="${slotName}"]`));
        });
    }

}

if (!customElements.get("p9r-comp-sync")) {
    customElements.define("p9r-comp-sync", CompSync)
}
