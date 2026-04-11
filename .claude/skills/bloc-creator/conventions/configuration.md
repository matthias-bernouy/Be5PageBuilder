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
| *(none)* | Fixed: not deletable, not duplicable, not draggable, no add-before/after, no component change. The user can only edit the text inside. |
| `optionnal` | The slot element becomes deletable. *(Yes, the attribute is spelled `optionnal` — keep it that way, it is the real attribute name.)* |
| `allow-others-components` | The user can swap the slot element for a different component via the action bar. |
| `allow-multiple` | List mode: enables add, delete, duplicate, drag, and component change. Use for collections (items, slides, cards…). |
| `inline-adding` | *(with `allow-multiple`)* Shows `+` buttons inline between items instead of only in the action bar. |

Attributes combine. A typical editable list:

```html
<p9r-comp-sync allow-multiple optionnal allow-others-components inline-adding>
    <w13c-button slot="actions">Action</w13c-button>
</p9r-comp-sync>
```

This says: the `actions` slot holds multiple items, each deletable,
user can swap components, with inline add buttons.

#### How the default is applied

If the host bloc has no element in the target slot when the editor mounts,
`<p9r-comp-sync>` clones its child and appends it to the bloc. The bloc's
`connectedCallback` is then re-triggered — which is why bloc
`connectedCallback` must be idempotent (see `conventions/component.md`).

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
