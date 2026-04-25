import type { ControlCms } from "src/control/ControlCms";

export default async function getSystem(_req: Request, cms: ControlCms) {
    const system = await cms.repository.getSystem();
    return new Response(JSON.stringify(system), {
        headers: { "Content-Type": "application/json" },
    });
}
