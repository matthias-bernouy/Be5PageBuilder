---
name: bloc-creator
description: >
  Scaffolds a complete BE5 PageBuilder bloc — a folder containing manifest.json,
  Bloc.ts, BlocEditor.ts, template.html, style.css and configuration.html.
  Trigger whenever the user asks to create a bloc, component, element, widget,
  card, button, section… inside a `@bernouy/pagebuilder` project, even without
  mentioning the word "skill" or "bloc".
---

# bloc-creator

Generates a BE5 PageBuilder bloc. A bloc is a **folder** with a `manifest.json`
at its root; the PageBuilder CLI (`p9r`) discovers it recursively and builds
its view and editor as **two isolated bundles**.

## Prerequisites — check before doing anything

These are hard requirements. If either is missing, **stop immediately**, tell
the user what is missing and how to fix it, and do not scaffold anything. A
bloc written without the means to verify it is worthless — the skill would
rather abort than produce unchecked work.

### 1. A browser MCP server must be available

Verification (cardinal rule 7) is done by actually driving a browser. That
requires an MCP server exposing browser-automation tools — typically one of:

- `playwright` (Microsoft) — tools like `mcp__playwright__browser_navigate`, `mcp__playwright__browser_click`…
- `chrome-devtools` — tools like `mcp__chrome-devtools__*`
- `puppeteer` — tools like `mcp__puppeteer__*`

**Before anything else**, inspect your available tool list. If you see **no**
tool matching `mcp__*` for a browser, abort:

> BLOCKED: this skill requires a browser MCP server to verify the bloc in a
> real browser. Install one (e.g. `claude mcp add playwright -- npx
> @playwright/mcp@latest`) and re-run `/bloc-creator`.

Do **not** proceed with "I'll scaffold and you can test it yourself". The
skill's contract is scaffold **and** verify.

### 2. `P9R_URL` and `P9R_TOKEN` must be set

The CLI (`bunx p9r list-blocs`, `bunx p9r dev`, `bunx p9r import`) needs both
variables to talk to the CMS. They are read from `.env` in the project root
or from the environment.

**Before anything else**, run `bunx p9r list-blocs`. If it errors with
"P9R_TOKEN and P9R_URL must be set", abort:

> BLOCKED: `P9R_URL` and `P9R_TOKEN` are not set. Add them to `.env` (or
> export them) and re-run `/bloc-creator`. Example:
> ```
> P9R_URL=http://localhost:4999/page-builder
> P9R_TOKEN=your-admin-bearer-token
> ```

Without them you cannot:
- list deployed blocs (→ you'd have to guess tags, which violates cardinal rule 8),
- run `p9r dev` to verify in a browser (→ you cannot satisfy cardinal rule 7),
- deploy with `p9r import`.

Both prerequisites are strict. Check them **in the same turn you start the
task**, before reading any other skill file.

## Cardinal rules — non-negotiable

1. **English only.** Code, comments, labels, placeholders, CSS class names,
   HTML attributes, titles — every piece of text in generated files is in
   English. No French, no mixed language.

2. **Isolated imports.**
   - `Bloc.ts` imports from `@bernouy/pagebuilder/component` — and nothing
     editor-related.
   - `BlocEditor.ts` imports from `@bernouy/pagebuilder/editor`.
   - Never cross the boundary. The two bundles are deliberately separated so
     visitors downloading the view bundle cannot transitively reach editor code.

3. **Source files only export a class.** Never write in `Bloc.ts` or
   `BlocEditor.ts`:
   - `customElements.define(...)`
   - `registerEditor(...)` / `registerEditor_opaque(...)`
   - Any `BE5_TAG_TO_BE_REPLACED` / `BE5_LABEL_TO_BE_REPLACED` /
     `BE5_GROUP_TO_BE_REPLACED` constant.

   The CLI wraps the user's entry file before build and injects the
   registration using the tag / label / group declared in `manifest.json`. If
   you write any of the above in the source, the build will conflict or the
   bloc will never register.

4. **`manifest.json` is the source of truth** for tag, group, title, entries,
   thumbnails. Not the source files.

5. **Never call `super.connectedCallback()`** in a bloc. And remember:
   `connectedCallback()` on a bloc **can be called multiple times** — the
   editor re-triggers it after inserting default slot content, so everything
   inside must be idempotent.

6. **Prefer declarative over imperative.** The sync systems
   (`<p9r-attr-sync>`, `<p9r-comp-sync>`, `<p9r-image-sync>`) exist so
   authors don't have to write JS for standard concerns. Add code in
   `BlocEditor.init()` / `restore()` only when no declarative path exists
   AND the behavior adds real value. When you do, `restore()` must fully
   undo whatever `init()` did — the editor ↔ client round-trip has to be
   idempotent. See `conventions/editor.md`.

7. **A bloc is not done until verified in a real browser.** Run the full
   checklist in `conventions/verification.md` before telling the user the
   bloc is ready. Report what you actually opened, clicked, and saw — do
   not say "it should work". If you cannot open a browser, say so
   explicitly and list the checks that remain unverified.

8. **Never invent a tag for another bloc.** Before referencing *any*
   external bloc tag — inside `template.html`, inside a `<p9r-comp-sync>`
   default, anywhere — run `bunx p9r list-blocs` to see what is actually
   registered on the CMS. Only use tags that appear in that output. If
   the tag you want is missing, either scaffold + deploy it first or
   fall back to a plain editable HTML element and tell the user. A
   freshly-deployed CMS has zero blocs; do not assume `w13c-*`,
   `acme-*`, or any other prefix exists. Reserved prefixes `w13c-*` and
   `p9r-*` are system-only and must **never** be used as the
   `default-tag` of a new bloc. See `conventions/composition.md`.

9. **Default slot content must be editable.** The element you put inside
   a `<p9r-comp-sync>` is what the user will see and interact with in
   the editor. Only use elements that have an editor mode: text-bearing
   tags (`<p>`, `<h1>`–`<h6>`, `<span>`…), images via `<p9r-image-sync>`,
   or another deployed bloc tag. **Never** default-slot a raw `<li>`,
   `<td>`, `<tr>`, `<option>` or any element that has no standalone
   editor mode — the user won't be able to modify, move, or delete it
   from the inline editor. If the bloc conceptually renders a list,
   expose editable `<p>` (or similar) items and let the user or the
   bloc's `template.html` wrap them in `<ul>` / `<li>` internally.

## File layout of a bloc

```
my-bloc/
├── manifest.json        ← tag, group, entries, meta
├── Bloc.ts              ← view class (extends Component)
├── BlocEditor.ts        ← editor class (extends Editor) — omit for an opaque bloc
├── template.html        ← shadow DOM template with <slot>s
├── style.css            ← fully self-contained styles
├── configuration.html   ← declarative editor panel
└── assets/              ← thumbnails, preview images (optional)
```

**Opaque bloc:** to create a bloc the user can move / delete / duplicate but
whose internals are not editable, omit the `editor` field from `manifest.json`
and skip `BlocEditor.ts` + `configuration.html`. The CLI synthesizes a default
opaque editor automatically.

## How to use this skill

Load the reference files you actually need for the file you're writing. Don't
load everything up front.

### Templates — minimal skeletons to start from

Copy-paste these and fill in the blanks.

- `templates/manifest.md` — minimal `manifest.json`
- `templates/component.md` — minimal `Bloc.ts`
- `templates/editor.md` — minimal `BlocEditor.ts`
- `templates/template.md` — minimal `template.html`
- `templates/style.md` — minimal `style.css`
- `templates/configuration.md` — minimal `configuration.html`

### Conventions — the rules for each file

Read the matching one before you write a non-trivial version of that file.

- `conventions/manifest.md` — every field of `manifest.json`, opaque blocs,
  meta fields, `default-tag` uniqueness
- `conventions/component.md` — `Component` class: constructor, idempotent
  `connectedCallback`, `attributeChangedCallback`, `static observedAttributes`,
  shadow DOM access
- `conventions/editor.md` — `Editor` class: constructor signature, editor-mode
  CSS, empty `init()` / `restore()`
- `conventions/style.md` — self-containment, CSS variables, `attr()` limits,
  enum presets via `:host([attr="value"])`, `::slotted()`, hiding empty slot
  wrappers, global design tokens
- `conventions/configuration.md` — the three sync systems (`<p9r-attr-sync>`,
  `<p9r-comp-sync>`, `<p9r-image-sync>`), all styled inputs (`<p9r-select>`,
  `<p9r-range>`, `<p9r-sizes-select>`, `<p9r-page-link>`), and `<p9r-section>`
- `conventions/composition.md` — using a bloc inside another bloc (no
  declaration needed)
- `conventions/verification.md` — smoke test setup + full browser-based
  verification checklist. **Required reading before declaring any bloc
  done.**
- `conventions/pitfalls.md` — common traps (invisible bloc, duplicated
  listeners, the `optionnal` typo, cross-bundle imports…). Scan this
  list when debugging a misbehaving bloc.

### Examples — full worked blocs

- `examples/card.md` — a card bloc showcasing `p9r-attr-sync`, `p9r-comp-sync`
  (fixed, optional, multiple), `p9r-image-sync` and `attr()` numeric attributes
- `examples/stack.md` — a layout bloc showcasing `p9r-sizes-select`, enum
  background presets, and the full self-contained CSS variable pattern

## Typical flow when the user asks for a new bloc

0. **Check prerequisites.** Inspect your tool list for a browser MCP
   server (`mcp__playwright__*` / `mcp__chrome-devtools__*` /
   `mcp__puppeteer__*`). If none is present, abort with the BLOCKED
   message from the *Prerequisites* section. Then run
   `bunx p9r list-blocs`: if it errors on missing `P9R_URL` /
   `P9R_TOKEN`, abort with the second BLOCKED message. Only continue
   past this step when both checks pass.
1. **Discover what's already deployed on the CMS.** The output of
   `bunx p9r list-blocs` from step 0 is the authoritative list of tags
   you may reference from inside the new bloc. Remember: a fresh CMS
   has **zero** blocs, so don't assume anything.
2. Ask the user (or infer) the bloc's **name**, **tag**, **group** and what
   slots / configuration it needs. The tag must **not** start with
   `w13c-` or `p9r-` (reserved), and must not collide with any tag you
   saw in step 1.
3. Create the folder.
4. Write `manifest.json` from `templates/manifest.md`, check
   `conventions/manifest.md` for field requirements.
5. Write `template.html` and `style.css` — these shape the bloc's visual
   structure and are the best starting point once you know the slots.
6. Write `configuration.html` — this is where `conventions/configuration.md`
   matters most, because the three sync systems are easy to mis-wire.
   When a `<p9r-comp-sync>` needs a default child, use an editable HTML
   element (`<p>`, `<h2>`, `<span>`, …) or a tag you confirmed in step 1.
   Never default-slot a raw `<li>`, `<td>`, `<tr>` or `<option>` — they
   have no editor mode and become un-editable dead weight.
7. Write `Bloc.ts` — often minimal (just the class + constructor). Add
   `attributeChangedCallback` only if attributes drive runtime behavior that
   CSS cannot express.
8. Write `BlocEditor.ts` — usually a near-empty class (constructor + empty
   `init` / `restore`). Pass editor-mode CSS as the second arg of `super(...)`
   only if the bloc needs visual tweaks during editing (disable hover, cancel
   transforms, etc.). Add logic in `init()` / `restore()` only if declarative
   sync systems cannot express it — and then make sure `restore()` fully
   undoes everything `init()` did.
9. **Verify in a real browser.** Follow the smoke test and run the full
   checklist in `conventions/verification.md`. Report to the user exactly
   what you opened, clicked, and observed. The bloc is not done before
   this step is complete.
