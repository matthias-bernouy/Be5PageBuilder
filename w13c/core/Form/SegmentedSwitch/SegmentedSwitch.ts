import { Component } from "src/core/Component/core/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class SegmentedSwitch extends Component {
    static formAssociated = true;
    private _internals: ElementInternals;
    private _slider: HTMLElement | null = null;
    private _optionsContainer: HTMLElement | null = null;
    private _optionCount: number = 0;

    static get observedAttributes() {
        return ['value', 'disabled', 'name'];
    }

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this._slider = this.shadowRoot?.querySelector('.selection-slider') || null;
        this._optionsContainer = this.shadowRoot?.querySelector('.options-container') || null;

        const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
        if (slot) {
            slot.addEventListener('slotchange', () => this._onSlotChange(slot));
        }

        // On gère le clic sur le wrapper pour déléguer aux options
        this.shadowRoot?.querySelector('.switch-wrapper')?.addEventListener('click', (e) => this._handleOptionClick(e));
    }

    get value() { return this.getAttribute('value') || ""; }
    set value(v) {
        if (v === this.value) return; // Pas de changement
        
        this.setAttribute('value', v);
        this._internals.setFormValue(v);
        this._updateSliderPosition();
        this._updateSlottedSelections(v);
        
        // Dispatch de l'event natif
        this.dispatchEvent(new CustomEvent('change', { detail: { value: v } }));
    }

    get name() { return this.getAttribute('name') || ""; }

    private _onSlotChange(slot: HTMLSlotElement) {
        const options = slot.assignedElements();
        this._optionCount = options.length;
        this.style.setProperty('--total-options', this._optionCount.toString());

        options.forEach((opt, index) => {
            opt.setAttribute('role', 'radio');
            opt.setAttribute('tabindex', '0'); // Rendre focusable
            
            opt.onclick = () => this.value = opt.getAttribute('value') || "";
        });

        this._updateSliderPosition();
    }

    private _handleOptionClick(e: Event) {
        const target = e.target as HTMLElement;
        // On vérifie si on a cliqué sur un élément slotted de type <option>
        if (target.tagName === 'OPTION' && target.assignedSlot) {
            const newValue = target.getAttribute('value');
            if (newValue) this.value = newValue;
        }
    }

    private _updateSliderPosition() {
        const options = (this.shadowRoot?.querySelector('slot') as HTMLSlotElement).assignedElements();
        const index = options.findIndex(opt => opt.getAttribute('value') === this.value);
        
        if (index !== -1) {
            this.style.setProperty('--active-index', index.toString());
            options.forEach((opt, i) => opt.setAttribute('aria-checked', (i === index).toString()));
        }
    }

    private _updateSlottedSelections(selectedValue: string) {
        const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
        const options = slot.assignedElements().filter(el => el.tagName === 'OPTION');
        
        options.forEach(opt => {
            if (opt.getAttribute('value') === selectedValue) {
                opt.setAttribute('selected', '');
            } else {
                opt.removeAttribute('selected');
            }
        });
    }

    attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
        if (name === 'value') this.value = newVal;
    }
}

if (!customElements.get("p9r-segmented-switch")) {
    customElements.define("p9r-segmented-switch", SegmentedSwitch);
}