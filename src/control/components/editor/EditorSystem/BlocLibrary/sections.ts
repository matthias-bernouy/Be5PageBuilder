import type { TagElement } from '../../runtime/ObserverManager';
import {
    ICON_COMPONENT,
    ICON_SNIPPET,
    ICON_SNIPPET_MUTED,
    ICON_TEMPLATE,
    ICON_TEMPLATE_MUTED,
} from '../../../icons';

export type TemplateItem = { id: string; name: string; description?: string; content: string; category: string };
export type SnippetItem = { id: string; identifier: string; name: string; description?: string; category: string };

function createCard(icon: string, label: string, description: string, onClick: () => void): HTMLButtonElement {
    const card = document.createElement('button');
    card.className = 'card';
    const desc = description
        ? `<span class="description">${escapeHtml(description)}</span>`
        : '';
    card.innerHTML = `
        <span class="icon">${icon}</span>
        <span class="text">
            <span class="title">${escapeHtml(label)}</span>
            ${desc}
        </span>
    `;
    card.onclick = onClick;
    return card;
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

/** Extra metadata that lives in the DB but isn't carried by the in-browser observer. */
export type BlocMeta = { description?: string };

/** Renders the "Blocs" tab using the live observer's registered tags. */
export function renderBlocSection(
    grid: HTMLElement,
    items: TagElement[],
    metaByTag: Map<string, BlocMeta>,
    deps: SectionDeps,
) {
    items.forEach((item) => {
        const meta = metaByTag.get(item.tag);
        grid.appendChild(createCard(ICON_COMPONENT, item.label, meta?.description || '', () =>
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
        grid.appendChild(createCard(ICON_TEMPLATE, tpl.name, tpl.description || '', () =>
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
        grid.appendChild(createCard(ICON_SNIPPET, snippet.name, snippet.description || '', () =>
            deps.onInsert({ type: 'snippet', identifier: snippet.identifier })));
    });
}

/**
 * Cross-section search. Renders up to three section headers (Blocs,
 * Templates, Snippets) with their respective matches underneath. Sections
 * with zero matches are hidden; if every section is empty, a single "no
 * results" empty state is shown.
 */
export function renderSearchResults(
    grid: HTMLElement,
    query: string,
    blocs: TagElement[],
    blocMeta: Map<string, BlocMeta>,
    templates: TemplateItem[],
    snippets: SnippetItem[],
    deps: SectionDeps,
) {
    const q = query.trim().toLowerCase();

    const matchingBlocs = blocs.filter(b => {
        const desc = blocMeta.get(b.tag)?.description || '';
        return b.label.toLowerCase().includes(q)
            || b.tag.toLowerCase().includes(q)
            || desc.toLowerCase().includes(q);
    });
    const matchingTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(q)
        || (t.description || '').toLowerCase().includes(q)
        || (t.category || '').toLowerCase().includes(q)
    );
    const matchingSnippets = snippets.filter(s =>
        s.name.toLowerCase().includes(q)
        || (s.description || '').toLowerCase().includes(q)
        || s.identifier.toLowerCase().includes(q)
        || (s.category || '').toLowerCase().includes(q)
    );

    const total = matchingBlocs.length + matchingTemplates.length + matchingSnippets.length;
    if (total === 0) {
        renderEmptyState(grid, ICON_COMPONENT, `No results for "${query}"`);
        return;
    }

    if (matchingBlocs.length > 0) {
        appendSectionHeader(grid, 'Blocs');
        renderBlocSection(grid, matchingBlocs, blocMeta, deps);
    }
    if (matchingTemplates.length > 0) {
        appendSectionHeader(grid, 'Templates');
        matchingTemplates.forEach(tpl => {
            grid.appendChild(createCard(ICON_TEMPLATE, tpl.name, tpl.description || '', () =>
                deps.onInsert({ type: 'template', html: tpl.content })));
        });
    }
    if (matchingSnippets.length > 0) {
        appendSectionHeader(grid, 'Snippets');
        matchingSnippets.forEach(snippet => {
            grid.appendChild(createCard(ICON_SNIPPET, snippet.name, snippet.description || '', () =>
                deps.onInsert({ type: 'snippet', identifier: snippet.identifier })));
        });
    }
}

function appendSectionHeader(grid: HTMLElement, label: string) {
    const header = document.createElement('div');
    header.className = 'section-header';
    header.textContent = label;
    grid.appendChild(header);
}
