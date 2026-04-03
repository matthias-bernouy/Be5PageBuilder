
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';
import "../sub/MenuItem"
import { register } from '../register';

export class HorizontalMenu extends Component {

    private _toggle: HTMLButtonElement | null = null;

    constructor(){
        super({
            css,
            template: template as unknown as string
        });
        this._toggle = this.shadowRoot!.querySelector('.menu-toggle');
        this._toggle?.addEventListener('click', () => this._toggleMobile());
    }

    private _toggleMobile() {
        const isOpen = this.hasAttribute('mobile-open');
        if (isOpen) {
            this.removeAttribute('mobile-open');
            this._toggle?.setAttribute('aria-expanded', 'false');
        } else {
            this.setAttribute('mobile-open', '');
            this._toggle?.setAttribute('aria-expanded', 'true');
        }
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", HorizontalMenu);

register("BE5_TAG_TO_BE_REPLACED");