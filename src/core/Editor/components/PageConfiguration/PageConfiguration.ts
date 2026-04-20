
import "w13c/core/Dialog/LateralDialog/LateralDialog"
import "w13c/core/Form/Button/Button"
import "w13c/core/Form/TagSuggest/TagSuggest";
import "w13c/core/Form/FormSection";
import "src/core/Editor/configuration/Inputs/P9rSelect";
import "src/core/Editor/configuration/Inputs/P9rInput";

import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "w13c/core/Dialog/LateralDialog/LateralDialog";
import type { P9rInput } from "src/core/Editor/configuration/Inputs/P9rInput";

import { Component } from "src/core/Editor/core/Component";
import { showToast } from "w13c/core/Toast/ToastStack";
import { isValidPathFormat } from "src/shared/validation";

export class PageConfiguration extends Component {

    private _pathCheckToken = 0;
    private _pathValid = true;
    private _pathBlurred = false;

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    static get observedAttributes() {
        return ['type', 'disabled', 'variant', 'color'];
    }

    override connectedCallback() {
        const form = this.shadowRoot?.querySelector("form");

        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!this._pathValid) {
                showToast("Fix the path before saving.", { type: "error" });
                return;
            }
            const data = this._collectFormData();
            document.EditorManager.save({
                title: data.title,
                description: data.description,
                visible: data.visible,
                identifier: data.identifier,
                path: data.path,
                tags: JSON.stringify(data.tags),
            }).then(() => {
                showToast("Page saved", { type: "success" });
            }).catch((err) => {
                console.error(err);
                showToast("Failed to save page: " + (err?.message || err), { type: "error", duration: 6000 });
            });
            // Keep the admin URL in sync with the new (path, identifier) key
            // so a refresh re-opens the same page even after a rename.
            const url = new URL(window.location.href);
            url.searchParams.set("path", data.path);
            if (data.identifier) url.searchParams.set("identifier", data.identifier);
            else url.searchParams.delete("identifier");
            window.history.pushState({}, "", url);
        });

        Array.from(this.attributes)
            .filter(attr => attr.name.startsWith('default-'))
            .map(attr => attr.name)
            .forEach(name => this.setDefaultValue(name));

        this._wirePathValidation();
        this._wireOpenInNewTab();
    }

    private _wireOpenInNewTab() {
        const btn = this.shadowRoot?.getElementById("url-open");
        btn?.addEventListener("click", () => {
            const path = this._getPathInput()?.value.trim() ?? "";
            if (!path || !isValidPathFormat(path)) return;
            const identifier = this._getIdentifierInput()?.value.trim() ?? "";
            const url = identifier
                ? `${window.location.origin}${path}?identifier=${encodeURIComponent(identifier)}`
                : `${window.location.origin}${path}`;
            window.open(url, "_blank", "noopener,noreferrer");
        });
    }

    private _collectFormData() {
        return {
            title: this._getInputValue("title"),
            description: this._getInputValue("description"),
            identifier: this._getInputValue("identifier"),
            path: this._getInputValue("path"),
            visible: this._getSelectValue("visible") === "on",
            tags: this._getTagsValue(),
        };
    }

    private _getInputElement(name: string): P9rInput | null {
        return this.shadowRoot?.querySelector(`p9r-input[name=${name}]`) as P9rInput | null;
    }

    private _getInputValue(name: string): string {
        return this._getInputElement(name)?.value.trim() ?? "";
    }

    private _getSelectValue(name: string): string {
        const sel = this.shadowRoot?.querySelector(`p9r-select[name=${name}]`) as any;
        return sel?.value ?? "";
    }

    private _getTagsValue(): string[] {
        const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=tags]`) as any;
        const raw = (tagSuggest?.value ?? "") as string;
        return raw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    }

    private setDefaultValue(name: string) {
        const defVal = this.getAttribute(name);
        if (defVal === null) return;
        const fieldName = name.replace("default-", "");

        // <p9r-input>
        const pInput = this._getInputElement(fieldName);
        if (pInput) {
            pInput.value = defVal;
            if (fieldName === "path") this._updateUrlPreview();
            return;
        }

        // <p9r-select> (e.g. visible)
        const select = this.shadowRoot?.querySelector(`p9r-select[name=${fieldName}]`) as any;
        if (select && "value" in select) {
            select.value = defVal === "on" ? "on" : "";
            return;
        }

        // <p9r-tag-suggest> (e.g. tags)
        const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${fieldName}]`) as any;
        if (tagSuggest && "value" in tagSuggest) {
            tagSuggest.value = defVal;
        }
    }

    // --- Path validation + URL preview ------------------------------------

    private _wirePathValidation() {
        const input = this._getPathInput();
        const identifier = this._getIdentifierInput();
        if (!input) return;

        input.addEventListener("input", () => {
            this._updateUrlPreview();
            this._validatePathFormatSync();
        });
        input.addEventListener("blur", () => {
            this._pathBlurred = true;
            this._validatePathRemote();
        });
        identifier?.addEventListener("input", () => this._updateUrlPreview());
        identifier?.addEventListener("blur", () => {
            if (this._pathBlurred) this._validatePathRemote();
        });

        this._updateUrlPreview();
        this._validatePathFormatSync();
    }

    private _getPathInput(): P9rInput | null {
        return this._getInputElement("path");
    }

    private _getIdentifierInput(): P9rInput | null {
        return this._getInputElement("identifier");
    }

    private _setHint(level: "info" | "error" | "success", text: string) {
        this._getPathInput()?.setHint(level, text);
    }

    private _setPathValid(valid: boolean) {
        this._pathValid = valid;
        const btn = this.shadowRoot?.getElementById("save-btn");
        if (btn) {
            if (valid) btn.removeAttribute("aria-disabled");
            else btn.setAttribute("aria-disabled", "true");
        }
        this._getPathInput()?.setInvalid(!valid);
    }

    /** Sync format check — runs on every keystroke. */
    private _validatePathFormatSync() {
        const input = this._getPathInput();
        if (!input) return;
        const path = input.value.trim();

        if (path === "") {
            this._setHint("error", "Path is required.");
            this._setPathValid(false);
            return;
        }
        if (!isValidPathFormat(path)) {
            this._setHint(
                "error",
                'Only letters, numbers, "-" and "/" are allowed (e.g. /my-page).',
            );
            this._setPathValid(false);
            return;
        }
        this._setHint("info", 'Letters, numbers, "-" and "/" allowed.');
        this._setPathValid(true);
    }

    /** Remote uniqueness check — runs on blur. */
    private async _validatePathRemote() {
        const input = this._getPathInput();
        const identifierInput = this._getIdentifierInput();
        if (!input) return;

        const path = input.value.trim();
        if (path === "" || !isValidPathFormat(path)) return;

        const identifier = identifierInput?.value.trim() ?? "";
        const currentPath = this.getAttribute("default-path") ?? "";
        const currentIdentifier = this.getAttribute("default-identifier") ?? "";

        const token = ++this._pathCheckToken;

        try {
            const url = new URL("../api/page-exists", window.location.href);
            url.searchParams.set("path", path);
            if (identifier) url.searchParams.set("identifier", identifier);
            if (currentPath) url.searchParams.set("current-path", currentPath);
            if (currentIdentifier) url.searchParams.set("current-identifier", currentIdentifier);

            const res = await fetch(url);
            if (token !== this._pathCheckToken) return;

            if (!res.ok) {
                this._setHint("error", "Could not validate the path (server error).");
                this._setPathValid(false);
                return;
            }
            const body = await res.json() as { exists: boolean; reason?: "taken" | "reserved" };
            if (body.exists) {
                if (body.reason === "reserved") {
                    this._setHint("error", `"${path}" is reserved by the framework.`);
                } else {
                    this._setHint("error", `"${path}"${identifier ? ` / "${identifier}"` : ""} is already used.`);
                }
                this._setPathValid(false);
            } else {
                this._setHint("success", "Path is available.");
                this._setPathValid(true);
            }
        } catch {
            if (token !== this._pathCheckToken) return;
            this._setHint("error", "Could not reach the server to validate the path.");
            this._setPathValid(false);
        }
    }

    private _updateUrlPreview() {
        const pathInput = this._getPathInput();
        const identifierInput = this._getIdentifierInput();
        const preview = this.shadowRoot?.getElementById("url-preview") as HTMLElement | null;
        const row = this.shadowRoot?.getElementById("url-row") as HTMLElement | null;
        const openBtn = this.shadowRoot?.getElementById("url-open") as HTMLButtonElement | null;
        if (!pathInput || !preview || !row) return;

        const path = pathInput.value.trim();
        const identifier = identifierInput?.value.trim() ?? "";

        if (path === "") {
            row.hidden = true;
            return;
        }
        row.hidden = false;
        const origin = window.location.origin;
        preview.textContent = identifier
            ? `${origin}${path}?identifier=${identifier}`
            : `${origin}${path}`;
        if (openBtn) openBtn.disabled = !isValidPathFormat(path);
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}
customElements.define("w13c-page-information", PageConfiguration)
