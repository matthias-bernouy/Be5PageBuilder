# @bernouy/pagebuilder

Modular CMS built on Web Components with an inline visual editing system. Runs on **Bun** and ships as a Bun-first package — no transpile, consumers execute the TypeScript source directly.

This README is written as a consumer guide: how to wire the package into another app, what it exposes, and what you need to provide.

---

## Installation

```bash
bun add @bernouy/pagebuilder @bernouy/socle mongodb sharp linkedom
```

`@bernouy/socle` provides the HTTP runner (`Be5_Runner`) and the authentication layer (`Authentication`, `AuthRepositoryProvider`). It is a runtime dependency of the host app, not of this package.

**Requirements:**
- Bun >= 1.3
- MongoDB (used by the default providers)
- TypeScript >= 5.9 (peer dep)

---

## Quick start — minimal wiring

The package exports a single `PageBuilder` class that you instantiate with four collaborators: a runner, a repository, an auth system, and a media repository. Here is the smallest viable host app:

```ts
// app.ts
import { Authentication, AuthRepositoryProvider, Be5_Runner } from "@bernouy/socle";
import { MongoClient } from "mongodb";
import {
    PageBuilder,
    DefaultPageBuilderRepository,
    DefaultMediaRepository,
} from "@bernouy/pagebuilder";

const mongoClient = await new MongoClient("mongodb://localhost:27017").connect();
const dbName = "my_site";

const runner = new Be5_Runner();

const pageRepo  = new DefaultPageBuilderRepository(mongoClient, dbName);
const authRepo  = new AuthRepositoryProvider(mongoClient, dbName);
const mediaRepo = new DefaultMediaRepository("MediaProvider 1", mongoClient, dbName, runner);

const auth = new Authentication(authRepo, runner, {
    defaultRedirection: "/page-builder/admin/pages",
    basePath: "/auth",
});

new PageBuilder(runner, pageRepo, auth, mediaRepo, {
    adminPathPrefix:  "",   // admin UI mounted under "/page-builder/..."
    clientPathPrefix: "",   // public pages mounted under "/..."
});

runner.start();
```

Run it:

```bash
bun --hot run app.ts
```

A full working example lives in [`App.ts`](./App.ts) at the root of this repo.

---

## Constructor signature

```ts
new PageBuilder(
    runner:          IBe5_Runner,           // from @bernouy/socle
    repository:      PageBuilderRepository, // pages, blocs, templates, snippets, system
    auth:            IBe5_Authentication,   // from @bernouy/socle
    mediaRepository: MediaRepository,       // files, folders, images
    configuration: {
        adminPathPrefix?:  string;  // default "/page-builder"
        clientPathPrefix?: string;  // default "/"
    },
    cache?: Cache                           // optional, defaults to InMemoryCache
);
```

The constructor has side effects: it registers every endpoint on the runner, installs an auth guard in front of admin routes, sets up `GET /`, and hydrates one dynamic GET route per distinct page path found in the repository. After boot, newly created pages register their routes on the fly via `registerPageRoute`.

---

## What it exposes on the runner

### Admin (auth-guarded, under `adminPathPrefix`, default `/page-builder`)

| Group | Kind | Notes |
|---|---|---|
| `/admin/pages` | UI | List, create, delete pages |
| `/admin/templates` | UI | Manage reusable template compositions |
| `/admin/snippets` | UI | Synchronized fragments shared across pages |
| `/admin/media` | UI | Files, folders, upload, crop |
| `/admin/settings` | UI | Site name, favicon, theme CSS, home/404/500 refs, SEO |
| `/admin/editor` | UI | Inline visual editor (used by pages, templates, snippets) |
| `/api/*` | REST | JSON API backing the admin UI (see below) |
| `/css/*` | Static | Design tokens + reset |

The guard lives in `src/endpoints/registerEndpoints.ts` — any request under `adminPathPrefix` must be authenticated with `role === "admin"` or it is redirected to the login page configured on the `Authentication` instance.

### Public (under `clientPathPrefix`, default `/`)

- `GET /` — resolves the home page (literal `/` wins, otherwise `system.site.home`).
- `GET /:pagePath` — dynamic route registered per page at startup and when pages are created.
- `GET /style` — the raw CSS stored in `system.site.theme`, linked from every rendered page.
- `GET /media/*` — public file serving via the media repository.
- Static assets from `src/endpoints/public/`.

Responses are cached (pre-compressed gzip + brotli) keyed by `(path, identifier)`. Edits invalidate automatically via the cache keys declared in `types/p9r-constants.ts`.

### REST API (admin, JSON)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/pages` | List pages |
| `POST` | `/api/page?identifier=X` | Create or update a page |
| `GET` | `/api/templates` | List templates |
| `POST` | `/api/template` | Create a template |
| `POST` | `/api/template?id=X` | Update a template |
| `DELETE` | `/api/template?id=X` | Delete a template |
| `GET` | `/api/snippets` | List snippets |
| `POST` | `/api/snippet` | Create/update a snippet |
| `DELETE` | `/api/snippet?id=X` | Delete a snippet |
| `GET` | `/api/mediaItems` | List media items (optional `parent` filter) |
| `POST` | `/api/media/file` | Upload a file |
| `POST` | `/api/media/folder` | Create a folder |
| `GET` | `/api/media/item?id=X` | Media metadata |
| `PATCH` | `/api/media/item?id=X` | Update media metadata |
| `DELETE` | `/api/media/item?id=X` | Delete media |
| `GET` | `/api/system` | Read system config |
| `POST` | `/api/system` | Update system config |
| `GET` | `/api/blocs` | List registered blocs (used by the editor's BlocLibrary) |

---

## Data model

Exported from the public entry point as `type`-only imports:

```ts
import type {
    TPage, TBloc, TTemplate, TSnippet, TSystem,
} from "@bernouy/pagebuilder";
```

- **`TPage`** — `{ path, identifier, content, title, description, visible, tags }`. The compound key `(path, identifier)` allows multiple variants on the same URL, disambiguated by `?identifier=`.
- **`TBloc`** — `{ id, name, viewJS, editorJS }`. A registered page-builder component. `viewJS` is the public-facing bundle, `editorJS` is loaded in the admin editor. They are **separate bundles** — never cross-import.
- **`TTemplate`** — a reusable HTML fragment. When inserted into a page it becomes an independent copy (no live link).
- **`TSnippet`** — a reusable HTML fragment with a stable `identifier`. Unlike templates, editing a snippet propagates to every page that uses it.
- **`TSystem`** — site-wide settings: `site.{name, favicon, theme, home, notFound, serverError}`, `seo.*`, `editor.layoutCategory`, and an `initializationStep` for the onboarding flow. `home/notFound/serverError` are `TPageRef = { path, identifier } | null`.

---

## Swapping in a custom backend

The defaults target MongoDB, but every collaborator is an interface. Implement these to run against another store:

```ts
import type {
    PageBuilderRepository,
    MediaRepository,
    Cache,
} from "@bernouy/pagebuilder";
```

- `PageBuilderRepository` — CRUD for pages, blocs, templates, snippets, system. Full contract in `src/interfaces/contract/Repository/PageBuilderRepository.ts`.
- `MediaRepository` — `getItems`, `upload`, `getResponse`, `createFolder`, `deleteItem`, `moveItem`, `updateMetadata`. The `getResponse(id, { w, h })` method must return a ready-to-serve `Response`; the default provider uses `sharp` for on-the-fly resizing.
- `Cache` — `get`/`set`/`invalidate` over pre-compressed entries. `InMemoryCache` is the default; swap in Redis or similar for a multi-instance deployment.

Pass the custom implementations into the `PageBuilder` constructor as you would the defaults.

---

### Writing your own bloc

Each bloc is a folder with exactly **5 files** — this layout is non-negotiable, the build pipeline depends on it:

```
MyBloc/
├── MyBloc.ts           // extends Component (src/core/Component/core/Component)
├── MyBlocEditor.ts     // extends Editor (src/core/Editor/core/Editor) + registerEditor
├── template.html       // semantic HTML with <slot>
├── style.css           // self-contained, uses global design tokens
└── configuration.html  // declarative config panel
```

Rules worth knowing when writing blocs (mirror of `CLAUDE.md`):

- The component bundle and the editor bundle are built **separately**. Never cross-import between `MyBloc.ts` and `MyBlocEditor.ts`.
- Placeholders `BE5_TAG_TO_BE_REPLACED`, `BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED` are substituted at build time — leave them as-is.
- Do **not** call `super.connectedCallback()` in components.
- Sub-components never own their own editor — their parent editor drives them via `<p9r-comp-sync>`.
- Use `:host([attr="value"])` selectors for enum-like configuration; CSS `attr()` only works for numeric values with a `px` fallback.
- All code, comments, class names, labels and attributes must be in English.

### Configuration panel elements

`configuration.html` is declarative. Use these in preference to raw inputs:

| Element | Role |
|---|---|
| `<p9r-attr-sync>` | Binds an input to an HTML attribute on the component |
| `<p9r-comp-sync>` | Manages slots (default content, allowed actions, multiplicity) |
| `<p9r-image-sync>` | Image picker wired to MediaCenter |
| `<p9r-section>` | Visual grouping inside the panel |
| `<p9r-select>` | Styled dropdown with label |
| `<p9r-range>` | Slider + number input, min/max/unit |
| `<p9r-sizes-select>` | NONE/XS/S/M/L/XL shortcut select |
| `<p9r-page-link>` | Page picker fed by the admin API |

---

## Rendering pipeline

1. A request hits `GET :pagePath`.
2. `handlePageRequest` looks up `(path, identifier)` in the repository.
3. On a hit, `renderWithFallbacks` calls `renderPage` behind the cache; on a miss, it resolves `system.site.notFound` and serves it with status 404.
4. If `renderPage` throws, `system.site.serverError` is served with status 500 — if *that* also throws, plain text is returned to avoid recursion.
5. `renderPage` produces a `CacheEntry { raw, gzip, brotli, contentType }`, and the response honors the client's `Accept-Encoding`.

`renderPage` uses `linkedom` to parse the stored HTML and inject the `<link rel="stylesheet" href="/style">` tag plus SEO metadata from `TSystem.seo`.

---

## Useful exports cheat sheet

```ts
import {
    // Core
    PageBuilder,

    // Default providers
    DefaultPageBuilderRepository,
    DefaultMediaRepository,
    InMemoryCache,

    // CLI
    importBlocs,
} from "@bernouy/pagebuilder";

import type {
    PageBuilderRepository,
    MediaRepository,
    Cache,
    TPage, TBloc, TTemplate, TSnippet, TSystem,
} from "@bernouy/pagebuilder";
```

---

## Scripts

| Script | Purpose |
|---|---|
| `bun run dev` | Run the bundled reference host (`App.ts`) with `--hot` |
| `bun run build` | Emit `.d.ts` declarations into `dist/` (no JS bundling — this is a Bun-first source package) |
| `bun run typecheck` | `tsc --noEmit` over the whole package |

---

## Internal layout (for contributors)

```
src/
├── core/
│   ├── Component/          Base Component class (HTMLElement + Shadow DOM)
│   ├── Editor/
│   │   ├── core/           EditorManager, Editor, ObserverManager, DragManager
│   │   ├── components/     BlocActionGroup, BlocLibrary, FloatingToolbar, RichTextBar,
│   │   │                   PageConfiguration, TemplateConfiguration, AdminLayout, MediaCenter
│   │   ├── configuration/
│   │   │   ├── Sync/       AttrSync, CompSync, ImageSync
│   │   │   ├── Inputs/     P9rSelect, P9rRange, P9rPageLink
│   │   │   ├── ConfigPanel.ts
│   │   │   └── ConfigItem.ts
│   │   └── editors/        TextEditor, ImageEditor, ListEditor
│   └── Domain/Media/       CardMedia, GridMedia, DetailMedia, CropSystem
├── interfaces/
│   ├── contract/           Repository interfaces, data models (TPage, TBloc, …)
│   └── default-provider/   MongoDB implementations
├── endpoints/
│   ├── admin-ui/           Server-rendered admin pages (pages, templates, editor, settings, media)
│   ├── admin-api/          REST JSON API
│   └── admin-css/          Design tokens (oklch, reset)
└── server/                 renderPage, routing, compression, editorShell

w13c/
├── core/                   Reusable UI (Form, Dialog, Menu, Layout, Table)
└── blocs/                  Built-in editable blocs (Layout, Form, Presentation)
```

See [`CLAUDE.md`](./CLAUDE.md) for the full set of project conventions that apply when extending this package.
