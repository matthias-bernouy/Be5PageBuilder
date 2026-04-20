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

/** Kebab-case check for snippet identifiers: lowercase letters, digits,
 * dashes; at least one character; no leading or trailing dash. */
function isValidIdentifier(id: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export class SnippetConfiguration extends Component {

    private _identifierCheckToken = 0;
    private _identifierValid = true;

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string,
        });
    }

    override connectedCallback() {
        const form = this.shadowRoot?.querySelector("form");

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = this._collectFormData();

            // identifier only validated in create mode (it's immutable afterwards)
            const isCreate = !this.getAttribute("default-id");
            if (isCreate && !this._identifierValid) {
                showToast("Fix the identifier before saving.", { type: "error" });
                return;
            }
            if (isCreate && !data.identifier) {
                showToast("An identifier is required.", { type: "error" });
                return;
            }

            const content = document.EditorManager.getContent();
            const url = new URL(window.location.href);
            const id = url.searchParams.get("id") || this.getAttribute("default-id");

            const endpoint = new URL("../../api/snippet", window.location.href);
            if (id) endpoint.searchParams.set("id", id);

            const payload: Record<string, any> = {
                name: data.name,
                description: data.description,
                category: data.category,
                content,
            };
            if (!id) payload.identifier = data.identifier;

            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    showToast("Failed to save snippet: " + await res.text(), { type: "error", duration: 6000 });
                    return;
                }
                const result = await res.json();
                if (!id && result.id) {
                    url.searchParams.set("identifier", result.identifier);
                    url.searchParams.delete("id");
                    window.history.pushState({}, "", url);
                    this.setAttribute("default-id", result.id);
                    this._lockIdentifier();
                }
                showToast(id ? "Snippet updated" : "Snippet created", { type: "success" });
            } catch (err: any) {
                showToast("Failed to save snippet: " + (err?.message || err), { type: "error", duration: 6000 });
            }
        });

        Array.from(this.attributes)
            .filter(attr => attr.name.startsWith("default-"))
            .forEach(attr => this._setDefaultValue(attr.name));

        this._wireCharCounter("name", NAME_MAX);
        this._wireCharCounter("description", DESCRIPTION_MAX);
        this._wireIdentifierValidation();

        // If editing an existing snippet, lock the identifier and load usages.
        if (this.hasAttribute("default-identifier")) {
            this._lockIdentifier();
            this._loadUsages(this.getAttribute("default-identifier")!);
        }
    }

    // --- Data collection --------------------------------------------------

    private _collectFormData() {
        return {
            identifier: this._getInputValue("identifier"),
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

    private _lockIdentifier() {
        const ele = this.shadowRoot?.querySelector("input[name=identifier]") as HTMLInputElement | null;
        if (!ele) return;
        ele.disabled = true;
        this._setIdentifierHint("info", "Immutable after creation.");
        this._setIdentifierValid(true);
    }

    // --- Char counters ----------------------------------------------------

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

    // --- Identifier validation --------------------------------------------

    private _wireIdentifierValidation() {
        const input = this.shadowRoot?.querySelector("input[name=identifier]") as HTMLInputElement | null;
        if (!input) return;

        // Locked identifier (edit mode) — skip wiring.
        if (this.hasAttribute("default-identifier")) return;

        input.addEventListener("input", () => this._validateIdentifierFormatSync());
        input.addEventListener("blur", () => this._validateIdentifierRemote());
        this._validateIdentifierFormatSync();
    }

    private _setIdentifierHint(level: "info" | "error" | "success", text: string) {
        const hint = this.shadowRoot?.getElementById("identifier-hint") as HTMLElement | null;
        if (!hint) return;
        hint.textContent = text;
        hint.dataset.level = level;
    }

    private _setIdentifierValid(valid: boolean) {
        this._identifierValid = valid;
        const input = this.shadowRoot?.querySelector("input[name=identifier]") as HTMLInputElement | null;
        const btn = this.shadowRoot?.getElementById("save-btn");
        if (input) {
            if (valid) input.removeAttribute("aria-invalid");
            else input.setAttribute("aria-invalid", "true");
        }
        if (btn) {
            if (valid) btn.removeAttribute("aria-disabled");
            else btn.setAttribute("aria-disabled", "true");
        }
    }

    private _validateIdentifierFormatSync() {
        const input = this.shadowRoot?.querySelector("input[name=identifier]") as HTMLInputElement | null;
        if (!input) return;
        const id = input.value.trim();

        if (id === "") {
            this._setIdentifierHint("error", "Identifier is required.");
            this._setIdentifierValid(false);
            return;
        }
        if (!isValidIdentifier(id)) {
            this._setIdentifierHint(
                "error",
                "Lowercase letters, digits and dashes only (e.g. hero-v1).",
            );
            this._setIdentifierValid(false);
            return;
        }
        this._setIdentifierHint("info", "Lowercase letters, numbers and dashes. Immutable after creation.");
        this._setIdentifierValid(true);
    }

    private async _validateIdentifierRemote() {
        const input = this.shadowRoot?.querySelector("input[name=identifier]") as HTMLInputElement | null;
        if (!input) return;
        const id = input.value.trim();
        if (id === "" || !isValidIdentifier(id)) return;

        const token = ++this._identifierCheckToken;
        try {
            const url = new URL("../../api/snippet-exists", window.location.href);
            url.searchParams.set("identifier", id);
            const res = await fetch(url);
            if (token !== this._identifierCheckToken) return;

            if (!res.ok) {
                this._setIdentifierHint("error", "Could not validate the identifier (server error).");
                this._setIdentifierValid(false);
                return;
            }
            const body = await res.json() as { exists: boolean };
            if (body.exists) {
                this._setIdentifierHint("error", `"${id}" is already used by another snippet.`);
                this._setIdentifierValid(false);
            } else {
                this._setIdentifierHint("success", "Identifier is available.");
                this._setIdentifierValid(true);
            }
        } catch {
            if (token !== this._identifierCheckToken) return;
            this._setIdentifierHint("error", "Could not reach the server to validate the identifier.");
            this._setIdentifierValid(false);
        }
    }

    // --- Usages -----------------------------------------------------------

    private async _loadUsages(identifier: string) {
        try {
            const endpoint = new URL("../../api/snippets", window.location.href);
            endpoint.searchParams.set("identifier", identifier);
            endpoint.searchParams.set("usages", "true");

            const res = await fetch(endpoint);
            if (!res.ok) return;

            const { pages } = await res.json() as { pages: Array<{ identifier: string; title: string; path: string }> };

            const list = this.shadowRoot?.querySelector(".usages-list") as HTMLElement | null;
            if (!list) return;

            if (pages.length === 0) {
                list.innerHTML = `<li class="usages-empty">Not used on any page yet.</li>`;
                return;
            }
            list.innerHTML = pages
                .map(p => `<li>• ${p.title || p.identifier} <small>(${p.path})</small></li>`)
                .join("");
        } catch { /* ignore */ }
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}

customElements.define("w13c-snippet-information", SnippetConfiguration);
