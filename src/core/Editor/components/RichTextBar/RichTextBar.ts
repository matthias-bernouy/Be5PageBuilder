import { Component } from "src/core/Editor/core/Component";
import "src/core/Editor/configuration/Inputs/P9rLink";

import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

import {
    applyBlockAlignment,
    applyInlineStyle,
    applyLinkUrl,
    getCurrentColor,
    getCurrentFontSize,
    getExistingLink,
    insertList,
    queryCommandState,
    removeInlineStyle,
    removeLinkAtSelection,
    toggleFormat,
} from "./commands";
import { SelectionTracker } from "./selection";

const FORMAT_COMMANDS = ["bold", "italic", "underline", "strikeThrough"] as const;
const ALIGN_COMMANDS = ["justifyLeft", "justifyCenter", "justifyRight"] as const;
const ACTIVE_COMMANDS = [...FORMAT_COMMANDS, ...ALIGN_COMMANDS];

export class EditorToolbar extends Component {

    private selection = new SelectionTracker();
    private interacting = false;
    private pageLink: HTMLElement | null = null;

    // Stable handler refs so connect/disconnect can pair up. Previously
    // these were arrow literals in connectedCallback — every re-append
    // (EditorManager.switchMode does exactly that) leaked 2 document
    // listeners (selectionchange + mousedown).
    private _onRootMousedown = (e: Event) => {
        const target = e.target as HTMLElement;
        this.interacting = true;
        if (target.tagName === "INPUT" || target.tagName.includes("-") || target.closest('p9r-link')) {
            return;
        }
        e.preventDefault();
    };
    private _onRootMouseup = () => { setTimeout(() => { this.interacting = false; }, 50); };
    private _onRootClick = (e: Event) => this.handleClick(e as MouseEvent);
    private _onSelectionChange = () => this.handleSelection();
    private _onOutsideMousedown = (e: MouseEvent) => this.handleOutsideMouseDown(e);
    private _rootListenersAttached = false;

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    override connectedCallback() {
        const root = this.shadowRoot!;
        if (!this._rootListenersAttached) {
            // Shadow-root listeners survive re-parenting (the shadow root is
            // owned by this element), so attach once only — no matching
            // disconnectedCallback cleanup needed.
            root.addEventListener("mousedown", this._onRootMousedown);
            root.addEventListener("mouseup", this._onRootMouseup);
            root.addEventListener("click", this._onRootClick);
            this._rootListenersAttached = true;
        }
        document.addEventListener("selectionchange", this._onSelectionChange);
        // Selection-change alone doesn't close the bar when the user clicks an
        // element that doesn't collapse the caret (a non-editable sibling in
        // the parent, a BAG button with preventDefault, etc.). Catch those via
        // a document-level mousedown outside the bar and outside the current
        // editable.
        document.addEventListener("mousedown", this._onOutsideMousedown);

        if (!this.pageLink) {
            this.pageLink = document.createElement("p9r-link");
            this.pageLink.setAttribute("label", "");
            this.pageLink.setAttribute("name", "href");
            root.querySelector(".link-pages-wrap")!.appendChild(this.pageLink);
        }
    }

    override disconnectedCallback() {
        document.removeEventListener("selectionchange", this._onSelectionChange);
        document.removeEventListener("mousedown", this._onOutsideMousedown);
    }

    // ── Event routing ───────────────────────────────────────────────────

    private handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const btn = target.closest("button") as HTMLElement | null;
        if (!btn) return;

        const command = btn.dataset.command;
        if (command) {
            this.selection.restore();
            this.runCommand(command);
            this.selection.save();
            this.updateState();
            return;
        }

        const action = btn.dataset.action;
        if (action === "size-up") return this.changeSize(2);
        if (action === "size-down") return this.changeSize(-2);
        if (action === "color") return this.toggleColorPanel();
        if (action === "link") return this.toggleLinkBar();
        if (action === "list-ul") return this.insertListAction("ul");
        if (action === "list-ol") return this.insertListAction("ol");

        const color = btn.dataset.color;
        if (color !== undefined) return this.applyColor(color);

        const linkType = btn.dataset.linkType;
        if (linkType) return this.switchLinkType(linkType);

        if (btn.classList.contains("link-apply")) return this.applyLink();
        if (btn.classList.contains("link-unlink")) return this.removeLink();
    }

    private runCommand(cmd: string) {
        switch (cmd) {
            case "bold": return toggleFormat("b");
            case "italic": return toggleFormat("i");
            case "underline": return toggleFormat("u");
            case "strikeThrough": return toggleFormat("s");
            case "justifyLeft": return applyBlockAlignment("left");
            case "justifyCenter": return applyBlockAlignment("center");
            case "justifyRight": return applyBlockAlignment("right");
        }
    }

    private handleSelection() {
        if (this.interacting) return;

        const activeEl = this.shadowRoot!.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName.includes("-"))) {
            return;
        }

        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.toString().trim() === "") {
            this.hide();
            return;
        }

        const rect = sel.getRangeAt(0).getBoundingClientRect();
        this.selection.save();
        this.show(rect);
        this.updateState();
    }

    // ── Size / color / list / link actions ──────────────────────────────

    private changeSize(delta: number) {
        this.selection.restore();
        const next = Math.max(8, Math.min(96, getCurrentFontSize() + delta));
        applyInlineStyle("fontSize", `${next}px`);
        this.selection.save();
        this.updateSizeDisplay(next);
    }

    private applyColor(color: string) {
        this.selection.restore();
        if (color === "inherit") {
            removeInlineStyle("color");
        } else {
            applyInlineStyle("color", color);
        }
        this.selection.save();
        this.shadowRoot!.querySelector(".color-panel")!.classList.remove("open");
        this.updateColorState();
    }

    private insertListAction(tag: "ul" | "ol") {
        this.selection.restore();
        insertList(tag);
        this.hide();
    }

    private applyLink() {
        this.selection.restore();

        const activeType = this.shadowRoot!.querySelector(".link-type-btn.active") as HTMLElement;
        const type = activeType?.dataset.linkType || "external";

        let url = "";
        if (type === "external") {
            url = (this.shadowRoot!.querySelector(".link-input") as HTMLInputElement).value.trim();
        } else if (type === "internal" && this.pageLink) {
            url = (this.pageLink as any).value || "";
        }

        applyLinkUrl(url);

        this.selection.save();
        this.closeLinkBar();
        this.updateState();
    }

    private removeLink() {
        this.selection.restore();
        removeLinkAtSelection();
        this.selection.save();
        this.closeLinkBar();
        this.updateState();
    }

    // ── Panels ──────────────────────────────────────────────────────────

    private toggleColorPanel() {
        this.shadowRoot!.querySelector(".color-panel")!.classList.toggle("open");
        this.closeLinkBar();
    }

    private toggleLinkBar() {
        const bar = this.shadowRoot!.querySelector(".link-bar")!;
        const isOpen = bar.classList.contains("open");

        this.shadowRoot!.querySelector(".color-panel")?.classList.remove("open");

        if (isOpen) {
            this.closeLinkBar();
            return;
        }

        const existing = getExistingLink(this.selection.range);
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

    // ── UI state refresh ────────────────────────────────────────────────

    private updateState() {
        for (const cmd of ACTIVE_COMMANDS) {
            const btn = this.shadowRoot!.querySelector(`button[data-command="${cmd}"]`);
            if (btn) btn.classList.toggle("active", queryCommandState(cmd));
        }

        const linkBtn = this.shadowRoot!.querySelector('[data-action="link"]');
        if (linkBtn) linkBtn.classList.toggle("active", !!getExistingLink(this.selection.range));

        this.updateSizeDisplay();
        this.updateColorState();
    }

    private updateSizeDisplay(size?: number) {
        const display = this.shadowRoot!.querySelector(".size-display");
        if (display) display.textContent = String(size ?? getCurrentFontSize());
    }

    private updateColorState() {
        const trigger = this.shadowRoot!.querySelector(".color-swatch-current") as HTMLElement | null;
        if (!trigger) return;
        const color = getCurrentColor();
        if (color) trigger.style.background = color;
    }

    // ── Positioning ─────────────────────────────────────────────────────

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

    private handleOutsideMouseDown(e: MouseEvent) {
        if (!this.classList.contains("visible")) return;
        const t = e.target as Node;
        if (this === t || this.contains(t) || this.shadowRoot!.contains(t)) return;
        const range = this.selection.range;
        if (range) {
            const anchor = range.commonAncestorContainer;
            const el = anchor.nodeType === 1 ? anchor as Element : anchor.parentElement;
            const editable = el?.closest?.('[contenteditable="true"]') as HTMLElement | null;
            if (editable && editable.contains(t)) return;
        }
        this.hide();
    }

    hide() {
        this.classList.remove("visible");
        this.shadowRoot!.querySelector(".color-panel")?.classList.remove("open");
        this.closeLinkBar();
    }
}

customElements.define("w13c-editor-toolbar", EditorToolbar);
