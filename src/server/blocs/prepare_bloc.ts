import { randomUUIDv7 } from "bun";
import { rmSync } from "node:fs";

export async function prepare_bloc(fileView: File, fileEditor: File, label: string, group: string) {
    const blocId = `be5-${randomUUIDv7()}`;

    const buildOptions = (entry: string) => ({
        entrypoints: [entry],
        target: "browser" as const,
        format: "iife" as const,
    });

    await Bun.write("./tmp/"+blocId+".js"      , fileView);
    await Bun.write("./tmp/"+blocId+"Editor.js", fileEditor);

    const [viewBuild, editorBuild] = await Promise.all([
        Bun.build(buildOptions("./tmp/"+blocId+".js")),
        Bun.build(buildOptions("./tmp/"+blocId+"Editor.js"))
    ]);

    let viewJS = await viewBuild.outputs[0]?.text() || "";
    let editorJS = await editorBuild.outputs[0]?.text() || "";

    viewJS = viewJS.replaceAll("BE5_TAG_TO_BE_REPLACED", blocId);

    editorJS = editorJS
        .replaceAll("BE5_TAG_TO_BE_REPLACED", blocId)
        .replaceAll("BE5_LABEL_TO_BE_REPLACED", label)
        .replaceAll("BE5_GROUP_TO_BE_REPLACED", group)

    return {
        id: blocId,
        editorJS: editorJS,
        viewJS: viewJS,
        name: label
    };

}