import type { Be5PageBuilder } from "src/plugin/Be5PageBuilder";
import type { IBloc } from "../model/BlocModel";
import { getBlocRepository } from "../repositories";

export async function createBloc(bloc: IBloc, system: Be5PageBuilder){
    const repo = getBlocRepository(system);
    const res = await repo.upsert(bloc, {
        onConflictFields: ['htmlTag'],
        onConflictAction: 'merge'
    });
    return res;
}