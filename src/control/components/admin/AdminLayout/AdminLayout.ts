import { Component } from "@bernouy/cms/component";

import "src/control/components/base/Menu/LateralMenu/LateralMenu"
import "src/control/components/base/Layout/LeftMenuLayout/LeftMenuLayout"

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
