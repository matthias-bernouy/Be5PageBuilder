import { Component } from "src/core/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class LateralMenu extends Component {
    constructor(){
        super({
            css,
            template: template as unknown as string
        })
    }

    // Exemple de méthode pour basculer le menu (toggle)
    toggle() {
        const sidebar = this.shadowRoot?.querySelector('.sidebar');
        sidebar?.classList.toggle('collapsed');
    }
}

customElements.define("w13c-lateral-menu", LateralMenu);