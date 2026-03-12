import type { Be5PageBuilder } from "src/plugin/Be5PageBuilder";
import { getBlocRepository } from "../repositories";


export async function getBlocsTags(system: Be5PageBuilder){
    const repo = getBlocRepository(system);
    const res = await repo.findAll();
    return res.map((r) => r.htmlTag);
}