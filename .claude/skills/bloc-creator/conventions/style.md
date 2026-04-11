# Conventions — `style.css`

## Self-containment rule

`style.css` is fully self-sufficient. Every variable the bloc consumes is
declared on `:host` with a fallback to a global design token and a
hardcoded default.

```css
:host {
    --bloc-bg: var(--bg-surface, #ffffff);
    --bloc-fg: var(--text-main, #1e293b);
    --bloc-gap: 0.75rem;
}
```

- **No magic values in rules.** Everything flows through a local variable.
- **No external @import** of a theme or shared stylesheet.
- **No reliance on globals without a fallback.** Always `var(--x, fallback)`.

Rationale: a bloc may be embedded in any page — with or without the full
design system loaded — and must render reasonably in both cases.

## Available global design tokens

Declare these as fallbacks only. Do not assume they exist.

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

## `attr()` — numeric attributes only

CSS `attr()` works **only** for simple numeric values with a unit suffix
and a fallback:

```css
:host {
    --bloc-radius:  attr(radius  px, 12px);
    --bloc-padding: attr(padding px, 16px);
    --bloc-elevation: attr(elevation, 1);
}
```

`attr()` **cannot** resolve to a CSS variable reference or to a complex
expression. For anything other than plain numbers, use the enum preset
pattern below.

## Enum presets via `:host([attr="value"])`

For string-valued attributes that map to design tokens or preset values,
use attribute selectors on `:host`:

```css
:host([color="primary"])   { --bloc-bg: var(--primary-muted,   #eef2ff); }
:host([color="secondary"]) { --bloc-bg: var(--secondary-muted, #f1f5f9); }
:host([color="success"])   { --bloc-bg: var(--success-muted,   #ecfdf5); }

:host([variant="outline"]) {
    --bloc-bg: transparent;
    --bloc-border: var(--primary-base, #4361ee);
    --bloc-shadow: none;
}

:host([size="xs"]) { --bloc-padding: 0.5rem;  --bloc-gap: 0.5rem;  }
:host([size="sm"]) { --bloc-padding: 0.75rem; --bloc-gap: 0.5rem;  }
:host([size="md"]) { --bloc-padding: 1rem;    --bloc-gap: 0.75rem; }
:host([size="lg"]) { --bloc-padding: 1.5rem;  --bloc-gap: 1rem;    }
:host([size="xl"]) { --bloc-padding: 2rem;    --bloc-gap: 1.25rem; }
```

The five values `xs / sm / md / lg / xl` match the output of
`<p9r-sizes-select>` (plus `none` for the zero case). Keep the mapping
consistent across blocs so themes apply predictably.

## Styling slotted content

Children that the host injects into a slot cannot be styled with regular
descendant selectors. Use `::slotted()`:

```css
::slotted([slot="cover"]) {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
}

::slotted(:not([slot])) {
    /* Default slot children */
    margin: 0;
    font-weight: 700;
}
```

`::slotted()` only matches direct children — it does not pierce into the
descendant tree.

## Hiding empty slot wrappers

A wrapper element around an empty slot often leaves visible whitespace.
Hide it with `:not(:has(::slotted(*)))`:

```css
.actions {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
}

.actions:not(:has(::slotted(*))) {
    display: none;
}
```

This is the canonical pattern for optional slots.

## Host display

`Component` uses an open shadow root but does **not** set a default display.
Set it explicitly on `:host`:

```css
:host {
    display: block;
    /* or: display: inline-block / flex / grid depending on usage */
}
```
