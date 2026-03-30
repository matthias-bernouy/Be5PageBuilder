import { Editor } from "src/core/Editor/Base/Editor";
import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { disableBlocActions } from "src/Be5System/disableBlocActions";

export class HorizontalNavEditor extends Editor {
  private logo!: HTMLImageElement;
  private navItems!: HTMLElement;
  private actions!: HTMLElement;

  constructor(target: HTMLElement) {
    super(target, "");

    // --- Logo ---
    const existingLogo = this.target.querySelector<HTMLImageElement>('[slot="logo"]');
    if (existingLogo) {
      this.logo = existingLogo;
    } else {
      this.logo = createDefaultElement(
        this.target,
        "logo",
        "img",
        ""
      ) as HTMLImageElement;
      this.logo.setAttribute("src", "https://placehold.co/120x40?text=Logo");
      this.logo.setAttribute("alt", "Logo");
      this.logo.setAttribute("slot", "logo");
    }

    // --- Nav Items (container / zone répétable) ---
    const existingNavItems = this.target.querySelector<HTMLElement>('[slot="nav-items"]');
    if (existingNavItems) {
      this.navItems = existingNavItems;
    } else {
      this.navItems = document.createElement("ul");
      this.navItems.setAttribute("slot", "nav-items");
      this.navItems.classList.add("nav-list");

      // Default nav items
      const defaultItems = [
        { label: "Accueil", href: "#" },
        {
          label: "Produits",
          href: "#",
          submenu: ["Catégorie A", "Catégorie B", "Catégorie C"],
        },
        {
          label: "Services",
          href: "#",
          submenu: ["Consulting", "Formation"],
        },
        { label: "À propos", href: "#" },
        { label: "Contact", href: "#" },
      ];

      defaultItems.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("nav-item");

        if (item.submenu) {
          li.classList.add("has-submenu");

          const trigger = document.createElement("a");
          trigger.href = item.href;
          trigger.textContent = item.label;
          trigger.setAttribute("data-submenu-trigger", "");
          trigger.setAttribute("aria-expanded", "false");
          trigger.setAttribute("aria-haspopup", "true");
          li.appendChild(trigger);

          const submenu = document.createElement("ul");
          submenu.classList.add("nav-submenu");
          item.submenu.forEach((sub) => {
            const subLi = document.createElement("li");
            subLi.classList.add("nav-submenu__item");
            const subA = document.createElement("a");
            subA.href = "#";
            subA.textContent = sub;
            subLi.appendChild(subA);
            submenu.appendChild(subLi);
          });
          li.appendChild(submenu);
        } else {
          const a = document.createElement("a");
          a.href = item.href;
          a.textContent = item.label;
          li.appendChild(a);
        }

        this.navItems.appendChild(li);
      });

      this.target.appendChild(this.navItems);
    }

    // --- Actions (container / zone répétable) ---
    const existingActions = this.target.querySelector<HTMLElement>('[slot="actions"]');
    if (existingActions) {
      this.actions = existingActions;
    } else {
      this.actions = document.createElement("div");
      this.actions.setAttribute("slot", "actions");
      this.actions.classList.add("nav-actions");

      const btnSecondary = document.createElement("a");
      btnSecondary.href = "#";
      btnSecondary.textContent = "Connexion";
      btnSecondary.classList.add("btn", "btn--secondary");

      const btnPrimary = document.createElement("a");
      btnPrimary.href = "#";
      btnPrimary.textContent = "Essai gratuit";
      btnPrimary.classList.add("btn", "btn--primary");

      this.actions.appendChild(btnSecondary);
      this.actions.appendChild(btnPrimary);
      this.target.appendChild(this.actions);
    }

    this.viewEditor();
  }

  init(): void {
    // Logo est un contenu fixe et non répétable : on désactive les actions de bloc
    disableBlocActions([this.logo]);
    // navItems et actions sont des conteneurs répétables : on ne désactive PAS
  }

  restore(): void {}
}

document.EditorManager.getObserver().register_editor({
  tag: "be5-horizontal-nav",
  cl: HorizontalNavEditor,
  label: "Menu Horizontal",
  group: "Navigation",
});