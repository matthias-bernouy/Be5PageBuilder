import { registerUIFolder, registerCSSFolder, registerJSFolder, registerAPIFolder } from "src/Be5System/utilities";
import { join } from "node:path"
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import type { Be5_Authentication, IBe5_Authentication, Middleware } from "be5-interfaces";

const root = process.cwd();
function res(str: string){
    return join(root, "src/target/endpoints", str);
}

export const createAuthGuard = (system: Be5PageBuilder): Middleware => {
    return async (req, next) => {
        const url = new URL(req.url);
        if ( !url.pathname.startsWith("/admin") ) return await next();
        try {
            const subject = await system.auth.guardAuthenticated(req);
            console.log(subject)
            if (subject.role !== "admin") throw new Error("Not connected")
            return await next();
        } catch (error) {
            const currentPath = new URL(req.url).pathname;
            const loginUrl = system.auth.withRedirect(system.auth.loginPage, currentPath);
            
            return new Response(null, {
                status: 302,
                headers: { "Location": loginUrl }
            });
        }
    };
};

export function registerEndpoints(system: Be5PageBuilder){

    system.runner.use(createAuthGuard(system))

    registerUIFolder("/admin", res("admin"), system);

    registerUIFolder("/", res("client"), system);

    registerCSSFolder("/assets", res("css"), system);
    registerAPIFolder("/api", res("api"), system);
    
}

