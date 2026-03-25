export class Tag extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            background-color: var(--bg-base);
            color: var(--text-body);
            border: 1px solid var(--border-default);
          }
        </style>
        <slot></slot>
      `;
    }
  }
}
customElements.define("p9r-tag", Tag);