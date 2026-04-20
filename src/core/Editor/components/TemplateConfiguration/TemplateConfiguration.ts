import "w13c/core/Dialog/LateralDialog/LateralDialog";
import "w13c/core/Form/Input/Input";
import "w13c/core/Form/Button/Button";
import "w13c/core/Form/TagSuggest/TagSuggest";

import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "w13c/core/Dialog/LateralDialog/LateralDialog";
import type { Input } from "w13c/core/Form/Input/Input";
import { Component } from "src/core/Editor/core/Component";

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
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const content = document.EditorManager.getContent();

            const url = new URL(window.location.href);
            const id = url.searchParams.get("id");

            const endpoint = new URL("../../api/template", window.location.href);
            if (id) endpoint.searchParams.set("id", id);

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name || "",
                    description: data.description || "",
                    category: data.category || "",
                    content
                })
            });

            if (res.ok) {
                const result = await res.json();
                if (!id && result.id) {
                    url.searchParams.set("id", result.id);
                    window.history.pushState({}, "", url);
                }
            }
        });

        Array.from(this.attributes)
            .filter(attr => attr.name.startsWith("default-"))
            .forEach(attr => this.setDefaultValue(attr.name));
    }

    private setDefaultValue(name: string) {
        const defVal = this.getAttribute(name);
        const fieldName = name.replace("default-", "");
        const ele = this.shadowRoot!.querySelector(`[name=${fieldName}]`) as Input;
        if (defVal && ele) ele.value = defVal;
    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}

customElements.define("w13c-template-information", TemplateConfiguration);
