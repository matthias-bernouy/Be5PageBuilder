import { createBloc } from "src/data/mutation/createBloc";
import type { Be5PageBuilder } from "./Be5PageBuilder";


export async function initBlocs(system: Be5PageBuilder){

    const editor = await Bun.build({ entrypoints: [ "src/system/Editor/QuoteEditor.ts" ], target: "browser" });
    const client = await Bun.build({ entrypoints: [ "src/system/Component/Quote/Quote.ts" ], target: "browser" });
    
    createBloc({
        htmlTag: "quote",
        clientJavascript: await client.outputs[0]!.text(),
        editorJavascript: await editor.outputs[0]!.text()
    }, system)

}