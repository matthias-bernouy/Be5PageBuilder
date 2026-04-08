import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Editor/core/Component';

export class Grid extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback() {
        this.render();
    }

    render() {
        // Render logic to dynamically manipulate the number of items
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Grid);