import { Component } from "src/core/Utilities/Component";
import css from "./style.css" with { type: "text" };
import template from "./template.html" with { type: "text" };

export class FooterMenu extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }
}
