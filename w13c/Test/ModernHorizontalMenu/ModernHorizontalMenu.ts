import { Component } from "src/core/Utilities/Component";
import css from "./style.css" with { type: "text" };
import template from "./template.html" with { type: "text" };

class NavBar extends Component {
    private toggleBtn: HTMLButtonElement | null = null;
    private navCenter: HTMLElement | null = null;
    private navEnd: HTMLElement | null = null;

    constructor() {
        super({ css, template: template as unknown as string });
    }

    connectedCallback() {
        super.connectedCallback?.();

        const shadow = this.shadowRoot!;
        this.toggleBtn = shadow.querySelector(".navbar-toggle");
        this.navCenter = shadow.querySelector(".navbar-center");
        this.navEnd = shadow.querySelector(".navbar-end");

        this.toggleBtn?.addEventListener("click", () => this.handleToggle());

        // Fermer le menu mobile au clic sur un lien
        this.addEventListener("click", (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "A" && this.hasAttribute("open")) {
                this.removeAttribute("open");
                this.syncToggleAria();
            }
        });
    }

    private handleToggle(): void {
        if (this.hasAttribute("open")) {
            this.removeAttribute("open");
        } else {
            this.setAttribute("open", "");
        }
        this.syncToggleAria();
    }

    private syncToggleAria(): void {
        const isOpen = this.hasAttribute("open");
        this.toggleBtn?.setAttribute("aria-expanded", String(isOpen));
    }

    get panelConfig(): HTMLElement | null {
        const panel = document.createElement("div");
        panel.style.display = "flex";
        panel.style.flexDirection = "column";
        panel.style.gap = "12px";
        panel.style.padding = "8px";

        // Sticky toggle
        const stickyCheckbox = document.createElement("w13c-checkbox") as any;
        stickyCheckbox.textContent = "Menu fixe (sticky)";
        stickyCheckbox.checked = this.hasAttribute("sticky");
        stickyCheckbox.addEventListener("change", () => {
            if (stickyCheckbox.checked) {
                this.setAttribute("sticky", "");
            } else {
                this.removeAttribute("sticky");
            }
        });
        panel.appendChild(stickyCheckbox);

        return panel;
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", NavBar);