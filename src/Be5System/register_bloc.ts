import { randomUUIDv7 } from "bun";
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { BlocModel } from "src/target/data/model/BlocModel";

export async function register_bloc(pathView: string, pathEditor: string, name: string, system: Be5PageBuilder) {
    const repo = system.db.getRepository(BlocModel);
    const blocId = `be5-${randomUUIDv7()}`;

    const buildOptions = (entry: string) => ({
        entrypoints: [entry],
        target: "browser" as const,
        format: "iife" as const,
    });

    const [viewBuild, editorBuild] = await Promise.all([
        Bun.build(buildOptions(pathView)),
        Bun.build(buildOptions(pathEditor))
    ]);

    const viewJS = await viewBuild.outputs[0]?.text() || "";
    const editorJS = await editorBuild.outputs[0]?.text() || "";

    // --- REGEX 1 : Custom Elements standard ---
    // Cible : customElements.define("n'importe-quoi", ...
    const ceRegex = /customElements\.define\s*\(\s*["'`][^"'`]+["'`]\s*,/g;
    
    // --- REGEX 2 : Ton EditorManager ---
    // Cible : .register_editor("n'importe-quoi", ...
    const edRegex = /register_editor\s*\(\s*["'`][^"'`]+["'`]\s*,/g;

    // Application sur le JS de la Vue
    const finalViewJS = viewJS.replace(ceRegex, `customElements.define("${blocId}",`);

    // Application sur le JS de l'Editeur (on fait les deux remplacements)
    let finalEditorJS = editorJS.replace(ceRegex, `customElements.define("${blocId}",`);
    finalEditorJS = finalEditorJS.replace(edRegex, `register_editor("${blocId}",`);

    const item = repo.create({
        id: blocId,
        editorJS: finalEditorJS,
        viewJS: finalViewJS,
        name: name
    });

    await repo.getEntityManager().persist(item).flush();
    
}