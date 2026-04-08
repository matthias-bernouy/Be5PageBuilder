import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';

export class Card extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback() {
        this.render();
    }

    render() {
        // Logique éventuelle pour manipuler les slots ou les attributs
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Card);