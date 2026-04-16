import { Component } from "src/core/Editor/core/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Input extends Component {

    static formAssociated = true;
    private _internals: ElementInternals;
    private _input: HTMLInputElement | null = null;

    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super({
            css,
            template: template as unknown as string
        })
        this._internals = this.attachInternals();
    }

    override connectedCallback() {
        this._input = this.shadowRoot?.querySelector('input') || null;

        if (this._input) {
            this._input.addEventListener('input', () => {
                this.value = this._input?.value || "";
            });
            this._syncAttributes();
            // Hydrate from the initial `value` attribute. `attributeChangedCallback`
            // fires before `connectedCallback` during element upgrade, so at that
            // point `_input` is still null and the attribute is silently dropped.
            const initial = this.getAttribute('value');
            if (initial !== null) this.value = initial;
        }
    }

    get value() { return this._input?.value || ""; }
    set value(v) {
        if (this._input) this._input.value = v;
        this._internals.setFormValue(v);
    }

    get name() { 
        return this.getAttribute('name') || ""; 
    }

    private _syncAttributes() {
        const observedAttrs = ['type', 'placeholder', 'required', 'disabled'];
        observedAttrs.forEach(attr => {
            if (this.hasAttribute(attr)) {
                this._input?.setAttribute(attr, this.getAttribute(attr)!);
            }
        });
    }

    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        if (!this) return;
        if (name === 'value' && this._input) this._input.value = newVal as any;
    }

    override focus() { this._input?.focus(); }
}

if (!customElements.get("w13c-input")) {
    customElements.define("w13c-input", Input);
}