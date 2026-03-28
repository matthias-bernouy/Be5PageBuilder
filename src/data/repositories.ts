import { PageBuilder } from "src/PageBuilder";
import { PageModel } from "./model/PageModel";
import { BlocModel } from "./model/BlocModel";
import { SystemModel } from "./model/SystemModel";


export function getPageRepository(system: PageBuilder){
    return system.db.getRepository(PageModel)
}

export function getBlocRepository(system: PageBuilder){
    return system.db.getRepository(BlocModel)
}

export function getSystemRepository(system: PageBuilder){
    return system.db.getRepository(SystemModel)
}