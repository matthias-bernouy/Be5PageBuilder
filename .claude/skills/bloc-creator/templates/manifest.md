# Template — `manifest.json`

The manifest is the source of truth for a bloc. Every field below except the
ones marked *optional* must be set.

```json
{
    "runtime": "0.0.1",
    "bloc": "./Bloc.ts",
    "editor": "./BlocEditor.ts",

    "default-tag": "my-bloc",
    "default-group": "Content",

    "meta": {
        "author": "Your Name",
        "title": "My bloc",
        "description": "A short description of what this bloc does.",
        "categories": ["category-1"],
        "thumbnail": "./assets/thumbnail.svg",
        "images": [
            "./assets/preview-1.svg"
        ]
    }
}
```

## Field purpose (short)

| Field | Required | Purpose |
|---|---|---|
| `runtime` | yes | Manifest schema version. Always `"0.0.1"` for now. |
| `bloc` | yes | Path to the view entry (`./Bloc.ts`). |
| `editor` | no | Path to the editor entry. Omit for an **opaque bloc**. |
| `default-tag` | yes | Custom element tag. Globally unique. Also the DB key. |
| `default-group` | yes | Group label in the bloc library sidebar. |
| `meta.*` | no | All optional. Drives the library UI and future public catalog. |

See `conventions/manifest.md` for details.
