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
