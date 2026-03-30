import { Component } from "src/core/Utilities/Component";
import template from "./template.html" with { type: "text" };
import css from "./style.css" with { type: "text" };

export class HorizontalNav extends Component {
  private _mobileToggle: HTMLButtonElement | null = null;
  private _navMenu: HTMLElement | null = null;

  constructor() {
    super({ css, template: template as unknown as string });
  }

  connectedCallback() {
    this._mobileToggle = this.shadowRoot?.querySelector(".nav__burger") ?? null;
    this._navMenu = this.shadowRoot?.querySelector(".nav__menu") ?? null;

    this._mobileToggle?.addEventListener("click", () => this._toggleMenu());

    // Close submenus when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target as Node)) {
        this._closeAllSubmenus();
      }
    });

    // Handle submenu toggle on slotted nav items
    this.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const trigger = target.closest("[data-submenu-trigger]") as HTMLElement | null;
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        this._toggleSubmenu(trigger);
      }
    });
  }

  private _toggleMenu(): void {
    const isOpen = this._navMenu?.classList.contains("is-open");
    if (isOpen) {
      this._navMenu?.classList.remove("is-open");
      this._mobileToggle?.setAttribute("aria-expanded", "false");
    } else {
      this._navMenu?.classList.add("is-open");
      this._mobileToggle?.setAttribute("aria-expanded", "true");
    }
  }

  private _toggleSubmenu(trigger: HTMLElement): void {
    const parentItem = trigger.closest(".nav-item") as HTMLElement | null;
    const isOpen = parentItem?.classList.contains("is-open");
    this._closeAllSubmenus();
    if (!isOpen && parentItem) {
      parentItem.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
  }

  private _closeAllSubmenus(): void {
    this.querySelectorAll(".nav-item.is-open").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector("[data-submenu-trigger]")?.setAttribute("aria-expanded", "false");
    });
  }

  get panelConfig(): HTMLElement | null {
    return null;
  }
}

customElements.define("be5-horizontal-nav", HorizontalNav);