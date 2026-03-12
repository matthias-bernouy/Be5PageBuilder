

import { Component, type ComponentMetadata } from 'src/system/base/Component';
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export const QuoteViewMetadata: ComponentMetadata = {
    css: css,
    template: html as unknown as string
}

export interface MenuItem {
    id: string;
    title: string;
}

export class ActionBar extends Component {

    private static menu: ActionBar | null;
    private selectedIndex: number = 0;
    private _items: MenuItem[] = [];
    private boundHandleKeyDown = this.handleKeyDown.bind(this);

    constructor() {
        super(QuoteViewMetadata);
    }

    set items(value: MenuItem[]) {
        this._items = value;
        this.selectedIndex = 0; // On reset la sélection quand la liste change
        this.renderItems();
    }

    get items(): MenuItem[] {
        return this._items;
    }

    connectedCallback() {
        window.addEventListener('keydown', this.boundHandleKeyDown);
        requestAnimationFrame(() => {
            this.shadowRoot?.querySelector('input')?.focus();
        });
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.boundHandleKeyDown);
    }

    private renderItems() {
        const list = this.shadowRoot?.getElementById('menu-list');
        if (!list) return;

        list.innerHTML = this.items.map((item, index) => `
            <div class="item ${index === this.selectedIndex ? 'selected' : ''}" data-id="${item.id}">
                <div class="icon"></div>
                <div class="info">
                    <span class="title">${item.title}</span>
                    <span class="desc"></span>
                </div>
                <kbd></kbd>
            </div>
        `).join('');
    }

    private handleKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
                this.renderItems();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
                this.renderItems();
                break;
            case 'Enter':
                this.selectItem();
                break;
            case 'Escape':
                this.remove();
                break;
        }
    }

    private selectItem() {
        const item = this.items[this.selectedIndex];
        this.dispatchEvent(new CustomEvent('select', {
            detail: item,
            bubbles: true,
            composed: true
        }));
        this.remove();
    }

    static open(items: MenuItem[]) {
        ActionBar.close();
        const menu = new ActionBar();
        menu.items = items;
        document.body.appendChild(menu);
        return menu;
    }

    static close() {
        ActionBar.menu?.remove();
    }
}

customElements.define("w13c-action-bar", ActionBar)