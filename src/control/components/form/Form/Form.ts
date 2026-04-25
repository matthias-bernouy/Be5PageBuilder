import { CustomHTMLElement } from "../../CustomHTMLElement";
import onSubmit from "./events/onSubmit";


export default class CmsForm extends CustomHTMLElement {

    private _nativeForm: HTMLFormElement | null = null;

    static override get observedAttributes(): string[] {
        return [ "redirect", "target", "method" ]
    }

    private _handleInternalSubmit = (e: Event) => {
        onSubmit(e as SubmitEvent, this);
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            // Sécurité si déjà initialisé
            if (this._nativeForm) return;

            this._nativeForm = document.createElement('form');
            
            while (this.firstChild) {
                this._nativeForm.appendChild(this.firstChild);
            }
            
            this.appendChild(this._nativeForm);
            this._nativeForm.addEventListener("submit", this._handleInternalSubmit);
        });
    }

    override disconnectedCallback(): void {
        this.removeEventListener("submit", (e) => onSubmit(e, this));
    }

    override attributeChangedCallback(name: any, oldValue: any, newValue: any): void {
        // throw new Error("Method not implemented.");
    }

    get redirect() { return this.getAttribute("redirect");  }
    get target  () { 
        const val = this.getAttribute("target")
        if ( !val ) throw new Error("CmsForm target attribute should be set")
        return val;  
    }
    get method  () { return this.getAttribute("method"  );  }

}

if ( !customElements.get("cms-form") ){
    customElements.define("cms-form", CmsForm);
}