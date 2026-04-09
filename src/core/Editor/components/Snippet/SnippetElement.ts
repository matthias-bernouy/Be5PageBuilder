import css from './style.css' with { type: 'text' };

const SNIPPET_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`;

/**
 * Custom element that renders a synchronized snippet.
 *
 * In editor mode, the snippet content is SSR-expanded in the light DOM by
 * `expandSnippets()` (see `src/server/expandSnippets.ts`). On upgrade we
 * move that content into the shadow DOM so the ObserverManager (which walks
 * the light DOM) cannot pick it up for inline editing, then we clear the
 * light DOM so that serialization via `EditorManager.getContent()` always
 * produces a reference marker like `<w13c-snippet identifier="hero-v1">`.
 *
 * If the light DOM is empty (newly inserted via BlocLibrary), we fall back
 * to a client-side fetch so the snippet is displayed immediately without
 * requiring a reload.
 *
 * In public mode this file is not bundled — the browser treats `<w13c-snippet>`
 * as a generic unknown element and renders the SSR-expanded inner HTML directly.
 */
export class SnippetElement extends HTMLElement {

    private _shadow: ShadowRoot;

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const identifier = this.getAttribute('identifier');
        if (!identifier) {
            this._renderError('Missing identifier attribute');
            return;
        }

        const preExpanded = this.innerHTML.trim();
        if (preExpanded) {
            this._render(preExpanded, identifier);
            this.innerHTML = '';
            return;
        }

        this._renderLoading();
        this._fetch(identifier);
    }

    private async _fetch(identifier: string) {
        try {
            const base = document.EditorManager?.getApiBasePath?.();
            if (!base) throw new Error('EditorManager not available');

            const url = new URL('snippets', base);
            url.searchParams.set('identifier', identifier);

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(res.status === 404 ? `Snippet "${identifier}" not found` : await res.text());
            }

            const snippet = await res.json();
            this._render(snippet.content, identifier);
        } catch (e: any) {
            this._renderError(e?.message || 'Failed to load snippet');
        }
    }

    private _render(content: string, identifier: string) {
        this._shadow.innerHTML = `
            <style>${css}</style>
            <div class="snippet-label">
                ${SNIPPET_ICON}
                <code>${identifier}</code>
            </div>
            <div class="snippet-content">${content}</div>
        `;
    }

    private _renderLoading() {
        this._shadow.innerHTML = `
            <style>${css}</style>
            <div class="snippet-loading">Loading snippet…</div>
        `;
    }

    private _renderError(msg: string) {
        this._shadow.innerHTML = `
            <style>${css}</style>
            <div class="snippet-error">⚠ ${msg}</div>
        `;
    }
}

if (!customElements.get('w13c-snippet')) {
    customElements.define('w13c-snippet', SnippetElement);
}
