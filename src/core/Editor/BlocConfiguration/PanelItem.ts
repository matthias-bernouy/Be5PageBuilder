import type { Component } from "src/core/Utilities/Component";
import type { Editor } from "../Base/Editor";

export class PanelItem extends HTMLElement {

    protected _component: string = "";
    protected _key: string = "";
    protected _name: string = "";
    protected _shadowTarget: string = "";
    protected _slotTarget: string = "";
    protected _value: any;
    protected _element: string = "";

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
        return [
            'data-key', 
            'data-name', 
            'data-shadow-target', 
            'data-slot-target', 
            'data-component',
            'data-element'
        ];
    }

    // Cette méthode est appelée automatiquement quand un attribut change
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'data-shadow-target':
                this._shadowTarget = newValue || "";
                break;

            case 'data-slot-target':
                this._slotTarget = newValue || "";
                this.slot = this._slotTarget; 
                break;

            case 'data-component':
                this._component = newValue || "";
                break;

            case 'data-key':
                this._key = newValue || "";
                break;

            case 'data-name':
                this._name = newValue || "";
                break;

            case 'data-element':
                this._element = newValue || "span";
                break;
        }
    }

    init() {
        // Récupérer le bloc cible via data-identifier
        let targetElement: HTMLElement | null = null;
        const identifier = this.getAttribute('data-identifier');

        if (!identifier) return;

        const targetBloc = document.querySelector(`[data-identifier="${identifier}"]`) as HTMLElement;
        if (!targetBloc) return;

        if (this._shadowTarget && targetBloc.shadowRoot) {
            targetElement = targetBloc.shadowRoot.querySelector(this._shadowTarget) as HTMLElement;
        } else if (this._slotTarget) {
            targetElement = targetBloc.querySelector(`[slot="${this._slotTarget}"]`) as HTMLElement;
        }

        if (!targetElement || !this.shadowRoot) return;

        // Créer l'élément éditeur basé sur _element
        const editorElement = document.createElement(this._element);

        // Initialiser sa valeur depuis l'élément cible
        const initialValue = this._getValueFromElement(targetElement);
        this._setElementValue(editorElement, initialValue);
        this._value = initialValue;

        // Ajouter l'élément éditeur au shadowDOM du PanelItem
        this.shadowRoot.appendChild(editorElement);

        // Synchronisation bidirectionnelle: quand l'éditeur change → met à jour la cible
        editorElement.addEventListener('input', () => this._syncToTarget(editorElement, targetElement));
        editorElement.addEventListener('change', () => this._syncToTarget(editorElement, targetElement));
    }

    private _getValueFromElement(element: HTMLElement): string {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            return element.value;
        } else if (element instanceof HTMLImageElement) {
            return element.src;
        }
        return element.textContent || "";
    }

    private _setElementValue(element: HTMLElement, value: string): void {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            element.value = value;
        } else if (element instanceof HTMLImageElement) {
            element.src = value;
        } else {
            element.textContent = value;
        }
    }

    private _syncToTarget(editorElement: HTMLElement, targetElement: HTMLElement): void {
        const newValue = this._getValueFromElement(editorElement);
        this._setElementValue(targetElement, newValue);
        this.value = newValue; // Déclenche le setter et émet l'événement
    }

    set value(val: any) {
        if (this._value === val) return;
        this._value = val;

        this.dispatchEvent(new CustomEvent('p9r-configuration-changed', {
            detail: {
                value: val,
                key: this._key,
                name: this._name,
                component: this._component,
                element: this._element
            },
            bubbles: true,
            composed: true
        }));
    }

    get value() {
        return this._value;
    }
}

customElements.define('p9r-panel-item', PanelItem);