import "w13c/core/Dialog/LateralDialog/LateralDialog"
import "w13c/core/Form/Input/Input"
import "w13c/core/Form/Checkbox/Checkbox"
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from "src/core/Component/core/Component";

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

        // Capture pointer to continue tracking even if leaving the bar
        e.target.setPointerCapture(e.pointerId);

        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);
    }

    _onPointerMove(e: any) {
        // Calculate new positions
        let newX = e.clientX - this._startX;
        let newY = e.clientY - this._startY;

        // Clamp to viewport bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth - this.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - this.offsetHeight));

        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;
        this.style.right = 'auto'; // Reset base "right" to use "left" instead
    }

    _onPointerUp(e: any) {
        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);
    }

}

customElements.define("w13c-floating-toolbar", FloatingToolbar)