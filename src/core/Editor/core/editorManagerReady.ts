/**
 * Ready signal for `document.EditorManager`.
 *
 * Custom elements that depend on `EditorManager` can be upgraded in any
 * order — the `customElements.define()` call for a config/input element
 * (e.g. `<w13c-page-information>`, `<p9r-page-link>`) runs as a side
 * effect of `import`, and any matching element already in the DOM
 * immediately fires `connectedCallback`. That can happen before
 * `new EditorManager(...)` runs in the client bootstrap, so anything
 * touching `document.EditorManager` synchronously in `connectedCallback`
 * is a race waiting to happen.
 *
 * Instead of fighting import ordering, `EditorManager`'s constructor
 * dispatches `EDITOR_MANAGER_READY_EVENT` once `document.EditorManager`
 * is set, and callers route dependent work through
 * `whenEditorManagerReady()`. If the manager already exists the callback
 * runs synchronously; otherwise it waits for the event.
 */
export const EDITOR_MANAGER_READY_EVENT = "p9r:editor-manager-ready";

export function whenEditorManagerReady(callback: () => void): void {
    if (document.EditorManager) {
        callback();
        return;
    }
    document.addEventListener(
        EDITOR_MANAGER_READY_EVENT,
        () => callback(),
        { once: true },
    );
}
