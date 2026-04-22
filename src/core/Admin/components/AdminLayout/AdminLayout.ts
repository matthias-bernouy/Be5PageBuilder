import { Component } from "src/core/Editor/runtime/Component";

import "src/ui/Menu/LateralMenu/LateralMenu"
import "src/ui/Layout/LeftMenuLayout/LeftMenuLayout"

import template from './template.html' with { type: 'text' };

const LOGOUT_ITEM_SELECTOR = 'w13c-lateral-menu-item[data-role="logout"]';
const LOGOUT_META_SELECTOR = 'meta[name="admin-logout-url"]';

export class FixedAdminLayout extends Component {
    constructor(){
        super({
            css: '',
            template: template as unknown as string
        })
    }

    override connectedCallback() {
        const meta = document.querySelector<HTMLMetaElement>(LOGOUT_META_SELECTOR);
        const url = meta?.content;
        if (!url) return;

        const logoutItem = this.shadowRoot?.querySelector(LOGOUT_ITEM_SELECTOR);
        logoutItem?.setAttribute("href", url);
    }
}

customElements.define("w13c-fixed-admin-layout", FixedAdminLayout);