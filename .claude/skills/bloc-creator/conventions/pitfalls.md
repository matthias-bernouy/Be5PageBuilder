# Conventions — common pitfalls

A cheat sheet of traps that humans AND models fall into when writing blocs.
If a bloc is misbehaving, scan this list first — the bug is probably here.

## Two custom elements in one folder

**Symptom.** A child element (e.g. `be5-nav-dropdown`) renders correctly
in development when loaded alongside its parent, but fails to register
when loaded independently, or doesn't appear in the bloc library.

**Cause.** The child element was defined in a helper file inside the
parent's folder (e.g. `NavDropdown.ts` next to `Bloc.ts`) with a manual
`customElements.define()`. The CLI only builds what `manifest.json`
points to — the helper gets bundled into the parent's view JS but never
gets its own `<script src="/bloc?tag=...">` tag, its own editor
registration, or its own entry in the bloc library.

**Fix.** Move the child to its own folder with its own `manifest.json`,
`Bloc.ts`, `BlocEditor.ts`, etc. One folder = one custom element,
always. The parent can then reference the child's tag in its
`configuration.html` like any other deployed bloc.

## The invisible bloc

**Symptom.** The bloc is present in the DOM but nothing is visible.

**Cause.** `:host` has no `display:` value. The `Component` base class
does not set a default display, and custom elements default to `display:
inline` in a lot of contexts, so a block-level layout inside the shadow
DOM renders to nothing visible.

**Fix.**
```css
:host { display: block; }
```
Or `flex`, `grid`, `inline-block` depending on intent. Always explicit.

## The duplicated listener

**Symptom.** A click triggers the handler twice (then four times, then…).

**Cause.** `connectedCallback` is called again by `<p9r-comp-sync>` after
default slot content has been injected. If `connectedCallback` does
`this.addEventListener(...)` without guarding, each re-invocation adds a
new listener.

**Fix.** Make `connectedCallback` idempotent. Either:
- Attach listeners once in the constructor.
- Use a flag: `if (this._wired) return; this._wired = true;`.
- Attach on the shadow element you can query each time (`shadowRoot`
  contents are stable across re-invocations, so re-attaching on a
  freshly-queried element is fine — but beware of attaching the same
  handler reference twice to the same node; the browser dedupes only
  identical `(type, listener, options)` triples).

See `conventions/component.md` for the full idempotency rule.

## The `attr()` that renders nothing

**Symptom.** A CSS rule using `attr()` produces no visible effect even
though the attribute is present on the host.

**Cause.** `attr()` in standard CSS resolves **only** to plain numbers
with an explicit unit and fallback, like `attr(radius px, 12px)`. It
**cannot** resolve to a `var()`, a color string, or an enum label.

**Fix.** For anything other than a plain number, use attribute selectors:
```css
:host([color="primary"]) { --bloc-bg: var(--primary-muted, #eef2ff); }
```
See `conventions/style.md` for the full pattern.

## The forgotten `customElements.define`

**Symptom.** The bloc builds, but at runtime the page shows the custom
element tag as unstyled inline text. Nothing registers.

**Cause.** Someone "fixed" a missing registration by writing
`customElements.define("my-bloc", Bloc)` at the end of `Bloc.ts`.

**Fix.** **Remove it.** The CLI wrapper injects the `define` call based
on `manifest.json`'s `default-tag`. Writing it in source either conflicts
with the wrapper (double-define error) or ties your code to a literal tag
that will disagree with the manifest.

Same rule for `registerEditor({ cl: BlocEditor })` in `BlocEditor.ts`.

## The stray `BE5_*_TO_BE_REPLACED`

**Symptom.** The bloc registers under a tag that looks like
`BE5_TAG_TO_BE_REPLACED`, or the build fails.

**Cause.** These identifiers are build-system placeholders, injected by
the CLI wrapper into its own synthetic entry file. They must **never**
appear in the bloc's own source.

**Fix.** Delete any occurrence of `BE5_TAG_TO_BE_REPLACED`,
`BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED` from `Bloc.ts`,
`BlocEditor.ts`, or anywhere else in the bloc.

## The `<p9r-image-sync>` inside `<p9r-attr-sync>`

**Symptom.** The image picker appears but selecting an image does nothing
(or throws). Attribute binding misfires.

**Cause.** `<p9r-image-sync>` is a sync system of its own. It is not an
input with a `name`, and must live **outside** `<p9r-attr-sync>`. Same
for `<p9r-comp-sync>`.

**Fix.** Move `<p9r-image-sync>` out, directly inside a `<p9r-section>`
at the top level of `configuration.html`.

## The `optionnal` typo

**Symptom.** A slot marked `optional` (one `n`) refuses to be deletable.

**Cause.** The real attribute name is spelled `optionnal` (two `n`s,
French-influenced). `<p9r-comp-sync>` checks for `hasAttribute("optionnal")`
literally.

**Fix.** Keep the typo. Do not "correct" it. This is the single most
common mistake when transcribing examples.

## The `::slotted()` that doesn't match a nested child

**Symptom.** A style on `::slotted(.child .grandchild)` has no effect.

**Cause.** `::slotted()` matches **only direct children** of the slot —
it does not pierce into descendants. `::slotted(.grandchild)` where
`.grandchild` is nested inside a slotted `.child` element will never
match.

**Fix.** Restructure your slot contract so the element you want to style
is a direct child of the slot, or accept that descendant styling must
happen in the host page's regular CSS (outside shadow DOM), not in the
bloc's `style.css`.

## The empty shell that doesn't render

**Symptom.** A minimal `Bloc.ts` that extends `Component` with an empty
constructor produces an empty shadow DOM.

**Cause.** `Component`'s constructor reads `{ css, template }` from the
argument. Without that argument, the shadow root is attached but nothing
is injected into it.

**Fix.**
```ts
constructor() {
    super({ css, template: template as unknown as string });
}
```
Always pass both. If you truly have no template, pass an empty string.

## The cross-bundle import

**Symptom.** TypeScript compiles, `p9r dev` builds, but the view bundle
is suspiciously large, or editor code shows up in production.

**Cause.** Someone imported `Editor`, `registerEditor`, `ObserverManager`
or similar from inside `Bloc.ts`, or imported `Component` from inside
`BlocEditor.ts`.

**Fix.** Strict separation:
- `Bloc.ts` imports **only** from `@bernouy/pagebuilder/component`.
- `BlocEditor.ts` imports **only** from `@bernouy/pagebuilder/editor`.
- No `src/core/*` paths, ever.

The two bundles are deliberately isolated so visitors never download
editor code. Crossing the line silently re-enables the visitor-side
editor bundle.

## The `super.connectedCallback()` call

**Symptom.** None, actually — it just looks weird.

**Cause.** `Component.connectedCallback()` is empty. Calling
`super.connectedCallback()` does nothing visible but signals the wrong
mental model.

**Fix.** Just don't. Write `override connectedCallback() { … }` and put
your logic directly there.

## The `init()` / `restore()` left out on `BlocEditor`

**Symptom.** Build error: "abstract method not implemented".

**Cause.** `Editor` is an abstract class with abstract `init()` and
`restore()`. Even if you have nothing to put in them, they must be
defined.

**Fix.**
```ts
init() {}
restore() {}
```

## The frozen default attribute

**Symptom.** A `<p9r-select>` default is present on first drop but the
attribute doesn't update when the user picks a different option.

**Cause.** The select is missing a `name` attribute, or is outside
`<p9r-attr-sync>`. The initial value gets rendered (because `<option
selected>` is native), but without the binding wrapper no writeback
happens on change.

**Fix.** Every configurable input must have a `name`, and every
bindable input must be inside `<p9r-attr-sync>`.

## The bloc that wasn't deployed but is referenced as a child tag

**Symptom.** A parent bloc renders empty slots where child blocs should
be.

**Cause.** The parent references another bloc's tag (e.g.
`<my-card-item>`) that isn't deployed on the target CMS instance. Custom
elements that are not registered render as inline empty elements. This
is also the #1 source of "Claude made up a tag" bugs — the model
assumes a `w13c-button` or `acme-card` exists without checking.

**Fix.** Run `bunx p9r list-blocs` before writing any bloc that
references another tag, and *only* use tags from that output. Reserved
prefixes `w13c-*` and `p9r-*` are system-only and will never appear in
that list as deployable children. If the tag you need is missing,
deploy it first (`p9r import`) or use a plain editable HTML element
(`<p>`, `<h2>`, …) as the default content until the child bloc is
available.

## The `disable-others-components` trap

**Symptom.** The user drops a bloc containing a button (or any slotted
element) but cannot swap it for a different button style, nor even edit
the text inside it.

**Cause.** The `<p9r-comp-sync>` was written with
`disable-others-components` on a bare `<span>` or similar element. This
locks the slot to a single tag and removes the component-swap feature
entirely.

**Fix.** Remove `disable-others-components`. It should almost never be
used — only when the parent's JS or CSS structurally depends on a
specific child tag. In every other case, leave component swapping
enabled so the user can pick the deployed bloc that fits best.

## The lazy default that the user always has to swap

**Symptom.** Every new instance of a bloc starts with a bare `<p>` or
`<span>` that the user immediately swaps for a deployed bloc every
single time.

**Cause.** The `<p9r-comp-sync>` default child is a generic placeholder
instead of the most logical deployed bloc for that slot.

**Fix.** Before choosing a default, run `bunx p9r list-blocs`. If a
deployed bloc fits the slot's purpose (e.g. a nav-dropdown inside a
navbar, a button bloc inside a CTA area), use it as the default. Only
fall back to plain HTML when no suitable bloc is deployed.

## The frozen functional attribute

**Symptom.** A form input renders but its `name` attribute is hardcoded,
or a link's `href` cannot be changed from the config panel.

**Cause.** The bloc author forgot to expose functional attributes in
`<p9r-attr-sync>`. The element looks right but is useless because the
user cannot configure its behavior.

**Fix.** Every attribute an element needs to function (`name`, `href`,
`action`, `method`, `type`, `placeholder`, `value`…) must be exposed
in the editor panel. Think: "what would the user need to set for this
element to actually work?" If they can't set it, it's a bug.

## The select with frozen options

**Symptom.** A `<select>` element renders inside the bloc but the user
cannot add, remove, or change its `<option>` children.

**Cause.** The `<option>` list is baked into `template.html` with no
way to edit it from the configuration panel. Options are functional
content — they define the element's behavior.

**Fix.** Expose option management through `init()` / `restore()` in
`BlocEditor.ts`, or restructure the bloc so options come from editable
slot content. Never ship a select whose choices are frozen at build
time.

## The overflowing positioned panel

**Symptom.** A dropdown or mega-menu panel is partly (or fully) off the
right edge of the viewport when the trigger button sits near the right
side of its container. On narrow screens the whole panel pokes past the
window and creates a horizontal scrollbar on the document.

**Cause.** The panel is `position: absolute` with `left: 0` (or no
horizontal anchor at all) and an unconditional `min-width: 200px` (or
similar). When the trigger is near the right edge, `left: 0` relative to
the trigger lands outside the viewport; when the viewport is narrower
than `min-width`, the panel's intrinsic width itself causes overflow.

**Fix.** Two constraints are required, both mandatory:

```css
.panel {
    position: absolute;
    top: calc(100% + 6px);

    /* 1. width is bounded by the viewport */
    max-width: min(100vw - 16px, 720px);
    width: max-content;

    /* 2. horizontal position is clamped to stay on-screen */
    left: clamp(8px, 0px, calc(100vw - 100% - 8px));
}
```

Or, if the panel should center under the trigger:

```css
.panel {
    left: 50%;
    transform: translateX(-50%);
    max-width: min(100vw - 16px, 720px);
}
```

Verify by opening the panel on a 360 px viewport with the trigger near
the right edge. `panel.getBoundingClientRect().right` must be `<=
window.innerWidth`. See `conventions/responsive.md` rule R4.

## The flex row that refuses to shrink

**Symptom.** A navbar or toolbar overflows horizontally as soon as a
child contains a long word, a long URL, or a longer-than-expected label.
The row looks fine in the agent's test seed with short labels, then
breaks the moment a real user types something realistic.

**Cause.** Flex children default to `min-width: auto`, which is the
intrinsic content width. A long unbreakable token pins the child wider
than the container, and the whole row overflows. A container with a bare
`display: flex` row and no wrap / stack / scroll plan has no escape
hatch.

**Fix.** Two things:

1. Every flex child that holds text or user-provided content gets
   `min-width: 0`:
   ```css
   .item { min-width: 0; flex: 1 1 auto; }
   ```

2. The row itself picks a strategy — wrap, stack at 720 px, or
   `overflow-x: auto`. See `conventions/responsive.md` rules R2 and R3.

## The bloc that has no mobile behavior

**Symptom.** A navbar / toolbar / hero looks good at 1280 px, acceptable
at 768 px, and spectacularly broken at 360 px (items overlap, the right
side is cut off, the document scrolls horizontally).

**Cause.** The bloc was styled for desktop only. No `@media (max-width:
720px)` rule, no `flex-wrap`, no burger. The agent tested at 1280 px
(which passes) and stopped.

**Fix.** A horizontal composition of 3+ children is a structural
responsive problem. Pick one of:

- Wrap: `flex-wrap: wrap; gap: 0.5rem;` — fine for chips, badges,
  small CTAs.
- Stack: `@media (max-width: 720px) { .navbar { flex-direction:
  column; align-items: stretch; } }` — default for navbars and
  toolbars.
- Disclosure: a burger button that toggles a state consumed via
  `p9r-state-sync`, with the items collapsing into a vertical panel
  below the trigger.

"Desktop only" is not an acceptable default in the PageBuilder. See
`conventions/responsive.md` rule R7.

## The uneditable `<li>` in a slot

**Symptom.** The user can see the text of a list item in the bloc but
cannot click to edit, delete, or drag it in the inline editor.

**Cause.** A raw `<li>` was used as the default child of
`<p9r-comp-sync>`, either directly or as a slot target. `<li>` has no
registered editor mode, so the editor's observer skips it — the only
thing the user can interact with is the surrounding `<ul>`, if that
has an editor mode itself.

**Fix.** Default-slot an element that *does* have an editor mode
(`<p>`, `<h1>`–`<h6>`, `<span>`, an `<img>` through `<p9r-image-sync>`,
or another deployed bloc). If you genuinely need list semantics, wrap
the editable elements in `<ul>`/`<li>` **inside the bloc's own
`template.html`**, not in the slot default. Same rule for `<td>`,
`<tr>`, `<option>` — none of these are independently editable.

## The sibling toggle that won't close

**Symptom.** Two instances of the same toggleable bloc (two dropdowns,
two nav-megas, two accordions…) sit side by side. Opening one works.
Clicking outside closes it. But clicking the **label of a sibling**
opens the sibling *without closing the first one* — the page ends up
with both panels open at once.

**Cause.** The label's click handler calls `e.stopPropagation()`. Each
instance relies on a `document.addEventListener("click", …)` to close
itself when a click lands outside its host. `stopPropagation` kills the
bubbling before the event reaches `document`, so the sibling instances
never get the signal to close. It's a "defensive" line that silently
breaks the outside-click contract between siblings.

**Fix.** **Do not call `stopPropagation()` on a toggle label click.**
Let the event bubble to `document`. Each instance's document handler
checks `if (!this.contains(e.target)) this._close();` — since `target`
is retargeted to the clicked sibling's host, that check is true for
every *other* instance and they close correctly. The instance that
owns the click keeps its panel open because `this.contains(this)` is
true.

**Rule of thumb.** Use `stopPropagation()` only when you genuinely need
to block an outer handler (e.g. a parent that would swallow the event).
For toggle widgets that coexist with siblings, it is almost always
wrong — the outside-click pattern *depends* on propagation reaching
`document`.
