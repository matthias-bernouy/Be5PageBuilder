import { Component } from "src/core/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class HorizontalMenu extends Component {
    constructor(){
        super({
            css,
            template: template as unknown as string
        })
    }
}

customElements.define("w13c-horizontalmenu", HorizontalMenu);