export async function generate_bloc_files(pathView: string, pathEditor: string, name: string) {

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

    Bun.file("./dist/"+name+".js").write(viewJS);
    Bun.file("./dist/"+name+"Editor.js").write(editorJS);
    
}