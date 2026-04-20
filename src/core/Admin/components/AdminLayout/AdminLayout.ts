import { Component } from "src/core/Editor/core/Component";

import "src/ui/core/Menu/LateralMenu/LateralMenu"
import "src/ui/core/Layout/LeftMenuLayout/LeftMenuLayout"

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