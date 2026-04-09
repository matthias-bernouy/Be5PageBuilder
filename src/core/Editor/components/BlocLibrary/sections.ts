import type { TagElement } from '../../core/ObserverManager';

export type TemplateItem = { id: string; name: string; content: string; category: string };
export type SnippetItem = { id: string; identifier: string; name: string; category: string };

const TEMPLATE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M3 9h18" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 21V9" stroke="currentColor" stroke-width="1.5" fill="none"/>
</svg>
`;

const SNIPPET_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m18 16 4-4-4-4"/>
    <path d="m6 8-4 4 4 4"/>
    <path d="m14.5 4-5 16"/>
</svg>
`;

const DEFAULT_COMPONENT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="6" y="6" width="12" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
    <rect x="6" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="13" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>
`;

function createCard(icon: string, label: string, onClick: () => void): HTMLButtonElement {
    const card = document.createElement('button');
    card.className = 'card';
    card.innerHTML = `
        <span class="icon">${icon}</span>
        <span class="title">${label}</span>
    `;
    card.onclick = onClick;
    return card;
}

function renderEmptyState(grid: HTMLElement, icon: string, message: string) {
    grid.innerHTML = `
        <div class="empty-state">
            ${icon}
            <p>${message}</p>
        </div>
    `;
}

const EMPTY_TEMPLATE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;
const EMPTY_SNIPPET_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`;

export type InsertDetail =
    | { type: 'bloc'; id: string }
    | { type: 'template'; html: string }
    | { type: 'snippet'; identifier: string };

export type SectionDeps = {
    /** Fired when the user picks an item. The caller emits `insert` and closes. */
    onInsert: (detail: InsertDetail) => void;
};

/** Renders the "Blocs" tab using the live observer's registered tags. */
export function renderBlocSection(grid: HTMLElement, items: TagElement[], deps: SectionDeps) {
    items.forEach((item) => {
        grid.appendChild(createCard(DEFAULT_COMPONENT_SVG, item.label, () =>
            deps.onInsert({ type: 'bloc', id: item.tag })));
    });
}

/** Renders the "Templates" tab for a given category. */
export function renderTemplateSection(grid: HTMLElement, templates: TemplateItem[], activeGroup: string | null, deps: SectionDeps) {
    const filtered = templates.filter(t => (t.category || 'Default') === activeGroup);

    if (filtered.length === 0) {
        renderEmptyState(grid, EMPTY_TEMPLATE_ICON, 'No templates in this category');
        return;
    }

    filtered.forEach(tpl => {
        grid.appendChild(createCard(TEMPLATE_SVG, tpl.name, () =>
            deps.onInsert({ type: 'template', html: tpl.content })));
    });
}

/** Renders the "Snippets" tab for a given category. */
export function renderSnippetSection(grid: HTMLElement, snippets: SnippetItem[], activeGroup: string | null, deps: SectionDeps) {
    const filtered = snippets.filter(s => (s.category || 'Default') === activeGroup);

    if (filtered.length === 0) {
        renderEmptyState(grid, EMPTY_SNIPPET_ICON, 'No snippets in this category');
        return;
    }

    filtered.forEach(snippet => {
        grid.appendChild(createCard(SNIPPET_SVG, snippet.name, () =>
            deps.onInsert({ type: 'snippet', identifier: snippet.identifier })));
    });
}
