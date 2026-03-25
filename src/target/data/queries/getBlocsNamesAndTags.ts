import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { getBlocRepository } from "../repositories";


export async function getBlocsNamesAndTags(system: Be5PageBuilder){
    const repo = getBlocRepository(system);
        return await repo.findAll({
        fields: ['id', 'name'] as any
    });
}