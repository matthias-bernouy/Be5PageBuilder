import { parseHTML } from "linkedom";
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { join } from "node:path"
import { getBlocsTags } from "src/target/data/queries/getBlocsTags";
import { getPage } from "src/target/data/queries/getPage";
import { send_html } from "be5-system";

export default async function ViewPageServer(req: Request, system: Be5PageBuilder){
    const html = await Bun.file(join(__dirname, "./index.html")).text();
    const { document } = parseHTML(html);

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";

    const scriptsPromise = getBlocsTags(system).then((blocs) => {
        const scripts: HTMLScriptElement[] = [];
        blocs.forEach((bloc) => {
            let script = document.createElement("script");
            script.src = "/bloc?tag="+bloc;
            scripts.push(script);
        })
        return scripts;
    });

    const pagePromise = getPage(system, identifier);

    const [scripts, page] = await Promise.all([scriptsPromise, pagePromise]);

    if (!page){
        return Response.error();
    }

    document.body.innerHTML = page.content;
    document.body.append(...scripts);

    return send_html(document.toString())

}