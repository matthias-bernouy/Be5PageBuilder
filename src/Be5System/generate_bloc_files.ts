import { randomUUIDv7 } from "bun";

export async function generate_bloc_files(pathView: string, pathEditor: string, name: string) {

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

    const ceRegex = /customElements\.define\s*\(\s*["'`][^"'`]+["'`]\s*,/g;
    const edRegex = /register_editor\s*\(\s*["'`][^"'`]+["'`]\s*,/g;

    const finalViewJS = viewJS.replace(ceRegex, `customElements.define("${blocId}",`);

    let finalEditorJS = editorJS.replace(ceRegex, `customElements.define("${blocId}",`);
    finalEditorJS = finalEditorJS.replace(edRegex, `register_editor("${blocId}",`);

    Bun.file("./dist/"+name+".js").write(finalViewJS);
    Bun.file("./dist/"+name+"Editor.js").write(finalEditorJS);
    
}