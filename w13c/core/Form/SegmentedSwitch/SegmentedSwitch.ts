import { Component } from "src/core/Editor/core/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class SegmentedSwitch extends Component {
    static formAssociated = true;
    private _internals: ElementInternals;
    private _slider: HTMLElement | null = null;
    private _optionsContainer: HTMLElement | null = null;
    private _optionCount: number = 0;

    static get observedAttributes() {
        return ['value', 'disabled', 'name', 'label'];
    }

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
        this._internals = this.attachInternals();
    }

    override connectedCallback() {
        this._slider = this.shadowRoot?.querySelector('.selection-slider') || null;
        this._optionsContainer = this.shadowRoot?.querySelector('.options-container') || null;

        const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
        if (slot) {
            slot.addEventListener('slotchange', () => this._onSlotChange(slot));
        }

        this._updateLabel();
    }

    private _updateLabel() {
        const el = this.shadowRoot?.querySelector('.label');
        if (el) el.textContent = this.getAttribute('label') || '';
    }

    get value() { return this.getAttribute('value') || ""; }
    set value(v) {
        if (v === this.value) return;
        
        this.setAttribute('value', v);
        this._internals.setFormValue(v);
        this._updateSliderPosition();
        this._updateSlottedSelections(v);
        
        this.dispatchEvent(new Event('change', { bubbles: true }));
    }

    get name() { return this.getAttribute('name') || ""; }

    private _onSlotChange(slot: HTMLSlotElement) {
        const options = slot.assignedElements();
        this._optionCount = options.length;
        this.style.setProperty('--total-options', this._optionCount.toString());

        options.forEach((opt) => {
            opt.setAttribute('role', 'radio');
            opt.setAttribute('tabindex', '0');

            (opt as HTMLElement).onclick = () => this.value = opt.getAttribute('value') || "";
        });

        this._updateSliderPosition();
    }

    private _handleOptionClick(e: Event) {
        const target = e.target as HTMLElement;
        // Check if the clicked element is a slotted <option>
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
        else if (name === 'label') this._updateLabel();
    }
}

if (!customElements.get("p9r-segmented-switch")) {
    customElements.define("p9r-segmented-switch", SegmentedSwitch);
}