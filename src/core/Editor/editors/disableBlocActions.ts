

export function disableBlocActions(target: HTMLElement[] | HTMLElement) {
    const targets = Array.isArray(target) ? target : [target];
    targets.forEach(t => {
        t.setAttribute(p9r.attr.ACTION.DISABLE_DELETE, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_EDIT, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_DUPLICATE, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_ADD_BEFORE, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_ADD_AFTER, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_SAVE_AS_TEMPLATE, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_CHANGE_COMPONENT, "true");
        t.setAttribute(p9r.attr.ACTION.DISABLE_DRAGGING, "true");
        t.setAttribute(p9r.attr.TEXT.BLOC_MANAGEMENT, "false");
    });
}