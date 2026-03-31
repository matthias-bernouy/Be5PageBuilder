import { Component } from "src/core/Component/core/Component";
import css from "./style.css" with { type: "text" };
import template from "./template.html" with { type: "text" };

export class HorizontalMenuItem extends Component {
    private labelEl: HTMLElement | null = null;

    constructor() {
        super({ css, template: template as unknown as string });
    }

    connectedCallback() {
        const shadow = this.shadowRoot!;
        this.labelEl = shadow.querySelector(".item-label");

        // Détecte la présence d'éléments dans le slot submenu
        const submenuSlot = shadow.querySelector('slot[name="submenu"]') as HTMLSlotElement;
        submenuSlot?.addEventListener("slotchange", () => {
            if (submenuSlot.assignedElements().length > 0) {
                this.setAttribute("has-submenu", "");
            } else {
                this.removeAttribute("has-submenu");
                this.removeAttribute("open");
            }
        });

        // Ouvre/ferme le sous-menu au clic sur le label
        this.labelEl?.addEventListener("click", (e: Event) => {
            if (!this.hasAttribute("has-submenu")) return;
            // Empêche la navigation si le slot label contient un <a>
            const target = e.target as HTMLElement;
            if (target.tagName === "A") e.preventDefault();
            this.toggleAttribute("open");
        });

        // Ferme au clic en dehors
        document.addEventListener("click", (e: Event) => {
            if (!this.contains(e.target as Node)) {
                this.removeAttribute("open");
            }
        });
    }
}

