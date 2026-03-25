import { send_js } from "be5-system";
import { getEditorBlocsJavascript } from "src/target/data/queries/getEditorBlocsJavascript";
import type { Be5PageBuilder } from "src/Be5PageBuilder";

export default async function EditorServerJavascript(req: Request, system: Be5PageBuilder) {

    const blocs = await getEditorBlocsJavascript(system);

const script = blocs.map(bloc => {
    return `
        (function() {
            const init = () => {
                // On vérifie si l'EditorManager est bien présent sur le document
                if (window.document && document.EditorManager) {
                    try {
                        ${bloc.editorJS}
                    } catch (e) {
                        console.error("Erreur lors de l'exécution du bloc ${bloc.name}:", e);
                    }
                } else {
                    // Si pas encore là, on attend 10ms et on réessaie
                    setTimeout(init, 10);
                }
            };
            init();
        })();
    `;
}).join("\n");

    return send_js(script);
}