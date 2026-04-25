import { Card } from '../components/Card/Card';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ICON_TEMPLATE, ICON_TEMPLATE_MUTED } from '../../../../icons';
import type { OnPick, TemplateItem } from '../types';

export type RenderTemplatesOptions = {
    grid: HTMLElement;
    templates: TemplateItem[];
    category: string | null;
    onPick: OnPick;
};

export function renderTemplates({ grid, templates, category, onPick }: RenderTemplatesOptions) {
    const filtered = templates.filter(t => (t.category || 'Default') === category);

    if (filtered.length === 0) {
        grid.appendChild(EmptyState.create({
            icon: ICON_TEMPLATE_MUTED,
            message: 'No templates in this category',
        }));
        return;
    }

    for (const tpl of filtered) {
        const card = Card.create({
            icon: ICON_TEMPLATE,
            title: tpl.name,
            description: tpl.description,
        });
        card.addEventListener('click', () => onPick({ type: 'template', html: tpl.content }));
        grid.appendChild(card);
    }
}
