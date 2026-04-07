import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';

export class Button extends Component {

    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this.removeEventListener("click", this.onClick);
        this.addEventListener("click", this.onClick);
    }

    onClick = () => {
        const href = this.href;
        if (href) window.open(href, this.target);
    }


    get href (): string | null {
        return this.getAttribute("href");
    }

    get target (): string {
        return this.getAttribute("target") || "_self";
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Button);
