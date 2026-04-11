# Template — `BlocEditor.ts`

The minimal shape of an editor class. Export **only** the class — no
`registerEditor` call, no tag constant.

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

## With editor-mode CSS

Pass a CSS string as the second arg of `super(...)` to adjust the bloc's
appearance during editing only (e.g. disable hover effects, cancel transforms
so drag handles stay visible). These styles are scoped to edit mode.

```ts
import { Editor } from '@bernouy/pagebuilder/editor';
import Config from './configuration.html' with { type: 'text' };

const editorStyles = `
    .card:hover {
        transform: unset;
        box-shadow: unset;
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

See `conventions/editor.md` for the abstract contract (`init` / `restore` are
required even when empty) and when to pass editor-mode CSS.
