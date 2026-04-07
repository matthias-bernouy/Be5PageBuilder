import type { Component } from "src/core/Component/core/Component";

const css = `
p9r-image-sync {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

p9r-image-sync .image-sync-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-body, #555);
}

p9r-image-sync .image-sync-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: 1px dashed var(--border-default, #e2e8f0);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s;
    min-height: 48px;
}

p9r-image-sync .image-sync-preview:hover {
    border-color: var(--primary-base, #4361ee);
    background: color-mix(in srgb, var(--primary-base, #4361ee) 4%, transparent);
}

p9r-image-sync .image-sync-preview img {
    max-width: 40px;
    max-height: 40px;
    object-fit: contain;
    border-radius: 4px;
}

p9r-image-sync .image-sync-preview .placeholder {
    font-size: 12px;
    color: var(--text-muted, #999);
}

p9r-image-sync .image-sync-actions {
    display: flex;
    gap: 4px;
}

p9r-image-sync .image-sync-actions button {
    font-size: 11px;
    padding: 2px 8px;
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 4px;
    background: var(--bg-surface, #fff);
    color: var(--text-body, #555);
    cursor: pointer;
}

p9r-image-sync .image-sync-actions button:hover {
    background: var(--bg-base, #f8f9fa);
}

p9r-image-sync .image-sync-actions button.danger {
    color: var(--danger-base, #ef4444);
    border-color: var(--danger-base, #ef4444);
}
`;

/**
 * <p9r-image-sync slot="icon-left" label="Icône gauche"></p9r-image-sync>
 *
 * @attr slotTarget   - the slot name where the <img> lives in the component
 * @attr accept - media types for MediaCenter (default: "image")
 * @attr label  - label shown above the preview
 */
export class ImageSync extends HTMLElement {

    private _component: Component | null = null;
    private _target: HTMLImageElement | null = null;
    private _previewImg: HTMLImageElement | null = null;
    private _placeholder: HTMLElement | null = null;
    private _removeBtn: HTMLButtonElement | null = null;

    connectedCallback() {
        const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (componentIdentifier) {
            this._component = document.querySelector(
                `[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`
            );
        }

        ImageSync._injectStyles();

        requestAnimationFrame(() => this._render());
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

        const labelEl = document.createElement("span");
        labelEl.className = "image-sync-label";
        labelEl.textContent = label;

        const preview = document.createElement("div");
        preview.className = "image-sync-preview";
        preview.addEventListener("click", () => this._openMediaCenter());

        this._previewImg = document.createElement("img");
        this._placeholder = document.createElement("span");
        this._placeholder.className = "placeholder";
        this._placeholder.textContent = "Cliquez pour choisir";

        preview.appendChild(this._previewImg);
        preview.appendChild(this._placeholder);

        const actions = document.createElement("div");
        actions.className = "image-sync-actions";

        this._removeBtn = document.createElement("button");
        this._removeBtn.className = "danger";
        this._removeBtn.textContent = "Supprimer";
        this._removeBtn.addEventListener("click", () => this._clear());
        actions.appendChild(this._removeBtn);

        this.appendChild(labelEl);
        this.appendChild(preview);
        this.appendChild(actions);

        this._updatePreview(currentValue);
    }

    private _updatePreview(src: string) {
        if (!this._previewImg || !this._placeholder || !this._removeBtn) return;
        if (src) {
            this._previewImg.src = src;
            this._previewImg.style.display = "block";
            this._placeholder.style.display = "none";
            this._removeBtn.style.display = "inline-block";
        } else {
            this._previewImg.style.display = "none";
            this._placeholder.style.display = "block";
            this._removeBtn.style.display = "none";
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

    init() {
        this._target = this._resolveTarget();
        const currentValue = this._target?.getAttribute("src") || "";
        this._updatePreview(currentValue);
    }
}

if (!customElements.get("p9r-image-sync")) {
    customElements.define("p9r-image-sync", ImageSync);
}
