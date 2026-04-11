# Template — `style.css`

Fully self-contained styles. Every local variable is declared on `:host` with
a fallback to a global design token and a hardcoded default.

## Minimal shell

```css
:host {
    --bloc-bg: var(--bg-surface, #ffffff);
    --bloc-fg: var(--text-main, #1e293b);
    --bloc-padding: 1rem;
    --bloc-radius: 12px;

    display: block;
    padding: var(--bloc-padding);
    background: var(--bloc-bg);
    color: var(--bloc-fg);
    border-radius: var(--bloc-radius);
}
```

## Numeric attribute → CSS via `attr()`

For numeric attributes bound to `<p9r-range>` (e.g. `radius`, `elevation`,
`padding`), `attr()` resolves directly:

```css
:host {
    --bloc-radius: attr(radius px, 12px);
    --bloc-padding: attr(padding px, 16px);
}
```

Fallback is used when the attribute is absent.

## Enum-like attribute → `:host([attr="value"])` presets

`attr()` **cannot** resolve CSS variable references. For anything mapping a
string value to a design token or a preset, use attribute selectors on
`:host`:

```css
:host([color="primary"])   { --bloc-bg: var(--primary-muted, #eef2ff); }
:host([color="secondary"]) { --bloc-bg: var(--secondary-muted, #f1f5f9); }
:host([color="success"])   { --bloc-bg: var(--success-muted, #ecfdf5); }

:host([size="xs"]) { --bloc-padding: 0.5rem; }
:host([size="sm"]) { --bloc-padding: 0.75rem; }
:host([size="md"]) { --bloc-padding: 1rem; }
:host([size="lg"]) { --bloc-padding: 1.5rem; }
:host([size="xl"]) { --bloc-padding: 2rem; }
```

## Slotted content

```css
::slotted([slot="cover"]) {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
}

/* Hide the wrapper when its slot is empty */
.actions:not(:has(::slotted(*))) {
    display: none;
}
```

See `conventions/style.md` for the full list of global design tokens and
advanced patterns.
