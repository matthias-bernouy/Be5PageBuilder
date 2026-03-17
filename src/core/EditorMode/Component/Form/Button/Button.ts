import { Component } from "src/core/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Button extends Component {
    static formAssociated = true;
    private _internals: ElementInternals;
    private _btn: HTMLButtonElement | null = null;

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this._btn = this.shadowRoot?.querySelector('button') || null;

        if ( !this.getAttribute('type') ){
            this.setAttribute("type", "submit")
        }

        if (this._btn) {
            this._btn.type = (this.getAttribute('type') as any) || 'submit';
            if (this.hasAttribute('disabled')) this._btn.disabled = false;
        }

        this.addEventListener('click', (e) => {
            if (this.hasAttribute('disabled')) {
                e.stopImmediatePropagation();
                return;
            }

            const type = this.getAttribute('type');
            const form = this._internals.form;

            if (!form) return;

            if (type === 'submit') {
                form.requestSubmit();
            } else if (type === 'reset') {
                form.reset();
            }
        });
    }

    set disabled(val: boolean) {
        if (val) this.setAttribute('disabled', '');
        else this.removeAttribute('disabled');
        if (this._btn) this._btn.disabled = val;
    }
}

customElements.define("w13c-editor-button", Button);