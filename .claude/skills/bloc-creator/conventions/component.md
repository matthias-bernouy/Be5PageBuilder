# Conventions — `Bloc.ts`

## Import contract

```ts
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from '@bernouy/pagebuilder/component';
```

**Never** import from `@bernouy/pagebuilder/editor`, `src/core/Editor/*`,
`src/core/Component/*`, or anything editor-adjacent. The view bundle is
deliberately walled off so visitors don't download editor code transitively.

## Base class

`Component` from `@bernouy/pagebuilder/component` extends `HTMLElement`.
Its constructor signature is:

```ts
new Component({ css: string, template: string })
```

It attaches an open shadow root and injects `<style>${css}</style>${template}`.
Always cast the imported HTML text with `template as unknown as string` — the
text import plugin types it as `string` but TS sometimes infers `unknown`.

## Forbidden in source

Do not write:

- `customElements.define(...)` — the CLI wrapper injects it with the tag
  from `manifest.json`.
- `BE5_TAG_TO_BE_REPLACED` / `BE5_LABEL_TO_BE_REPLACED` /
  `BE5_GROUP_TO_BE_REPLACED` — build placeholders, injected by the CLI
  wrapper, never written by hand.
- `registerEditor(...)` — that belongs to the editor side, and even there
  the CLI injects it.

If you write any of these in source, the build will either conflict (double
`define`) or your bloc will fail to register properly.

## `connectedCallback` — idempotent, never `super`

Two rules:

1. **Never call `super.connectedCallback()`.** The parent method is empty
   by design; calling it provides nothing and creates confusion.
2. **`connectedCallback` must be idempotent.** The editor's `<p9r-comp-sync>`
   inserts default slot content *after* the element is first connected, then
   re-invokes `connectedCallback` so the element re-wires itself against the
   new children. Any code inside must handle being called multiple times
   without side effects (no duplicate listeners, no duplicate DOM).

Idempotent patterns:

- Use class fields initialized once (`_listenersAttached = true`).
- Re-query shadow DOM elements each time instead of caching stale references.
- Use `addEventListener` with `{ once: true }` where appropriate.
- Or simply write the callback so re-running it is a no-op:
  `anchor?.setAttribute("href", this.getAttribute("href") || "#")`.

## Attribute-driven behavior

For configuration attributes that must trigger JS (not just CSS), declare
`static observedAttributes` and implement `attributeChangedCallback`.

```ts
export class Bloc extends Component {

    static observedAttributes = ["href", "target"];

    attributeChangedCallback(name: string) {
        if (name === "href" || name === "target") this._syncLink();
    }
}
```

If CSS can express the attribute's effect (via `:host([attr="value"])` or
`attr()`), prefer CSS — it's automatic and needs no `observedAttributes`.

## Shadow DOM access

`shadowRoot` is guaranteed non-null after `super(...)` because `Component`
attaches it eagerly. Use `this.shadowRoot!.querySelector(...)` without
hesitation.

## No custom element registration

To repeat, because this is the #1 source of bugs in legacy skills: the last
line of your file is the class's closing `}`. No `customElements.define` call.
Ever.
