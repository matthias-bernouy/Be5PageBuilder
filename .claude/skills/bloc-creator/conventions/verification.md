# Conventions — verification in a real browser

A bloc is not done when it compiles. It is done when it has been exercised
in a real browser, in both client and editor modes, and every item below
passes. Type checks and successful builds only prove that the code parses —
they prove nothing about whether the bloc actually works.

**Before telling the user the bloc is ready**, run this verification pass
and report the result explicitly. Never say "it should work" — run it, see
it, report it.

## Hard prerequisites for this step

Verification is impossible without the right tools. If any of the following
is missing, **abort verification and report it as a blocker** — do not
substitute type-checks, do not hand-wave, do not say "you can test it".

### 1. A browser MCP server must be available

List your available tools. Look for entries matching:

- `mcp__playwright__*`
- `mcp__chrome-devtools__*`
- `mcp__puppeteer__*`

If **none** of those are present, stop immediately with:

> BLOCKED: no browser MCP server is installed, so I cannot verify the
> bloc in a real browser. Install one (e.g. `claude mcp add playwright
> -- npx @playwright/mcp@latest`) and re-run the verification. The
> bloc is **not** ready.

Never skip this check. Never fake a "verified in Chromium" report when
you had no browser tool.

### 2. `P9R_URL` and `P9R_TOKEN` must be set

`p9r dev` reads them from `.env` or the environment. Without them the
dev server exits at startup with
`P9R_TOKEN and P9R_URL must be set`. If so, stop with:

> BLOCKED: `P9R_URL` / `P9R_TOKEN` missing — `p9r dev` cannot start,
> so verification is impossible. Add them to `.env` and re-run.

## Smoke test setup

Reproducible procedure to get a fresh bloc in front of your eyes in under
60 seconds.

1. From the folder containing the bloc (or its parent), launch the dev
   server:
   ```
   p9r dev
   ```
   Confirm that `P9R_URL` and `P9R_TOKEN` are set (in `.env` or the
   environment) before running. The CLI rebuilds the bloc on save and
   pushes a reload over SSE.

2. Open the editor URL printed by the CLI (typically
   `http://localhost:PORT/page-builder/admin/editor?page=...`).

3. Create a brand-new empty page, or open a dev scratch page. Everything
   except `POST /api/page` is proxied to the remote CMS; `POST /api/page`
   is persisted locally to `.p9r-dev/scratch.json`.

4. Open the bloc library sidebar, find the bloc under its `default-group`,
   and drag it onto the page.

5. Open DevTools. Keep the **Console tab** visible across every step
   below — any error or warning is a failure.

From here, the bloc is instantiated on a clean page. Run the checklist.

## Checklist

### A. Fresh instance render

- [ ] **A1. Dropped from library.** The bloc appears on the page with
  sensible defaults. Nothing is invisible, empty, or broken.
- [ ] **A2. No attributes at all.** Inspect the DOM, remove every HTML
  attribute you can from the host element, reload. The bloc still
  renders readably — this is the fallback path, and it proves the
  `var(--x, hardcoded)` chain is complete.
- [ ] **A3. Default slot content.** Every `<p9r-comp-sync>` in
  `configuration.html` has populated its slot. No empty section. No
  missing heading.

### B. Visual sweep — all presets

- [ ] **B1. Every `<p9r-select>` option.** Cycle through every option of
  every select. The bloc updates visually for each value. Any option
  with no visible effect is either a bug in CSS or a useless preset.
- [ ] **B2. Every `<p9r-range>` extreme.** Slide each range to its min
  and max. The bloc clamps gracefully. No layout collapse at the
  boundary.
- [ ] **B3. Every `<p9r-sizes-select>` step.** Each of the six values
  (`none / xs / sm / md / lg / xl`) maps to a visible CSS effect.
  If any value is identical to another, one of them is dead code.

### C. Content edge cases

- [ ] **C1. Very long text.** Paste ~300 characters into each editable
  slot. No horizontal overflow, no text clipping without ellipsis, no
  wrapper explosion.
- [ ] **C2. Very short text.** One or two characters in each slot.
  Layout stays balanced.
- [ ] **C3. Empty optional slots.** Delete the content of each
  `optionnal` slot. Its wrapper disappears (via
  `:not(:has(::slotted(*)))` or equivalent) — no blank padding, no
  orphan separators.

### D. Responsiveness

- [ ] **D1. 360 px viewport.** Use DevTools responsive mode. The bloc
  fits without horizontal scroll, text wraps correctly.
- [ ] **D2. 768 px viewport.** Tablet layout still coherent.
- [ ] **D3. 1280 px viewport.** Desktop layout as intended.
- [ ] **D4. Browser zoom at 200 %.** Still readable, nothing truncated.
  This is the test that catches pixel-fixed layouts.

### E. Editor integration — configuration panel

- [ ] **E1. Panel opens.** Click the bloc in edit mode, the panel
  appears.
- [ ] **E2. No layout weirdness.** Labels not truncated, inputs not
  overflowing, sections not overlapping, spacing homogeneous across
  sections.
- [ ] **E3. `data-collapsed` sections.** Start folded, expand on click
  on the header.
- [ ] **E4. All `<p9r-attr-sync>` inputs write.** For each input:
  change the value, then inspect the host element in DevTools. The
  matching HTML attribute is present with the new value.
- [ ] **E5. Defaults are applied.** Drop a brand-new instance: the
  `selected` option / `value=` on each input is reflected as an
  attribute on the host (the editor writes defaults on first render).
- [ ] **E6. `<p9r-image-sync>` end to end.** Click the preview, the
  MediaCenter opens. Pick an image — it appears in the slot. Click
  *Change* — new image replaces the old. Click *Remove* — slot
  becomes empty (and its wrapper collapses if configured).
- [ ] **E7. `<p9r-page-link>` works.** The dropdown fetches and
  displays pages. Selecting one writes the path to the target
  attribute.

### F. Editor integration — slot editing

- [ ] **F1. Every `<p9r-comp-sync>` slot is reachable.** Click it, the
  action bar appears on hover. Text is editable.
- [ ] **F2. Permission flags are enforced.** A slot without flags has
  no delete / duplicate / drag handle. A slot with `optionnal` shows
  delete. A slot with `allow-multiple` shows add / duplicate / drag.
  A slot with `allow-others-components` shows the component-switch
  action. A slot with `inline-adding` has `+` buttons inline.
- [ ] **F3. `allow-multiple` behaviors.** Add an item, duplicate it,
  drag to reorder, delete. Each operation leaves the bloc in a clean
  state.
- [ ] **F4. Composition.** If the bloc references other bloc tags
  (e.g. `<acme-button slot="actions">`), those children render
  correctly AND can themselves be edited (action bar, configuration
  panel) when clicked.

### G. Lifecycle — the idempotency tests

These are the ones that catch 90 % of subtle bloc bugs.

- [ ] **G1. Client ↔ editor round-trip.** Toggle between editor mode
  and client mode five times. The bloc renders identically every
  time. No duplicated DOM, no duplicated event listeners, no residual
  editor attributes in client mode (inspect the host element in
  client mode — no `p9r-*` attributes should remain).
- [ ] **G2. Duplicate the bloc.** Duplicate via the action bar. The
  two instances are independent — changing an attribute or slot
  content on one does not leak to the other.
- [ ] **G3. Move the bloc.** Drag it into another container. It still
  renders and edits correctly after the move. `connectedCallback` is
  re-invoked and must be idempotent.
- [ ] **G4. Save + reload.** Save the page, hard-reload the browser.
  The bloc re-hydrates with every attribute, every image, every slot
  content intact.

### H. Console hygiene

- [ ] **H1. Zero errors, zero warnings in client mode.**
- [ ] **H2. Zero errors, zero warnings in editor mode.**
- [ ] **H3. Zero errors on mode switch.** Toggle modes with the
  console visible — nothing thrown, nothing logged.

### I. Accessibility quick pass

Not exhaustive, but catches the obvious misses.

- [ ] **I1. Semantic HTML.** Headings use `<h2>`/`<h3>`/`<h4>` with a
  plausible hierarchy, not `<div class="title">`. Landmarks where
  appropriate (`<article>`, `<section>`, `<nav>`).
- [ ] **I2. Images have alt.** Every `<img>` in the shadow DOM has an
  `alt` attribute (even if empty for decorative images). Slotted
  images inherit from user input.
- [ ] **I3. Keyboard navigation.** Tab through the bloc in client
  mode. Every interactive element is reachable, focus state visible.
- [ ] **I4. Color contrast.** Text on background passes a rough eye
  test. Anything grayish on white is suspect.

### J. CSS system health

- [ ] **J1. All local vars declared on `:host`** with a `var(--global,
  hardcoded)` fallback chain.
- [ ] **J2. `:host` has an explicit `display:` value.** Missing
  `display` makes the whole bloc invisible; this is the single most
  common "why is my bloc gone" bug.
- [ ] **J3. No magic values in rules.** Rules consume local vars only;
  numbers and colors live in the `:host` declaration block.
- [ ] **J4. Global tokens are used as fallbacks, not overridden.** Do
  not redefine `--primary-base` inside the bloc — consume it.

## Reporting to the user

When the checklist is complete, report the result in plain words. Be
specific about what you actually opened, clicked, and saw. Example:

> Verified in Chromium against a fresh page at 360 / 768 / 1280 px. All
> presets sweep cleanly. Editor panel renders correctly (no truncation).
> `<p9r-image-sync>` on the `cover` slot works end-to-end via
> MediaCenter. Lifecycle toggled 5× with a clean console in both modes.
> Save + reload restored all attributes and slot content. One warning
> in the a11y pass: the icon image has no `alt` — fixed.

If you **cannot** open a browser (CI, no display, server-only
environment), say so explicitly to the user and list the checks that
remain unverified. Do not pretend type-checking is verification.
