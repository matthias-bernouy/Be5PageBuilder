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

The constructor has side effects: it registers every endpoint on the runner, installs an auth guard in front of admin routes, and hydrates one dynamic GET route per distinct page path found in the repository (including `/` when a page with that path exists). After boot, newly created pages register their routes on the fly via `registerPageRoute`.

---

## What it exposes on the runner

### Admin (auth-guarded, under `adminPathPrefix`, default `/page-builder`)

| Group | Kind | Notes |
|---|---|---|
| `/admin/pages` | UI | List, create, delete pages |
| `/admin/templates` | UI | Manage reusable template compositions |
| `/admin/snippets` | UI | Synchronized fragments shared across pages |
| `/admin/media` | UI | Files, folders, upload, crop |
| `/admin/settings` | UI | Site name, favicon, theme CSS, 404/500 refs |
| `/admin/editor` | UI | Inline visual editor (used by pages, templates, snippets) |
| `/api/*` | REST | JSON API backing the admin UI (see below) |
| `/css/*` | Static | Design tokens + reset |

The guard lives in `src/endpoints/registerEndpoints.ts` — any request under `adminPathPrefix` must be authenticated with `role === "admin"` or it is redirected to the login page configured on the `Authentication` instance.

### Public (under `clientPathPrefix`, default `/`)

- `GET /:pagePath` — dynamic route registered per page at startup and when pages are created. Create a page with `path: "/"` to serve the home page.
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
- **`TBloc`** — `{ id, name, group, description, viewJS, editorJS }`. A registered page-builder component. `viewJS` is the public-facing bundle, `editorJS` is loaded in the admin editor — they are **separate bundles**, never cross-import. `group` and `description` are persisted alongside the bundles so `GET /api/blocs-list` can answer without parsing any JS.
- **`TSnippet`** — a reusable HTML fragment keyed by a stable `identifier`. Unlike templates, editing a snippet propagates to every page that uses it.
- **`TTemplate`** — a reusable HTML fragment. When inserted into a page it becomes an independent copy (no live link).
- **`TSystem`** — site-wide settings: `site.{name, favicon, host, language, theme, notFound, serverError}`, `editor.layoutCategory`, and an `initializationStep` for the onboarding flow. `notFound/serverError` are `TPageRef = { path, identifier } | null`.

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

- `PageBuilderRepository` — CRUD for pages, blocs, templates, snippets, system. Full contract in `src/contracts/Repository/PageBuilderRepository.ts`.
- `MediaRepository` — `getItems`, `upload`, `getResponse`, `createFolder`, `deleteItem`, `moveItem`, `updateMetadata`. The `getResponse(id, { w, h })` method must return a ready-to-serve `Response`; the default provider uses `sharp` for on-the-fly resizing.
- `Cache` — `get`/`set`/`invalidate` over pre-compressed entries. `InMemoryCache` is the default; swap in Redis or similar for a multi-instance deployment.

Pass the custom implementations into the `PageBuilder` constructor as you would the defaults.

---

## Developing blocs with the `p9r` CLI

The package ships a CLI (`p9r`) for iterating on blocs outside the host app. The bin is wired in `package.json`, so once the package is installed you can run:

```bash
bunx p9r init <folder> [--force]
bunx p9r install-skill [--force]
bunx p9r dev
bunx p9r import [flags]
bunx p9r list-blocs [--json]
bunx p9r help
```

`p9r dev`, `p9r import` and `p9r list-blocs` read their credentials from the environment (or a `.env` file in the current directory):

| Var | Purpose |
|---|---|
| `P9R_URL` | Base URL of the remote CMS, including the admin path prefix — e.g. `http://localhost:4999/page-builder` |
| `P9R_TOKEN` | Bearer token used to authenticate as an admin against that CMS |

`p9r init` and `p9r install-skill` do not need either variable — they only touch the local filesystem.

### `p9r init` — scaffold a new bloc

`p9r init <folder>` copies the base bloc template into `<folder>` so you can start writing a new bloc from a working skeleton instead of an empty directory.

The scaffold contains everything the CLI expects: `manifest.json`, `Bloc.ts`, `BlocEditor.ts`, `template.html`, `style.css`, `configuration.html`, plus an `assets/` folder with a placeholder thumbnail and image and a `README.md` documenting the `<p9r-*>` configuration tags.

After scaffolding, edit `manifest.json` to set `default-tag` (the custom-element tag — must be globally unique) and `default-group`, then run `p9r dev` from the parent folder to preview it.

Flags:

| Flag | Purpose |
|---|---|
| `--force`, `-f` | Overwrite an existing non-empty folder (disabled by default to protect in-progress work) |

To create an opaque bloc (no editor, sealed subtree, parent-level action bar only), delete `BlocEditor.ts` and `configuration.html` from the scaffold and drop the `"editor"` field from `manifest.json`.

### `p9r install-skill` — install the bloc-creator Claude Code skill

`p9r install-skill` copies the `bloc-creator` Claude Code skill that ships inside the package into `./.claude/skills/bloc-creator/` in the current project. Once installed, Claude Code discovers it automatically and triggers it whenever you ask Claude to "create a bloc" (or component, widget, card, section…) inside a `@bernouy/pagebuilder` project — Claude will scaffold the manifest, the view and editor entries, the template, the stylesheet and the configuration panel in one go, following the project's conventions.

The skill is a self-contained folder of instructions and templates; it has no runtime footprint and is only read by Claude Code on demand.

Flags:

| Flag | Purpose |
|---|---|
| `--force`, `-f` | Overwrite an existing non-empty `./.claude/skills/bloc-creator/` (disabled by default to protect local edits to the skill) |

### `p9r dev` — local editor with hot-reload

`p9r dev` boots a local web server that mirrors the remote editor shell but substitutes your locally-built blocs for their remote counterparts. It is the fastest way to iterate on a bloc without publishing anything.

- Walks the cwd looking for folders containing `manifest.json` and builds each one (view + editor bundle; synthesizes an opaque editor if `manifest.editor` is absent).
- Serves `/admin/editor` locally, injecting the dev bundles and shadowing any remote bloc that shares the same tag.
- Proxies everything else (admin UI assets, CSS, API reads) to the remote CMS — so templates, pages, media and system config behave exactly as production.
- **Writes are blocked** except for `POST /api/page`, which is intercepted and persisted to `.p9r-dev/scratch.json` instead of hitting the CMS. That lets you save your edit state across reloads without touching the live database.
- Watches every bloc folder with `fs.watch` and rebuilds on change (150ms debounce). A 1s polling loop also rescans the cwd to catch new folders, renames, copies and deletions that `fs.watch` cannot observe on Linux.
- A server-sent events endpoint (`/dev/reload`) notifies the open browser to reload as soon as a rebuild lands.

Flags:

| Flag | Default | Purpose |
|---|---|---|
| `--port=<n>` | `5000` | Local port for the dev server |
| `--host=<h>` | `localhost` | Host interface to bind |

### `p9r import` — deploy blocs to the CMS

`p9r import` scans the cwd the same way `p9r dev` does, then pushes every freshly-built bloc to `{P9R_URL}/api/bloc` over HTTPS with the admin bearer token.

- Fetches `GET {P9R_URL}/api/blocs` **first** to build a snapshot of the tags already registered. If the CMS is unreachable or the token is refused, the CLI aborts before doing any work.
- Splits the local blocs into `fresh` and `collisions` against that snapshot. **Existing tags are never overwritten** — they are reported with a warning and skipped. To re-import a bloc, delete it from the admin UI first.
- Only `fresh` blocs are built (saves time when most blocs are already in the CMS).
- Uploads each one as `multipart/form-data` with `tag`, `name`, `group`, `viewJS`, `editorJS` (absent for opaque blocs). The server stores the bloc under its manifest `default-tag`.
- Final summary: `N imported, M skipped, K failed`. Non-zero exit code on any failure.

Flags:

| Flag | Purpose |
|---|---|
| `--dry-run` | Scan, build, and show what would be pushed — no network writes |
| `--only=tag1,tag2` | Restrict the run to the listed manifest tags |

### `p9r list-blocs` — discover what's already on the CMS

`p9r list-blocs` queries the remote CMS and prints every registered bloc with its `id`, `name`, `group` and `description`. Use it before scaffolding a new bloc to see what tags already exist — this is the hook the `bloc-creator` Claude Code skill uses to avoid hallucinating components.

The command calls `GET {P9R_URL}/api/blocs-list`, a lightweight endpoint that projects bloc metadata only (no `viewJS` / `editorJS` payloads), so it is cheap to call repeatedly. Output is grouped by `group` and sorted by tag.

Reserved prefixes `w13c-*` and `p9r-*` are system-only — do **not** create blocs with those prefixes, they are reserved for internal PageBuilder components to avoid tag collisions.

Flags:

| Flag | Purpose |
|---|---|
| `--json` | Emit the raw JSON array instead of the human-readable listing (useful for piping into tools) |

---

### Writing your own bloc

A bloc lives in its own folder and is described by a `manifest.json` at its root. The CLI discovers blocs by walking the current working directory looking for that manifest.

```
MyBloc/
├── manifest.json       // declares tag, group, entry files
├── Bloc.ts             // imports Component from @bernouy/pagebuilder/component
├── BlocEditor.ts       // imports Editor  from @bernouy/pagebuilder/editor    (optional: omit for opaque blocs)
├── template.html       // semantic HTML with <slot>, imported by Bloc.ts
├── style.css           // self-contained, uses global design tokens
└── configuration.html  // declarative config panel, imported by BlocEditor.ts
```

The two sub-entries are isolated on purpose: `@bernouy/pagebuilder/component` reaches none of the editor code, so the view bundle that site visitors download never contains `Editor`, `ObserverManager`, `ConfigPanel`, or anything from the admin surface. Keep `Bloc.ts` strictly on `/component` and `BlocEditor.ts` strictly on `/editor`.

`manifest.json` is the single source of truth for the bloc's identity:

```json
{
    "runtime": "0.0.1",
    "bloc":    "./Bloc.ts",
    "editor":  "./BlocEditor.ts",

    "default-tag":   "my-bloc",
    "default-group": "Layout",

    "meta": {
        "author":      "Jane Doe",
        "title":       "My bloc",
        "description": "What it does",
        "categories":  ["layout"],
        "thumbnail":   "./assets/thumbnail.svg"
    }
}
```

- `bloc` — path to the view entry (defaults to `./Bloc.ts`).
- `editor` — path to the editor entry. **Omit this field to deploy an opaque bloc**: the CLI builds a default editor that exposes only parent-level actions (add/move/delete/duplicate) and seals the entire subtree. Nothing inside an opaque bloc can be edited in the inline editor.
- `default-tag` — the custom element tag. This is what ends up in the HTML (`<my-bloc>…</my-bloc>`), and also the primary key in the database. It must be unique across your deployment.
- `default-group` — which section of the BlocLibrary the bloc appears in.
- `meta.title` — label shown in the BlocLibrary; defaults to the folder name if absent.

Rules worth knowing when writing blocs (mirror of `CLAUDE.md`):

- The component bundle and the editor bundle are built **separately**. Never cross-import between `Bloc.ts` and `BlocEditor.ts`.
- Placeholders `BE5_TAG_TO_BE_REPLACED`, `BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED` are substituted at build time by the wrapper the CLI injects — your own source does **not** need to reference them (the CLI wraps your entry file with a tiny synthetic file that calls `customElements.define` and `registerEditor` for you).
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
| `<p9r-state-sync>` | Declares a pinnable runtime state (open dropdown, hover, active tab…) so the author can freeze it from the action bar and edit the element without losing the state |
| `<p9r-image-sync>` | Image picker wired to MediaCenter |
| `<p9r-section>` | Visual grouping inside the panel |
| `<p9r-select>` | Styled dropdown with label |
| `<p9r-range>` | Slider + number input, min/max/unit |
| `<p9r-sizes-select>` | NONE/XS/S/M/L/XL shortcut select |
| `<p9r-link>` | Link picker: internal page, external URL, or media file |

---

## Rendering pipeline

1. A request hits `GET :pagePath`.
2. `handlePageRequest` looks up `(path, identifier)` in the repository.
3. On a hit, `renderWithFallbacks` calls `renderPage` behind the cache; on a miss, it resolves `system.site.notFound` and serves it with status 404.
4. If `renderPage` throws, `system.site.serverError` is served with status 500 — if *that* also throws, plain text is returned to avoid recursion.
5. `renderPage` produces a `CacheEntry { raw, gzip, brotli, contentType }`, and the response honors the client's `Accept-Encoding`.

`renderPage` uses `linkedom` to build the `<head>`, emitting the page's `<title>` / `<meta description>`, the `<link rel="stylesheet" href="/style">` tag, and a `<link rel="canonical">` built from `TSystem.site.host`.

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
} from "@bernouy/pagebuilder";

import type {
    PageBuilderRepository,
    MediaRepository,
    Cache,
    TPage, TBloc, TTemplate, TSnippet, TSystem,
} from "@bernouy/pagebuilder";
```

Bloc authoring symbols live in two **separate sub-entries** so the view bundle visitors download never contains editor code:

```ts
// View side — imported by Bloc.ts
import { Component } from "@bernouy/pagebuilder/component";

// Editor side — imported by BlocEditor.ts
import { Editor, registerEditor, registerEditor_opaque } from "@bernouy/pagebuilder/editor";
```

See [Writing your own bloc](#writing-your-own-bloc).

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
│   │   │                   PageConfiguration, TemplateConfiguration, SnippetConfiguration,
│   │   │                   AdminLayout, MediaCenter
│   │   ├── configuration/
│   │   │   ├── Sync/       AttrSync, CompSync, ImageSync, StateSync
│   │   │   ├── Inputs/     P9rSelect, P9rRange, P9rLink
│   │   │   ├── ConfigPanel.ts
│   │   │   └── ConfigItem.ts
│   │   └── editors/        TextEditor, ImageEditor, ListEditor, SnippetEditor
│   └── Domain/Media/       CardMedia, GridMedia, DetailMedia, CropSystem
├── contracts/              Repository interfaces, data models (TPage, TBloc, …)
├── providers/
│   ├── mongo/              MongoDB implementations (Repository, Media)
│   └── memory/             In-memory Cache implementation
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
