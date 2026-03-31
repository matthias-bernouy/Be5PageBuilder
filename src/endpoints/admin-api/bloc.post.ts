import type { PageBuilder } from "src/PageBuilder";
import { prepare_bloc } from "src/server/blocs/prepare_bloc";

export default async function importBloc(req: Request, system: PageBuilder) {

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const group = formData.get("group") as string;
    const viewFile = formData.get("viewJS") as File;
    const editorFile = formData.get("editorJS") as File;

    if (!name || !viewFile || !editorFile) {
        return new Response("Missing argument", { status: 400 });
    }

    const bloc = await prepare_bloc(viewFile, editorFile, name, group);

    await system.repository.createBloc(bloc);

    // Invalider le cache du bloc + toutes les pages qui pourraient l'utiliser
    system.cache.delete(`bloc:${bloc.id}`);

    return new Response("Bloc imported");
}