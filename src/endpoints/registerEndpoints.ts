import { send_css, send_html, send_js, type Be5System } from "be5-system";
import { join } from "node:path"

import clientHTML from "./content/client.html" with { type: "text" };
import editorHTML from "./content/editor.html" with { type: "text" };
import editorCSS from "./content/editor.css" with { type: "text" };


export function registerEndpoints(system: Be5System){

    // Client
    // system.registerEndpoint("/article", "GET", (req: Request) => {
    //     return send_html(clientHTML as unknown as string);
    // })

    // system.registerEndpoint("/assets/article-client.js", "GET", async (req: Request) => {
    //     const js = await Bun.build({
    //         entrypoints: [ join(__dirname, "./content/editor.ts") ]
    //     })
    //     return send_js(await js.outputs[0]?.text() || "");
    // })



    // Administration
    system.registerEndpoint("/admin/article", "GET", (req: Request) => {
        return send_html(editorHTML as unknown as string);
    })

    system.registerEndpoint("/assets/editor.css", "GET", (req: Request) => {
        return send_css(editorCSS as unknown as string);
    })

    system.registerEndpoint("/assets/article-editor.js", "GET", async (req: Request) => {
        const js = await Bun.build({
            entrypoints: [ join(__dirname, "./content/editor.ts") ],
            minify: true
        })

        return send_js(await js.outputs[0]?.text() || "")
    })

}