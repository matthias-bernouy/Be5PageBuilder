# BE5 PageBuilder

## Language

**All code, comments, variable names, CSS classes, HTML attributes, titles, placeholders, and labels MUST be written in English.** This applies to every file in the project: TypeScript, HTML, CSS, configuration, skills, etc. No French in code.

## Architecture

- Web Components with Shadow DOM, TypeScript, Bun runtime
- Components extend `Component` from `src/core/Component/core/Component`
- Editors extend `Editor` from `src/core/Editor/core/Editor`
- Build placeholders: `BE5_TAG_TO_BE_REPLACED`, `BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED` — never replace these
- Component and editor are built as **separate bundles** — never cross-import between them

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
