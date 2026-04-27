import type { ControlCms } from "src/control/ControlCms";
import MissingParam from "src/control/errors/Http/MissingParam";
import InvalidParam from "src/control/errors/Http/InvalidParam";

export default async function getSnippet(req: Request, cms: ControlCms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) throw new MissingParam("id");

    const snippet = await cms.repository.getSnippetById(id);
    if (!snippet) throw new InvalidParam("id", "Unknown snippet id.");

    return new Response(JSON.stringify(snippet), {
        headers: { "Content-Type": "application/json" }
    });
}
