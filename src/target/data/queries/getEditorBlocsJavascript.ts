import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { getBlocRepository } from "../repositories";
import type { IBloc } from "../model/BlocModel";

export async function getEditorBlocsJavascript(system: Be5PageBuilder){
    const repo = getBlocRepository(system);
    const res = await repo.findAll();
    return res as IBloc[];
}