import { Component } from "@bernouy/cms/component";

import "@bernouy/socle"
import "@bernouy/socle"

import template from './template.html' with { type: 'text' };

export class FixedAdminLayout extends Component {
    constructor(){
        super({
            css: '',
            template: template as unknown as string
        })
    }
}

customElements.define("w13c-fixed-admin-layout", FixedAdminLayout);
