# PageBuilder

Modular CMS built on Web Components, with an inline visual editing system. Powered by **Bun** and **MongoDB**.

## Architecture

```
src/
├── core/
│   ├── Component/          # Base Component class (HTMLElement + Shadow DOM)
│   ├── Editor/
│   │   ├── core/           # EditorManager, Editor, ObserverManager, DragManager
│   │   ├── components/     # BlocActionGroup, BlocLibrary, FloatingToolbar, RichTextBar
│   │   │                   # PageConfiguration, TemplateConfiguration, AdminLayout, MediaCenter
│   │   ├── configuration/
│   │   │   ├── Sync/       # AttrSync, CompSync, ImageSync
│   │   │   ├── Inputs/     # P9rSelect, P9rRange, P9rPageLink (styled config inputs)
│   │   │   ├── ConfigPanel.ts
│   │   │   └── ConfigItem.ts
│   │   └── editors/        # TextEditor, ImageEditor, ListEditor
│   ├── Domain/
│   │   └── Media/          # CardMedia, GridMedia, DetailMedia, CropSystem
│   └── global.ts
├── interfaces/
│   ├── contract/           # Repository interfaces, data models (TPage, TBloc, TTemplate, TSystem)
│   └── default-provider/   # MongoDB implementations
├── endpoints/
│   ├── admin-ui/           # Admin pages (pages, templates, editor, settings, media)
│   ├── admin-api/          # REST API (pages, templates, media, system, blocs)
│   └── admin-css/          # Design system tokens (oklch, reset)
│
w13c/
├── core/                   # Reusable UI components
│   ├── Form/               # Input, Select, Checkbox, InputFile, InputTags, SegmentedSwitch, Button
│   ├── Dialog/             # LateralDialog, FormDialog
│   ├── Menu/               # LateralMenu, Toolbar
│   ├── Layout/             # LeftMenuLayout, Article, FixedAdminLayout
│   └── Table/              # Table, Row, Cell, HeaderCell
├── blocs/                  # Editable blocs (page builder components)
│   ├── Layout/             # Grid, Container
│   ├── Presentation/       # Card, Quote, Gallery/Image
│   └── Form/               # Button
```

### Key concepts

- **Component**: abstract class extending `HTMLElement`, creates Shadow DOM, injects CSS + template.
- **Editor**: abstract class managing a component's edit mode (action bar, config panel, drag, editor styles).
- **registerEditor**: binds a component tag to its Editor class via the build system.
- **Build placeholders**: `BE5_TAG_TO_BE_REPLACED`, `BE5_LABEL_TO_BE_REPLACED`, `BE5_GROUP_TO_BE_REPLACED` are replaced at build time with actual values.

### Declarative configuration system

Each component's config panel is defined in `configuration.html` with three sync systems:

| Element | Role |
|---|---|
| `<p9r-attr-sync>` | Syncs inputs with HTML attributes on the component |
| `<p9r-comp-sync>` | Manages slots: default content, allowed actions, multiplicity |
| `<p9r-image-sync>` | Image picker via MediaCenter |
| `<p9r-section>` | Visual grouping of controls in the panel |
| `<p9r-select>` | Styled select with label and custom dropdown |
| `<p9r-range>` | Slider with numeric input, fill, min/max bounds |

### Bloc structure (5 files)

```
Card/
├── Card.ts              # Component (extends Component)
├── CardEditor.ts        # Editor (extends Editor + registerEditor)
├── style.css            # Self-contained CSS with local variables
├── template.html        # Semantic HTML with <slot>
└── configuration.html   # Declarative config panel
```

### Content system

| Entity | Description | Admin page |
|---|---|---|
| **Pages** | Published content with path, SEO metadata, visibility | `/admin/pages` |
| **Templates** | Preconfigured element compositions, inserted as independent copies | `/admin/templates` |
| **Snippets** | Synchronized copies shared across pages (upcoming) | — |
| **Media** | Files & folders with upload, crop, metadata editing | `/admin/media` |

### Editor features

- Inline visual editing with drag & drop reordering
- Component library (BlocLibrary) with tabs: Blocs, Templates, Snippets
- Right-click context menu on components (rename, delete)
- MediaCenter for image selection and upload
- Page/Template configuration via lateral dialog panel
- Floating toolbar with mode switching (edit/preview)

---

## API endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/pages` | List all pages |
| POST | `/api/page?identifier=X` | Create/update a page |
| GET | `/api/templates` | List all templates |
| POST | `/api/template` | Create a template |
| POST | `/api/template?id=X` | Update a template |
| DELETE | `/api/template?id=X` | Delete a template |
| GET | `/api/mediaItems` | List media items (with parent filter) |
| POST | `/api/media/file` | Upload a file |
| POST | `/api/media/folder` | Create a folder |
| GET | `/api/media/item?id=X` | Get media item metadata |
| PATCH | `/api/media/item?id=X` | Update media metadata |
| DELETE | `/api/media/item?id=X` | Delete a media item |
| GET | `/api/system` | Get system configuration |
| POST | `/api/system` | Update system configuration |
