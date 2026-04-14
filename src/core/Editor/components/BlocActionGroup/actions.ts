import { BlocLibrary } from '../BlocLibrary/BlocLibrary';

/**
 * Clones `target` in place (before or after) and strips editor-only attributes
 * from the clone so it behaves as a fresh bloc.
 */
export function insertClone(target: HTMLElement, position: 'before' | 'after') {
    const clone = target.cloneNode(true) as HTMLElement;
    clone.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
    clone.classList.remove("p9r-active");
    clone.querySelectorAll(`[${p9r.attr.EDITOR.IS_EDITOR}]`).forEach(el => {
        el.removeAttribute(p9r.attr.EDITOR.IS_EDITOR);
        el.classList.remove("p9r-active");
    });
    if (position === 'before') {
        target.before(clone);
    } else {
        target.after(clone);
    }
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
        // template is-creating attribut to be set, but check if a fragment can be a html tag
        if (detail.type === 'template') {
            const fragment = document.createRange().createContextualFragment(detail.html);
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
