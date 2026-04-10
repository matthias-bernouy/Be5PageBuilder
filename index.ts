/**
 * be5-pagebuilder — public entry point.
 *
 * Consumers import from `be5-pagebuilder` and get the `PageBuilder` class
 * plus the default MongoDB-backed providers. Host apps wire their own
 * `Be5_Runner` + `Authentication` (from `@bernouy/socle`) and pass them in.
 *
 * See `App.ts` at the root of this repo for a reference wiring.
 */

// ── Core ────────────────────────────────────────────────────────────────
export { PageBuilder } from "./src/PageBuilder";

// ── Default providers (MongoDB + in-memory cache) ──────────────────────
export { DefaultPageBuilderRepository } from "./src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";
export { DefaultMediaRepository } from "./src/interfaces/default-provider/Media/DefaultMediaRepository";
export { InMemoryCache } from "./src/interfaces/default-provider/Cache/InMemoryCache";

// Browser-safe bloc authoring symbols are deliberately split into two
// sub-entries:
//   • `@bernouy/pagebuilder/component` — exposes only `Component`.
//     Imported by `Bloc.ts` and included in the view bundle visitors download.
//   • `@bernouy/pagebuilder/editor`    — exposes `Editor`, `registerEditor`,
//     `registerEditor_opaque`. Imported by `BlocEditor.ts` and included in
//     the editor bundle that only the admin loads.
// Keeping the two entries isolated guarantees the view bundle never drags
// editor-side code (ObserverManager, ConfigPanel, …) into what visitors see.
// Neither entry is re-exported from this barrel — importing them alongside
// `PageBuilder` would force consumers to pull the whole MongoDB runtime into
// every browser bundle.

// ── Contracts (for consumers who want to swap in a custom backend) ─────
export type { PageBuilderRepository } from "./src/interfaces/contract/Repository/PageBuilderRepository";
export type { MediaRepository } from "./src/interfaces/contract/Media/MediaRepository";
export type { Cache } from "./src/interfaces/contract/Cache/Cache";
export type {
    TPage,
    TBloc,
    TTemplate,
    TSnippet,
    TSystem,
} from "./src/interfaces/contract/Repository/TModels";

// ── Seeding CLI (importable for programmatic use) ──────────────────────
export { default as importBlocs } from "./src/cli/CLI_importBloc";
