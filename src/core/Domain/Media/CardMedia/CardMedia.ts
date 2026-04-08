import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from "src/core/Editor/core/Component";

export class CardMedia extends Component {
    constructor() {
        super({
            css: css as unknown as string,
            template: template as unknown as string
        });
    }
}

customElements.define("p9r-card-media", CardMedia);
