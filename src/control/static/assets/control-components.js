(() => {
  // src/control/core/editorSystem/Component.ts
  class Component extends HTMLElement {
    _rawStyles = "";
    _styles = null;
    _template = null;
    constructor(metadata) {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      if (metadata) {
        this._rawStyles = metadata.css;
        this._styles = document.createElement("style");
        this._styles.innerHTML = metadata.css;
        shadow.appendChild(this._styles);
        this._template = document.createElement("template");
        this._template.innerHTML = metadata ? metadata.template : "";
        shadow.appendChild(this._template.content.cloneNode(true));
      }
    }
    registerCSSVariables(items) {
      if (!this._styles)
        return;
      let src = this._rawStyles;
      Object.entries(items).forEach(([key, value]) => {
        src = src.replaceAll("var(--" + key + ")", value);
      });
      this._styles.innerHTML = src;
    }
    connectedCallback() {}
  }
  // ../WebComponents/dist/ui.js
  (() => {
    var { defineProperty: H, getOwnPropertyNames: bt, getOwnPropertyDescriptor: gt } = Object, ft = Object.prototype.hasOwnProperty;
    var B = new WeakMap, mt = (t) => {
      var e = B.get(t), i;
      if (e)
        return e;
      if (e = H({}, "__esModule", { value: true }), t && typeof t === "object" || typeof t === "function")
        bt(t).map((r) => !ft.call(e, r) && H(e, r, { get: () => t[r], enumerable: !(i = gt(t, r)) || i.enumerable }));
      return B.set(t, e), e;
    };
    var vt = (t, e) => {
      for (var i in e)
        H(t, i, { get: e[i], enumerable: true, configurable: true, set: (r) => e[i] = () => r });
    };
    var ee = {};
    vt(ee, { ToastStack: () => q, Toast: () => M, TagSuggest: () => x, Tag: () => _, TableRow: () => A, TableHeaderCell: () => L, TableCell: () => C, Table: () => z, SegmentedSwitch: () => v, P9rSizesSelect: () => m, P9rSelect: () => c, P9rRange: () => d, P9rInput: () => l, LeftMenuLayout: () => k, LateralMenuItem: () => w, LateralMenu: () => E, LateralDialog: () => h, InputFile: () => f, HorizontalActionGroup: () => y, FormSection: () => g, FormDialog: () => u, Component: () => n, Checkbox: () => b, Button: () => p });

    class n extends HTMLElement {
      constructor(t) {
        super();
        let e = this.attachShadow({ mode: "open" });
        if (t) {
          let i = document.createElement("style");
          i.innerHTML = t.css, e.appendChild(i);
          let r = document.createElement("template");
          r.innerHTML = t.template, e.appendChild(r.content.cloneNode(true));
        }
      }
      connectedCallback() {}
    }
    var F = `<dialog part="dialog" aria-modal="true">
    <div class="modal-wrapper" part="wrapper">
        <form method="dialog" id="close-form"></form>

        <form id="form-validation" method="get" part="form">
            <header part="header">
                <div class="title-area" part="title">
                    <slot name="title">New window</slot>
                </div>
                <button class="close-icon" part="close" form="close-form" type="submit" aria-label="Close">&times;</button>
            </header>

            <section class="body" part="body">
                <slot></slot>
            </section>

            <footer class="actions" part="footer">
                <slot name="footer">
                    <p9r-button form="close-form" type="submit" variant="ghost">Cancel</p9r-button>
                    <p9r-button form="form-validation" type="submit" variant="filled" color="primary">Confirm</p9r-button>
                </slot>
            </footer>
        </form>
    </div>
</dialog>
`;
    var j = `:host {
    --_modal-width: 500px;
    --_modal-radius: 12px;
    --_modal-bg: var(--bg-surface);
    --_modal-border: var(--border-default);
}

dialog {
    border: 1px solid var(--_modal-border);
    border-radius: var(--_modal-radius);
    background: var(--_modal-bg);
    padding: 0;
    width: min(90vw, var(--_modal-width));
    max-height: 80vh;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    opacity: 0;
}

dialog[open] {
    opacity: 1;
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    opacity: 0;
}

dialog[open]::backdrop {
    opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
    dialog {
        transform: scale(0.95);
        transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                    display 0.2s allow-discrete,
                    overlay 0.2s allow-discrete;
    }

    dialog[open] {
        transform: scale(1);
    }

    dialog::backdrop {
        transition: opacity 0.2s allow-discrete;
    }

    @starting-style {
        dialog[open] {
            opacity: 0;
            transform: scale(0.95);
        }

        dialog[open]::backdrop {
            opacity: 0;
        }
    }
}

.modal-wrapper {
    display: flex;
    flex-direction: column;
}

header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid var(--border-default);
}

.title-area {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: -0.01em;
}

.close-icon {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
    line-height: 1;
    padding: 8px;
    border-radius: 6px;
    aspect-ratio: 1/1;
}

.close-icon:hover {
    background: var(--bg-base);
    color: var(--text-main);
}

.close-icon:focus-visible {
    outline: 2px solid var(--primary-base, currentColor);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
    .close-icon {
        transition: background 0.2s, color 0.2s;
    }
}

.body {
    padding: 1.5rem;
    color: var(--text-body);
    font-size: 14px;
    line-height: 1.5;
    overflow-y: auto;
}

footer.actions {
    padding: 1rem 1.5rem;
    background: var(--bg-base);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-top: 1px solid var(--border-default);
}
`;

    class u extends n {
      _dialog;
      _form;
      _previouslyFocused = null;
      static get observedAttributes() {
        return ["action", "method", "enctype"];
      }
      constructor() {
        super({ css: j, template: F });
        this._dialog = this.shadowRoot?.querySelector("dialog") ?? null, this._form = this.shadowRoot?.querySelector("#form-validation") ?? null;
      }
      connectedCallback() {
        for (let t of ["action", "method", "enctype"])
          this._upgradeProperty(t);
        this._dialog?.addEventListener("click", this._handleBackdropClick), this._dialog?.addEventListener("close", this._handleClose), this._form?.addEventListener("formdata", this._handleFormData);
      }
      disconnectedCallback() {
        this._dialog?.removeEventListener("click", this._handleBackdropClick), this._dialog?.removeEventListener("close", this._handleClose), this._form?.removeEventListener("formdata", this._handleFormData);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._form)
          return;
        if (t === "action")
          this._form.action = i ?? "";
        if (t === "method")
          this._form.method = i ?? "get";
        if (t === "enctype")
          this._form.enctype = i ?? "application/x-www-form-urlencoded";
      }
      _handleBackdropClick = (t) => {
        if (!this._dialog)
          return;
        if (t.target !== this._dialog)
          return;
        let e = this._dialog.getBoundingClientRect();
        if (!(e.top <= t.clientY && t.clientY <= e.top + e.height && e.left <= t.clientX && t.clientX <= e.left + e.width))
          this.close();
      };
      _handleClose = () => {
        if (this._previouslyFocused instanceof HTMLElement)
          this._previouslyFocused.focus();
        this._previouslyFocused = null, this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
      };
      _handleFormData = (t) => {
        this.querySelectorAll("[name]").forEach((i) => {
          let r = i.getAttribute("name"), a = i.value;
          if (r && a !== undefined && a !== null && a !== "")
            t.formData.append(r, String(a));
        });
      };
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      showModal() {
        if (!this._dialog)
          return;
        this._previouslyFocused = document.activeElement, this._dialog.showModal(), this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
      }
      close() {
        this._dialog?.close();
      }
      get action() {
        return this.getAttribute("action") ?? "";
      }
      set action(t) {
        if (t)
          this.setAttribute("action", t);
        else
          this.removeAttribute("action");
      }
      get method() {
        return this.getAttribute("method") ?? "get";
      }
      set method(t) {
        if (t)
          this.setAttribute("method", t);
        else
          this.removeAttribute("method");
      }
      get enctype() {
        return this.getAttribute("enctype") ?? "application/x-www-form-urlencoded";
      }
      set enctype(t) {
        if (t)
          this.setAttribute("enctype", t);
        else
          this.removeAttribute("enctype");
      }
    }
    if (!customElements.get("p9r-form-dialog"))
      customElements.define("p9r-form-dialog", u);
    var D = `<dialog id="drawer" part="dialog" aria-modal="true" role="dialog" aria-labelledby="title">
    <header part="header">
        <div id="title" part="title">
            <slot name="title">Dialog</slot>
        </div>
        <button id="close-btn" part="close" type="button" aria-label="Close">&times;</button>
    </header>

    <section class="content" part="content">
        <slot></slot>
    </section>

    <footer part="footer">
        <slot name="footer"></slot>
    </footer>
</dialog>
`;
    var R = `:host {
    --drawer-width: 400px;
    --drawer-bg: #ffffff;
    --transition-speed: 0.4s;
    --transition-curve: cubic-bezier(0.4, 0, 0.2, 1);

    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
}

dialog {
    display: flex;
    flex-direction: column;
    margin-right: 0;
    margin-left: auto;
    height: 100dvh;
    width: var(--drawer-width);
    max-width: 100vw;
    border: none;
    padding: 0;
    background: var(--drawer-bg);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);

    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;

    max-height: unset;
}

dialog[open] {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0);
    backdrop-filter: blur(0px);
}

dialog[open]::backdrop {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
}

@media (prefers-reduced-motion: no-preference) {
    dialog {
        transition:
            transform var(--transition-speed) var(--transition-curve),
            opacity var(--transition-speed) var(--transition-curve),
            display var(--transition-speed) var(--transition-curve) allow-discrete,
            overlay var(--transition-speed) var(--transition-curve) allow-discrete;
    }

    @starting-style {
        dialog[open] {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    dialog::backdrop {
        transition:
            background-color var(--transition-speed) var(--transition-curve),
            backdrop-filter var(--transition-speed) var(--transition-curve),
            display var(--transition-speed) var(--transition-curve) allow-discrete,
            overlay var(--transition-speed) var(--transition-curve) allow-discrete;
    }

    @starting-style {
        dialog[open]::backdrop {
            background: rgba(0, 0, 0, 0);
            backdrop-filter: blur(0px);
        }
    }

    header,
    footer,
    .content {
        transition: transform var(--transition-speed) var(--transition-curve);
    }

    #close-btn {
        transition: background-color 0.2s, color 0.2s;
    }
}

dialog > * {
    pointer-events: auto;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background-color: var(--drawer-bg);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 1;
}

header slot[name="title"]::slotted(*) {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
}

#close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    line-height: 0;
}

#close-btn:hover {
    background-color: #f3f4f6;
    color: #000;
}

#close-btn:focus-visible {
    outline: 2px solid #1a1a1a;
    outline-offset: 2px;
}

.content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    scrollbar-width: thin;
}

footer {
    padding: 1.25rem 1.5rem;
    background-color: #f9fafb;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
}

footer slot[name="footer"]::slotted(button) {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #d1d5db;
    background: white;
}

footer slot[name="footer"]::slotted(button[primary]) {
    background: #000;
    color: white;
    border-color: #000;
}

footer slot[name="footer"]::slotted(button:hover) {
    filter: brightness(0.9);
}

@media (prefers-reduced-motion: no-preference) {
    footer slot[name="footer"]::slotted(button) {
        transition: all 0.2s;
    }
}
`;

    class h extends n {
      _dialog;
      _closeBtn;
      static get observedAttributes() {
        return ["open"];
      }
      constructor() {
        super({ css: R, template: D });
        this._dialog = this.shadowRoot?.querySelector("dialog") ?? null, this._closeBtn = this.shadowRoot?.querySelector("#close-btn") ?? null;
      }
      connectedCallback() {
        this._upgradeProperty("open"), this._dialog?.addEventListener("click", this._handleBackdropClick), this._dialog?.addEventListener("cancel", this._handleCancel), this._dialog?.addEventListener("close", this._handleClose), this._closeBtn?.addEventListener("click", this._handleCloseClick);
      }
      disconnectedCallback() {
        this._dialog?.removeEventListener("click", this._handleBackdropClick), this._dialog?.removeEventListener("cancel", this._handleCancel), this._dialog?.removeEventListener("close", this._handleClose), this._closeBtn?.removeEventListener("click", this._handleCloseClick);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._dialog)
          return;
        if (t === "open") {
          let r = this.hasAttribute("open");
          if (r && !this._dialog.open)
            this._dialog.showModal();
          else if (!r && this._dialog.open)
            this._dialog.close();
        }
      }
      _handleBackdropClick = (t) => {
        if (t.target === this._dialog)
          this.close();
      };
      _handleCloseClick = (t) => {
        t.preventDefault(), this.close();
      };
      _handleCancel = (t) => {
        t.preventDefault(), this.close();
      };
      _handleClose = () => {
        if (this.hasAttribute("open"))
          this.removeAttribute("open");
        this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
      };
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      get open() {
        return this.hasAttribute("open");
      }
      set open(t) {
        if (t)
          this.setAttribute("open", "");
        else
          this.removeAttribute("open");
      }
      show() {
        if (!this._dialog)
          return;
        if (!this._dialog.open)
          this._dialog.showModal();
        if (!this.hasAttribute("open"))
          this.setAttribute("open", "");
        this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
      }
      showModal() {
        this.show();
      }
      close() {
        if (!this._dialog)
          return;
        if (this._dialog.open)
          this._dialog.close();
      }
    }
    if (!customElements.get("w13c-lateral-dialog"))
      customElements.define("w13c-lateral-dialog", h);
    var T = `<button id="btn" class="button" part="button">
    <slot name="icon-left"></slot>
    <span class="label">
        <slot>Button</slot>
    </span>
    <slot name="icon-right"></slot>
</button>
`;
    var P = `:host {
  display: inline-block;

  --_btn-padding-y: 0.6rem;
  --_btn-padding-x: 1.2rem;
  --_btn-font-size: 13px;
  --_btn-line-height: 1;

  --_btn-bg: var(--bg-surface);
  --_btn-text: var(--text-main);
  --_btn-border: var(--border-default);
  --_btn-hover-bg: var(--bg-base);

  --_accent-base: var(--text-main);
  --_accent-muted: var(--bg-base);
  --_accent-contrast: oklch(100% 0 0);

  --_btn-radius: 8px;
  --_btn-font: inherit;
}

:host([color="primary"]) {
  --_accent-base: var(--primary-base);
  --_accent-muted: var(--primary-muted);
  --_accent-contrast: oklch(100% 0 0);
}

:host([color="danger"]) {
  --_accent-base: var(--danger-base);
  --_accent-muted: var(--danger-muted);
}

:host([color="success"]) {
  --_accent-base: var(--success-base);
  --_accent-muted: var(--success-muted);
}

:host([color="info"]) {
  --_accent-base: var(--info-base);
  --_accent-muted: var(--info-muted);
}

:host([variant="filled"]) {
  --_btn-bg: var(--_accent-base);
  --_btn-text: var(--_accent-contrast);
  --_btn-border: transparent;
  --_btn-hover-bg: var(--_accent-base);
  --_btn-hover-opacity: 0.9;
  border-color: transparent;
}

:host([variant="outlined"]) {
  --_btn-bg: transparent;
  --_btn-border: var(--_accent-base);
  --_btn-text: var(--_accent-base);
  --_btn-hover-bg: var(--_accent-muted);
}

:host([variant="ghost"]) {
  --_btn-bg: transparent;
  --_btn-border: transparent;
  --_btn-text: var(--_accent-base);
  --_btn-hover-bg: var(--_accent-muted);
}

.button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  padding: var(--_btn-padding-y) var(--_btn-padding-x);

  font-family: var(--_btn-font);
  font-size: var(--_btn-font-size);
  font-weight: 600;
  line-height: var(--_btn-line-height);
  letter-spacing: -0.015em;

  border-radius: var(--_btn-radius);
  border: 1.5px solid var(--_btn-border);
  background-color: var(--_btn-bg);
  color: var(--_btn-text);

  white-space: nowrap;
}

.button:focus-visible {
  outline: 2px solid var(--_accent-base);
  outline-offset: 2px;
}

:host([fullwidth]), :host([fullwidth]) .button {
  width: 100%;
}

:host([align="left"]) .button {
  justify-content: start;
}

:host([align="right"]) .button {
  justify-content: end;
}

.button:hover {
  background-color: var(--_btn-hover-bg);
  opacity: var(--_btn-hover-opacity, 1);
}

@media (prefers-reduced-motion: no-preference) {
  .button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .button:active {
    transform: translateY(0) scale(0.98);
  }
}

:host([disabled]) {
  opacity: 0.4;
  pointer-events: none;
}

::slotted(svg) {
  width: 1.2rem;
}
`;

    class p extends n {
      static formAssociated = true;
      _internals;
      _btn;
      constructor() {
        super({ css: P, template: T });
        this._internals = this.attachInternals(), this._btn = this.shadowRoot?.querySelector("button") ?? null;
      }
      static get observedAttributes() {
        return ["type", "disabled"];
      }
      connectedCallback() {
        for (let t of ["type", "disabled"])
          this._upgradeProperty(t);
        if (!this.hasAttribute("type"))
          this.setAttribute("type", "button");
        if (!this.hasAttribute("variant"))
          this.setAttribute("variant", "filled");
        this.addEventListener("click", this._handleClick);
      }
      disconnectedCallback() {
        this.removeEventListener("click", this._handleClick);
      }
      _handleClick = (t) => {
        if (this.hasAttribute("disabled")) {
          t.stopImmediatePropagation();
          return;
        }
        let e = this._internals.form;
        if (!e)
          return;
        let i = this.getAttribute("type");
        if (i === "submit")
          e.requestSubmit();
        if (i === "reset")
          e.reset();
      };
      _upgradeProperty(t) {
        if (this.hasOwnProperty(t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      attributeChangedCallback(t, e, i) {
        if (!this._btn)
          return;
        if (t === "type")
          this._btn.type = i ?? "button";
        if (t === "disabled")
          this._btn.disabled = this.hasAttribute("disabled");
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
    }
    if (!customElements.get("p9r-button"))
      customElements.define("p9r-button", p);
    var S = `<label class="checkbox-container" part="container">
    <span class="input-wrapper">
        <input type="checkbox" id="native-input" part="input" />
        <span class="custom-box" part="box" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="checkmark" part="checkmark">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="indeterminate-mark" part="indeterminate"></span>
        </span>
    </span>
    <span class="label-text" part="label">
        <slot></slot>
    </span>
</label>
`;
    var I = `:host {
  display: inline-block;
  --cb-size: 20px;
  --cb-border: var(--border-default, #d1d5db);
  --cb-bg: var(--bg-surface, #ffffff);
  --cb-active-bg: var(--primary-base, #000000);
  --cb-active-border: var(--primary-base, #000000);
  --cb-focus-ring: color-mix(in oklab, var(--cb-active-bg) 20%, transparent);
  --cb-text: var(--text-main, #374151);
  --cb-hover-border: var(--text-muted, #9ca3af);
}

.checkbox-container {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  font-family: inherit;
}

.input-wrapper {
  position: relative;
  display: inline-block;
  width: var(--cb-size);
  height: var(--cb-size);
  flex-shrink: 0;
}

input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: inherit;
  width: 100%;
  height: 100%;
}

.custom-box {
  position: absolute;
  inset: 0;
  background-color: var(--cb-bg);
  border: 2px solid var(--cb-border);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.checkmark {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--cb-check-color, #ffffff);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
}

.indeterminate-mark {
  position: absolute;
  width: 10px;
  height: 2px;
  background-color: var(--cb-check-color, #ffffff);
  border-radius: 1px;
  opacity: 0;
}

input:checked ~ .custom-box {
  background-color: var(--cb-active-bg);
  border-color: var(--cb-active-border);
}

input:checked ~ .custom-box .checkmark {
  stroke-dashoffset: 0;
}

:host([indeterminate]) .custom-box {
  background-color: var(--cb-active-bg);
  border-color: var(--cb-active-border);
}

:host([indeterminate]) .checkmark {
  opacity: 0;
}

:host([indeterminate]) .indeterminate-mark {
  opacity: 1;
}

input:focus-visible ~ .custom-box {
  box-shadow: 0 0 0 3px var(--cb-focus-ring);
  border-color: var(--cb-active-border);
  outline: none;
}

.checkbox-container:hover input:not(:checked):not(:disabled) ~ .custom-box {
  border-color: var(--cb-hover-border);
}

:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}

.label-text {
  font-size: 0.95rem;
  color: var(--cb-text);
}

.label-text:has(slot:empty),
.label-text slot:not([name]):empty {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  .custom-box {
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .checkmark {
    transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .indeterminate-mark {
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
`;

    class b extends n {
      static formAssociated = true;
      _internals;
      _input;
      static get observedAttributes() {
        return ["checked", "disabled", "name", "value", "indeterminate"];
      }
      constructor() {
        super({ css: I, template: S });
        this._internals = this.attachInternals(), this._input = this.shadowRoot?.querySelector("input") ?? null;
      }
      connectedCallback() {
        for (let t of ["checked", "disabled", "name", "value", "indeterminate"])
          this._upgradeProperty(t);
        if (this._input) {
          if (this._input.checked = this.hasAttribute("checked"), this._input.disabled = this.hasAttribute("disabled"), this._input.indeterminate = this.hasAttribute("indeterminate"), this.hasAttribute("name"))
            this._input.name = this.getAttribute("name") ?? "";
          if (this.hasAttribute("value"))
            this._input.value = this.getAttribute("value") ?? "";
          this._input.addEventListener("change", this._handleChange), this._input.addEventListener("click", this._handleClick);
        }
        this._syncFormValue();
      }
      disconnectedCallback() {
        if (this._input)
          this._input.removeEventListener("change", this._handleChange), this._input.removeEventListener("click", this._handleClick);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._input)
          return;
        if (t === "checked")
          this._input.checked = i !== null, this._syncFormValue();
        else if (t === "disabled")
          this._input.disabled = i !== null;
        else if (t === "indeterminate")
          this._input.indeterminate = i !== null;
        else if (t === "name")
          this._input.name = i ?? "";
        else if (t === "value")
          this._input.value = i ?? "", this._syncFormValue();
      }
      _handleChange = () => {
        if (this._input?.checked ?? false)
          this.setAttribute("checked", "");
        else
          this.removeAttribute("checked");
        if (this._input && this._input.indeterminate === false && this.hasAttribute("indeterminate"))
          this.removeAttribute("indeterminate");
        this._syncFormValue(), this.dispatchEvent(new Event("change", { bubbles: true }));
      };
      _handleClick = (t) => {
        if (this.hasAttribute("disabled"))
          t.preventDefault(), t.stopImmediatePropagation();
      };
      _syncFormValue() {
        let t = this._input?.checked ?? this.hasAttribute("checked");
        this._internals.setFormValue(t ? this.getAttribute("value") ?? "on" : null);
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      get checked() {
        return this.hasAttribute("checked");
      }
      set checked(t) {
        if (t)
          this.setAttribute("checked", "");
        else
          this.removeAttribute("checked");
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      get indeterminate() {
        return this._input?.indeterminate ?? this.hasAttribute("indeterminate");
      }
      set indeterminate(t) {
        if (t)
          this.setAttribute("indeterminate", "");
        else
          this.removeAttribute("indeterminate");
        if (this._input)
          this._input.indeterminate = t;
      }
      get name() {
        return this.getAttribute("name") ?? "";
      }
      set name(t) {
        this.setAttribute("name", t);
      }
      get value() {
        return this.getAttribute("value") ?? "on";
      }
      set value(t) {
        this.setAttribute("value", t);
      }
      get form() {
        return this._internals.form;
      }
      click() {
        this._input?.click();
      }
    }
    if (!customElements.get("w13c-checkbox"))
      customElements.define("w13c-checkbox", b);
    var Lt = `
    :host {
        display: block;
        margin-bottom: 8px;
    }

    .section-container {
        border-radius: 10px;
        background: var(--bg-surface, #fff);
        border: 1px solid var(--border-default, #e5e7eb);
    }

    header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        cursor: pointer;
        user-select: none;
        outline: none;
    }

    header:hover {
        background: var(--bg-base, #f9fafb);
    }

    header:focus-visible {
        box-shadow: inset 0 0 0 2px var(--primary-base, #6366f1);
        border-radius: 10px;
    }

    @media (prefers-reduced-motion: no-preference) {
        header { transition: background 0.15s; }
        .chevron { transition: transform 0.2s ease; }
    }

    .accent-bar {
        width: 3px;
        height: 14px;
        background: var(--primary-base, #6366f1);
        border-radius: 4px;
        flex-shrink: 0;
    }

    .title-wrapper {
        flex: 1;
        color: var(--text-main, #111827);
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .chevron {
        width: 16px;
        height: 16px;
        color: var(--text-muted, #9ca3af);
        flex-shrink: 0;
    }

    :host([collapsed]) .chevron {
        transform: rotate(-90deg);
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        border-top: 1px solid var(--border-default, #e5e7eb);
        padding: 1rem;
    }

    :host([collapsed]) .content {
        display: none;
    }

    .content ::slotted(*) {
        width: 100%;
    }
`, zt = `
    <section class="section-container" part="container">
        <header id="toggle" part="header" role="button" tabindex="0" aria-expanded="true">
            <div class="accent-bar" part="accent"></div>
            <div class="title-wrapper" part="title"></div>
            <svg class="chevron" part="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
            </svg>
        </header>
        <main class="content" id="content" part="content">
            <slot></slot>
        </main>
    </section>
`;

    class g extends n {
      static get observedAttributes() {
        return ["collapsed", "data-title"];
      }
      _toggle;
      _title;
      _content;
      constructor() {
        super({ css: Lt, template: zt });
        this._toggle = this.shadowRoot?.getElementById("toggle") ?? null, this._title = this.shadowRoot?.querySelector(".title-wrapper") ?? null, this._content = this.shadowRoot?.getElementById("content") ?? null;
      }
      connectedCallback() {
        for (let t of ["collapsed"])
          this._upgradeProperty(t);
        if (this.hasAttribute("data-collapsed") && !this.hasAttribute("collapsed"))
          this.setAttribute("collapsed", "");
        this._syncTitle(), this._syncAria(), this._toggle?.addEventListener("click", this._onToggleClick), this._toggle?.addEventListener("keydown", this._onToggleKey);
      }
      disconnectedCallback() {
        this._toggle?.removeEventListener("click", this._onToggleClick), this._toggle?.removeEventListener("keydown", this._onToggleKey);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._toggle)
          return;
        if (t === "collapsed")
          this._syncAria();
        if (t === "data-title")
          this._syncTitle();
      }
      get collapsed() {
        return this.hasAttribute("collapsed");
      }
      set collapsed(t) {
        if (t)
          this.setAttribute("collapsed", "");
        else
          this.removeAttribute("collapsed");
      }
      _onToggleClick = () => {
        this.collapsed = !this.collapsed, this.dispatchEvent(new CustomEvent("toggle", { detail: { collapsed: this.collapsed }, bubbles: true, composed: true }));
      };
      _onToggleKey = (t) => {
        if (t.key === "Enter" || t.key === " ")
          t.preventDefault(), this._onToggleClick();
      };
      _syncTitle() {
        if (!this._title)
          return;
        this._title.textContent = this.getAttribute("data-title") ?? "";
      }
      _syncAria() {
        if (!this._toggle)
          return;
        if (this._toggle.setAttribute("aria-expanded", String(!this.collapsed)), this._content)
          this._content.hidden = this.collapsed;
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
    }
    if (!customElements.get("p9r-section"))
      customElements.define("p9r-section", g);
    var N = `<div class="field-header" part="header">
    <slot name="label"></slot>
</div>

<div class="drop-zone" part="drop-zone">
    <input type="file" id="file-native" part="input">
    <label for="file-native" part="trigger">
        <span class="icon" part="icon">
            <slot name="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
            </slot>
        </span>
        <span class="text" part="text">
            <slot name="text"><strong>Click to upload</strong> or drag a file</slot>
        </span>
        <span class="file-info" part="file-info">No file selected</span>
    </label>
</div>

<div class="sr-live" role="status" aria-live="polite" aria-atomic="true"></div>
`;
    var O = `:host {
    display: block;
    width: 100%;
    margin: 1.25rem 0;
}

:host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
}

.drop-zone {
    border: 2px dashed var(--border-default);
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    background: var(--bg-surface);
    cursor: pointer;
    position: relative;
}

:host([dragging]) .drop-zone {
    border-color: var(--color-primary);
    background: color-mix(in oklch, var(--color-primary), transparent 90%);
}

label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.icon {
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    display: inline-flex;
}

.text {
    font-size: 14px;
    color: var(--text-body);
}

.text strong {
    color: var(--color-primary);
}

.file-info {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 0.5rem;
    font-family: monospace;
}

input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

input[type="file"]:focus-visible + label {
    outline: 2px solid var(--color-primary, currentColor);
    outline-offset: 2px;
    border-radius: 8px;
}

.field-header {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-label, #4b5563);
}

.sr-live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (prefers-reduced-motion: no-preference) {
    .drop-zone {
        transition: border-color 0.2s ease, background-color 0.2s ease;
    }
}
`;

    class f extends n {
      static formAssociated = true;
      _internals;
      _input;
      _preview;
      _dropZone;
      _liveRegion;
      constructor() {
        super({ css: O, template: N });
        this._internals = this.attachInternals(), this._input = this.shadowRoot?.querySelector('input[type="file"]') ?? null, this._preview = this.shadowRoot?.querySelector(".file-info") ?? null, this._dropZone = this.shadowRoot?.querySelector(".drop-zone") ?? null, this._liveRegion = this.shadowRoot?.querySelector(".sr-live") ?? null;
      }
      static get observedAttributes() {
        return ["accept", "multiple", "name", "disabled", "required"];
      }
      connectedCallback() {
        for (let t of ["accept", "multiple", "name", "disabled", "required"])
          this._upgradeProperty(t);
        if (this._input?.addEventListener("change", this._onInputChange), this._dropZone)
          this._dropZone.addEventListener("dragover", this._onDragOver), this._dropZone.addEventListener("dragleave", this._onDragLeave), this._dropZone.addEventListener("drop", this._onDrop);
      }
      disconnectedCallback() {
        if (this._input?.removeEventListener("change", this._onInputChange), this._dropZone)
          this._dropZone.removeEventListener("dragover", this._onDragOver), this._dropZone.removeEventListener("dragleave", this._onDragLeave), this._dropZone.removeEventListener("drop", this._onDrop);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._input)
          return;
        switch (t) {
          case "accept":
            if (i === null)
              this._input.removeAttribute("accept");
            else
              this._input.setAttribute("accept", i);
            break;
          case "multiple":
            this._input.multiple = this.hasAttribute("multiple");
            break;
          case "name":
            if (i === null)
              this._input.removeAttribute("name");
            else
              this._input.setAttribute("name", i);
            break;
          case "disabled":
            this._input.disabled = this.hasAttribute("disabled");
            break;
          case "required":
            this._input.required = this.hasAttribute("required");
            break;
        }
      }
      _onDragOver = (t) => {
        if (t.preventDefault(), this.hasAttribute("disabled"))
          return;
        this.toggleAttribute("dragging", true);
      };
      _onDragLeave = (t) => {
        t.preventDefault(), this.toggleAttribute("dragging", false);
      };
      _onDrop = (t) => {
        let e = t;
        if (e.preventDefault(), this.removeAttribute("dragging"), this.hasAttribute("disabled"))
          return;
        if (e.dataTransfer?.files && this._input)
          this._input.files = e.dataTransfer.files, this._updateValue();
      };
      _onInputChange = () => {
        this._updateValue();
      };
      _updateValue() {
        let t = this._input?.files;
        if (!t || t.length === 0) {
          if (this._preview)
            this._preview.textContent = "No file selected";
          this._internals.setFormValue(null), this._announce("No file selected"), this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { files: null } }));
          return;
        }
        let e = t.length === 1 && t[0] ? `${t[0].name} (${this._formatSize(t[0].size)})` : `${t.length} files selected`;
        if (this._preview)
          this._preview.textContent = e;
        if (t.length === 1 && t[0])
          this._internals.setFormValue(t[0]);
        else {
          let i = new FormData, r = this.getAttribute("name") || "";
          for (let a = 0;a < t.length; a++) {
            let s = t.item(a);
            if (s)
              i.append(r, s);
          }
          this._internals.setFormValue(i);
        }
        this._announce(`Selected: ${e}`), this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { files: t } }));
      }
      _formatSize(t) {
        if (t < 1024)
          return `${t} B`;
        if (t < 1048576)
          return `${(t / 1024).toFixed(1)} KB`;
        return `${(t / 1048576).toFixed(1)} MB`;
      }
      _announce(t) {
        if (this._liveRegion)
          this._liveRegion.textContent = t;
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      get name() {
        return this.getAttribute("name") || "";
      }
      set name(t) {
        this.setAttribute("name", t);
      }
      get accept() {
        return this.getAttribute("accept") || "";
      }
      set accept(t) {
        if (t)
          this.setAttribute("accept", t);
        else
          this.removeAttribute("accept");
      }
      get multiple() {
        return this.hasAttribute("multiple");
      }
      set multiple(t) {
        if (t)
          this.setAttribute("multiple", "");
        else
          this.removeAttribute("multiple");
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      get required() {
        return this.hasAttribute("required");
      }
      set required(t) {
        if (t)
          this.setAttribute("required", "");
        else
          this.removeAttribute("required");
      }
      get files() {
        return this._input?.files ?? null;
      }
      get value() {
        return this._input?.files?.[0] ?? null;
      }
      get form() {
        return this._internals.form;
      }
    }
    if (!customElements.get("w13c-input-file"))
      customElements.define("w13c-input-file", f);

    class l extends HTMLElement {
      static formAssociated = true;
      static get observedAttributes() {
        return ["value", "label", "placeholder", "type", "hint", "hint-level", "max-count", "invalid", "disabled", "required"];
      }
      _internals;
      _input;
      _labelEl;
      _hintEl;
      _metaEl;
      _counterEl;
      _countEl;
      _maxEl;
      constructor() {
        super();
        this._internals = this.attachInternals();
        let t = this.attachShadow({ mode: "open" });
        t.innerHTML = `
            <style>${l._css}</style>
            <div class="field" part="field">
                <label class="label" part="label"></label>
                <input class="input" part="input" type="text" />
                <div class="meta" part="meta" hidden>
                    <small class="hint" part="hint"></small>
                    <small class="counter" part="counter" hidden data-over="false"><span class="count">0</span>/<span class="max">0</span></small>
                </div>
            </div>
        `, this._labelEl = t.querySelector(".label"), this._input = t.querySelector(".input"), this._hintEl = t.querySelector(".hint"), this._metaEl = t.querySelector(".meta"), this._counterEl = t.querySelector(".counter"), this._countEl = t.querySelector(".count"), this._maxEl = t.querySelector(".max");
        let e = `p9r-input-label-${++l._uid}`;
        if (this._labelEl && this._input)
          this._labelEl.id = e, this._input.setAttribute("aria-labelledby", e);
      }
      connectedCallback() {
        for (let e of ["value", "disabled", "required"])
          this._upgradeProperty(e);
        this._input?.addEventListener("input", this._onInput), this._input?.addEventListener("change", this._onChange), this._syncLabel(), this._syncPlaceholder(), this._syncType(), this._syncDisabled(), this._syncRequired(), this._syncHint(), this._syncHintLevel(), this._syncInvalid(), this._syncMaxCount();
        let t = this.getAttribute("value");
        if (t !== null)
          this.value = t;
        else
          this._updateCounter();
      }
      disconnectedCallback() {
        this._input?.removeEventListener("input", this._onInput), this._input?.removeEventListener("change", this._onChange);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._input)
          return;
        switch (t) {
          case "value":
            if (i !== null)
              this.value = i;
            break;
          case "label":
            this._syncLabel();
            break;
          case "placeholder":
            this._syncPlaceholder();
            break;
          case "type":
            this._syncType();
            break;
          case "disabled":
            this._syncDisabled();
            break;
          case "required":
            this._syncRequired();
            break;
          case "hint":
            this._syncHint();
            break;
          case "hint-level":
            this._syncHintLevel();
            break;
          case "invalid":
            this._syncInvalid();
            break;
          case "max-count":
            this._syncMaxCount(), this._updateCounter();
            break;
        }
      }
      get value() {
        return this._input?.value ?? "";
      }
      set value(t) {
        if (!this._input)
          return;
        this._input.value = t, this._internals.setFormValue(t), this._updateCounter();
      }
      get name() {
        return this.getAttribute("name") ?? "";
      }
      get disabled() {
        return this._input?.disabled ?? false;
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      get required() {
        return this.hasAttribute("required");
      }
      set required(t) {
        if (t)
          this.setAttribute("required", "");
        else
          this.removeAttribute("required");
      }
      focus() {
        this._input?.focus();
      }
      setHint(t, e) {
        if (!this._hintEl)
          return;
        this._hintEl.textContent = e, this._hintEl.dataset.level = t, this._refreshMetaVisibility();
      }
      setInvalid(t) {
        if (t)
          this.setAttribute("invalid", "");
        else
          this.removeAttribute("invalid");
      }
      _onInput = () => {
        if (!this._input)
          return;
        this._internals.setFormValue(this._input.value), this._updateCounter();
      };
      _onChange = () => {
        if (!this._input)
          return;
        this._internals.setFormValue(this._input.value);
      };
      _syncLabel() {
        if (!this._labelEl)
          return;
        let t = this.getAttribute("label") ?? "";
        this._labelEl.textContent = t, this._labelEl.hidden = t === "";
      }
      _syncPlaceholder() {
        if (!this._input)
          return;
        let t = this.getAttribute("placeholder");
        if (t === null)
          this._input.removeAttribute("placeholder");
        else
          this._input.setAttribute("placeholder", t);
      }
      _syncType() {
        if (!this._input)
          return;
        let t = this.getAttribute("type") ?? "text";
        this._input.setAttribute("type", t);
      }
      _syncDisabled() {
        if (!this._input)
          return;
        this._input.disabled = this.hasAttribute("disabled");
      }
      _syncRequired() {
        if (!this._input)
          return;
        let t = this.hasAttribute("required");
        if (this._input.required = t, t)
          this._input.setAttribute("aria-required", "true");
        else
          this._input.removeAttribute("aria-required");
      }
      _syncHint() {
        if (!this._hintEl)
          return;
        this._hintEl.textContent = this.getAttribute("hint") ?? "", this._refreshMetaVisibility();
      }
      _syncHintLevel() {
        if (!this._hintEl)
          return;
        let t = this.getAttribute("hint-level") ?? "info";
        this._hintEl.dataset.level = t;
      }
      _syncInvalid() {
        if (!this._input)
          return;
        if (this.hasAttribute("invalid"))
          this._input.setAttribute("aria-invalid", "true");
        else
          this._input.removeAttribute("aria-invalid");
      }
      _syncMaxCount() {
        if (!this._counterEl || !this._maxEl)
          return;
        let t = this._parseMaxCount();
        if (t === null)
          this._counterEl.hidden = true;
        else
          this._counterEl.hidden = false, this._maxEl.textContent = String(t);
        this._refreshMetaVisibility();
      }
      _parseMaxCount() {
        let t = this.getAttribute("max-count");
        if (t === null)
          return null;
        let e = parseInt(t, 10);
        return Number.isFinite(e) && e > 0 ? e : null;
      }
      _updateCounter() {
        if (!this._input || !this._counterEl || !this._countEl)
          return;
        let t = this._parseMaxCount();
        if (t === null)
          return;
        let e = this._input.value.length;
        this._countEl.textContent = String(e), this._counterEl.dataset.over = String(e > t);
      }
      _refreshMetaVisibility() {
        if (!this._hintEl || !this._counterEl || !this._metaEl)
          return;
        let t = (this._hintEl.textContent ?? "").length > 0, e = !this._counterEl.hidden;
        this._metaEl.hidden = !t && !e;
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      static _uid = 0;
      static _css = `
        :host {
            display: block;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
        }

        .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted, #94a3b8);
        }

        .label[hidden] {
            display: none;
        }

        .input {
            width: 100%;
            padding: 7px 10px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-main, #1e293b);
            font-family: inherit;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            background: var(--bg-surface, #fff);
            outline: none;
            box-sizing: border-box;
        }

        @media (prefers-reduced-motion: no-preference) {
            .input { transition: border-color 0.15s, box-shadow 0.15s; }
        }

        .input::placeholder {
            color: var(--text-muted, #94a3b8);
            font-weight: 400;
        }

        .input:hover:not(:disabled) {
            border-color: var(--text-muted, #94a3b8);
        }

        .input:focus-visible {
            border-color: var(--primary-base, #4361ee);
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
        }

        .input[aria-invalid="true"] {
            border-color: var(--danger-base, #ef4444);
        }

        .input[aria-invalid="true"]:focus-visible {
            box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
        }

        .input:disabled {
            background: var(--bg-base, #f1f5f9);
            color: var(--text-muted, #94a3b8);
            cursor: not-allowed;
        }

        .meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
        }

        .meta[hidden] {
            display: none;
        }

        .hint {
            font-size: 11px;
            color: var(--text-muted, #94a3b8);
            line-height: 1.4;
            flex: 1;
            min-width: 0;
        }

        .hint[data-level="error"] {
            color: var(--danger-base, #ef4444);
        }

        .hint[data-level="success"] {
            color: var(--success-base, #10b981);
        }

        .counter {
            font-size: 11px;
            color: var(--text-muted, #94a3b8);
            font-variant-numeric: tabular-nums;
            flex-shrink: 0;
        }

        .counter[hidden] {
            display: none;
        }

        .counter[data-over="true"] {
            color: var(--danger-base, #ef4444);
            font-weight: 600;
        }
    `;
    }
    if (!customElements.get("p9r-input"))
      customElements.define("p9r-input", l);

    class d extends HTMLElement {
      static formAssociated = true;
      static get observedAttributes() {
        return ["value", "label", "min", "max", "step", "unit", "disabled"];
      }
      _internals;
      _slider;
      _input;
      _fill;
      _labelEl;
      _unitEl;
      _minEl;
      _maxEl;
      constructor() {
        super();
        this._internals = this.attachInternals();
        let t = this.attachShadow({ mode: "open" });
        t.innerHTML = `
            <style>${d._css}</style>
            <div class="field" part="field">
                <div class="header" part="header">
                    <span class="label" part="label"></span>
                    <div class="input-wrap" part="input-wrap">
                        <input class="number" part="number-input" type="number">
                        <span class="unit" part="unit" hidden></span>
                    </div>
                </div>
                <div class="track-container" part="track-container">
                    <div class="track" part="track">
                        <div class="fill" part="fill"></div>
                    </div>
                    <input class="slider" part="slider" type="range">
                </div>
                <div class="bounds" part="bounds">
                    <span class="min-bound"></span>
                    <span class="max-bound"></span>
                </div>
            </div>
        `, this._slider = t.querySelector(".slider"), this._input = t.querySelector(".number"), this._fill = t.querySelector(".fill"), this._labelEl = t.querySelector(".label"), this._unitEl = t.querySelector(".unit"), this._minEl = t.querySelector(".min-bound"), this._maxEl = t.querySelector(".max-bound");
      }
      connectedCallback() {
        for (let t of ["value", "disabled"])
          this._upgradeProperty(t);
        this._syncLabel(), this._syncBounds(), this._syncUnit(), this._syncDisabled(), this._syncValue(this.getAttribute("value") ?? this.getAttribute("min") ?? "0"), this._slider?.addEventListener("input", this._onSliderInput), this._slider?.addEventListener("change", this._onSliderChange), this._input?.addEventListener("input", this._onNumberInput), this._input?.addEventListener("change", this._onNumberChange), this._input?.addEventListener("blur", this._onNumberBlur);
      }
      disconnectedCallback() {
        this._slider?.removeEventListener("input", this._onSliderInput), this._slider?.removeEventListener("change", this._onSliderChange), this._input?.removeEventListener("input", this._onNumberInput), this._input?.removeEventListener("change", this._onNumberChange), this._input?.removeEventListener("blur", this._onNumberBlur);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._slider || !this._input)
          return;
        switch (t) {
          case "value":
            if (i !== null)
              this._syncValue(i);
            break;
          case "label":
            this._syncLabel();
            break;
          case "min":
          case "max":
          case "step":
            this._syncBounds(), this._syncFill();
            break;
          case "unit":
            this._syncUnit();
            break;
          case "disabled":
            this._syncDisabled();
            break;
        }
      }
      get value() {
        return this._slider?.value ?? "";
      }
      set value(t) {
        this._syncValue(String(t));
      }
      get name() {
        return this.getAttribute("name") ?? "";
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      focus() {
        this._slider?.focus();
      }
      _onSliderInput = () => {
        if (!this._slider || !this._input)
          return;
        this._input.value = this._slider.value, this._internals.setFormValue(this._slider.value), this._syncFill(), this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      };
      _onSliderChange = () => {
        if (!this._slider)
          return;
        this._internals.setFormValue(this._slider.value), this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      };
      _onNumberInput = () => {
        if (!this._slider || !this._input)
          return;
        let t = this._input.value;
        if (t === "")
          return;
        let e = this._clamp(Number(t));
        this._slider.value = String(e), this._internals.setFormValue(this._slider.value), this._syncFill(), this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      };
      _onNumberChange = () => {
        if (!this._slider || !this._input)
          return;
        let t = this._clamp(Number(this._input.value));
        this._slider.value = String(t), this._input.value = String(t), this._internals.setFormValue(this._slider.value), this._syncFill(), this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      };
      _onNumberBlur = () => {
        if (!this._slider || !this._input)
          return;
        this._input.value = this._slider.value;
      };
      _clamp(t) {
        if (!this._slider)
          return t;
        let e = Number(this._slider.min), i = Number(this._slider.max);
        if (!Number.isFinite(t))
          return e;
        if (t < e)
          return e;
        if (t > i)
          return i;
        return t;
      }
      _syncValue(t) {
        if (!this._slider || !this._input)
          return;
        let e = this._clamp(Number(t));
        this._slider.value = String(e), this._input.value = String(e), this._internals.setFormValue(this._slider.value), this._syncFill();
      }
      _syncBounds() {
        if (!this._slider || !this._input || !this._minEl || !this._maxEl)
          return;
        let t = this.getAttribute("min") ?? "0", e = this.getAttribute("max") ?? "100", i = this.getAttribute("step") ?? "1";
        this._slider.min = t, this._slider.max = e, this._slider.step = i, this._input.min = t, this._input.max = e, this._input.step = i, this._minEl.textContent = t, this._maxEl.textContent = e;
      }
      _syncLabel() {
        if (!this._labelEl || !this._slider || !this._input)
          return;
        let t = this.getAttribute("label") ?? this.getAttribute("name") ?? "";
        if (this._labelEl.textContent = t, this._labelEl.hidden = t === "", t)
          this._slider.setAttribute("aria-label", t), this._input.setAttribute("aria-label", t);
      }
      _syncUnit() {
        if (!this._unitEl)
          return;
        let t = this.getAttribute("unit") ?? "";
        this._unitEl.textContent = t, this._unitEl.hidden = t === "";
      }
      _syncDisabled() {
        if (!this._slider || !this._input)
          return;
        let t = this.hasAttribute("disabled");
        this._slider.disabled = t, this._input.disabled = t;
      }
      _syncFill() {
        if (!this._slider || !this._fill)
          return;
        let t = Number(this._slider.min), e = Number(this._slider.max), i = Number(this._slider.value), r = e === t ? 0 : (i - t) / (e - t) * 100;
        this._fill.style.width = `${r}%`;
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      static _css = `
        :host {
            display: block;
        }

        :host([disabled]) {
            opacity: 0.55;
            pointer-events: none;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted, #94a3b8);
        }

        .label[hidden] {
            display: none;
        }

        .input-wrap {
            display: flex;
            align-items: center;
            gap: 2px;
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 6px;
            padding: 2px 6px;
        }

        @media (prefers-reduced-motion: no-preference) {
            .input-wrap { transition: border-color 0.15s; }
            .fill { transition: width 0.05s ease; }
            .slider::-webkit-slider-thumb { transition: transform 0.1s; }
        }

        .input-wrap:focus-within {
            border-color: var(--primary-base, #4361ee);
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
        }

        .number {
            width: 36px;
            border: none;
            outline: none;
            background: transparent;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-main, #1e293b);
            text-align: right;
            font-family: inherit;
            -moz-appearance: textfield;
        }

        .number::-webkit-inner-spin-button,
        .number::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        .unit {
            font-size: 10px;
            font-weight: 500;
            color: var(--text-muted, #94a3b8);
        }

        .unit[hidden] {
            display: none;
        }

        .track-container {
            position: relative;
            height: 20px;
            display: flex;
            align-items: center;
        }

        .track {
            position: absolute;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--border-default, #e2e8f0);
            border-radius: 4px;
            overflow: hidden;
            pointer-events: none;
        }

        .fill {
            height: 100%;
            background: var(--primary-base, #4361ee);
            border-radius: 4px;
        }

        .slider {
            position: relative;
            width: 100%;
            height: 20px;
            margin: 0;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
            z-index: 1;
            outline: none;
        }

        .slider:focus-visible::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.25));
        }

        .slider:focus-visible::-moz-range-thumb {
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.25));
        }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--primary-base, #4361ee);
            border: 2px solid var(--bg-surface, #fff);
            box-shadow: 0 1px 4px rgb(0 0 0 / 0.15);
            cursor: grab;
        }

        .slider::-webkit-slider-thumb:active {
            transform: scale(1.2);
            cursor: grabbing;
        }

        .slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--primary-base, #4361ee);
            border: 2px solid var(--bg-surface, #fff);
            box-shadow: 0 1px 4px rgb(0 0 0 / 0.15);
            cursor: grab;
        }

        .slider::-moz-range-track {
            background: transparent;
            border: none;
        }

        .bounds {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-weight: 500;
            color: var(--text-muted, #94a3b8);
            margin-top: -2px;
        }
    `;
    }
    if (!customElements.get("p9r-range"))
      customElements.define("p9r-range", d);

    class c extends HTMLElement {
      _trigger = null;
      _display = null;
      _list = null;
      _panel = null;
      _options = [];
      _isOpen = false;
      _value = "";
      _onWindowClick = (t) => {
        if (this._isOpen && !this.contains(t.target))
          this._close();
      };
      _onTriggerClick = (t) => {
        t.stopPropagation(), this._isOpen ? this._close() : this._open();
      };
      _onTriggerKeyDown = (t) => {
        if (t.key === "Escape")
          this._close();
        if (t.key === "Enter" || t.key === " ")
          t.preventDefault(), this._isOpen ? this._close() : this._open();
      };
      _onSlotChange = () => this._syncFromSlot();
      constructor() {
        super();
        this._buildShadow();
      }
      connectedCallback() {
        this.shadowRoot.querySelector("slot").addEventListener("slotchange", this._onSlotChange), this._trigger.addEventListener("click", this._onTriggerClick), this._trigger.addEventListener("keydown", this._onTriggerKeyDown), window.addEventListener("click", this._onWindowClick), this._syncFromSlot();
      }
      disconnectedCallback() {
        this.shadowRoot.querySelector("slot")?.removeEventListener("slotchange", this._onSlotChange), this._trigger?.removeEventListener("click", this._onTriggerClick), this._trigger?.removeEventListener("keydown", this._onTriggerKeyDown), window.removeEventListener("click", this._onWindowClick);
      }
      _buildShadow() {
        let t = this.getAttribute("label") || this.getAttribute("name") || "", e = this.attachShadow({ mode: "open" });
        e.innerHTML = `
            <style>${c._css}</style>
            <div class="field">
                <span class="label">${t}</span>
                <button class="trigger" type="button" tabindex="0">
                    <span class="value"></span>
                    <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="panel">
                    <ul class="list"></ul>
                </div>
            </div>
            <div hidden><slot></slot></div>
        `, this._trigger = e.querySelector(".trigger"), this._display = e.querySelector(".value"), this._list = e.querySelector(".list"), this._panel = e.querySelector(".panel");
      }
      _syncFromSlot() {
        let t = Array.from(this.querySelectorAll("option"));
        this._list.innerHTML = "", this._options = [];
        let e = "", i = "";
        if (t.forEach((r) => {
          let a = document.createElement("li");
          if (a.className = "option", a.textContent = r.textContent, a.dataset.value = r.value, a.addEventListener("click", () => this._select(r.value, r.textContent || "")), this._list.appendChild(a), this._options.push(a), r.hasAttribute("selected") && !e)
            e = r.value, i = r.textContent || "";
        }), e)
          this._setValue(e, i);
        else if (t.length > 0)
          this._setValue(t[0].value, t[0].textContent || "");
      }
      _select(t, e) {
        this._setValue(t, e), this._close(), this.dispatchEvent(new Event("change", { bubbles: true }));
      }
      _setValue(t, e) {
        this._value = t, this._display.textContent = e, this._options.forEach((i) => {
          i.classList.toggle("selected", i.dataset.value === t);
        });
      }
      _open() {
        document.querySelectorAll("p9r-select").forEach((t) => {
          if (t !== this)
            t._close();
        }), this._isOpen = true, this._panel.classList.add("open"), this._trigger.classList.add("open");
      }
      _close() {
        this._isOpen = false, this._panel.classList.remove("open"), this._trigger.classList.remove("open");
      }
      get value() {
        return this._value;
      }
      set value(t) {
        let e = this._options.find((i) => i.dataset.value === t);
        if (e)
          this._setValue(t, e.textContent || "");
      }
      get name() {
        return this.getAttribute("name");
      }
      static _css = `
        :host {
            display: block;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
        }

        .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted, #94a3b8);
        }

        .trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            width: 100%;
            padding: 7px 10px;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            background: var(--bg-surface, #fff);
            cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s;
            outline: none;
        }

        .trigger:hover {
            border-color: var(--text-muted, #94a3b8);
        }

        .trigger:focus-visible {
            border-color: var(--primary-base, #4361ee);
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
        }

        .trigger.open {
            border-color: var(--primary-base, #4361ee);
        }

        .value {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-main, #1e293b);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .chevron {
            flex-shrink: 0;
            color: var(--text-muted, #94a3b8);
            transition: transform 0.2s ease;
        }

        .trigger.open .chevron {
            transform: rotate(180deg);
            color: var(--primary-base, #4361ee);
        }

        /* ── Dropdown ── */

        .panel {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            box-shadow: 0 8px 20px rgb(0 0 0 / 0.08);
            z-index: 50;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-4px);
            transition: opacity 0.15s, visibility 0.15s, transform 0.15s;
            overflow: hidden;
        }

        .panel.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .list {
            list-style: none;
            margin: 0;
            padding: 4px;
            max-height: 200px;
            overflow-y: auto;
        }

        .option {
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-main, #1e293b);
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.1s;
        }

        .option:hover {
            background: var(--bg-base, #f1f5f9);
        }

        .option.selected {
            background: var(--primary-muted, rgb(67 97 238 / 0.1));
            color: var(--primary-base, #4361ee);
            font-weight: 600;
        }
    `;
    }
    if (!customElements.get("p9r-select"))
      customElements.define("p9r-select", c);

    class m extends HTMLElement {
      connectedCallback() {
        let t = this.getAttribute("label") || "Size", e = this.getAttribute("name") || "size", i = document.createElement("p9r-select");
        i.setAttribute("label", t), i.setAttribute("name", e), [{ value: "none", label: "NONE" }, { value: "xs", label: "XS" }, { value: "sm", label: "S" }, { value: "md", label: "M", selected: true }, { value: "lg", label: "L" }, { value: "xl", label: "XL" }].forEach((a) => {
          let s = document.createElement("option");
          if (s.value = a.value, s.textContent = a.label, a.selected)
            s.setAttribute("selected", "");
          i.appendChild(s);
        }), this.replaceWith(i);
      }
      get name() {
        return this.getAttribute("name");
      }
      get value() {
        return "";
      }
    }
    if (!customElements.get("p9r-sizes-select"))
      customElements.define("p9r-sizes-select", m);
    var $ = `<div class="switch-container" part="container">
    <span class="label" id="group-label" part="label"></span>

    <div class="switch-wrapper" part="wrapper" role="radiogroup" aria-labelledby="group-label">
        <div class="selection-slider" part="slider"></div>

        <div class="options-container" part="options">
            <slot></slot>
        </div>
    </div>

    <span class="error-message" id="error-text" part="error">
        <slot name="error"></slot>
    </span>
</div>
`;
    var V = `:host {
  --active-index: 0;
  --total-options: 1;
  display: block;
}

.label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted, #94a3b8);
  margin-bottom: 4px;
}

.label:empty {
  display: none;
}

.options-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(var(--total-options), 1fr);
}

::slotted(option) {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--text-main);
  cursor: pointer;
  user-select: none;
  text-align: center;
}

@media (prefers-reduced-motion: no-preference) {
  ::slotted(option) {
    transition: color 0.2s;
  }
}

::slotted(option:focus-visible) {
  outline: 2px solid var(--primary-base);
  outline-offset: -2px;
  border-radius: 6px;
}

.switch-wrapper {
  position: relative;
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 2px;
}

.selection-slider {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px) / var(--total-options));
  background-color: var(--bg-surface);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transform: translateX(calc(var(--active-index) * 100%));
  z-index: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .selection-slider {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

::slotted([aria-checked="true"]) {
  color: var(--primary-base) !important;
  font-weight: 600;
}

:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}
`;

    class v extends n {
      static formAssociated = true;
      _internals;
      _slider;
      _optionsContainer;
      _labelEl;
      _slot;
      _optionCount = 0;
      static get observedAttributes() {
        return ["value", "disabled", "name", "label"];
      }
      constructor() {
        super({ css: V, template: $ });
        this._internals = this.attachInternals(), this._slider = this.shadowRoot?.querySelector(".selection-slider") ?? null, this._optionsContainer = this.shadowRoot?.querySelector(".options-container") ?? null, this._labelEl = this.shadowRoot?.querySelector(".label") ?? null, this._slot = this.shadowRoot?.querySelector("slot:not([name])") ?? null;
      }
      connectedCallback() {
        for (let t of ["value", "disabled", "name", "label"])
          this._upgradeProperty(t);
        if (this._slot)
          this._slot.addEventListener("slotchange", this._handleSlotChange), this._syncOptions();
        this.addEventListener("keydown", this._handleKeydown), this._updateLabel();
      }
      disconnectedCallback() {
        if (this._slot)
          this._slot.removeEventListener("slotchange", this._handleSlotChange);
        this.removeEventListener("keydown", this._handleKeydown);
      }
      attributeChangedCallback(t, e, i) {
        if (!this.shadowRoot)
          return;
        if (t === "value")
          this.value = i ?? "";
        else if (t === "label")
          this._updateLabel();
      }
      get value() {
        return this.getAttribute("value") || "";
      }
      set value(t) {
        if (this.getAttribute("value") !== t)
          this.setAttribute("value", t);
        this._internals.setFormValue(t), this._updateSliderPosition(), this._updateSlottedSelections(t), this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: t } }));
      }
      get name() {
        return this.getAttribute("name") || "";
      }
      set name(t) {
        if (t)
          this.setAttribute("name", t);
        else
          this.removeAttribute("name");
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      get label() {
        return this.getAttribute("label") || "";
      }
      set label(t) {
        if (t)
          this.setAttribute("label", t);
        else
          this.removeAttribute("label");
      }
      _upgradeProperty(t) {
        if (this.hasOwnProperty(t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      _updateLabel() {
        if (this._labelEl)
          this._labelEl.textContent = this.getAttribute("label") || "";
      }
      _getOptions() {
        if (!this._slot)
          return [];
        return this._slot.assignedElements().filter((t) => t.tagName === "OPTION");
      }
      _handleSlotChange = () => {
        this._syncOptions();
      };
      _syncOptions() {
        let t = this._getOptions();
        this._optionCount = t.length, this.style.setProperty("--total-options", this._optionCount.toString()), t.forEach((e, i) => {
          if (e.setAttribute("role", "radio"), e.setAttribute("part", "segment"), !e.hasAttribute("tabindex"))
            e.setAttribute("tabindex", i === 0 ? "0" : "-1");
          e.onclick = () => {
            if (this.disabled)
              return;
            this.value = e.getAttribute("value") || "", e.focus();
          };
        }), this._updateSliderPosition(), this._updateSlottedSelections(this.value);
      }
      _handleKeydown = (t) => {
        if (this.disabled)
          return;
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(t.key))
          return;
        let i = this._getOptions();
        if (i.length === 0)
          return;
        let r = i.findIndex((pt) => pt.getAttribute("value") === this.value), a = r === -1 ? 0 : r, s = a;
        switch (t.key) {
          case "ArrowLeft":
          case "ArrowUp":
            s = (a - 1 + i.length) % i.length;
            break;
          case "ArrowRight":
          case "ArrowDown":
            s = (a + 1) % i.length;
            break;
          case "Home":
            s = 0;
            break;
          case "End":
            s = i.length - 1;
            break;
        }
        t.preventDefault();
        let o = i[s];
        if (!o)
          return;
        this.value = o.getAttribute("value") || "", o.focus();
      };
      _updateSliderPosition() {
        let t = this._getOptions(), e = t.findIndex((i) => i.getAttribute("value") === this.value);
        if (e !== -1)
          this.style.setProperty("--active-index", e.toString()), t.forEach((i, r) => {
            let a = r === e;
            i.setAttribute("aria-checked", a.toString()), i.setAttribute("tabindex", a ? "0" : "-1");
          });
      }
      _updateSlottedSelections(t) {
        this._getOptions().forEach((i) => {
          if (i.getAttribute("value") === t)
            i.setAttribute("selected", "");
          else
            i.removeAttribute("selected");
        });
      }
    }
    if (!customElements.get("p9r-segmented-switch"))
      customElements.define("p9r-segmented-switch", v);
    var Z = `<div class="container" part="container">
    <label for="main-input" part="label">
        <slot name="label">Tags</slot>
    </label>
    <div class="input-wrapper" part="input-wrapper">
        <input
            id="main-input"
            part="input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            aria-haspopup="listbox"
            autocomplete="off"
            spellcheck="false"
        />
        <div
            id="suggestions"
            class="suggestions"
            part="listbox"
            role="listbox"
            hidden
        ></div>
    </div>
    <div
        id="tags-display"
        class="tags-list"
        part="chips"
        role="list"
        aria-label="Selected tags"
    ></div>
    <div
        id="live-region"
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
    ></div>
</div>
`;
    var X = `:host {
    display: block;
    font-family: system-ui, -apple-system, sans-serif;
}

:host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
}

.container {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #94a3b8);
    cursor: pointer;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

input {
    width: 100%;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-main, #1e293b);
    font-family: inherit;
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 8px;
    background-color: var(--bg-surface, #fff);
    outline: none;
    box-sizing: border-box;
}

@media (prefers-reduced-motion: no-preference) {
    input {
        transition: border-color 0.15s, box-shadow 0.15s;
    }
}

input::placeholder {
    color: var(--text-muted, #94a3b8);
    font-weight: 400;
}

input:hover:not(:disabled) {
    border-color: var(--text-muted, #94a3b8);
}

input:focus-visible {
    border-color: var(--primary-base, #4361ee);
    box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
}

input:disabled {
    cursor: not-allowed;
    background-color: var(--bg-base, #f1f5f9);
}

.suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--bg-surface, #fff);
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 8px 20px rgb(0 0 0 / 0.08);
    max-height: 240px;
    overflow-y: auto;
    padding: 4px;
}

.suggestion {
    padding: 6px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    border-radius: 6px;
}

@media (prefers-reduced-motion: no-preference) {
    .suggestion {
        transition: background 0.1s;
    }
}

.suggestion[data-active="true"],
.suggestion:hover {
    background: var(--bg-base, #f1f5f9);
}

.suggestion .name {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-main, #1e293b);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
}

.tags-list:empty {
    display: none;
}

p9r-tag {
    cursor: pointer;
}

@media (prefers-reduced-motion: no-preference) {
    p9r-tag {
        transition: filter 0.2s;
    }
}

p9r-tag:hover {
    filter: brightness(0.92);
}
`;
    var K = `<span class="label" part="label"><slot></slot></span>
<button type="button" class="remove" part="remove" aria-label="Remove" hidden>&times;</button>
`;
    var Y = `:host {
    --_tag-font-family: ui-monospace, SFMono-Regular, Menlo, monospace;

    --_tag-bg: var(--info-muted, oklch(95% 0.02 230));
    --_tag-color: var(--text-body, oklch(45% 0.02 265));
    --_tag-border: var(--border-default, oklch(90% 0.02 265));

    --_tag-fs: 12px;
    --_tag-padding: 2px 8px;
    --_tag-radius: 6px;
    --_tag-gap: 4px;

    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--_tag-gap);

    font-family: var(--_tag-font-family);
    background-color: var(--_tag-bg);
    color: var(--_tag-color);

    font-size: var(--_tag-fs);
    padding: var(--_tag-padding);
    border-radius: var(--_tag-radius);
}

:host([color="info"]) {
    --_tag-bg: var(--info-muted, oklch(95% 0.02 230));
    --_tag-color: var(--info-base, oklch(65% 0.12 230));
    --_tag-border: var(--info-contrasted, oklch(25% 0.08 230));
}

:host([color="danger"]) {
    --_tag-bg: var(--danger-muted, oklch(95% 0.02 20));
    --_tag-color: var(--danger-base, oklch(65% 0.12 20));
    --_tag-border: var(--danger-contrasted, oklch(25% 0.08 20));
}

:host([color="success"]) {
    --_tag-bg: var(--success-muted, oklch(95% 0.02 120));
    --_tag-color: var(--success-base, oklch(65% 0.12 120));
    --_tag-border: var(--success-contrasted, oklch(25% 0.08 120));
}

:host([color="warning"]) {
    --_tag-bg: var(--warning-muted, oklch(95% 0.02 50));
    --_tag-color: var(--warning-base, oklch(65% 0.12 50));
    --_tag-border: var(--warning-contrasted, oklch(25% 0.08 50));
}

:host([color="primary"]) {
    --_tag-bg: var(--primary-muted, oklch(95% 0.02 265));
    --_tag-color: var(--primary-base, oklch(65% 0.12 265));
    --_tag-border: var(--primary-contrasted, oklch(25% 0.08 265));
}

:host([color="secondary"]) {
    --_tag-bg: var(--secondary-muted, oklch(95% 0.02 265));
    --_tag-color: var(--secondary-base, oklch(65% 0.12 265));
    --_tag-border: var(--secondary-contrasted, oklch(25% 0.08 265));
}

:host([border]) {
    border: 1px solid var(--_tag-border);
}

.label {
    display: inline-flex;
    align-items: center;
}

.remove {
    appearance: none;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    line-height: 1;
    padding: 0 2px;
    margin: 0;
    cursor: pointer;
    opacity: 0.6;
    font-size: 14px;
}

.remove:hover {
    opacity: 1;
}

.remove:focus-visible {
    outline: 2px solid var(--_tag-color);
    outline-offset: 1px;
    border-radius: 2px;
}

.remove[hidden] {
    display: none;
}

@media (prefers-reduced-motion: no-preference) {
    .remove {
        transition: opacity 0.15s ease;
    }
}
`;

    class _ extends n {
      _removeBtn;
      static get observedAttributes() {
        return ["removable"];
      }
      constructor() {
        super({ css: Y, template: K });
        this._removeBtn = this.shadowRoot?.querySelector(".remove") ?? null;
      }
      connectedCallback() {
        for (let t of ["removable"])
          this._upgradeProperty(t);
        this._syncRemovable(), this._removeBtn?.addEventListener("click", this._handleRemoveClick);
      }
      disconnectedCallback() {
        this._removeBtn?.removeEventListener("click", this._handleRemoveClick);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._removeBtn)
          return;
        if (t === "removable")
          this._syncRemovable();
      }
      _syncRemovable() {
        if (!this._removeBtn)
          return;
        this._removeBtn.hidden = !this.hasAttribute("removable");
      }
      _handleRemoveClick = (t) => {
        if (t.stopPropagation(), !this.dispatchEvent(new CustomEvent("remove", { bubbles: true, cancelable: true, detail: { value: this.getAttribute("value") ?? this.textContent?.trim() ?? "" } })))
          return;
        this.remove();
      };
      _upgradeProperty(t) {
        if (this.hasOwnProperty(t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      get removable() {
        return this.hasAttribute("removable");
      }
      set removable(t) {
        if (t)
          this.setAttribute("removable", "");
        else
          this.removeAttribute("removable");
      }
    }
    if (!customElements.get("p9r-tag"))
      customElements.define("p9r-tag", _);

    class x extends n {
      static formAssociated = true;
      _internals;
      _tags = [];
      _suggestions = [];
      _activeIndex = -1;
      _input;
      _display;
      _suggestionsEl;
      _liveRegion;
      _loaded = false;
      _allSuggestions = [];
      _uid;
      constructor() {
        super({ css: X, template: Z });
        if (this._internals = this.attachInternals(), this._input = this.shadowRoot?.querySelector("#main-input"), this._display = this.shadowRoot?.querySelector("#tags-display") ?? null, this._suggestionsEl = this.shadowRoot?.querySelector("#suggestions") ?? null, this._liveRegion = this.shadowRoot?.querySelector("#live-region") ?? null, this._uid = `ts-${Math.random().toString(36).slice(2, 9)}`, this._suggestionsEl)
          this._suggestionsEl.id = `${this._uid}-listbox`;
        if (this._input)
          this._input.setAttribute("aria-controls", `${this._uid}-listbox`);
      }
      static get observedAttributes() {
        return ["placeholder", "mode", "resource", "api", "disabled"];
      }
      connectedCallback() {
        for (let t of ["placeholder", "mode", "resource", "api", "disabled", "value"])
          this._upgradeProperty(t);
        if (this._input)
          this._input.addEventListener("input", this._onInput), this._input.addEventListener("keydown", this._onKeyDown), this._input.addEventListener("focus", this._onFocus), this._input.addEventListener("blur", this._onBlur);
        this._loadSuggestions();
      }
      disconnectedCallback() {
        if (this._input)
          this._input.removeEventListener("input", this._onInput), this._input.removeEventListener("keydown", this._onKeyDown), this._input.removeEventListener("focus", this._onFocus), this._input.removeEventListener("blur", this._onBlur);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._input)
          return;
        if (t === "placeholder")
          this._input.placeholder = i ?? "";
        else if (t === "disabled")
          this._input.disabled = this.hasAttribute("disabled");
        else if (t === "resource" || t === "api")
          this._loaded = false, this._allSuggestions = [], this._loadSuggestions();
        else if (t === "mode")
          this._renderTags();
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      async _loadSuggestions() {
        let t = this.getAttribute("resource");
        if (!t)
          return;
        let e = this.getAttribute("api") || "../api/tags", i = new URL(e, window.location.href);
        i.searchParams.set("resource", t);
        try {
          let r = await fetch(i);
          if (!r.ok)
            return;
          let a = await r.json();
          this._allSuggestions = a, this._loaded = true;
        } catch {}
      }
      _onFocus = () => {
        if (!this._loaded || !this._input)
          return;
        let t = this._input.value.trim().toLowerCase();
        this._refreshSuggestions(t);
      };
      _onBlur = () => {
        setTimeout(() => this._hideSuggestions(), 150);
      };
      _onInput = () => {
        if (!this._input)
          return;
        let t = this._input.value.trim().toLowerCase();
        this._refreshSuggestions(t);
      };
      _onKeyDown = (t) => {
        if (!this._input)
          return;
        let e = this.getAttribute("mode") || "single";
        if (t.key === "ArrowDown") {
          if (t.preventDefault(), this._suggestions.length === 0)
            return;
          this._activeIndex = Math.min(this._activeIndex + 1, this._suggestions.length - 1), this._renderSuggestions();
        } else if (t.key === "ArrowUp") {
          if (t.preventDefault(), this._suggestions.length === 0)
            return;
          this._activeIndex = Math.max(this._activeIndex - 1, -1), this._renderSuggestions();
        } else if (t.key === "Enter") {
          t.preventDefault();
          let i = this._activeIndex >= 0 ? this._suggestions[this._activeIndex] : undefined;
          if (i)
            this._select(i.value);
          else {
            let r = this._input.value.trim();
            if (r)
              this._select(r);
          }
        } else if (t.key === "Escape")
          t.preventDefault(), this._hideSuggestions();
        else if (t.key === "Backspace" && this._input.value === "" && e === "multiple")
          this._removeLastTag();
        else if (t.key === "," && e === "multiple") {
          t.preventDefault();
          let i = this._input.value.trim();
          if (i)
            this._select(i);
        }
      };
      _select(t) {
        let e = this.getAttribute("mode") || "single", i = t.trim();
        if (!i || !this._input)
          return;
        if (e === "multiple") {
          if (!this._tags.includes(i))
            this._tags.push(i), this._announce(`${i} added`);
          this._input.value = "";
        } else
          this._tags = [i], this._input.value = i, this._announce(`${i} selected`);
        this._activeIndex = -1, this._update(), this._hideSuggestions();
      }
      _removeTagAt(t) {
        let e = this._tags[t];
        if (e === undefined)
          return;
        this._tags.splice(t, 1), this._announce(`${e} removed`), this._update(), this._input?.focus();
      }
      _removeLastTag() {
        if (this._tags.length === 0)
          return;
        this._removeTagAt(this._tags.length - 1);
      }
      _update() {
        this._renderTags(), this._internals.setFormValue(this.value), this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { value: this.value, tags: [...this._tags] } }));
      }
      _renderTags() {
        if (!this._display)
          return;
        let t = this.getAttribute("mode") || "single";
        if (this._display.innerHTML = "", t !== "multiple")
          return;
        this._tags.forEach((e, i) => {
          let r = document.createElement("p9r-tag");
          r.setAttribute("color", "primary"), r.setAttribute("part", "chip"), r.setAttribute("role", "listitem"), r.textContent = e, r.title = `Remove ${e}`, r.setAttribute("aria-label", `Remove ${e}`), r.addEventListener("click", () => this._removeTagAt(i)), this._display.appendChild(r);
        });
      }
      _refreshSuggestions(t) {
        let i = (this.getAttribute("mode") || "single") === "multiple" ? this._tags : [], r = this._allSuggestions.filter((a) => !i.includes(a.value));
        if (t === "")
          this._suggestions = r.slice(0, 8);
        else
          this._suggestions = r.filter((a) => a.value.toLowerCase().includes(t)).slice(0, 8);
        this._activeIndex = -1, this._renderSuggestions();
      }
      _renderSuggestions() {
        if (!this._suggestionsEl || !this._input)
          return;
        if (this._suggestions.length === 0) {
          this._hideSuggestions();
          return;
        }
        if (this._suggestionsEl.innerHTML = "", this._suggestions.forEach((t, e) => {
          let i = document.createElement("div");
          i.className = "suggestion", i.id = `${this._uid}-opt-${e}`, i.setAttribute("role", "option"), i.setAttribute("part", "option");
          let r = e === this._activeIndex;
          i.dataset.active = String(r), i.setAttribute("aria-selected", String(r));
          let a = document.createElement("span");
          a.className = "name", a.textContent = t.value, i.appendChild(a);
          let s = document.createElement("p9r-tag");
          s.setAttribute("color", "secondary"), s.setAttribute("part", "count"), s.textContent = String(t.count), i.appendChild(s), i.addEventListener("mousedown", (o) => {
            o.preventDefault(), this._select(t.value);
          }), this._suggestionsEl.appendChild(i);
        }), this._suggestionsEl.hidden = false, this._input.setAttribute("aria-expanded", "true"), this._activeIndex >= 0)
          this._input.setAttribute("aria-activedescendant", `${this._uid}-opt-${this._activeIndex}`);
        else
          this._input.removeAttribute("aria-activedescendant");
      }
      _hideSuggestions() {
        if (this._suggestionsEl)
          this._suggestionsEl.hidden = true;
        if (this._activeIndex = -1, this._input)
          this._input.setAttribute("aria-expanded", "false"), this._input.removeAttribute("aria-activedescendant");
      }
      _announce(t) {
        if (!this._liveRegion)
          return;
        this._liveRegion.textContent = "", window.setTimeout(() => {
          if (this._liveRegion)
            this._liveRegion.textContent = t;
        }, 10);
      }
      get value() {
        if ((this.getAttribute("mode") || "single") === "multiple")
          return this._tags.join(",");
        return this._tags[0] || "";
      }
      set value(t) {
        if ((this.getAttribute("mode") || "single") === "multiple") {
          if (this._tags = t ? t.split(",").map((i) => i.trim()).filter((i) => i !== "") : [], this._input)
            this._input.value = "";
        } else if (this._tags = t ? [t.trim()] : [], this._input)
          this._input.value = this._tags[0] || "";
        this._update();
      }
      get name() {
        return this.getAttribute("name") || "";
      }
      get placeholder() {
        return this.getAttribute("placeholder") || "";
      }
      set placeholder(t) {
        if (t)
          this.setAttribute("placeholder", t);
        else
          this.removeAttribute("placeholder");
      }
      get mode() {
        return this.getAttribute("mode") || "single";
      }
      set mode(t) {
        if (t)
          this.setAttribute("mode", t);
        else
          this.removeAttribute("mode");
      }
      get resource() {
        return this.getAttribute("resource") || "";
      }
      set resource(t) {
        if (t)
          this.setAttribute("resource", t);
        else
          this.removeAttribute("resource");
      }
      get api() {
        return this.getAttribute("api") || "";
      }
      set api(t) {
        if (t)
          this.setAttribute("api", t);
        else
          this.removeAttribute("api");
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      get tags() {
        return [...this._tags];
      }
    }
    if (!customElements.get("p9r-tag-suggest"))
      customElements.define("p9r-tag-suggest", x);
    var G = `<div class="actions" role="toolbar" part="toolbar">
    <slot></slot>
</div>
`;
    var J = `:host {
  display: inline-block;

  --_toolbar-bg: var(--bg-overlay, #ffffff);
  --_toolbar-border: var(--border-default, #e5e7eb);
  --_toolbar-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --_toolbar-radius: 12px;
  --_toolbar-padding: 6px;
  --_toolbar-gap: 4px;

  --_color: var(--info-contrasted, #3b82f6);
  --_hover-color: var(--primary-contrasted, #3b82f6);

  --_bg-color: var(--bg-overlay, white);
  --_bg-hover-color: var(--primary-muted, #3b82f6);

  --_border-color: var(--border-default, #e5e7eb);

  touch-action: none;
}

.actions {
  display: flex;
  align-items: center;
  background: var(--_toolbar-bg);
  border: 1px solid var(--_toolbar-border);
  border-radius: var(--_toolbar-radius);
  box-shadow: var(--_toolbar-shadow);
  overflow: hidden;
  width: fit-content;
  padding: var(--_toolbar-padding);
  gap: var(--_toolbar-gap);
}

:host([align="start"]) .actions { justify-content: flex-start; }
:host([align="center"]) .actions { justify-content: center; }
:host([align="end"]) .actions { justify-content: flex-end; }

:host([fullwidth]),
:host([fullwidth]) .actions {
  width: 100%;
}

::slotted([hidden]) {
  display: none !important;
}

::slotted([data-action]) {
  display: flex;
  align-items: center;
  padding: 10px;
  background: var(--_bg-color);
  border: none;
  border-radius: 8px;
  color: var(--_color);
  cursor: pointer;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  white-space: nowrap;
}

::slotted([data-action]:hover) {
  background-color: var(--_bg-hover-color);
  color: var(--_hover-color);
}

::slotted([data-action]:focus-visible) {
  outline: 2px solid var(--_color);
  outline-offset: 2px;
}

::slotted([data-action][disabled]),
::slotted([data-action][aria-disabled="true"]) {
  opacity: 0.4;
  pointer-events: none;
}

::slotted(.separator) {
  width: 1px;
  height: 1.7rem;
  background-color: var(--_border-color);
  margin: 0 4px;
  align-self: center;
}

@media (prefers-reduced-motion: no-preference) {
  ::slotted([data-action]) {
    transition: background-color 0.2s ease, color 0.2s ease;
  }
}
`;

    class y extends n {
      static _event = "action-click";
      _toolbar;
      constructor() {
        super({ css: J, template: G });
        this._toolbar = this.shadowRoot?.querySelector(".actions") ?? null;
      }
      static get observedAttributes() {
        return ["label"];
      }
      connectedCallback() {
        for (let t of ["label"])
          this._upgradeProperty(t);
        if (this._toolbar && !this._toolbar.hasAttribute("aria-label")) {
          let t = this.getAttribute("label");
          if (t)
            this._toolbar.setAttribute("aria-label", t);
        }
        this.addEventListener("click", this._handleClick);
      }
      disconnectedCallback() {
        this.removeEventListener("click", this._handleClick);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._toolbar)
          return;
        if (t === "label")
          if (i === null)
            this._toolbar.removeAttribute("aria-label");
          else
            this._toolbar.setAttribute("aria-label", i);
      }
      _handleClick = (t) => {
        let i = t.composedPath().find((a) => a instanceof Element && a.hasAttribute("data-action"));
        if (!i)
          return;
        t.stopPropagation();
        let r = i.getAttribute("data-action");
        this._dispatchAction(r, i, t);
      };
      _dispatchAction(t, e, i) {
        this.dispatchEvent(new CustomEvent("action-click", { detail: { action: t, originalEvent: i, target: e }, bubbles: true, composed: true }));
      }
      _upgradeProperty(t) {
        if (this.hasOwnProperty(t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      get label() {
        return this.getAttribute("label");
      }
      set label(t) {
        if (t === null)
          this.removeAttribute("label");
        else
          this.setAttribute("label", t);
      }
    }
    if (!customElements.get("p9r-horizontal-action-group"))
      customElements.define("p9r-horizontal-action-group", y);
    var Q = `<div class="app-container" part="container">
    <a class="skip-link" part="skip-link" href="#main-content">
        <slot name="skip-link">Skip to main content</slot>
    </a>

    <aside class="app-sidebar" part="sidebar" aria-label="Primary">
        <nav class="app-nav" part="nav" aria-label="Main navigation">
            <slot name="sidebar"></slot>
        </nav>
    </aside>

    <main id="main-content" class="app-content" part="content" tabindex="-1">
        <slot></slot>
    </main>
</div>
`;
    var U = `:host {
    display: block;
    height: 100vh;
    width: 100vw;
    overflow: hidden;

    --_sidebar-width: 260px;
    --_sidebar-collapsed-width: 0px;
    --_sidebar-bg: #f4f4f4;
    --_sidebar-border: #ddd;
    --_content-bg: #ffffff;
    --_content-padding: 2rem;
    --_focus-ring: var(--primary-base, #2563eb);
}

.app-container {
    display: flex;
    height: 100%;
    width: 100%;
}

.skip-link {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.5rem 1rem;
    background: var(--_content-bg);
    color: var(--_focus-ring);
    text-decoration: none;
    border: 2px solid var(--_focus-ring);
    border-radius: 4px;
    z-index: 1000;
    transform: translateY(-150%);
}

.skip-link:focus-visible {
    transform: translateY(0);
    outline: 2px solid var(--_focus-ring);
    outline-offset: 2px;
}

.app-sidebar {
    flex-shrink: 0;
    height: 100%;
    width: var(--_sidebar-width);
    background-color: var(--_sidebar-bg);
    border-right: 1px solid var(--_sidebar-border);
    overflow: hidden;
}

.app-nav {
    height: 100%;
    overflow-y: auto;
}

:host([collapsed]) .app-sidebar {
    width: var(--_sidebar-collapsed-width);
    border-right-width: 0;
}

.app-content {
    flex-grow: 1;
    height: 100%;
    overflow-y: auto;
    padding: var(--_content-padding);
    box-sizing: border-box;
    background-color: var(--_content-bg);
}

.app-content:focus-visible {
    outline: 2px solid var(--_focus-ring);
    outline-offset: -4px;
}

@media (prefers-reduced-motion: no-preference) {
    .app-sidebar {
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                    border-right-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .skip-link {
        transition: transform 0.2s ease-out;
    }
}
`;

    class k extends n {
      _sidebar;
      _content;
      constructor() {
        super({ css: U, template: Q });
        this._sidebar = this.shadowRoot?.querySelector(".app-sidebar") ?? null, this._content = this.shadowRoot?.querySelector(".app-content") ?? null;
      }
      static get observedAttributes() {
        return ["collapsed"];
      }
      connectedCallback() {
        for (let t of ["collapsed"])
          this._upgradeProperty(t);
        this._syncAriaState();
      }
      disconnectedCallback() {}
      _upgradeProperty(t) {
        if (this.hasOwnProperty(t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      attributeChangedCallback(t, e, i) {
        if (!this._sidebar)
          return;
        if (e === i)
          return;
        if (t === "collapsed")
          this._syncAriaState(), this.dispatchEvent(new CustomEvent("w13c-left-menu-collapse", { bubbles: true, composed: true, detail: { collapsed: i !== null } }));
      }
      _syncAriaState() {
        if (!this._sidebar)
          return;
        let t = this.hasAttribute("collapsed");
        this._sidebar.setAttribute("aria-expanded", String(!t)), this._sidebar.setAttribute("aria-hidden", String(t));
      }
      get collapsed() {
        return this.hasAttribute("collapsed");
      }
      set collapsed(t) {
        if (t)
          this.setAttribute("collapsed", "");
        else
          this.removeAttribute("collapsed");
      }
      toggle() {
        this.collapsed = !this.collapsed;
      }
      focusContent() {
        this._content?.focus();
      }
    }
    if (!customElements.get("w13c-left-menu-layout"))
      customElements.define("w13c-left-menu-layout", k);
    var W = `<a class="menu-item" part="item" tabindex="-1">
    <span class="icon-wrapper" part="icon">
        <slot name="icon"></slot>
    </span>
    <span class="label" part="label">
        <slot></slot>
    </span>
    <span class="badge" part="badge" id="badge-element"></span>
</a>
`;
    var tt = `:host {
    display: block;
    width: 100%;
    outline: none;
    --item-color: var(--secondary-base, oklch(50% 0.02 260));
    --item-color-active: var(--primary-base, oklch(60% 0.15 265));
    --item-bg-active: var(--primary-muted, oklch(95% 0.02 265));
    --item-contrasted: var(--primary-contrasted, oklch(98% 0.01 260));
    --icon-size: 20px;
}

.menu-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: var(--item-color);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
}

@media (prefers-reduced-motion: no-preference) {
    .menu-item {
        transition: background-color 0.2s ease, color 0.2s ease;
    }
}

.menu-item:hover {
    background-color: var(--item-bg-active);
    color: var(--item-color-active);
}

:host(:focus-visible) .menu-item {
    outline: 2px solid var(--item-color-active);
    outline-offset: 2px;
}

.menu-item.active {
    background-color: var(--item-bg-active);
    color: var(--item-color-active);
    font-weight: 600;
}

.menu-item.active::before {
    content: "";
    position: absolute;
    left: 0;
    width: 3px;
    height: 100%;
    background-color: var(--item-color-active);
    border-radius: 0 4px 4px 0;
}

.menu-item.active ::slotted(svg) {
    stroke: var(--item-color-active);
}

.icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--icon-size);
    height: var(--icon-size);
    flex-shrink: 0;
}

::slotted(svg), .icon-wrapper svg {
    width: 100% !important;
    height: 100% !important;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
}

.label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:host([disabled]) .menu-item {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.5;
    filter: grayscale(1);
    background: transparent !important;
}

.badge {
    display: none;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 20px;
    white-space: nowrap;
    flex-shrink: 0;
}

.menu-item:not(.active) .badge {
    background-color: var(--item-bg-active);
    color: var(--item-color-active);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--item-color-active), transparent 90%);
}

.menu-item.active .badge {
    background-color: var(--item-color-active);
    color: var(--item-contrasted);
    box-shadow: 0 2px 4px color-mix(in oklab, var(--item-color-active), transparent 80%);
}
`;

    class w extends n {
      _anchor;
      _badgeEl;
      constructor() {
        super({ css: tt, template: W });
        this._anchor = this.shadowRoot?.querySelector("a") ?? null, this._badgeEl = this.shadowRoot?.getElementById("badge-element") ?? null;
      }
      static get observedAttributes() {
        return ["href", "badge", "disabled"];
      }
      connectedCallback() {
        for (let t of ["href", "badge", "disabled"])
          this._upgradeProperty(t);
        if (!this.hasAttribute("role"))
          this.setAttribute("role", "listitem");
        if (!this.hasAttribute("tabindex"))
          this.setAttribute("tabindex", "0");
        this._updateHref(this.getAttribute("href")), this._updateBadge(this.getAttribute("badge")), this._checkActiveState(), window.addEventListener("popstate", this._checkActiveState), this.addEventListener("keydown", this._handleKeydown);
      }
      disconnectedCallback() {
        window.removeEventListener("popstate", this._checkActiveState), this.removeEventListener("keydown", this._handleKeydown);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._anchor)
          return;
        if (t === "href")
          this._updateHref(i);
        if (t === "badge")
          this._updateBadge(i);
        if (t === "disabled") {
          let r = this.hasAttribute("disabled");
          if (this.setAttribute("aria-disabled", r ? "true" : "false"), r)
            this.setAttribute("tabindex", "-1");
          else
            this.setAttribute("tabindex", "0");
        }
      }
      get href() {
        return this.getAttribute("href");
      }
      set href(t) {
        if (t == null)
          this.removeAttribute("href");
        else
          this.setAttribute("href", t);
      }
      get badge() {
        return this.getAttribute("badge");
      }
      set badge(t) {
        if (t == null)
          this.removeAttribute("badge");
        else
          this.setAttribute("badge", t);
      }
      get disabled() {
        return this.hasAttribute("disabled");
      }
      set disabled(t) {
        if (t)
          this.setAttribute("disabled", "");
        else
          this.removeAttribute("disabled");
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      _updateHref(t) {
        if (!this._anchor)
          return;
        if (t)
          this._anchor.setAttribute("href", t);
        else
          this._anchor.removeAttribute("href");
      }
      _updateBadge(t) {
        if (!this._badgeEl)
          return;
        if (t)
          this._badgeEl.textContent = t, this._badgeEl.style.display = "inline-flex";
        else
          this._badgeEl.textContent = "", this._badgeEl.style.display = "none";
      }
      _checkActiveState = () => {
        if (!this._anchor || !this.hasAttribute("href"))
          return;
        let t = this.getAttribute("href");
        if (!t)
          return;
        try {
          let e = new URL(t, window.location.href), r = new URL(window.location.href).pathname, a = e.pathname;
          if (a === "/" ? r === "/" : r === a || r.startsWith(a + "/"))
            this.setAttribute("active", ""), this.setAttribute("aria-current", "page"), this._anchor.classList.add("active");
          else
            this.removeAttribute("active"), this.removeAttribute("aria-current"), this._anchor.classList.remove("active");
        } catch {
          console.warn("Invalid href in LateralMenuItem:", t);
        }
      };
      _handleKeydown = (t) => {
        if (this.hasAttribute("disabled"))
          return;
        if (t.key !== "Enter" && t.key !== " ")
          return;
        if (t.target !== this)
          return;
        t.preventDefault(), this._anchor?.click();
      };
    }
    if (!customElements.get("w13c-lateral-menu-item"))
      customElements.define("w13c-lateral-menu-item", w);
    var et = `<aside class="sidebar" part="sidebar">
    <div class="sidebar-header" part="header">
        <slot name="header">
            <h3>Menu</h3>
        </slot>
    </div>

    <nav class="sidebar-nav" part="nav">
        <slot></slot>
    </nav>

    <div class="sidebar-footer" part="footer">
        <slot name="footer"></slot>
    </div>
</aside>
`;
    var it = `:host {
    display: flex;
    flex-direction: column;
    width: 260px;
    height: 100vh;
    background-color: #ffffff;
    border-right: 1px solid var(--secondary-muted);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

:host([collapsed]) {
    width: 72px;
}

.sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

@media (prefers-reduced-motion: no-preference) {
    :host {
        transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

.sidebar-header {
    padding: 2.5rem 1.5rem 1.5rem 1.5rem;
}

::slotted([slot="header"]) {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--secondary-contrasted);
    letter-spacing: -0.04em;
}

::slotted([slot="header"]) span {
    color: var(--primary-base);
}

::slotted([slot="header"])::after {
    content: "";
    width: 4px;
    height: 4px;
    margin-top: 8px;
    background-color: var(--primary-base);
    border-radius: 50%;
}

.sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 0.75rem;
}

.sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0.75rem;
    margin-top: auto;
    border-top: 1px solid var(--secondary-muted);
}

::slotted(w13c-lateral-menu-item) {
    --item-color: var(--secondary-base);
    --item-color-active: var(--primary-base);
    --item-bg-hover: var(--primary-muted);
}
`;

    class E extends n {
      _sidebar;
      _navSlot;
      constructor() {
        super({ css: it, template: et });
        this._sidebar = this.shadowRoot?.querySelector(".sidebar") ?? null, this._navSlot = this.shadowRoot?.querySelector("slot:not([name])") ?? null;
      }
      static get observedAttributes() {
        return ["collapsed"];
      }
      connectedCallback() {
        for (let t of ["collapsed"])
          this._upgradeProperty(t);
        if (!this.hasAttribute("aria-label"))
          this.setAttribute("aria-label", "Main navigation");
        this.addEventListener("keydown", this._handleKeydown);
      }
      disconnectedCallback() {
        this.removeEventListener("keydown", this._handleKeydown);
      }
      attributeChangedCallback(t, e, i) {
        if (!this._sidebar)
          return;
        if (t === "collapsed")
          this._sidebar.classList.toggle("collapsed", this.hasAttribute("collapsed"));
      }
      toggle() {
        this.collapsed = !this.collapsed;
      }
      get collapsed() {
        return this.hasAttribute("collapsed");
      }
      set collapsed(t) {
        if (t)
          this.setAttribute("collapsed", "");
        else
          this.removeAttribute("collapsed");
      }
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      _getItems() {
        if (!this._navSlot)
          return [];
        return this._navSlot.assignedElements({ flatten: true }).filter((t) => t instanceof HTMLElement && t.tagName.toLowerCase() === "w13c-lateral-menu-item" && !t.hasAttribute("disabled"));
      }
      _handleKeydown = (t) => {
        let e = this._getItems();
        if (e.length === 0)
          return;
        let i = document.activeElement, r = e.findIndex((o) => o === i || o.contains(i)), a = -1;
        switch (t.key) {
          case "ArrowDown":
            a = r < 0 ? 0 : (r + 1) % e.length;
            break;
          case "ArrowUp":
            a = r < 0 ? e.length - 1 : (r - 1 + e.length) % e.length;
            break;
          case "Home":
            a = 0;
            break;
          case "End":
            a = e.length - 1;
            break;
          default:
            return;
        }
        t.preventDefault();
        let s = e[a];
        if (s)
          s.focus();
      };
    }
    if (!customElements.get("w13c-lateral-menu"))
      customElements.define("w13c-lateral-menu", E);
    var rt = `<div class="table-container">
  <div class="p9r-table">
    <slot name="header"></slot>
    <slot></slot>
  </div>
</div>`;
    var at = `:host {
  display: block;
  width: 100%;
}

.table-container {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  overflow: hidden;
}

.p9r-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
}

/* Le reste ne bouge pas : le header et les hover */
::slotted(p9r-row[slot="header"]) {
  background-color: var(--_header-bg);
  color: var(--text-main);
  font-weight: 600;
}

::slotted(p9r-row:not(:last-child)) {
  border-bottom: 1px solid var(--border-default);
}

::slotted(p9r-row:not(:first-child):hover) {
  background-color: var(--bg-base);
}`;
    var nt = `<slot></slot>
`;
    var st = `:host {
  display: table-row;
}

:host([href]) {
  cursor: pointer;
}

:host(:focus-visible) {
  outline: 2px inset var(--primary-base);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: no-preference) {
  :host {
    transition: background-color 0.15s ease;
  }
}
`;

    class A extends n {
      static get observedAttributes() {
        return ["href"];
      }
      constructor() {
        super({ css: st, template: nt });
      }
      connectedCallback() {
        for (let t of ["href", "target"])
          this._upgradeProperty(t);
        this.addEventListener("click", this._handleClick), this.addEventListener("keydown", this._handleKeydown), this._syncLinkA11y();
      }
      disconnectedCallback() {
        this.removeEventListener("click", this._handleClick), this.removeEventListener("keydown", this._handleKeydown);
      }
      attributeChangedCallback(t, e, i) {
        if (t === "href")
          this._syncLinkA11y();
      }
      _syncLinkA11y() {
        if (this.hasAttribute("href")) {
          if (!this.hasAttribute("tabindex"))
            this.setAttribute("tabindex", "0");
          if (!this.hasAttribute("role"))
            this.setAttribute("role", "link");
        } else {
          if (this.getAttribute("role") === "link")
            this.removeAttribute("role");
          if (this.getAttribute("tabindex") === "0")
            this.removeAttribute("tabindex");
          if (!this.hasAttribute("role"))
            this.setAttribute("role", "row");
        }
      }
      _navigate() {
        let t = this.getAttribute("href");
        if (!t)
          return;
        let e = this.getAttribute("target"), r = new CustomEvent("p9r-row-click", { detail: { href: t, target: e }, bubbles: true, composed: true, cancelable: true });
        if (!this.dispatchEvent(r))
          return;
        if (e === "_blank")
          window.open(t, "_blank", "noopener,noreferrer");
        else
          window.location.href = t;
      }
      _handleClick = (t) => {
        if (!this.hasAttribute("href"))
          return;
        this._navigate();
      };
      _handleKeydown = (t) => {
        if (!this.hasAttribute("href"))
          return;
        if (t.key === "Enter" || t.key === " ")
          t.preventDefault(), this._navigate();
      };
      _upgradeProperty(t) {
        if (Object.prototype.hasOwnProperty.call(this, t)) {
          let e = this[t];
          delete this[t], this[t] = e;
        }
      }
      get href() {
        return this.getAttribute("href");
      }
      set href(t) {
        if (t === null)
          this.removeAttribute("href");
        else
          this.setAttribute("href", t);
      }
      get target() {
        return this.getAttribute("target");
      }
      set target(t) {
        if (t === null)
          this.removeAttribute("target");
        else
          this.setAttribute("target", t);
      }
    }
    if (!customElements.get("p9r-row"))
      customElements.define("p9r-row", A);
    var ot = `<slot></slot>
`;
    var lt = `:host {
  display: table-cell;
  padding: 12px 20px;
  vertical-align: middle;
  color: var(--text-body);
  font-size: 14px;
}

:host([variant="success"]) {
  color: var(--success-base);
}

:host([variant="danger"]) {
  color: var(--danger-base);
}

:host([variant="info"]) {
  color: var(--info-base);
}

:host([variant="primary"]) {
  color: var(--primary-base);
}
`;

    class C extends n {
      constructor() {
        super({ css: lt, template: ot });
      }
      connectedCallback() {
        if (!this.hasAttribute("role"))
          this.setAttribute("role", "cell");
      }
    }
    if (!customElements.get("p9r-cell"))
      customElements.define("p9r-cell", C);

    class L extends HTMLElement {
      static get observedAttributes() {
        return ["sort", "direction", "active", "filter-name", "filter-type"];
      }
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        this.addEventListener("click", this.handleSort), this.render();
      }
      handleSort = (t) => {
        if (t.composedPath().some((o) => o instanceof HTMLInputElement))
          return;
        let e = this.getAttribute("sort");
        if (!e)
          return;
        let i = new URL(window.location.href), r = i.searchParams.get("sort"), a = i.searchParams.get("direction"), s = r === e && a === "asc" ? "desc" : "asc";
        i.searchParams.set("sort", e), i.searchParams.set("direction", s), window.location.href = i.toString();
      };
      render() {
        let t = this.getAttribute("filter-name"), i = new URL(window.location.href).searchParams.get(`f_${t}`) || "", r = i.length > 0;
        if (this.shadowRoot)
          this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: table-cell;
                    padding: 12px 20px;
                    border-bottom: 2px solid var(--border-light);
                    position: relative; /* For popover positioning */
                }
                .header-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .label-section {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .filter-trigger {
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background 0.2s;
                    color: ${r ? "var(--primary-base, #007bff)" : "#ccc"};
                }
                .filter-trigger:hover { background: #eee; }

                /* Filter popover */
                .filter-popover {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    z-index: 10;
                    background: white;
                    border: 1px solid #ddd;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    padding: 10px;
                    border-radius: 6px;
                    min-width: 150px;
                }
                .filter-popover.open { display: block; }
                
                input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 13px;
                }
            </style>
            
            <div class="header-wrapper">
                <div class="label-section" id="sort-trigger">
                    <slot></slot>
                    <span class="sort-icon">...</span>
                </div>

                ${t ? `
                    <div class="filter-trigger" id="filter-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </div>
                    <div class="filter-popover" id="filter-popover">
                        <input type="text" placeholder="Filter..." value="${i}" id="filter-input">
                    </div>
                ` : ""}
            </div>
        `, this.setupEvents();
      }
      setupEvents() {
        let t = this.shadowRoot?.querySelector("#filter-btn"), e = this.shadowRoot?.querySelector("#filter-popover"), i = this.shadowRoot?.querySelector("#filter-input"), r = this.shadowRoot?.querySelector("#sort-trigger");
        t?.addEventListener("click", (a) => {
          if (a.stopPropagation(), e?.classList.toggle("open"), e?.classList.contains("open"))
            i?.focus();
        }), window.addEventListener("click", () => e?.classList.remove("open")), e?.addEventListener("click", (a) => a.stopPropagation()), r?.addEventListener("click", (a) => this.handleSort(a)), i?.addEventListener("keydown", (a) => {
          if (a.key === "Enter")
            this.applyFilter(i.value);
        });
      }
      applyFilter(t) {
        let e = this.getAttribute("filter-name"), i = new URL(window.location.href);
        if (t)
          i.searchParams.set(`f_${e}`, t);
        else
          i.searchParams.delete(`f_${e}`);
        window.location.href = i.toString();
      }
    }
    if (!customElements.get("p9r-header-cell"))
      customElements.define("p9r-header-cell", L);

    class z extends n {
      constructor() {
        super({ css: at, template: rt });
      }
    }
    if (!customElements.get("p9r-table"))
      customElements.define("p9r-table", z);
    var dt = `<div class="icon" part="icon"></div>
<div class="content">
    <span class="message"><slot></slot></span>
</div>
<button class="close" aria-label="Dismiss">&times;</button>
`;
    var ct = `:host {
    --_bg: var(--bg-surface, #ffffff);
    --_color: var(--text-main, #1f2937);
    --_border: var(--border-default, #e5e7eb);
    --_accent: var(--info-base, #3b82f6);

    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 280px;
    max-width: 420px;
    padding: 12px 14px;
    background: var(--_bg);
    color: var(--_color);
    border: 1px solid var(--_border);
    border-left: 4px solid var(--_accent);
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 4px 10px -3px rgba(0, 0, 0, 0.08);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.4;

    animation: toast-in 180ms ease-out;
}

:host([leaving]) {
    animation: toast-out 160ms ease-in forwards;
}

:host([type="success"]) {
    --_accent: var(--success-base, #10b981);
}

:host([type="error"]) {
    --_accent: var(--danger-base, #ef4444);
}

:host([type="warning"]) {
    --_accent: var(--warning-base, #f59e0b);
}

:host([type="info"]) {
    --_accent: var(--info-base, #3b82f6);
}

.icon {
    flex: 0 0 20px;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: var(--_accent);
    position: relative;
    margin-top: 1px;
}

.icon::before {
    content: "";
    position: absolute;
    inset: 0;
    display: block;
    background: no-repeat center / 12px 12px;
}

:host([type="success"]) .icon::before {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>');
}

:host([type="error"]) .icon::before,
:host([type="warning"]) .icon::before {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>');
}

:host([type="info"]) .icon::before {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>');
}

.content {
    flex: 1;
    min-width: 0;
    padding-top: 1px;
}

.message {
    display: block;
    word-wrap: break-word;
}

.close {
    flex: 0 0 auto;
    background: transparent;
    border: none;
    color: var(--_color);
    opacity: 0.5;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    padding: 0 4px;
    margin-top: -2px;
}

.close:hover {
    opacity: 1;
}

@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes toast-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(-20px);
    }
}
`;

    class M extends n {
      _timer = null;
      constructor() {
        super({ css: ct, template: dt });
      }
      connectedCallback() {
        this.shadowRoot?.querySelector(".close")?.addEventListener("click", () => this.dismiss());
        let e = Number(this.getAttribute("duration") ?? 3500);
        if (e > 0)
          this._timer = setTimeout(() => this.dismiss(), e);
      }
      disconnectedCallback() {
        if (this._timer)
          clearTimeout(this._timer);
      }
      dismiss() {
        if (this.hasAttribute("leaving"))
          return;
        if (this.setAttribute("leaving", ""), this._timer)
          clearTimeout(this._timer);
        this.addEventListener("animationend", () => {
          this.dispatchEvent(new CustomEvent("toast-dismissed", { bubbles: true })), this.remove();
        }, { once: true });
      }
    }
    if (!customElements.get("p9r-toast"))
      customElements.define("p9r-toast", M);
    var ut = `<slot></slot>
`;
    var ht = `:host {
    position: fixed;
    top: 24px;
    left: 24px;
    right: auto;
    bottom: auto;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
    width: auto;
    height: auto;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
}

:host(:popover-open) {
    display: flex;
}

:host([position="top-right"]) {
    top: 24px;
    right: 24px;
    left: auto;
}

:host([position="bottom-right"]) {
    bottom: 24px;
    right: 24px;
    top: auto;
    left: auto;
    flex-direction: column-reverse;
}

:host([position="bottom-left"]) {
    bottom: 24px;
    left: 24px;
    top: auto;
    flex-direction: column-reverse;
}

::slotted(p9r-toast) {
    pointer-events: auto;
}
`;

    class q extends n {
      constructor() {
        super({ css: ht, template: ut });
      }
      connectedCallback() {
        if (!this.hasAttribute("popover"))
          this.setAttribute("popover", "manual");
        try {
          this.showPopover?.();
        } catch {}
      }
      push(t, e = {}) {
        let i = document.createElement("p9r-toast");
        if (i.setAttribute("type", e.type ?? "info"), e.duration !== undefined)
          i.setAttribute("duration", String(e.duration));
        return i.textContent = t, this.appendChild(i), i;
      }
    }
    if (!customElements.get("p9r-toast-stack"))
      customElements.define("p9r-toast-stack", q);
  })();

  // src/control/components/admin/AdminLayout/template.html
  var template_default = `<w13c-left-menu-layout>

    <w13c-lateral-menu slot="sidebar">
        <h2 slot="header">Page Builder</h2>

        <w13c-lateral-menu-item href="./media">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
            </svg>
            Media
        </w13c-lateral-menu-item>

        <w13c-lateral-menu-item href="./pages">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
            </svg>
            Pages
        </w13c-lateral-menu-item>
        <w13c-lateral-menu-item href="./snippets">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
            </svg>
            Snippets
        </w13c-lateral-menu-item>
        <w13c-lateral-menu-item href="./templates">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
            </svg>
            Templates
        </w13c-lateral-menu-item>

        <w13c-lateral-menu-item disabled href="./analytics" badge="upcoming">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analytics
        </w13c-lateral-menu-item>

        <w13c-lateral-menu-item disabled href="./components" badge="upcoming">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 3H3v7h7V3Z" />
                <path d="M21 3h-7v7h7V3Z" />
                <path d="M10 14H3v7h7v-7Z" />
                <path d="M21 14h-7v7h7v-7Z" />
            </svg>
            Blocks
        </w13c-lateral-menu-item>



        <w13c-lateral-menu-item disabled href="./components" badge="upcoming">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path
                    d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.75-.13 2.5-.35 1.1-.33 1.5-1.65.9-2.65-.6-1-1.4-1.5-1.4-2.5 0-1.1.9-2 2-2h4c1.1 0 2-.9 2-2 0-5.5-4.5-10-10-10Z" />
            </svg>
            Theme
        </w13c-lateral-menu-item>


        <w13c-lateral-menu-item href="./settings" slot="footer">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path
                    d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
        </w13c-lateral-menu-item>

        <w13c-lateral-menu-item data-role="profil" href="./profil" slot="footer">
            <svg slot="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
            Profil
        </w13c-lateral-menu-item>
    </w13c-lateral-menu>

    <div>

        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
            <h1 style="margin: 0; line-height: 1;">
                <slot name="title"></slot>
            </h1>

            <div style="display: flex; align-items: center; gap: 0.75rem;padding-top: 4px">
                <slot name="action"></slot>
            </div>
        </div>
        <slot></slot>

    </div>

</w13c-left-menu-layout>`;

  // src/control/components/admin/AdminLayout/AdminLayout.ts
  class FixedAdminLayout extends Component {
    constructor() {
      super({
        css: "",
        template: template_default
      });
    }
  }
  customElements.define("w13c-fixed-admin-layout", FixedAdminLayout);

  // src/control/components/editor/componentSync/PageLink/PageLink.css
  var PageLink_default = `:host {
    display: block;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
}

.label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #94a3b8);
}

.input-row {
    display: flex;
    gap: 4px;
}

/* ── Trigger ── */

.trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    padding: 7px 10px;
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 8px;
    background: var(--bg-surface, #fff);
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
}

.trigger:hover {
    border-color: var(--text-muted, #94a3b8);
}

.trigger:focus-visible {
    border-color: var(--primary-base, #4361ee);
    box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
}

.trigger.open {
    border-color: var(--primary-base, #4361ee);
}

.trigger.has-value {
    border-color: var(--primary-base, #4361ee);
    background: var(--primary-muted, rgb(67 97 238 / 0.06));
}

.link-icon {
    flex-shrink: 0;
    color: var(--text-muted, #94a3b8);
}

.trigger.has-value .link-icon {
    color: var(--primary-base, #4361ee);
}

.value {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-main, #1e293b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chevron {
    flex-shrink: 0;
    color: var(--text-muted, #94a3b8);
    transition: transform 0.2s ease;
}

.trigger.open .chevron {
    transform: rotate(180deg);
    color: var(--primary-base, #4361ee);
}

/* ── Clear button ── */

.clear-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 32px;
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 8px;
    background: var(--bg-surface, #fff);
    color: var(--text-muted, #94a3b8);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    flex-shrink: 0;
}

.clear-btn:hover {
    color: var(--danger-base, #ef4444);
    border-color: var(--danger-base, #ef4444);
    background: color-mix(in srgb, var(--danger-base, #ef4444) 6%, transparent);
}

/* ── Panel ── */

.panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--bg-surface, #fff);
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 8px;
    box-shadow: 0 8px 20px rgb(0 0 0 / 0.08);
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition: opacity 0.15s, visibility 0.15s, transform 0.15s;
    overflow: hidden;
}

.panel.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* ── Tabs ── */

.tabs {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid var(--border-default, #e2e8f0);
    background: var(--bg-base, #f8fafc);
}

.tab {
    padding: 8px 10px;
    border: none;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted, #94a3b8);
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, background 0.15s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}

.tab:hover {
    color: var(--text-main, #1e293b);
}

.tab.active {
    color: var(--primary-base, #4361ee);
    border-bottom-color: var(--primary-base, #4361ee);
    background: var(--bg-surface, #fff);
}

/* ── External input ── */

.external-section {
    padding: 8px;
}

.external-input {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 6px;
    background: var(--bg-base, #f8fafc);
    font-size: 12px;
    font-family: inherit;
    color: var(--text-main, #1e293b);
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}

.external-input:focus {
    border-color: var(--primary-base, #4361ee);
}

.external-input::placeholder {
    color: var(--text-muted, #94a3b8);
}

/* ── Media section ── */

.media-section {
    padding: 8px;
}

.media-pick-btn {
    width: 100%;
    padding: 8px 10px;
    border: 1px dashed var(--border-default, #e2e8f0);
    border-radius: 6px;
    background: var(--bg-base, #f8fafc);
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    color: var(--text-main, #1e293b);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.media-pick-btn:hover {
    border-color: var(--primary-base, #4361ee);
    color: var(--primary-base, #4361ee);
    background: var(--primary-muted, rgb(67 97 238 / 0.06));
}

.media-current {
    display: none;
    margin-top: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    background: var(--primary-muted, rgb(67 97 238 / 0.08));
    font-size: 11px;
    color: var(--text-main, #1e293b);
    word-break: break-all;
    font-family: monospace;
}

.media-current.has-value {
    display: block;
}

/* ── Search ── */

.search-wrap {
    padding: 6px 6px 2px;
}

.search {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 6px;
    background: var(--bg-base, #f8fafc);
    font-size: 11px;
    font-family: inherit;
    color: var(--text-main, #1e293b);
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
}

.search:focus {
    border-color: var(--primary-base, #4361ee);
}

.search::placeholder {
    color: var(--text-muted, #94a3b8);
}

/* ── List ── */

.list {
    list-style: none;
    margin: 0;
    padding: 4px;
    max-height: 200px;
    overflow-y: auto;
}

.empty {
    display: none;
    padding: 12px;
    text-align: center;
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
}

/* ── Option ── */

.option {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.1s;
}

.option:hover {
    background: var(--bg-base, #f1f5f9);
}

.option.selected {
    background: var(--primary-muted, rgb(67 97 238 / 0.1));
}

.option-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-main, #1e293b);
}

.option.selected .option-title {
    color: var(--primary-base, #4361ee);
}

.option-path {
    font-size: 10px;
    color: var(--text-muted, #94a3b8);
    font-family: monospace;
}
`;

  // src/control/components/editor/componentSync/PageLink/PageLink.picker.ts
  function filterPages(pages, query) {
    const q = query.toLowerCase();
    return pages.filter((p) => p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q));
  }
  function buildOptionList(listEl, emptyEl, pages, onSelect) {
    listEl.innerHTML = "";
    if (pages.length === 0) {
      emptyEl.style.display = "block";
      return [];
    }
    emptyEl.style.display = "none";
    const options = [];
    for (const page of pages) {
      const li = document.createElement("li");
      li.className = "option";
      li.dataset.value = page.path;
      const title = document.createElement("span");
      title.className = "option-title";
      title.textContent = page.title;
      const path = document.createElement("span");
      path.className = "option-path";
      path.textContent = page.path;
      li.append(title, path);
      li.addEventListener("click", () => onSelect(page));
      listEl.appendChild(li);
      options.push(li);
    }
    return options;
  }

  // src/control/core/editorSystem/runtime/editorManagerReady.ts
  var EDITOR_MANAGER_READY_EVENT = "p9r:editor-manager-ready";
  function whenEditorManagerReady(callback) {
    if (document.EditorManager) {
      callback();
      return;
    }
    document.addEventListener(EDITOR_MANAGER_READY_EVENT, () => callback(), { once: true });
  }

  // src/control/components/editor/componentSync/PageLink/PageLink.ts
  class PageLink extends HTMLElement {
    _trigger = null;
    _display = null;
    _list = null;
    _empty = null;
    _panel = null;
    _clearBtn = null;
    _pageSection = null;
    _externalSection = null;
    _mediaSection = null;
    _externalInput = null;
    _mediaPickBtn = null;
    _mediaCurrent = null;
    _tabPage = null;
    _tabExternal = null;
    _tabMedia = null;
    _options = [];
    _pages = [];
    _isOpen = false;
    _value = "";
    _mode = "page";
    _onWindowClick = (e) => {
      if (this._isOpen && !this.contains(e.target))
        this._close();
    };
    _onTriggerClick = (e) => {
      e.stopPropagation();
      this._isOpen ? this._close() : this._open();
    };
    _onTriggerKeyDown = (e) => {
      if (e.key === "Escape")
        this._close();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._isOpen ? this._close() : this._open();
      }
    };
    _pagesFetched = false;
    constructor() {
      super();
      this._buildShadow();
    }
    connectedCallback() {
      if (!this._pagesFetched) {
        this._pagesFetched = true;
        whenEditorManagerReady(() => this._fetchPages());
      }
      this._trigger.addEventListener("click", this._onTriggerClick);
      this._trigger.addEventListener("keydown", this._onTriggerKeyDown);
      window.addEventListener("click", this._onWindowClick);
    }
    disconnectedCallback() {
      this._trigger?.removeEventListener("click", this._onTriggerClick);
      this._trigger?.removeEventListener("keydown", this._onTriggerKeyDown);
      window.removeEventListener("click", this._onWindowClick);
    }
    _buildShadow() {
      const label = this.getAttribute("label");
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
            <style>${PageLink_default}</style>
            <div class="field">
                ${label ? `<span class="label">${label}</span>` : ""}
                <div class="input-row">
                    <button class="trigger" type="button" tabindex="0">
                        <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span class="value">No link</span>
                        <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </button>
                    <button class="clear-btn" type="button" title="Remove link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="panel">
                    <div class="tabs">
                        <button type="button" class="tab tab-page" data-mode="page">Page</button>
                        <button type="button" class="tab tab-external" data-mode="external">External URL</button>
                        <button type="button" class="tab tab-media" data-mode="media">Media</button>
                    </div>
                    <div class="page-section">
                        <div class="search-wrap">
                            <input class="search" type="text" placeholder="Search for a page...">
                        </div>
                        <ul class="list"></ul>
                        <div class="empty">No pages found</div>
                    </div>
                    <div class="external-section">
                        <input class="external-input" type="url" placeholder="https://example.com" spellcheck="false">
                    </div>
                    <div class="media-section">
                        <button type="button" class="media-pick-btn">Choose a media file…</button>
                        <div class="media-current"></div>
                    </div>
                </div>
            </div>
            <div hidden><slot></slot></div>
        `;
      this._trigger = shadow.querySelector(".trigger");
      this._display = shadow.querySelector(".value");
      this._list = shadow.querySelector(".list");
      this._panel = shadow.querySelector(".panel");
      this._empty = shadow.querySelector(".empty");
      this._clearBtn = shadow.querySelector(".clear-btn");
      this._pageSection = shadow.querySelector(".page-section");
      this._externalSection = shadow.querySelector(".external-section");
      this._mediaSection = shadow.querySelector(".media-section");
      this._externalInput = shadow.querySelector(".external-input");
      this._mediaPickBtn = shadow.querySelector(".media-pick-btn");
      this._mediaCurrent = shadow.querySelector(".media-current");
      this._tabPage = shadow.querySelector(".tab-page");
      this._tabExternal = shadow.querySelector(".tab-external");
      this._tabMedia = shadow.querySelector(".tab-media");
      const searchInput = shadow.querySelector(".search");
      searchInput.addEventListener("input", () => this._refreshOptions(filterPages(this._pages, searchInput.value)));
      this._clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._select("", "No link");
      });
      this._tabPage.addEventListener("click", (e) => {
        e.stopPropagation();
        this._setMode("page");
      });
      this._tabExternal.addEventListener("click", (e) => {
        e.stopPropagation();
        this._setMode("external");
      });
      this._tabMedia.addEventListener("click", (e) => {
        e.stopPropagation();
        this._setMode("media");
      });
      this._externalInput.addEventListener("input", () => {
        const url = this._externalInput.value.trim();
        this._setValue(url, url || "No link");
        this.dispatchEvent(new Event("change", { bubbles: true }));
      });
      this._externalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this._close();
        }
        if (e.key === "Escape")
          this._close();
      });
      this._mediaPickBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._openMediaCenter();
      });
      this._applyMode();
    }
    _isExternal(v) {
      return /^(https?:|mailto:|tel:|\/\/)/i.test(v);
    }
    _isMedia(v) {
      return /(^|\/)media\?id=/.test(v);
    }
    _setMode(mode) {
      this._mode = mode;
      this._applyMode();
      if (mode === "external")
        requestAnimationFrame(() => this._externalInput.focus());
    }
    _applyMode() {
      if (!this._pageSection)
        return;
      this._pageSection.style.display = this._mode === "page" ? "" : "none";
      this._externalSection.style.display = this._mode === "external" ? "" : "none";
      this._mediaSection.style.display = this._mode === "media" ? "" : "none";
      this._tabPage.classList.toggle("active", this._mode === "page");
      this._tabExternal.classList.toggle("active", this._mode === "external");
      this._tabMedia.classList.toggle("active", this._mode === "media");
    }
    _openMediaCenter() {
      const mediaCenter = document.EditorManager?.getMediaCenter();
      if (!mediaCenter)
        return;
      const handler = (e) => {
        mediaCenter.removeEventListener("select-item", handler);
        const src = e.detail?.src;
        if (!src)
          return;
        this._setValue(src, this._mediaLabel(src));
        this.dispatchEvent(new Event("change", { bubbles: true }));
      };
      mediaCenter.addEventListener("select-item", handler);
      mediaCenter.show(["folder", "image", "other"]);
    }
    _mediaLabel(src) {
      const m = src.match(/id=([^&]+)/);
      return m ? `Media ${m[1]}` : src;
    }
    async _fetchPages() {
      try {
        const res = await fetch(new URL("pages", document.EditorManager.getApiBasePath()));
        this._pages = await res.json();
        this._refreshOptions(this._pages);
        const currentValue = this.getAttribute("value") || "";
        if (currentValue) {
          if (this._isMedia(currentValue)) {
            this._mode = "media";
            this._setValue(currentValue, this._mediaLabel(currentValue));
          } else if (this._isExternal(currentValue)) {
            this._mode = "external";
            this._externalInput.value = currentValue;
            this._setValue(currentValue, currentValue);
          } else {
            const match = this._pages.find((p) => p.path === currentValue);
            if (match)
              this._setValue(match.path, match.title);
          }
          this._applyMode();
        }
      } catch (e) {
        console.warn("P9rLink: failed to fetch pages", e);
      }
    }
    _refreshOptions(pages) {
      this._options = buildOptionList(this._list, this._empty, pages, (page) => this._select(page.path, page.title));
      this._options.forEach((li) => {
        li.classList.toggle("selected", li.dataset.value === this._value);
      });
    }
    _select(value, label) {
      this._setValue(value, label);
      this._close();
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
    _setValue(value, label) {
      this._value = value;
      this._display.textContent = value ? label : "No link";
      this._trigger.classList.toggle("has-value", !!value);
      this._clearBtn.style.display = value ? "flex" : "none";
      this._options.forEach((li) => {
        li.classList.toggle("selected", li.dataset.value === value);
      });
      if (this._mediaCurrent) {
        const isMediaValue = this._isMedia(value);
        this._mediaCurrent.textContent = isMediaValue ? value : "";
        this._mediaCurrent.classList.toggle("has-value", isMediaValue);
      }
    }
    _open() {
      document.querySelectorAll("p9r-link, p9r-select").forEach((el) => {
        if (el !== this && "_close" in el)
          el._close();
      });
      this._isOpen = true;
      this._panel.classList.add("open");
      this._trigger.classList.add("open");
      const searchInput = this.shadowRoot.querySelector(".search");
      searchInput.value = "";
      this._refreshOptions(this._pages);
      requestAnimationFrame(() => {
        if (this._mode === "page")
          searchInput.focus();
        else if (this._mode === "external")
          this._externalInput.focus();
      });
    }
    _close() {
      this._isOpen = false;
      this._panel.classList.remove("open");
      this._trigger.classList.remove("open");
    }
    get value() {
      return this._value;
    }
    set value(v) {
      if (this._isMedia(v)) {
        this._mode = "media";
        this._setValue(v, this._mediaLabel(v));
      } else if (this._isExternal(v)) {
        this._mode = "external";
        if (this._externalInput)
          this._externalInput.value = v;
        this._setValue(v, v);
      } else {
        this._mode = "page";
        const match = this._pages.find((p) => p.path === v);
        if (match)
          this._setValue(match.path, match.title);
        else
          this._setValue(v, v || "No link");
      }
      this._applyMode();
    }
    get name() {
      return this.getAttribute("name");
    }
  }
  if (!customElements.get("p9r-link")) {
    customElements.define("p9r-link", PageLink);
  }

  // src/control/components/editor/componentSync/sync/AttrSync.ts
  class AttrSync extends HTMLElement {
    _component = null;
    _prepared = false;
    connectedCallback() {
      const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (componentIdentifier && !this._component) {
        this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
      }
      requestAnimationFrame(() => {
        if (!this._prepared)
          this._sync();
        this.addEventListener("change", (e) => this.onChange(e));
      });
    }
    prepare(component) {
      this._component = component;
      this._sync();
      this._prepared = true;
    }
    onChange(event) {
      const target = event.target;
      if (target && target.name) {
        if (target.value === "" || target.value == null) {
          this._component?.removeAttribute(target.name);
        } else {
          this._component?.setAttribute(target.name, target.value);
        }
      }
    }
    _sync() {
      const inputs = Array.from(this.querySelectorAll("[name]"));
      inputs.forEach((input) => {
        const val = this._component?.getAttribute(input.name);
        if (val) {
          input.value = val;
        } else {
          if (input.value) {
            this._component?.setAttribute(input.name, input.value);
          }
        }
      });
    }
  }
  if (!customElements.get("p9r-attr-sync")) {
    customElements.define("p9r-attr-sync", AttrSync);
  }

  // src/control/components/editor/componentSync/sync/CompSync.ts
  class CompSync extends HTMLElement {
    _component = null;
    _root;
    _listEl;
    _titleEl;
    _countEl;
    _addBtn;
    _prepared = false;
    constructor() {
      super();
      this._root = this.attachShadow({ mode: "open" });
      this._root.innerHTML = `
            <style>${CompSync._css}</style>
            <div class="panel">
                <div class="header">
                    <span class="title"></span>
                    <span class="count"></span>
                </div>
                <ul class="items"></ul>
                <button class="add" type="button" hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <span>Add</span>
                </button>
            </div>
        `;
      this._listEl = this._root.querySelector(".items");
      this._titleEl = this._root.querySelector(".title");
      this._countEl = this._root.querySelector(".count");
      this._addBtn = this._root.querySelector(".add");
      this._addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._add();
      });
    }
    connectedCallback() {
      const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (componentIdentifier && !this._component) {
        this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
      }
      requestAnimationFrame(() => {
        if (!this._prepared) {
          this._sync();
          console.debug(this._component);
          this._component?.connectedCallback();
        }
        this.init();
      });
    }
    prepare(component) {
      this._component = component;
      this._sync();
      this._component?.connectedCallback();
      this.init();
      this._prepared = true;
    }
    _sync() {
      const child = this.firstElementChild;
      if (!child) {
        throw new Error("p9r-comp-sync require a child");
      }
      const slotName = child.getAttribute("slot");
      const selector = slotName ? `[slot="${slotName}"]` : ":not([slot])";
      if (!this._component?.querySelector(selector)) {
        if (!this.isCreating && this.optionnal)
          return;
        const toAppend = child.cloneNode(true);
        toAppend.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        this._component?.append(toAppend);
      }
    }
    init(opts) {
      const child = this.firstElementChild;
      const slotName = child?.getAttribute("slot");
      if (!child) {
        throw new Error("p9r-comp-sync require a child with attribute 'slot'");
      }
      const selector = slotName ? `:scope > [slot="${slotName}"]` : `:scope > :not([slot])`;
      let slots = Array.from(this._component?.querySelectorAll(selector));
      if (opts?.removed) {
        if (this.isConnected) {
          this._removePanelItem(opts.removed);
          this._updatePanelCount(slots.length);
          this._refreshAddBtn(slots.length);
        }
        if (this.isMultiple && slots.length === this.min) {
          slots.forEach((slot) => {
            if (!this.optionnal) {
              slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
            }
            slot.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
            const id = slot.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
            if (id)
              document.compIdentifierToEditor.get(id)?.viewEditor();
          });
        }
        return;
      }
      const addedNode = opts?.added;
      const toProcess = addedNode && slots.includes(addedNode) ? [addedNode] : slots;
      toProcess.forEach((slot) => {
        const slotEditor = document.compIdentifierToEditor.get(slot.getAttribute(p9r.attr.EDITOR.IDENTIFIER));
        slot.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
        slot.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
        slot.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
        slot.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
        if (this.disableOthersComponents) {
          slot.setAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT, "true");
        } else {
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT);
        }
        if (this.optionnal) {
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
        } else {
          slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
        }
        slot.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER));
        if (this.isMultiple) {
          if (this.inlineAdding) {
            slot.setAttribute(p9r.attr.ACTION.INLINE_ADDING, "true");
          } else {
            slot.removeAttribute(p9r.attr.ACTION.INLINE_ADDING);
          }
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE);
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_DRAGGING);
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER);
          slot.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE);
          if (slots.length == this.min) {
            if (!this.optionnal) {
              slot.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
            }
            slot.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
          }
        } else {}
        slotEditor?.viewEditor();
      });
      if (!this.isConnected)
        return;
      if (addedNode && slots.includes(addedNode)) {
        this._appendPanelItem(addedNode, slots.length - 1);
        this._updatePanelCount(slots.length);
        this._refreshAddBtn(slots.length);
      } else {
        this._renderPanel(slots);
      }
    }
    _renderPanel(slots) {
      this._titleEl.textContent = this._titleLabel();
      this._updatePanelCount(slots.length);
      this._listEl.innerHTML = "";
      slots.forEach((slot, index) => this._appendPanelItem(slot, index));
      this._refreshAddBtn(slots.length);
    }
    _refreshAddBtn(count) {
      const optionalEmptySingle = this.optionnal && !this.isMultiple && count === 0;
      const canAddMultiple = this.isMultiple && count < this.max;
      this._addBtn.hidden = !(this.isMultiple || optionalEmptySingle);
      this._addBtn.disabled = !(canAddMultiple || optionalEmptySingle);
    }
    _updatePanelCount(total) {
      if (this.isMultiple) {
        const max = this.max === Infinity ? "∞" : String(this.max);
        this._countEl.textContent = `${total} / ${max}`;
        this._countEl.hidden = false;
      } else {
        this._countEl.textContent = "";
        this._countEl.hidden = true;
      }
    }
    _appendPanelItem(slot, index) {
      const li = document.createElement("li");
      li._slot = slot;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item";
      btn.innerHTML = `
            <span class="item-index">#${index + 1}</span>
            <span class="item-label"></span>
        `;
      btn.querySelector(".item-label").textContent = this._slotLabel(slot);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._focus(slot);
      });
      li.append(btn);
      this._listEl.append(li);
    }
    _removePanelItem(removed) {
      const lis = Array.from(this._listEl.children);
      for (const li of lis) {
        if (li._slot === removed) {
          li.remove();
          break;
        }
      }
      Array.from(this._listEl.children).forEach((li, i) => {
        const idx = li.querySelector(".item-index");
        if (idx)
          idx.textContent = `#${i + 1}`;
      });
    }
    _titleLabel() {
      const custom = this.getAttribute("label");
      if (custom)
        return custom;
      const child = this.firstElementChild;
      const slotName = child?.getAttribute("slot");
      return slotName || "Default slot";
    }
    _slotLabel(slot) {
      const text = (slot.textContent || "").trim().replace(/\s+/g, " ");
      if (text.length > 0) {
        return text.length > 40 ? text.slice(0, 40) + "…" : text;
      }
      return `<${slot.tagName.toLowerCase()}>`;
    }
    _focus(slot) {
      this.closest("p9r-config-panel")?.close?.();
      slot.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!slot.hasAttribute("tabindex"))
        slot.setAttribute("tabindex", "-1");
      try {
        slot.focus({ preventScroll: true });
      } catch {}
    }
    _add() {
      if (!this._component)
        return;
      const template = this.firstElementChild;
      if (!template)
        return;
      const current = this._countSlots();
      if (this.isMultiple) {
        if (current >= this.max)
          return;
      } else {
        if (!this.optionnal || current > 0)
          return;
      }
      const clone = template.cloneNode(true);
      clone.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
      this._component.append(clone);
    }
    _countSlots() {
      if (!this._component)
        return 0;
      const child = this.firstElementChild;
      const slotName = child?.getAttribute("slot");
      const selector = slotName ? `:scope > [slot="${slotName}"]` : `:scope > :not([slot])`;
      return this._component.querySelectorAll(selector).length;
    }
    get isMultiple() {
      return this.hasAttribute("allow-multiple");
    }
    get optionnal() {
      return this.hasAttribute("optionnal");
    }
    get min() {
      const raw = this.getAttribute("data-min") ?? this.getAttribute("min");
      const n = raw != null ? parseInt(raw, 10) : NaN;
      return Number.isFinite(n) && n >= 0 ? n : 1;
    }
    get max() {
      const raw = this.getAttribute("data-max") ?? this.getAttribute("max");
      const n = raw != null ? parseInt(raw, 10) : NaN;
      return Number.isFinite(n) && n >= 1 ? n : Infinity;
    }
    get inlineAdding() {
      return this.hasAttribute(p9r.attr.ACTION.INLINE_ADDING);
    }
    get disableOthersComponents() {
      return this.hasAttribute("disable-others-components");
    }
    get isCreating() {
      return this._component?.getAttribute(p9r.attr.EDITOR.IS_CREATING) === "true";
    }
    static _css = `
        :host {
            display: block;
            margin: 8px 0;
        }

        .panel {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px 12px;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 10px;
            background: var(--bg-surface, #fff);
        }

        .header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
        }

        .title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted, #94a3b8);
        }

        .count {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted, #94a3b8);
            font-variant-numeric: tabular-nums;
        }

        .items {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .items:empty {
            display: none;
        }

        .item {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 7px 10px;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            background: var(--bg-surface, #fff);
            color: var(--text-main, #1e293b);
            font-size: 12px;
            font-weight: 500;
            text-align: left;
            cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
            outline: none;
        }

        .item:hover {
            border-color: var(--primary-base, #4361ee);
            background: var(--primary-muted, rgb(67 97 238 / 0.08));
        }

        .item:focus-visible {
            border-color: var(--primary-base, #4361ee);
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
        }

        .item-index {
            flex-shrink: 0;
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted, #94a3b8);
            font-variant-numeric: tabular-nums;
        }

        .item-label {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .add {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            padding: 7px 10px;
            margin-top: 2px;
            border: 1px dashed var(--border-default, #e2e8f0);
            border-radius: 8px;
            background: transparent;
            color: var(--text-muted, #94a3b8);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: border-color 0.15s, color 0.15s, background 0.15s;
            outline: none;
        }

        .add:hover:not(:disabled) {
            border-color: var(--primary-base, #4361ee);
            color: var(--primary-base, #4361ee);
            background: var(--primary-muted, rgb(67 97 238 / 0.08));
        }

        .add:focus-visible {
            border-color: var(--primary-base, #4361ee);
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
        }

        .add:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
  }
  if (!customElements.get("p9r-comp-sync")) {
    customElements.define("p9r-comp-sync", CompSync);
  }

  // src/control/components/icons.ts
  var ICON_SNIPPET = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m18 16 4-4-4-4"/>
    <path d="m6 8-4 4 4 4"/>
    <path d="m14.5 4-5 16"/>
</svg>
`;
  var ICON_SNIPPET_MUTED = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m18 16 4-4-4-4"/>
    <path d="m6 8-4 4 4 4"/>
    <path d="m14.5 4-5 16"/>
</svg>
`;
  var ICON_TEMPLATE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M3 9h18" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 21V9" stroke="currentColor" stroke-width="1.5" fill="none"/>
</svg>
`;
  var ICON_TEMPLATE_MUTED = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M9 21V9"/>
</svg>
`;
  var ICON_COMPONENT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="6" y="6" width="12" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
    <rect x="6" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="13" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>
`;
  var ICON_UPLOAD = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="m21 15-5-5L5 21"/>
</svg>
`;
  var ICON_PARENT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15"></polyline>
</svg>
`;
  var ICON_PIN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 17v5"/>
    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
</svg>
`;

  // src/control/components/editor/componentSync/sync/ImageSync/ImageSync.style.css
  var ImageSync_style_default = `p9r-image-sync {
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
    padding: 1rem;
}

/* ── Preview image ── */

p9r-image-sync .image-sync-card img {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    object-position: center;
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

  // src/control/components/editor/componentSync/sync/ImageSync/ImageSync.ts
  class ImageSync extends HTMLElement {
    static _LOCKED_ACTIONS = [
      "DISABLE_DELETE",
      "DISABLE_DUPLICATE",
      "DISABLE_ADD_BEFORE",
      "DISABLE_ADD_AFTER",
      "DISABLE_CHANGE_COMPONENT",
      "DISABLE_DRAGGING",
      "DISABLE_SAVE_AS_TEMPLATE"
    ];
    _component = null;
    _target = null;
    _previewImg = null;
    _emptyState = null;
    _overlay = null;
    _targetObserver = null;
    _prepared = false;
    connectedCallback() {
      const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (componentIdentifier && !this._component) {
        this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
      }
      ImageSync._injectStyles();
      requestAnimationFrame(() => {
        if (!this._prepared)
          this._syncDefault();
        this._render();
      });
    }
    prepare(component) {
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
    static _stylesInjected = false;
    static _injectStyles() {
      if (ImageSync._stylesInjected)
        return;
      const style = document.createElement("style");
      style.textContent = ImageSync_style_default;
      document.head.appendChild(style);
      ImageSync._stylesInjected = true;
    }
    get _slotName() {
      return this.getAttribute("slotTarget") || "";
    }
    _syncDefault() {
      const defaultSrc = this.getAttribute("default");
      if (!defaultSrc)
        return;
      if (this._resolveTarget())
        return;
      if (this.optionnal && !this.isCreating)
        return;
      const img = document.createElement("img");
      const slot = this._slotName;
      if (slot)
        img.setAttribute("slot", slot);
      img.setAttribute("src", defaultSrc);
      this._lockActions(img);
      if (this.allowResize)
        img.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
      this._component?.appendChild(img);
    }
    _resolveTarget() {
      if (!this._component)
        return null;
      const slot = this._slotName;
      if (!slot)
        return this._component.querySelector("img");
      return this._component.querySelector(`img[slot="${slot}"]`);
    }
    _ensureTarget() {
      let target = this._resolveTarget();
      if (target)
        return target;
      target = document.createElement("img");
      const slot = this._slotName;
      if (slot)
        target.setAttribute("slot", slot);
      this._lockActions(target);
      if (this.allowResize)
        target.setAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE, "true");
      this._component.appendChild(target);
      return target;
    }
    _render() {
      this._target = this._resolveTarget();
      this._lockActions(this._target);
      this._watchTarget(this._target);
      const label = this.getAttribute("label") || "Image";
      const currentValue = this._target?.getAttribute("src") || "";
      this.innerHTML = "";
      const labelEl = document.createElement("span");
      labelEl.className = "image-sync-label";
      labelEl.textContent = label;
      const card = document.createElement("div");
      card.className = "image-sync-card";
      this._previewImg = document.createElement("img");
      this._emptyState = document.createElement("div");
      this._emptyState.className = "image-sync-empty";
      this._emptyState.innerHTML = `${ICON_UPLOAD}<span>Click to choose an image</span>`;
      this._overlay = document.createElement("div");
      this._overlay.className = "image-sync-overlay";
      const btnChange = document.createElement("button");
      btnChange.className = "btn-change";
      btnChange.textContent = "Change";
      btnChange.addEventListener("click", (e) => {
        e.stopPropagation();
        this._openMediaCenter();
      });
      const btnRemove = document.createElement("button");
      btnRemove.className = "btn-remove";
      btnRemove.textContent = "Remove";
      btnRemove.addEventListener("click", (e) => {
        e.stopPropagation();
        this._clear();
      });
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
    _lockActions(target) {
      if (!target)
        return;
      let changed = false;
      for (const key of ImageSync._LOCKED_ACTIONS) {
        const attr = p9r.attr.ACTION[key];
        if (target.getAttribute(attr) !== "true") {
          target.setAttribute(attr, "true");
          changed = true;
        }
      }
      if (!changed)
        return;
      const id = target.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
      if (id) {
        const editor = document.compIdentifierToEditor?.get(id);
        editor?.viewEditor();
      }
    }
    _watchTarget(target) {
      this._targetObserver?.disconnect();
      this._targetObserver = null;
      if (!target)
        return;
      this._targetObserver = new MutationObserver(() => {
        this._updatePreview(target.getAttribute("src") || "");
      });
      this._targetObserver.observe(target, { attributes: true, attributeFilter: ["src"] });
    }
    _updatePreview(src) {
      if (!this._previewImg || !this._emptyState || !this._overlay)
        return;
      const card = this._previewImg.parentElement;
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
    _openMediaCenter() {
      const mediaCenter = document.EditorManager.getMediaCenter();
      const acceptRaw = this.getAttribute("accept") || "image";
      const types = ["folder", ...acceptRaw.split(",").map((t) => t.trim())];
      const handler = (e) => {
        mediaCenter.removeEventListener("select-item", handler);
        this._target = this._ensureTarget();
        this._lockActions(this._target);
        this._watchTarget(this._target);
        this._target.setAttribute("src", e.detail.src);
        this._updatePreview(e.detail.src);
      };
      mediaCenter.addEventListener("select-item", handler);
      mediaCenter.show(types);
    }
    _clear() {
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
    get isCreating() {
      return this._component?.getAttribute(p9r.attr.EDITOR.IS_CREATING) === "true";
    }
    init(opts) {
      const target = this._resolveTarget();
      if (opts?.added && opts.added !== target)
        return;
      if (opts?.removed && opts.removed !== this._target && opts.removed !== target)
        return;
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

  // src/control/components/editor/componentSync/sync/StateSync.ts
  class StateSync extends HTMLElement {
    _component = null;
    _editor = null;
    _pinned = false;
    _observer = null;
    _prepared = false;
    get targetSelector() {
      return this.getAttribute("target") || "";
    }
    get attrName() {
      return this.getAttribute("attr") || "";
    }
    get attrValue() {
      return this.getAttribute("value") || "";
    }
    get label() {
      return this.getAttribute("label") || this.attrValue || this.attrName;
    }
    get placement() {
      const v = this.getAttribute("placement");
      return v === "right" || v === "top" || v === "bottom" ? v : "left";
    }
    get isPinned() {
      return this._pinned;
    }
    connectedCallback() {
      if (this._prepared)
        return;
      const componentIdentifier = this.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (!componentIdentifier)
        return;
      this._component = document.querySelector(`[${p9r.attr.EDITOR.IDENTIFIER}="${componentIdentifier}"]`);
      this._editor = document.compIdentifierToEditor?.get(componentIdentifier) ?? null;
      this._editor?.registerStateSync(this);
    }
    prepare(component, editor) {
      this._component = component;
      this._editor = editor;
      editor.registerStateSync(this);
      this._prepared = true;
    }
    disconnectedCallback() {
      this.unpin();
      this._editor?.unregisterStateSync(this);
    }
    _targets() {
      const root = this._component?.shadowRoot;
      if (!root || !this.targetSelector)
        return [];
      return Array.from(root.querySelectorAll(this.targetSelector));
    }
    _apply(el) {
      if (this.attrName === "class") {
        if (this.attrValue)
          el.classList.add(this.attrValue);
      } else {
        el.setAttribute(this.attrName, this.attrValue);
      }
    }
    _clear(el) {
      if (this.attrName === "class") {
        if (this.attrValue)
          el.classList.remove(this.attrValue);
      } else {
        el.removeAttribute(this.attrName);
      }
    }
    _isApplied(el) {
      if (this.attrName === "class") {
        return !!this.attrValue && el.classList.contains(this.attrValue);
      }
      return el.getAttribute(this.attrName) === this.attrValue;
    }
    pin() {
      if (this._pinned)
        return;
      const targets = this._targets();
      if (targets.length === 0)
        return;
      targets.forEach((el) => this._apply(el));
      this._observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          const el = m.target;
          if (!this._isApplied(el))
            this._apply(el);
        }
      });
      const attrFilter = this.attrName === "class" ? ["class"] : [this.attrName];
      targets.forEach((el) => this._observer.observe(el, { attributes: true, attributeFilter: attrFilter }));
      this._pinned = true;
    }
    unpin() {
      if (!this._pinned)
        return;
      this._observer?.disconnect();
      this._observer = null;
      this._targets().forEach((el) => this._clear(el));
      this._pinned = false;
    }
    toggle() {
      if (this._pinned)
        this.unpin();
      else
        this.pin();
    }
  }
  if (!customElements.get("p9r-state-sync")) {
    customElements.define("p9r-state-sync", StateSync);
  }

  // src/control/components/editor/componentSync/SyncPanel.ts
  class SyncPanel extends Component {
    dialog = null;
    constructor() {
      super({
        css: "",
        template: `
            <w13c-lateral-dialog>
                <slot></slot>
                <span slot="title">Element Configuration</span>
            </w13c-lateral-dialog>
            `
      });
    }
    connectedCallback() {
      this.dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog");
    }
    show() {
      this.dialog?.show();
    }
    close() {
      this.dialog?.close();
    }
    init(opts) {
      const elements = Array.from(this.querySelectorAll("*"));
      for (const element of elements) {
        if (element.init)
          element.init(opts);
      }
    }
  }
  if (!customElements.get("p9r-config-panel")) {
    customElements.define("p9r-config-panel", SyncPanel);
  }

  // src/control/components/editor/configurations/PageConfiguration/template.html
  var template_default2 = `<w13c-lateral-dialog>
  <form action="">

    <p9r-section data-title="SEO">
      <p9r-input
        name="title"
        label="Title"
        placeholder="A beautiful title"
        hint="Used as &lt;title&gt; and SEO heading."
        max-count="50"
      ></p9r-input>

      <p9r-input
        name="description"
        label="Description"
        placeholder="A beautiful description"
        hint="Used as meta description."
        max-count="120"
      ></p9r-input>
    </p9r-section>

    <p9r-section data-title="URL">
      <div class="field">
        <p9r-input
          id="path-input"
          name="path"
          label="Path"
          placeholder="/article"
          hint='Letters, numbers, "-" and "/" allowed.'
        ></p9r-input>
        <div class="url-row" id="url-row" hidden>
          <small class="url-preview" id="url-preview"></small>
          <button type="button" class="url-open" id="url-open" title="Open in new tab" aria-label="Open in new tab">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6"/>
              <path d="M10 14L21 3"/>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            </svg>
          </button>
        </div>
      </div>
    </p9r-section>

    <p9r-section data-title="Taxonomy">
      <p9r-tag-suggest name="tags" mode="multiple" resource="pages" api="../api/tags" placeholder="Add a tag…">
        <span slot="label">Tags</span>
      </p9r-tag-suggest>
    </p9r-section>

    <p9r-section data-title="Publication">
      <p9r-select name="visible" label="Status">
        <option value="on" selected>Published</option>
        <option value="">Draft</option>
      </p9r-select>
    </p9r-section>

    <p9r-button id="save-btn" fullwidth type="submit" variant="filled" color="primary">
      Save
    </p9r-button>
  </form>
  <span slot="title">Page configuration</span>

</w13c-lateral-dialog>
`;

  // src/control/components/editor/configurations/PageConfiguration/style.css
  var style_default = `form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
}

.url-row {
    display: flex;
    align-items: stretch;
    gap: 6px;
}

.url-preview {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: var(--bg-base, #f8fafc);
    padding: 5px 8px;
    border-radius: 6px;
    border: 1px solid var(--border-default, #e2e8f0);
    word-break: break-all;
    line-height: 1.3;
    display: flex;
    align-items: center;
}

.url-open {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    padding: 0;
    background: var(--bg-surface, #fff);
    color: var(--text-muted, #94a3b8);
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.url-open:hover {
    color: var(--primary-base, #4361ee);
    border-color: var(--primary-base, #4361ee);
    background: var(--primary-muted, rgb(67 97 238 / 0.08));
}

.url-open:focus-visible {
    outline: none;
    border-color: var(--primary-base, #4361ee);
    box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
}

.url-open:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.url-open:disabled:hover {
    color: var(--text-muted, #94a3b8);
    border-color: var(--border-default, #e2e8f0);
    background: var(--bg-surface, #fff);
}

#save-btn[aria-disabled="true"] {
    opacity: 0.5;
    pointer-events: none;
}
`;

  // src/control/core/showToast.ts
  function showToast(message, options) {
    let stack = document.querySelector("p9r-toast-stack");
    if (!stack) {
      stack = document.createElement("p9r-toast-stack");
      document.body.appendChild(stack);
    }
    stack.push(message, options);
  }

  // src/socle/utils/validation.ts
  function isValidPathFormat(path) {
    if (!path || typeof path !== "string")
      return false;
    if (path === "/")
      return true;
    return /^(?:\/[a-zA-Z0-9-]+)+$/.test(path);
  }
  function isValidSnippetIdentifier(id) {
    if (!id || typeof id !== "string")
      return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
  }

  // src/control/components/editor/configurations/PageConfiguration/PageConfiguration.ts
  class PageConfiguration extends Component {
    _pathCheckToken = 0;
    _pathValid = true;
    _pathBlurred = false;
    constructor() {
      super({
        css: style_default,
        template: template_default2
      });
    }
    static get observedAttributes() {
      return ["type", "disabled", "variant", "color"];
    }
    connectedCallback() {
      const form = this.shadowRoot?.querySelector("form");
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!this._pathValid) {
          showToast("Fix the path before saving.", { type: "error" });
          return;
        }
        const data = this._collectFormData();
        document.EditorManager.save({
          title: data.title,
          description: data.description,
          visible: data.visible,
          path: data.path,
          tags: JSON.stringify(data.tags)
        }).then(() => {
          showToast("Page saved", { type: "success" });
        }).catch((err) => {
          console.error(err);
          showToast("Failed to save page: " + (err?.message || err), { type: "error", duration: 6000 });
        });
        const url = new URL(window.location.href);
        url.searchParams.set("path", data.path);
        window.history.pushState({}, "", url);
      });
      Array.from(this.attributes).filter((attr) => attr.name.startsWith("default-")).map((attr) => attr.name).forEach((name) => this.setDefaultValue(name));
      this._wirePathValidation();
      this._wireOpenInNewTab();
    }
    _wireOpenInNewTab() {
      const btn = this.shadowRoot?.getElementById("url-open");
      btn?.addEventListener("click", () => {
        const path = this._getPathInput()?.value.trim() ?? "";
        if (!path || !isValidPathFormat(path))
          return;
        window.open(`${window.location.origin}${path}`, "_blank", "noopener,noreferrer");
      });
    }
    _collectFormData() {
      return {
        title: this._getInputValue("title"),
        description: this._getInputValue("description"),
        path: this._getInputValue("path"),
        visible: this._getSelectValue("visible") === "on",
        tags: this._getTagsValue()
      };
    }
    _getInputElement(name) {
      return this.shadowRoot?.querySelector(`p9r-input[name=${name}]`);
    }
    _getInputValue(name) {
      return this._getInputElement(name)?.value.trim() ?? "";
    }
    _getSelectValue(name) {
      const sel = this.shadowRoot?.querySelector(`p9r-select[name=${name}]`);
      return sel?.value ?? "";
    }
    _getTagsValue() {
      const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=tags]`);
      const raw = tagSuggest?.value ?? "";
      return raw.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    }
    setDefaultValue(name) {
      const defVal = this.getAttribute(name);
      if (defVal === null)
        return;
      const fieldName = name.replace("default-", "");
      const pInput = this._getInputElement(fieldName);
      if (pInput) {
        pInput.value = defVal;
        if (fieldName === "path")
          this._updateUrlPreview();
        return;
      }
      const select = this.shadowRoot?.querySelector(`p9r-select[name=${fieldName}]`);
      if (select && "value" in select) {
        select.value = defVal === "on" ? "on" : "";
        return;
      }
      const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${fieldName}]`);
      if (tagSuggest && "value" in tagSuggest) {
        tagSuggest.value = defVal;
      }
    }
    _wirePathValidation() {
      const input = this._getPathInput();
      if (!input)
        return;
      input.addEventListener("input", () => {
        this._updateUrlPreview();
        this._validatePathFormatSync();
      });
      input.addEventListener("blur", () => {
        this._pathBlurred = true;
        this._validatePathRemote();
      });
      this._updateUrlPreview();
      this._validatePathFormatSync();
    }
    _getPathInput() {
      return this._getInputElement("path");
    }
    _setHint(level, text) {
      this._getPathInput()?.setHint(level, text);
    }
    _setPathValid(valid) {
      this._pathValid = valid;
      const btn = this.shadowRoot?.getElementById("save-btn");
      if (btn) {
        if (valid)
          btn.removeAttribute("aria-disabled");
        else
          btn.setAttribute("aria-disabled", "true");
      }
      this._getPathInput()?.setInvalid(!valid);
    }
    _validatePathFormatSync() {
      const input = this._getPathInput();
      if (!input)
        return;
      const path = input.value.trim();
      if (path === "") {
        this._setHint("error", "Path is required.");
        this._setPathValid(false);
        return;
      }
      if (!isValidPathFormat(path)) {
        this._setHint("error", 'Only letters, numbers, "-" and "/" are allowed (e.g. /my-page).');
        this._setPathValid(false);
        return;
      }
      this._setHint("info", 'Letters, numbers, "-" and "/" allowed.');
      this._setPathValid(true);
    }
    async _validatePathRemote() {
      const input = this._getPathInput();
      if (!input)
        return;
      const path = input.value.trim();
      if (path === "" || !isValidPathFormat(path))
        return;
      const currentPath = this.getAttribute("default-path") ?? "";
      const token = ++this._pathCheckToken;
      try {
        const url = new URL("../api/page-exists", window.location.href);
        url.searchParams.set("path", path);
        if (currentPath)
          url.searchParams.set("current-path", currentPath);
        const res = await fetch(url);
        if (token !== this._pathCheckToken)
          return;
        if (!res.ok) {
          this._setHint("error", "Could not validate the path (server error).");
          this._setPathValid(false);
          return;
        }
        const body = await res.json();
        if (body.exists) {
          this._setHint("error", `"${path}" is already used.`);
          this._setPathValid(false);
        } else {
          this._setHint("success", "Path is available.");
          this._setPathValid(true);
        }
      } catch {
        if (token !== this._pathCheckToken)
          return;
        this._setHint("error", "Could not reach the server to validate the path.");
        this._setPathValid(false);
      }
    }
    _updateUrlPreview() {
      const pathInput = this._getPathInput();
      const preview = this.shadowRoot?.getElementById("url-preview");
      const row = this.shadowRoot?.getElementById("url-row");
      const openBtn = this.shadowRoot?.getElementById("url-open");
      if (!pathInput || !preview || !row)
        return;
      const path = pathInput.value.trim();
      if (path === "") {
        row.hidden = true;
        return;
      }
      row.hidden = false;
      preview.textContent = `${window.location.origin}${path}`;
      if (openBtn)
        openBtn.disabled = !isValidPathFormat(path);
    }
    show() {
      const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog");
      dialog?.show();
    }
  }
  customElements.define("w13c-page-information", PageConfiguration);

  // src/control/components/editor/configurations/TemplateConfiguration/template.html
  var template_default3 = `<w13c-lateral-dialog>
  <form action="">

    <p9r-section data-title="Information">
      <p9r-input
        name="name"
        label="Name"
        placeholder="My hero section"
        hint="Displayed in the Templates library."
        max-count="50"
      ></p9r-input>

      <p9r-input
        name="description"
        label="Description"
        placeholder="A short description"
        hint="Shown under the name in the library."
        max-count="120"
      ></p9r-input>
    </p9r-section>

    <p9r-section data-title="Taxonomy">
      <p9r-tag-suggest name="category" mode="single" resource="templates" api="../../api/tags" placeholder="hero, layout, cta…">
        <span slot="label">Category</span>
      </p9r-tag-suggest>
    </p9r-section>

    <p9r-button id="save-btn" fullwidth type="submit" variant="filled" color="primary">
      Save
    </p9r-button>
    <p class="error-message" hidden></p>
  </form>
  <span slot="title">Template configuration</span>
</w13c-lateral-dialog>
`;

  // src/control/components/editor/configurations/TemplateConfiguration/style.css
  var style_default2 = `form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.error-message {
    font-size: 12px;
    color: var(--danger-base, #ef4444);
    margin: 0;
}
`;

  // src/control/components/editor/configurations/TemplateConfiguration/TemplateConfiguration.ts
  class TemplateConfiguration extends Component {
    constructor() {
      super({
        css: style_default2,
        template: template_default3
      });
    }
    connectedCallback() {
      const form = this.shadowRoot?.querySelector("form");
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = this._collectFormData();
        if (!data.name) {
          showToast("A name is required.", { type: "error" });
          return;
        }
        const content = document.EditorManager.getContent();
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");
        const endpoint = new URL("../../api/template", window.location.href);
        if (id)
          endpoint.searchParams.set("id", id);
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              description: data.description,
              category: data.category,
              content
            })
          });
          if (!res.ok) {
            showToast("Failed to save template: " + await res.text(), { type: "error", duration: 6000 });
            return;
          }
          const result = await res.json();
          if (!id && result.id) {
            url.searchParams.set("id", result.id);
            window.history.pushState({}, "", url);
          }
          showToast(id ? "Template updated" : "Template created", { type: "success" });
        } catch (err) {
          showToast("Failed to save template: " + (err?.message || err), { type: "error", duration: 6000 });
        }
      });
      Array.from(this.attributes).filter((attr) => attr.name.startsWith("default-")).forEach((attr) => this._setDefaultValue(attr.name));
    }
    _collectFormData() {
      return {
        name: this._getInputValue("name"),
        description: this._getInputValue("description"),
        category: this._getTagSuggestValue("category")
      };
    }
    _getInputElement(name) {
      return this.shadowRoot?.querySelector(`p9r-input[name=${name}]`);
    }
    _getInputValue(name) {
      return this._getInputElement(name)?.value.trim() ?? "";
    }
    _getTagSuggestValue(name) {
      const el = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${name}]`);
      return (el?.value ?? "").trim();
    }
    _setDefaultValue(name) {
      const defVal = this.getAttribute(name);
      if (defVal === null)
        return;
      const fieldName = name.replace("default-", "");
      const input = this._getInputElement(fieldName);
      if (input) {
        input.value = defVal;
        return;
      }
      const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${fieldName}]`);
      if (tagSuggest && "value" in tagSuggest)
        tagSuggest.value = defVal;
    }
    show() {
      const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog");
      dialog?.show();
    }
  }
  customElements.define("w13c-template-information", TemplateConfiguration);

  // ../WebComponents/dist/blocs/horizontal-action-group.mjs
  var l = `<div class="actions" role="toolbar" part="toolbar">
    <slot></slot>
</div>
`;
  var n = `:host {
  display: inline-block;

  --_toolbar-bg: var(--bg-overlay, #ffffff);
  --_toolbar-border: var(--border-default, #e5e7eb);
  --_toolbar-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --_toolbar-radius: 12px;
  --_toolbar-padding: 6px;
  --_toolbar-gap: 4px;

  --_color: var(--info-contrasted, #3b82f6);
  --_hover-color: var(--primary-contrasted, #3b82f6);

  --_bg-color: var(--bg-overlay, white);
  --_bg-hover-color: var(--primary-muted, #3b82f6);

  --_border-color: var(--border-default, #e5e7eb);

  touch-action: none;
}

.actions {
  display: flex;
  align-items: center;
  background: var(--_toolbar-bg);
  border: 1px solid var(--_toolbar-border);
  border-radius: var(--_toolbar-radius);
  box-shadow: var(--_toolbar-shadow);
  overflow: hidden;
  width: fit-content;
  padding: var(--_toolbar-padding);
  gap: var(--_toolbar-gap);
}

:host([align="start"]) .actions { justify-content: flex-start; }
:host([align="center"]) .actions { justify-content: center; }
:host([align="end"]) .actions { justify-content: flex-end; }

:host([fullwidth]),
:host([fullwidth]) .actions {
  width: 100%;
}

::slotted([hidden]) {
  display: none !important;
}

::slotted([data-action]) {
  display: flex;
  align-items: center;
  padding: 10px;
  background: var(--_bg-color);
  border: none;
  border-radius: 8px;
  color: var(--_color);
  cursor: pointer;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  white-space: nowrap;
}

::slotted([data-action]:hover) {
  background-color: var(--_bg-hover-color);
  color: var(--_hover-color);
}

::slotted([data-action]:focus-visible) {
  outline: 2px solid var(--_color);
  outline-offset: 2px;
}

::slotted([data-action][disabled]),
::slotted([data-action][aria-disabled="true"]) {
  opacity: 0.4;
  pointer-events: none;
}

::slotted(.separator) {
  width: 1px;
  height: 1.7rem;
  background-color: var(--_border-color);
  margin: 0 4px;
  align-self: center;
}

@media (prefers-reduced-motion: no-preference) {
  ::slotted([data-action]) {
    transition: background-color 0.2s ease, color 0.2s ease;
  }
}
`;

  class a extends HTMLElement {
    constructor(t) {
      super();
      let r = this.attachShadow({ mode: "open" });
      if (t) {
        let o = document.createElement("style");
        o.innerHTML = t.css, r.appendChild(o);
        let e = document.createElement("template");
        e.innerHTML = t.template, r.appendChild(e.content.cloneNode(true));
      }
    }
    connectedCallback() {}
  }

  class s extends a {
    static _event = "action-click";
    _toolbar;
    constructor() {
      super({ css: n, template: l });
      this._toolbar = this.shadowRoot?.querySelector(".actions") ?? null;
    }
    static get observedAttributes() {
      return ["label"];
    }
    connectedCallback() {
      for (let t of ["label"])
        this._upgradeProperty(t);
      if (this._toolbar && !this._toolbar.hasAttribute("aria-label")) {
        let t = this.getAttribute("label");
        if (t)
          this._toolbar.setAttribute("aria-label", t);
      }
      this.addEventListener("click", this._handleClick);
    }
    disconnectedCallback() {
      this.removeEventListener("click", this._handleClick);
    }
    attributeChangedCallback(t, r, o) {
      if (!this._toolbar)
        return;
      if (t === "label")
        if (o === null)
          this._toolbar.removeAttribute("aria-label");
        else
          this._toolbar.setAttribute("aria-label", o);
    }
    _handleClick = (t) => {
      let o = t.composedPath().find((i) => i instanceof Element && i.hasAttribute("data-action"));
      if (!o)
        return;
      t.stopPropagation();
      let e = o.getAttribute("data-action");
      this._dispatchAction(e, o, t);
    };
    _dispatchAction(t, r, o) {
      this.dispatchEvent(new CustomEvent("action-click", { detail: { action: t, originalEvent: o, target: r }, bubbles: true, composed: true }));
    }
    _upgradeProperty(t) {
      if (this.hasOwnProperty(t)) {
        let r = this[t];
        delete this[t], this[t] = r;
      }
    }
    get label() {
      return this.getAttribute("label");
    }
    set label(t) {
      if (t === null)
        this.removeAttribute("label");
      else
        this.setAttribute("label", t);
    }
  }
  if (!customElements.get("p9r-horizontal-action-group"))
    customElements.define("p9r-horizontal-action-group", s);

  // src/control/components/editor/EditorSystem/BlocActions/style.css
  var style_default3 = `:host {
    position: absolute;
    left: 0;
    top: 0;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    padding: 8px 32px 8px 16px;
    z-index: 10000;
    will-change: transform, opacity;
    transition: opacity 0.1s ease-out;
}

/* Snippet variant — blue accent to signal this bar is acting on a reference,
   not a regular bloc. We override the HorizontalActionGroup CSS variables so
   its existing ::slotted button styles pick up the new palette. */
::slotted([data-action="pin-state"][data-active]) {
    background: var(--primary-muted, #eef2ff) !important;
    color: var(--primary-base, #4361ee) !important;
}

:host([data-variant="snippet"]) {
    --_color: #007aff;
    --_hover-color: #005bb5;
    --_bg-color: #f0f7ff;
    --_bg-hover-color: rgba(0, 122, 255, 0.15);
    --_border-color: rgba(0, 122, 255, 0.3);
    --toolbar-bg: #f0f7ff;
    --toolbar-border: rgba(0, 122, 255, 0.3);
}

.p9r-bag-meta {
    position: absolute;
    bottom: calc(100% + 2px);
    left: 16px;
    width: max-content;
    max-width: 420px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: var(--toolbar-bg, #fff);
    border: 1px solid var(--toolbar-border, #e5e7eb);
    border-radius: 999px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    font-family: system-ui, sans-serif;
    font-size: 11px;
    line-height: 1.4;
    white-space: nowrap;
    /* overflow:hidden would clip the hover-bridge pseudo-element that lets the
       cursor cross the 2-4px gap between the BAG and the breadcrumb without
       triggering a mouseleave-close. \`overflow:visible\` here is fine because
       the logical 5-item cap already prevents horizontal overflow of real
       content. */
    overflow: visible;
}

/* Hover bridge — a transparent pseudo-element that physically covers the gap
   between the BAG and the breadcrumb so the cursor stays over a descendant
   of the host the whole way across. Without it, crossing the gap fires
   \`mouseleave\` on the BAG host with relatedTarget pointing at whatever is
   behind the gap, and close() runs before the user reaches the breadcrumb. */
.p9r-bag-meta::before {
    content: "";
    position: absolute;
    /* Default vAnchor="top" → breadcrumb sits above the BAG. Bridge drops
       from the breadcrumb's bottom edge down past the 2px gap into the BAG's
       padding band — 6px total, clears sub-pixel rounding. */
    top: 100%;
    left: 0;
    right: 0;
    height: 6px;
}

/* vAnchor="top" → BAG sits above the target → meta pill above BAG (default).
   vAnchor="bottom" → BAG sits below the target → flip the pill below BAG so
   it doesn't land between the cursor and the target. */
:host([data-v-anchor="bottom"]) .p9r-bag-meta {
    bottom: auto;
    top: calc(100% + 2px);
}

/* Flip the bridge to rise from the top edge when the breadcrumb is below. */
:host([data-v-anchor="bottom"]) .p9r-bag-meta::before {
    top: auto;
    bottom: 100%;
    height: 6px;
}

.p9r-bag-meta:empty {
    display: none;
}

.p9r-bag-meta__parent {
    color: var(--text-muted, #94a3b8);
    font-weight: 500;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    padding: 1px 6px;
    border-radius: 999px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
}

.p9r-bag-meta__parent:hover,
.p9r-bag-meta__parent:focus-visible {
    color: var(--text-main, #1e293b);
    background: var(--bg-base, #f1f5f9);
    outline: none;
}

.p9r-bag-meta__ellipsis {
    color: var(--text-muted, #94a3b8);
    padding: 0 2px;
    cursor: default;
}

.p9r-bag-meta__sep {
    color: var(--border-default, #cbd5e1);
    font-weight: 400;
}

.p9r-bag-meta__current {
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--primary-muted, rgba(67, 97, 238, 0.1));
    color: var(--primary-base, #4361ee);
    font-weight: 700;
    letter-spacing: 0.01em;
}

/* Inline fallback — used when the breadcrumb would overflow viewport in its
   default vertical direction (above or below the BAG). Preferred side is
   left; right is used only when there is no left room. Absolute positioning
   overrides the above/below rules. */
/* The host has asymmetric padding (\`padding: 8px 32px 8px 16px\`) so \`100%\`
   in the inline-left/right offsets resolves to the padding-box, which does
   NOT line up visually with the button row. Without compensation, the gap
   between the breadcrumb and the visible BAG edge ends up 16px on the left
   and 32px on the right — i.e. the right-side breadcrumb looks much farther.
   We shift the pill horizontally by the host's left/right padding so both
   sides share the same 4px visual gap. */
.p9r-bag-meta--inline-left {
    top: 50% !important;
    bottom: auto !important;
    left: auto !important;
    right: calc(100% + 4px);
    transform: translate(16px, -50%);
}

.p9r-bag-meta--inline-right {
    top: 50% !important;
    bottom: auto !important;
    left: calc(100% + 4px) !important;
    right: auto;
    transform: translate(-32px, -50%);
}

/* Inline placements use a horizontal bridge that spans the gap + reaches a
   bit into the BAG's padding. Without the override the vertical-default
   bridge rule above leaves a useless 6px-tall strip below the pill while the
   real gap is on the side — the cursor would still transit over empty
   pixels. \`!important\` overrides the default top/left/right rule from the
   .p9r-bag-meta::before base selector. */
.p9r-bag-meta--inline-left::before {
    top: 0 !important;
    bottom: 0;
    left: 100% !important;
    right: auto !important;
    width: 8px;
    height: auto !important;
}

.p9r-bag-meta--inline-right::before {
    top: 0 !important;
    bottom: 0;
    right: 100% !important;
    left: auto !important;
    width: 8px;
    height: auto !important;
}`;

  // src/control/components/editor/EditorSystem/BlocActions/template.html
  var template_default4 = `<button data-action="edit" title="Edit">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
</button>

<button data-action="duplicate" title="Duplicate">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
</button>

<button data-action="changeComponent" title="Change component">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
</button>

<div class="separator" data-group="delete"></div>

<button data-action="delete" class="danger" title="Delete">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
</button>
`;

  // src/control/components/editor/EditorSystem/BlocActions/insert-btn.css
  var insert_btn_default = `.p9r-insert-btn {
    position: absolute;
    z-index: 10001;
    display: none;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--primary-base, #4361ee);
    background: var(--bg-surface, #fff);
    color: var(--primary-base, #4361ee);
    cursor: pointer;
    padding: 0;
    transition: transform 0.15s ease, background-color 0.15s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.p9r-insert-btn::before {
    content: '';
    position: absolute;
    inset: -10px;
    pointer-events: auto;
}

.p9r-insert-btn--before::before {
    bottom: 0;
}

.p9r-insert-btn--after::before {
    top: 0;
}

.p9r-insert-btn--before.p9r-insert-btn--inline::before {
    bottom: -10px;
    right: 0;
}

.p9r-insert-btn--after.p9r-insert-btn--inline::before {
    top: -10px;
    left: 0;
}

.p9r-insert-btn:hover {
    background: var(--primary-base, #4361ee);
    color: #fff;
    transform: scale(1.15);
}

.p9r-pin-menu {
    position: absolute;
    z-index: 10001;
    background: var(--bg-surface, #fff);
    border: 1px solid var(--border-default, #e2e8f0);
    border-radius: 10px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 200px;
    font: inherit;
    color: var(--text-main, #1e293b);
}

.p9r-pin-menu__title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: color-mix(in srgb, currentColor 55%, transparent);
    padding: 8px 10px 6px;
}

.p9r-pin-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    padding: 8px 10px;
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    font: inherit;
    color: inherit;
    width: 100%;
}

.p9r-pin-menu__item:hover {
    background: var(--primary-muted, #eef2ff);
}

.p9r-pin-menu__item[data-active] {
    background: var(--primary-muted, #eef2ff);
    color: var(--primary-base, #4361ee);
    font-weight: 600;
}

.p9r-pin-menu__icon {
    display: inline-flex;
    width: 18px;
    height: 18px;
    opacity: 0.45;
    flex-shrink: 0;
}

.p9r-pin-menu__icon svg {
    width: 100%;
    height: 100%;
}

.p9r-pin-menu__item[data-active] .p9r-pin-menu__icon {
    opacity: 1;
}

.p9r-pin-menu__label {
    flex: 1;
}
`;

  // src/control/components/editor/EditorSystem/BlocActions/insert-btn.html
  var insert_btn_default2 = `<button class="p9r-insert-btn">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
</button>
`;

  // src/control/components/editor/EditorSystem/BlocActions/positioning.ts
  function computeGroupPosition(input) {
    const { rect, barWidth, barHeight, mouseX, mouseY } = input;
    const margin = 8;
    const centerY = rect.top + rect.height / 2;
    let vAnchor = mouseY < centerY ? "top" : "bottom";
    if (vAnchor === "top" && rect.top - barHeight < margin && rect.bottom + barHeight <= window.innerHeight - margin) {
      vAnchor = "bottom";
    } else if (vAnchor === "bottom" && rect.bottom + barHeight > window.innerHeight - margin && rect.top - barHeight >= margin) {
      vAnchor = "top";
    }
    const halfWidth = barWidth / 2;
    let x = mouseX + window.scrollX - halfWidth;
    const minRectX = rect.left + window.scrollX;
    const maxRectX = rect.right + window.scrollX - barWidth;
    x = Math.max(minRectX, Math.min(maxRectX, x));
    const minViewX = window.scrollX + margin;
    const maxViewX = window.scrollX + window.innerWidth - barWidth - margin;
    x = Math.max(minViewX, Math.min(maxViewX, x));
    let y = vAnchor === "top" ? rect.top + window.scrollY - barHeight : rect.bottom + window.scrollY;
    const minViewY = window.scrollY + margin;
    const maxViewY = window.scrollY + window.innerHeight - barHeight - margin;
    y = Math.max(minViewY, Math.min(maxViewY, y));
    return { x, y, vAnchor };
  }
  function positionInsertButtons(btnBefore, btnAfter, rect, inline, show) {
    btnBefore.classList.toggle("p9r-insert-btn--inline", inline);
    btnAfter.classList.toggle("p9r-insert-btn--inline", inline);
    if (!show.before && !show.after)
      return;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    if (inline) {
      const centerY = rect.top + scrollY + rect.height / 2 - 12;
      if (show.before) {
        btnBefore.style.left = `${rect.left + scrollX - 12}px`;
        btnBefore.style.top = `${centerY}px`;
        btnBefore.style.display = "flex";
      }
      if (show.after) {
        btnAfter.style.left = `${rect.right + scrollX - 12}px`;
        btnAfter.style.top = `${centerY}px`;
        btnAfter.style.display = "flex";
      }
    } else {
      const centerX = rect.left + scrollX + rect.width / 2 - 12;
      if (show.before) {
        btnBefore.style.left = `${centerX}px`;
        btnBefore.style.top = `${rect.top + scrollY - 12}px`;
        btnBefore.style.display = "flex";
      }
      if (show.after) {
        btnAfter.style.left = `${centerX}px`;
        btnAfter.style.top = `${rect.bottom + scrollY - 12}px`;
        btnAfter.style.display = "flex";
      }
    }
  }

  // src/control/components/editor/EditorSystem/BlocActions/anchor.ts
  function resolveActionBarAnchor(target, editor) {
    const element = editor?.getActionBarAnchor?.() ?? target;
    return { rect: element.getBoundingClientRect(), element };
  }

  // src/control/components/editor/EditorSystem/BlocLibrary/template.html
  var template_default5 = `<dialog id="action-bar-dialog" class="action-bar-modal">
    <div class="container">
        <header class="header">
            <nav class="tabs" id="tabs">
                <button class="tab active" data-section="blocs">Blocs</button>
                <button class="tab" data-section="templates">Templates</button>
                <button class="tab" data-section="snippets">Snippets</button>
            </nav>
            <div class="search-wrap">
                <input id="search" class="search-input" type="search" placeholder="Search blocs, templates, snippets…" autocomplete="off" />
            </div>
            <form method="dialog">
                <button class="default-close">&times;</button>
            </form>
        </header>
        <div class="content">
            <nav class="groups-sidebar" id="sidebar"></nav>
            <main class="blocs-grid" id="grid"></main>
        </div>
    </div>
</dialog>
`;

  // src/control/components/editor/EditorSystem/BlocLibrary/style.css
  var style_default4 = `:host {
    --bg-main: rgba(255, 255, 255, 0.95);
    --bg-card: #ffffff;
    --bg-card-hover: rgba(0, 122, 255, 0.03);

    --text-primary: #1a1a1a;
    --text-secondary: #666;

    --accent: #007aff;
    --border: rgba(0, 0, 0, 0.06);
    --shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

    --sidebar-width: 200px;

    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ── Dialog ── */

.action-bar-modal {
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
    animation: dialogFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogFadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.action-bar-modal::backdrop {
    background: rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
}

/* ── Container ── */

.container {
    width: 90vw;
    max-width: 1000px;
    height: 70vh;
    background: var(--bg-main);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
}

/* ── Header with tabs ── */

.header {
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--border);
    height: 54px;
    flex-shrink: 0;
}

.search-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
}

.search-input {
    all: unset;
    width: 100%;
    max-width: 360px;
    box-sizing: border-box;
    padding: 7px 12px;
    font-size: 13px;
    color: var(--text-primary);
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid transparent;
    border-radius: 8px;
    transition: all 0.15s;
}

.search-input:focus {
    background: #fff;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
}

.search-input::placeholder {
    color: var(--text-secondary);
}

.tabs {
    display: flex;
    gap: 4px;
}

.tab {
    all: unset;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s;
}

.tab:hover:not(.active):not(.disabled) {
    background: rgba(0, 0, 0, 0.04);
    color: var(--text-primary);
}

.tab.active {
    background: var(--accent);
    color: #fff;
    font-weight: 600;
}

.tab.disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

form[method="dialog"] {
    display: flex;
    align-items: center;
}

.default-close {
    all: unset;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.03);
    color: var(--text-secondary);
    font-size: 1.4rem;
    transition: all 0.2s;
}

.default-close:hover {
    background: rgba(255, 59, 48, 0.1);
    color: #ff3b30;
    transform: rotate(90deg);
}

/* ── Content ── */

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* ── Sidebar ── */

.groups-sidebar {
    width: var(--sidebar-width);
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    flex-shrink: 0;
}

.sidebar-item {
    all: unset;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-secondary);
    transition: all 0.15s;
}

.sidebar-item:hover:not(.active) {
    background: rgba(0, 0, 0, 0.03);
    color: var(--text-primary);
}

.sidebar-item.active {
    background: rgba(0, 122, 255, 0.08);
    color: var(--accent);
    font-weight: 600;
}

/* ── Grid ── */

.blocs-grid {
    flex: 1;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    overflow-y: auto;
    align-content: start;
}

/* Section header used when cross-section search results are shown. Spans
 * the whole grid row so the following cards flow normally underneath. */
.section-header {
    grid-column: 1 / -1;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    padding: 6px 4px 2px;
    margin-top: 4px;
}

.section-header:first-child {
    margin-top: 0;
}

/* ── Cards ── */

.card {
    all: unset;
    background: var(--bg-card);
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 12px 14px;
    min-height: 72px;
    display: grid;
    grid-template-columns: 32px 1fr;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: 0.15s;
    box-sizing: border-box;
    overflow: hidden;
}

.card .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
}

.card svg {
    width: 28px;
    height: 28px;
}

.card:hover {
    border-color: var(--accent);
    background: #f8fbff;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.card .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.card .title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card .description {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-secondary);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* ── Empty state ── */

.empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 48px 24px;
    color: var(--text-secondary);
    text-align: center;
}

.empty-state svg {
    width: 40px;
    height: 40px;
    opacity: 0.3;
}

.empty-state p {
    margin: 0;
    font-size: 13px;
}
`;

  // src/control/components/editor/EditorSystem/BlocLibrary/sections.ts
  function createCard(icon, label, description, onClick) {
    const card = document.createElement("button");
    card.className = "card";
    const desc = description ? `<span class="description">${escapeHtml(description)}</span>` : "";
    card.innerHTML = `
        <span class="icon">${icon}</span>
        <span class="text">
            <span class="title">${escapeHtml(label)}</span>
            ${desc}
        </span>
    `;
    card.onclick = onClick;
    return card;
  }
  function escapeHtml(s2) {
    return s2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function renderEmptyState(grid, icon, message) {
    grid.innerHTML = `
        <div class="empty-state">
            ${icon}
            <p>${message}</p>
        </div>
    `;
  }
  function renderBlocSection(grid, items, metaByTag, deps) {
    items.forEach((item) => {
      const meta = metaByTag.get(item.tag);
      grid.appendChild(createCard(ICON_COMPONENT, item.label, meta?.description || "", () => deps.onInsert({ type: "bloc", id: item.tag })));
    });
  }
  function renderTemplateSection(grid, templates, activeGroup, deps) {
    const filtered = templates.filter((t) => (t.category || "Default") === activeGroup);
    if (filtered.length === 0) {
      renderEmptyState(grid, ICON_TEMPLATE_MUTED, "No templates in this category");
      return;
    }
    filtered.forEach((tpl) => {
      grid.appendChild(createCard(ICON_TEMPLATE, tpl.name, tpl.description || "", () => deps.onInsert({ type: "template", html: tpl.content })));
    });
  }
  function renderSnippetSection(grid, snippets, activeGroup, deps) {
    const filtered = snippets.filter((s2) => (s2.category || "Default") === activeGroup);
    if (filtered.length === 0) {
      renderEmptyState(grid, ICON_SNIPPET_MUTED, "No snippets in this category");
      return;
    }
    filtered.forEach((snippet) => {
      grid.appendChild(createCard(ICON_SNIPPET, snippet.name, snippet.description || "", () => deps.onInsert({ type: "snippet", identifier: snippet.identifier })));
    });
  }
  function renderSearchResults(grid, query, blocs, blocMeta, templates, snippets, deps) {
    const q = query.trim().toLowerCase();
    const matchingBlocs = blocs.filter((b) => {
      const desc = blocMeta.get(b.tag)?.description || "";
      return b.label.toLowerCase().includes(q) || b.tag.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
    const matchingTemplates = templates.filter((t) => t.name.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q));
    const matchingSnippets = snippets.filter((s2) => s2.name.toLowerCase().includes(q) || (s2.description || "").toLowerCase().includes(q) || s2.identifier.toLowerCase().includes(q) || (s2.category || "").toLowerCase().includes(q));
    const total = matchingBlocs.length + matchingTemplates.length + matchingSnippets.length;
    if (total === 0) {
      renderEmptyState(grid, ICON_COMPONENT, `No results for "${query}"`);
      return;
    }
    if (matchingBlocs.length > 0) {
      appendSectionHeader(grid, "Blocs");
      renderBlocSection(grid, matchingBlocs, blocMeta, deps);
    }
    if (matchingTemplates.length > 0) {
      appendSectionHeader(grid, "Templates");
      matchingTemplates.forEach((tpl) => {
        grid.appendChild(createCard(ICON_TEMPLATE, tpl.name, tpl.description || "", () => deps.onInsert({ type: "template", html: tpl.content })));
      });
    }
    if (matchingSnippets.length > 0) {
      appendSectionHeader(grid, "Snippets");
      matchingSnippets.forEach((snippet) => {
        grid.appendChild(createCard(ICON_SNIPPET, snippet.name, snippet.description || "", () => deps.onInsert({ type: "snippet", identifier: snippet.identifier })));
      });
    }
  }
  function appendSectionHeader(grid, label) {
    const header = document.createElement("div");
    header.className = "section-header";
    header.textContent = label;
    grid.appendChild(header);
  }

  // src/control/core/dom/getMetaBasePath.ts
  function getMetaBasePath() {
    const meta = document.querySelector('meta[name="basePath"]');
    const path = meta ? meta.getAttribute("content") : "/";
    return path;
  }

  // src/control/core/dom/getMetaApiPath.ts
  function getMetaApiPath() {
    const base = getMetaBasePath();
    return base + "api";
  }

  // src/control/errors/NearestElementRequire.ts
  class NearestElementRequire extends Error {
    constructor(ele, target) {
      super("The element " + ele.tagName + " should be placed under <" + target + ">");
    }
  }

  // src/control/core/dom/getClosestEditorSystem.ts
  function getClosestEditorSystem(ele) {
    const editorManager = ele.closest("cms-editor-system");
    if (!editorManager)
      throw new NearestElementRequire(ele, "cms-editor-system");
    return editorManager;
  }

  // src/control/components/editor/EditorSystem/BlocLibrary/BlocLibrary.ts
  var ActionBarMetadata = {
    css: style_default4,
    template: template_default5
  };

  class BlocLibrary extends Component {
    static instance = null;
    _dialog = null;
    _section = "blocs";
    _activeGroup = null;
    _templates = [];
    _snippets = [];
    _blocMeta = new Map;
    _locked = false;
    _forcedCategory = null;
    _query = "";
    constructor(options) {
      super(ActionBarMetadata);
      if (options?.section)
        this._section = options.section;
      if (options?.category) {
        this._forcedCategory = options.category;
        this._activeGroup = options.category;
      }
      this._locked = !!options?.locked;
    }
    connectedCallback() {
      const editorManager = getClosestEditorSystem(this);
      const s2 = this.shadowRoot;
      this._dialog = s2.querySelector("#action-bar-dialog");
      this._dialog.addEventListener("close", () => this.remove());
      this._dialog.addEventListener("click", (e) => {
        if (e.target === this._dialog)
          this.close();
      });
      s2.getElementById("tabs").addEventListener("click", (e) => {
        if (this._locked)
          return;
        const tab = e.target.closest(".tab:not(.disabled)");
        if (!tab)
          return;
        this._section = tab.dataset.section;
        this._activeGroup = null;
        this._render();
      });
      s2.getElementById("sidebar").addEventListener("click", (e) => {
        if (this._locked)
          return;
        const item = e.target.closest(".sidebar-item");
        if (!item)
          return;
        this._activeGroup = item.dataset.group || null;
        this._render();
      });
      const searchInput = s2.getElementById("search");
      searchInput.addEventListener("input", () => {
        this._query = searchInput.value;
        this._render();
      });
      if (this._locked) {
        s2.getElementById("tabs").style.display = "none";
        s2.querySelector(".groups-sidebar").style.display = "none";
        s2.querySelector(".search-wrap").style.display = "none";
      }
      if (!this._activeGroup) {
        if (this._section === "blocs") {
          const groups = Array.from(editorManager.observer.getGroups());
          if (groups.length > 0)
            this._activeGroup = groups[0];
        }
      }
      Promise.all([
        this._fetchTemplates(),
        this._fetchSnippets(),
        this._fetchBlocMeta()
      ]).then(() => {
        if (this._forcedCategory)
          this._activeGroup = this._forcedCategory;
        this._render();
        this._dialog.showModal();
        if (!this._locked)
          searchInput.focus();
      });
    }
    async _fetchTemplates() {
      try {
        const res = await fetch(new URL("templates", getMetaApiPath()));
        if (res.ok)
          this._templates = await res.json();
      } catch {}
    }
    async _fetchSnippets() {
      try {
        const res = await fetch(new URL("snippets", getMetaApiPath()));
        if (res.ok)
          this._snippets = await res.json();
      } catch {}
    }
    async _fetchBlocMeta() {
      try {
        const res = await fetch(new URL("blocs-list", getMetaApiPath()));
        if (!res.ok)
          return;
        const list = await res.json();
        this._blocMeta = new Map(list.map((b) => [b.id, { description: b.description }]));
      } catch {}
    }
    _render() {
      const searching = this._query.trim().length > 0 && !this._locked;
      this._renderTabs(searching);
      this._renderSidebar(searching);
      this._renderGrid(searching);
    }
    _renderTabs(searching) {
      const tabs = this.shadowRoot.querySelectorAll(".tab");
      tabs.forEach((tab) => {
        const section = tab.dataset.section;
        tab.classList.toggle("active", !searching && section === this._section);
      });
    }
    _renderSidebar(searching) {
      const sidebar = this.shadowRoot.getElementById("sidebar");
      sidebar.innerHTML = "";
      sidebar.style.display = searching ? "none" : "";
      if (searching)
        return;
      const groups = this._getGroups();
      if (this._activeGroup === null && groups.length > 0) {
        this._activeGroup = groups[0];
      }
      groups.forEach((group) => {
        const btn = document.createElement("button");
        btn.className = `sidebar-item ${group === this._activeGroup ? "active" : ""}`;
        btn.dataset.group = group;
        btn.textContent = group;
        sidebar.appendChild(btn);
      });
    }
    _renderGrid(searching) {
      const editorManager = getClosestEditorSystem(this);
      const grid = this.shadowRoot.getElementById("grid");
      grid.innerHTML = "";
      const deps = { onInsert: (detail) => this._emitInsert(detail) };
      if (searching) {
        const allBlocs = Array.from(editorManager.observer.getItems());
        renderSearchResults(grid, this._query, allBlocs, this._blocMeta, this._templates, this._snippets, deps);
        return;
      }
      if (this._section === "blocs") {
        if (!this._activeGroup)
          return;
        const items = Array.from(editorManager.observer.getItemsByGroup(this._activeGroup));
        renderBlocSection(grid, items, this._blocMeta, deps);
      } else if (this._section === "templates") {
        renderTemplateSection(grid, this._templates, this._activeGroup, deps);
      } else if (this._section === "snippets") {
        renderSnippetSection(grid, this._snippets, this._activeGroup, deps);
      }
    }
    _emitInsert(detail) {
      this.dispatchEvent(new CustomEvent("insert", {
        detail,
        bubbles: true,
        composed: true
      }));
      this.close();
    }
    _getGroups() {
      const editorManager = getClosestEditorSystem(this);
      if (this._section === "blocs") {
        return Array.from(editorManager.observer.getGroups());
      }
      if (this._section === "templates") {
        return Array.from(new Set(this._templates.map((t) => t.category || "Default")));
      }
      if (this._section === "snippets") {
        return Array.from(new Set(this._snippets.map((s2) => s2.category || "Default")));
      }
      return [];
    }
    close() {
      this._dialog?.close();
      BlocLibrary.instance = null;
    }
    static open(options) {
      const menu = new BlocLibrary(options);
      document.body.appendChild(menu);
      BlocLibrary.instance = menu;
      return menu;
    }
  }
  if (!customElements.get("cms-bloc-library")) {
    customElements.define("cms-bloc-library", BlocLibrary);
  }

  // src/control/components/editor/EditorSystem/BlocActions/actions.ts
  function duplicateSibling(target, position) {
    const clone = target.cloneNode(true);
    clone.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
    clone.classList.remove("p9r-active");
    clone.querySelectorAll(`[${p9r.attr.EDITOR.IS_EDITOR}]`).forEach((el) => {
      el.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
      el.classList.remove("p9r-active");
    });
    if (position === "before")
      target.before(clone);
    else
      target.after(clone);
  }
  function resolveDefaultTag(target) {
    const parentId = target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
    if (!parentId)
      return "p";
    const parentEditor = document.compIdentifierToEditor?.get(parentId);
    if (!parentEditor)
      return "p";
    const slotName = target.getAttribute("slot");
    const compSyncs = parentEditor.queryPanelChildren("p9r-comp-sync");
    for (const cs of compSyncs) {
      const template = cs.firstElementChild;
      if (!template)
        continue;
      const tSlot = template.getAttribute("slot");
      if ((slotName ?? null) === (tSlot ?? null)) {
        return template.tagName.toLowerCase();
      }
    }
    return "p";
  }
  function insertBlankSibling(target, position) {
    const tag = resolveDefaultTag(target);
    const fresh = document.createElement(tag);
    inheritLayoutAttrs(target, fresh);
    fresh.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
    if (position === "before")
      target.before(fresh);
    else
      target.after(fresh);
  }
  function inheritLayoutAttrs(source, dest) {
    if (source.hasAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)) {
      dest.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, source.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER));
    }
    if (source.hasAttribute("slot")) {
      dest.setAttribute("slot", source.getAttribute("slot"));
    }
  }
  function openChangeComponentPicker(target, onDone) {
    const library = BlocLibrary.open();
    library.addEventListener("insert", (e) => {
      const detail = e.detail;
      if (detail.type === "template") {
        const fragment = document.createRange().createContextualFragment(detail.html);
        Array.from(fragment.children).forEach((el) => {
          el.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        });
        target.replaceWith(fragment);
      } else if (detail.type === "snippet") {
        const newEl = document.createElement("w13c-snippet");
        newEl.setAttribute("identifier", detail.identifier);
        inheritLayoutAttrs(target, newEl);
        newEl.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        target.replaceWith(newEl);
      } else {
        const newEl = document.createElement(detail.id);
        inheritLayoutAttrs(target, newEl);
        newEl.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
        target.replaceWith(newEl);
      }
      onDone();
    });
  }

  // src/control/components/editor/EditorSystem/BlocActions/BlocActions.ts
  class BlocActions extends s {
    _target = null;
    _editor = null;
    _hoverEl = null;
    _insertTarget = null;
    _insertEditor = null;
    _insertConfig = { before: false, after: false };
    _lastConfigKey = "";
    _btnBefore;
    _btnAfter;
    _cooldown = false;
    _resizeObserver;
    _pinMenu = null;
    _metaEl;
    _positionLocked = false;
    constructor() {
      super();
      const style = document.createElement("style");
      style.textContent = style_default3;
      this.shadowRoot.appendChild(style);
      this._metaEl = document.createElement("div");
      this._metaEl.className = "p9r-bag-meta";
      this.shadowRoot.insertBefore(this._metaEl, this.shadowRoot.querySelector("nav"));
      BlocActions._injectInsertBtnStyles();
      this._btnBefore = this._createInsertButton("before");
      this._btnAfter = this._createInsertButton("after");
      this._btnBefore.addEventListener("click", () => this._insertBlank("before"));
      this._btnAfter.addEventListener("click", () => this._insertBlank("after"));
      this._resizeObserver = new ResizeObserver(() => this._reflow());
    }
    static _stylesInjected = false;
    static _injectInsertBtnStyles() {
      if (BlocActions._stylesInjected)
        return;
      const style = document.createElement("style");
      style.textContent = insert_btn_default;
      document.head.appendChild(style);
      BlocActions._stylesInjected = true;
    }
    _createInsertButton(position) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = insert_btn_default2.trim();
      const btn = wrapper.firstElementChild;
      btn.classList.add(`p9r-insert-btn--${position}`);
      return btn;
    }
    connectedCallback() {
      super.connectedCallback();
      this.parentElement?.appendChild(this._btnBefore);
      this.parentElement?.appendChild(this._btnAfter);
    }
    setEditor(editor) {
      const allDisabled = Array.from(editor.actionBarConfiguration.values()).every((v) => v === false);
      const hasCustomActions = editor.customActions.length > 0;
      const hasStateSyncs = editor.stateSyncs.length > 0;
      if (allDisabled && !hasCustomActions && !hasStateSyncs && !editor.hasConfigPanel) {
        this.close();
        this._editor = null;
        this._target = null;
        return;
      }
      if (this._listenersAttached) {
        this._hoverEl?.removeEventListener("mouseleave", this.handleLeave);
        this._hoverEl?.removeEventListener("mousemove", this.handleMouseMove);
      }
      this._target?.classList.remove("p9r-active");
      this._editor = editor;
      this._target = editor.target;
      this._hoverEl = editor.getActionBarAnchor?.() ?? editor.target;
      if (this._listenersAttached) {
        this._hoverEl.addEventListener("mouseleave", this.handleLeave);
        this._hoverEl.addEventListener("mousemove", this.handleMouseMove);
      }
      this._resolveInsertTarget();
    }
    _resolveInsertTarget() {
      let ed = this._editor;
      let target = this._target;
      while (ed && target) {
        const cfg = ed.actionBarConfiguration;
        if (cfg.get("addBefore") || cfg.get("addAfter")) {
          this._insertTarget = target;
          this._insertEditor = ed;
          this._insertConfig = { before: !!cfg.get("addBefore"), after: !!cfg.get("addAfter") };
          return;
        }
        const parentId = target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (!parentId)
          break;
        const parentEd = document.compIdentifierToEditor?.get(parentId);
        if (!parentEd)
          break;
        ed = parentEd;
        target = parentEd.target;
      }
      this._insertTarget = this._target;
      this._insertEditor = this._editor;
      this._insertConfig = { before: false, after: false };
    }
    open(mouseX, mouseY) {
      if (!this._editor || !this._target || this._cooldown)
        return;
      this.smartRender();
      this._updateMeta();
      const targetRect = this._target.getBoundingClientRect();
      const { rect: anchorRect, element: anchorEl } = resolveActionBarAnchor(this._target, this._editor);
      this._hoverEl = anchorEl;
      const mx = mouseX ?? this._lastMouseX;
      const my = mouseY ?? (this._lastVAnchor === "top" ? anchorRect.top : anchorRect.bottom);
      const { x, y, vAnchor } = computeGroupPosition({
        rect: anchorRect,
        barWidth: this.offsetWidth,
        barHeight: this.offsetHeight,
        mouseX: mx,
        mouseY: my
      });
      this._lastMouseX = mx;
      this._lastMouseY = my;
      this._lastVAnchor = vAnchor;
      this.setAttribute("data-v-anchor", vAnchor);
      this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      this.style.visibility = "visible";
      this.style.opacity = "1";
      this.style.pointerEvents = "auto";
      this._positionInsertButtons(targetRect);
      this._resizeObserver.disconnect();
      this._resizeObserver.observe(this._target);
      if (anchorEl && anchorEl !== this._target) {
        this._resizeObserver.observe(anchorEl);
      }
      this._target.classList.add("p9r-active");
      this.addEventListeners();
      this._refineBreadcrumbPosition();
    }
    close() {
      this._closePinMenu();
      this._target?.classList.remove("p9r-active");
      document.querySelectorAll(".p9r-breadcrumb-hover").forEach((el) => el.classList.remove("p9r-breadcrumb-hover"));
      this.style.visibility = "hidden";
      this.style.opacity = "0";
      this.style.pointerEvents = "none";
      this._btnBefore.style.display = "none";
      this._btnAfter.style.display = "none";
      this._resizeObserver.disconnect();
      this.removeEventListeners();
      this._positionLocked = false;
    }
    _lastMouseX = 0;
    _lastMouseY = 0;
    _lastVAnchor = "bottom";
    _mouseMoveRaf = null;
    _reflow() {
      if (!this._target)
        return;
      const targetRect = this._target.getBoundingClientRect();
      if (!this._positionLocked) {
        const { rect: anchorRect } = resolveActionBarAnchor(this._target, this._editor);
        const { x, y, vAnchor } = computeGroupPosition({
          rect: anchorRect,
          barWidth: this.offsetWidth,
          barHeight: this.offsetHeight,
          mouseX: this._lastMouseX,
          mouseY: this._lastMouseY
        });
        this._lastVAnchor = vAnchor;
        this.setAttribute("data-v-anchor", vAnchor);
        this.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      this._btnBefore.style.display = "none";
      this._btnAfter.style.display = "none";
      this._positionInsertButtons(targetRect);
      this._refineBreadcrumbPosition();
    }
    handleMouseMove = (e) => {
      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
      if (this._mouseMoveRaf !== null)
        return;
      this._mouseMoveRaf = requestAnimationFrame(() => {
        this._mouseMoveRaf = null;
        if (!this._listenersAttached)
          return;
        this._reflow();
      });
    };
    _positionInsertButtons(_rect) {
      if (!this._insertTarget)
        return;
      const { rect: insertRect } = resolveActionBarAnchor(this._insertTarget, this._insertEditor);
      const isInline = this._insertTarget.hasAttribute(p9r.attr.ACTION.INLINE_ADDING);
      positionInsertButtons(this._btnBefore, this._btnAfter, insertRect, isInline, this._insertConfig);
    }
    _insertBlank(position) {
      if (!this._insertTarget)
        return;
      insertBlankSibling(this._insertTarget, position);
      this.close();
      this._cooldown = true;
      requestAnimationFrame(() => {
        this._cooldown = false;
      });
    }
    _duplicate() {
      if (!this._target)
        return;
      duplicateSibling(this._target, "after");
      this.close();
      this._cooldown = true;
      requestAnimationFrame(() => {
        this._cooldown = false;
      });
    }
    _changeComponent() {
      if (!this._target)
        return;
      openChangeComponentPicker(this._target, () => this.close());
    }
    _listenersAttached = false;
    addEventListeners() {
      if (this._listenersAttached)
        return;
      this.addEventListener("action-click", this.handleBlocActionClick);
      this.addEventListener("mouseleave", this.handleLeave);
      this._hoverEl?.addEventListener("mouseleave", this.handleLeave);
      this._hoverEl?.addEventListener("mousemove", this.handleMouseMove);
      this._btnBefore.addEventListener("mouseenter", this.handleInsertBtnEnter);
      this._btnAfter.addEventListener("mouseenter", this.handleInsertBtnEnter);
      window.addEventListener("keydown", this.handleKeyDown);
      window.addEventListener("click", this.handleClickOutside);
      this._listenersAttached = true;
    }
    removeEventListeners() {
      if (!this._listenersAttached)
        return;
      this.removeEventListener("action-click", this.handleBlocActionClick);
      this.removeEventListener("mouseleave", this.handleLeave);
      this._hoverEl?.removeEventListener("mouseleave", this.handleLeave);
      this._hoverEl?.removeEventListener("mousemove", this.handleMouseMove);
      this._btnBefore.removeEventListener("mouseenter", this.handleInsertBtnEnter);
      this._btnAfter.removeEventListener("mouseenter", this.handleInsertBtnEnter);
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("click", this.handleClickOutside);
      if (this._mouseMoveRaf !== null) {
        cancelAnimationFrame(this._mouseMoveRaf);
        this._mouseMoveRaf = null;
      }
      this._listenersAttached = false;
    }
    handleInsertBtnEnter = () => {};
    handleKeyDown = (e) => {
      if (e.key === "Escape")
        this.close();
      if ((e.key === "Delete" || e.key === "Backspace") && this._target) {
        const active = document.activeElement;
        if (active && active.isContentEditable)
          return;
        const canDelete = this._editor?.actionBarConfiguration.get("delete");
        if (!canDelete)
          return;
        e.preventDefault();
        this._target.remove();
        this.close();
      }
    };
    handleClickOutside = (e) => {
      const target = e.target;
      if (this.contains(target))
        return;
      if (this._pinMenu?.contains(target))
        return;
      if (target === this._btnBefore || target === this._btnAfter)
        return;
      if (this._target?.contains(target))
        return;
      this.close();
    };
    handleLeave = (e) => {
      const toElement = e.relatedTarget;
      if (this.contains(toElement))
        return;
      if (this._pinMenu?.contains(toElement))
        return;
      if (toElement === this._btnBefore || toElement === this._btnAfter)
        return;
      const parentEditor = toElement?.closest?.(`[${p9r.attr.EDITOR.IS_EDITOR}]`);
      if (parentEditor && parentEditor.contains(this._target)) {
        parentEditor.dispatchEvent(new MouseEvent("mouseenter", { clientX: e.clientX, clientY: e.clientY, bubbles: false }));
        return;
      }
      this.close();
    };
    handleBlocActionClick = (e) => {
      switch (e.detail.action) {
        case "delete":
          this._target?.remove();
          this.close();
          break;
        case "edit":
          this._editor?.showConfigPanel();
          break;
        case "duplicate":
          this._duplicate();
          break;
        case "changeComponent":
          this._changeComponent();
          break;
        case "pin-state":
          this._handlePinClick();
          break;
        case "select-parent":
          this._selectParent();
          break;
        default: {
          const custom = this._editor?.customActions.find((a2) => a2.action === e.detail.action);
          custom?.handler();
        }
      }
    };
    _parentEditor() {
      const parentId = this._target?.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (!parentId)
        return null;
      return document.compIdentifierToEditor?.get(parentId) ?? null;
    }
    _ancestorChain() {
      if (!this._editor || !this._target)
        return [];
      const chain = [this._editor];
      let el = this._target;
      for (let i = 0;i < 20; i++) {
        const pid = el.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
        if (!pid)
          break;
        const pEd = document.compIdentifierToEditor?.get(pid);
        if (!pEd)
          break;
        chain.unshift(pEd);
        el = pEd.target;
      }
      return chain;
    }
    static _collapseChain(items) {
      if (items.length <= 5)
        return items;
      return [items[0], null, items[items.length - 3], items[items.length - 2], items[items.length - 1]];
    }
    _updateMeta() {
      const editorManager = getClosestEditorSystem(this);
      this._metaEl.innerHTML = "";
      this._metaEl.classList.remove("p9r-bag-meta--inline-left", "p9r-bag-meta--inline-right");
      if (!this._target || !this._editor)
        return;
      const observer = editorManager.observer;
      const chain = this._ancestorChain().map((ed) => {
        const label = observer?.getLabel(ed.target.tagName.toLowerCase());
        return label ? { editor: ed, label } : null;
      }).filter((it) => it !== null);
      if (chain.length === 0)
        return;
      const rendered = BlocActions._collapseChain(chain);
      rendered.forEach((it, idx) => {
        const isLast = idx === rendered.length - 1;
        let node;
        if (it === null) {
          node = document.createElement("span");
          node.className = "p9r-bag-meta__ellipsis";
          node.textContent = "…";
        } else if (isLast) {
          node = document.createElement("span");
          node.className = "p9r-bag-meta__current";
          node.textContent = it.label;
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "p9r-bag-meta__parent";
          btn.textContent = it.label;
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            this._switchToEditor(it.editor);
          });
          btn.addEventListener("mouseenter", () => {
            it.editor.target.classList.add("p9r-breadcrumb-hover");
          });
          btn.addEventListener("mouseleave", () => {
            it.editor.target.classList.remove("p9r-breadcrumb-hover");
          });
          node = btn;
        }
        this._metaEl.appendChild(node);
        if (!isLast) {
          const sep = document.createElement("span");
          sep.className = "p9r-bag-meta__sep";
          sep.textContent = "›";
          this._metaEl.appendChild(sep);
        }
      });
    }
    _switchToEditor(target) {
      const savedTransform = this.style.transform;
      const savedVAnchor = this.getAttribute("data-v-anchor");
      this._positionLocked = true;
      this.setEditor(target);
      this.open();
      this.style.transform = savedTransform;
      if (savedVAnchor !== null) {
        this.setAttribute("data-v-anchor", savedVAnchor);
        this._lastVAnchor = savedVAnchor;
        this._refineBreadcrumbPosition();
      }
    }
    _selectParent() {
      const parent = this._parentEditor();
      if (!parent)
        return;
      this._switchToEditor(parent);
    }
    _refineBreadcrumbPosition() {
      this._metaEl.classList.remove("p9r-bag-meta--inline-left", "p9r-bag-meta--inline-right");
      if (!this._metaEl.children.length)
        return;
      const margin = 4;
      const metaRect = this._metaEl.getBoundingClientRect();
      if (metaRect.width === 0 && metaRect.height === 0)
        return;
      const fitsVertically = metaRect.top >= margin && metaRect.bottom <= window.innerHeight - margin;
      if (fitsVertically)
        return;
      const barRect = this.getBoundingClientRect();
      const leftSpace = barRect.left - margin;
      const rightSpace = window.innerWidth - barRect.right - margin;
      const side = leftSpace >= metaRect.width || leftSpace >= rightSpace ? "left" : "right";
      this._metaEl.classList.add(`p9r-bag-meta--inline-${side}`);
    }
    _handlePinClick() {
      const syncs = this._editor?.stateSyncs ?? [];
      if (syncs.length === 0)
        return;
      if (syncs.length === 1) {
        this._togglePin(syncs[0]);
        this._refreshPinButton();
        return;
      }
      this._togglePinMenu(syncs);
    }
    _togglePin(sync) {
      sync.toggle();
      this._editor?.notifyPinStateChanged(sync);
    }
    _refreshPinButton() {
      const btn = this.querySelector('[data-action="pin-state"]');
      if (!btn)
        return;
      const anyPinned = this._editor?.stateSyncs.some((s2) => s2.isPinned) ?? false;
      btn.toggleAttribute("data-active", anyPinned);
    }
    _togglePinMenu(syncs) {
      if (this._pinMenu) {
        this._closePinMenu();
        return;
      }
      const btn = this.querySelector('[data-action="pin-state"]');
      if (!btn)
        return;
      const menu = document.createElement("div");
      menu.className = "p9r-pin-menu";
      const title = document.createElement("div");
      title.className = "p9r-pin-menu__title";
      title.textContent = "Pin state";
      menu.appendChild(title);
      const renderItem = (sync) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "p9r-pin-menu__item";
        item.innerHTML = `
                <span class="p9r-pin-menu__icon">${ICON_PIN}</span>
                <span class="p9r-pin-menu__label"></span>
            `;
        item.querySelector(".p9r-pin-menu__label").textContent = sync.label;
        const setState = () => item.toggleAttribute("data-active", sync.isPinned);
        setState();
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          this._togglePin(sync);
          setState();
          this._refreshPinButton();
        });
        return item;
      };
      for (const sync of syncs)
        menu.appendChild(renderItem(sync));
      const rect = btn.getBoundingClientRect();
      menu.style.left = `${rect.left}px`;
      menu.style.top = `${rect.bottom}px`;
      document.body.appendChild(menu);
      this._pinMenu = menu;
    }
    _closePinMenu() {
      this._pinMenu?.remove();
      this._pinMenu = null;
    }
    _toggle(action, show) {
      this.querySelector(`[data-action="${action}"]`)?.toggleAttribute("hidden", !show);
    }
    smartRender() {
      const config = this._editor.actionBarConfiguration;
      const hasConfig = this._editor.hasConfigPanel;
      const variant = this._editor.variant;
      const customActions = this._editor.customActions;
      const customKey = customActions.map((a2) => a2.action).join(",");
      const stateSyncCount = this._editor.stateSyncs.length;
      const parent = this._parentEditor();
      const hasAnyButton = hasConfig || !!config.get("duplicate") || !!config.get("delete") || !!config.get("changeComponent") || customActions.length > 0 || stateSyncCount > 0;
      const showSelectParent = !!parent && hasAnyButton;
      const currentConfigKey = JSON.stringify(Array.from(config.entries())) + hasConfig + variant + customKey + "|s=" + stateSyncCount + "|p=" + showSelectParent;
      if (this._lastConfigKey === currentConfigKey)
        return;
      this._lastConfigKey = currentConfigKey;
      this.setAttribute("data-variant", variant);
      this.innerHTML = template_default4;
      if (showSelectParent) {
        const btn = document.createElement("button");
        btn.setAttribute("data-action", "select-parent");
        btn.setAttribute("title", "Select parent");
        btn.innerHTML = ICON_PARENT;
        this.insertBefore(btn, this.firstChild);
      }
      this._toggle("edit", hasConfig);
      this._toggle("duplicate", config.get("duplicate"));
      this._toggle("changeComponent", config.get("changeComponent"));
      this._toggle("delete", config.get("delete"));
      if (customActions.length > 0) {
        const separator = this.querySelector('[data-group="delete"]');
        for (const action of customActions) {
          const btn = document.createElement("button");
          btn.setAttribute("data-action", action.action);
          btn.setAttribute("title", action.title);
          btn.innerHTML = action.icon;
          this.insertBefore(btn, separator);
        }
      }
      if (stateSyncCount > 0) {
        const separator = this.querySelector('[data-group="delete"]');
        const btn = document.createElement("button");
        btn.setAttribute("data-action", "pin-state");
        btn.setAttribute("title", stateSyncCount === 1 ? `Pin: ${this._editor.stateSyncs[0].label}` : "Pin state");
        btn.innerHTML = ICON_PIN;
        this.insertBefore(btn, separator);
        this._refreshPinButton();
      }
      const hasLeftButtons = hasConfig || config.get("duplicate") || config.get("changeComponent") || customActions.length > 0 || stateSyncCount > 0;
      this.querySelector('[data-group="delete"]')?.toggleAttribute("hidden", !config.get("delete") || !hasLeftButtons);
    }
  }
  if (!customElements.get("cms-bloc-actions")) {
    customElements.define("cms-bloc-actions", BlocActions);
  }

  // src/control/components/editor/EditorSystem/DragManager.ts
  var DRAG_PILL_WIDTH = 180;
  var DRAG_PILL_HEIGHT = 32;

  class DragManager {
    draggedElement = null;
    _originalDisplay = "";
    _ghost = null;
    _indicator = null;
    _dropTarget = null;
    _dropPosition = null;
    _onDragStart = (e) => this.handleDragStart(e);
    _onDragOver = (e) => this.handleDragOver(e);
    _onDrop = (e) => this.handleDrop(e);
    _onDragEnd = () => this.handleDragEnd();
    _container;
    constructor(container) {
      this._container = container;
      container.addEventListener("dragstart", this._onDragStart);
      container.addEventListener("dragover", this._onDragOver);
      container.addEventListener("drop", this._onDrop);
      container.addEventListener("dragend", this._onDragEnd);
    }
    dispose() {
      this._container.removeEventListener("dragstart", this._onDragStart);
      this._container.removeEventListener("dragover", this._onDragOver);
      this._container.removeEventListener("drop", this._onDrop);
      this._container.removeEventListener("dragend", this._onDragEnd);
      this._finalize();
    }
    handleDragStart(e) {
      this.draggedElement = e.target.closest(".editor-block");
      if (!this.draggedElement)
        return;
      e.dataTransfer?.setData("text/plain", "");
      this._setGhostImage(e);
      this.draggedElement.classList.add("dragging");
      document.EditorManager?.getBlocActionGroup()?.close();
      document.querySelector("w13c-editor-toolbar")?.hide?.();
      this._originalDisplay = this.draggedElement.style.display;
      const toHide = this.draggedElement;
      setTimeout(() => {
        if (this.draggedElement === toHide)
          toHide.style.display = "none";
      }, 0);
      this._createIndicator();
    }
    handleDragOver(e) {
      e.preventDefault();
      if (!this.draggedElement)
        return;
      const target = this._pickTarget(e);
      if (!target) {
        this._hideIndicator();
        return;
      }
      const rect = target.getBoundingClientRect();
      const horizontal = this._isHorizontalFlow(target);
      const after = horizontal ? (e.clientX - rect.left) / (rect.right - rect.left) > 0.5 : (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      this._dropTarget = target;
      this._dropPosition = after ? "after" : "before";
      this._showIndicator(target, after, horizontal);
    }
    _isHorizontalFlow(target) {
      const parent = target.parentElement;
      if (!parent)
        return false;
      const cs = getComputedStyle(parent);
      const display = cs.display;
      if (display.includes("inline"))
        return true;
      if (display.endsWith("flex")) {
        return cs.flexDirection.startsWith("row");
      }
      if (display.endsWith("grid")) {
        return true;
      }
      return false;
    }
    _pickTarget(e) {
      const el = e.target?.closest?.(".editor-block");
      if (!el)
        return null;
      if (el === this.draggedElement)
        return null;
      if (this.draggedElement && el.contains(this.draggedElement))
        return null;
      if (el.getAttribute(p9r.attr.ACTION.DISABLE_DRAGGING) === "true")
        return null;
      return el;
    }
    handleDrop(e) {
      e.preventDefault();
      this._commitDrop();
      this._finalize();
    }
    handleDragEnd() {
      this._finalize();
    }
    _commitDrop() {
      if (!this.draggedElement || !this._dropTarget || !this._dropPosition)
        return;
      this._matchSlot(this._dropTarget.getAttribute("slot"));
      const parent = this._dropTarget.parentElement;
      if (!parent)
        return;
      if (this._dropPosition === "after") {
        parent.insertBefore(this.draggedElement, this._dropTarget.nextSibling);
      } else {
        parent.insertBefore(this.draggedElement, this._dropTarget);
      }
    }
    _matchSlot(slotName) {
      if (!this.draggedElement)
        return;
      const current = this.draggedElement.getAttribute("slot");
      if (slotName === current)
        return;
      if (slotName) {
        this.draggedElement.setAttribute("slot", slotName);
      } else {
        this.draggedElement.removeAttribute("slot");
      }
    }
    _setGhostImage(e) {
      if (!e.dataTransfer || !this.draggedElement)
        return;
      const ghost = document.createElement("div");
      ghost.className = "p9r-drag-ghost";
      Object.assign(ghost.style, {
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: `${DRAG_PILL_WIDTH}px`,
        height: `${DRAG_PILL_HEIGHT}px`,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px",
        boxSizing: "border-box",
        background: "rgba(30, 41, 59, 0.95)",
        color: "#fff",
        border: "1px solid rgba(67, 97, 238, 0.8)",
        borderRadius: "999px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "12px",
        fontWeight: "600",
        lineHeight: "1",
        pointerEvents: "none",
        overflow: "hidden",
        whiteSpace: "nowrap"
      });
      ghost.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round"
                 style="flex-shrink:0;opacity:0.8">
                <circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/>
                <circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>
            </svg>
            <span style="overflow:hidden;text-overflow:ellipsis"></span>
        `;
      ghost.querySelector("span").textContent = `<${this.draggedElement.tagName.toLowerCase()}>`;
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 16, DRAG_PILL_HEIGHT / 2);
      this._ghost = ghost;
    }
    _createIndicator() {
      const ind = document.createElement("div");
      ind.className = "p9r-drop-indicator";
      Object.assign(ind.style, {
        position: "fixed",
        height: "3px",
        background: "rgba(67, 97, 238, 1)",
        borderRadius: "2px",
        boxShadow: "0 0 8px rgba(67, 97, 238, 0.6)",
        pointerEvents: "none",
        zIndex: "999999",
        opacity: "0",
        left: "0",
        top: "0",
        width: "0"
      });
      document.body.appendChild(ind);
      this._indicator = ind;
    }
    _showIndicator(target, after, horizontal) {
      if (!this._indicator)
        return;
      const r = target.getBoundingClientRect();
      if (horizontal) {
        const x = (after ? r.right : r.left) - 1.5;
        this._indicator.style.left = `${x}px`;
        this._indicator.style.top = `${r.top}px`;
        this._indicator.style.width = "3px";
        this._indicator.style.height = `${r.height}px`;
      } else {
        const y = (after ? r.bottom : r.top) - 1.5;
        this._indicator.style.left = `${r.left}px`;
        this._indicator.style.top = `${y}px`;
        this._indicator.style.width = `${r.width}px`;
        this._indicator.style.height = "3px";
      }
      this._indicator.style.opacity = "1";
    }
    _hideIndicator() {
      if (this._indicator)
        this._indicator.style.opacity = "0";
      this._dropTarget = null;
      this._dropPosition = null;
    }
    _finalize() {
      if (this.draggedElement) {
        this.draggedElement.style.display = this._originalDisplay;
        this.draggedElement.classList.remove("dragging");
      }
      this._ghost?.remove();
      this._ghost = null;
      this._indicator?.remove();
      this._indicator = null;
      this._dropTarget = null;
      this._dropPosition = null;
      this.draggedElement = null;
    }
  }

  // src/control/components/editor/EditorSystem/EditorRoot/style.css
  var style_default5 = "";

  // src/control/components/editor/EditorSystem/EditorRoot/template.html
  var template_default6 = `<div>
    <div id="workingElement">
        <slot></slot>
    </div>
    <div id="editorSystem">
        <cms-floating-toolbar />
        <cms-richtextbar />
        <cms-bloc-actions />
        <cms-bloc-library />

        <slot name="configuration"></slot>
    </div>
</div>`;

  // src/control/core/isToggable.ts
  function isToggable(el) {
    return "open" in el && typeof el.open === "function";
  }

  // src/control/core/editorSystem/Editor/PinMode.ts
  class PinMode {
    _target;
    _stateSyncs;
    _onUnpinAll;
    static _stylesInjected = false;
    _btn = null;
    _resizeObs = null;
    _reflow = () => this._position();
    _rafId = 0;
    _lastRect = null;
    constructor(_target, _stateSyncs, _onUnpinAll) {
      this._target = _target;
      this._stateSyncs = _stateSyncs;
      this._onUnpinAll = _onUnpinAll;
    }
    get active() {
      return this._btn !== null;
    }
    enter() {
      PinMode._injectStyles();
      if (this._btn) {
        this._position();
        return;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "p9r-unpin-btn";
      btn.title = "Unpin state";
      btn.innerHTML = `${ICON_PIN}<span>Unpin</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._onUnpinAll();
      });
      this._btn = btn;
      document.body.appendChild(btn);
      window.addEventListener("scroll", this._reflow, { passive: true, capture: true });
      window.addEventListener("resize", this._reflow);
      this._resizeObs = new ResizeObserver(this._reflow);
      this._resizeObs.observe(this._target);
      this._resizeObs.observe(document.body);
      this._startRectWatch();
      this._position();
    }
    exit() {
      if (!this._btn)
        return;
      this._btn.remove();
      this._btn = null;
      window.removeEventListener("scroll", this._reflow, { capture: true });
      window.removeEventListener("resize", this._reflow);
      this._resizeObs?.disconnect();
      this._resizeObs = null;
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = 0;
      }
      this._lastRect = null;
    }
    _startRectWatch() {
      const tick = () => {
        if (!this._btn)
          return;
        const r = this._target.getBoundingClientRect();
        const last = this._lastRect;
        if (!last || last.x !== r.left || last.y !== r.top || last.w !== r.width || last.h !== r.height) {
          this._lastRect = { x: r.left, y: r.top, w: r.width, h: r.height };
          this._position();
        }
        this._rafId = requestAnimationFrame(tick);
      };
      this._rafId = requestAnimationFrame(tick);
    }
    _position() {
      if (!this._btn)
        return;
      const rect = this._target.getBoundingClientRect();
      const placement = this._stateSyncs.find((s2) => s2.isPinned)?.placement ?? "left";
      const gap = 8;
      const bw = this._btn.offsetWidth;
      const bh = this._btn.offsetHeight;
      let x = 0, y = 0;
      switch (placement) {
        case "right":
          x = rect.right + gap;
          y = rect.top + rect.height / 2 - bh / 2;
          break;
        case "top":
          x = rect.left + rect.width / 2 - bw / 2;
          y = rect.top - bh - gap;
          break;
        case "bottom":
          x = rect.left + rect.width / 2 - bw / 2;
          y = rect.bottom + gap;
          break;
        default:
          x = rect.left - bw - gap;
          y = rect.top + rect.height / 2 - bh / 2;
      }
      x = Math.max(4, Math.min(x, window.innerWidth - bw - 4));
      y = Math.max(4, Math.min(y, window.innerHeight - bh - 4));
      this._btn.style.left = `${x}px`;
      this._btn.style.top = `${y}px`;
    }
    static _injectStyles() {
      if (PinMode._stylesInjected)
        return;
      const style = document.createElement("style");
      style.textContent = `
.p9r-unpin-btn {
    position: fixed;
    z-index: 10002;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border-radius: 14px;
    border: 1px solid var(--primary-base, #4361ee);
    background: var(--bg-surface, #fff);
    color: var(--primary-base, #4361ee);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.p9r-unpin-btn svg { width: 14px; height: 14px; }
.p9r-unpin-btn:hover { background: var(--primary-base, #4361ee); color: #fff; }
`;
      document.head.appendChild(style);
      PinMode._stylesInjected = true;
    }
  }

  // src/control/core/editorSystem/Editor/Editor.ts
  class Editor {
    targetIdentifier;
    target;
    styleElement;
    static bodyStyle = new Map;
    _holdsBodyStyle = false;
    _panelConfig = null;
    _panelFragment = null;
    _panelSyncs = [];
    variant = "default";
    customActions = [];
    stateSyncs = [];
    _pinMode;
    _actionBarFeatures = new Map([
      ["delete", true],
      ["duplicate", true],
      ["addBefore", false],
      ["addAfter", false],
      ["changeComponent", false],
      ["saveAsTemplate", false]
    ]);
    constructor(target, styles, editor) {
      this.target = target;
      this.styleElement = document.createElement("style");
      this.styleElement.innerHTML = styles;
      this.targetIdentifier = crypto.randomUUID();
      this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier);
      if (!document.compIdentifierToEditor)
        document.compIdentifierToEditor = new Map;
      document.compIdentifierToEditor.set(this.targetIdentifier, this);
      this._pinMode = new PinMode(this.target, this.stateSyncs, () => {
        this.stateSyncs.forEach((s2) => s2.unpin());
        this.notifyPinStateChanged();
      });
      if (editor) {
        this._initPanelFragment(editor);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.target.removeAttribute(p9r.attr.EDITOR.IS_CREATING);
        });
      });
      if (document.EditorManager?.getBlocActionGroup()) {
        document.EditorManager.getBlocActionGroup().close();
      }
    }
    onSwitchMode(mode) {
      if (mode === p9r.mode.EDITOR)
        this.viewEditor();
      else
        this.viewClient();
    }
    _setPanelItemIdentifiers() {
      if (!this._panelConfig)
        return;
      const panelItems = this._panelConfig.querySelectorAll("*");
      panelItems.forEach((item) => {
        item.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.targetIdentifier);
      });
    }
    _initPanelFragment(editor) {
      this._panelFragment = document.createRange().createContextualFragment(editor);
      try {
        customElements.upgrade(this._panelFragment);
      } catch {}
      this._panelFragment.querySelectorAll("*").forEach((el) => {
        el.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, this.targetIdentifier);
      });
      this._panelSyncs = Array.from(this._panelFragment.querySelectorAll("p9r-comp-sync, p9r-image-sync, p9r-attr-sync, p9r-state-sync"));
      for (const sync of this._panelSyncs) {
        sync.prepare?.(this.target, this);
      }
    }
    _ensurePanelBuilt() {
      if (this._panelConfig || !this._panelFragment)
        return;
      this._panelConfig = document.createElement("p9r-config-panel");
      this._panelConfig.appendChild(this._panelFragment);
      this._panelFragment = null;
      document.EditorManager.getEditorSystemHTMLElement().append(this._panelConfig);
    }
    get hasConfigPanel() {
      return this._panelConfig != null || this._panelFragment != null;
    }
    queryPanelChildren(selector) {
      if (this._panelConfig)
        return Array.from(this._panelConfig.querySelectorAll(selector));
      if (this._panelFragment)
        return Array.from(this._panelFragment.querySelectorAll(selector));
      return [];
    }
    _notifyPanelSyncs(opts) {
      if (this._panelConfig) {
        this._panelConfig.init(opts);
        return;
      }
      for (const sync of this._panelSyncs) {
        sync.init?.(opts);
      }
    }
    handleHover = (e) => {
      document.EditorManager.getBlocActionGroup().setEditor(this);
      document.EditorManager.getBlocActionGroup().open(e.clientX, e.clientY);
    };
    refreshActionBarFeatures() {
      this._actionBarFeatures.set("delete", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DELETE) !== "true");
      this._actionBarFeatures.set("duplicate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE) !== "true");
      this._actionBarFeatures.set("addBefore", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE) !== "true");
      this._actionBarFeatures.set("addAfter", this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER) !== "true");
      this._actionBarFeatures.set("changeComponent", this.target.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT) !== "true");
      this._actionBarFeatures.set("saveAsTemplate", this.target.getAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE) !== "true");
    }
    registerStateSync(sync) {
      if (!this.stateSyncs.includes(sync))
        this.stateSyncs.push(sync);
    }
    unregisterStateSync(sync) {
      const i = this.stateSyncs.indexOf(sync);
      if (i >= 0)
        this.stateSyncs.splice(i, 1);
    }
    getActionBarAnchor() {
      return null;
    }
    _hoverElement = null;
    notifyPinStateChanged(stateSync) {
      const anyPinned = this.stateSyncs.some((s2) => s2.isPinned);
      if (anyPinned) {
        this._unbindHover();
        document.EditorManager?.getBlocActionGroup()?.close();
        this._pinMode.enter();
      } else {
        this._pinMode.exit();
        if (this._hasInteractiveFeatures()) {
          this._bindHover();
        }
      }
      this.onEditorPinState?.(anyPinned, stateSync);
    }
    _bindHover() {
      this._unbindHover();
      this._hoverElement = this.getActionBarAnchor() ?? this.target;
      this._hoverElement.addEventListener("mouseenter", this.handleHover);
    }
    _unbindHover() {
      this._hoverElement?.removeEventListener("mouseenter", this.handleHover);
      this._hoverElement = null;
    }
    _hasInteractiveFeatures() {
      return this._actionBarFeatures.values().some((v) => v === true) || this.stateSyncs.length > 0 || this.customActions.length > 0;
    }
    viewClient() {
      this.stateSyncs.forEach((s2) => s2.unpin());
      this._pinMode.exit();
      this.restore();
      this._unbindHover();
      this.target.style.removeProperty("pointer-events");
      if (this.target.getAttribute("style") === "") {
        this.target.removeAttribute("style");
      }
      this._releaseBodyStyle();
      if (this.target.shadowRoot)
        this.styleElement.remove();
      this.target.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
      this.target.classList.remove("editor-block");
      this.target.removeAttribute("draggable");
      if (this.target.getAttribute("class") === "") {
        this.target.removeAttribute("class");
      }
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DELETE);
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE);
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE);
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER);
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT);
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE);
      this.target.removeAttribute(p9r.attr.ACTION.INLINE_ADDING);
      this.target.removeAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE);
      this.target.removeAttribute(p9r.attr.ACTION.DISABLE_DRAGGING);
      this.target.removeAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT);
      this.target.removeAttribute(p9r.attr.EDITOR.IDENTIFIER);
      this.target.removeAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
    }
    viewEditor() {
      this._setPanelItemIdentifiers();
      this._notifyPanelSyncs();
      this.init();
      if (!this.target.shadowRoot) {
        this._acquireBodyStyle();
      } else {
        this.target.shadowRoot.append(this.styleElement);
      }
      this.target.setAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE, "true");
      this.target.setAttribute(p9r.attr.EDITOR.IDENTIFIER, this.targetIdentifier);
      this.target.classList.add("editor-block");
      this.target.setAttribute(p9r.attr.EDITOR.IS_EDITOR, "true");
      if (this.target.hasAttribute(p9r.attr.ACTION.DISABLE_DRAGGING)) {
        this.target.setAttribute("draggable", "false");
      } else {
        this.target.draggable = true;
      }
      this.target.style.setProperty("pointer-events", "auto", "important");
      this.refreshActionBarFeatures();
      this._unbindHover();
      if (this._actionBarFeatures.values().some((v) => v === true) || this.stateSyncs.length > 0 || this.customActions.length > 0) {
        this._bindHover();
      }
    }
    dispose() {
      document.compIdentifierToEditor?.delete(this.targetIdentifier);
      this._unbindHover();
      this._pinMode.exit();
      this._panelConfig?.remove();
      this._panelConfig = null;
      this._panelFragment = null;
      this._panelSyncs = [];
      this._releaseBodyStyle();
      this.styleElement.remove();
    }
    _acquireBodyStyle() {
      if (this._holdsBodyStyle)
        return;
      const tag = this.target.tagName;
      let entry = Editor.bodyStyle.get(tag);
      if (!entry) {
        document.body.append(this.styleElement);
        entry = { el: this.styleElement, count: 0 };
        Editor.bodyStyle.set(tag, entry);
      }
      entry.count++;
      this._holdsBodyStyle = true;
    }
    _releaseBodyStyle() {
      if (!this._holdsBodyStyle)
        return;
      const tag = this.target.tagName;
      const entry = Editor.bodyStyle.get(tag);
      this._holdsBodyStyle = false;
      if (!entry)
        return;
      entry.count--;
      if (entry.count <= 0) {
        entry.el.remove();
        Editor.bodyStyle.delete(tag);
      }
    }
    onChildrenRemoved(removedNode) {
      this._notifyPanelSyncs({ removed: removedNode });
    }
    onChildrenAdded(addedNode) {
      this._notifyPanelSyncs({ added: addedNode });
    }
    get actionBarConfiguration() {
      return this._actionBarFeatures;
    }
    get ensurePersistentIdentifier() {
      if (!this.target.hasAttribute(p9r.attr.EDITOR.PERSISTENT_IDENTIFIER)) {
        const generatedId = "ID-" + crypto.randomUUID();
        this.target.setAttribute(p9r.attr.EDITOR.PERSISTENT_IDENTIFIER, generatedId);
      }
      return this.target.getAttribute(p9r.attr.EDITOR.PERSISTENT_IDENTIFIER);
    }
    get persistentIdentifierAttrName() {
      return p9r.attr.EDITOR.PERSISTENT_IDENTIFIER;
    }
    showConfigPanel() {
      this._ensurePanelBuilt();
      this._panelConfig?.show();
    }
    addCustomAction(action) {
      this.customActions.push(action);
    }
  }

  // src/control/core/editorSystem/defaultEditors/ImageEditor/ResizeInstance.ts
  class ResizeInstance {
    isResizing = false;
    hasMoved = false;
    isPending = false;
    originX = 0;
    originY = 0;
    lastMouseX = 0;
    lastMouseY = 0;
    startWidth = 0;
    startHeight = 0;
    aspectRatio = 1;
    static MOVE_THRESHOLD = 4;
    target;
    onResizeCallback;
    constructor(target, onResize) {
      this.target = target;
      this.onResizeCallback = onResize;
      this.target.style.position = "relative";
    }
    start() {
      this.target.style.cursor = "nwse-resize";
      this.target.addEventListener("mousedown", this.onMouseDown);
      this.target.addEventListener("click", this.preventClickIfResizing, true);
    }
    stop() {
      this.target.style.cursor = "default";
      this.target.removeEventListener("mousedown", this.onMouseDown);
      this.target.removeEventListener("click", this.preventClickIfResizing, true);
      this.onMouseUp();
    }
    onMouseDown = (e) => {
      if (e.target === this.target) {
        this.isPending = true;
        this.isResizing = false;
        this.hasMoved = false;
        this.originX = e.clientX;
        this.originY = e.clientY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.startWidth = this.target.offsetWidth;
        this.startHeight = this.target.offsetHeight;
        this.aspectRatio = this.startWidth / this.startHeight;
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("mouseup", this.onMouseUp);
        e.preventDefault();
      }
    };
    onMouseMove = (e) => {
      if (!this.isPending && !this.isResizing)
        return;
      if (this.isPending && !this.isResizing) {
        const dx = Math.abs(e.clientX - this.originX);
        const dy = Math.abs(e.clientY - this.originY);
        if (dx < ResizeInstance.MOVE_THRESHOLD && dy < ResizeInstance.MOVE_THRESHOLD)
          return;
        this.isPending = false;
        this.isResizing = true;
      }
      this.hasMoved = true;
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      let newWidth = this.target.offsetWidth + deltaX;
      let newHeight = this.target.offsetHeight + deltaY;
      if (!e.shiftKey) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / this.aspectRatio;
        } else {
          newWidth = newHeight * this.aspectRatio;
        }
      }
      newWidth = Math.max(10, newWidth);
      newHeight = Math.max(10, newHeight);
      this.onResizeCallback(newWidth, newHeight);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    };
    onMouseUp = () => {
      this.isPending = false;
      setTimeout(() => {
        this.isResizing = false;
      }, 0);
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
    };
    preventClickIfResizing = (e) => {
      if (this.hasMoved) {
        e.stopImmediatePropagation();
        e.preventDefault();
        this.hasMoved = false;
      }
    };
  }

  // src/control/core/editorSystem/defaultEditors/ImageEditor/ImageEditor.ts
  var cssStyle = `
    img:hover {
        opacity: 0.5;
        cursor: nwse-resize;
    }
`;

  class ImageEditor extends Editor {
    resizeInstance;
    onClick = (e) => this.handleClick(e);
    onSelectMedia = (e) => this.handleSelectMedia(e);
    constructor(target) {
      super(target, cssStyle);
      if (!this.target.getAttribute("src"))
        this.target.setAttribute("src", "https://picsum.photos/200");
      this.resizeInstance = new ResizeInstance(this.target, (w, h) => {
        this.target.style.width = `${w}px`;
        this.target.style.height = `${h}px`;
      });
    }
    init() {
      this.target.removeEventListener("click", this.onClick);
      this.target.addEventListener("click", this.onClick);
      const insideComponent = this.target.parentElement?.closest(`[${p9r.attr.EDITOR.IS_EDITOR}]`);
      const allowResize = !insideComponent || this.target.hasAttribute(p9r.attr.ACTION.ALLOW_RESIZE_IMAGE);
      if (allowResize)
        this.resizeInstance.start();
    }
    handleSelectMedia(e) {
      this.target.setAttribute("src", e.detail.src);
      this.target.setAttribute("alt", e.detail.alt);
      document.EditorManager.getMediaCenter().removeEventListener("select-item", this.onSelectMedia);
    }
    handleClick(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const mediaCenter = document.EditorManager.getMediaCenter();
      mediaCenter.removeEventListener("select-item", this.onSelectMedia);
      mediaCenter.addEventListener("select-item", this.onSelectMedia);
      mediaCenter.show(["folder", "image"]);
    }
    restore() {
      this.target.removeEventListener("click", this.onClick);
      document.EditorManager.getMediaCenter().removeEventListener("select-item", this.onSelectMedia);
      this.resizeInstance.stop();
    }
  }

  // src/control/core/editorSystem/registerEditor.ts
  class EmptyEditor extends Editor {
    constructor(target) {
      super(target, "");
    }
    init() {}
    restore() {}
  }

  // src/control/core/editorSystem/defaultEditors/TextEditor.ts
  var cssStyle2 = `
:is(h1, h2, h3, h4, h5, h6, p, span, blockquote, a):empty::before {
    content: attr(p9r-text-placeholder);
    color: var(--text-muted, #aaa);
    pointer-events: none;
    display: block;
    font-style: italic;
    font-weight: 300;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
    :is(h1, h2, h3, h4, h5, h6, p, span, blockquote):empty {
        display: flex
    }
`;
  var textTags = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "a", "b", "i", "u"]);

  class TextEditor extends Editor {
    onKeyDown = (e) => this.handleKeyDown(e);
    onInput = (e) => this.handleInput(e);
    onPaste = (e) => this.handlePaste(e);
    isInitializing = false;
    constructor(target) {
      super(target, cssStyle2);
      this.observeAttributes();
    }
    attrObserver;
    observeAttributes() {
      this.attrObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.attributeName?.startsWith("p9r-")) {
            if (document.EditorManager.getMode() === p9r.mode.EDITOR) {
              if (!this.isInitializing) {
                this.isInitializing = true;
                this.init();
              }
            }
          }
        }
      });
    }
    onSwitchMode(mode) {
      super.onSwitchMode(mode);
      if (!this.attrObserver)
        return;
      if (mode === p9r.mode.EDITOR) {
        this.attrObserver.observe(this.target, {
          attributes: true,
          attributeFilter: [p9r.attr.TEXT.BLOC_MANAGEMENT, p9r.attr.TEXT.EDITABLE]
        });
      } else {
        this.isInitializing = false;
        this.attrObserver.disconnect();
      }
    }
    handlePaste(e) {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") || "";
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount)
        return;
      selection.deleteFromDocument();
      const textNode = document.createTextNode(text);
      const range = selection.getRangeAt(0);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    static _editorAttrs = new Set([
      "contenteditable",
      "tabindex",
      "draggable"
    ]);
    createElement(tag) {
      const element = document.createElement(tag);
      Array.from(this.target.attributes).forEach((attr) => {
        if (attr.name.startsWith("p9r-"))
          return;
        if (attr.name === "class")
          return;
        if (TextEditor._editorAttrs.has(attr.name))
          return;
        element.setAttribute(attr.name, attr.value);
      });
      const parentId = this.target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (parentId)
        element.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
      element.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
      return element;
    }
    handleKeyDown(e) {
      if (e.key === "Enter") {
        if (e.shiftKey)
          return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (this.isAddAfterDisabled)
          return;
        const nextEl = this.createElement("p");
        nextEl.contentEditable = "true";
        nextEl.tabIndex = 0;
        const sel = window.getSelection();
        if (sel && sel.rangeCount && sel.anchorNode && this.target.contains(sel.anchorNode) && this.target.lastChild) {
          const range = sel.getRangeAt(0);
          if (!range.collapsed)
            range.deleteContents();
          const tail = range.cloneRange();
          tail.setEndAfter(this.target.lastChild);
          const fragment = tail.extractContents();
          nextEl.appendChild(fragment);
        }
        this.target.after(nextEl);
        const observer = document.EditorManager?.getObserver?.();
        if (observer) {
          observer.make_it_editor(nextEl);
        } else {
          const e2 = new TextEditor(nextEl);
          e2.viewEditor();
        }
        this._focusWithCaret(nextEl, "start");
      }
      if (e.key === "Backspace" && this.target.innerHTML === "" && !this.isDeleteDisabled) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.restore();
        const previous = this.target.previousElementSibling;
        const next = this.target.nextElementSibling;
        if (previous)
          previous.focus();
        if (!previous && next)
          next.focus();
        this.target.remove();
      }
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const isUp = e.key === "ArrowUp";
        const onEdge = isUp ? this._isCaretOnFirstLine() : this._isCaretOnLastLine();
        if (!onEdge)
          return;
        const adjacent = this._findAdjacentTextEditor(isUp ? "prev" : "next");
        if (!adjacent)
          return;
        e.preventDefault();
        e.stopImmediatePropagation();
        this._focusWithCaret(adjacent, isUp ? "end" : "start");
      }
    }
    _isCaretOnFirstLine() {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount)
        return false;
      if (this.target.innerHTML === "")
        return true;
      const range = sel.getRangeAt(0);
      const rects = range.getClientRects();
      const targetTop = this.target.getBoundingClientRect().top;
      const first = rects[0];
      if (!first) {
        return true;
      }
      return Math.abs(first.top - targetTop) < 5;
    }
    _isCaretOnLastLine() {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount)
        return false;
      if (this.target.innerHTML === "")
        return true;
      const range = sel.getRangeAt(0);
      const rects = range.getClientRects();
      const targetBottom = this.target.getBoundingClientRect().bottom;
      const last = rects[rects.length - 1];
      if (!last)
        return true;
      return Math.abs(last.bottom - targetBottom) < 5;
    }
    _findAdjacentTextEditor(direction) {
      const selector = Array.from(textTags).map((t) => `${t}[contenteditable="true"]`).join(",");
      const all = Array.from(document.querySelectorAll(selector));
      const idx = all.indexOf(this.target);
      if (idx === -1)
        return null;
      return direction === "prev" ? all[idx - 1] ?? null : all[idx + 1] ?? null;
    }
    _focusWithCaret(el, position) {
      el.focus();
      const sel = window.getSelection();
      if (!sel)
        return;
      const range = document.createRange();
      if (el.innerHTML === "") {
        range.setStart(el, 0);
        range.collapse(true);
      } else if (position === "start") {
        range.selectNodeContents(el);
        range.collapse(true);
      } else {
        range.selectNodeContents(el);
        range.collapse(false);
      }
      sel.removeAllRanges();
      sel.addRange(range);
    }
    handleInput(e) {
      if (this.target.innerHTML === "<br>") {
        this.target.innerHTML = "";
      }
      if (this.target.innerText === "/" && this.isBlocManagementEnabled && !this.isChangeComponentDisabled) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        const actionbar = BlocLibrary.open();
        actionbar.addEventListener("insert", (e2) => {
          if (e2.detail.type === "template") {
            const fragment = document.createRange().createContextualFragment(e2.detail.html);
            this.target.replaceWith(fragment);
          } else if (e2.detail.type === "snippet") {
            const new_node = document.createElement("w13c-snippet");
            new_node.setAttribute("identifier", e2.detail.identifier);
            this.target.replaceWith(new_node);
          } else {
            const new_node = this.createElement(e2.detail.id);
            this.target.replaceWith(new_node);
          }
        }, { once: true });
      }
    }
    init() {
      this.target.removeEventListener("keydown", this.onKeyDown);
      this.target.removeEventListener("input", this.onInput);
      this.target.removeEventListener("paste", this.onPaste);
      this.target.addEventListener("keydown", this.onKeyDown);
      this.target.addEventListener("input", this.onInput);
      this.target.addEventListener("paste", this.onPaste);
      if (this.isTextEditable) {
        this.target.tabIndex = 0;
        this.target.contentEditable = "true";
        if (this.isBlocManagementEnabled && !this.isChangeComponentDisabled) {
          this.target.setAttribute(p9r.attr.TEXT.PLACEHOLDER, "Type / or write text");
        } else {
          this.target.setAttribute(p9r.attr.TEXT.PLACEHOLDER, "Type text");
        }
        requestAnimationFrame(() => {
          if (this.target.isConnected) {
            this.target.focus();
          }
        });
      }
    }
    get isDeleteDisabled() {
      const deleteAttr = this.target.getAttribute(p9r.attr.ACTION.DISABLE_DELETE);
      return deleteAttr ? deleteAttr === "true" : false;
    }
    refreshActionBarFeatures() {
      super.refreshActionBarFeatures();
      this._actionBarFeatures.set("addBefore", false);
      this._actionBarFeatures.set("addAfter", false);
      this._actionBarFeatures.set("changeComponent", false);
      if (!this.target.hasAttribute("p9r-force-delete-button")) {
        this._actionBarFeatures.set("delete", false);
      }
      if (!this.target.hasAttribute("p9r-force-duplicate-button")) {
        this._actionBarFeatures.set("duplicate", false);
      }
    }
    get isAddAfterDisabled() {
      return this.target.getAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER) === "true";
    }
    get isChangeComponentDisabled() {
      return this.target.getAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT) === "true";
    }
    get isBlocManagementEnabled() {
      const blocManagementAttr = this.target.getAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT);
      return blocManagementAttr ? blocManagementAttr === "true" : true;
    }
    get isTextEditable() {
      const textEditableAttr = this.target.getAttribute(p9r.attr.TEXT.EDITABLE);
      return textEditableAttr ? textEditableAttr === "true" : true;
    }
    restore() {
      this.target.removeAttribute("tabIndex");
      this.target.removeAttribute("contentEditable");
      this.target.removeAttribute(p9r.attr.TEXT.PLACEHOLDER);
      this.target.removeAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT);
      this.target.removeAttribute(p9r.attr.TEXT.EDITABLE);
      this.target.removeEventListener("keydown", this.onKeyDown);
      this.target.removeEventListener("input", this.onInput);
      this.target.removeEventListener("paste", this.onPaste);
    }
    dispose() {
      this.attrObserver?.disconnect();
      this.attrObserver = undefined;
      this.target.removeEventListener("keydown", this.onKeyDown);
      this.target.removeEventListener("input", this.onInput);
      this.target.removeEventListener("paste", this.onPaste);
      super.dispose();
    }
  }

  // src/control/core/editorSystem/defaultEditors/ListEditor.ts
  var cssStyle3 = `
    li:empty::before{
        content: attr(p9r-text-placeholder);
        color: #aaa;
        pointer-events: none;
        display: block;
        font-style: italic;
        font-weight: 300;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

  class ListEditor extends Editor {
    onKeyDown = (e) => this.handleKeyDown(e);
    onInput = (e) => this.handleInput(e);
    constructor(target) {
      super(target, cssStyle3);
      let li = this.target.querySelector("li");
      if (!li) {
        li = document.createElement("li");
        this.target.append(li);
      }
      requestAnimationFrame(() => {
        li.focus();
      });
    }
    handleKeyDown(e) {
      const item = e.target;
      if (e.key === "Enter") {
        if (e.shiftKey)
          return;
        e.preventDefault();
        const elem = document.createElement("li");
        if (item.innerHTML === "") {
          const p = document.createElement("p");
          this.target.after(p);
        } else {
          item.after(elem);
          this.init();
          requestAnimationFrame(() => {
            elem.focus();
          });
        }
      }
      if (e.key === "Backspace" && e.target) {
        const item2 = e.target;
        if (item2.innerHTML === "") {
          item2.remove();
          item2.removeEventListener("keydown", this.onKeyDown);
          item2.removeEventListener("input", this.onInput);
          if (!this.target.querySelector("li")) {
            this.target.remove();
          }
        }
      }
    }
    handleInput(e) {
      const item = e.target;
      if (item.innerHTML === "<br>") {
        item.innerHTML = "";
      }
    }
    init() {
      const items = this.target.querySelectorAll("li");
      items.forEach((item) => {
        item.removeEventListener("keydown", this.onKeyDown);
        item.removeEventListener("input", this.onInput);
        item.contentEditable = "true";
        item.setAttribute(p9r.attr.TEXT.PLACEHOLDER, "Type text");
        item.addEventListener("keydown", this.onKeyDown);
        item.addEventListener("input", this.onInput);
      });
    }
    restore() {
      const items = this.target.querySelectorAll("li");
      items.forEach((item) => {
        item.contentEditable = "false";
        item.removeEventListener("keydown", this.onKeyDown);
        item.removeEventListener("input", this.onInput);
      });
    }
  }

  // src/control/core/editorSystem/defaultEditors/SnippetEditor.ts
  var EDIT_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

  class SnippetEditor extends Editor {
    constructor(target) {
      super(target, "");
      target.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
      this.variant = "snippet";
      this.addCustomAction({
        action: "editSnippet",
        title: "Edit snippet",
        icon: EDIT_ICON,
        handler: () => {
          const identifier = target.getAttribute("identifier");
          if (!identifier)
            return;
          window.open(document.EditorManager.basePath + `admin/snippets/editor?identifier=${encodeURIComponent(identifier)}`, "_blank");
        }
      });
    }
    init() {}
    restore() {}
  }

  // src/control/components/editor/EditorSystem/ObserverManager.ts
  class ObserverManager {
    workingElement;
    observer;
    editors = new Map;
    groups = new Set(["default"]);
    opaqueTags = new Set;
    constructor(workingElement) {
      this.workingElement = workingElement;
      textTags.forEach((tag) => {
        if (["span", "a"].includes(tag)) {
          this.register_editor({
            tag,
            cl: TextEditor,
            visible: false,
            label: tag
          });
        } else {
          this.register_editor({
            tag,
            label: tag,
            cl: TextEditor
          });
        }
      });
      this.register_editor({
        tag: "img",
        label: "image",
        cl: ImageEditor
      });
      this.register_editor({
        tag: "ul",
        cl: ListEditor,
        label: "ul"
      });
      this.register_editor({
        tag: "ol",
        cl: ListEditor,
        label: "ol"
      });
      this.register_editor({
        tag: "w13c-snippet",
        cl: SnippetEditor,
        label: "snippet",
        visible: false
      });
      const existingElements = workingElement.querySelectorAll("*");
      existingElements.forEach((el) => this.make_it_editor(el));
      const callback = (mutationsList) => {
        const allAdded = new Set;
        for (const mutation of mutationsList) {
          for (const node of Array.from(mutation.addedNodes)) {
            allAdded.add(node);
          }
        }
        for (const mutation of mutationsList) {
          for (const removeNode of Array.from(mutation.removedNodes)) {
            const node = removeNode;
            if (!node.getAttribute)
              continue;
            const identifier = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
            if (!identifier)
              continue;
            const componentParent = node.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
            if (allAdded.has(node)) {
              document.compIdentifierToEditor.get(componentParent)?.onChildrenRemoved(node);
              continue;
            }
            document.compIdentifierToEditor.get(componentParent)?.onChildrenRemoved(node);
            this._disposeSubtree(node);
            document.compIdentifierToEditor.get(identifier)?.dispose();
          }
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                if (node.getAttribute(p9r.attr.EDITOR.IS_EDITOR)) {
                  const newParentId = node.parentElement?.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
                  if (newParentId) {
                    document.compIdentifierToEditor.get(newParentId)?.onChildrenAdded(node);
                  }
                  return;
                }
                this.make_it_editor(node);
                node.querySelectorAll("*").forEach((child) => {
                  const htmlChild = child;
                  this.make_it_editor(htmlChild);
                });
              }
            });
          }
        }
      };
      this.observer = new MutationObserver(callback);
      this.observer.observe(workingElement, {
        childList: true,
        subtree: true
      });
    }
    dispose() {
      this.observer?.disconnect();
      this.observer = undefined;
      const map = document.compIdentifierToEditor;
      if (!map)
        return;
      const descendants = this.workingElement.querySelectorAll(`[${p9r.attr.EDITOR.IDENTIFIER}]`);
      descendants.forEach((node) => {
        const id = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
        if (id)
          map.get(id)?.dispose();
      });
    }
    _disposeSubtree(root) {
      if (!root.querySelectorAll)
        return;
      const descendants = root.querySelectorAll(`[${p9r.attr.EDITOR.IDENTIFIER}]`);
      descendants.forEach((node) => {
        const id = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
        if (id)
          document.compIdentifierToEditor?.get(id)?.dispose();
      });
    }
    getGroups() {
      return this.groups;
    }
    getItemsByGroup(group) {
      return this.editors.values().filter((v) => v.visible && v.group === group);
    }
    getItems() {
      return this.editors.values().filter((v) => v.visible);
    }
    getLabel(tag) {
      return this.editors.get(tag)?.label;
    }
    register_editor(element) {
      this.editors.set(element.tag, {
        ...element,
        group: element.group || "default",
        visible: element.visible ?? true
      });
      this.groups.add(element.group || "default");
      const existingElements = this.workingElement.querySelectorAll(element.tag);
      existingElements.forEach((el) => this.make_it_editor(el));
    }
    register_editor_opaque(element) {
      this.opaqueTags.add(element.tag);
      this.register_editor(element);
      const roots = this.workingElement.querySelectorAll(element.tag);
      roots.forEach((root) => this._sealOpaqueSubtree(root));
    }
    _sealOpaqueSubtree(root) {
      const descendants = root.querySelectorAll(`[${p9r.attr.EDITOR.IDENTIFIER}]`);
      descendants.forEach((node) => {
        const id = node.getAttribute(p9r.attr.EDITOR.IDENTIFIER);
        if (!id)
          return;
        const editor = document.compIdentifierToEditor?.get(id);
        if (editor) {
          editor.viewClient();
          editor.dispose();
        }
      });
    }
    register_sub_components(tag) {
      tag.forEach((t) => {
        this.editors.set(t, {
          cl: EmptyEditor,
          tag: t,
          label: t,
          visible: false
        });
        const existingElements = this.workingElement.querySelectorAll(t);
        existingElements.forEach((el) => this.make_it_editor(el));
      });
    }
    make_it_editor(node) {
      if (node.getAttribute(p9r.attr.EDITOR.IS_EDITOR))
        return;
      if (node.parentElement?.closest(`[${p9r.attr.EDITOR.OPAQUE}]`))
        return;
      const tag = node.tagName.toLowerCase();
      if (!this.editors.has(tag))
        return;
      const cl = this.editors.get(tag)?.cl;
      if (cl) {
        const editor = new cl(node);
        editor.viewEditor();
      }
      if (this.opaqueTags.has(tag)) {
        node.setAttribute(p9r.attr.EDITOR.OPAQUE, "true");
      }
      const parentComponent = node.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
      if (parentComponent) {
        document.compIdentifierToEditor.get(parentComponent)?.onChildrenAdded(node);
      }
    }
  }

  // src/control/components/editor/EditorSystem/EditorRoot/EditorRoot.ts
  class EditorRoot extends HTMLElement {
    mode = "editor";
    _observer = null;
    _dragmanager = null;
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      const template = document.createElement("template");
      style.innerHTML = style_default5;
      template.innerHTML = template_default6;
      this.shadowRoot?.append(style);
      this.shadowRoot?.append(template);
    }
    connectedCallback() {
      requestAnimationFrame(() => {
        const workingElement = this.shadowRoot?.querySelector("#workingElement");
        this._observer = new ObserverManager(workingElement);
        this._dragmanager = new DragManager(workingElement);
      });
    }
    save() {
      const ele = this.shadowRoot?.querySelector("#workingElement");
      const content = ele.innerHTML;
      this.dispatchEvent(new CustomEvent("editor-system-save", {
        bubbles: true,
        detail: content
      }));
    }
    openConfig() {
      const ele = this.shadowRoot?.querySelector("[slot=configuration]");
      if (!ele || !isToggable(ele))
        throw new Error("Element should be have the open function");
      ele.open();
    }
    switchMode() {
      const newMode = this.mode === "editor" ? "view" : "editor";
      this.dispatchEvent(new CustomEvent("editor-system-switch-mode", {
        bubbles: true,
        detail: newMode
      }));
    }
    get observer() {
      if (!this._observer)
        throw new Error("You try to get observer before his initialization");
      return this._observer;
    }
    get dragManager() {
      if (!this._dragmanager)
        throw new Error("You try to get dragManager before his initialization");
      return this._dragmanager;
    }
  }
  if (!customElements.get("cms-editor-system")) {
    customElements.define("cms-editor-system", EditorRoot);
  }

  // src/control/components/editor/EditorSystem/FloatingToolbar/template.html
  var template_default7 = `<div id="toolbar-container">
    <div id="drag-handle" title="Move">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
                d="M8.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-10 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
        </svg>
    </div>
    <nav class="actions">
        <button data-action="dashboard" title="Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
        </button>
        <button data-action="switch-mode" title="View">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20" height="20" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </button>
        <button data-action="configuration" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        </button>
    </nav>
</div>`;

  // src/control/components/editor/EditorSystem/FloatingToolbar/style.css
  var style_default6 = `:host {
  --toolbar-bg: #ffffff;
  --toolbar-border: #e5e7eb;
  --toolbar-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --accent-color: #3b82f6;

  position: fixed;
  top: 100px;
  right: 20px; /* Default position on the right */
  z-index: 9999;
  touch-action: none; /* Prevent scrolling during drag on mobile */
}

#toolbar-container {
  display: flex;
  flex-direction: column;
  background: var(--toolbar-bg);
  border: 1px solid var(--toolbar-border);
  border-radius: 12px;
  box-shadow: var(--toolbar-shadow);
  overflow: hidden;
  min-width: 48px;
}

#drag-handle {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  background: #f9fafb;
  cursor: grab;
  color: #9ca3af;
  border-bottom: 1px solid var(--toolbar-border);
}

#drag-handle:active {
  cursor: grabbing;
}

.actions {
  display: flex;
  flex-direction: column;
  padding: 6px;
  gap: 4px;
}

/* Style for buttons injected via slot */
button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: system-ui, sans-serif;
  font-size: 14px;
  white-space: nowrap;
}

button:hover {
  background-color: #eff6ff;
  color: var(--accent-color);
}

/* Hide text if the toolbar is too narrow (optional) */
button span {
  display: inline-block;
}`;

  // src/control/components/editor/EditorSystem/FloatingToolbar/FloatingToolbar.ts
  class FloatingToolbar extends Component {
    _startX = 0;
    _startY = 0;
    constructor() {
      super({
        css: style_default6,
        template: template_default7
      });
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerUp = this._onPointerUp.bind(this);
    }
    connectedCallback() {
      const EditorSystem = this.closest("cms-editor-system");
      if (!EditorSystem)
        throw new NearestElementRequire(this, "cms-editor-system");
      const handle = this.shadowRoot?.getElementById("drag-handle");
      handle?.addEventListener("pointerdown", this._onPointerDown.bind(this));
      this.shadowRoot?.querySelector(".actions")?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn)
          return;
        switch (btn.dataset.action) {
          case "dashboard":
            window.location.href = getMetaBasePath();
            break;
          case "switch-mode":
            EditorSystem.switchMode();
            break;
          case "configuration":
            EditorSystem.openConfig();
            break;
        }
      });
    }
    _onPointerDown(e) {
      this._startX = e.clientX - this.offsetLeft;
      this._startY = e.clientY - this.offsetTop;
      e.target.setPointerCapture(e.pointerId);
      window.addEventListener("pointermove", this._onPointerMove);
      window.addEventListener("pointerup", this._onPointerUp);
    }
    _onPointerMove(e) {
      let newX = e.clientX - this._startX;
      let newY = e.clientY - this._startY;
      newX = Math.max(0, Math.min(newX, window.innerWidth - this.offsetWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - this.offsetHeight));
      this.style.left = `${newX}px`;
      this.style.top = `${newY}px`;
      this.style.right = "auto";
    }
    _onPointerUp(e) {
      window.removeEventListener("pointermove", this._onPointerMove);
      window.removeEventListener("pointerup", this._onPointerUp);
    }
  }
  if (!customElements.get("cms-floating-toolbar")) {
    customElements.define("cms-floating-toolbar", FloatingToolbar);
  }

  // src/control/components/editor/MediaCenter/template.html
  var template_default8 = `<dialog>
    <div class="modal-container">
        <header class="modal-header">
            <h2>Media Center</h2>
            <div class="toolbar">
                <button class="btn-tool" id="btnCreateFolder" title="New folder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/>
                    </svg>
                    New folder
                </button>
                <button class="btn-tool btn-tool-primary" id="btnUpload" title="Upload">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload
                </button>
            </div>
            <button class="btn-close" id="btnClose">&times;</button>
        </header>

        <div class="breadcrumb-bar">
            <div class="breadcrumb" id="breadcrumb">
                <span class="bc-current">Root</span>
            </div>
        </div>

        <div class="media-grid" id="grid"></div>

        <div class="empty-state" id="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
            </svg>
            <p>This folder is empty</p>
        </div>

        <div class="drop-overlay" id="drop-overlay">
            <span>Drop files to upload</span>
        </div>

        <footer class="modal-footer">
            <span class="path-info" id="pathDisplay"></span>
            <div class="footer-actions">
                <button class="btn btn-secondary" id="btnCancel">Cancel</button>
                <button class="btn btn-primary" id="btnSelect" disabled>Select</button>
            </div>
        </footer>

        <!-- New folder popover -->
        <div class="nf-backdrop" id="nf-backdrop">
            <div class="nf-popover">
                <label class="nf-label">New folder</label>
                <input type="text" class="nf-input" id="nf-input" placeholder="Folder name…" autocomplete="off">
                <div class="nf-actions">
                    <button class="nf-cancel" id="nf-cancel">Cancel</button>
                    <button class="nf-confirm" id="nf-confirm">Create</button>
                </div>
            </div>
        </div>

        <input type="file" id="file-input" hidden multiple accept="image/*,video/*,audio/*,.pdf,.zip,.svg">
    </div>
</dialog>
`;

  // src/control/components/editor/MediaCenter/style.css
  var style_default7 = `:host {
    --mc-bg: #ffffff;
    --mc-border: #e2e8f0;
    --mc-text: #1e293b;
    --mc-text-muted: #64748b;
    --mc-primary: #2563eb;
    --mc-primary-hover: #1d4ed8;
    --mc-radius: 16px;
    --mc-selected-border: var(--mc-primary);
    --mc-selected-bg: #eff6ff;

    font-family: system-ui, -apple-system, sans-serif;
    display: block;
}

/* ── Dialog ── */

dialog {
    border: none;
    border-radius: var(--mc-radius);
    padding: 0;
    width: 90vw;
    max-width: 900px;
    height: 80vh;
    box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.modal-container {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--mc-bg);
}

/* ── Header ── */

.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--mc-border);
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
}

.modal-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--mc-text);
    white-space: nowrap;
}

.toolbar {
    display: flex;
    gap: 6px;
    margin-left: auto;
}

.btn-tool {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--mc-text-muted);
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid var(--mc-border);
}

.btn-tool svg {
    width: 16px;
    height: 16px;
}

.btn-tool:hover {
    background: #f1f5f9;
    color: var(--mc-text);
}

.btn-tool-primary {
    background: var(--mc-primary);
    border-color: var(--mc-primary);
    color: #ffffff;
}

.btn-tool-primary:hover {
    background: var(--mc-primary-hover);
    color: #ffffff;
}

.btn-close {
    all: unset;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    color: var(--mc-text-muted);
    font-size: 1.4rem;
    transition: all 0.15s;
    flex-shrink: 0;
}

.btn-close:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

/* ── Breadcrumb ── */

.breadcrumb-bar {
    padding: 10px 20px;
    background: #f8fafc;
    border-bottom: 1px solid var(--mc-border);
    flex-shrink: 0;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    min-height: 24px;
}

.bc-item {
    color: var(--mc-primary);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background 0.15s;
}

.bc-item:hover {
    background: rgba(37, 99, 235, 0.08);
}

.bc-sep {
    color: var(--mc-text-muted);
    opacity: 0.4;
    user-select: none;
}

.bc-current {
    color: var(--mc-text);
    font-weight: 600;
    padding: 2px 6px;
}

/* ── Grid ── */

.media-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding: 20px;
    align-content: start;
}

.media-grid:empty {
    display: none;
}

.media-grid:empty ~ .empty-state {
    display: flex;
}

/* ── Selected state on cards ── */

.media-grid p9r-card-media.selected {
    outline: 2px solid var(--mc-selected-border);
    outline-offset: -2px;
    border-radius: 12px;
    background: var(--mc-selected-bg);
}

/* ── Empty state ── */

.empty-state {
    display: none;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--mc-text-muted);
}

.empty-state svg {
    width: 48px;
    height: 48px;
    opacity: 0.3;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

/* ── Drop overlay ── */

.drop-overlay {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(37, 99, 235, 0.08);
    border: 3px dashed var(--mc-primary);
    border-radius: var(--mc-radius);
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
}

.drop-overlay span {
    background: var(--mc-primary);
    color: white;
    padding: 10px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
}

.drop-overlay.active {
    display: flex;
}

/* ── Footer ── */

.modal-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--mc-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.path-info {
    font-size: 12px;
    color: var(--mc-text-muted);
}

.footer-actions {
    display: flex;
    gap: 8px;
}

.btn {
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;
    border: none;
    transition: all 0.15s;
}

.btn-primary {
    background: var(--mc-primary);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--mc-primary-hover);
}

.btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f1f5f9;
    color: var(--mc-text);
}

.btn-secondary:hover {
    background: #e2e8f0;
}

/* ── New folder popover ── */

.nf-backdrop {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: var(--mc-radius);
    z-index: 100;
    align-items: center;
    justify-content: center;
}

.nf-backdrop.open {
    display: flex;
}

.nf-popover {
    background: white;
    border-radius: 12px;
    padding: 20px;
    width: 320px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
    animation: nf-pop 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes nf-pop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.nf-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--mc-text);
}

.nf-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--mc-border);
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s;
}

.nf-input:focus {
    border-color: var(--mc-primary);
}

.nf-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
}

.nf-cancel, .nf-confirm {
    padding: 6px 14px;
    border-radius: 6px;
    border: none;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
}

.nf-cancel {
    background: #f1f5f9;
    color: var(--mc-text);
}

.nf-cancel:hover {
    background: #e2e8f0;
}

.nf-confirm {
    background: var(--mc-primary);
    color: white;
}

.nf-confirm:hover {
    background: var(--mc-primary-hover);
}
`;

  // src/control/components/media/CardMedia/template.html
  var template_default9 = `<div class="card">
    <div class="preview">
        <slot name="image">
            <span class="placeholder">
                <svg class="placeholder-img" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <svg class="placeholder-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
                </svg>
            </span>
        </slot>
    </div>
    <div class="info">
        <span class="label"><slot name="label"></slot></span>
    </div>
</div>
`;

  // src/control/components/media/CardMedia/style.css
  var style_default8 = `:host {
    --card-bg: var(--bg-surface, #fff);
    --card-border: var(--border-default, #e2e8f0);
    --card-radius: 12px;
    --card-hover-border: var(--primary-base, #4361ee);
    --card-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    --preview-bg: var(--bg-base, #f8fafc);
    --label-color: var(--text-main, #1e293b);
    --placeholder-color: var(--text-muted, #94a3b8);
    --folder-color: var(--primary-base, #4361ee);

    display: block;
    cursor: pointer;
}

.card {
    border: 1px solid var(--card-border);
    border-radius: var(--card-radius);
    overflow: hidden;
    background: var(--card-bg);
    transition: border-color 0.15s, box-shadow 0.15s;
}

.card:hover {
    border-color: var(--card-hover-border);
    box-shadow: var(--card-hover-shadow);
}

/* ── Folder variant ── */
:host([type="folder"]) .card {
    border-style: dashed;
    border-color: var(--card-border);
}

:host([type="folder"]) .card:hover {
    border-color: var(--folder-color);
}

:host([type="folder"]) .preview {
    background: var(--preview-bg);
    background-image: none;
}

:host([type="folder"]) .placeholder-img {
    display: none;
}

:host([type="folder"]) .placeholder-folder {
    display: block;
    color: var(--folder-color);
    opacity: 0.6;
}

:host([type="folder"]) .card:hover .placeholder-folder {
    opacity: 1;
}

/* ── Preview ── */
.preview {
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--preview-bg);
    background-image:
        linear-gradient(45deg, #eee 25%, transparent 25%),
        linear-gradient(-45deg, #eee 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #eee 75%),
        linear-gradient(-45deg, transparent 75%, #eee 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    overflow: hidden;
    position: relative;
}

::slotted([slot="image"]) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.placeholder {
    color: var(--placeholder-color);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: var(--preview-bg);
}

.placeholder svg {
    width: 40px;
    height: 40px;
    opacity: 0.4;
}

.placeholder-folder {
    display: none;
    width: 48px;
    height: 48px;
}

/* ── Info ── */
.info {
    padding: 10px 12px;
    border-top: 1px solid var(--card-border);
}

.label {
    font-size: 12px;
    font-weight: 500;
    color: var(--label-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}
`;

  // src/control/components/media/CardMedia/CardMedia.ts
  class CardMedia extends Component {
    constructor() {
      super({
        css: style_default8,
        template: template_default9
      });
    }
  }
  if (!customElements.get("p9r-card-media")) {
    customElements.define("p9r-card-media", CardMedia);
  }

  // src/control/components/media/GridMedia/api.ts
  function media() {
    const m = window._cms?.Media;
    if (!m) {
      throw new Error("window._cms.Media is not available. Check that the admin page loaded /<basePath>/_cms/media.js.");
    }
    return m;
  }
  function toLocal(item) {
    const local = {
      id: item.id,
      type: item.type === "folder" ? "folder" : item.type === "image" ? "image" : "other",
      label: item.name
    };
    if (item.type !== "folder") {
      local.mimetype = item.mimeType;
      local.size = item.size;
      local.absoluteURL = item.absoluteURL;
    }
    if (item.type === "image") {
      local.width = item.imageInfo.width;
      local.height = item.imageInfo.height;
    }
    return local;
  }
  async function fetchItems(_apiBase, folder, types) {
    const res = await media().getItems({
      folderID: folder ?? undefined,
      accept: expandAccept(types),
      pagination: { page: 1, limit: 1e4 },
      sortBy: "name"
    });
    if (!res.ok)
      return [];
    const items = res.data.items.map(toLocal);
    items.sort((a2, b) => {
      if (a2.type === "folder" && b.type !== "folder")
        return -1;
      if (a2.type !== "folder" && b.type === "folder")
        return 1;
      return a2.label.localeCompare(b.label);
    });
    return items;
  }
  function expandAccept(types) {
    const all = [
      "folder",
      "image",
      "video",
      "audio",
      "pdf",
      "document",
      "text",
      "archive",
      "other"
    ];
    if (!types || types.length === 0)
      return all;
    const out = [];
    if (types.includes("folder"))
      out.push("folder");
    if (types.includes("image"))
      out.push("image");
    if (types.includes("other"))
      out.push("video", "audio", "pdf", "document", "text", "archive", "other");
    return out;
  }
  async function resolveBreadcrumbTrail(_apiBase, id) {
    const trail = [];
    let currentId = id;
    while (currentId) {
      const res = await media().getItem(currentId);
      if (!res.ok)
        break;
      const item = res.data;
      trail.unshift({ id: item.id, label: item.name });
      currentId = item.parentFolderID;
    }
    return trail;
  }
  async function renameItem(_apiBase, id, label) {
    const res = await media().updateItem({ id, name: label });
    return res.ok;
  }
  async function deleteItem(_apiBase, id) {
    const res = await media().deleteItem({ id, recursive: true });
    return res.ok;
  }
  async function createFolder(_apiBase, label, parent) {
    const res = await media().createFolder({
      name: label,
      ...parent ? { parentFolderID: parent } : {}
    });
    return res.ok;
  }
  async function uploadFiles(_apiBase, files, folder) {
    for (let i = 0;i < files.length; i++) {
      const file = files.item(i);
      if (!file)
        continue;
      await media().uploadFile({
        data: file,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        ...folder ? { folderID: folder } : {}
      });
    }
  }
  async function saveItemMetadata(_apiBase, id, data) {
    const patch = {};
    if (typeof data["label"] === "string")
      patch.name = data["label"];
    if (typeof data["parent"] === "string")
      patch.parentFolderID = data["parent"];
    if (Object.keys(patch).length === 0)
      return true;
    const res = await media().updateItem({ id, ...patch });
    return res.ok;
  }

  // src/control/components/media/GridMedia/types.ts
  function formatSize(bytes) {
    if (bytes < 1024)
      return bytes + " B";
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
  function escapeHtml2(s2) {
    return s2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeAttr(s2) {
    return s2.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function variantUrl(item, width, height) {
    if (!item.absoluteURL)
      return "";
    const media2 = window._cms?.Media;
    if (!media2)
      return item.absoluteURL;
    return media2.formatImageUrl({
      url: item.absoluteURL,
      ...width !== undefined ? { width } : {},
      ...height !== undefined ? { height } : {}
    }).toString();
  }

  // src/control/components/media/GridMedia/render.ts
  function renderGrid(grid, items) {
    grid.innerHTML = "";
    for (const item of items) {
      const card = document.createElement("p9r-card-media");
      card.setAttribute("data-id", item.id);
      card.setAttribute("data-type", item.type);
      if (item.type === "folder") {
        card.setAttribute("type", "folder");
      } else {
        appendMediaPreview(card, item);
      }
      const label = document.createElement("span");
      label.slot = "label";
      label.textContent = item.label;
      card.appendChild(label);
      grid.appendChild(card);
    }
  }
  function appendMediaPreview(card, item) {
    const isImage = item.type === "image";
    const isSvg = item.mimetype === "image/svg+xml";
    if (isImage || isSvg) {
      const img = document.createElement("img");
      img.slot = "image";
      img.src = isSvg ? item.absoluteURL ?? "" : variantUrl(item, 400, 300);
      img.alt = item.alt || item.label;
      img.loading = "lazy";
      card.appendChild(img);
    } else {
      const ext = item.label.split(".").pop()?.toUpperCase() || "FILE";
      const icon = document.createElement("span");
      icon.slot = "image";
      icon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${ext}</span>
        `;
      icon.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;height:100%;color:var(--text-muted,#94a3b8);";
      card.appendChild(icon);
    }
  }
  function renderBreadcrumb(container, folder, breadcrumb) {
    if (!folder) {
      container.innerHTML = `<span class="bc-current">Root</span>`;
      return;
    }
    let html = `<span class="bc-item" data-folder="" data-index="-1">Root</span>`;
    for (let i = 0;i < breadcrumb.length; i++) {
      const crumb = breadcrumb[i];
      const isLast = i === breadcrumb.length - 1;
      html += `<span class="bc-sep">/</span>`;
      if (isLast) {
        html += `<span class="bc-current">${escapeHtml2(crumb.label)}</span>`;
      } else {
        html += `<span class="bc-item" data-folder="${escapeAttr(crumb.id)}" data-index="${i}">${escapeHtml2(crumb.label)}</span>`;
      }
    }
    container.innerHTML = html;
  }

  // src/control/components/editor/MediaCenter/MediaCenter.ts
  class MediaCenter extends Component {
    _dialog = null;
    _grid = null;
    _btnSelect = null;
    _folder = null;
    _breadcrumb = [];
    _items = [];
    _selectedItem = null;
    _types = [];
    _dragCounter = 0;
    constructor() {
      super({
        css: style_default7,
        template: template_default8
      });
    }
    connectedCallback() {
      const s2 = this.shadowRoot;
      this._dialog = s2.querySelector("dialog");
      this._grid = s2.getElementById("grid");
      this._btnSelect = s2.getElementById("btnSelect");
      s2.getElementById("btnClose").addEventListener("click", () => this._dialog?.close());
      s2.getElementById("btnCancel").addEventListener("click", () => this._dialog?.close());
      this._dialog.addEventListener("click", (e) => {
        if (e.target === this._dialog)
          this._dialog?.close();
      });
      s2.getElementById("btnCreateFolder").addEventListener("click", () => this._openNewFolder());
      const nfBackdrop = s2.getElementById("nf-backdrop");
      const nfInput = s2.getElementById("nf-input");
      s2.getElementById("nf-cancel").addEventListener("click", () => nfBackdrop.classList.remove("open"));
      s2.getElementById("nf-confirm").addEventListener("click", () => this._createFolder(nfInput, nfBackdrop));
      nfInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
          this._createFolder(nfInput, nfBackdrop);
        if (e.key === "Escape")
          nfBackdrop.classList.remove("open");
      });
      const fileInput = s2.getElementById("file-input");
      s2.getElementById("btnUpload").addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async () => {
        if (!fileInput.files?.length)
          return;
        await uploadFiles(this._apiBase, fileInput.files, this._folder);
        fileInput.value = "";
        this._refresh();
      });
      this._btnSelect.addEventListener("click", () => this._confirmSelection());
      this._grid.addEventListener("click", (e) => {
        const card = e.target.closest("p9r-card-media");
        if (!card)
          return;
        const id = card.dataset.id;
        const type = card.dataset.type;
        if (type === "folder") {
          const folder = this._items.find((i) => i.id === id);
          this._navigateTo(id, folder?.label);
        } else {
          this._select(card, id);
        }
      });
      this._grid.addEventListener("dblclick", (e) => {
        const card = e.target.closest("p9r-card-media");
        if (!card || card.dataset.type === "folder")
          return;
        this._confirmSelection();
      });
      s2.getElementById("breadcrumb").addEventListener("click", (e) => {
        const target = e.target;
        if (!target.classList.contains("bc-item"))
          return;
        const folder = target.dataset.folder || null;
        const index = parseInt(target.dataset.index || "-1");
        this._breadcrumb = this._breadcrumb.slice(0, index + 1);
        this._navigateTo(folder);
      });
      const container = s2.querySelector(".modal-container");
      const overlay = s2.getElementById("drop-overlay");
      container.addEventListener("dragenter", (e) => {
        if (e.dataTransfer?.types.includes("Files")) {
          e.preventDefault();
          this._dragCounter++;
          overlay.classList.add("active");
        }
      });
      container.addEventListener("dragleave", () => {
        this._dragCounter--;
        if (this._dragCounter <= 0) {
          this._dragCounter = 0;
          overlay.classList.remove("active");
        }
      });
      container.addEventListener("dragover", (e) => e.preventDefault());
      container.addEventListener("drop", async (e) => {
        e.preventDefault();
        this._dragCounter = 0;
        overlay.classList.remove("active");
        if (e.dataTransfer?.files.length) {
          await uploadFiles(this._apiBase, e.dataTransfer.files, this._folder);
          this._refresh();
        }
      });
    }
    show(types) {
      this._types = types ?? ["folder", "image", "other"];
      this._folder = null;
      this._breadcrumb = [];
      this._selectedItem = null;
      this._updateSelectButton();
      this._dialog?.showModal();
      this._refresh();
    }
    get _apiBase() {
      const raw = getMetaApiPath();
      return raw.endsWith("/") ? raw.slice(0, -1) : raw;
    }
    async _refresh() {
      this._items = await this._fetchItems();
      this._selectedItem = null;
      this._updateSelectButton();
      this._render();
    }
    async _fetchItems() {
      return fetchItems(this._apiBase, this._folder, this._types);
    }
    _render() {
      renderGrid(this._grid, this._items);
      renderBreadcrumb(this.shadowRoot.getElementById("breadcrumb"), this._folder, this._breadcrumb);
      const empty = this.shadowRoot.getElementById("empty");
      empty.style.display = this._items.length === 0 ? "flex" : "none";
      const pathDisplay = this.shadowRoot.getElementById("pathDisplay");
      if (this._breadcrumb.length > 0) {
        pathDisplay.textContent = this._breadcrumb.map((b) => b.label).join(" / ");
      } else {
        pathDisplay.textContent = "Root";
      }
    }
    _select(card, id) {
      this._grid.querySelectorAll("p9r-card-media.selected").forEach((el) => el.classList.remove("selected"));
      card.classList.add("selected");
      this._selectedItem = this._items.find((i) => i.id === id) || null;
      this._updateSelectButton();
    }
    _updateSelectButton() {
      if (this._btnSelect) {
        this._btnSelect.disabled = !this._selectedItem;
      }
    }
    _confirmSelection() {
      if (!this._selectedItem)
        return;
      const src = this._selectedItem.absoluteURL ?? "";
      this.dispatchEvent(new CustomEvent("select-item", {
        detail: { src, alt: this._selectedItem.label },
        bubbles: true,
        composed: true
      }));
      this._dialog?.close();
    }
    _navigateTo(folderId, label) {
      this._folder = folderId;
      if (!folderId) {
        this._breadcrumb = [];
      } else if (label) {
        this._breadcrumb.push({ id: folderId, label });
      }
      this._refresh();
    }
    _openNewFolder() {
      const s2 = this.shadowRoot;
      const backdrop = s2.getElementById("nf-backdrop");
      const input = s2.getElementById("nf-input");
      input.value = "";
      backdrop.classList.add("open");
      setTimeout(() => input.focus(), 50);
    }
    async _createFolder(input, backdrop) {
      const name = input.value.trim();
      if (!name)
        return;
      await createFolder(this._apiBase, name, this._folder);
      backdrop.classList.remove("open");
      this._refresh();
    }
  }
  customElements.define("w13c-mediacenter", MediaCenter);

  // src/control/components/editor/RichTextBar/template.html
  var template_default10 = `<div class="toolbar">
    <!-- Format -->
    <button data-command="bold" title="Bold">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
    </button>

    <button data-command="italic" title="Italic">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
    </button>

    <button data-command="underline" title="Underline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
        </svg>
    </button>

    <button data-command="strikeThrough" title="Overline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H8"></path>
            <line x1="4" y1="12" x2="20" y2="12"></line>
        </svg>
    </button>

    <div class="separator"></div>

    <!-- Size -->
    <div class="size-group">
        <button data-action="size-down" title="Decrease Font Size">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
        <span class="size-display">16</span>
        <button data-action="size-up" title="Increase Font Size">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
    </div>

    <div class="separator"></div>

    <!-- Color -->
    <div class="color-group">
        <button data-action="color" class="color-trigger" title="Text Color">
            <span class="color-swatch-current"></span>
        </button>
        <div class="color-panel">
            <button data-color="inherit" class="color-swatch swatch-reset" title="Default"></button>
            <button data-color="#0f172a" class="color-swatch" title="Black" style="--swatch:#0f172a"></button>
            <button data-color="#475569" class="color-swatch" title="Grey" style="--swatch:#475569"></button>
            <button data-color="#dc2626" class="color-swatch" title="Red" style="--swatch:#dc2626"></button>
            <button data-color="#ea580c" class="color-swatch" title="Orange" style="--swatch:#ea580c"></button>
            <button data-color="#16a34a" class="color-swatch" title="Green" style="--swatch:#16a34a"></button>
            <button data-color="#2563eb" class="color-swatch" title="Blue" style="--swatch:#2563eb"></button>
            <button data-color="#7c3aed" class="color-swatch" title="Violet" style="--swatch:#7c3aed"></button>
        </div>
    </div>

    <div class="separator"></div>

    <!-- Align -->
    <button data-command="justifyLeft" title="Left align">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="3" y2="18"></line>
        </svg>
    </button>

    <button data-command="justifyCenter" title="Center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="10" x2="6" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="18" y1="18" x2="6" y2="18"></line>
        </svg>
    </button>

    <button data-command="justifyRight" title="Right align">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="7" y2="18"></line>
        </svg>
    </button>

    <div class="separator"></div>

    <!-- Lists -->
    <button data-action="list-ul" title="Bulleted list">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <circle cx="4" cy="6" r="1" fill="currentColor"></circle>
            <circle cx="4" cy="12" r="1" fill="currentColor"></circle>
            <circle cx="4" cy="18" r="1" fill="currentColor"></circle>
        </svg>
    </button>

    <button data-action="list-ol" title="Numbered list">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <text x="3" y="7" font-size="6" fill="currentColor" font-weight="bold" font-family="system-ui">1</text>
            <text x="3" y="13" font-size="6" fill="currentColor" font-weight="bold" font-family="system-ui">2</text>
            <text x="3" y="19" font-size="6" fill="currentColor" font-weight="bold" font-family="system-ui">3</text>
        </svg>
    </button>

    <div class="separator"></div>

    <!-- Link -->
    <button data-action="link" title="Link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    </button>
</div>

<!-- Link sub-bar -->
<div class="link-bar">
    <div class="link-type-toggle">
        <button class="link-type-btn active" data-link-type="external">Externe</button>
        <button class="link-type-btn" data-link-type="internal">Interne</button>
    </div>
    <div class="link-field" data-link-field="external">
        <input class="link-input" type="url" placeholder="https://...">
    </div>
    <div class="link-field" data-link-field="internal" style="display:none">
        <div class="link-pages-wrap"></div>
    </div>
    <button class="link-apply" title="Apply">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </button>
    <button class="link-unlink" title="Delete link">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </button>
</div>
`;

  // src/control/components/editor/RichTextBar/style.css
  var style_default9 = `:host {
    position: absolute;
    z-index: 9999999999;
    display: none;

    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);

    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);

    transition: opacity 0.15s ease;
    overflow: visible;
}

:host(.visible) {
    display: block;
    opacity: 1;
    pointer-events: auto;
}

/* ── Main toolbar row ── */

.toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
}

/* ── Buttons ── */

button {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
    color: #1e293b;
    position: relative;
    font-family: system-ui, sans-serif;
}

button:hover {
    background: rgba(0, 0, 0, 0.06);
}

button:active {
    transform: scale(0.92);
}

button svg {
    width: 16px;
    height: 16px;
    stroke-width: 2;
}

button.active {
    background: #2563eb;
    color: #fff;
}

button.active svg {
    stroke: #fff;
}

/* ── Separator ── */

.separator {
    width: 1px;
    height: 20px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 2px;
    flex-shrink: 0;
}

/* ── Size group ── */

.size-group {
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 10px;
    padding: 2px;
}

.size-group button {
    padding: 6px;
    border-radius: 8px;
}

.size-group button svg {
    width: 14px;
    height: 14px;
}

.size-display {
    font-size: 11px;
    font-weight: 600;
    color: #334155;
    min-width: 24px;
    text-align: center;
    font-family: system-ui, sans-serif;
    user-select: none;
}

/* ── Color group ── */

.color-group {
    position: relative;
}

.color-trigger {
    padding: 6px;
}

.color-swatch-current {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #1e293b;
    border: 2px solid rgba(0, 0, 0, 0.12);
    transition: background 0.15s ease;
}

.color-panel {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
    gap: 6px;
    flex-wrap: wrap;
    width: 148px;
}

.color-panel.open {
    display: flex;
}

.color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--swatch);
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    transition: transform 0.15s ease, border-color 0.15s ease;
}

.color-swatch:hover {
    transform: scale(1.15);
    border-color: rgba(0, 0, 0, 0.15);
    background: var(--swatch);
}

.color-swatch.active {
    border-color: #2563eb;
    background: var(--swatch);
}

.swatch-reset {
    background: linear-gradient(135deg, #fff 40%, #e2e8f0 40%, #e2e8f0 60%, #fff 60%);
    border: 2px solid #e2e8f0;
}

.swatch-reset:hover {
    background: linear-gradient(135deg, #fff 40%, #e2e8f0 40%, #e2e8f0 60%, #fff 60%);
}

/* ── Link bar ── */

.link-bar {
    display: none;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.link-bar.open {
    display: flex;
}

.link-type-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    padding: 2px;
    flex-shrink: 0;
}

.link-type-btn {
    padding: 4px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.15s ease;
}

.link-type-btn.active {
    background: #fff;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.link-type-btn:hover:not(.active) {
    color: #64748b;
}

.link-field {
    flex: 1;
    min-width: 0;
}

.link-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    outline: none;
    background: #fff;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
    color: #1e293b;
}

.link-input:focus {
    border-color: #2563eb;
}

.link-pages-wrap {
    min-width: 180px;
}

.link-apply,
.link-unlink {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 8px;
}

.link-apply {
    background: #2563eb;
    color: #fff;
}

.link-apply:hover {
    background: #1d4ed8;
}

.link-apply svg {
    stroke: #fff;
}

.link-unlink {
    background: rgba(0, 0, 0, 0.04);
    color: #94a3b8;
}

.link-unlink:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #ef4444;
}
`;

  // src/control/components/editor/RichTextBar/commands.ts
  function focusElement() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0)
      return null;
    const node = sel.focusNode;
    if (!node)
      return null;
    return node.nodeType === 1 ? node : node.parentElement;
  }
  function wrapWithElement(wrapper) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0)
      return;
    const range = sel.getRangeAt(0);
    if (range.collapsed)
      return;
    try {
      const contents = range.extractContents();
      wrapper.appendChild(contents);
      range.insertNode(wrapper);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      sel.addRange(newRange);
    } catch (e) {
      console.warn("Selection spans complex markup", e);
    }
  }
  function toggleFormat(tag) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0)
      return;
    const el = focusElement();
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
      wrapWithElement(document.createElement(tag));
    }
  }
  function applyBlockAlignment(align) {
    const el = focusElement();
    const block = el?.closest("p, div, h1, h2, h3, h4, h5, h6, li");
    if (block)
      block.style.textAlign = align;
  }
  function applyInlineStyle(prop, value) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed)
      return;
    const el = focusElement();
    if (el && el.tagName === "SPAN" && el.textContent === sel.toString()) {
      el.style[prop] = value;
      return;
    }
    const span = document.createElement("span");
    span.style[prop] = value;
    wrapWithElement(span);
  }
  function removeInlineStyle(prop) {
    const el = focusElement();
    const span = el?.closest("span");
    if (!span)
      return;
    span.style[prop] = "";
    if (span.style.length === 0) {
      const parent = span.parentNode;
      while (span.firstChild)
        parent?.insertBefore(span.firstChild, span);
      parent?.removeChild(span);
    }
  }
  function queryCommandState(cmd) {
    const el = focusElement();
    if (!el)
      return false;
    const style = window.getComputedStyle(el);
    switch (cmd) {
      case "bold":
        return style.fontWeight === "bold" || parseInt(style.fontWeight) >= 700 || !!el.closest("b, strong");
      case "italic":
        return style.fontStyle === "italic" || !!el.closest("i, em");
      case "underline":
        return style.textDecorationLine.includes("underline") || !!el.closest("u");
      case "strikeThrough":
        return style.textDecorationLine.includes("line-through") || !!el.closest("s, strike");
      case "justifyLeft":
        return style.textAlign === "left" || style.textAlign === "start";
      case "justifyCenter":
        return style.textAlign === "center";
      case "justifyRight":
        return style.textAlign === "right";
      default:
        return false;
    }
  }
  function getCurrentFontSize() {
    const el = focusElement();
    if (!el)
      return 16;
    return Math.round(parseFloat(window.getComputedStyle(el).fontSize));
  }
  function getCurrentColor() {
    const el = focusElement();
    if (!el)
      return null;
    return window.getComputedStyle(el).color;
  }
  function insertList(tag) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
      return;
    const el = focusElement();
    if (!el)
      return;
    const editable = el.closest("[contenteditable]");
    if (!editable)
      return;
    const list = document.createElement(tag);
    const li = document.createElement("li");
    list.appendChild(li);
    editable.replaceWith(list);
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(li);
    selection.addRange(newRange);
  }
  function applyLinkUrl(url) {
    if (!url)
      return;
    const a2 = document.createElement("a");
    a2.href = url;
    wrapWithElement(a2);
  }
  function removeLinkAtSelection() {
    const el = focusElement();
    const a2 = el?.closest("a");
    if (!a2)
      return;
    const parent = a2.parentNode;
    while (a2.firstChild)
      parent?.insertBefore(a2.firstChild, a2);
    parent?.removeChild(a2);
  }
  function getExistingLink(range) {
    const r = range || window.getSelection()?.getRangeAt(0);
    if (!r)
      return null;
    const node = r.startContainer;
    const el = node.nodeType === 1 ? node : node.parentElement;
    return el?.closest("a")?.getAttribute("href") || null;
  }

  // src/control/components/editor/RichTextBar/selection.ts
  class SelectionTracker {
    savedRange = null;
    save() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        this.savedRange = sel.getRangeAt(0).cloneRange();
      }
    }
    restore() {
      if (!this.savedRange)
        return;
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      }
    }
    get range() {
      return this.savedRange;
    }
  }

  // src/control/components/editor/RichTextBar/RichTextBar.ts
  var FORMAT_COMMANDS = ["bold", "italic", "underline", "strikeThrough"];
  var ALIGN_COMMANDS = ["justifyLeft", "justifyCenter", "justifyRight"];
  var ACTIVE_COMMANDS = [...FORMAT_COMMANDS, ...ALIGN_COMMANDS];

  class RichTextBar extends Component {
    selection = new SelectionTracker;
    interacting = false;
    pageLink = null;
    _onRootMousedown = (e) => {
      const target = e.target;
      this.interacting = true;
      if (target.tagName === "INPUT" || target.tagName.includes("-") || target.closest("p9r-link")) {
        return;
      }
      e.preventDefault();
    };
    _onRootMouseup = () => {
      setTimeout(() => {
        this.interacting = false;
      }, 50);
    };
    _onRootClick = (e) => this.handleClick(e);
    _onSelectionChange = () => this.handleSelection();
    _onOutsideMousedown = (e) => this.handleOutsideMouseDown(e);
    _rootListenersAttached = false;
    constructor() {
      super({
        css: style_default9,
        template: template_default10
      });
    }
    connectedCallback() {
      const root = this.shadowRoot;
      if (!this._rootListenersAttached) {
        root.addEventListener("mousedown", this._onRootMousedown);
        root.addEventListener("mouseup", this._onRootMouseup);
        root.addEventListener("click", this._onRootClick);
        this._rootListenersAttached = true;
      }
      document.addEventListener("selectionchange", this._onSelectionChange);
      document.addEventListener("mousedown", this._onOutsideMousedown);
      if (!this.pageLink) {
        this.pageLink = document.createElement("p9r-link");
        this.pageLink.setAttribute("label", "");
        this.pageLink.setAttribute("name", "href");
        root.querySelector(".link-pages-wrap").appendChild(this.pageLink);
      }
    }
    disconnectedCallback() {
      document.removeEventListener("selectionchange", this._onSelectionChange);
      document.removeEventListener("mousedown", this._onOutsideMousedown);
    }
    handleClick(e) {
      const target = e.target;
      const btn = target.closest("button");
      if (!btn)
        return;
      const command = btn.dataset.command;
      if (command) {
        this.selection.restore();
        this.runCommand(command);
        this.selection.save();
        this.updateState();
        return;
      }
      const action = btn.dataset.action;
      if (action === "size-up")
        return this.changeSize(2);
      if (action === "size-down")
        return this.changeSize(-2);
      if (action === "color")
        return this.toggleColorPanel();
      if (action === "link")
        return this.toggleLinkBar();
      if (action === "list-ul")
        return this.insertListAction("ul");
      if (action === "list-ol")
        return this.insertListAction("ol");
      const color = btn.dataset.color;
      if (color !== undefined)
        return this.applyColor(color);
      const linkType = btn.dataset.linkType;
      if (linkType)
        return this.switchLinkType(linkType);
      if (btn.classList.contains("link-apply"))
        return this.applyLink();
      if (btn.classList.contains("link-unlink"))
        return this.removeLink();
    }
    runCommand(cmd) {
      switch (cmd) {
        case "bold":
          return toggleFormat("b");
        case "italic":
          return toggleFormat("i");
        case "underline":
          return toggleFormat("u");
        case "strikeThrough":
          return toggleFormat("s");
        case "justifyLeft":
          return applyBlockAlignment("left");
        case "justifyCenter":
          return applyBlockAlignment("center");
        case "justifyRight":
          return applyBlockAlignment("right");
      }
    }
    handleSelection() {
      if (this.interacting)
        return;
      const activeEl = this.shadowRoot.activeElement;
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
    changeSize(delta) {
      this.selection.restore();
      const next = Math.max(8, Math.min(96, getCurrentFontSize() + delta));
      applyInlineStyle("fontSize", `${next}px`);
      this.selection.save();
      this.updateSizeDisplay(next);
    }
    applyColor(color) {
      this.selection.restore();
      if (color === "inherit") {
        removeInlineStyle("color");
      } else {
        applyInlineStyle("color", color);
      }
      this.selection.save();
      this.shadowRoot.querySelector(".color-panel").classList.remove("open");
      this.updateColorState();
    }
    insertListAction(tag) {
      this.selection.restore();
      insertList(tag);
      this.hide();
    }
    applyLink() {
      this.selection.restore();
      const activeType = this.shadowRoot.querySelector(".link-type-btn.active");
      const type = activeType?.dataset.linkType || "external";
      let url = "";
      if (type === "external") {
        url = this.shadowRoot.querySelector(".link-input").value.trim();
      } else if (type === "internal" && this.pageLink) {
        url = this.pageLink.value || "";
      }
      applyLinkUrl(url);
      this.selection.save();
      this.closeLinkBar();
      this.updateState();
    }
    removeLink() {
      this.selection.restore();
      removeLinkAtSelection();
      this.selection.save();
      this.closeLinkBar();
      this.updateState();
    }
    toggleColorPanel() {
      this.shadowRoot.querySelector(".color-panel").classList.toggle("open");
      this.closeLinkBar();
    }
    toggleLinkBar() {
      const bar = this.shadowRoot.querySelector(".link-bar");
      const isOpen = bar.classList.contains("open");
      this.shadowRoot.querySelector(".color-panel")?.classList.remove("open");
      if (isOpen) {
        this.closeLinkBar();
        return;
      }
      const existing = getExistingLink(this.selection.range);
      const input = this.shadowRoot.querySelector(".link-input");
      input.value = existing || "";
      if (this.pageLink && existing) {
        this.pageLink.value = existing;
      }
      bar.classList.add("open");
    }
    closeLinkBar() {
      this.shadowRoot.querySelector(".link-bar")?.classList.remove("open");
    }
    switchLinkType(type) {
      const root = this.shadowRoot;
      root.querySelectorAll(".link-type-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.linkType === type));
      root.querySelectorAll(".link-field").forEach((f) => {
        f.style.display = f.dataset.linkField === type ? "" : "none";
      });
    }
    updateState() {
      for (const cmd of ACTIVE_COMMANDS) {
        const btn = this.shadowRoot.querySelector(`button[data-command="${cmd}"]`);
        if (btn)
          btn.classList.toggle("active", queryCommandState(cmd));
      }
      const linkBtn = this.shadowRoot.querySelector('[data-action="link"]');
      if (linkBtn)
        linkBtn.classList.toggle("active", !!getExistingLink(this.selection.range));
      this.updateSizeDisplay();
      this.updateColorState();
    }
    updateSizeDisplay(size) {
      const display = this.shadowRoot.querySelector(".size-display");
      if (display)
        display.textContent = String(size ?? getCurrentFontSize());
    }
    updateColorState() {
      const trigger = this.shadowRoot.querySelector(".color-swatch-current");
      if (!trigger)
        return;
      const color = getCurrentColor();
      if (color)
        trigger.style.background = color;
    }
    show(rect) {
      this.classList.add("visible");
      this.shadowRoot.querySelector(".color-panel")?.classList.remove("open");
      this.closeLinkBar();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const gap = 10;
      const barWidth = this.offsetWidth;
      const barHeight = this.offsetHeight;
      let top;
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
    handleOutsideMouseDown(e) {
      if (!this.classList.contains("visible"))
        return;
      const t = e.target;
      if (this === t || this.contains(t) || this.shadowRoot.contains(t))
        return;
      const range = this.selection.range;
      if (range) {
        const anchor = range.commonAncestorContainer;
        const el = anchor.nodeType === 1 ? anchor : anchor.parentElement;
        const editable = el?.closest?.('[contenteditable="true"]');
        if (editable && editable.contains(t))
          return;
      }
      this.hide();
    }
    hide() {
      this.classList.remove("visible");
      this.shadowRoot.querySelector(".color-panel")?.classList.remove("open");
      this.closeLinkBar();
    }
  }
  customElements.define("cms-richtextbar", RichTextBar);

  // src/control/components/editor/snippet/Snippet/template.html
  var template_default11 = `<div class="snippet-root"></div>
`;

  // src/control/components/editor/snippet/Snippet/style.css
  var style_default10 = `:host {
    display: block;
    position: relative;
    min-height: 40px;
}

.snippet-content {
    position: relative;
}

.snippet-label {
    position: absolute;
    top: -10px;
    left: 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid rgba(0, 122, 255, 0.25);
    color: #007aff;
    padding: 2px 8px 2px 6px;
    border-radius: 999px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.6;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 2;
}

.snippet-label svg {
    width: 10px;
    height: 10px;
}

.snippet-label code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    text-transform: none;
    letter-spacing: 0;
}

:host {
    outline: 1px dashed rgba(0, 122, 255, 0.0);
    outline-offset: 2px;
    transition: outline-color 0.15s;
}

:host(:hover) {
    outline-color: rgba(0, 122, 255, 0.5);
}

:host(:hover) .snippet-label {
    opacity: 1;
}

.snippet-loading,
.snippet-error {
    padding: 16px;
    border: 1px dashed rgba(100, 116, 139, 0.4);
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    color: #64748b;
    text-align: center;
}

.snippet-error {
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
}
`;

  // src/control/components/editor/snippet/Snippet/Snippet.ts
  var SnippetMetadata = {
    css: style_default10,
    template: template_default11
  };

  class Snippet extends Component {
    _root;
    constructor() {
      super(SnippetMetadata);
    }
    connectedCallback() {
      this._root = this.shadowRoot.querySelector(".snippet-root");
      const identifier = this.getAttribute("identifier");
      if (!identifier) {
        this._renderError("Missing identifier attribute");
        return;
      }
      const preExpanded = this.innerHTML.trim();
      if (preExpanded) {
        this._render(preExpanded, identifier);
        this.innerHTML = "";
        return;
      }
      this._renderLoading();
      whenEditorManagerReady(() => this._fetch(identifier));
    }
    async _fetch(identifier) {
      try {
        const url = new URL("snippets", document.EditorManager.getApiBasePath());
        url.searchParams.set("identifier", identifier);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(res.status === 404 ? `Snippet "${identifier}" not found` : await res.text());
        }
        const snippet = await res.json();
        this._render(snippet.content, identifier);
      } catch (e) {
        this._renderError(e?.message || "Failed to load snippet");
      }
    }
    _render(content, identifier) {
      this._root.innerHTML = `
            <div class="snippet-label">
                ${ICON_SNIPPET}
                <code>${identifier}</code>
            </div>
            <div class="snippet-content">${content}</div>
        `;
    }
    _renderLoading() {
      this._root.innerHTML = `<div class="snippet-loading">Loading snippet…</div>`;
    }
    _renderError(msg) {
      this._root.innerHTML = `<div class="snippet-error">⚠ ${msg}</div>`;
    }
  }
  if (!customElements.get("w13c-snippet")) {
    customElements.define("w13c-snippet", Snippet);
  }

  // src/control/components/editor/snippet/SnippetConfiguration/template.html
  var template_default12 = `<w13c-lateral-dialog>
  <form action="">

    <p9r-section data-title="Identity">
      <p9r-input
        name="identifier"
        label="Identifier"
        placeholder="hero-v1"
        hint="Lowercase letters, numbers and dashes. Immutable after creation."
        required
      ></p9r-input>

      <p9r-input
        name="name"
        label="Name"
        placeholder="My hero section"
        hint="Shown in the Snippets library."
        max-count="50"
      ></p9r-input>
    </p9r-section>

    <p9r-section data-title="Information">
      <p9r-input
        name="description"
        label="Description"
        placeholder="A short description"
        hint="Shown under the name in the library."
        max-count="120"
      ></p9r-input>
    </p9r-section>

    <p9r-section data-title="Taxonomy">
      <p9r-tag-suggest name="category" mode="single" resource="snippets" api="../../api/tags" placeholder="hero, layout, cta…">
        <span slot="label">Category</span>
      </p9r-tag-suggest>
    </p9r-section>

    <p9r-section data-title="Usages" data-collapsed>
      <ul class="usages-list"></ul>
    </p9r-section>

    <p9r-button id="save-btn" fullwidth type="submit" variant="filled" color="primary">
      Save
    </p9r-button>
  </form>
  <span slot="title">Snippet configuration</span>
</w13c-lateral-dialog>
`;

  // src/control/components/editor/snippet/SnippetConfiguration/style.css
  var style_default11 = `form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.usages-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 160px;
    overflow-y: auto;
}

.usages-list li {
    font-size: 12px;
    color: var(--text-main, #1e293b);
    line-height: 1.4;
}

.usages-list li small {
    color: var(--text-muted, #94a3b8);
    font-size: 11px;
}

.usages-empty {
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    font-style: italic;
}

#save-btn[aria-disabled="true"] {
    opacity: 0.5;
    pointer-events: none;
}
`;

  // src/control/components/editor/snippet/SnippetConfiguration/SnippetConfiguration.ts
  class SnippetConfiguration extends Component {
    _identifierCheckToken = 0;
    _identifierValid = true;
    constructor() {
      super({
        css: style_default11,
        template: template_default12
      });
    }
    connectedCallback() {
      const form = this.shadowRoot?.querySelector("form");
      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = this._collectFormData();
        const isCreate = !this.getAttribute("default-id");
        if (isCreate && !this._identifierValid) {
          showToast("Fix the identifier before saving.", { type: "error" });
          return;
        }
        if (isCreate && !data.identifier) {
          showToast("An identifier is required.", { type: "error" });
          return;
        }
        const content = document.EditorManager.getContent();
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id") || this.getAttribute("default-id");
        const endpoint = new URL("../../api/snippet", window.location.href);
        if (id)
          endpoint.searchParams.set("id", id);
        const payload = {
          name: data.name,
          description: data.description,
          category: data.category,
          content
        };
        if (!id)
          payload.identifier = data.identifier;
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            showToast("Failed to save snippet: " + await res.text(), { type: "error", duration: 6000 });
            return;
          }
          const result = await res.json();
          if (!id && result.id) {
            url.searchParams.set("identifier", result.identifier);
            url.searchParams.delete("id");
            window.history.pushState({}, "", url);
            this.setAttribute("default-id", result.id);
            this._lockIdentifier();
          }
          showToast(id ? "Snippet updated" : "Snippet created", { type: "success" });
        } catch (err) {
          showToast("Failed to save snippet: " + (err?.message || err), { type: "error", duration: 6000 });
        }
      });
      Array.from(this.attributes).filter((attr) => attr.name.startsWith("default-")).forEach((attr) => this._setDefaultValue(attr.name));
      this._wireIdentifierValidation();
      if (this.hasAttribute("default-identifier")) {
        this._lockIdentifier();
        this._loadUsages(this.getAttribute("default-identifier"));
      }
    }
    _collectFormData() {
      return {
        identifier: this._getInputValue("identifier"),
        name: this._getInputValue("name"),
        description: this._getInputValue("description"),
        category: this._getTagSuggestValue("category")
      };
    }
    _getInputElement(name) {
      return this.shadowRoot?.querySelector(`p9r-input[name=${name}]`);
    }
    _getInputValue(name) {
      return this._getInputElement(name)?.value.trim() ?? "";
    }
    _getTagSuggestValue(name) {
      const el = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${name}]`);
      return (el?.value ?? "").trim();
    }
    _setDefaultValue(name) {
      const defVal = this.getAttribute(name);
      if (defVal === null)
        return;
      const fieldName = name.replace("default-", "");
      const input = this._getInputElement(fieldName);
      if (input) {
        input.value = defVal;
        return;
      }
      const tagSuggest = this.shadowRoot?.querySelector(`p9r-tag-suggest[name=${fieldName}]`);
      if (tagSuggest && "value" in tagSuggest)
        tagSuggest.value = defVal;
    }
    _lockIdentifier() {
      const input = this._getInputElement("identifier");
      if (!input)
        return;
      input.disabled = true;
      this._setIdentifierHint("info", "Immutable after creation.");
      this._setIdentifierValid(true);
    }
    _wireIdentifierValidation() {
      const input = this._getInputElement("identifier");
      if (!input)
        return;
      if (this.hasAttribute("default-identifier"))
        return;
      input.addEventListener("input", () => this._validateIdentifierFormatSync());
      input.addEventListener("blur", () => this._validateIdentifierRemote());
      this._validateIdentifierFormatSync();
    }
    _setIdentifierHint(level, text) {
      this._getInputElement("identifier")?.setHint(level, text);
    }
    _setIdentifierValid(valid) {
      this._identifierValid = valid;
      this._getInputElement("identifier")?.setInvalid(!valid);
      const btn = this.shadowRoot?.getElementById("save-btn");
      if (btn) {
        if (valid)
          btn.removeAttribute("aria-disabled");
        else
          btn.setAttribute("aria-disabled", "true");
      }
    }
    _validateIdentifierFormatSync() {
      const input = this._getInputElement("identifier");
      if (!input)
        return;
      const id = input.value.trim();
      if (id === "") {
        this._setIdentifierHint("error", "Identifier is required.");
        this._setIdentifierValid(false);
        return;
      }
      if (!isValidSnippetIdentifier(id)) {
        this._setIdentifierHint("error", "Lowercase letters, digits and dashes only (e.g. hero-v1).");
        this._setIdentifierValid(false);
        return;
      }
      this._setIdentifierHint("info", "Lowercase letters, numbers and dashes. Immutable after creation.");
      this._setIdentifierValid(true);
    }
    async _validateIdentifierRemote() {
      const input = this._getInputElement("identifier");
      if (!input)
        return;
      const id = input.value.trim();
      if (id === "" || !isValidSnippetIdentifier(id))
        return;
      const token = ++this._identifierCheckToken;
      try {
        const url = new URL("../../api/snippet-exists", window.location.href);
        url.searchParams.set("identifier", id);
        const res = await fetch(url);
        if (token !== this._identifierCheckToken)
          return;
        if (!res.ok) {
          this._setIdentifierHint("error", "Could not validate the identifier (server error).");
          this._setIdentifierValid(false);
          return;
        }
        const body = await res.json();
        if (body.exists) {
          this._setIdentifierHint("error", `"${id}" is already used by another snippet.`);
          this._setIdentifierValid(false);
        } else {
          this._setIdentifierHint("success", "Identifier is available.");
          this._setIdentifierValid(true);
        }
      } catch {
        if (token !== this._identifierCheckToken)
          return;
        this._setIdentifierHint("error", "Could not reach the server to validate the identifier.");
        this._setIdentifierValid(false);
      }
    }
    async _loadUsages(identifier) {
      try {
        const endpoint = new URL("../../api/snippets", window.location.href);
        endpoint.searchParams.set("identifier", identifier);
        endpoint.searchParams.set("usages", "true");
        const res = await fetch(endpoint);
        if (!res.ok)
          return;
        const { pages } = await res.json();
        const list = this.shadowRoot?.querySelector(".usages-list");
        if (!list)
          return;
        if (pages.length === 0) {
          list.innerHTML = `<li class="usages-empty">Not used on any page yet.</li>`;
          return;
        }
        list.innerHTML = pages.map((p) => `<li>• ${p.title || p.identifier} <small>(${p.path})</small></li>`).join("");
      } catch {}
    }
    show() {
      const dialog = this.shadowRoot?.querySelector("w13c-lateral-dialog");
      dialog?.show();
    }
  }
  customElements.define("w13c-snippet-information", SnippetConfiguration);

  // src/control/components/media/CropSystem/template.html
  var template_default13 = `<div class="backdrop" id="backdrop">
    <div class="modal">
        <div class="header">
            <h3>Crop image</h3>
            <button class="close-btn" id="close-btn" title="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="body">
            <div class="canvas-area">
                <slot name="image"></slot>
            </div>
            <div class="sidebar">
                <div class="field">
                    <label>Aspect ratio</label>
                    <div class="ratio-buttons">
                        <button class="ratio-btn active" data-ratio="free">Free</button>
                        <button class="ratio-btn" data-ratio="1:1">1:1</button>
                        <button class="ratio-btn" data-ratio="4:3">4:3</button>
                        <button class="ratio-btn" data-ratio="16:9">16:9</button>
                    </div>
                </div>
                <div class="field">
                    <label>Output size</label>
                    <span class="value" id="output-size">—</span>
                </div>
            </div>
        </div>
        <div class="footer">
            <button class="btn-cancel" id="btn-cancel">Cancel</button>
            <button class="btn-apply" id="btn-apply">Apply crop</button>
        </div>
    </div>
</div>
`;

  // src/control/components/media/CropSystem/style.css
  var style_default12 = `:host {
    --modal-bg: var(--bg-surface, #fff);
    --modal-border: var(--border-default, #e2e8f0);
    --modal-radius: 16px;
    --modal-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
    --backdrop-bg: rgba(0, 0, 0, 0.55);
    --header-color: var(--text-main, #1e293b);
    --close-color: var(--text-muted, #94a3b8);
    --label-color: var(--text-muted, #94a3b8);
    --value-color: var(--text-body, #475569);
    --primary: var(--primary-base, #4361ee);
    --primary-hover: var(--primary-contrasted, #3451c7);
    --canvas-bg: #1a1a1a;

    display: none;
}

:host([open]) {
    display: block;
}

.backdrop {
    position: fixed;
    inset: 0;
    z-index: 700;
    background: var(--backdrop-bg);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: var(--modal-bg);
    border-radius: var(--modal-radius);
    box-shadow: var(--modal-shadow);
    width: 800px;
    max-width: 94vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--modal-border);
}

.header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--header-color);
}

.close-btn {
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: var(--close-color);
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.04);
    color: var(--header-color);
}

.body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.canvas-area {
    flex: 1;
    background: var(--canvas-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    position: relative;
}

::slotted([slot="image"]) {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
}

.sidebar {
    width: 200px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-left: 1px solid var(--modal-border);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--label-color);
}

.value {
    font-size: 13px;
    color: var(--value-color);
}

.ratio-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.ratio-btn {
    padding: 4px 10px;
    border: 1px solid var(--modal-border);
    border-radius: 6px;
    background: none;
    font-size: 11px;
    font-weight: 500;
    color: var(--value-color);
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, background 0.15s;
}

.ratio-btn:hover {
    border-color: var(--primary);
}

.ratio-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
}

.footer {
    padding: 16px 24px;
    border-top: 1px solid var(--modal-border);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.btn-cancel {
    padding: 8px 16px;
    background: none;
    border: 1px solid var(--modal-border);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--close-color);
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
}

.btn-cancel:hover {
    color: var(--header-color);
    border-color: var(--header-color);
}

.btn-apply {
    padding: 8px 16px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
}

.btn-apply:hover {
    background: var(--primary-hover);
}
`;

  // src/control/components/media/CropSystem/CropSystem.ts
  class CropSystem extends Component {
    constructor() {
      super({
        css: style_default12,
        template: template_default13
      });
    }
    connectedCallback() {
      const backdrop = this.shadowRoot.getElementById("backdrop");
      const closeBtn = this.shadowRoot.getElementById("close-btn");
      const cancelBtn = this.shadowRoot.getElementById("btn-cancel");
      const applyBtn = this.shadowRoot.getElementById("btn-apply");
      closeBtn.addEventListener("click", () => this.close());
      cancelBtn.addEventListener("click", () => this.close());
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop)
          this.close();
      });
      applyBtn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("crop", { detail: {} }));
        this.close();
      });
      const ratioButtons = this.shadowRoot.querySelectorAll(".ratio-btn");
      ratioButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          ratioButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }
    open() {
      this.setAttribute("open", "");
    }
    close() {
      this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent("close"));
    }
  }
  customElements.define("p9r-crop-system", CropSystem);

  // src/control/components/media/DetailMedia/template.html
  var template_default14 = `<div class="backdrop" id="backdrop">
    <div class="modal">
        <div class="header">
            <h3 id="title">File details</h3>
            <button class="close-btn" id="close-btn" title="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="body">
            <div class="left">
                <div class="preview">
                    <slot name="preview"></slot>
                </div>
                <div class="tools">
                    <button class="tool" disabled title="Coming soon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download
                    </button>
                    <button class="tool" disabled title="Coming soon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                        Replace
                        <span class="tag">Soon</span>
                    </button>
                    <button class="tool" disabled title="Coming soon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        Crop
                        <span class="tag">Soon</span>
                    </button>
                </div>
            </div>
            <div class="right">
                <slot name="fields"></slot>
                <slot name="actions"></slot>
            </div>
        </div>
    </div>
</div>
`;

  // src/control/components/media/DetailMedia/style.css
  var style_default13 = `:host {
    --modal-bg: var(--bg-surface, #fff);
    --modal-border: var(--border-default, #e2e8f0);
    --modal-radius: 16px;
    --modal-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
    --modal-width: 680px;
    --backdrop-bg: rgba(0, 0, 0, 0.45);
    --header-color: var(--text-main, #1e293b);
    --close-color: var(--text-muted, #94a3b8);
    --tool-bg: var(--bg-base, #f8fafc);
    --tool-border: var(--border-default, #e2e8f0);
    --tool-color: var(--text-muted, #94a3b8);
    --tag-bg: var(--bg-surface, #fff);

    display: none;
}

:host([open]) {
    display: block;
}

/* ── Backdrop ── */
.backdrop {
    position: fixed;
    inset: 0;
    z-index: 600;
    background: var(--backdrop-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Modal ── */
.modal {
    background: var(--modal-bg);
    border-radius: var(--modal-radius);
    box-shadow: var(--modal-shadow);
    width: var(--modal-width);
    max-width: 92vw;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.2s ease;
}

/* ── Header ── */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--modal-border);
    flex-shrink: 0;
}

.header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--header-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.close-btn {
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: var(--close-color);
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.04);
    color: var(--header-color);
}

/* ── Body ── */
.body {
    display: flex;
    gap: 24px;
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

/* ── Left column ── */
.left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
}

.preview {
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image:
        linear-gradient(45deg, #eee 25%, transparent 25%),
        linear-gradient(-45deg, #eee 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #eee 75%),
        linear-gradient(-45deg, transparent 75%, #eee 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid var(--modal-border);
}

::slotted([slot="preview"]) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

/* ── Tools ── */
.tools {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tool {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border: 1px solid var(--tool-border);
    border-radius: 8px;
    background: var(--tool-bg);
    font-size: 11px;
    font-weight: 500;
    color: var(--tool-color);
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s, color 0.15s;
}

.tool:disabled {
    cursor: default;
    opacity: 0.5;
}

.tool:not(:disabled):hover {
    border-color: var(--header-color);
    color: var(--header-color);
}

.tool svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

.tag {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--tag-bg);
    border: 1px solid var(--tool-border);
    border-radius: 4px;
    padding: 1px 4px;
    color: var(--tool-color);
}

/* ── Right column ── */
.right {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
}

::slotted([slot="fields"]) {
    display: block;
}

::slotted([slot="actions"]) {
    display: block;
    margin-top: auto;
    padding-top: 16px;
}
`;

  // src/control/components/media/DetailMedia/DetailMedia.ts
  class DetailMedia extends Component {
    constructor() {
      super({
        css: style_default13,
        template: template_default14
      });
    }
    connectedCallback() {
      const backdrop = this.shadowRoot.getElementById("backdrop");
      const closeBtn = this.shadowRoot.getElementById("close-btn");
      closeBtn.addEventListener("click", () => this.close());
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop)
          this.close();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.hasAttribute("open"))
          this.close();
      });
    }
    open(label) {
      if (label) {
        this.shadowRoot.getElementById("title").textContent = label;
      }
      this.setAttribute("open", "");
    }
    close() {
      this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent("close"));
    }
  }
  if (!customElements.get("p9r-detail-media")) {
    customElements.define("p9r-detail-media", DetailMedia);
  }

  // src/control/components/media/GridMedia/template.html
  var template_default15 = `<div class="toolbar">
    <div class="breadcrumb" id="breadcrumb">
        <span class="bc-current">Root</span>
    </div>
</div>

<div class="grid" id="grid"></div>

<div class="empty" id="empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
    </svg>
    <p>This folder is empty</p>
</div>

<div class="drop-overlay" id="drop-overlay">
    <span>Drop files to upload</span>
</div>

<!-- New folder popover -->
<div class="nf-backdrop" id="nf-backdrop">
    <div class="nf-popover">
        <label class="nf-label">New folder</label>
        <input type="text" class="nf-input" id="nf-input" placeholder="Folder name…" autocomplete="off">
        <div class="nf-actions">
            <button class="nf-cancel" id="nf-cancel">Cancel</button>
            <button class="nf-confirm" id="nf-confirm">Create</button>
        </div>
    </div>
</div>

<!-- Context menu -->
<div class="ctx-menu" id="ctx-menu">
    <button class="ctx-item" data-action="rename">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        Rename
    </button>
    <button class="ctx-item ctx-danger" data-action="delete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Delete
    </button>
</div>

<!-- Rename popover -->
<div class="nf-backdrop" id="rename-backdrop">
    <div class="nf-popover">
        <label class="nf-label">Rename</label>
        <input type="text" class="nf-input" id="rename-input" placeholder="New name…" autocomplete="off">
        <div class="nf-actions">
            <button class="nf-cancel" id="rename-cancel">Cancel</button>
            <button class="nf-confirm" id="rename-confirm">Rename</button>
        </div>
    </div>
</div>

<input type="file" id="file-input" hidden multiple accept="image/*,video/*,audio/*,.pdf,.zip,.svg">

<p9r-detail-media id="detail"></p9r-detail-media>
<p9r-crop-system id="crop"></p9r-crop-system>
`;

  // src/control/components/media/GridMedia/style.css
  var style_default14 = `:host {
    --grid-gap: 16px;
    --grid-min-col: 180px;
    --empty-color: var(--text-muted, #94a3b8);
    --border: var(--border-default, #e2e8f0);
    --bg: var(--bg-base, #f8fafc);
    --bg-surface: var(--bg-surface, #fff);
    --text: var(--text-main, #1e293b);
    --text-muted: var(--text-muted, #94a3b8);
    --primary: var(--primary-base, #4361ee);
    --primary-hover: var(--primary-contrasted, #3451c7);
    --danger: var(--danger-base, #ef4444);

    display: block;
    position: relative;
}

/* ── Toolbar ── */
.toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    font-size: 13px;
    color: var(--text-muted);
    min-width: 0;
}

.bc-item {
    cursor: pointer;
    color: var(--primary);
    font-weight: 500;
    white-space: nowrap;
}

.bc-item:hover {
    text-decoration: underline;
}

.bc-sep {
    color: var(--text-muted);
}

.bc-current {
    color: var(--text);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ── New folder popover ── */
.nf-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 500;
    background: rgba(0, 0, 0, 0.25);
    align-items: center;
    justify-content: center;
    animation: nfFadeIn 0.12s ease;
}

.nf-backdrop.visible {
    display: flex;
}

@keyframes nfFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes nfPop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.nf-popover {
    background: var(--bg-surface);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
    padding: 20px;
    width: 320px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: nfPop 0.15s ease;
}

.nf-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
}

.nf-input {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    color: var(--text);
    background: var(--bg);
    outline: none;
    transition: border-color 0.15s;
}

.nf-input:focus {
    border-color: var(--primary);
}

.nf-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.nf-cancel {
    padding: 7px 14px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s;
}

.nf-cancel:hover {
    color: var(--text);
    border-color: var(--text);
}

.nf-confirm {
    padding: 7px 14px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
}

.nf-confirm:hover {
    background: var(--primary-hover);
}

/* ── Context menu ── */
.ctx-menu {
    display: none;
    position: fixed;
    z-index: 800;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 140px;
    flex-direction: column;
}

.ctx-menu.visible {
    display: flex;
}

.ctx-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    border: none;
    border-radius: 7px;
    background: none;
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    cursor: pointer;
    font-family: inherit;
    transition: background 0.1s;
}

.ctx-item:hover {
    background: var(--bg);
}

.ctx-item.ctx-danger:hover {
    background: rgba(239, 68, 68, 0.06);
    color: var(--danger);
}

.ctx-item svg {
    flex-shrink: 0;
}

/* ── Grid ── */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-col), 1fr));
    gap: var(--grid-gap);
}

.grid:empty + .empty {
    display: flex;
}

/* ── Empty state ── */
.empty {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 64px 24px;
    color: var(--empty-color);
    text-align: center;
}

.empty svg {
    width: 48px;
    height: 48px;
    opacity: 0.4;
}

.empty p {
    margin: 0;
    font-size: 14px;
}

/* ── Drop overlay ── */
.drop-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(67, 97, 238, 0.08);
    border: 3px dashed var(--primary);
    border-radius: 16px;
    margin: 16px;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.drop-overlay.visible {
    display: flex;
}

.drop-overlay span {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary);
}

/* ── Detail fields (injected into detail-media slot) ── */
.detail-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
}

.detail-field:last-child {
    margin-bottom: 0;
}

.detail-field label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
}

.detail-field input,
.detail-field textarea {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    color: var(--text);
    background: var(--bg);
    outline: none;
    transition: border-color 0.15s;
    resize: vertical;
}

.detail-field input:focus,
.detail-field textarea:focus {
    border-color: var(--primary);
}

.detail-value {
    font-size: 13px;
    color: var(--text-body, #475569);
    word-break: break-all;
}

.detail-value.mono {
    font-family: monospace;
    font-size: 12px;
    background: var(--bg);
    padding: 6px 8px;
    border-radius: 6px;
    user-select: all;
}

.detail-meta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

/* ── URL row with copy ── */
.url-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.url-row .detail-value {
    flex: 1;
    min-width: 0;
}

.btn-copy {
    flex-shrink: 0;
    padding: 4px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, border-color 0.15s;
}

.btn-copy:hover {
    color: var(--primary);
    border-color: var(--primary);
}

/* ── Detail actions ── */
.detail-actions {
    display: flex;
    gap: 8px;
}

.btn-save {
    padding: 7px 14px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
}

.btn-save:hover {
    background: var(--primary-hover);
}

.btn-delete {
    padding: 7px 14px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.btn-delete:hover {
    color: var(--danger);
    border-color: var(--danger);
    background: rgba(239, 68, 68, 0.04);
}
`;

  // src/control/components/media/GridMedia/context-menu.ts
  function setupContextMenu(s2, callbacks) {
    const menu = s2.getElementById("ctx-menu");
    let activeItem = null;
    menu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn || !activeItem)
        return;
      const action = btn.dataset.action;
      if (action === "rename")
        callbacks.onRename(activeItem);
      else if (action === "delete")
        callbacks.onDelete(activeItem.id);
      menu.classList.remove("visible");
    });
    document.addEventListener("click", () => menu.classList.remove("visible"));
    return {
      show(e, item) {
        activeItem = item;
        menu.style.left = e.clientX + "px";
        menu.style.top = e.clientY + "px";
        menu.classList.add("visible");
      }
    };
  }

  // src/control/components/media/GridMedia/rename.ts
  function setupRename(s2, callbacks) {
    const backdrop = s2.getElementById("rename-backdrop");
    const input = s2.getElementById("rename-input");
    const confirmBtn = s2.getElementById("rename-confirm");
    const cancelBtn = s2.getElementById("rename-cancel");
    let currentItem = null;
    const hide = () => {
      backdrop.classList.remove("visible");
      currentItem = null;
    };
    const apply = () => {
      const name = input.value.trim();
      if (!name || !currentItem)
        return;
      const id = currentItem.id;
      hide();
      callbacks.onApply(id, name);
    };
    confirmBtn.addEventListener("click", apply);
    cancelBtn.addEventListener("click", hide);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop)
        hide();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        apply();
      if (e.key === "Escape")
        hide();
    });
    return {
      open(item) {
        currentItem = item;
        input.value = item.label;
        backdrop.classList.add("visible");
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      }
    };
  }

  // src/control/components/media/GridMedia/new-folder.ts
  function setupNewFolder(host, s2, callbacks) {
    const backdrop = s2.getElementById("nf-backdrop");
    const input = s2.getElementById("nf-input");
    const confirmBtn = s2.getElementById("nf-confirm");
    const cancelBtn = s2.getElementById("nf-cancel");
    const hide = () => backdrop.classList.remove("visible");
    const show = () => {
      input.value = "";
      backdrop.classList.add("visible");
      requestAnimationFrame(() => input.focus());
    };
    const create = () => {
      const name = input.value.trim();
      if (!name)
        return;
      hide();
      callbacks.onCreate(name);
    };
    host.addEventListener("new-folder", show);
    confirmBtn.addEventListener("click", create);
    cancelBtn.addEventListener("click", hide);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop)
        hide();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        create();
      if (e.key === "Escape")
        hide();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop.classList.contains("visible")) {
        hide();
      }
    });
  }

  // src/control/components/media/GridMedia/drag-drop.ts
  function setupDragDrop(s2, callbacks) {
    const fileInput = s2.getElementById("file-input");
    const dropOverlay = s2.getElementById("drop-overlay");
    let dragCounter = 0;
    let internalDrag = false;
    fileInput.addEventListener("change", () => {
      if (fileInput.files?.length)
        callbacks.onFiles(fileInput.files);
    });
    s2.getElementById("grid").addEventListener("dragstart", () => {
      internalDrag = true;
    });
    document.addEventListener("dragend", () => {
      internalDrag = false;
    });
    document.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (internalDrag)
        return;
      dragCounter++;
      if (dragCounter === 1)
        dropOverlay.classList.add("visible");
    });
    document.addEventListener("dragleave", (e) => {
      e.preventDefault();
      if (internalDrag)
        return;
      dragCounter--;
      if (dragCounter === 0)
        dropOverlay.classList.remove("visible");
    });
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => {
      e.preventDefault();
      dragCounter = 0;
      dropOverlay.classList.remove("visible");
      if (internalDrag) {
        internalDrag = false;
        return;
      }
      if (e.dataTransfer?.files.length)
        callbacks.onFiles(e.dataTransfer.files);
    });
    return {
      trigger() {
        fileInput.click();
      }
    };
  }

  // src/control/components/media/GridMedia/detail.ts
  var ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  var ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  function setupDetail(detail, callbacks) {
    detail.addEventListener("close", () => callbacks.onClose());
    return {
      open(item) {
        detail.innerHTML = "";
        const preview = buildPreview(item);
        if (preview)
          detail.appendChild(preview);
        const fields = buildFields(item);
        detail.appendChild(fields);
        const actions = buildActions();
        detail.appendChild(actions);
        actions.querySelector("#btn-save").addEventListener("click", () => {
          const data = readFields(detail);
          callbacks.onSave(item.id, data);
        });
        actions.querySelector("#btn-delete").addEventListener("click", () => {
          callbacks.onDelete(item.id);
        });
        fields.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const data = readFields(detail);
            callbacks.onSave(item.id, data);
          }
        });
        detail.open(item.label);
      }
    };
  }
  function readFields(detail) {
    const labelInput = detail.querySelector("#detail-label");
    const altInput = detail.querySelector("#detail-alt");
    const data = { label: labelInput.value };
    if (altInput)
      data.alt = altInput.value;
    return data;
  }
  function buildPreview(item) {
    const isImage = item.type === "image" || item.mimetype === "image/svg+xml";
    if (!isImage)
      return null;
    const isSvg = item.mimetype === "image/svg+xml";
    const img = document.createElement("img");
    img.slot = "preview";
    img.src = isSvg ? item.absoluteURL ?? "" : variantUrl(item, 800, 600);
    img.alt = item.alt || item.label;
    return img;
  }
  function buildFields(item) {
    const isImage = item.type === "image" || item.mimetype === "image/svg+xml";
    const size = item.size ? formatSize(item.size) : "";
    const dims = item.width && item.height ? `${item.width}×${item.height}` : "";
    const mediaUrl = item.absoluteURL ?? "";
    const el = document.createElement("div");
    el.slot = "fields";
    el.innerHTML = `
        <div class="detail-field">
            <label>Name</label>
            <input type="text" id="detail-label" value="${escapeAttr(item.label)}">
        </div>
        ${isImage ? `
        <div class="detail-field">
            <label>Alt text</label>
            <textarea id="detail-alt" rows="2">${escapeHtml2(item.alt || "")}</textarea>
        </div>` : ""}
        <div class="detail-meta-row">
            <div class="detail-field">
                <label>Type</label>
                <span class="detail-value">${escapeHtml2(item.mimetype || item.type)}</span>
            </div>
            <div class="detail-field">
                <label>Size</label>
                <span class="detail-value">${size || "—"}</span>
            </div>
        </div>
        ${dims ? `
        <div class="detail-field">
            <label>Dimensions</label>
            <span class="detail-value">${escapeHtml2(dims)}</span>
        </div>` : ""}
        <div class="detail-field">
            <label>URL</label>
            <div class="url-row">
                <span class="detail-value mono">${escapeHtml2(mediaUrl)}</span>
                <button class="btn-copy" id="btn-copy" title="Copy URL">${ICON_COPY}</button>
            </div>
        </div>
    `;
    const copyBtn = el.querySelector("#btn-copy");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(mediaUrl);
      copyBtn.innerHTML = ICON_CHECK;
      setTimeout(() => {
        copyBtn.innerHTML = ICON_COPY;
      }, 1500);
    });
    return el;
  }
  function buildActions() {
    const el = document.createElement("div");
    el.slot = "actions";
    el.innerHTML = `
        <div class="detail-actions">
            <button class="btn-save" id="btn-save">Save</button>
            <button class="btn-delete" id="btn-delete">Delete</button>
        </div>
    `;
    return el;
  }

  // src/control/components/media/GridMedia/GridMedia.ts
  class GridMedia extends Component {
    _folder = null;
    _breadcrumb = [];
    _items = [];
    constructor() {
      super({
        css: style_default14,
        template: template_default15
      });
    }
    get apiBase() {
      return this.getAttribute("api-base") || "../api";
    }
    get detail() {
      return this.shadowRoot.getElementById("detail");
    }
    get crop() {
      return this.shadowRoot.getElementById("crop");
    }
    connectedCallback() {
      const s2 = this.shadowRoot;
      this._folder = new URL(window.location.href).searchParams.get("folder");
      const ctxMenu = setupContextMenu(s2, {
        onRename: (item) => rename.open(item),
        onDelete: (id) => this._confirmDelete(id)
      });
      const rename = setupRename(s2, {
        onApply: async (id, name) => {
          await renameItem(this.apiBase, id, name);
          this._refresh();
        }
      });
      setupNewFolder(this, s2, {
        onCreate: async (name) => {
          await createFolder(this.apiBase, name, this._folder);
          this._refresh();
        }
      });
      const dragDrop = setupDragDrop(s2, {
        onFiles: async (files) => {
          await uploadFiles(this.apiBase, files, this._folder);
          this._refresh();
        }
      });
      const detail = setupDetail(this.detail, {
        onSave: async (id, data) => {
          if (await saveItemMetadata(this.apiBase, id, data)) {
            this.detail.close();
          }
        },
        onDelete: async (id) => {
          if (!confirm("Delete this file?"))
            return;
          if (await deleteItem(this.apiBase, id)) {
            this.detail.close();
            this._refresh();
          }
        },
        onClose: () => this._refresh()
      });
      s2.getElementById("grid").addEventListener("click", (e) => {
        const card = e.target.closest("p9r-card-media");
        if (!card)
          return;
        const id = card.dataset.id;
        if (card.dataset.type === "folder") {
          const folder = this._items.find((i) => i.id === id);
          this._navigateTo(id, folder?.label);
        } else {
          const item = this._items.find((i) => i.id === id);
          if (item)
            detail.open(item);
        }
      });
      s2.getElementById("grid").addEventListener("contextmenu", (e) => {
        const card = e.target.closest("p9r-card-media");
        if (!card)
          return;
        const item = this._items.find((i) => i.id === card.dataset.id);
        if (!item)
          return;
        e.preventDefault();
        ctxMenu.show(e, item);
      });
      s2.getElementById("breadcrumb").addEventListener("click", (e) => {
        const target = e.target;
        if (!target.classList.contains("bc-item"))
          return;
        const folder = target.dataset.folder || null;
        const index = parseInt(target.dataset.index || "-1");
        this._breadcrumb = this._breadcrumb.slice(0, index + 1);
        this._navigateTo(folder);
      });
      this.upload = () => dragDrop.trigger();
      if (this._folder) {
        resolveBreadcrumbTrail(this.apiBase, this._folder).then((trail) => {
          this._breadcrumb = trail;
          this._render();
        });
      }
      this._refresh();
    }
    upload() {}
    async _refresh() {
      this._items = await fetchItems(this.apiBase, this._folder);
      this._render();
    }
    _render() {
      renderGrid(this.shadowRoot.getElementById("grid"), this._items);
      renderBreadcrumb(this.shadowRoot.getElementById("breadcrumb"), this._folder, this._breadcrumb);
    }
    _navigateTo(folderId, label) {
      const url = new URL(window.location.href);
      if (folderId)
        url.searchParams.set("folder", folderId);
      else
        url.searchParams.delete("folder");
      window.history.pushState({}, "", url.toString());
      this._folder = folderId;
      if (!folderId)
        this._breadcrumb = [];
      else if (label)
        this._breadcrumb.push({ id: folderId, label });
      this._refresh();
    }
    async _confirmDelete(id) {
      if (!confirm("Delete this item?"))
        return;
      if (await deleteItem(this.apiBase, id))
        this._refresh();
    }
  }
  if (!customElements.get("p9r-grid-media")) {
    customElements.define("p9r-grid-media", GridMedia);
  }
})();
