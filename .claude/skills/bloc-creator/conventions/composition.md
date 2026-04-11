# Conventions — composing blocs

Sub-components no longer exist as a special structure inside a parent bloc.
Instead, any bloc can be used inside any other bloc, just by referring to
its tag. A single bloc can be the child of many parents, or a top-level
bloc on a page — same artifact, same deploy.

## Discover what's deployed before you reference it — non-negotiable

**Never invent a tag.** If you want to use another bloc as a child (either
directly in `template.html`, or as the default content of a
`<p9r-comp-sync>`, or anywhere else), you must first verify it exists on
the target CMS.

Run this first, exactly once, at the start of any bloc-creation task:

```bash
bunx p9r list-blocs
```

The command prints every registered bloc with its `id`, `name`, `group`
and `description`, grouped by `group`. Only reference tags that appear in
that list. If the tag you want is not there, either (a) scaffold and
deploy it first, or (b) fall back to a plain HTML element that has an
editor mode (`<p>`, `<h2>`, `<span>`…) as a placeholder, and tell the
user what's missing.

If `p9r list-blocs` fails (bad `P9R_URL` / `P9R_TOKEN`, CMS unreachable),
**stop and ask** — do not fall back to tags you assume might exist.

### Reserved prefixes

Two tag prefixes are reserved by the PageBuilder system and must never be
used for new blocs:

- `w13c-*` — reserved for the `w13c` design-system internals.
- `p9r-*`  — reserved for PageBuilder editor primitives
  (`<p9r-comp-sync>`, `<p9r-attr-sync>`, `<p9r-section>`, `<p9r-select>`,
  `<p9r-range>`, `<p9r-sizes-select>`, `<p9r-page-link>`,
  `<p9r-image-sync>`, `<p9r-config-panel>`, etc.).

A brand-new CMS deployment has **no blocs at all**. In that case the only
tags that exist are the `p9r-*` editor primitives, and those are never
valid as content inside a bloc's template or `<p9r-comp-sync>` default.
When you have no deployed children to reference, compose the bloc from
plain editable HTML (text elements, images via `<p9r-image-sync>`) and
nothing else.

## Using a bloc inside another bloc

Suppose you have already deployed a `my-menu-item` bloc. To use it inside a
`my-menu` bloc, just write its tag in the parent's `template.html` or in
the default content of a `<p9r-comp-sync>`:

### As default content in the template

```html
<!-- my-menu/template.html -->
<nav class="menu">
    <slot></slot>
</nav>
```

```html
<!-- my-menu/configuration.html -->
<p9r-section data-title="Items">
    <p9r-comp-sync allow-multiple optionnal inline-adding>
        <my-menu-item>New item</my-menu-item>
    </p9r-comp-sync>
</p9r-section>
```

### As a fixed slot default

```html
<!-- my-menu/configuration.html -->
<p9r-section data-title="Call to action">
    <p9r-comp-sync optionnal>
        <my-cta-button slot="cta">Learn more</my-cta-button>
    </p9r-comp-sync>
</p9r-section>
```

## No dependency declaration

There is **no** dependency field in `manifest.json` for referenced blocs.
You do not need to list `my-menu-item` as a dependency of `my-menu`. At
runtime, the browser resolves the tag via the global custom element
registry, and the editor's `<p9r-comp-sync>` gives the child bloc the same
editor treatment it would get at top level.

The only requirement: the child bloc must be **deployed on the same CMS
instance**. Deploy order doesn't matter — the editor picks up child blocs
on demand.

This may change in a future manifest version (explicit dependencies are on
the roadmap), but for now, it just works.

## Referencing a child bloc's attributes from the parent

Don't. Each bloc manages its own attributes through its own
`configuration.html`. When the user selects the child bloc inside the
editor, its own configuration panel opens — there is no "parent owns
child's configuration" relationship.

If the parent needs to pass state down to the child, the child should read
it from its own HTML attributes and the user should set those in the child
bloc's panel.

## Circular references

Don't. Bloc A can contain Bloc B, but Bloc B should not contain Bloc A.
The editor does not guard against this, and you will get recursive
editorialization at best, an infinite loop at worst.
