import { Component } from "src/core/Editor/runtime/Component";

import "src/ui/Menu/LateralMenu/LateralMenu"
import "src/ui/Layout/LeftMenuLayout/LeftMenuLayout"

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
