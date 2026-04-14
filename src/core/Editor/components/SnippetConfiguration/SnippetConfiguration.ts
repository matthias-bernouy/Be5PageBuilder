import "w13c/core/Dialog/LateralDialog/LateralDialog";
import "w13c/core/Form/Input/Input";
import "w13c/core/Form/Button/Button";

import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "w13c/core/Dialog/LateralDialog/LateralDialog";
import type { Input } from "w13c/core/Form/Input/Input";
import { Component } from "src/core/Editor/core/Component";

export class SnippetConfiguration extends Component {

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    override connectedCallback() {
        const form = this.shadowRoot?.querySelector("form");
        const errorEl = this.shadowRoot?.querySelector(".error-message") as HTMLElement;

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorEl.hidden = true;

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const content = document.EditorManager.getContent();

            const url = new URL(window.location.href);
            const id = url.searchParams.get("id") || this.getAttribute("default-id");

            const endpoint = new URL("../../api/snippet", window.location.href);
            if (id) endpoint.searchParams.set("id", id);

            const payload: Record<string, any> = {
                name: data.name || "",
                description: data.description || "",
                category: data.category || "",
                content
            };

            // identifier only sent on create (immutable on update)
            if (!id) payload.identifier = data.identifier || "";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                errorEl.textContent = await res.text();
                errorEl.hidden = false;
                return;
            }

            const result = await res.json();
            if (!id && result.id) {
                url.searchParams.set("identifier", result.identifier);
                url.searchParams.delete("id");
                window.history.pushState({}, "", url);
                this.setAttribute("default-id", result.id);
                this.lockIdentifier();
            }
        });

        Array.from(this.attributes)
            .filter(attr => attr.name.startsWith("default-"))
            .forEach(attr => this.setDefaultValue(attr.name));

        // If editing an existing snippet, the identifier field is locked
        // and we display the list of pages using this snippet.
        if (this.hasAttribute("default-identifier")) {
            this.lockIdentifier();
            this.loadUsages(this.getAttribute("default-identifier")!);
        }
    }

    private async loadUsages(identifier: string) {
        try {
            const endpoint = new URL("../../api/snippets", window.location.href);
            endpoint.searchParams.set("identifier", identifier);
            endpoint.searchParams.set("usages", "true");

            const res = await fetch(endpoint);
            if (!res.ok) return;

            const { pages } = await res.json() as { pages: Array<{ identifier: string; title: string; path: string }> };

            const section = this.shadowRoot!.querySelector(".usages") as HTMLElement;
            const list = this.shadowRoot!.querySelector(".usages-list") as HTMLElement;

            section.hidden = false;

            if (pages.length === 0) {
                list.innerHTML = `<li class="usages-empty">Not used on any page yet.</li>`;
                return;
            }

            list.innerHTML = pages
                .map(p => `<li>• ${p.title || p.identifier} <small>(${p.path})</small></li>`)
                .join("");
        } catch { /* ignore */ }
    }

    private setDefaultValue(name: string) {
        const defVal = this.getAttribute(name);
        const fieldName = name.replace("default-", "");
        const ele = this.shadowRoot!.querySelector(`[name=${fieldName}]`) as Input;
        if (defVal && ele) ele.value = defVal;
    }

    private lockIdentifier() {
        const ele = this.shadowRoot!.querySelector('[name=identifier]') as Input;
        if (ele) ele.setAttribute("disabled", "");
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}

customElements.define("w13c-snippet-information", SnippetConfiguration);
