import type { PageBuilder } from "src/PageBuilder";
import { SystemModel, type ISystem } from "../../model/SystemModel";

export async function getSystemConfig(system: PageBuilder){
    const repo = system.db.getRepository(SystemModel);
    const sys = await repo.findOne({
        id: {
            $gte: 0
        }
    });
    return sys as ISystem;
}