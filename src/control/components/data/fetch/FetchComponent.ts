import { processTemplate } from './render';

/**
 * `<cms-fetch url="…">` — fetches JSON, processes its single root
 * `<template>` against the response, and inserts the output as **siblings**
 * of cms-fetch (so it integrates with parents like `<p9r-table>` that
 * project direct children). Wrapping the content in `<template>` keeps
 * custom elements inside (e.g. `<cms-editor-system>`) inert until the
 * fetch resolves — no premature instantiation.
 *
 *  - `<template>…</template>` — stamp once.
 *  - `<template for="path">…</template>` — iterate the array at `path`.
 *  - `<template for=".">…</template>` — iterate the current context.
 */
export class FetchComponent extends HTMLElement {

    static get observedAttributes() { return ['url', 'reload-on']; }

    private _template: HTMLTemplateElement | null = null;
    /** Nodes the last render inserted into our parent — torn down on re-render. */
    private _renderedNodes: Node[] = [];
    private _reloadEvents: string[] = [];
    private _onReloadEvent = () => { if (this.isConnected) this._fetchAndRender(); };

    connectedCallback(): void {
        this._refreshReloadListeners();
        if (this._template) { this._fetchAndRender(); return; }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._init(), { once: true });
        } else {
            this._init();
        }
    }

    private _init(): void {
        for (const child of Array.from(this.children)) {
            if (child.tagName === 'TEMPLATE') { this._template = child as HTMLTemplateElement; break; }
        }
        if (!this._template) {
            console.warn('cms-fetch: missing <template> child');
            return;
        }
        this._fetchAndRender();
    }

    disconnectedCallback(): void {
        for (const n of this._renderedNodes) n.parentNode?.removeChild(n);
        this._renderedNodes = [];
        for (const ev of this._reloadEvents) document.removeEventListener(ev, this._onReloadEvent);
        this._reloadEvents = [];
    }

    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
        if (oldVal === newVal) return;
        if (name === 'reload-on') {
            this._refreshReloadListeners();
            return;
        }
        if (this.isConnected) this._fetchAndRender();
    }

    private _refreshReloadListeners(): void {
        for (const ev of this._reloadEvents) document.removeEventListener(ev, this._onReloadEvent);
        this._reloadEvents = (this.getAttribute('reload-on') || '').split(/\s+/).filter(Boolean);
        for (const ev of this._reloadEvents) document.addEventListener(ev, this._onReloadEvent);
    }

    private async _fetchAndRender(): Promise<void> {
        const urlAttr = this.getAttribute('url');
        if (!urlAttr) return;

        this.dispatchEvent(new CustomEvent('fetch:loading', { bubbles: true }));

        try {
            const url = new URL(urlAttr, window.location.href);
            for (const [k, v] of new URLSearchParams(window.location.search)) url.searchParams.append(k, v);
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json() as unknown;
            this._stamp(data);
            this.dispatchEvent(new CustomEvent('fetch:data', { bubbles: true, detail: data }));
        } catch (err) {
            this.dispatchEvent(new CustomEvent('fetch:error', { bubbles: true, detail: err }));
        }
    }

    private _stamp(data: unknown): void {
        if (!this._template) return;
        const parent = this.parentNode;
        if (!parent) return;

        for (const n of this._renderedNodes) n.parentNode?.removeChild(n);
        this._renderedNodes = [];

        const fragment = processTemplate(this._template, data);
        const newNodes = Array.from(fragment.childNodes);
        parent.insertBefore(fragment, this);
        this._renderedNodes = newNodes;
    }
}

customElements.define('cms-fetch', FetchComponent);
