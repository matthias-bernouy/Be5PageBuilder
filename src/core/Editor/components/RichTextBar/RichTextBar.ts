import { Component } from "src/core/Component/core/Component";
import "src/core/Editor/configuration/Inputs/P9rPageLink";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class EditorToolbar extends Component {

    private savedRange: Range | null = null;
    private interacting = false;
    private pageLink: HTMLElement | null = null;

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    connectedCallback() {
        const root = this.shadowRoot!;
        root.addEventListener("mousedown", (e) => {
            const target = e.target as HTMLElement;
            this.interacting = true;
            if (target.tagName === "INPUT" || target.tagName.includes("-") || target.closest('p9r-page-link')) {
                return;
            }
            e.preventDefault();
        });

        root.addEventListener("mouseup", () => {
            setTimeout(() => { this.interacting = false; }, 50);
        });

        root.addEventListener("click", (e) => this.handleClick(e));
        document.addEventListener("selectionchange", () => this.handleSelection());
        document.addEventListener("selectionchange", () => this.handleSelection());

        this.pageLink = document.createElement("p9r-page-link");
        this.pageLink.setAttribute("label", "");
        this.pageLink.setAttribute("name", "href");
        root.querySelector(".link-pages-wrap")!.appendChild(this.pageLink);
    }

    private handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const btn = target.closest("button") as HTMLElement | null;
        if (!btn) return;

        const command = btn.dataset.command;
        if (command) {
            this.restoreSelection();
            this.handleCommand(command);
            this.saveSelection();
            this.updateState();
            return;
        }

        const action = btn.dataset.action;
        if (action === "size-up") return this.changeSize(2);
        if (action === "size-down") return this.changeSize(-2);
        if (action === "color") return this.toggleColorPanel();
        if (action === "link") return this.toggleLinkBar();
        if (action === "list-ul") return this.insertList("ul");
        if (action === "list-ol") return this.insertList("ol");

        const color = btn.dataset.color;
        if (color !== undefined) return this.applyColor(color);

        const linkType = btn.dataset.linkType;
        if (linkType) return this.switchLinkType(linkType);

        if (btn.classList.contains("link-apply")) return this.applyLink();
        if (btn.classList.contains("link-unlink")) return this.removeLink();
    }

    private handleCommand(cmd: string) {
        switch (cmd) {
            case "bold": return this.toggleFormat("b");
            case "italic": return this.toggleFormat("i");
            case "underline": return this.toggleFormat("u");
            case "strikeThrough": return this.toggleFormat("s");
            case "justifyLeft": return this.applyBlockAlignment("left");
            case "justifyCenter": return this.applyBlockAlignment("center");
            case "justifyRight": return this.applyBlockAlignment("right");
        }
    }

    private toggleFormat(tag: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const node = sel.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
        const existingTag = el?.closest(tag);

        if (existingTag) {
            const parent = existingTag.parentNode;
            const frag = document.createDocumentFragment();
            while (existingTag.firstChild) {
                frag.appendChild(existingTag.firstChild);
            }

            const firstNode = frag.firstChild;
            const lastNode = frag.lastChild;
            parent?.replaceChild(frag, existingTag);

            if (firstNode && lastNode) {
                const newRange = document.createRange();
                newRange.setStartBefore(firstNode);
                newRange.setEndAfter(lastNode);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        } else {
            const newEl = document.createElement(tag);
            this.wrapWithElement(newEl);
        }
    }

    private applyBlockAlignment(align: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const node = sel.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;

        const block = el?.closest("p, div, h1, h2, h3, h4, h5, h6, li") as HTMLElement;
        if (block) {
            block.style.textAlign = align;
        }
    }

    private applyInlineStyle(prop: string, value: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

        const node = sel.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;

        if (el && el.tagName === "SPAN" && el.textContent === sel.toString()) {
            (el.style as any)[prop] = value;
            return;
        }

        const span = document.createElement("span");
        (span.style as any)[prop] = value;
        this.wrapWithElement(span);
    }

    private removeInlineStyle(prop: string) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const node = sel.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
        const span = el?.closest("span");

        if (span) {
            (span.style as any)[prop] = "";
            if (span.style.length === 0) {
                const parent = span.parentNode;
                while (span.firstChild) parent?.insertBefore(span.firstChild, span);
                parent?.removeChild(span);
            }
        }
    }

    private wrapWithElement(wrapper: HTMLElement) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);

        if (range.collapsed) return;

        try {
            const contents = range.extractContents();
            wrapper.appendChild(contents);
            range.insertNode(wrapper);

            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(wrapper);
            sel.addRange(newRange);
        } catch (e) {
            console.warn("La sélection traverse des balises complexes", e);
        }
    }

    private queryCommandStateCompat(cmd: string): boolean {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        const node = sel.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
        if (!el) return false;

        const style = window.getComputedStyle(el);
        switch (cmd) {
            case 'bold': return style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700 || !!el.closest('b, strong');
            case 'italic': return style.fontStyle === 'italic' || !!el.closest('i, em');
            case 'underline': return style.textDecorationLine.includes('underline') || !!el.closest('u');
            case 'strikeThrough': return style.textDecorationLine.includes('line-through') || !!el.closest('s, strike');
            case 'justifyLeft': return style.textAlign === 'left' || style.textAlign === 'start';
            case 'justifyCenter': return style.textAlign === 'center';
            case 'justifyRight': return style.textAlign === 'right';
            default: return false;
        }
    }

    private handleSelection() {
        if (this.interacting) return;

        const activeEl = this.shadowRoot!.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName.includes("-"))) {
            return;
        }

        const selection = window.getSelection();

        if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
            this.hide();
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        this.saveSelection();
        this.show(rect);
        this.updateState();
    }


    private changeSize(delta: number) {
        this.restoreSelection();

        const current = this.getCurrentFontSize();
        const next = Math.max(8, Math.min(96, current + delta));

        this.applyInlineStyle("fontSize", `${next}px`);

        this.saveSelection();
        this.updateSizeDisplay(next);
    }

    private getCurrentFontSize(): number {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return 16;

        const node = selection.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
        if (!el) return 16;

        return Math.round(parseFloat(window.getComputedStyle(el).fontSize));
    }

    private updateSizeDisplay(size?: number) {
        const display = this.shadowRoot!.querySelector(".size-display");
        if (display) display.textContent = String(size ?? this.getCurrentFontSize());
    }

    private toggleColorPanel() {
        const panel = this.shadowRoot!.querySelector(".color-panel")!;
        panel.classList.toggle("open");
        this.closeLinkBar();
    }

    private applyColor(color: string) {
        this.restoreSelection();

        if (color === "inherit") {
            this.removeInlineStyle("color");
        } else {
            this.applyInlineStyle("color", color);
        }

        this.saveSelection();
        this.shadowRoot!.querySelector(".color-panel")!.classList.remove("open");
        this.updateColorState();
    }

    private updateColorState() {
        const trigger = this.shadowRoot!.querySelector(".color-swatch-current") as HTMLElement;
        if (!trigger) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const node = selection.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
        if (!el) return;

        trigger.style.background = window.getComputedStyle(el).color;
    }

    private insertList(tag: "ul" | "ol") {
        this.restoreSelection();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const node = selection.focusNode;
        const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
        if (!el) return;

        const editable = el.closest("[contenteditable]") as HTMLElement;

        const list = document.createElement(tag);
        const li = document.createElement("li");

        list.appendChild(li);
        editable.replaceWith(list);

        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        selection.addRange(newRange);

        this.hide();
    }

    private toggleLinkBar() {
        const bar = this.shadowRoot!.querySelector(".link-bar")!;
        const isOpen = bar.classList.contains("open");

        this.shadowRoot!.querySelector(".color-panel")?.classList.remove("open");

        if (isOpen) {
            this.closeLinkBar();
            return;
        }

        const existing = this.getExistingLink();
        const input = this.shadowRoot!.querySelector(".link-input") as HTMLInputElement;
        input.value = existing || "";

        if (this.pageLink && existing) {
            (this.pageLink as any).value = existing;
        }

        bar.classList.add("open");
    }

    private closeLinkBar() {
        this.shadowRoot!.querySelector(".link-bar")?.classList.remove("open");
    }

    private switchLinkType(type: string) {
        const root = this.shadowRoot!;
        root.querySelectorAll(".link-type-btn").forEach(btn =>
            btn.classList.toggle("active", (btn as HTMLElement).dataset.linkType === type));

        root.querySelectorAll<HTMLElement>(".link-field").forEach(f => {
            f.style.display = f.dataset.linkField === type ? "" : "none";
        });
    }

    private applyLink() {
        this.restoreSelection();

        const activeType = this.shadowRoot!.querySelector(".link-type-btn.active") as HTMLElement;
        const type = activeType?.dataset.linkType || "external";

        let url = "";
        if (type === "external") {
            url = (this.shadowRoot!.querySelector(".link-input") as HTMLInputElement).value.trim();
        } else if (type === "internal" && this.pageLink) {
            url = (this.pageLink as any).value || "";
        }

        if (url) {
            const a = document.createElement("a");
            a.href = url;
            this.wrapWithElement(a);
        }

        this.saveSelection();
        this.closeLinkBar();
        this.updateState();
    }

    private removeLink() {
        this.restoreSelection();

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const node = sel.focusNode;
            const el = node?.nodeType === 1 ? node as HTMLElement : node?.parentElement;
            const a = el?.closest("a");

            if (a) {
                const parent = a.parentNode;
                while (a.firstChild) parent?.insertBefore(a.firstChild, a);
                parent?.removeChild(a);
            }
        }

        this.saveSelection();
        this.closeLinkBar();
        this.updateState();
    }

    private getExistingLink(): string | null {
        const sel = this.savedRange || window.getSelection()?.getRangeAt(0);
        if (!sel) return null;

        const node = sel.startContainer;
        const el = node.nodeType === 1 ? node as HTMLElement : node.parentElement;
        return el?.closest("a")?.getAttribute("href") || null;
    }

    private saveSelection() {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            this.savedRange = sel.getRangeAt(0).cloneRange();
        }
    }

    private restoreSelection() {
        if (!this.savedRange) return;
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(this.savedRange);
        }
    }

    private updateState() {
        const commands = ["bold", "italic", "underline", "strikeThrough",
            "justifyLeft", "justifyCenter", "justifyRight"];

        for (const cmd of commands) {
            const btn = this.shadowRoot!.querySelector(`button[data-command="${cmd}"]`);
            if (btn) btn.classList.toggle("active", this.queryCommandStateCompat(cmd));
        }

        const linkBtn = this.shadowRoot!.querySelector('[data-action="link"]');
        if (linkBtn) linkBtn.classList.toggle("active", !!this.getExistingLink());

        this.updateSizeDisplay();
        this.updateColorState();
    }

    private show(rect: DOMRect) {
        this.classList.add("visible");
        this.shadowRoot!.querySelector(".color-panel")?.classList.remove("open");
        this.closeLinkBar();

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const gap = 10;
        const barWidth = this.offsetWidth;
        const barHeight = this.offsetHeight;

        let top: number;
        if (rect.top < barHeight + gap) {
            top = rect.bottom + scrollY + gap;
        } else {
            top = rect.top + scrollY - barHeight - gap;
        }

        let left = rect.left + scrollX + (rect.width - barWidth) / 2;
        const minLeft = scrollX + gap;
        const maxLeft = scrollX + window.innerWidth - barWidth - gap;
        left = Math.max(minLeft, Math.min(maxLeft, left));

        this.style.top = `${top}px`;
        this.style.left = `${left}px`;
    }

    private hide() {
        this.classList.remove("visible");
        this.shadowRoot!.querySelector(".color-panel")?.classList.remove("open");
        this.closeLinkBar();
    }
}

customElements.define("w13c-editor-toolbar", EditorToolbar);