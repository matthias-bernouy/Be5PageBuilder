import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { prepare_bloc } from "src/Be5System/blocs/prepare_bloc";
import { BlocModel } from "src/target/data/model/BlocModel";

export default async function importBloc(req: Request, system: Be5PageBuilder) {

    const formData = await req.formData();


    const name = formData.get("name") as string;
    const group = formData.get("group") as string;
    const viewFile = formData.get("viewJS") as File;
    const editorFile = formData.get("editorJS") as File;

    if (!name || !viewFile || !editorFile) {
        return new Response("Missing argument", { status: 400 });
    }

    const bloc = await prepare_bloc(viewFile, editorFile, name, group);

    const repo = system.db.getRepository(BlocModel);

    const item = repo.create(bloc);

    await repo.getEntityManager().persist(item).flush();

    return new Response("Bloc imported");
}