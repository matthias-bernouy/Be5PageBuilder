import type { PageBuilder } from "src/PageBuilder";
import { getBlocRepository } from "../../repositories";

export async function getClientBlocJavascript(system: PageBuilder, htmlTag: string){
    const repo = getBlocRepository(system);
    const res = await repo.findOne({
        id: htmlTag
    })
    return res?.viewJS;
}