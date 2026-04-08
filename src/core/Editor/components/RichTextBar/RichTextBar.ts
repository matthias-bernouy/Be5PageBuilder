import { Component } from "src/core/Component/core/Component";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class EditorToolbar extends Component {
    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    connectedCallback() {
        this.shadowRoot?.addEventListener("click", (e) => this.handleAction(e));
        this.addEventListener("mousedown", (e) => e.preventDefault());

        document.addEventListener("selectionchange", () => this.handleSelection());
    }

    private handleAction(e: MouseEvent) {
        const btn = (e.target as HTMLElement).closest("button");
        if (!btn) return;

        const command = btn.dataset.command;
        if (!command) return;

        if (command === "createLink") {
            const url = prompt("Entrez l'URL du lien :");
            if (url) document.execCommand(command, false, url);
        } else {
            document.execCommand(command, false);
        }

        this.updateButtonsState();
    }

    private updateButtonsState() {
        const buttons = this.shadowRoot?.querySelectorAll("button[data-command]");
        buttons?.forEach(btn => {
            const command = (btn as HTMLElement).dataset.command;
            if (command && command !== "createLink") {
                const isActive = document.queryCommandState(command);
                btn.classList.toggle("active", isActive);
            }
        });
    }

    private handleSelection() {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
            this.hide();
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        this.show(rect);
        this.updateButtonsState();
    }

    private show(rect: DOMRect) {
        this.classList.add("visible");

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const gap = 10;
        const barWidth = this.offsetWidth;
        const barHeight = this.offsetHeight;

        // Vertical: prefer above, flip below if not enough space
        let top: number;
        if (rect.top < barHeight + gap) {
            top = rect.bottom + scrollY + gap;
        } else {
            top = rect.top + scrollY - barHeight - gap;
        }

        // Horizontal: center on selection, clamp to viewport
        let left = rect.left + scrollX + (rect.width - barWidth) / 2;
        const minLeft = scrollX + gap;
        const maxLeft = scrollX + window.innerWidth - barWidth - gap;
        left = Math.max(minLeft, Math.min(maxLeft, left));

        this.style.top = `${top}px`;
        this.style.left = `${left}px`;
    }

    private hide() {
        this.classList.remove("visible");
    }
}

customElements.define("w13c-editor-toolbar", EditorToolbar);