import { pages, type PageDefinition } from "src/data/Pages";

export default async function updatePage(req: Request) {

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier") || "";
    const path = url.searchParams.get("path") || "/article";

    const newPage: PageDefinition = {
        path: path,
        identifier: identifier,
        title: "New Page",
        content: await req.text()
    };

    pages.set(identifier, newPage);

    return new Response("");
}