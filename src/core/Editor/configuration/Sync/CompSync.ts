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
        const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (componentIdentifier) {
            this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
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
        let slots = Array.from(this._component?.querySelectorAll(`[slot="${slotName}"]`)!) as Component[];

        slots.forEach((slot) => {
            let subElements = Array.from(slot.querySelectorAll('*')) as Component[];
            subElements.forEach(sub => {
                disableBlocActions(sub);
                const editor = document.compIdentifierToEditor.get(sub.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!);
                editor?.viewEditor();
            })
            slot.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)!)
            if (this.isMultiple){
                if (this.inlineAdding){
                     slot.setAttribute(p9r.attr.ACTION.INLINE_ADDING, "true");
                } else {
                    slot.removeAttribute(p9r.attr.ACTION.INLINE_ADDING);
                }
                if ( slots.length == this.min ) {
                    slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
                } else {
                    slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE)
                }
            } else {
                disableBlocActions(slot);
            }
            const editor = document.compIdentifierToEditor.get(slot.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!);
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

    get inlineAdding(){
        return this.hasAttribute(p9r.attr.ACTION.INLINE_ADDING);
    }

}

if (!customElements.get("p9r-comp-sync")) {
    customElements.define("p9r-comp-sync", CompSync)
}
