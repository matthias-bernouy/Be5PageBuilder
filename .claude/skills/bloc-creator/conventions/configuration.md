# Conventions — `configuration.html`

The editor panel is declarative HTML. No `<script>`, no event handlers, no
logic. It is rendered inside a `<p9r-config-panel>` by the editor system,
which then wires each sync element to the bloc being edited.

## The three sync systems

### 1. `<p9r-attr-sync>` — attributes on the host element

Wraps inputs with a `name` attribute. On change, the value is written to
the host bloc element as `this.setAttribute(name, value)`. On load, the
current host attribute value is read back to initialize the input.

```html
<p9r-attr-sync>
    <p9r-section data-title="Style">
        <p9r-select name="variant" label="Variant">
            <option selected value="filled">Filled</option>
            <option value="outline">Outline</option>
        </p9r-select>
    </p9r-section>
</p9r-attr-sync>
```

- Any element with a `name` attribute and a `.value` property is eligible.
- The **initial input value** is written to the host attribute when the
  attribute is not yet set — this is how you declare defaults. Put
  `selected` on the preferred `<option>` in a `<p9r-select>`, or `value="..."`
  on a `<p9r-range>`.
- Nest one or more `<p9r-section>` blocks inside `<p9r-attr-sync>` to
  visually group inputs.

### 2. `<p9r-comp-sync>` — slot default content + editor permissions

Declares the default child content for a slot AND the editing permissions
on that content. The first child of `<p9r-comp-sync>` is the template; its
`slot="..."` attribute (or absence) determines the target slot.

```html
<!-- Default slot -->
<p9r-comp-sync>
    <h3>Card title</h3>
</p9r-comp-sync>

<!-- Named slot -->
<p9r-comp-sync>
    <p slot="body">Short description.</p>
</p9r-comp-sync>
```

#### Permission flags (attributes on `<p9r-comp-sync>`)

| Attribute | Effect |
|---|---|
| *(none)* | The slot element is swappable (user can change the component) but not deletable, not duplicable, not draggable, no add-before/after. |
| `optionnal` | The slot element becomes deletable. *(Yes, the attribute is spelled `optionnal` — keep it that way, it is the real attribute name.)* |
| `disable-others-components` | Opt-out: forbid swapping the slot element for a different component. Use when the slot must stay a specific tag (e.g. the default child is a text node the user only edits in place). |
| `allow-multiple` | List mode: enables add, delete, duplicate, drag, and component change. Use for collections (items, slides, cards…). |
| `inline-adding` | *(with `allow-multiple`)* Places the `+ before` / `+ after` buttons to the **left and right** of each item instead of above and below. Use it for horizontal lists (flex-row, grid-col, inline items). |

Component swapping is **on by default** — if you want to lock the slot to
its current tag, add `disable-others-components` explicitly.

> **`disable-others-components` is almost never the right choice.** Component
> swapping is one of the PageBuilder editor's most powerful features — it lets
> the user replace a child element with any other deployed bloc or HTML tag.
> Locking a slot down removes that flexibility for no benefit in the vast
> majority of cases.
>
> **Only** use `disable-others-components` when the parent bloc's code
> (JS or CSS) relies on a specific tag name so tightly that swapping would
> break it (e.g. the `connectedCallback` calls methods on the child, or the
> CSS uses `::slotted(specific-tag)` selectors that cannot be generalized).
> If you are merely providing a default and the user could reasonably want
> a different component there, leave swapping enabled.
>
> A `<span>` with `disable-others-components` inside a button slot is a
> **textbook anti-pattern**: the user can't change the button style, can't
> swap it for a deployed button bloc, and often can't even edit the text.
> Prefer a deployed button bloc as the default, or a plain `<p>` / `<span>`
> **without** `disable-others-components`.

Attributes combine. A typical editable list:

```html
<p9r-comp-sync allow-multiple optionnal inline-adding>
    <p slot="actions">Action label</p>
</p9r-comp-sync>
```

This says: the `actions` slot holds multiple items, each deletable,
with inline add buttons. Component swapping is implicit.

> **Default content must be editable.** The child element of a
> `<p9r-comp-sync>` is what the user will see and edit. Only use elements
> that have an editor mode in the PageBuilder runtime (text-bearing
> elements such as `<p>`, `<h1>`–`<h6>`, `<span>`, images via
> `<p9r-image-sync>`, or another deployed bloc tag). **Do not** use raw
> `<li>`, `<td>`, `<tr>`, `<option>` or other elements that have no
> standalone editor mode — the user will not be able to modify, move, or
> delete them from the inline editor. If you need a list, put an editable
> element (e.g. `<p>`) inside and let the user decide whether to wrap it
> in `<ul>` / `<li>` themselves.

> **Default content should be the most useful starting point.** When
> choosing the default child for a `<p9r-comp-sync>`, don't default to a
> bare `<p>` or `<span>` if a more appropriate deployed bloc exists. For
> example, a navbar's link list should default to the nav-dropdown bloc
> (if deployed), not a plain `<a>` the user will have to swap out anyway.
> Run `bunx p9r list-blocs` and pick the default that gives the user the
> closest starting point to what they'll actually need. If no suitable
> bloc is deployed, fall back to a plain editable HTML element — but make
> it the most semantically appropriate one (e.g. `<a href="#">` for a
> navigation link, not `<span>`).

> **Expose every attribute the element needs to function.** If a slotted
> or host element requires attributes for its basic behavior — `name` on
> form inputs, `href` on links, `action`/`method` on forms, `type` on
> inputs, `value`/`placeholder` on fields — those attributes **must** be
> configurable from the editor panel (via `<p9r-attr-sync>` or a custom
> `init()`/`restore()` flow). Think about what the user would naturally
> need to set for the element to work: if they can see it in the rendered
> output but can't change it from the config panel, that's a gap.
>
> This also applies to **inner content that defines behavior**: a
> `<select>` must let the user edit its `<option>` list, a `<ul>` must
> let the user add/remove `<li>` items, a `<table>` must let the user
> manage rows. If the editor's declarative sync systems can't express
> it, write the logic in `init()` / `restore()` — but never ship an
> element whose functional content is frozen.

#### How the default is applied

If the host bloc has no element in the target slot when the editor mounts,
`<p9r-comp-sync>` clones its child and appends it to the bloc. The bloc's
`connectedCallback` is then re-triggered — which is why bloc
`connectedCallback` must be idempotent (see `conventions/component.md`).

#### Rendered UI in the config panel

`<p9r-comp-sync>` renders a visible control inside the config panel:

- A header (the value of `label`, or the slot name, or "Default slot").
- A count badge in multiple mode: `N / max`.
- One focus button per slotted child — clicking it scrolls the element
  into view and focuses it (without opening its own config panel). The
  button shows a trimmed preview of the child's text content, or the
  tag name if the element has no text.
- In multiple mode, an "Add" button that clones the `<p9r-comp-sync>`'s
  first light-DOM child and appends it to the bloc. The button is
  disabled when the current count reaches `max`. `data-min` / `data-max`
  attributes constrain the bounds (`data-min` default 1, `data-max`
  default ∞).

Optional attributes for the UI:

| Attribute | Purpose |
|---|---|
| `label` | Header text shown above the focus buttons. Defaults to the slot name, then `"Default slot"`. |
| `data-min` | Minimum number of items in multiple mode. Default `1`. |
| `data-max` | Maximum number of items in multiple mode. Default unlimited. |

### 3. `<p9r-image-sync>` — MediaCenter-backed image slot

Placed **outside** of `<p9r-attr-sync>` and `<p9r-comp-sync>`, directly
inside a `<p9r-section>`. It opens the MediaCenter on click and writes the
selected image into the target slot as an `<img>`.

```html
<p9r-section data-title="Media">
    <p9r-image-sync
        slotTarget="cover"
        label="Cover image"
        default="https://placehold.co/800x450">
    </p9r-image-sync>
</p9r-section>
```

| Attribute | Purpose |
|---|---|
| `slotTarget` | Name of the slot receiving the `<img>`. |
| `label` | Text shown above the preview. |
| `default` | Fallback image URL used when the slot is empty. |
| `accept` | Media types accepted by MediaCenter (default `"image"`). |

## Visual structure — `<p9r-section>`

```html
<p9r-section data-title="Layout">
    <!-- inputs -->
</p9r-section>

<p9r-section data-title="Advanced" data-collapsed>
    <!-- inputs, starts folded -->
</p9r-section>
```

| Attribute | Effect |
|---|---|
| `data-title` | The section header text. Displayed uppercase by the section component. |
| `data-collapsed` | Presence only (no value). Makes the section start folded — useful for secondary or expert options. |

Click on the header toggles collapse state at runtime. Use sections generously:
four to six inputs per section is the right density.

## Styled inputs

Always prefer these over raw native elements. They carry the `.value`
property and the `change` event that `<p9r-attr-sync>` hooks into.

### `<p9r-select>` — dropdown

```html
<p9r-select name="variant" label="Variant">
    <option selected value="filled">Filled</option>
    <option value="outline">Outline</option>
    <option value="ghost">Ghost</option>
</p9r-select>
```

| Attribute | Purpose |
|---|---|
| `name` | Host attribute to bind to. |
| `label` | Text shown above the trigger. Falls back to `name` if absent. |

Uses native `<option>` children with `value` and optional `selected`.

### `<p9r-range>` — slider + number input

```html
<p9r-range name="radius" label="Corner radius" min="0" max="32" step="1" value="12" unit="px"></p9r-range>
```

| Attribute | Purpose |
|---|---|
| `name` | Host attribute to bind to. |
| `label` | Text shown above the slider. |
| `min` / `max` | Range bounds. |
| `step` | Increment. Defaults to `1`. |
| `value` | Initial value. Defaults to `min`. |
| `unit` | Unit label (e.g. `px`, `%`). Pure display — does not affect the value written to the host. |

### `<p9r-sizes-select>` — size preset shortcut

A shortcut that renders as a `<p9r-select>` with six fixed options:
`none / xs / sm / md / lg / xl`. Default selected is `md`.

```html
<p9r-sizes-select name="gap" label="Spacing"></p9r-sizes-select>
```

| Attribute | Purpose |
|---|---|
| `name` | Host attribute to bind to. Defaults to `"size"`. |
| `label` | Text shown above the dropdown. Defaults to `"Size"`. |

The host bloc's CSS must map the six values via `:host([attr="value"])`
presets — see `conventions/style.md`.

### `<p9r-page-link>` — internal page picker

Fetches available pages from the admin API and lets the user pick one.
The selected value is the page path, written to the host as an attribute.

```html
<p9r-page-link name="href" label="Target page"></p9r-page-link>
```

| Attribute | Purpose |
|---|---|
| `name` | Host attribute to bind to. |
| `label` | Text shown above the picker. |

## Layout rules of thumb

- Put `<p9r-attr-sync>` first, then `<p9r-image-sync>` sections, then
  `<p9r-comp-sync>` sections. This matches the reading order the user
  expects: style → media → content.
- Group logically inside sections: "Style", "Layout", "Content", "Media",
  "Link", "Advanced".
- Use `data-collapsed` for secondary options the user rarely touches.
- Do not put `<p9r-image-sync>` or `<p9r-comp-sync>` *inside*
  `<p9r-attr-sync>` — they are independent sync systems and must stay at
  the top level.
