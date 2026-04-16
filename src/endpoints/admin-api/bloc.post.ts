import type { PageBuilder } from "src/PageBuilder";
import { prepare_bloc } from "src/server/blocs/prepare_bloc";
import { P9R_CACHE } from "types/p9r-constants";

// Custom-element name rules (HTML spec) — lowercase start letter, at least
// one dash, alnum/dash after. Locked to a conservative subset so the tag
// can also be used safely as a filesystem path by `prepare_bloc`.
const CUSTOM_ELEMENT_TAG = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;

export default async function importBloc(req: Request, system: PageBuilder) {

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const group = formData.get("group") as string;
    const description = (formData.get("description") as string | null) || "";
    const tag = formData.get("tag") as string | null;
    const viewFile = formData.get("viewJS") as File;
    const editorEntry = formData.get("editorJS");
    const editorFile = editorEntry instanceof File ? editorEntry : null;
    const force = formData.get("force") === "true";

    if (!name || !viewFile || !tag) {
        return new Response("Missing argument (name, tag, viewJS required)", { status: 400 });
    }

    if (!CUSTOM_ELEMENT_TAG.test(tag)) {
        return new Response(
            `Invalid tag "${tag}" — must be a lowercase custom-element name (e.g. "my-card").`,
            { status: 400 },
        );
    }

    const existing = await system.repository.getBlocViewJS(tag);
    if (existing !== null && !force) {
        return new Response(`Bloc with tag "${tag}" already exists`, { status: 409 });
    }

    const bloc = await prepare_bloc(viewFile, editorFile, name, group, description, tag);

    try {
        if (force) await system.repository.replaceBloc(bloc);
        else       await system.repository.createBloc(bloc);
    } catch (e) {
        if (!force && (e as { code?: number }).code === 11000) {
            return new Response(`Bloc with tag "${bloc.id}" already exists`, { status: 409 });
        }
        throw e;
    }

    // Invalidate caches: per-bloc view bundle, and the editor-blocs
    // concatenation that bundles every bloc's editorJS into one script.
    system.cache.delete(P9R_CACHE.bloc(bloc.id));
    system.cache.delete(P9R_CACHE.EDITOR_BLOCS);

    return new Response("Bloc imported");
}