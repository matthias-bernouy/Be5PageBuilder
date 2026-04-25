import type { ControlCms } from "src/control/ControlCms";

export default async function getPages(req: Request, cms: ControlCms) {

    const all = await cms.repository.getAllPages();

    return new Response(JSON.stringify(all), {
        headers: { "Content-Type": "application/json" },
    });

}