import { createDefaultElement } from "../../createDefaultElement";
import { Editor } from "../../Editor";

export class NavbarEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, "");
        // On initialise les slots par défaut si vides
        createDefaultElement(this.target, "logo", "span", "MY_LOGO");
        createDefaultElement(this.target, "links", "a", "Accueil");
        createDefaultElement(this.target, "links", "a", "Services");
        createDefaultElement(this.target, "links", "a", "Contact");
        createDefaultElement(this.target, "actions", "button", "S'inscrire");
        
        this.viewEditor();
    }

    init() {
        // L'Editor injecte ici la valeur dynamique du breakpoint selon le réglage CMS
        const currentBP = this.target.getAttribute('breakpoint') || '768px';
    }

    // Méthode pour l'interface du CMS pour changer le breakpoint
    setBreakpoint(value: string) {
        this.target.setAttribute('breakpoint', value);
    }

    restore() {
        this.target.removeAttribute('open');
    }
}

document.EditorManager.getObserver().register_editor("w13c-navbar", NavbarEditor);