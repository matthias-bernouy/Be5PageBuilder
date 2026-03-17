import { Be5PageBuilder } from "src/Be5PageBuilder";
import { PageModel } from "./model/PageModel";
import { BlocModel } from "./model/BlocModel";


export function getPageRepository(system: Be5PageBuilder){
    return system.getDatabase().getRepository(PageModel)
}

export function getBlocRepository(system: Be5PageBuilder){
    return system.getDatabase().getRepository(BlocModel)
}

