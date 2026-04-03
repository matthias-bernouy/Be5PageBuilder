
import { Component } from 'src/core/Component/core/Component';

const css = `
:host {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    cursor: pointer;
}

.chevron {
    display: none;
    transition: transform 0.25s ease;
    opacity: 0.5;
    flex-shrink: 0;
}

:host([has-submenu]) .chevron {
    display: block;
}

:host(:hover) .chevron {
    transform: rotate(180deg);
    opacity: 1;
}

::slotted(a) {
    text-decoration: none;
    color: inherit;
}

.dropdown {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    min-width: var(--submenu-min-width, 200px);
    background: var(--submenu-bg, var(--bg-surface, #fff));
    border-radius: var(--submenu-radius, 8px);
    box-shadow: var(--submenu-shadow, 0 8px 24px rgba(0, 0, 0, 0.12));
    padding: 0.5rem;
    flex-direction: column;
    gap: 0.125rem;
    z-index: 100;
    opacity: 0;
    transform-origin: top center;
}

:host(:hover) .dropdown,
:host([open]) .dropdown {
    display: flex;
    animation: dropdown-in 0.2s ease forwards;
}

.dropdown::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 8px;
}

@keyframes dropdown-in {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

::slotted([slot="submenu"]) {
    display: block;
    padding: 0.5rem 0.875rem;
    color: var(--text-body, #555);
    text-decoration: none;
    font-size: 0.875rem;
    border-radius: 6px;
    transition: color 0.15s, background-color 0.15s;
    white-space: nowrap;
    cursor: pointer;
}

::slotted([slot="submenu"]:hover) {
    color: var(--primary-base, #4361ee);
    background: color-mix(in srgb, var(--primary-base, #4361ee) 8%, transparent);
}

:host(.mobile-mode) {
    flex-direction: column;
    align-items: stretch;
}

:host(.mobile-mode) .dropdown {
    position: static;
    transform: none;
    box-shadow: none;
    background: transparent;
    padding: 0.25rem 0 0.25rem 1rem;
    border-radius: 0;
    min-width: unset;
    display: none;
    opacity: 1;
    animation: none;
}

:host(.mobile-mode[has-submenu]) .dropdown {
    display: flex;
}

:host(.mobile-mode) .chevron {
    transform: rotate(180deg);
}
`;

const template = `
<div class="trigger">
    <slot></slot>
    <svg class="chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</div>
<div class="dropdown">
    <slot name="submenu"></slot>
</div>
`;

export class MenuItem extends Component {

    constructor() {
        super({ css, template });

        const submenuSlot = this.shadowRoot!.querySelector('slot[name="submenu"]') as HTMLSlotElement;
        submenuSlot?.addEventListener('slotchange', () => this._updateSubmenuState(submenuSlot));
    }

    private _updateSubmenuState(slot: HTMLSlotElement) {
        const assigned = slot.assignedElements();
        if (assigned.length > 0) {
            this.setAttribute('has-submenu', '');
        } else {
            this.removeAttribute('has-submenu');
        }
    }
}