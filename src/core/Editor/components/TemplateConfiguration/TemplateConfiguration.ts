import "w13c/core/Dialog/LateralDialog/LateralDialog";
import "w13c/core/Form/Button/Button";
import "w13c/core/Form/TagSuggest/TagSuggest";
import "w13c/core/Form/FormSection";

import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "w13c/core/Dialog/LateralDialog/LateralDialog";
import { Component } from "src/core/Editor/core/Component";
import { showToast } from "w13c/core/Toast/ToastStack";

const NAME_MAX = 50;
const DESCRIPTION_MAX = 120;

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

            const endpoint = new URL("../../api/template", window.location.href);
            if (id) endpoint.searchParams.set("id", id);

            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
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
                const result = await res.json();
                if (!id && result.id) {
                    url.searchParams.set("id", result.id);
                    window.history.pushState({}, "", url);
                }
                showToast(id ? "Template updated" : "Template created", { type: "success" });
            } catch (err: any) {
                showToast("Failed to save template: " + (err?.message || err), { type: "error", duration: 6000 });
            }
        });

        Array.from(this.attributes)
            .filter(attr => attr.name.startsWith("default-"))
            .forEach(attr => this._setDefaultValue(attr.name));

        this._wireCharCounter("name", NAME_MAX);
        this._wireCharCounter("description", DESCRIPTION_MAX);
    }

    private _collectFormData() {
        return {
            name: this._getInputValue("name"),
            description: this._getInputValue("description"),
            category: this._getTagSuggestValue("category"),
        };
    }

    private _getInputValue(name: string): string {
        const input = this.shadowRoot?.querySelector(`input[name=${name}]`) as HTMLInputElement | null;
        return input?.value.trim() ?? "";
    }

    private _getTagSuggestValue(name: string): string {
        const el = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${name}]`) as any;
        return (el?.value ?? "").trim();
    }

    private _setDefaultValue(name: string) {
        const defVal = this.getAttribute(name);
        if (defVal === null) return;
        const fieldName = name.replace("default-", "");

        const input = this.shadowRoot?.querySelector(`input[name=${fieldName}]`) as HTMLInputElement | null;
        if (input) {
            input.value = defVal;
            if (fieldName === "name") this._updateCounter("name", NAME_MAX);
            if (fieldName === "description") this._updateCounter("description", DESCRIPTION_MAX);
            return;
        }

        const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${fieldName}]`) as any;
        if (tagSuggest && "value" in tagSuggest) tagSuggest.value = defVal;
    }

    private _wireCharCounter(fieldName: string, max: number) {
        const input = this.shadowRoot?.querySelector(`input[name=${fieldName}]`);
        if (!input) return;
        input.addEventListener("input", () => this._updateCounter(fieldName, max));
        this._updateCounter(fieldName, max);
    }

    private _updateCounter(fieldName: string, max: number) {
        const input = this.shadowRoot?.querySelector(`input[name=${fieldName}]`) as HTMLInputElement | null;
        const counter = this.shadowRoot?.querySelector(`.counter[data-for="${fieldName}"]`) as HTMLElement | null;
        if (!input || !counter) return;

        const len = input.value.length;
        const countEl = counter.querySelector(".count");
        if (countEl) countEl.textContent = String(len);
        counter.dataset.over = String(len > max);
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}

customElements.define("w13c-template-information", TemplateConfiguration);
