import { Component } from "src/core/Component/core/Component";
import css from "./style.css" with { type: "text" };
import template from "./template.html" with { type: "text" };
import { registerHorizontalMenuItem } from "./HorizontalMenuItem/tag";

const tag = "BE5_TAG_TO_BE_REPLACED";

class HorizontalMenu extends Component {
    private toggleBtn: HTMLButtonElement | null = null;

    constructor() {
        super({ css, template: template as unknown as string });
    }

    connectedCallback() {
        const shadow = this.shadowRoot!;
        this.toggleBtn = shadow.querySelector(".navbar-toggle");

        this.toggleBtn?.addEventListener("click", () => {
            const isOpen = this.hasAttribute("open");
            this.toggleAttribute("open");
            this.toggleBtn!.setAttribute("aria-expanded", String(!isOpen));
        });
    }
}

customElements.define(tag, HorizontalMenu);
registerHorizontalMenuItem(tag);
