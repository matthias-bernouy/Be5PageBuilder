import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { SystemModel, type ISystem } from "../../model/SystemModel";

export async function getSystemConfig(system: Be5PageBuilder){
    const repo = system.db.getRepository(SystemModel);
    const sys = await repo.findOne({
        id: {
            $gte: 0
        }
    });
    return sys as ISystem;
}