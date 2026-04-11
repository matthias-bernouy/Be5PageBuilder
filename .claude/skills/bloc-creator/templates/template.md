# Template — `template.html`

The bloc's shadow DOM template. Uses `<slot>` to expose editable zones to the
host DOM.

## Minimal shell

```html
<div class="wrapper">
    <slot></slot>
</div>
```

## With named slots

```html
<article class="card">
    <div class="cover">
        <slot name="cover"></slot>
    </div>
    <div class="body">
        <h3 class="title">
            <slot>Default title</slot>
        </h3>
        <div class="description">
            <slot name="description"></slot>
        </div>
        <div class="actions">
            <slot name="actions"></slot>
        </div>
    </div>
</article>
```

## Rules

- **Default slot** = unnamed `<slot></slot>`. Receives any host child that
  lacks a `slot="..."` attribute.
- **Named slots** = `<slot name="body">`. Receive host children with a
  matching `slot="body"` attribute.
- A slot can have **fallback content**, shown when the slot is empty:
  `<slot name="title">Default title</slot>`.
- Wrapper elements around slots (`<div class="actions">`) can be hidden when
  empty with the `:not(:has(::slotted(*)))` pattern — see
  `conventions/style.md`.

See `conventions/configuration.md` for how `<p9r-comp-sync>` provides the
default host-side content for each slot.
