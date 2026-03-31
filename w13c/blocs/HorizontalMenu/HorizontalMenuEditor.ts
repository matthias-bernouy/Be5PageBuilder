import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { Editor } from "src/core/Editor/core/Editor";
import { disableBlocActions } from "src/core/Editor/editors/disableBlocActions";
const tag = "BE5_TAG_TO_BE_REPLACED";
const horizontalMenuItemTag = tag + "-item";

class HorizontalMenuEditor extends Editor {
    private logo: HTMLImageElement;

    constructor(target: HTMLElement) {
        super(target, "");

        this.logo =
            (this.target.querySelector('[slot="logo"]') as HTMLImageElement) ??
            (createDefaultElement(this.target, "logo", "img", "") as HTMLImageElement);

        if (!this.logo.getAttribute("src")) {
            this.logo.setAttribute("alt", "Logo");
        }

        this.viewEditor();
    }

    init(): void {
        disableBlocActions([this.logo]);
    }

    restore(): void {}

    // ── Helpers UI ──────────────────────────────────────

    private input(placeholder: string, value: string, onInput: (v: string) => void): HTMLInputElement {
        const el = document.createElement("input");
        el.type = "text";
        el.placeholder = placeholder;
        el.value = value;
        el.style.cssText = "border:1px solid #d1d5db;border-radius:4px;padding:4px 8px;font-size:0.8125rem;flex:1;min-width:0";
        el.addEventListener("input", () => onInput(el.value));
        return el;
    }

    private deleteBtn(onClick: () => void): HTMLElement {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "✕";
        btn.style.cssText = "border:none;background:none;cursor:pointer;color:#ef4444;font-size:0.875rem;padding:2px 4px;flex-shrink:0";
        btn.addEventListener("click", onClick);
        return btn;
    }

    private addBtn(label: string, onClick: () => void): HTMLElement {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = `+ ${label}`;
        btn.style.cssText = "border:1px dashed #d1d5db;background:none;cursor:pointer;padding:5px 10px;border-radius:6px;color:#2563eb;font-size:0.8125rem;width:100%";
        btn.addEventListener("click", onClick);
        return btn;
    }

    private section(title: string): HTMLElement {
        const el = document.createElement("strong");
        el.textContent = title;
        el.style.cssText = "font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;padding-top:4px";
        return el;
    }

    // ── Sub-link row (used in sub-menus and actions) ───

    private linkRow(el: HTMLElement): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;gap:4px";

        row.appendChild(this.input("Texte", el.textContent?.trim() || "", v => {
            el.textContent = v;
        }));

        const anchor = el.tagName === "A" ? (el as HTMLAnchorElement) : null;
        row.appendChild(this.input("URL", anchor?.getAttribute("href") || "#", v => {
            anchor?.setAttribute("href", v);
        }));

        row.appendChild(this.deleteBtn(() => { el.remove(); row.remove(); }));
        return row;
    }

    // ── Nav item card ──────────────────────────────────

    private navItemCard(item: HTMLElement): HTMLElement {
        const card = document.createElement("div");
        card.style.cssText = "border:1px solid #e5e7eb;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px";

        // Label
        let labelEl = item.querySelector('[slot="label"]') as HTMLElement | null;
        if (!labelEl) {
            labelEl = document.createElement("a");
            labelEl.slot = "label";
            labelEl.setAttribute("href", "#");
            labelEl.textContent = "Lien";
            item.appendChild(labelEl);
        }

        const labelRow = document.createElement("div");
        labelRow.style.cssText = "display:flex;align-items:center;gap:4px";

        labelRow.appendChild(this.input("Texte", labelEl.textContent?.trim() || "", v => {
            labelEl!.textContent = v;
        }));

        const labelAnchor = labelEl.tagName === "A" ? (labelEl as HTMLAnchorElement) : null;
        labelRow.appendChild(this.input("URL", labelAnchor?.getAttribute("href") || "#", v => {
            labelAnchor?.setAttribute("href", v);
        }));

        labelRow.appendChild(this.deleteBtn(() => { item.remove(); card.remove(); }));
        card.appendChild(labelRow);

        // Sub-menu
        const sub = document.createElement("div");
        sub.style.cssText = "display:flex;flex-direction:column;gap:4px;padding-left:12px;border-left:2px solid #e5e7eb";

        const subTitle = document.createElement("span");
        subTitle.textContent = "Sous-menu";
        subTitle.style.cssText = "font-size:0.6875rem;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em";
        sub.appendChild(subTitle);

        const subList = document.createElement("div");
        subList.style.cssText = "display:flex;flex-direction:column;gap:3px";
        item.querySelectorAll('[slot="submenu"]').forEach(s => {
            subList.appendChild(this.linkRow(s as HTMLElement));
        });
        sub.appendChild(subList);

        sub.appendChild(this.addBtn("Sous-lien", () => {
            const link = document.createElement("a");
            link.slot = "submenu";
            link.href = "#";
            link.textContent = "Sous-lien";
            item.appendChild(link);
            subList.appendChild(this.linkRow(link));
        }));

        card.appendChild(sub);
        return card;
    }

    // ── Panel config ───────────────────────────────────

    override get panelConfig(): HTMLElement | null {
        const panel = document.createElement("div");
        panel.style.cssText = "display:flex;flex-direction:column;gap:10px;padding:8px";

        // Sticky
        const stickyCheckbox = document.createElement("w13c-checkbox") as any;
        stickyCheckbox.textContent = "Menu fixe (sticky)";
        if (this.target.hasAttribute("sticky")) stickyCheckbox.setAttribute("checked", "");
        stickyCheckbox.addEventListener("change", () => {
            this.target.toggleAttribute("sticky", stickyCheckbox.checked);
        });
        panel.appendChild(stickyCheckbox);

        // Navigation
        panel.appendChild(this.section("Navigation"));

        const navList = document.createElement("div");
        navList.style.cssText = "display:flex;flex-direction:column;gap:6px";
        this.target.querySelectorAll(horizontalMenuItemTag).forEach(item => {
            navList.appendChild(this.navItemCard(item as HTMLElement));
        });
        panel.appendChild(navList);

        panel.appendChild(this.addBtn("Ajouter un lien", () => {
            const item = document.createElement(horizontalMenuItemTag);
            item.slot = "nav";
            const link = document.createElement("a");
            link.slot = "label";
            link.href = "#";
            link.textContent = "Lien";
            item.appendChild(link);
            this.target.appendChild(item);
            navList.appendChild(this.navItemCard(item));
        }));

        // Actions
        panel.appendChild(this.section("Actions"));

        const actionsList = document.createElement("div");
        actionsList.style.cssText = "display:flex;flex-direction:column;gap:4px";
        this.target.querySelectorAll('a[slot="actions"]').forEach(a => {
            actionsList.appendChild(this.linkRow(a as HTMLElement));
        });
        panel.appendChild(actionsList);

        panel.appendChild(this.addBtn("Ajouter une action", () => {
            const link = document.createElement("a");
            link.slot = "actions";
            link.href = "#";
            link.textContent = "Action";
            this.target.appendChild(link);
            actionsList.appendChild(this.linkRow(link));
        }));

        return panel;
    }
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: HorizontalMenuEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED",
});
