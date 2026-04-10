import type { PageBuilder } from "src/PageBuilder";
import { prepare_bloc } from "src/server/blocs/prepare_bloc";
import { P9R_CACHE } from "types/p9r-constants";

export default async function importBloc(req: Request, system: PageBuilder) {

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const group = formData.get("group") as string;
    const viewFile = formData.get("viewJS") as File;
    const editorEntry = formData.get("editorJS");
    const editorFile = editorEntry instanceof File ? editorEntry : null;

    if (!name || !viewFile) {
        return new Response("Missing argument", { status: 400 });
    }

    const bloc = await prepare_bloc(viewFile, editorFile, name, group);

    await system.repository.createBloc(bloc);

    // Invalidate the bloc cache
    system.cache.delete(P9R_CACHE.bloc(bloc.id));

    return new Response("Bloc imported");
}