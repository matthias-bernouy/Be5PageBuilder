import { Component } from 'src/core/Component/core/Component';

export class FormSection extends Component {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    private render() {
        this.shadowRoot!.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 32px;
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .section-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 12px;
                }

                .accent-bar {
                    width: 3px;
                    height: 14px;
                    background: var(--primary-base);
                    border-radius: 4px;
                    box-shadow: 0 0 8px var(--primary-muted);
                }

                .title-wrapper {
                    color: var(--text-main);
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    user-select: none;
                }

                .content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px; /* Espace entre les inputs/composants */
                    padding: 4px 0 4px 12px;
                }

                /* Force les enfants à prendre toute la largeur */
                .content > * {
                    width: 100%;
                }
            </style>

            <section class="section-container">
                <header>
                    <div class="accent-bar"></div>
                    <div class="title-wrapper">
                        ${this.getAttribute("data-title")}
                    </div>
                </header>

                <main class="content">
                    <slot></slot>
                </main>
            </section>
        `;
    }
}

if ( !customElements.get("p9r-section") ){
    customElements.define("p9r-section", FormSection);
}