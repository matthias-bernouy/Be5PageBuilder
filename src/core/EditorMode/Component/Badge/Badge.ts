export class Badge extends HTMLElement {
  static get observedAttributes() { return ['variant']; }

  connectedCallback() {
    const variant = this.getAttribute('variant') || 'info';
    this.attachShadow({ mode: 'open' });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 10px;
            border-radius: 99px;
            font-size: 12px;
            font-weight: 600;
            line-height: 1;
            white-space: nowrap;
            letter-spacing: 0.02em;
            text-transform: capitalize;
            /* Couleurs dynamiques */
            background-color: var(--${variant}-muted);
            color: var(--${variant}-contrasted);
          }
        </style>
        <slot></slot>
      `;
    }
  }
}
customElements.define("p9r-badge", Badge);