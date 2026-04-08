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
        const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (componentIdentifier) {
            this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
        }
        requestAnimationFrame(() => {
            this._sync();
            this.init();
            this._component?.connectedCallback();    
        });
    }

    private _sync() {
        const child = this.firstElementChild;
        if (!child) {
            throw new Error("p9r-comp-sync require a child");
        }

        const slotName = child.getAttribute("slot");
        
        const selector = slotName ? `[slot="${slotName}"]` : ':not([slot])';

        if (!this._component?.querySelector(selector)) {
            const toAppend = child.cloneNode(true);
            this._component?.append(toAppend);
        }
    }

    init(){
        const child = this.firstElementChild;
        const slotName = child?.getAttribute("slot");

        if ( !child ) {
            throw new Error("p9r-comp-sync require a child with attribute 'slot'");
        }

        const selector = slotName 
                ? `:scope > [slot="${slotName}"]` 
                : `:scope > :not([slot])`;

        let slots = Array.from(this._component?.querySelectorAll(selector)!) as Component[];

        slots.forEach((slot) => {
            const slotEditor = document.compIdentifierToEditor.get(slot.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!);
            slot.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
            slot.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
            slot.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
            slot.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");

            if ( !this.allowOthersComponents ) {
                slot.setAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT, "true");
            } else {
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT);
            }

            if ( this.optionnal ) {
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
            } else {
                slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
            }

            slot.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)!)
            if (this.isMultiple){

                slot.removeAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT);

                if (this.inlineAdding){
                     slot.setAttribute(p9r.attr.ACTION.INLINE_ADDING, "true");
                } else {
                    slot.removeAttribute(p9r.attr.ACTION.INLINE_ADDING);
                }
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DRAGGING);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE);

                if ( slots.length == this.min ) {
                    slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
                    slot.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
                }

            } else {
                //disableBlocActions(slot);
            }
            slotEditor?.viewEditor();
        })
    }

    get isMultiple(){
        return this.hasAttribute("allow-multiple");
    }

    get optionnal(){
        return this.hasAttribute("optionnal");
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

    get allowOthersComponents(){
        return this.hasAttribute("allow-others-components");
    }

}

if (!customElements.get("p9r-comp-sync")) {
    customElements.define("p9r-comp-sync", CompSync)
}
