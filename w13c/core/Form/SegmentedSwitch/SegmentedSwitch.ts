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
        // On ne garde que les éléments <option>
        const assignedOptions = slot.assignedElements().filter(el => el.tagName === 'OPTION');
        this._optionCount = assignedOptions.length;

        if (this._optionCount > 3) {
            console.warn("w13c-segmented-switch: Il est recommandé de ne pas dépasser 3 options pour ce composant.");
        }

        // 1. Calculer la largeur du slider
        if (this._slider) {
            this._slider.style.width = `calc(${(100 / this._optionCount)}% - 4px)`; // -4px pour le padding de 2px de chaque côté
        }

        // 2. Initialiser la valeur si une option est marquée 'selected'
        const selectedOption = assignedOptions.find(opt => opt.hasAttribute('selected'));
        if (selectedOption && !this.hasAttribute('value')) {
            // Petit hack pour laisser le temps au DOM de se stabiliser avant de calculer la position
            requestAnimationFrame(() => {
                this.value = selectedOption.getAttribute('value') || "";
            });
        } else if (this.hasAttribute('value')) {
             requestAnimationFrame(() => this._updateSliderPosition());
        }
    }

    private _handleOptionClick(e: Event) {
        const target = e.target as HTMLElement;
        // On vérifie si on a cliqué sur un élément slotted de type <option>
        if (target.tagName === 'OPTION' && target.assignedSlot) {
            const newValue = target.getAttribute('value');
            if (newValue) this.value = newValue;
        }
    }

    /**
     * Calcule le `transform: translateX()` du slider en fonction de l'index de la valeur.
     */
    private _updateSliderPosition() {
        if (!this._slider || !this._optionsContainer || this._optionCount === 0) return;

        // On récupère les options du slot pour trouver l'index
        const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
        const options = slot.assignedElements().filter(el => el.tagName === 'OPTION');
        const index = options.findIndex(opt => opt.getAttribute('value') === this.value);

        if (index === -1) {
            // Valeur non trouvée, on cache le slider
            this._slider.style.opacity = '0';
            return;
        }

        // Calcul du déplacement : (index * 100% de la largeur d'une option)
        const xPercent = (index * 100); 
        this._slider.style.opacity = '1';
        this._slider.style.transform = `translate3d(${xPercent}%, 0, 0)`;
    }

    /**
     * Met à jour l'attribut 'selected' sur les éléments <option> du slot (pour le CSS)
     */
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
        // Gérer disabled, name, etc.
    }
}

if (!customElements.get("p9r-segmented-switch")) {
    customElements.define("p9r-segmented-switch", SegmentedSwitch);
}