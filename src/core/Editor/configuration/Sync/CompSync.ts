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

        // if ( !this._component?.hasAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER) ){
        //     this._component?.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
        //     this._component?.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
        //     this._component?.setAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT, "true");
        // }

        slots.forEach((slot) => {
            const slotEditor = document.compIdentifierToEditor.get(slot.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!);
            slot.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
            slot.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
            slot.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
            if ( this.optionnal ) {
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
            } else {
                slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
            }
            let subElements = Array.from(slot.querySelectorAll('*')) as Component[];

            // Si le slot est un editeur, on le laissera désactiver les enfants
            // if ( !slotEditor ){
            //     subElements.forEach(sub => {
            //         disableBlocActions(sub);
            //         const editor = document.compIdentifierToEditor.get(sub.getAttribute(p9r.attr.EDITOR.IDENTIFIER)!);
            //         editor?.viewEditor();
            //     })
            // }

            slot.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)!)
            if (this.isMultiple){

                if (this.inlineAdding){
                     slot.setAttribute(p9r.attr.ACTION.INLINE_ADDING, "true");
                } else {
                    slot.removeAttribute(p9r.attr.ACTION.INLINE_ADDING);
                }
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER);
                slot.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE);

                if ( slots.length == this.min ) {
                    slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
                    //slot.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
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

}

if (!customElements.get("p9r-comp-sync")) {
    customElements.define("p9r-comp-sync", CompSync)
}
