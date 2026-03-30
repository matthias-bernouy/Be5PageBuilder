import { generate_bloc_files } from "src/Be5System/blocs/generate_bloc_files";
import { prepare_bloc } from "src/Be5System/blocs/prepare_bloc";
import { join } from "path";
import { DefaultPageBuilderRepository } from "src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";
import { MongoClient } from "mongodb";

export default async function CLI_importBloc(args: string[]) {

    const [db, path, name, group] = args;
    const cwd = process.cwd();

    if (!db || !path || !name || !group) {
        console.error("Usage: import_bloc_cli <path> <name> <group>");
        process.exit(1);
    }

    const mongoClient =  await new MongoClient("mongodb://localhost:27017").connect();
    const MongoClientDefault = new DefaultPageBuilderRepository(mongoClient, db)

    await generate_bloc_files(
        join(cwd, path, name, name + ".ts"),
        join(cwd, path, name, name + "Editor.ts"),
        name
    );

    const bloc = await prepare_bloc(
        Bun.file(join(cwd, './dist', name + ".js")) as unknown as File,
        Bun.file(join(cwd, "./dist", name + "Editor.js")) as unknown as File,
        name,
        group
    );

    await MongoClientDefault.createBloc(bloc);

    mongoClient.close()

}

try{
    await CLI_importBloc(process.argv.slice(2));

} catch(e){
    console.error("Error importing bloc:", e);
    process.exit(1);
}