import type { Component } from "src/core/Editor/core/Component";
import { ICON_UPLOAD } from "src/core/Editor/icons";
import css from "./ImageSync.style.css" with { type: "text" };

/**
 * <p9r-image-sync slotTarget="image" label="Cover image" default="https://placehold.co/800x450"></p9r-image-sync>
 *
 * @attr slotTarget - the slot name where the <img> lives in the component
 * @attr accept     - media types for MediaCenter (default: "image")
 * @attr label      - label shown above the preview
 * @attr default    - default image src if none exists
 */
export class ImageSync extends HTMLElement {

    private _component: Component | null = null;
    private _target: HTMLImageElement | null = null;
    private _previewImg: HTMLImageElement | null = null;
    private _emptyState: HTMLElement | null = null;
    private _overlay: HTMLElement | null = null;
    private _targetObserver: MutationObserver | null = null;

    connectedCallback() {
        const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (componentIdentifier) {
            this._component = document.querySelector(
                `[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`
            );
        }

        ImageSync._injectStyles();

        requestAnimationFrame(() => {
            this._syncDefault();
            this._render();
        });
    }

    private static _stylesInjected = false;
    private static _injectStyles() {
        if (ImageSync._stylesInjected) return;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
        ImageSync._stylesInjected = true;
    }

    private get _slotName(): string {
        return this.getAttribute("slotTarget") || "";
    }

    private _syncDefault() {
        const defaultSrc = this.getAttribute("default");
        if (!defaultSrc) return;
        if (this._resolveTarget()) return;
        // Optional image: only seed the default on first creation of the
        // parent bloc (IS_CREATING="true"). Afterwards — including when the
        // user has clicked Remove — leave it empty.
        if (this.optionnal && !this.isCreating) return;

        const img = document.createElement("img");
        const slot = this._slotName;
        if (slot) img.setAttribute("slot", slot);
        img.setAttribute("src", defaultSrc);
        if ( !this.isMultiSelect ) {
            img.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
            img.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
        }
        if (this.allowResize) img.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
        this._component?.appendChild(img);
    }

    private _resolveTarget(): HTMLImageElement | null {
        if (!this._component) return null;
        const slot = this._slotName;
        if (!slot) return this._component.querySelector("img");
        return this._component.querySelector(`img[slot="${slot}"]`);
    }

    private _ensureTarget(): HTMLImageElement {
        let target = this._resolveTarget();
        if (target) return target;

        target = document.createElement("img");
        const slot = this._slotName;
        if (slot) target.setAttribute("slot", slot);
        if (this.allowResize) target.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
        this._component!.appendChild(target);
        return target;
    }

    private _render() {
        this._target = this._resolveTarget();
        this._watchTarget(this._target);
        const label = this.getAttribute("label") || "Image";
        const currentValue = this._target?.getAttribute("src") || "";

        this.innerHTML = "";

        // Label
        const labelEl = document.createElement("span");
        labelEl.className = "image-sync-label";
        labelEl.textContent = label;

        // Card container
        const card = document.createElement("div");
        card.className = "image-sync-card";

        // Preview image
        this._previewImg = document.createElement("img");

        // Empty state
        this._emptyState = document.createElement("div");
        this._emptyState.className = "image-sync-empty";
        this._emptyState.innerHTML = `${ICON_UPLOAD}<span>Click to choose an image</span>`;

        // Overlay with actions
        this._overlay = document.createElement("div");
        this._overlay.className = "image-sync-overlay";

        const btnChange = document.createElement("button");
        btnChange.className = "btn-change";
        btnChange.textContent = "Change";
        btnChange.addEventListener("click", (e) => { e.stopPropagation(); this._openMediaCenter(); });

        const btnRemove = document.createElement("button");
        btnRemove.className = "btn-remove";
        btnRemove.textContent = "Remove";
        btnRemove.addEventListener("click", (e) => { e.stopPropagation(); this._clear(); });

        this._overlay.appendChild(btnChange);
        this._overlay.appendChild(btnRemove);

        card.appendChild(this._previewImg);
        card.appendChild(this._emptyState);
        card.appendChild(this._overlay);

        card.addEventListener("click", () => this._openMediaCenter());

        this.appendChild(labelEl);
        this.appendChild(card);

        this._updatePreview(currentValue);
    }

    // The target <img> can have its `src` mutated from outside this panel
    // (e.g. ImageEditor's own click-to-MediaCenter flow). Watch for that so
    // the preview mirrors the live value.
    private _watchTarget(target: HTMLImageElement | null) {
        this._targetObserver?.disconnect();
        this._targetObserver = null;
        if (!target) return;
        this._targetObserver = new MutationObserver(() => {
            this._updatePreview(target.getAttribute("src") || "");
        });
        this._targetObserver.observe(target, { attributes: true, attributeFilter: ["src"] });
    }

    private _updatePreview(src: string) {
        if (!this._previewImg || !this._emptyState || !this._overlay) return;
        const card = this._previewImg.parentElement!;

        if (src) {
            this._previewImg.src = src;
            this._previewImg.style.display = "block";
            this._emptyState.style.display = "none";
            this._overlay.style.display = "flex";
            card.classList.add("has-image");
        } else {
            this._previewImg.style.display = "none";
            this._emptyState.style.display = "flex";
            this._overlay.style.display = "none";
            card.classList.remove("has-image");
        }
    }

    private _openMediaCenter() {
        const mediaCenter = document.EditorManager.getMediaCenter();
        const acceptRaw = this.getAttribute("accept") || "image";
        const types = ["folder", ...acceptRaw.split(",").map(t => t.trim())];

        const handler = (e: CustomEvent) => {
            mediaCenter.removeEventListener("select-item", handler as EventListener);
            this._target = this._ensureTarget();
            this._watchTarget(this._target);
            this._target.setAttribute("src", e.detail.src);
            this._updatePreview(e.detail.src);
        };

        mediaCenter.addEventListener("select-item", handler as EventListener);
        mediaCenter.show(types);
    }

    private _clear() {
        if (this._target) {
            this._target.remove();
            this._target = null;
        }
        this._watchTarget(null);
        this._updatePreview("");
    }

    get isMultiSelect() {
        return this.hasAttribute("multi-select");
    }

    get allowResize() {
        return this.hasAttribute("allow-resize");
    }

    get optionnal() {
        return this.hasAttribute("optionnal");
    }

    get isCreating(): boolean {
        return this._component?.getAttribute(p9r.attr.EDITOR.IS_CREATING) === "true";
    }

    init() {
        this._target = this._resolveTarget();
        this._watchTarget(this._target);
        if (this._target && this.allowResize) {
            this._target.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
        }
        const currentValue = this._target?.getAttribute("src") || "";
        this._updatePreview(currentValue);
    }

    disconnectedCallback() {
        this._targetObserver?.disconnect();
        this._targetObserver = null;
    }
}

if (!customElements.get("p9r-image-sync")) {
    customElements.define("p9r-image-sync", ImageSync);
}
