import { Component } from "src/core/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Table extends Component {
    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    connectedCallback() {
        // Optionnel : Logique pour gérer le tri ou la sélection
    }
}

customElements.define("p9r-table", Table);