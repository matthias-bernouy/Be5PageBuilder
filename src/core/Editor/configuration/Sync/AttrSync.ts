import type { Component } from "src/core/Editor/core/Component";

export class AttrSync extends HTMLElement {

    private _component: Component | null = null;

    connectedCallback() {
        const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (componentIdentifier) {
            this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
        }
        requestAnimationFrame(() => {
            this._sync();
            this.addEventListener('change', (e) => this.onChange(e));
        });
    }

    private onChange(event: Event) {
        const target = event.target as HTMLElement & { name?: string; value?: any };
        if (target && target.name) {
            if (target.value === "" || target.value == null) {
                this._component?.removeAttribute(target.name);
            } else {
                this._component?.setAttribute(target.name, target.value);
            }
        }
    }

    private _sync() {
        const inputs = Array.from(this.querySelectorAll("[name]")) as any[];
        inputs.forEach(input => {
            const val = this._component?.getAttribute(input.name)
            if (val) {
                input.value = val;
            } else {
                if (input.value) {
                    this._component?.setAttribute(input.name, input.value);
                }
            }
        });
    }

}

if (!customElements.get("p9r-attr-sync")) {
    customElements.define("p9r-attr-sync", AttrSync)
}
