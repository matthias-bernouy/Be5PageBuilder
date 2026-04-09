import type { TagElement } from '../../core/ObserverManager';
import {
    ICON_COMPONENT,
    ICON_SNIPPET,
    ICON_SNIPPET_MUTED,
    ICON_TEMPLATE,
    ICON_TEMPLATE_MUTED,
} from '../../icons';

export type TemplateItem = { id: string; name: string; content: string; category: string };
export type SnippetItem = { id: string; identifier: string; name: string; category: string };

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
        grid.appendChild(createCard(ICON_COMPONENT, item.label, () =>
            deps.onInsert({ type: 'bloc', id: item.tag })));
    });
}

/** Renders the "Templates" tab for a given category. */
export function renderTemplateSection(grid: HTMLElement, templates: TemplateItem[], activeGroup: string | null, deps: SectionDeps) {
    const filtered = templates.filter(t => (t.category || 'Default') === activeGroup);

    if (filtered.length === 0) {
        renderEmptyState(grid, ICON_TEMPLATE_MUTED, 'No templates in this category');
        return;
    }

    filtered.forEach(tpl => {
        grid.appendChild(createCard(ICON_TEMPLATE, tpl.name, () =>
            deps.onInsert({ type: 'template', html: tpl.content })));
    });
}

/** Renders the "Snippets" tab for a given category. */
export function renderSnippetSection(grid: HTMLElement, snippets: SnippetItem[], activeGroup: string | null, deps: SectionDeps) {
    const filtered = snippets.filter(s => (s.category || 'Default') === activeGroup);

    if (filtered.length === 0) {
        renderEmptyState(grid, ICON_SNIPPET_MUTED, 'No snippets in this category');
        return;
    }

    filtered.forEach(snippet => {
        grid.appendChild(createCard(ICON_SNIPPET, snippet.name, () =>
            deps.onInsert({ type: 'snippet', identifier: snippet.identifier })));
    });
}
