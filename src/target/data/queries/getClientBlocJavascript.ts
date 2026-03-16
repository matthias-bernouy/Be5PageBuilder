import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { getBlocRepository } from "../repositories";

export async function getClientBlocJavascript(system: Be5PageBuilder, htmlTag: string){
    const repo = getBlocRepository(system);
    const res = await repo.findOne({
        htmlTag: htmlTag
    })
    return res?.clientJavascript;
}