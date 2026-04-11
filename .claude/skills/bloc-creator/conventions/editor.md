# Conventions — `BlocEditor.ts`

## Import contract

```ts
import { Editor } from '@bernouy/pagebuilder/editor';
import Config from './configuration.html' with { type: 'text' };
```

Available exports from `@bernouy/pagebuilder/editor`: `Editor`,
`registerEditor`, `registerEditor_opaque`. **Do not call the register
functions yourself** — the CLI wrapper calls them, passing the manifest's
tag and label.

**Never** import from `@bernouy/pagebuilder/component` or from `src/core/*`.
The editor bundle stays disjoint from the view bundle.

## Base class

`Editor` is an **abstract** class. Its constructor signature is:

```ts
new Editor(target: HTMLElement, styles: string, editor?: string)
```

| Arg | Purpose |
|---|---|
| `target` | The bloc element being edited. Passed in by the editor system. Forward it as-is to `super(...)`. |
| `styles` | CSS string applied **only during edit mode**. Pass `""` when there is nothing to override. |
| `editor` | The configuration panel HTML string (the content of `configuration.html`). Pass `Config as unknown as string`. |

Because `Editor` is abstract, `init()` and `restore()` are **required**. You
must define them even if their bodies are empty.

## Minimal editor

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

That's the 99% case. Everything configurable is already described in
`configuration.html`; the editor class is just a binding shell.

## When to add editor-mode CSS (second `super` arg)

Use it when the bloc has visual behavior that interferes with editing:

- Hover effects (`transform`, `box-shadow`) that make the bloc jump when the
  user hovers to open the action bar.
- Pointer-events overlays that would swallow clicks from the editor UI.
- Animations that restart on every re-render.

```ts
const editorStyles = `
    .card:hover {
        transform: unset;
        box-shadow: unset;
    }
    .card {
        animation: none;
    }
`;

constructor(target: HTMLElement) {
    super(target, editorStyles, Config as unknown as string);
}
```

The CSS is injected into the bloc's shadow root (or into `<body>` as a
fallback for blocs without shadow DOM) during `viewEditor()`, and removed
during `viewClient()`.

## Custom editor-mode behavior via `init()` / `restore()`

### Principle — prefer declarative, not code

The CMS engine automates as much as possible so authors don't have to
write JS for standard concerns: attribute binding, slot defaults, media
selection, page linking. That's the whole point of `<p9r-attr-sync>`,
`<p9r-comp-sync>`, `<p9r-image-sync>` and friends — declarative beats
imperative.

**Add JS in `init()` / `restore()` only when there is no declarative way
to achieve the behavior AND the behavior adds real value.** If the rule
can be expressed in CSS or via an existing sync system, do that instead.

Examples where `init()` / `restore()` earn their place:

- Disabling an internal auto-rotation in a carousel bloc so the author
  can edit a fixed slide.
- Freezing a long-press-to-delete interaction on a list item bloc that
  would otherwise swallow editor clicks.
- Pausing a video or disabling autoplay during editing.
- Highlighting internal structure with a dashed outline only while the
  author is in edit mode.

Examples that do **not** belong here (the declarative system already
handles them):

- Writing an attribute to the host — use `<p9r-attr-sync>`.
- Inserting default slot content — use `<p9r-comp-sync>`.
- Picking an image — use `<p9r-image-sync>`.
- Styling a state in edit mode — pass CSS via the second `super(...)`
  arg (see above).

### The extension points

`init()` and `restore()` are the proper hooks. The base `Editor.viewEditor()`
calls `this.init()` after wiring the panel; `Editor.viewClient()` calls
`this.restore()` before cleaning up editor attributes. **Do not override
`viewEditor()` or `viewClient()` themselves** — the base class does all
the orchestration (panel mount, identifiers, action bar, styles). Override
`init()` and `restore()` only.

There is also no point in calling `super.init()` / `super.restore()` —
they are abstract in the base class, so there is nothing to forward to.

### The reinit contract — `restore()` must fully undo `init()`

This is the rule that matters most, because mode-switching is a
round-trip, not a one-way operation. Whatever `init()` mutates,
`restore()` must put back exactly as it was. Anything less leaks editor
state into client mode — visible to the user, breaks the published page.

Concretely:

- **Listeners attached in `init()`** must be removed in `restore()`.
  Store the bound reference on `this` so you can pass the same function
  to `removeEventListener`.
- **Classes or attributes added** must be removed.
- **Timers / intervals started** (e.g. pausing auto-rotation by clearing
  an interval) must be restarted in `restore()` if the behavior should
  resume in client mode.
- **Internal state frozen** (e.g. current carousel slide index) must be
  unfrozen.
- **Injected DOM** must be removed.

### Example — a carousel that pauses during editing

```ts
import { Editor } from '@bernouy/pagebuilder/editor';
import Config from './configuration.html' with { type: 'text' };

type Carousel = HTMLElement & { pause: () => void; play: () => void };

export class BlocEditor extends Editor {

    constructor(target: HTMLElement) {
        super(target, "", Config as unknown as string);
    }

    init() {
        const carousel = this.target as Carousel;
        carousel.pause();
        carousel.classList.add("editor-paused");
    }

    restore() {
        const carousel = this.target as Carousel;
        carousel.classList.remove("editor-paused");
        carousel.play();
    }

}
```

The rule of thumb: if you added three lines to `init()`, you should
expect three lines in `restore()` that undo them in reverse order. The
mode-switch round-trip test (`conventions/verification.md` → G1) is what
catches you if you forget.

## Forbidden in source

- `customElements.define(...)`
- `registerEditor({ cl: ... })` / `registerEditor_opaque(...)`
- Build placeholders like `BE5_TAG_TO_BE_REPLACED`

All injected by the CLI wrapper from `manifest.json`.

## Opaque blocs

If your bloc is opaque (no `editor` field in `manifest.json`), there is no
`BlocEditor.ts` file — the CLI synthesizes a default opaque editor that
calls `registerEditor_opaque()` internally. Just don't create the file.
