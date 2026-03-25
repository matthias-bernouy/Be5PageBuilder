import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class Navbar extends Component {
    private _breakpoint: number = 768;

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    connectedCallback() {
        this.updateBreakpoint();
        this.setupListeners();
        this.setupIndicator();
    }

    static get observedAttributes() {
        return ['breakpoint', 'open'];
    }

    attributeChangedCallback(name: string, old: string, next: string) {
        if (name === 'breakpoint') this.updateBreakpoint();
    }

    private updateBreakpoint() {
        const bp = this.getAttribute('breakpoint') || '768px';
        this._breakpoint = parseInt(bp);
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: ${bp}) {
                .desktop-nav { display: none; }
                .menu-toggle { display: block; }
            }
        `;
        this.shadowRoot?.appendChild(style);
    }

    private setupListeners() {
        const toggle = this.shadowRoot?.querySelector('.menu-toggle');
        const close = this.shadowRoot?.querySelector('.close-btn');
        const overlay = this.shadowRoot?.querySelector('.drawer-overlay');

        const toggleMenu = () => {
            const isOpen = this.hasAttribute('open');
            isOpen ? this.removeAttribute('open') : this.setAttribute('open', '');
            this.dispatchEvent(new CustomEvent('w13c-nav-toggle', { detail: !isOpen }));
        };

        toggle?.addEventListener('click', toggleMenu);
        close?.addEventListener('click', toggleMenu);
        overlay?.addEventListener('click', toggleMenu);
    }

    private setupIndicator() {
        const wrapper = this.shadowRoot?.querySelector('.links-wrapper');
        const indicator = this.shadowRoot?.querySelector('.nav-indicator') as HTMLElement;
        const slot = this.shadowRoot?.querySelector('nav slot') as HTMLSlotElement;

        slot?.addEventListener('slotchange', () => {
            const links = slot.assignedElements();
            links.forEach(link => {
                link.addEventListener('mouseenter', (e) => {
                    const target = e.target as HTMLElement;
                    indicator.style.width = `${target.offsetWidth}px`;
                    indicator.style.left = `${target.offsetLeft}px`;
                    indicator.style.opacity = '1';
                });
            });
            wrapper?.addEventListener('mouseleave', () => indicator.style.opacity = '0');
        });
    }
}

customElements.define("w13c-navbar", Navbar);