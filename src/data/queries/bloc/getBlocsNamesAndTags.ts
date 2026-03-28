import type { PageBuilder } from "src/PageBuilder";
import { getBlocRepository } from "../../repositories";

export async function getBlocsNamesAndTags(system: PageBuilder){
    const repo = getBlocRepository(system);
        return await repo.findAll({
        fields: ['id', 'name'] as any
    });
}