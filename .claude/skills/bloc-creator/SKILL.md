---
name: bloc-creator
description: >
  Generates a complete BE5 web component with its associated editor, as 5 files
  (component.ts, editor.ts, style.css, template.html, configuration.html).
  Use this skill whenever the user asks to create a component, bloc, element,
  or widget in the BE5 architecture — even if they don't explicitly mention
  the files or the word "skill".
---

# Create a BE5 Web Component with Editor

Generates a `[NAME]` component composed of **5 files** following exactly
the conventions below.

**IMPORTANT: All code, comments, labels, placeholders, CSS classes, and HTML
content MUST be written in English.**

## File structure

```
[ComponentName]/
├── [ComponentName].ts        ← component (class + customElements.define)
├── [ComponentName]Editor.ts  ← editor
├── style.css
├── template.html
└── configuration.html        ← declarative config panel
```

> **Naming**: the component and editor files use the PascalCase class name
> (e.g. `Card.ts`, `CardEditor.ts`).

---

## System placeholders — DO NOT MODIFY

The following identifiers are **build-system constants**.
They must appear **as-is, verbatim** in generated code.
Never replace, rename, or ask the user for their value.

| Constant | Role | Where it appears |
|---|---|---|
| `BE5_TAG_TO_BE_REPLACED` | Custom element HTML tag | `[NAME].ts` → `customElements.define` |
| `BE5_LABEL_TO_BE_REPLACED` | Label shown in the library | `registerEditor` (via build) |
| `BE5_GROUP_TO_BE_REPLACED` | Group in the library | `registerEditor` (via build) |

---

## [NAME].ts — The component

**Exact import:**
```ts
import { Component } from 'src/core/Component/core/Component';
```

**Rules:**

- Extends `Component`
- Imports `template.html` and `style.css` with `{ type: 'text' }`
- In `super()`, always cast the template:
  ```ts
  super({ css, template: template as unknown as string });
  ```
- Registers the element:
  ```ts
  customElements.define("BE5_TAG_TO_BE_REPLACED", [NAME]);
  ```
- **`connectedCallback()`**: only contains `this.render()` if needed.
  **Never call `super.connectedCallback()`.**
- Business logic (getters, event listeners, methods) directly in the class.

### Full example (Button)

```ts
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';

export class Button extends Component {
    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback(): void {
        this.addEventListener("click", this.onClick);
    }

    onClick = () => {
        const href = this.href;
        if (href) window.open(href, this.target);
    }

    get href(): string | null {
        return this.getAttribute("href");
    }

    get target(): string {
        return this.getAttribute("target") || "_self";
    }
}

customElements.define("BE5_TAG_TO_BE_REPLACED", Button);
```

---

## [NAME]Editor.ts — The editor

**Exact imports:**
```ts
import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };
```

**Rules:**

1. **Class**: `[NAME]Editor extends Editor`

2. **Constructor**:
   ```ts
   constructor(target: HTMLElement) {
       super(target, "", configuration as unknown as string);
       // 2nd arg = editor CSS (empty string if none)
       // 3rd arg = configuration HTML
   }
   ```
   If the component needs editor-specific styles (disable hover effects,
   cancel visual effects in edit mode…), pass CSS as the 2nd argument:
   ```ts
   const editorStyle = `.card:hover { transform: unset; box-shadow: unset; }`;
   super(target, editorStyle, configuration as unknown as string);
   ```

3. **`init()`** and **`restore()`**: leave empty unless specific need.

4. **Registration** via `registerEditor`:
   ```ts
   registerEditor({ cl: [NAME]Editor });
   ```

### Full example (Card)

```ts
import { Editor } from "src/core/Editor/core/Editor";
import { registerEditor } from "src/core/Editor/core/registerEditor";
import configuration from "./configuration.html" with { type: 'text' };

const editorStyle = `
    .card:hover {
        transform: unset;
        box-shadow: unset;
    }
`;

export class CardEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, editorStyle, configuration as unknown as string);
    }

    init() {}
    restore() {}
}

registerEditor({ cl: CardEditor });
```

---

## style.css

### Full self-containment rule

The `style.css` file is **entirely self-sufficient**. All CSS variables
needed by the component are declared in this file.
Never delegate variables to an external file or theme to import.

### Declaration convention

- In `:host`: declare **all** local variables `--[component]-*`
  with default values from the design system global variables
  and a hardcoded fallback.
- **No magic values** in CSS rules — everything goes through a local variable.
- If the component has visual states (hover, active, disabled…), include
  the corresponding variables directly in `:host`.

**For numeric attributes** configurable via `<p9r-attr-sync>`, use CSS `attr()`:
```css
--card-radius: attr(radius px, 16px);
--card-padding: attr(padding px, 20px);
```

**For enum-like attributes** (e.g. background presets, size presets), use
attribute selector presets — CSS `attr()` cannot resolve CSS variable references:
```css
:host([bg="surface"]) .inner { background: var(--bg-surface, #ffffff); }
:host([gap="sm"]) { --stack-gap: 16px; }
:host([gap="md"]) { --stack-gap: 24px; }
```

**Available global variables:**

| Family | Variants |
|---|---|
| `--primary` | `-base`, `-muted`, `-contrasted` |
| `--secondary` | `-base`, `-muted`, `-contrasted` |
| `--success` | `-base`, `-muted`, `-contrasted` |
| `--danger` | `-base`, `-muted`, `-contrasted` |
| `--warning` | `-base`, `-muted`, `-contrasted` |
| `--info` | `-base`, `-muted`, `-contrasted` |
| `--bg` | `-base`, `-surface`, `-overlay` |
| `--text` | `-main`, `-body`, `-muted` |
| `--border` | `-default` |

### Styling slotted elements

To style slotted elements, use `::slotted()`:
```css
::slotted([slot="image"]) {
    width: 100%;
    height: auto;
    object-fit: cover;
}
```

To hide empty slot wrappers:
```css
.card-subtitle:not(:has(::slotted(*))) {
    display: none;
}
```

---

## template.html

- Semantic HTML structure of the component.
- Use `<slot name="...">` for each editable content zone.
- Slots can have default (fallback) content:
  ```html
  <slot name="title">Default title</slot>
  ```
- The default slot (unnamed) receives multiple/repeatable children.

### Example (Card)

```html
<article class="card">
    <div class="card-media">
        <slot name="image"></slot>
    </div>
    <div class="card-content">
        <header>
            <h3 class="card-title">
                <slot name="title">Title</slot>
            </h3>
        </header>
        <div class="card-description">
            <slot name="description"></slot>
        </div>
        <footer class="card-footer">
            <slot name="footer">Footer</slot>
        </footer>
    </div>
</article>
```

---

## configuration.html — The declarative configuration panel

This file defines **declaratively** how the component is configurable
in the editor. It uses three synchronization systems:

### 1. `<p9r-attr-sync>` — Attribute synchronization

Syncs panel inputs with HTML attributes on the component.
Each input must have a `name` matching the target attribute.

```html
<p9r-attr-sync>
    <p9r-section data-title="Settings">
        <p9r-select name="variant" label="Variant">
            <option selected value="filled">Filled</option>
            <option value="outline">Outline</option>
        </p9r-select>
        <p9r-range name="spacing" label="Spacing" min="16" max="64" step="1" value="32" unit="px"></p9r-range>
    </p9r-section>
</p9r-attr-sync>
```

- `<p9r-section data-title="...">`: visually groups controls with a title.
- The initial input value serves as default when the attribute
  is not yet present on the component.

### Available styled inputs

Always prefer these over raw native `<select>` or `<input>` elements:

#### `<p9r-select>` — Styled dropdown

```html
<p9r-select name="variant" label="Variant">
    <option selected value="elevated">Elevated</option>
    <option value="outline">Outline</option>
    <option value="ghost">Ghost</option>
</p9r-select>
```

| Attribute | Role |
|---|---|
| `name` | Target attribute on the component |
| `label` | Label displayed above the dropdown |

Options use standard `<option>` elements with `value` and optional `selected`.

#### `<p9r-range>` — Slider with number input

```html
<p9r-range name="radius" label="Border radius" min="0" max="32" step="1" value="16" unit="px"></p9r-range>
```

| Attribute | Role |
|---|---|
| `name` | Target attribute |
| `label` | Label displayed above the slider |
| `min` / `max` | Range bounds |
| `step` | Increment step |
| `value` | Default value |
| `unit` | Unit label displayed next to the number (e.g. `px`, `%`) |

#### `<p9r-sizes-select>` — Size preset selector

Shortcut that generates a `<p9r-select>` with NONE / XS / S / M / L / XL options.

```html
<p9r-sizes-select name="gap" label="Spacing"></p9r-sizes-select>
```

| Attribute | Role |
|---|---|
| `name` | Target attribute |
| `label` | Label displayed above the dropdown |

The selected values map to size presets that must be handled in CSS via
attribute selectors:
```css
:host([gap="none"]) { --gap: 0px; }
:host([gap="xs"])   { --gap: 8px; }
:host([gap="sm"])   { --gap: 16px; }
:host([gap="md"])   { --gap: 24px; }
:host([gap="lg"])   { --gap: 40px; }
:host([gap="xl"])   { --gap: 64px; }
```

#### `<p9r-page-link>` — Internal page picker

Fetches available pages from the admin API and lets the user pick one.

```html
<p9r-page-link name="href" label="Link to page"></p9r-page-link>
```

| Attribute | Role |
|---|---|
| `name` | Target attribute |
| `label` | Label displayed above the picker |

### 2. `<p9r-comp-sync>` — Sub-component synchronization (slots)

Defines default content for each slot and the editorial behavior
of its children. **This is the core of the system** — it automatically handles:
- Creating default content if the slot is empty
- Allowed actions (delete, duplicate, drag, change component…)
- The parent-identifier link so the slot's editor knows its parent

```html
<!-- Fixed slot (text, image…) — not deletable, not duplicable -->
<p9r-comp-sync>
    <span slot="title">Default title</span>
</p9r-comp-sync>

<!-- Optional slot — user can delete the element -->
<p9r-comp-sync optionnal>
    <span slot="subtitle">Optional subtitle</span>
</p9r-comp-sync>

<!-- Slot with component replacement allowed -->
<p9r-comp-sync allow-others-components>
    <p slot="footer">Footer</p>
</p9r-comp-sync>

<!-- Multiple slot — allows add, delete, duplicate, reorder -->
<p9r-comp-sync allow-multiple>
    <p>Default item</p>
</p9r-comp-sync>

<!-- Multiple slot with inline adding (+/- buttons on sides) -->
<p9r-comp-sync allow-multiple inline-adding>
    <p>Item</p>
</p9r-comp-sync>
```

**`<p9r-comp-sync>` attributes:**

| Attribute | Effect |
|---|---|
| *(none)* | Fixed slot: not deletable, not duplicable, no component change |
| `optionnal` | User can delete the slot element |
| `allow-others-components` | Allows component change (on single slot) |
| `allow-multiple` | Enables all actions: add, delete, duplicate, drag, change component |
| `inline-adding` | (with `allow-multiple`) Add buttons positioned inline |

**Default behavior of `<p9r-comp-sync>` (no attribute):**
Slot children are automatically configured with:
- `disable-duplicate`, `disable-add-after`, `disable-add-before`, `disable-dragging` = true
- `disable-change-component` = true
- `disable-delete` = true

### 3. `<p9r-image-sync>` — Image picker via MediaCenter

Placed **outside** of `<p9r-attr-sync>` and `<p9r-comp-sync>`,
directly inside a `<p9r-section>`.

```html
<p9r-section data-title="Media">
    <p9r-image-sync slotTarget="image" label="Cover image" default="https://placehold.co/800x450"></p9r-image-sync>
</p9r-section>
```

| Attribute | Role |
|---|---|
| `slotTarget` | Slot name where the `<img>` will be inserted/updated |
| `label` | Label displayed above the preview |
| `default` | Default image URL shown when no image is set |
| `accept` | Accepted media types (default: `"image"`) |

### Full example (Card)

```html
<p9r-attr-sync>
    <p9r-section data-title="Layout">
        <p9r-select name="direction" label="Direction">
            <option selected value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
        </p9r-select>
        <p9r-select name="media" label="Image">
            <option selected value="visible">Show</option>
            <option value="none">Hide</option>
        </p9r-select>
    </p9r-section>
    <p9r-section data-title="Style">
        <p9r-select name="variant" label="Variant">
            <option selected value="elevated">Elevated</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
        </p9r-select>
        <p9r-range name="radius" label="Border radius" min="0" max="32" step="1" value="16" unit="px"></p9r-range>
        <p9r-range name="padding" label="Padding" min="8" max="40" step="2" value="20" unit="px"></p9r-range>
    </p9r-section>
</p9r-attr-sync>

<p9r-section data-title="Media">
    <p9r-image-sync slotTarget="image" label="Cover image" default="https://placehold.co/800x450"></p9r-image-sync>
</p9r-section>

<p9r-comp-sync optionnal>
    <span slot="tag">New</span>
</p9r-comp-sync>

<p9r-comp-sync>
    <span slot="title">Card title</span>
</p9r-comp-sync>

<p9r-comp-sync optionnal>
    <p slot="description">A short description to spark curiosity.</p>
</p9r-comp-sync>

<p9r-comp-sync allow-others-components optionnal>
    <p slot="footer">Learn more</p>
</p9r-comp-sync>
```

### Full example (Stack — with sizes + backgrounds)

```html
<p9r-attr-sync>
    <p9r-section data-title="Dimensions">
        <p9r-select name="max-width" label="Content width">
            <option value="680">Article (680px)</option>
            <option value="1000">Narrow (1000px)</option>
            <option selected value="1280">Standard (1280px)</option>
            <option value="1512">Wide (1512px)</option>
        </p9r-select>
        <p9r-select name="align" label="Alignment">
            <option value="flex-start">Left</option>
            <option selected value="center">Center</option>
            <option value="flex-end">Right</option>
        </p9r-select>
    </p9r-section>
    <p9r-section data-title="Spacing">
        <p9r-sizes-select name="padding-y" label="Vertical padding"></p9r-sizes-select>
        <p9r-sizes-select name="gap" label="Gap between elements"></p9r-sizes-select>
    </p9r-section>
    <p9r-section data-title="Background">
        <p9r-select name="bg" label="Full-width background">
            <option selected value="none">None</option>
            <option value="base">Base</option>
            <option value="surface">Surface</option>
            <option value="overlay">Overlay</option>
            <option value="primary">Primary</option>
        </p9r-select>
    </p9r-section>
</p9r-attr-sync>

<p9r-comp-sync allow-multiple>
    <p>Stack content...</p>
</p9r-comp-sync>
```

---

## Child components (sub-components)

When the main component needs a **sub-component** (e.g. a card
in a carousel, an item in a list), follow these rules.

### Structure

```
[ComponentName]/
├── [ComponentName].ts
├── [ComponentName]Editor.ts
├── style.css
├── template.html
├── configuration.html
└── SubComponent/
    ├── SubComponent.ts     ← export class, NO customElements.define
    ├── tag.ts              ← define + export registration function
    ├── style.css
    └── template.html
```

### Rules

1. **Create the sub-component** as a standalone web component
   (its own `.ts`, `style.css`, `template.html` files).
2. **Do NOT create an editor for the sub-component.**
   The **parent component's editor** manages children via
   `<p9r-comp-sync>` in its `configuration.html`.
3. The sub-component follows the same conventions (`Component`, self-contained
   CSS variables, no `super.connectedCallback()`).

### Sub-component tag

The tag is **deterministic**, derived from the parent tag. The parent component
and editor are built as **separate bundles** — never cross-import between
component and editor.

**`SubComponent/SubComponent.ts`** — exports the class without define:
```ts
import { Component } from 'src/core/Component/core/Component';
export class SubComponent extends Component { ... }
// NO customElements.define here
```

**`SubComponent/tag.ts`** — exports a registration function:
```ts
import { SubComponent } from "./SubComponent";

export function registerSubComponent(parentTag: string) {
    const childTag = parentTag + "-item";
    if (!customElements.get(childTag)) {
        customElements.define(childTag, SubComponent);
    }
}
```

**The parent component** calls the registration:
```ts
import { registerSubComponent } from "./SubComponent/tag";

const tag = "BE5_TAG_TO_BE_REPLACED";
customElements.define(tag, [NAME]);
registerSubComponent(tag);
```

**The editor** rebuilds the child tag without cross-import:
```ts
const tag = "BE5_TAG_TO_BE_REPLACED";
const subComponentTag = tag + "-item";
```
