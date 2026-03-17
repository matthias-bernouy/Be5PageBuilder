import { Component } from "src/core/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Input extends Component {

    static formAssociated = true; // Indispensable pour être vu par un <form>
    private _internals: ElementInternals;
    private _input: HTMLInputElement | null = null;

    constructor() {
        super({
            css,
            template: template as unknown as string
        })
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this._input = this.shadowRoot?.querySelector('input') || null;

        if (this._input) {
            this._input.addEventListener('input', () => {
                this.value = this._input?.value || "";
            });
            this._syncAttributes();
        }
    }

    get value() { return this._input?.value || ""; }
    set value(v) {
        if (this._input) this._input.value = v;
        this._internals.setFormValue(v);
    }

    private _syncAttributes() {
        const observedAttrs = ['type', 'placeholder', 'required', 'disabled'];
        observedAttrs.forEach(attr => {
            if (this.hasAttribute(attr)) {
                this._input?.setAttribute(attr, this.getAttribute(attr)!);
            }
        });
    }

    override focus() { this._input?.focus(); }
}

customElements.define("w13c-input", Input);