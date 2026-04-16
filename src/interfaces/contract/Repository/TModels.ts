export type TBloc = {
    id: string;
    name: string;
    group: string;
    description: string;
    viewJS: string;
    editorJS: string;
}

export type TPage = {
  id?: string;
  /**
   * Optional discriminator within a path. Pages are uniquely identified by
   * (path, identifier). When empty, the page is the default for its path
   * and is served without any query parameter: e.g. `/article`. When set,
   * the page is served as `/article?identifier=foo`.
   */
  identifier: string;
  path: string;
  content: string;
  title: string;
  description: string;
  visible: boolean;
  tags: string[];
}



export type TTemplate = {
    id?: string;
    name: string;
    description: string;
    content: string;
    category: string;
    createdAt: Date;
}

export type TSnippet = {
    id?: string;
    identifier: string;
    name: string;
    description: string;
    content: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Reference to a specific page by its compound key. `null` means "not set";
 * `identifier: ""` is valid and targets the default variant for that path.
 */
export type TPageRef = { path: string; identifier: string } | null;

export type TSystem = {

    initializationStep: number;

    site: {
        name: string;
        favicon: string;
        visible: boolean;
        /**
         * Canonical base URL of the public site (e.g. `https://example.com`).
         * Used to build the `<link rel="canonical">` of every rendered page.
         * Empty string means "do not emit a canonical link".
         */
        host: string;
        /**
         * Default site language as a BCP-47 tag (e.g. `en`, `fr`, `fr-FR`).
         * Emitted as `<html lang="...">` on every rendered page. Empty string
         * means "do not set a lang attribute".
         */
        language: string;
        /** Raw CSS served at `/style` and linked by every rendered public page. */
        theme: string;
        /** Page served at `/` (unless a page exists with literal path `/`). */
        home: TPageRef;
        /** Page rendered when a dynamic route matches but the page is missing. */
        notFound: TPageRef;
        /** Page rendered when `renderPage` throws. */
        serverError: TPageRef;
    },

    seo: {
        titleTemplate: string;
        defaultDescription: string;
        defaultOgImage: string;
    },

    editor: {
        /**
         * Name of the template category used as "layouts". When set, opening
         * the editor for a brand-new page auto-opens the BlocLibrary locked
         * on the Templates tab, filtered to this category.
         */
        layoutCategory: string;
    }

}