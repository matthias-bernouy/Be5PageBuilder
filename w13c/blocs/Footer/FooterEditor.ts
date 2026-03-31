import { createDefaultElement } from "src/core/Utilities/createDefaultElement";
import { Editor } from "src/core/Editor/core/Editor";
import { disableBlocActions } from "src/Be5System/disableBlocActions";

const tag = "BE5_TAG_TO_BE_REPLACED";
const footerMenuTag = tag + "-menu";

class FooterEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, "");

        if (!this.target.querySelector('[slot="menus"]')) {
            createDefaultElement(this.target, "menus", "div", "");
        }

        if (!this.target.querySelector('[slot="newsletter"]')) {
            createDefaultElement(this.target, "newsletter", "div", "");
        }

        if (!this.target.querySelector('[slot="copyright"]')) {
            createDefaultElement(this.target, "copyright", "p", "© 2024 Company. All rights reserved.");
        }

        this.viewEditor();
    }

    init(): void {
        const elementsToDisable: HTMLElement[] = [];

        // Make copyright editable and disable bloc actions
        const copyright = this.target.querySelector('[slot="copyright"]');
        if (copyright) {
            this.makeTextEditable(copyright as HTMLElement);
            elementsToDisable.push(copyright as HTMLElement);
        }

        // Make menu titles editable
        this.target.querySelectorAll('[slot="title"]').forEach(el => {
            this.makeTextEditable(el as HTMLElement);
            elementsToDisable.push(el as HTMLElement);
        });

        // Make menu links editable
        this.target.querySelectorAll('[slot="links"]').forEach(el => {
            this.makeTextEditable(el as HTMLElement);
            elementsToDisable.push(el as HTMLElement);
        });

        // Make newsletter elements editable
        const newsletter = this.target.querySelector('[slot="newsletter"]');
        if (newsletter) {
            newsletter.querySelectorAll('*').forEach(el => {
                const el_ = el as HTMLElement;
                if (el_.tagName === "P" || el_.tagName === "H2" || el_.tagName === "H3" || el_.tagName === "LABEL") {
                    this.makeTextEditable(el_);
                } else if (el_.tagName === "BUTTON") {
                    this.makeTextEditable(el_);
                }
                elementsToDisable.push(el_);
            });
        }

        if (elementsToDisable.length > 0) {
            disableBlocActions(elementsToDisable);
        }
    }

    private makeTextEditable(el: HTMLElement): void {
        const handleFocus = () => {
            el.contentEditable = "true";
            el.style.cursor = "text";
        };
        const handleBlur = () => {
            el.contentEditable = "false";
        };

        el.addEventListener("focus", handleFocus);
        el.addEventListener("blur", handleBlur);
        el.tabIndex = 0;
    }

    restore(): void {}

    // ── Helpers ───────────────────────────────────

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

    // ── Menu card ──────────────────────────────────

    private menuCard(menu: HTMLElement): HTMLElement {
        const card = document.createElement("div");
        card.style.cssText = "border:1px solid #e5e7eb;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px";

        // Title
        let titleEl = menu.querySelector('[slot="title"]') as HTMLElement | null;
        if (!titleEl) {
            titleEl = document.createElement("span");
            titleEl.slot = "title";
            titleEl.textContent = "Menu";
            menu.appendChild(titleEl);
        }

        const titleRow = document.createElement("div");
        titleRow.style.cssText = "display:flex;align-items:center;gap:4px";
        titleRow.appendChild(this.input("Titre du menu", titleEl.textContent?.trim() || "", v => {
            titleEl!.textContent = v;
        }));
        titleRow.appendChild(this.deleteBtn(() => { menu.remove(); card.remove(); }));
        card.appendChild(titleRow);

        // Links
        const linksSection = document.createElement("div");
        linksSection.style.cssText = "display:flex;flex-direction:column;gap:4px;padding-left:12px;border-left:2px solid #e5e7eb";

        const linksTitle = document.createElement("span");
        linksTitle.textContent = "Liens";
        linksTitle.style.cssText = "font-size:0.6875rem;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em";
        linksSection.appendChild(linksTitle);

        const linksList = document.createElement("div");
        linksList.style.cssText = "display:flex;flex-direction:column;gap:3px";
        menu.querySelectorAll('[slot="links"]').forEach(link => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex;align-items:center;gap:4px";

            row.appendChild(this.input("Texte", link.textContent?.trim() || "", v => {
                link.textContent = v;
            }));

            const anchor = link.tagName === "A" ? (link as HTMLAnchorElement) : null;
            row.appendChild(this.input("URL", anchor?.getAttribute("href") || "#", v => {
                anchor?.setAttribute("href", v);
            }));

            row.appendChild(this.deleteBtn(() => { link.remove(); row.remove(); }));
            linksList.appendChild(row);
        });
        linksSection.appendChild(linksList);

        linksSection.appendChild(this.addBtn("Lien", () => {
            const link = document.createElement("a");
            link.slot = "links";
            link.href = "#";
            link.textContent = "Lien";
            menu.appendChild(link);

            const row = document.createElement("div");
            row.style.cssText = "display:flex;align-items:center;gap:4px";
            row.appendChild(this.input("Texte", "Lien", v => { link.textContent = v; }));
            row.appendChild(this.input("URL", "#", v => { link.setAttribute("href", v); }));
            row.appendChild(this.deleteBtn(() => { link.remove(); row.remove(); }));
            linksList.appendChild(row);
        }));

        card.appendChild(linksSection);
        return card;
    }

    // ── Panel config ───────────────────────────────

    override get panelConfig(): HTMLElement | null {
        const panel = document.createElement("div");

        return panel;
    }
}

document.EditorManager.getObserver().register_editor({
    tag: "BE5_TAG_TO_BE_REPLACED",
    cl: FooterEditor,
    label: "BE5_LABEL_TO_BE_REPLACED",
    group: "BE5_GROUP_TO_BE_REPLACED",
});
