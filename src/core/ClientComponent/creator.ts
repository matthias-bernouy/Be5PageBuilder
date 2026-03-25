import { join } from "node:path"
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import { register_bloc } from "src/Be5System/register_bloc";

export async function dev_import_bloc(name: string, system: Be5PageBuilder){

    const baseComponent = join(__dirname, name);

    const viewPath = join(baseComponent, name + ".ts");
    const editorPath = join(baseComponent, name + "Editor.ts");

    await register_bloc(viewPath, editorPath, name, system);

    return;

}