# Example — Card bloc

A full, deploy-ready card bloc. Showcases:

- `<p9r-attr-sync>` with `<p9r-select>` and `<p9r-range>`
- Numeric CSS `attr()` for radius and elevation
- Enum presets via `:host([attr="value"])` for variant, color, size
- `<p9r-image-sync>` for the cover and the icon
- `<p9r-comp-sync>` in its three flavors: fixed, optional, multiple
- A link via `<p9r-page-link>` driving the `href` attribute

## `manifest.json`

```json
{
    "runtime": "0.0.1",
    "bloc": "./Bloc.ts",
    "editor": "./BlocEditor.ts",

    "default-tag": "acme-card",
    "default-group": "Content",

    "meta": {
        "author": "Acme",
        "title": "Card",
        "description": "A versatile card with cover, icon, title, body and action buttons.",
        "categories": ["content", "cards"],
        "thumbnail": "./assets/thumbnail.svg",
        "images": [
            "./assets/preview-1.svg"
        ]
    }
}
```

## `Bloc.ts`

```ts
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from '@bernouy/pagebuilder/component';

export class Bloc extends Component {

    static observedAttributes = ["href"];

    constructor() {
        super({ css, template: template as unknown as string });
    }

    override connectedCallback(): void {
        this._syncHref();
    }

    attributeChangedCallback(name: string) {
        if (name === "href") this._syncHref();
    }

    private _syncHref() {
        const anchor = this.shadowRoot!.querySelector("a");
        anchor?.setAttribute("href", this.getAttribute("href") || "#");
    }

}
```

## `BlocEditor.ts`

```ts
import { Editor } from '@bernouy/pagebuilder/editor';
import Config from './configuration.html' with { type: 'text' };

const editorStyles = `
    .card:hover {
        transform: unset;
        filter: unset;
    }
`;

export class BlocEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, editorStyles, Config as unknown as string);
    }

    init() {}
    restore() {}

}
```

## `template.html`

```html
<a class="card">
    <div class="cover-wrap">
        <slot name="cover"></slot>
    </div>
    <div class="body">
        <img slot="icon" class="icon-placeholder">
        <div class="text">
            <slot></slot>
            <slot name="body"></slot>
        </div>
    </div>
    <div class="actions">
        <slot name="actions"></slot>
    </div>
</a>
```

## `style.css`

```css
:host {
    --card-bg: var(--primary-muted, #eef2ff);
    --card-fg: var(--text-main, #1e293b);
    --card-border: transparent;
    --card-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
    --card-gap: 0.75rem;
    --card-padding: 1rem;

    display: block;
    border-radius: attr(radius px, 12px);
    overflow: hidden;
    background: var(--card-bg);
    color: var(--card-fg);
    border: 1px solid var(--card-border);
    box-shadow: var(--card-shadow);
    text-decoration: none;
    transition: box-shadow 0.2s, transform 0.2s, filter 0.2s;
}

:host(:hover) {
    filter: brightness(1.02);
    transform: translateY(-1px);
}

.card {
    display: flex;
    flex-direction: column;
    color: inherit;
    text-decoration: none;
}

/* Cover */
.cover-wrap { display: block; }
.cover-wrap:not(:has(::slotted(*))) { display: none; }

::slotted([slot="cover"]) {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
}

/* Body */
.body {
    display: flex;
    align-items: flex-start;
    gap: var(--card-gap);
    padding: var(--card-padding);
}

.icon-placeholder { display: none; }

::slotted(img[slot="icon"]) {
    display: block;
    width: 2.5em;
    height: 2.5em;
    flex-shrink: 0;
    border-radius: 8px;
    object-fit: cover;
}

.text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

::slotted(:not([slot])) {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: inherit;
}

::slotted([slot="body"]) {
    margin: 0;
    font-size: 0.875rem;
    color: color-mix(in srgb, currentColor 70%, transparent);
}

/* Actions */
.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0 var(--card-padding) var(--card-padding);
}

.actions:not(:has(::slotted(*))) {
    display: none;
}

/* Color presets */
:host([color="secondary"]) { --card-bg: var(--secondary-muted, #f1f5f9); }
:host([color="success"])   { --card-bg: var(--success-muted,   #ecfdf5); }
:host([color="danger"])    { --card-bg: var(--danger-muted,    #fef2f2); }

/* Variant presets */
:host([variant="outline"]) {
    --card-bg: transparent;
    --card-border: var(--primary-base, #4361ee);
    --card-shadow: none;
}
:host([variant="ghost"]) {
    --card-bg: transparent;
    --card-border: transparent;
    --card-shadow: none;
}

/* Size presets */
:host([size="xs"]) { --card-padding: 0.5rem;  --card-gap: 0.5rem;  }
:host([size="sm"]) { --card-padding: 0.75rem; --card-gap: 0.5rem;  }
:host([size="md"]) { --card-padding: 1rem;    --card-gap: 0.75rem; }
:host([size="lg"]) { --card-padding: 1.5rem;  --card-gap: 1rem;    }
:host([size="xl"]) { --card-padding: 2rem;    --card-gap: 1.25rem; }

/* Elevation presets */
:host([elevation="0"]) { --card-shadow: none; }
:host([elevation="1"]) { --card-shadow: 0 1px 2px  rgb(0 0 0 / 0.05); }
:host([elevation="2"]) { --card-shadow: 0 2px 6px  rgb(0 0 0 / 0.08); }
:host([elevation="3"]) { --card-shadow: 0 4px 12px rgb(0 0 0 / 0.10); }
:host([elevation="4"]) { --card-shadow: 0 8px 20px rgb(0 0 0 / 0.12); }
:host([elevation="5"]) { --card-shadow: 0 12px 32px rgb(0 0 0 / 0.15); }
```

## `configuration.html`

```html
<p9r-attr-sync>
    <p9r-section data-title="Style">
        <p9r-select name="variant" label="Variant">
            <option selected value="filled">Filled</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
        </p9r-select>
        <p9r-select name="color" label="Color">
            <option selected value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="success">Success</option>
            <option value="danger">Danger</option>
        </p9r-select>
    </p9r-section>

    <p9r-section data-title="Layout">
        <p9r-sizes-select name="size" label="Size"></p9r-sizes-select>
        <p9r-range name="radius" label="Corner radius" min="0" max="32" value="12" unit="px"></p9r-range>
        <p9r-range name="elevation" label="Elevation" min="0" max="5" value="1"></p9r-range>
    </p9r-section>

    <p9r-section data-title="Link" data-collapsed>
        <p9r-page-link name="href" label="Target page"></p9r-page-link>
    </p9r-section>
</p9r-attr-sync>

<p9r-section data-title="Media">
    <p9r-image-sync slotTarget="cover" label="Cover" default="https://placehold.co/600x300"></p9r-image-sync>
    <p9r-image-sync slotTarget="icon"  label="Icon"  default="https://placehold.co/64x64"></p9r-image-sync>
</p9r-section>

<p9r-section data-title="Content">
    <p9r-comp-sync>
        <h3>Card title</h3>
    </p9r-comp-sync>
    <p9r-comp-sync optionnal>
        <p slot="body">Write a short description of this card...</p>
    </p9r-comp-sync>
    <p9r-comp-sync allow-multiple optionnal inline-adding>
        <acme-button slot="actions">Action</acme-button>
    </p9r-comp-sync>
</p9r-section>
```

## Notes

- The `<acme-button>` reference in the actions slot assumes a separately
  deployed bloc with tag `acme-button`. No declaration needed — see
  `conventions/composition.md`.
- `<p9r-image-sync>` is placed outside `<p9r-attr-sync>` because images are
  slot content, not attributes.
- The title uses the **default slot** (child without `slot="..."`), so the
  `<p9r-comp-sync>` wrapping `<h3>Card title</h3>` has no attribute.
- Editor-mode CSS kills the hover lift so the action bar doesn't jump
  under the cursor during editing.
