import { Component } from "src/core/Editor/core/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Toolbar extends Component {
    static get observedAttributes() {
        return ["data-visible", "color", "border"];
    }

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        if (name === "data-visible") {
            newVal === "true" ? this.classList.add("visible") : this.classList.remove("visible");
        }
    }

    /**
     * Position the toolbar above an element
     * @param rect The target element's DOMRect
     */
    public showAt(rect: DOMRect) {
        this.setAttribute("data-visible", "true");
        
        // Horizontal centering and position above (12px offset)
        const top = rect.top + window.scrollY - this.offsetHeight - 12;
        const left = rect.left + window.scrollX + (rect.width / 2);

        this.style.top = `${top}px`;
        this.style.left = `${left}px`;
    }

    public hide() {
        this.setAttribute("data-visible", "false");
    }
}

if (!customElements.get("p9r-toolbar")) {
    customElements.define("p9r-toolbar", Toolbar);
}