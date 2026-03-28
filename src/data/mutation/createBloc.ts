import type { PageBuilder } from "src/PageBuilder";
import type { IBloc } from "../model/BlocModel";
import { getBlocRepository } from "../repositories";

export async function createBloc(bloc: IBloc, system: PageBuilder){
    const repo = getBlocRepository(system);
    const res = await repo.upsert(bloc, {
        onConflictFields: ['htmlTag'],
        onConflictAction: 'merge'
    });
    return res;
}