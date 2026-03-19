import { Component } from "src/core/Component";

import "src/core/EditorMode/Component/LateralMenu/LateralMenu"
import "src/core/EditorMode/Component/Layout/LeftMenuLayout/LeftMenuLayout"

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