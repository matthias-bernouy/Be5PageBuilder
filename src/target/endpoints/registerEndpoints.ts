import { registerUIFolder, registerCSSFolder, registerJSFolder, registerAPIFolder } from "src/Be5System/utilities";
import { join } from "node:path"
import type { Be5PageBuilder } from "src/Be5PageBuilder";

const root = process.cwd();
function res(str: string){
    return join(root, "src/target/endpoints", str);
}

export function registerEndpoints(system: Be5PageBuilder){
    
    registerUIFolder("/admin", res("admin"), system);

    registerUIFolder("/", res("client"), system);

    registerCSSFolder("/assets", res("css"), system);
    registerAPIFolder("/api", res("api"), system);
    
}

