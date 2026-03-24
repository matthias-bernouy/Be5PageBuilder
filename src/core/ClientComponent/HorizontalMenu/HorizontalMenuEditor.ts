import { createDefaultElement } from "../../createDefaultElement";
import { Editor } from "../../Editor";
// Supposons que tu as une classe centralisée pour gérer le panneau latéral
// import { SettingsPanel } from "../../ui/SettingsPanel"; 

export class HorizontalMenuEditor extends Editor {
    
    private settingsBtn: HTMLElement;
    private currentHoveredItem: HTMLElement | null = null;

    constructor(target: HTMLElement) {
        // Styles pour le bouton flottant "settings"
        super(target, `
            :host { position: relative; } /* Pour positionner le bouton */
            .edit-settings-btn {
                position: absolute;
                display: none; /* Caché par défaut */
                background: rgba(59, 130, 246, 0.9); /* Bleu accent */
                color: white; border: none;
                border-radius: 4px; padding: 4px;
                cursor: pointer; z-index: 10000;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                line-height: 0;
            }
            .edit-settings-btn svg { width: 16px; height: 16px; }
            
            /* On affiche le bouton quand on survole le menu */
            [data-is-editor="true"]:hover .edit-settings-btn { display: block; }
        `);

        this.ensureDefaultStructure();
        this.settingsBtn = this.createSettingsButton();
        this.viewEditor();
    }

    private ensureDefaultStructure() {
        createDefaultElement(this.target, "logo", "div", "🚀");
        createDefaultElement(this.target, "title", "span", "Mon Site");
    }

    init() {
        // 1. Injecter le bouton de réglages unique
        this.target.appendChild(this.settingsBtn);

        // 2. Écouter le survol pour positionner le bouton dynamiquement
        this.target.addEventListener('mouseover', this.handleMouseOver.bind(this));
    }

    restore() {
        // Nettoyage complet
        this.settingsBtn.remove();
        this.target.removeEventListener('mouseover', this.handleMouseOver);
    }

    private createSettingsButton(): HTMLElement {
        const btn = document.createElement('button');
        btn.className = "edit-settings-btn admin-control";
        // Icône engrenage SVG
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;
        btn.onclick = (e) => {
            e.stopPropagation();
            this.openSettingsPanel();
        };
        return btn;
    }

    private handleMouseOver(e: MouseEvent) {
        // On cherche le LI le plus proche du survol (pour savoir quel item configurer)
        const target = e.target as HTMLElement;
        const li = target.closest('li');

        if (li && li !== this.currentHoveredItem && !li.classList.contains('admin-control')) {
            this.currentHoveredItem = li as HTMLElement;
            // Positionner le bouton flottant juste au-dessus/à côté de l'item survolé
            const rect = li.getBoundingClientRect();
            const parentRect = this.target.getBoundingClientRect();

            // Calcul de la position relative par rapport au composant :host
            this.settingsBtn.style.top = `${rect.top - parentRect.top - 20}px`; // Un peu au dessus
            this.settingsBtn.style.left = `${rect.left - parentRect.left + (rect.width / 2) - 10}px`; // Centré horizontalement
            this.settingsBtn.style.display = "block";
        }
    }

    private openSettingsPanel() {
        if (!this.currentHoveredItem) return;

        // ICI : Appeler ton système global de panneau latéral
        // SettingsPanel.open(new HorizontalMenuConfigView(this.target, this.currentHoveredItem));
        
        // Pour la démo, on simule l'ouverture
        document.dispatchEvent(new CustomEvent('open-settings-panel', {
            detail: {
                targetMenu: this.target,
                activeItem: this.currentHoveredItem
            }
        }));
    }
}