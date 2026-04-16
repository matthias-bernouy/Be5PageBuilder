# Template — `configuration.html`

The declarative editor panel. Combines three sync systems inside
`<p9r-section>` wrappers.

## Minimal shell

```html
<p9r-attr-sync>
    <p9r-section data-title="Style">
        <p9r-select name="variant" label="Variant">
            <option selected value="filled">Filled</option>
            <option value="outline">Outline</option>
        </p9r-select>
    </p9r-section>
</p9r-attr-sync>

<p9r-section data-title="Content">
    <p9r-comp-sync>
        <h3>Title</h3>
    </p9r-comp-sync>
</p9r-section>
```

## With the three sync systems

```html
<!-- 1. Attributes bound to the host element -->
<p9r-attr-sync>
    <p9r-section data-title="Style">
        <p9r-select name="variant" label="Variant">
            <option selected value="filled">Filled</option>
            <option value="outline">Outline</option>
        </p9r-select>
        <p9r-range name="radius" label="Corner radius" min="0" max="32" value="12" unit="px"></p9r-range>
    </p9r-section>
    <p9r-section data-title="Layout">
        <p9r-sizes-select name="size" label="Size"></p9r-sizes-select>
    </p9r-section>
    <p9r-section data-title="Link" data-collapsed>
        <p9r-link name="href" label="Target page"></p9r-link>
    </p9r-section>
</p9r-attr-sync>

<!-- 2. Image slots — ALWAYS outside p9r-attr-sync -->
<p9r-section data-title="Media">
    <p9r-image-sync slotTarget="cover" label="Cover" default="https://placehold.co/600x300"></p9r-image-sync>
</p9r-section>

<!-- 3. Slot content (host children) -->
<p9r-section data-title="Content">
    <p9r-comp-sync>
        <h3>Card title</h3>
    </p9r-comp-sync>
    <p9r-comp-sync optionnal>
        <p slot="description">A short description.</p>
    </p9r-comp-sync>
    <p9r-comp-sync allow-multiple optionnal>
        <p slot="items">Item</p>
    </p9r-comp-sync>
</p9r-section>
```

## Quick cheat sheet

| Element | Purpose |
|---|---|
| `<p9r-attr-sync>` | Wraps inputs with a `name=` attribute. Two-way binding with the host element attribute of the same name. |
| `<p9r-comp-sync>` | Declares a slot's default content + its editor permissions. |
| `<p9r-image-sync>` | Places outside `p9r-attr-sync`. Opens the MediaCenter and injects/updates an `<img>` in the target slot. |
| `<p9r-section data-title="..." [data-collapsed]>` | Visual section with a title. `data-collapsed` makes it start folded. |
| `<p9r-select>` / `<p9r-range>` / `<p9r-sizes-select>` / `<p9r-link>` | Styled inputs. |

See `conventions/configuration.md` for attributes, options, and the full
behavior of each `<p9r-comp-sync>` flag.
