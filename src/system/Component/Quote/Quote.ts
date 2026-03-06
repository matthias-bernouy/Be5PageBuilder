import { Component } from "src/system/base/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

if ( !document.menuItems ){
    document.menuItems = [];
}

document.menuItems.push({
    htmlTag: "w13c-quote",
    description: "Quote",
    icon: "",
    shortcut: "Q",
    title: "Quote"
})

export class Quote extends Component {
    constructor(){
        super({
            css,
            template: template as unknown as string
        })
    }
}

customElements.define("w13c-quote", Quote);