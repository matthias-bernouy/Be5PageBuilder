import { Component } from "../../../Component";
import "src/core/EditorMode/Component/LateralDialog/LateralDialog"
import "src/core/EditorMode/Component/Form/Input/Input"
import "src/core/EditorMode/Component/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { LateralDialog } from "src/core/EditorMode/Component/LateralDialog/LateralDialog";

export class Configuration extends Component {

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
    }

    connectedCallback() {
        const form = this.shadowRoot?.querySelector("form");  
        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            document.EditorManager.save({
                title: data.title || "",
                description: data.description || "",
                visible: formData.has("visible"),
                identifier: data.identifier || "",
                path: data.path || "",
            })
            const url = new URL(window.location.href);
            url.searchParams.set('identifier', data.identifier || "");
            window.history.pushState({}, '', url);
        });

    }

    show() {
        const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog") as LateralDialog;
        dialog?.show();
    }
}
customElements.define("w13c-page-information", Configuration)