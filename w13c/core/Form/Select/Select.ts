import { Component } from "src/core/Component/core/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Select extends Component {
    static formAssociated = true;
    private _internals: ElementInternals;
    private _trigger: HTMLElement | null = null;
    private _displayValue: HTMLElement | null = null;
    private _customDropdown: HTMLElement | null = null;
    private _customOptionsList: HTMLElement | null = null;
    private _slot: HTMLSlotElement | null = null;
    private _isOpen = false;
    private _currentValue = "";

    // Pour l'accessibilité clavier
    private _activeIndex = -1; 
    private _optionElements: HTMLElement[] = [];

    static get observedAttributes() {
        return ['value', 'disabled', 'error'];
    }

    constructor() {
        super({ css, template: template as unknown as string });
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this._trigger = this.shadowRoot?.querySelector('#select-trigger') || null;
        this._displayValue = this.shadowRoot?.querySelector('#display-value') || null;
        this._customDropdown = this.shadowRoot?.querySelector('#custom-dropdown') || null;
        this._customOptionsList = this.shadowRoot?.querySelector('#custom-options-list') || null;
        this._slot = this.shadowRoot?.querySelector('#options-slot') || null;

        // Écouter les changements dans le slot pour générer la liste custom
        this._slot?.addEventListener('slotchange', () => this._generateCustomOptions());

        // Gestion de l'ouverture/fermeture
        this._trigger?.addEventListener('click', (e) => this._toggleDropdown(e));
        
        // Fermer si on clique à l'extérieur (nécessite une écoute globale)
        window.addEventListener('click', (e) => this._handleOutsideClick(e));

        // Initialisation de l'accessibilité
        this._setupAccessibility();

        // Premier rendu
        this._generateCustomOptions();
    }

    // --- Génération de la liste Custom ---
    private _generateCustomOptions() {
        if (!this._customOptionsList || !this._slot) return;

        // Vider la liste custom existante
        this._customOptionsList.innerHTML = '';
        this._optionElements = [];

        // Récupérer les <option> passées dans le slot
        const assignedNodes = this._slot.assignedElements();
        const lightOptions = assignedNodes.filter(node => node.tagName === 'OPTION') as HTMLOptionElement[];

        // Créer les <li> stylisés correspondants
        lightOptions.forEach((opt, index) => {
            const li = document.createElement('li');
            li.className = 'custom-option';
            li.textContent = opt.textContent;
            li.setAttribute('data-value', opt.value);
            
            // Accessibilité : rôles ARIA
            li.setAttribute('role', 'option');
            li.setAttribute('id', `opt-${index}`);
            li.setAttribute('aria-selected', 'false');

            if (opt.disabled) {
                li.setAttribute('aria-disabled', 'true');
                li.classList.add('disabled');
            } else {
                li.addEventListener('click', () => this._handleSelection(opt.value, opt.textContent || ""));
            }

            this._customOptionsList?.appendChild(li);
            this._optionElements.push(li);
        });

        // Appliquer la valeur initiale
        this._syncValue();
    }

    // --- Logique de Sélection ---
    private _handleSelection(value: string, display: string) {
        this._currentValue = value;
        if (this._displayValue) this._displayValue.textContent = display;
        
        // Mettre à jour Internals pour les formulaires
        this._internals.setFormValue(value);
        
        // Mettre à jour l'état visuel (ARIA)
        this._optionElements.forEach(li => {
            const isSelected = li.getAttribute('data-value') === value;
            li.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            isSelected ? li.classList.add('selected') : li.classList.remove('selected');
        });

        // Émettre l'événement 'change'
        this.dispatchEvent(new CustomEvent('change', { 
            detail: { value },
            bubbles: true,
            composed: true 
        }));

        this._closeDropdown();
    }

    // Synchronise l'affichage avec l'attribut value
    private _syncValue() {
        if (this.hasAttribute('value')) {
            const attrVal = this.getAttribute('value')!;
            // Trouver l'option correspondante pour le texte d'affichage
            const matchingOpt = this._optionElements.find(li => li.getAttribute('data-value') === attrVal);
            if (matchingOpt) {
                this._handleSelection(attrVal, matchingOpt.textContent || "");
                return;
            }
        }
        
        // Valeur par défaut si rien n'est trouvé
        this._currentValue = "";
        if (this._displayValue) this._displayValue.textContent = "Sélectionner";
        this._internals.setFormValue("");
    }

    // --- Logique d'Ouverture/Fermeture ---
    private _toggleDropdown(e: Event) {
        if (this.hasAttribute('disabled')) return;
        e.stopPropagation(); // Empêche de fermer immédiatement
        this._isOpen ? this._closeDropdown() : this._openDropdown();
    }

    private _openDropdown() {
        this._isOpen = true;
        this._trigger?.setAttribute('aria-expanded', 'true');
        this._customDropdown?.classList.add('open');
        this._activeIndex = -1; // Reset navigation clavier
    }

    private _closeDropdown() {
        this._isOpen = false;
        this._trigger?.setAttribute('aria-expanded', 'false');
        this._customDropdown?.classList.remove('open');
    }

    private _handleOutsideClick(e: Event) {
        if (this._isOpen && !this.contains(e.target as Node)) {
            this._closeDropdown();
        }
    }

    // --- Accessibilité Clavier (Basique) ---
    private _setupAccessibility() {
        // Le trigger gère le focus et les touches
        this._trigger?.setAttribute('tabindex', '0');
        this._trigger?.setAttribute('role', 'combobox');
        this._trigger?.setAttribute('aria-haspopup', 'listbox');
        this._trigger?.setAttribute('aria-expanded', 'false');
        
        this._customOptionsList?.setAttribute('role', 'listbox');

        this._trigger?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (this.hasAttribute('disabled')) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!this._isOpen) this._openDropdown();
                this._moveActive(-1, 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!this._isOpen) this._openDropdown();
                this._moveActive(1, -1);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this._isOpen) {
                    this._openDropdown();
                } else if (this._activeIndex !== -1) {
                    const activeOpt = this._optionElements[this._activeIndex];
                    if (activeOpt && !activeOpt.classList.contains('disabled')) {
                        this._handleSelection(activeOpt.getAttribute('data-value')!, activeOpt.textContent!);
                    }
                }
            } else if (e.key === 'Escape') {
                if (this._isOpen) {
                    e.preventDefault();
                    this._closeDropdown();
                    this._trigger?.focus();
                }
            }
        });
    }

    // Déplacement de l'item actif au clavier
    private _moveActive(startDirection: number, moveDirection: number) {
        const len = this._optionElements.length;
        if (len === 0) return;

        // Enlever l'état actif précédent
        if (this._activeIndex !== -1) {
            this._optionElements[this._activeIndex]!.classList.remove('active');
        }

        // Calculer le nouvel index
        this._activeIndex = (this._activeIndex + moveDirection + len) % len;

        // Éviter les items désactivés
        if (this._optionElements[this._activeIndex]!.classList.contains('disabled')) {
            this._moveActive(startDirection, moveDirection);
            return;
        }

        const activeOpt = this._optionElements[this._activeIndex];
        activeOpt!.classList.add('active');
        activeOpt!.scrollIntoView({ block: 'nearest' }); // Faire défiler
        
        // ARIA : Indiquer l'item actif
        this._trigger?.setAttribute('aria-activedescendant', activeOpt!.id);
    }

    // --- Accesseurs ---
    get value() { return this._currentValue; }
    set value(v: string) {
        if (this._internals) {
             const matchingOpt = this._optionElements.find(li => li.getAttribute('data-value') === v);
             if(matchingOpt){
                 this._handleSelection(v, matchingOpt.textContent || "");
             }
        }
    }

    get name() {
        return this.getAttribute("name");
    }

    attributeChangedCallback(name: string, _: string, newVal: string) {
        if (name === 'value') this.value = newVal;
        if (name === 'error' && newVal !== null) this._trigger?.setAttribute('aria-invalid', 'true');
        if (name === 'disabled') {
             newVal !== null ? this._trigger?.setAttribute('tabindex', '-1') : this._trigger?.setAttribute('tabindex', '0');
        }
    }
}

if (!customElements.get("p9r-select")) {
    customElements.define("p9r-select", Select);
}