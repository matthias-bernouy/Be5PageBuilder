
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';

export class HorizontalMenu extends Component {
    constructor(){
        super({
            css,
            template: template as unknown as string
        })
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", HorizontalMenu);
