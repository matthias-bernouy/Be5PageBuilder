import { generate_bloc_files } from "src/server/blocs/generate_bloc_files";
import { prepare_bloc } from "src/server/blocs/prepare_bloc";
import { join } from "path";
import { readdir, stat } from "node:fs/promises";
import { DefaultPageBuilderRepository } from "src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";
import { MongoClient } from "mongodb";
import { rmSync } from "node:fs";

/**
 * Traite un seul bloc (la logique originale)
 */
async function importSingleBloc(repo: DefaultPageBuilderRepository, basePath: string, name: string, group: string, tag?: string) {
    const cwd = process.cwd();

    console.log(`Processing bloc: ${name} in group ${group}${tag ? ` (tag: ${tag})` : ""}...`);

    await generate_bloc_files(
        join(cwd, basePath, name, name + ".ts"),
        join(cwd, basePath, name, name + "Editor.ts"),
        name
    );

    const bloc = await prepare_bloc(
        Bun.file(join(cwd, './dist', name + ".js")) as unknown as File,
        Bun.file(join(cwd, "./dist", name + "Editor.js")) as unknown as File,
        name,
        group,
        tag
    );

    await repo.createBloc(bloc);
}

export default async function CLI_importBloc(args: string[]) {
    const positional: string[] = [];
    let tag: string | undefined;

    for (const arg of args) {
        if (arg.startsWith("--tag=")) {
            tag = arg.slice("--tag=".length);
        } else {
            positional.push(arg);
        }
    }

    const [db, parentPath, group] = positional;
    const cwd = process.cwd();

    if (!db || !parentPath || !group) {
        console.error("Usage: import_bloc_cli <db> <parentPath> <group> [--tag=<htmlTag>]");
        console.error("Example: import_bloc_cli myDb ./w13c/ ui-components --tag=be5-my-bloc");
        process.exit(1);
    }

    const mongoClient = await new MongoClient("mongodb://localhost:27017").connect();
    const MongoClientDefault = new DefaultPageBuilderRepository(mongoClient, db);

    try {
        const fullParentPath = join(cwd, parentPath);
        const entries = await readdir(fullParentPath);

        for (const entry of entries) {
            const entryPath = join(fullParentPath, entry);
            const check = await stat(entryPath);

            // Only process directories
            if (check.isDirectory()) {
                try {
                    console.log(`\n🔍 Importing bloc from folder: ${entry}...`);
                    console.log(`\n🔍 Importing bloc from parent: ${parentPath}...`);
                    // Pass 'parentPath' and the folder name 'entry' as bloc name
                    await importSingleBloc(MongoClientDefault, parentPath, entry, group, tag);
                    console.log(`✅ Successfully imported: ${entry}`);
                } catch (err) {
                    console.error(`❌ Failed to import bloc "${entry}":`, err instanceof Error ? err.message : String(err));
                }
            }
        }
    } finally {
        await mongoClient.close();
            rmSync("./tmp", { recursive: true, force: true });
            rmSync("./dist", { recursive: true, force: true });
    }
}