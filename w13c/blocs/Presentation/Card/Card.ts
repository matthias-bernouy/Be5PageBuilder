import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Editor/core/Component';

export class Card extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback(): void {
        this.addEventListener("click", this.onClick);
    }

    onClick = () => {
        const href = this.getAttribute("href");
        if (href) {
            const target = this.getAttribute("target") || "_self";
            window.open(href, target);
        }
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Card);
