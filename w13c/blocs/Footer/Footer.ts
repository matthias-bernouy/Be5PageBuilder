import { Component } from "src/core/Component/core/Component";
import css from "./style.css" with { type: "text" };
import template from "./template.html" with { type: "text" };
import { registerFooterMenu } from "./FooterMenu/tag";

const tag = "BE5_TAG_TO_BE_REPLACED";

class Footer extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }
}

customElements.define(tag, Footer);
registerFooterMenu(tag);
