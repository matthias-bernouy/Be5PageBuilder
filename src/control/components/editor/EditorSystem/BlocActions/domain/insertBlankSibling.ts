/**
 * Resolves the default tag for a fresh sibling by looking at the parent
 * editor's <p9r-comp-sync> template that matches `target`'s slot. Falls
 * back to `<p>` when no parent editor / no matching comp-sync is found.
 */
function resolveDefaultTag(target: HTMLElement): string {
    const parentId = target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
    if (!parentId) return 'p';
    const parentEditor = document.compIdentifierToEditor?.get(parentId) as any;
    if (!parentEditor) return 'p';
    const slotName = target.getAttribute('slot');
    const compSyncs = parentEditor.queryPanelChildren('p9r-comp-sync') as Element[];
    for (const cs of compSyncs) {
        const template = cs.firstElementChild as HTMLElement | null;
        if (!template) continue;
        const tSlot = template.getAttribute('slot');
        if ((slotName ?? null) === (tSlot ?? null)) {
            return template.tagName.toLowerCase();
        }
    }
    return 'p';
}

/**
 * Inserts a fresh empty sibling next to `target`. Uses the parent
 * comp-sync template's tag when available, falls back to `<p>`.
 */
export function insertBlankSibling(target: HTMLElement, position: 'before' | 'after') {
    const tag = resolveDefaultTag(target);
    const fresh = document.createElement(tag);
    const parentId = target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
    if (parentId) fresh.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
    const slot = target.getAttribute('slot');
    if (slot) fresh.setAttribute('slot', slot);
    fresh.setAttribute(p9r.attr.EDITOR.IS_CREATING, 'true');
    if (position === 'before') target.before(fresh);
    else target.after(fresh);
}
