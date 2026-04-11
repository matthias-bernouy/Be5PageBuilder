# Conventions — `manifest.json`

The manifest is the only place tag, group, label, and entry points are
declared. The CLI reads it to wire up registration — source files never carry
this information.

## Fields

### `runtime` (required)

Manifest schema version string. Currently always `"0.0.1"`. Future versions
of the CLI may gate features on this.

### `bloc` (required)

Relative path to the view entry. Almost always `"./Bloc.ts"`.

The file at this path must `export class <Name> extends Component` and
nothing else tag-related.

### `editor` (optional)

Relative path to the editor entry, typically `"./BlocEditor.ts"`.

**Omitting `editor` makes the bloc opaque.** An opaque bloc:

- Cannot be edited from the inside. Its slot content is frozen.
- Still gets the parent-level action bar (move / delete / duplicate).
- Is marked by the runtime with `p9r-opaque="true"` after editorization.
- Does not need a `BlocEditor.ts` file or a `configuration.html`.

Use opaque mode for self-contained visual blocs with no configurable content
(decorative dividers, attention-grabbers, complex interactive widgets that
manage their own state).

### `default-tag` (required)

The HTML custom element tag. Rules:

- Must contain a hyphen (custom element spec).
- **Globally unique across the entire CMS.** It is the DB primary key for
  the `blocs` collection.
- Stable: re-deploying a bloc with an existing tag returns 409 Conflict —
  the admin has to delete the bloc from the UI first.
- Used as-is in HTML pages by the editor and by other blocs that compose it.

Pick something descriptive and namespaced: `acme-hero-card`, `shop-price-badge`,
not `card` or `hero`.

### `default-group` (required)

The label under which the bloc appears in the editor's library sidebar.
Examples: `"Content"`, `"Layout"`, `"Media"`, `"Forms"`.

### `meta` (optional)

All subfields are optional. They are not required at runtime; they drive
the library UI and a future public catalog. Recommended for any bloc that
will be shipped to end users.

| Field | Type | Purpose |
|---|---|---|
| `meta.author` | string | Attribution. |
| `meta.title` | string | Human-readable title shown in the library. |
| `meta.description` | string | Short description shown in the library. |
| `meta.categories` | string[] | Tags used for filtering in the library. |
| `meta.thumbnail` | string (path) | Image shown in the library grid. Relative to the bloc folder, typically `./assets/thumbnail.svg`. |
| `meta.images` | string[] (paths) | Additional preview images shown on the bloc detail view. |

## Uniqueness enforcement

The server's `bloc.post.ts` endpoint rejects any upload without a `tag` form
field, and the `blocs` Mongo collection has a unique index on `id`. Rename
your `default-tag` if you fork someone else's bloc; do not assume you can
overwrite.

## Don't put in the manifest

- JavaScript configuration, conditional logic, environment branches — the
  manifest is pure data.
- Runtime props. Those go on the element as HTML attributes, driven by
  `<p9r-attr-sync>` in `configuration.html`.
