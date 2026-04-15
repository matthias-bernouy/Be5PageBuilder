import { BlocLibrary } from '../BlocLibrary/BlocLibrary';

/**
 * Deep-clones `target` as a sibling (used by the duplicate action).
 */
export function duplicateSibling(target: HTMLElement, position: 'before' | 'after') {
    const clone = target.cloneNode(true) as HTMLElement;
    clone.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
    clone.classList.remove("p9r-active");
    clone.querySelectorAll(`[${p9r.attr.EDITOR.IS_EDITOR}]`).forEach(el => {
        el.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
        el.classList.remove("p9r-active");
    });
    if (position === 'before') target.before(clone);
    else target.after(clone);
}

/**
 * Inserts a fresh empty sibling next to `target`. Uses the same tag as `target`
 * (the parent's natural child tag) — at the document root, falls back to `<p>`.
 */
/**
 * Resolves the default tag for a fresh sibling by looking at the parent
 * editor's <p9r-comp-sync> template that matches `target`'s slot. Falls back
 * to `<p>` when no parent editor / no matching comp-sync is found.
 */
function resolveDefaultTag(target: HTMLElement): string {
    const parentId = target.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER);
    if (!parentId) return "p";
    const parentEditor = document.compIdentifierToEditor?.get(parentId) as any;
    const panel = parentEditor?._panelConfig as HTMLElement | null | undefined;
    if (!panel) return "p";
    const slotName = target.getAttribute("slot");
    const compSyncs = panel.querySelectorAll("p9r-comp-sync");
    for (const cs of Array.from(compSyncs)) {
        const template = cs.firstElementChild as HTMLElement | null;
        if (!template) continue;
        const tSlot = template.getAttribute("slot");
        if ((slotName ?? null) === (tSlot ?? null)) {
            return template.tagName.toLowerCase();
        }
    }
    return "p";
}

export function insertBlankSibling(target: HTMLElement, position: 'before' | 'after') {
    const tag = resolveDefaultTag(target);
    const fresh = document.createElement(tag);
    inheritLayoutAttrs(target, fresh);
    fresh.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
    if (position === 'before') target.before(fresh);
    else target.after(fresh);
}

/**
 * Copies editor parent-identifier + slot attributes from `source` to `dest`
 * so a replacement bloc keeps its relationship with the surrounding layout.
 */
function inheritLayoutAttrs(source: HTMLElement, dest: HTMLElement) {
    if (source.hasAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)) {
        dest.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, source.getAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER)!);
    }
    if (source.hasAttribute("slot")) {
        dest.setAttribute("slot", source.getAttribute("slot")!);
    }
}

/**
 * Opens the BlocLibrary and swaps `target` with whatever the user picks
 * (template fragment, snippet element, or a raw bloc by tag).
 * `onDone` is invoked after the replacement so the caller can close its UI.
 */
export function openChangeComponentPicker(target: HTMLElement, onDone: () => void) {
    const library = BlocLibrary.open();
    library.addEventListener('insert', ((e: CustomEvent) => {
        const detail = e.detail;
        if (detail.type === 'template') {
            const fragment = document.createRange().createContextualFragment(detail.html);
            Array.from(fragment.children).forEach(el => {
                el.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true");
            });
            target.replaceWith(fragment);
        } else if (detail.type === 'snippet') {
            const newEl = document.createElement('w13c-snippet');
            newEl.setAttribute('identifier', detail.identifier);
            inheritLayoutAttrs(target, newEl);
            newEl.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true")
            target.replaceWith(newEl);
        } else {
            const newEl = document.createElement(detail.id);
            inheritLayoutAttrs(target, newEl);
            newEl.setAttribute(p9r.attr.EDITOR.IS_CREATING, "true")
            target.replaceWith(newEl);
        }
        onDone();
    }) as EventListener);
}
