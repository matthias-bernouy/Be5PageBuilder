import { Component } from "../../../Component";
import "src/core/EditorMode/Component/LateralDialog/LateralDialog"
import "src/core/EditorMode/Component/Form/Input/Input"
import "src/core/EditorMode/Component/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class FloatingToolbar extends Component {

    private _startX: number = 0;
    private _startY: number = 0;

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
    }

    connectedCallback() {
        const handle = this.shadowRoot?.getElementById('drag-handle');
        handle?.addEventListener('pointerdown', this._onPointerDown.bind(this));
    }

    _onPointerDown(e: any) {
        this._startX = e.clientX - this.offsetLeft;
        this._startY = e.clientY - this.offsetTop;

        // On capture le pointeur pour continuer à tracker même si on sort de la barre
        e.target.setPointerCapture(e.pointerId);

        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);
    }

    _onPointerMove(e: any) {
        // Calcul des nouvelles positions
        let newX = e.clientX - this._startX;
        let newY = e.clientY - this._startY;

        // Optionnel : Ajouter des limites pour ne pas sortir de l'écran
        newX = Math.max(0, Math.min(newX, window.innerWidth - this.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - this.offsetHeight));

        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;
        this.style.right = 'auto'; // On annule le "right" de base pour utiliser "left"
    }

    _onPointerUp(e: any) {
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }

}

customElements.define("w13c-floating-toolbar", FloatingToolbar)