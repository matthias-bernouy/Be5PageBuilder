import { Component } from "src/core/Utilities/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Quote extends Component {
    constructor(){
        super({
            css,
            template: template as unknown as string
        })
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Quote);