# Conventions — responsive design

A bloc that overflows horizontally at 360 px, or whose positioned panel
sticks out of the viewport, is **broken**, not "to be improved later".
Responsive is not a polish pass — it is part of the initial CSS.

This file is mandatory reading before writing `style.css`. Every rule
below is non-negotiable.

## Hard rules

### R1. No horizontal overflow at 360 px, ever

The document's `scrollWidth` must equal its `clientWidth` at every tested
viewport (360 / 480 / 768 / 1280). A bloc that forces a horizontal
scrollbar is a P0 bug.

Audit the bloc at 360 px **before** declaring it done. If it overflows,
pick the right fix from the three patterns below — don't just add
`overflow: hidden` on the host, that hides the bug, it doesn't fix it.

### R2. Horizontal flex rows must handle overflow explicitly

Every `display: flex` that lays children out horizontally (`flex-direction`
is `row` by default) has to choose **one** of these three strategies, and
the choice must be conscious:

- **Wrap** — `flex-wrap: wrap` + `gap` handles short rows that can break
  onto a second line (pills, tags, badges, small CTAs).
- **Stack on mobile** — a `@media (max-width: 720px)` rule switches the
  container to `flex-direction: column` (navbars, toolbars, pricing
  rows).
- **Scroll** — `overflow-x: auto` + `scroll-snap-type` on the container,
  for horizontal carousels where scroll is the intent. Never the
  fallback for "I didn't know what to do".

A bare horizontal `display: flex` with neither wrap, stack, nor scroll is
**forbidden**. Pick one.

### R3. Flex children need `min-width: 0`

Flex children default to `min-width: auto`, which refuses to shrink below
their intrinsic content width. Long words, URLs, or inline images then
push the row wider than its container.

```css
.item {
    min-width: 0;    /* required so the child can actually shrink */
    flex: 1 1 auto;
}
```

Apply this on any flex child whose content can grow (text slots, link
lists, user-provided labels). Forgetting this is the #1 cause of "my
navbar overflows only when someone writes a long menu label".

### R4. Positioned panels must be clamped to the viewport

A dropdown or mega-menu panel with `position: absolute` and `left: 0`
will overflow the viewport when the trigger button is near the right
edge. The fix is **two** constraints, both required:

```css
.panel {
    position: absolute;
    top: calc(100% + 6px);

    /* 1. Width is bounded by the viewport */
    max-width: min(100vw - 16px, 720px);
    width: max-content;

    /* 2. Horizontal position never pokes past the edge */
    left: clamp(8px, 0px, calc(100vw - 100% - 8px));
}
```

Or, for a panel meant to center under its trigger:

```css
.panel {
    left: 50%;
    transform: translateX(-50%);
    max-width: min(100vw - 16px, 720px);
}
```

Never ship a panel with a naked `min-width: 240px` and no `max-width`.
Never ship `left: 0` without a right-edge guard.

If the panel needs to align to the *right* edge of its trigger (e.g.
a user-menu popped from the top-right), use `right: 0; left: auto` and
the same `max-width` bound.

### R5. No fixed widths on content containers

A container that holds user text or images must not have a fixed `width`
in pixels. Use `max-width` + `width: 100%`, or `clamp()`, or nothing at
all.

```css
/* wrong */
.card   { width: 400px; }

/* right */
.card   { width: 100%; max-width: 400px; }
.banner { max-width: clamp(320px, 90vw, 1080px); }
```

### R6. Images inside the bloc are fluid by default

Every `<img>` in `template.html` or `::slotted(img)` must be allowed to
shrink:

```css
::slotted(img),
img {
    display: block;
    max-width: 100%;
    height: auto;
}
```

Fixed-size images (`width="800"` with no CSS constraint) break the layout
on narrow screens.

### R7. Navbars, toolbars, heros — mandatory mobile behavior

If the bloc is a horizontal composition of several children (nav, toolbar,
header with actions, hero with CTAs), it **must** do one of:

- Switch to a vertical stack on `max-width: 720px`.
- Collapse into a disclosure (hamburger + slide-in panel).
- Wrap via `flex-wrap: wrap` with explicit gaps.

Without a mobile strategy, the bloc is unfinished. "Desktop only" is not
an acceptable default in the PageBuilder.

### R8. Canonical breakpoints

Stick to these so themes compose predictably across blocs:

| Breakpoint | Media query | Use for |
|---|---|---|
| Mobile | `@media (max-width: 480px)` | last-resort stacking, kill paddings |
| Tablet | `@media (max-width: 720px)` | primary "go vertical" breakpoint |
| Small desktop | `@media (max-width: 1024px)` | narrow hero adjustments |

Prefer `max-width` queries (mobile-first mental model still possible
via cascade). Do not invent per-bloc breakpoints at 737 px or 812 px.

### R9. Typography scales must be fluid or capped

Large headings (`font-size: 3rem`) break on 360 px. Use `clamp()`:

```css
h2 { font-size: clamp(1.25rem, 2vw + 1rem, 2.25rem); }
```

Or a dedicated mobile breakpoint that downsizes. Never hardcode a
desktop type scale and hope for the best.

### R10. Long text must wrap cleanly

Slotted text from the user can contain long URLs, unbroken strings,
language-specific compound words. Use:

```css
::slotted([slot="text"]) {
    overflow-wrap: anywhere;
    word-break: normal;
}
```

`overflow-wrap: anywhere` is the safe default; avoid `word-break: break-all`
which makes Latin text ugly. For headings, `text-wrap: balance` if you
target modern browsers.

## Testing matrix

Every bloc must be eyeballed at these widths with DevTools responsive
mode **before** checking it in. This maps to section D of
`conventions/verification.md`:

| Width | What to check |
|---|---|
| 360 px | No horizontal scroll. Text wraps. CTAs reachable. |
| 480 px | Navbars have started their mobile behavior (stack / burger). |
| 720 px | Tablet breakpoint kicked in. Columns resized gracefully. |
| 1024 px | Desktop layout without content being too sparse. |
| 1280 px | Canonical desktop baseline. |
| Zoom 200 % | Still legible. Catches pixel-fixed layouts. |

If the bloc has an openable panel (`p9r-state-sync`-pinnable states),
run the matrix again with the panel **open** at each width — that is
where overflow bugs actually appear.

## Anti-patterns to refuse on sight

- `min-width: 240px` on a positioned panel with no `max-width`.
- `width: 800px` on a container meant to hold user content.
- `display: flex` with no wrap / stack / scroll plan.
- `font-size: 3rem` without `clamp()` or a mobile override.
- `overflow: hidden` used to mask a layout bug instead of fix it.
- A navbar with horizontal items and no behavior below 720 px.
- A `position: absolute` panel with `left: 0` and nothing bounding
  `right`.

If any of these appear in a draft, the draft is not ready to be
verified — rewrite the rule first.
