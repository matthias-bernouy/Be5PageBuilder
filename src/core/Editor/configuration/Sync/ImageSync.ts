import type { Component } from "src/core/Component/core/Component";

const css = `
p9r-image-sync {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

p9r-image-sync .image-sync-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #94a3b8);
}

p9r-image-sync .image-sync-card {
    position: relative;
    border: 1px dashed var(--border-default, #e2e8f0);
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.15s;
    background: var(--bg-base, #f8fafc);
}

p9r-image-sync .image-sync-card:hover {
    border-color: var(--primary-base, #4361ee);
}

p9r-image-sync .image-sync-card.has-image {
    border-style: solid;
}

/* ── Preview image ── */

p9r-image-sync .image-sync-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
}

/* ── Empty state ── */

p9r-image-sync .image-sync-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 20px;
    aspect-ratio: 16 / 9;
}

p9r-image-sync .image-sync-empty svg {
    color: var(--text-muted, #94a3b8);
    opacity: 0.5;
}

p9r-image-sync .image-sync-empty span {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted, #94a3b8);
}

/* ── Overlay actions ── */

p9r-image-sync .image-sync-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgb(0 0 0 / 0);
    transition: background 0.15s;
    opacity: 0;
}

p9r-image-sync .image-sync-card:hover .image-sync-overlay {
    opacity: 1;
    background: rgb(0 0 0 / 0.4);
}

p9r-image-sync .image-sync-overlay button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.1s;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

p9r-image-sync .image-sync-overlay button:active {
    transform: scale(0.95);
}

p9r-image-sync .image-sync-overlay .btn-change {
    background: rgb(255 255 255 / 0.9);
    color: var(--text-main, #1e293b);
}

p9r-image-sync .image-sync-overlay .btn-remove {
    background: rgb(255 255 255 / 0.15);
    color: #fff;
}

p9r-image-sync .image-sync-overlay .btn-remove:hover {
    background: var(--danger-base, #ef4444);
}
`;

const ICON_UPLOAD = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;

/**
 * <p9r-image-sync slotTarget="image" label="Image de couverture" default="https://placehold.co/800x450"></p9r-image-sync>
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

        const img = document.createElement("img");
        const slot = this._slotName;
        if (slot) img.setAttribute("slot", slot);
        img.setAttribute("src", defaultSrc);
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
        this._component!.appendChild(target);
        return target;
    }

    private _render() {
        this._target = this._resolveTarget();
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
        this._emptyState.innerHTML = `${ICON_UPLOAD}<span>Cliquez pour choisir une image</span>`;

        // Overlay with actions
        this._overlay = document.createElement("div");
        this._overlay.className = "image-sync-overlay";

        const btnChange = document.createElement("button");
        btnChange.className = "btn-change";
        btnChange.textContent = "Modifier";
        btnChange.addEventListener("click", (e) => { e.stopPropagation(); this._openMediaCenter(); });

        const btnRemove = document.createElement("button");
        btnRemove.className = "btn-remove";
        btnRemove.textContent = "Supprimer";
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
        this._updatePreview("");
    }

    get isMultiSelect() {
        return this.hasAttribute("multi-select");
    }

    init() {
        this._target = this._resolveTarget();
        const currentValue = this._target?.getAttribute("src") || "";
        this._updatePreview(currentValue);
    }
}

if (!customElements.get("p9r-image-sync")) {
    customElements.define("p9r-image-sync", ImageSync);
}
