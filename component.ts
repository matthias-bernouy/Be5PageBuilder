/**
 * be5-pagebuilder — view-side authoring entry point.
 *
 * `Bloc.ts` files import `Component` from `@bernouy/cms/component`.
 * This entry deliberately re-exports *only* the base class needed to author
 * the view side of a bloc. Nothing editor-related (Editor, registerEditor,
 * ObserverManager, …) is reachable from this entry — even transitively — so
 * the bundle that visitors download never contains editor code.
 */
export { Component } from "./src/core/Editor/core/Component";
