/**
 * Runtime constants exposed globally via `window.p9r` (see `src/core/global.ts`).
 * Server code that can't touch `window` imports these directly instead.
 *
 * Add to this file whenever a magic string ends up duplicated across call
 * sites — the whole point is to have a single source of truth.
 */

export const P9R_MODE = {
    EDITOR: "editor-mode",
    VIEW:   "view-mode",
} as const;

export type P9RMode = typeof P9R_MODE[keyof typeof P9R_MODE];

export const P9R_EVENT = {
    /** Dispatched on `document` when the editor toggles between editor/view mode. */
    SWITCH_MODE:    "switch-mode",
    BLOC_SELECTED:  "p9r-bloc-selected",
    IMAGE_SELECTED: "p9r-image-selected",
} as const;

/** DOM element ids used by both the editor page HTML and its client/server code. */
export const P9R_ID = {
    EDITOR_SYSTEM: "editor-system",
    EDITOR:        "editor",
} as const;

/**
 * Cache key builders. Every `system.cache.{get,set,delete}` call should go
 * through one of these so the prefixes stay consistent and greppable.
 */
export const P9R_CACHE = {
    bloc: (id: string) => `bloc:${id}`,
    page: (path: string) => `page:${path}`,
    css:  (url: string) => `css:${url}`,
    js:   (url: string) => `js:${url}`,
    html: (url: string) => `html:${url}`,
    font: (url: string) => `font:${url}`,
    /** The single theme CSS served at `/style`. */
    STYLE: "style:main",
    /** Concatenated bloc editor JS served at `<admin>/admin/editor-blocs`. */
    EDITOR_BLOCS: "js:editor-blocs",
} as const;
