# Conventions — composing blocs

Sub-components no longer exist as a special structure inside a parent bloc.
Instead, any bloc can be used inside any other bloc, just by referring to
its tag. A single bloc can be the child of many parents, or a top-level
bloc on a page — same artifact, same deploy.

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
    <p9r-comp-sync optionnal allow-others-components>
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
