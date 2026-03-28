import { Be5_MongoDB } from "be5-interfaces"
import { generate_bloc_files } from "src/Be5System/blocs/generate_bloc_files";
import { prepare_bloc } from "src/Be5System/blocs/prepare_bloc";
import { BlocModel } from "src/data/model/BlocModel";
import { join } from "path";

export default async function CLI_importBloc(args: string[]) {

    const [path, name, group] = args;
    const cwd = process.cwd();

    if (!path || !name || !group) {
        console.error("Usage: import_bloc_cli <path> <name> <group>");
        process.exit(1);
    }

    const MongoDatabaseCore = new Be5_MongoDB();
    MongoDatabaseCore.addSchema(BlocModel);
    await MongoDatabaseCore.init({
        dbName: 'testttt',
        clientUrl: 'mongodb://localhost:27017/',
    })


    const repo = MongoDatabaseCore.getRepository(BlocModel);

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

    const blocInstance = repo.create(bloc);
    await repo.getEntityManager().persist(blocInstance).flush();

    MongoDatabaseCore.close();

}

try{
    await CLI_importBloc(process.argv.slice(2));

} catch(e){
    console.error("Error importing bloc:", e);
    process.exit(1);
}