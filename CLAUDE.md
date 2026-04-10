# BE5 PageBuilder

## Language

**All code, comments, variable names, CSS classes, HTML attributes, titles, placeholders, and labels MUST be written in English.** This applies to every file in the project: TypeScript, HTML, CSS, configuration, skills, etc. No French in code.

## Architecture

- Web Components with Shadow DOM, TypeScript, Bun runtime
- Components extend `Component` from `src/core/Component/core/Component`
- Editors extend `Editor` from `src/core/Editor/core/Editor`
- Build placeholders: `BE5_TAG_TO_BE_REPLACED`, `BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED` — these are injected by the CLI wrapper around the user's entry file; never write them in source
- Component and editor are built as **separate bundles** — never cross-import between them

## Bloc authoring & deployment

- A bloc is a folder with a `manifest.json` at its root (discovered recursively by the CLI). The manifest declares `bloc` (view entry, default `./Bloc.ts`), `editor` (optional editor entry), `default-tag`, `default-group`, and `meta.title`. The `default-tag` is the custom element tag AND the DB primary key — it must be globally unique.
- When `manifest.editor` is absent the bloc is **opaque**: the CLI synthesizes a default editor bundle that calls `registerEditor_opaque()`. At runtime `ObserverManager` marks the element with `p9r-opaque="true"` after editorizing it, so the bloc keeps its parent-level action bar (move/delete/duplicate) but `make_it_editor` refuses to descend into the subtree — nothing inside can be edited.
- The dev CLI and the server-side `prepare_bloc` both wrap the user's entry in a tiny synthetic file before `Bun.build` so the source only needs to export a class. Tag/label/group come from the manifest, never from the user's source.
- `prepare_bloc(fileView, fileEditor, label, group, blocId)` requires `blocId` — there is no UUID fallback. Every bloc is keyed by its manifest tag end to end.
- `bloc.post.ts` rejects any POST without a `tag` form field, and the `blocs` Mongo collection has a unique index on `id` — re-importing a tag that already exists returns 409. To redeploy a bloc you must delete it from the admin UI first.

## CLI (`p9r`)

- Two commands wired in `package.json` bin: `p9r dev` (local editor against a remote CMS with hot-reload) and `p9r import` (deploy blocs via `POST {P9R_URL}/api/bloc`).
- Both commands read `P9R_URL` (admin base, must include the path prefix, e.g. `http://localhost:4999/page-builder`) and `P9R_TOKEN` (admin bearer) from env or `.env`.
- `p9r dev` proxies everything to the remote CMS except `/admin/editor` (assembled locally), `/bloc?tag=X` (served from local dev bundles when present), and `POST /api/page` (persisted to `.p9r-dev/scratch.json` — all other writes are blocked by the write guard). Watches bloc folders via `fs.watch` + a 1s polling rescan for folder-level events Linux `fs.watch` misses, and pushes reloads over `GET /dev/reload` (SSE).
- `p9r import` fetches `GET /api/blocs` first (fail-fast on auth/connectivity), splits local blocs into fresh/collision sets, only builds the fresh ones, and uploads them. Flags: `--dry-run`, `--only=tag1,tag2`. Collisions are warned and skipped — never overwritten.
- CLI source lives in `src/cli/`. `scan.ts` → `build.ts` → `server.ts`/`watch.ts` for dev, `CLI_importBloc.ts` for import.

## Data layer

- Repository interface: `src/interfaces/contract/Repository/PageBuilderRepository.ts`
- Models: `TPage`, `TBloc`, `TTemplate`, `TSystem` in `TModels.ts`
- Default implementation uses MongoDB: `DefaultPagebuilderRepository.ts`
- Media is a separate repository: `MediaRepository.ts` with `DefaultMediaRepository.ts`
- API endpoints follow file-based routing: `resource.METHOD.ts` (e.g. `template.post.ts`, `templates.get.ts`)

## Admin UI

- Admin pages live in `src/endpoints/admin-ui/` — each folder has `*.html`, `*.server.ts`, `*.client.ts`
- All pages use `<w13c-fixed-admin-layout>` with `slot="title"` and `slot="action"`
- File-based routing: `*.server.ts` → GET endpoint, `*.client.ts` → compiled JS bundle
- Auth guard on all `/page-builder/**` routes

## Editor system

- `EditorManager` is the central orchestrator — creates MediaCenter, FloatingToolbar, BlocActionGroup
- `EditorManager.getContent()` returns current HTML without saving (used by TemplateConfiguration)
- `EditorManager.save()` is page-specific (POST to `/api/page`)
- `EditorManager.getConfiguration()` finds either `w13c-page-information` or `w13c-template-information`
- `BlocLibrary` has 3 sections: Blocs (by group), Templates (by category), Snippets (upcoming)
- Templates insert as HTML fragments (independent copies), blocs insert as custom elements

## CSS conventions

- Use attribute selector presets (`:host([bg="surface"]) .inner { ... }`) for configuration-driven styles
- CSS `attr()` only works for simple numeric values with px fallback: `attr(radius px, 16px)`
- For enum-like attributes (e.g. background names mapping to CSS variables), always use `:host([attr="value"])` selectors
- All CSS variables must be self-contained in the component's `style.css`
- Global design tokens: `--primary-base`, `--bg-surface`, `--text-main`, `--border-default`, etc.

## Configuration inputs

Use styled inputs in `configuration.html` instead of raw native elements:

- `<p9r-select>` — styled dropdown with label
- `<p9r-range>` — slider + number input with label, min, max, unit
- `<p9r-sizes-select>` — shortcut for NONE/XS/S/M/L/XL select
- `<p9r-page-link>` — page picker fetching from admin API
- `<p9r-image-sync>` — image picker via MediaCenter

## Key rules

- Sub-components do NOT have their own editor — the parent editor manages them via `<p9r-comp-sync>`
- Never call `super.connectedCallback()` in components
- `::slotted()` for styling light DOM children from shadow DOM
- `:not(:has(::slotted(*)))` pattern to hide empty slot wrappers
