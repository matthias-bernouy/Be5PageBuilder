import type { PageBuilder } from "src/PageBuilder";
import { getBlocRepository } from "../../repositories";
import type { IBloc } from "../../model/BlocModel";

export async function getEditorBlocsJavascript(system: PageBuilder){
    const repo = getBlocRepository(system);
    const res = await repo.findAll();
    return res as IBloc[];
}