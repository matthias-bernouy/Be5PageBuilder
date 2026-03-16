import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { getPageRepository } from "../repositories";
import type { IPage } from "../model/PageModel";

export async function getPage(system: Be5PageBuilder, identifier: string){
    const repo = getPageRepository(system);
    const res = await repo.findOne({
        identifier: identifier
    })
    return res as IPage | null;
}