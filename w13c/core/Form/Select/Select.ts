import { Component } from "src/core/Component/core/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Select extends Component {
    static formAssociated = true;
    private _internals: ElementInternals;
    private _select: HTMLSelectElement | null = null;
    private _slot: HTMLSlotElement | null = null;

    static get observedAttributes() {
        return ['value', 'disabled'];
    }

    constructor() {
        super({ css, template: template as unknown as string });
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this._select = this.shadowRoot?.querySelector('#native-select') || null;
        this._slot = this.shadowRoot?.querySelector('#options-slot') || null;

        // 1. Écouter les changements dans le slot pour mettre à jour le select natif
        this._slot?.addEventListener('slotchange', () => this._syncOptions());

        // 2. Transmettre les changements du select natif vers le composant
        this._select?.addEventListener('change', () => {
            this._internals.setFormValue(this._select!.value);
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this._select!.value } }));
        });

        // Premier rendu au cas où le slot est déjà rempli
        this._syncOptions();
    }

    private _syncOptions() {
        if (!this._select || !this._slot) return;

        // Récupérer les <option> passées dans le slot
        const assignedNodes = this._slot.assignedElements();
        const options = assignedNodes.filter(node => node.tagName === 'OPTION') as HTMLOptionElement[];

        // Vider le select natif
        this._select.innerHTML = '';

        // Cloner les options dans le select du Shadow DOM
        options.forEach(opt => {
            const clone = opt.cloneNode(true) as HTMLOptionElement;
            this._select?.appendChild(clone);
        });

        // Appliquer la valeur initiale si présente
        if (this.hasAttribute('value')) {
            this._select.value = this.getAttribute('value')!;
        }
    }

    get value() { return this._select?.value || ""; }
    set value(v: string) {
        if (this._select) {
            this._select.value = v;
            this._internals.setFormValue(v);
        }
    }

    attributeChangedCallback(name: string, _: string, newVal: string) {
        if (name === 'value') this.value = newVal;
        if (name === 'disabled' && this._select) {
            newVal !== null ? this._select.disabled = true : this._select.disabled = false;
        }
    }
}

if (!customElements.get("p9r-select")) {
    customElements.define("p9r-select", Select);
}