# Example — Stack layout bloc

A full-width container that stacks its children vertically with
configurable width, alignment, spacing and background. Showcases:

- `<p9r-sizes-select>` for vertical padding and gap
- Enum background presets
- `<p9r-comp-sync allow-multiple>` as the only content control
- Fully self-contained CSS variables with global design token fallbacks

## `manifest.json`

```json
{
    "runtime": "0.0.1",
    "bloc": "./Bloc.ts",
    "editor": "./BlocEditor.ts",

    "default-tag": "acme-stack",
    "default-group": "Layout",

    "meta": {
        "author": "Acme",
        "title": "Stack",
        "description": "A full-width vertical layout container with background, alignment and spacing controls.",
        "categories": ["layout"],
        "thumbnail": "./assets/thumbnail.svg"
    }
}
```

## `Bloc.ts`

```ts
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from '@bernouy/pagebuilder/component';

export class Bloc extends Component {

    constructor() {
        super({ css, template: template as unknown as string });
    }

}
```

No lifecycle logic: everything the stack exposes is CSS-driven.

## `BlocEditor.ts`

```ts
import { Editor } from '@bernouy/pagebuilder/editor';
import Config from './configuration.html' with { type: 'text' };

export class BlocEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Config as unknown as string);
    }

    init() {}
    restore() {}

}
```

## `template.html`

```html
<section class="stack">
    <div class="inner">
        <slot></slot>
    </div>
</section>
```

## `style.css`

```css
:host {
    --stack-bg: transparent;
    --stack-max-width: 1280px;
    --stack-align: center;
    --stack-padding-y: 2.5rem;
    --stack-gap: 1.5rem;

    display: block;
    background: var(--stack-bg);
}

.stack {
    padding: var(--stack-padding-y) 1rem;
}

.inner {
    max-width: var(--stack-max-width);
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap);
    align-items: var(--stack-align);
}

/* Max-width presets (driven by <p9r-select>) */
:host([max-width="680"])  { --stack-max-width: 680px;  }
:host([max-width="1000"]) { --stack-max-width: 1000px; }
:host([max-width="1280"]) { --stack-max-width: 1280px; }
:host([max-width="1512"]) { --stack-max-width: 1512px; }

/* Alignment */
:host([align="flex-start"]) { --stack-align: flex-start; }
:host([align="center"])     { --stack-align: center;     }
:host([align="flex-end"])   { --stack-align: flex-end;   }

/* Vertical padding presets */
:host([padding-y="none"]) { --stack-padding-y: 0;       }
:host([padding-y="xs"])   { --stack-padding-y: 0.75rem; }
:host([padding-y="sm"])   { --stack-padding-y: 1.5rem;  }
:host([padding-y="md"])   { --stack-padding-y: 2.5rem;  }
:host([padding-y="lg"])   { --stack-padding-y: 4rem;    }
:host([padding-y="xl"])   { --stack-padding-y: 6rem;    }

/* Gap presets */
:host([gap="none"]) { --stack-gap: 0;       }
:host([gap="xs"])   { --stack-gap: 0.5rem;  }
:host([gap="sm"])   { --stack-gap: 1rem;    }
:host([gap="md"])   { --stack-gap: 1.5rem;  }
:host([gap="lg"])   { --stack-gap: 2.5rem;  }
:host([gap="xl"])   { --stack-gap: 4rem;    }

/* Background presets */
:host([bg="base"])    { --stack-bg: var(--bg-base,    #f8fafc); }
:host([bg="surface"]) { --stack-bg: var(--bg-surface, #ffffff); }
:host([bg="overlay"]) { --stack-bg: var(--bg-overlay, #0f172a); color: #fff; }
:host([bg="primary"]) { --stack-bg: var(--primary-base, #4361ee); color: #fff; }
```

## `configuration.html`

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
        <p9r-select name="bg" label="Background">
            <option selected value="none">None</option>
            <option value="base">Base</option>
            <option value="surface">Surface</option>
            <option value="overlay">Overlay</option>
            <option value="primary">Primary</option>
        </p9r-select>
    </p9r-section>
</p9r-attr-sync>

<p9r-section data-title="Content">
    <p9r-comp-sync allow-multiple>
        <p>Stack content...</p>
    </p9r-comp-sync>
</p9r-section>
```

## Notes

- The `max-width` attribute is numeric *by value* but mapped via enum
  presets — `attr()` would work here too (`max-width: attr(max-width px, 1280px)`),
  but the preset approach makes the available widths explicit in CSS.
- `<p9r-sizes-select>` emits values in the fixed set
  `none / xs / sm / md / lg / xl`. The CSS maps all six.
- No `<p9r-comp-sync>` flag is marked `optionnal`: the stack is a
  container, it must always have at least one child.
- Background `none` maps to no rule (the default transparent value wins),
  which is exactly the effect we want.
