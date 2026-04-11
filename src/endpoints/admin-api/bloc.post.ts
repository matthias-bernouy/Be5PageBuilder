import type { PageBuilder } from "src/PageBuilder";
import { prepare_bloc } from "src/server/blocs/prepare_bloc";
import { P9R_CACHE } from "types/p9r-constants";

export default async function importBloc(req: Request, system: PageBuilder) {

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const group = formData.get("group") as string;
    const description = (formData.get("description") as string | null) || "";
    const tag = formData.get("tag") as string | null;
    const viewFile = formData.get("viewJS") as File;
    const editorEntry = formData.get("editorJS");
    const editorFile = editorEntry instanceof File ? editorEntry : null;

    if (!name || !viewFile || !tag) {
        return new Response("Missing argument (name, tag, viewJS required)", { status: 400 });
    }

    // Refuse to overwrite an existing bloc. Clients must explicitly delete the
    // old bloc (via the admin UI) before re-importing with the same tag.
    const existing = await system.repository.getBlocViewJS(tag);
    if (existing !== null) {
        return new Response(`Bloc with tag "${tag}" already exists`, { status: 409 });
    }

    const bloc = await prepare_bloc(viewFile, editorFile, name, group, description, tag);

    try {
        await system.repository.createBloc(bloc);
    } catch (e) {
        // Mongo duplicate-key — the unique index on `id` caught a race between
        // the pre-check above and the insert. Same outcome as the pre-check.
        if ((e as { code?: number }).code === 11000) {
            return new Response(`Bloc with tag "${bloc.id}" already exists`, { status: 409 });
        }
        throw e;
    }

    // Invalidate the bloc cache
    system.cache.delete(P9R_CACHE.bloc(bloc.id));

    return new Response("Bloc imported");
}