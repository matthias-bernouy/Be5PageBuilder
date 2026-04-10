/**
 * be5-pagebuilder — browser-safe entry point.
 *
 * Bloc authors import `Component`, `Editor`, and `registerEditor` from
 * `@bernouy/pagebuilder/client`. This entry deliberately re-exports only
 * the symbols that are safe to bundle for the browser — no MongoDB, no
 * server runtime, no Node/Bun builtins. Server code lives in the default
 * `@bernouy/pagebuilder` export.
 */
export { Component } from "./src/core/Editor/core/Component";
export { Editor } from "./src/core/Editor/core/Editor";
export { registerEditor, registerEditor_opaque } from "./src/core/Editor/core/registerEditor";
