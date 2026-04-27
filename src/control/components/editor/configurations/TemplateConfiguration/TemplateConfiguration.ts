import "@bernouy/webcomponents";

import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog, P9rInput } from "@bernouy/webcomponents";
import { Component } from "@bernouy/cms/component";
import { showToast } from "src/control/core/showToast";

export class TemplateConfiguration extends Component {

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    override connectedCallback() {
        const form = this.shadowRoot?.querySelector("form");

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = this._collectFormData();
            if (!data.name) {
                showToast("A name is required.", { type: "error" });
                return;
            }

            const content = document.EditorManager.getContent();
            const url = new URL(window.location.href);
            const id = url.searchParams.get("id");

            if (!id) {
                showToast("Missing template id. Create the template from the templates list first.", { type: "error", duration: 6000 });
                return;
            }

            const endpoint = new URL("../../api/template", window.location.href);

            try {
                const res = await fetch(endpoint, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id,
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        content,
                    }),
                });
                if (!res.ok) {
                    showToast("Failed to save template: " + await res.text(), { type: "error", duration: 6000 });
                    return;
                }
                showToast("Template updated", { type: "success" });
            } catch (err: any) {
                showToast("Failed to save template: " + (err?.message || err), { type: "error", duration: 6000 });
            }
        });

        Array.from(this.attributes)
            .filter(attr => attr.name.startsWith("default-"))
            .forEach(attr => this._setDefaultValue(attr.name));
    }

    private _collectFormData() {
        return {
            name: this._getInputValue("name"),
            description: this._getInputValue("description"),
            category: this._getTagSuggestValue("category"),
        };
    }

    private _getInputElement(name: string): P9rInput | null {
        return this.shadowRoot?.querySelector(`p9r-input[name=${name}]`) as P9rInput | null;
    }

    private _getInputValue(name: string): string {
        return this._getInputElement(name)?.value.trim() ?? "";
    }

    private _getTagSuggestValue(name: string): string {
        const el = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${name}]`) as any;
        return (el?.value ?? "").trim();
    }

    private _setDefaultValue(name: string) {
        const defVal = this.getAttribute(name);
        if (defVal === null) return;
        const fieldName = name.replace("default-", "");

        const input = this._getInputElement(fieldName);
        if (input) {
            input.value = defVal;
            return;
        }

        const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${fieldName}]`) as any;
        if (tagSuggest && "value" in tagSuggest) tagSuggest.value = defVal;
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}

customElements.define("w13c-template-information", TemplateConfiguration);
