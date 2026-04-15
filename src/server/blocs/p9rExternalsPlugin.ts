import type { BunPlugin } from "bun";

/**
 * Bloc bundles must not re-bundle `@bernouy/pagebuilder/component` or
 * `/editor`. Those base classes are shipped once per page via
 * `src/core/global.ts`, which installs them on `window.p9r`. This plugin
 * rewrites the two import specifiers to read from that global, so each
 * bloc's compiled JS contains only its own code.
 */
export const p9rExternalsPlugin: BunPlugin = {
    name: "p9r-externals",
    setup(build) {
        build.onResolve(
            { filter: /^@bernouy\/pagebuilder\/(component|editor)$/ },
            (args) => ({ path: args.path, namespace: "p9r-extern" }),
        );

        build.onLoad(
            { filter: /.*/, namespace: "p9r-extern" },
            (args) => {
                if (args.path === "@bernouy/pagebuilder/component") {
                    return {
                        contents: `export const Component = window.p9r.Component;`,
                        loader: "js",
                    };
                }
                return {
                    contents:
                        `export const Editor = window.p9r.Editor;\n` +
                        `export const registerEditor = window.p9r.registerEditor;\n` +
                        `export const registerEditor_opaque = window.p9r.registerEditor_opaque;\n`,
                    loader: "js",
                };
            },
        );
    },
};
