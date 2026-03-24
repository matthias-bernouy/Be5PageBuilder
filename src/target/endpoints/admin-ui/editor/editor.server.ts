import { send_js } from "be5-system";
import { getEditorBlocsJavascript } from "src/target/data/queries/getEditorBlocsJavascript";
import type { Be5PageBuilder } from "src/Be5PageBuilder";

export default async function EditorServerJavascript(req: Request, system: Be5PageBuilder) {

    const blocs = await getEditorBlocsJavascript(system);

    const script = blocs.map(bloc => {
        return `
            ${bloc.editorJS}
        `
    }).join("\n")

    return send_js(script);
}