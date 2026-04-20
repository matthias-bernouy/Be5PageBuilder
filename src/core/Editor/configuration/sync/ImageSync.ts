import type { Component } from "src/core/Editor/runtime/Component";
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

    // An image managed by p9r-image-sync is fully owned by the panel: the
    // action bar would be meaningless since the only supported operation is
    // "click → MediaCenter" (or the panel's own Remove). We lock every action
    // unconditionally, regardless of `optionnal` / `multi-select` / etc.
    private static readonly _LOCKED_ACTIONS = [
        "DISABLE_DELETE",
        "DISABLE_DUPLICATE",
        "DISABLE_ADD_BEFORE",
        "DISABLE_ADD_AFTER",
        "DISABLE_CHANGE_COMPONENT",
        "DISABLE_DRAGGING",
        "DISABLE_SAVE_AS_TEMPLATE",
    ] as const;

    private _component: Component | null = null;
    private _target: HTMLImageElement | null = null;
    private _previewImg: HTMLImageElement | null = null;
    private _emptyState: HTMLElement | null = null;
    private _overlay: HTMLElement | null = null;
    private _targetObserver: MutationObserver | null = null;
    private _prepared = false;

    connectedCallback() {
        const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (componentIdentifier && !this._component) {
            this._component = document.querySelector(
                `[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`
            );
        }

        ImageSync._injectStyles();

        requestAnimationFrame(() => {
            if (!this._prepared) this._syncDefault();
            this._render();
        });
    }

    /**
     * Eager pass invoked while this element is still in a detached fragment.
     * Seeds the default image (IS_CREATING contract) and locks the target
     * <img>'s actions. Skips _render — that happens on connectedCallback
     * when the user actually opens the panel.
     */
    public prepare(component: Component) {
        this._component = component;
        this._syncDefault();
        this._target = this._resolveTarget();
        this._lockActions(this._target);
        this._watchTarget(this._target);
        if (this._target && this.allowResize) {
            this._target.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
        }
        this._prepared = true;
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
        this._lockActions(img);
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
        this._lockActions(target);
        if (this.allowResize) target.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
        this._component!.appendChild(target);
        return target;
    }

    private _render() {
        this._target = this._resolveTarget();
        this._lockActions(this._target);
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
    private _lockActions(target: HTMLImageElement | null) {
        if (!target) return;
        // Idempotency: only touch the DOM (and re-run viewEditor) when at
        // least one DISABLE_* attr isn't already in place. Without this, any
        // sibling MutationObserver fan-out (ConfigPanel.init → every sync's
        // init) unconditionally re-calls viewEditor() on the img, which in
        // turn re-triggers style recalc / action-bar rebuild for every
        // keystroke on an adjacent text node. See perf scenario
        // image-sync-init-cost.
        let changed = false;
        for (const key of ImageSync._LOCKED_ACTIONS) {
            const attr = p9r.attr.ACTION[key];
            if (target.getAttribute(attr) !== "true") {
                target.setAttribute(attr, "true");
                changed = true;
            }
        }
        if (!changed) return;
        const id = target.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
        if (id) {
            const editor = document.compIdentifierToEditor?.get(id);
            editor?.viewEditor();
        }
    }

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
            this._lockActions(this._target);
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

    init(opts?: { added?: HTMLElement; removed?: HTMLElement }) {
        const target = this._resolveTarget();
        // ConfigPanel.init fans mutations out to every sync. We only care
        // when the mutation concerns *our* <img> — otherwise a keystroke
        // that inserts/removes a sibling <p> would re-run _lockActions +
        // _watchTarget + viewEditor() on the image on every keystroke.
        if (opts?.added && opts.added !== target) return;
        if (opts?.removed && opts.removed !== this._target && opts.removed !== target) return;
        this._target = target;
        this._lockActions(this._target);
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
