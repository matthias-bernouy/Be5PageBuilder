#!/usr/bin/env bun
import CLI_importBloc from "./CLI_importBloc";
import CLI_dev from "./CLI_dev";

const [command, ...rest] = process.argv.slice(2);

function printHelp() {
    console.log(`p9r — PageBuilder CLI

Usage:
  p9r dev                                         Run the local editor against a remote CMS
  p9r import <db> <parentPath> <group> [--tag=<htmlTag>]
                                                  Import blocs from a folder into a MongoDB instance
  p9r help                                        Show this help

Env (for 'p9r dev', loaded from .env or the environment):
  P9R_URL      Base URL of the remote PageBuilder CMS
  P9R_TOKEN    Bearer token used to authenticate as an admin
`);
}

try {
    switch (command) {
        case "dev":
            await CLI_dev(rest);
            break;
        case "import":
            await CLI_importBloc(rest);
            console.log("Done.");
            break;
        case undefined:
        case "help":
        case "--help":
        case "-h":
            printHelp();
            break;
        default:
            console.error(`Unknown command: ${command}\n`);
            printHelp();
            process.exit(1);
    }
} catch (e) {
    console.error("Global Error:", e);
    process.exit(1);
}
