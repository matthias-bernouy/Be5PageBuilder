/**
 * @bernouy/cms — public entry point.
 *
 * Consumers import from `@bernouy/cms` and get the `Cms` class
 * plus the default MongoDB-backed providers. Host apps wire their own
 * `Be5_Runner` + `Authentication` (from `@bernouy/socle`) and pass them in.
 *
 * See `App.ts` at the root of this repo for a reference wiring.
 */

// ── Core ────────────────────────────────────────────────────────────────
export { Cms } from "./src/Cms";

// ── Default providers (MongoDB + in-memory cache) ──────────────────────
export { DefaultCmsRepository } from "./src/providers/mongo/Repository/DefaultCmsRepository";
export { DefaultMediaRepository } from "./src/providers/mongo/Media/DefaultMediaRepository";
export { InMemoryCache } from "./src/providers/memory/Cache/InMemoryCache";

// Browser-safe bloc authoring symbols are deliberately split into two
// sub-entries:
//   • `@bernouy/cms/component` — exposes only `Component`.
//     Imported by `Bloc.ts` and included in the view bundle visitors download.
//   • `@bernouy/cms/editor`    — exposes `Editor`, `registerEditor`,
//     `registerEditor_opaque`. Imported by `BlocEditor.ts` and included in
//     the editor bundle that only the admin loads.
// Keeping the two entries isolated guarantees the view bundle never drags
// editor-side code (ObserverManager, ConfigPanel, …) into what visitors see.
// Neither entry is re-exported from this barrel — importing them alongside
// `Cms` would force consumers to pull the whole MongoDB runtime into
// every browser bundle.

// ── Contracts (for consumers who want to swap in a custom backend) ─────
export type { CmsRepository } from "./src/contracts/Repository/CmsRepository";
export type { MediaRepository } from "./src/contracts/Media/MediaRepository";
export type { Cache } from "./src/contracts/Cache/Cache";
export type {
    TPage,
    TBloc,
    TTemplate,
    TSnippet,
    TSystem,
} from "./src/contracts/Repository/TModels";

// ── Seeding CLI (importable for programmatic use) ──────────────────────
export { default as importBlocs } from "./src/cli/CLI_importBloc";
