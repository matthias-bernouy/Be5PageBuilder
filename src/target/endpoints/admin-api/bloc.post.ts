import { PageModel, type IPage } from "src/target/data/model/PageModel";
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import contains from "src/Be5System/contains";
import { BlocModel, type IBloc } from "src/target/data/model/BlocModel";

export default async function importBloc(req: Request, system: Be5PageBuilder) {

    const formData = await req.formData();

    const data = {
        name: formData.get("name") as string,
        viewJS: formData.get("viewJS") as File,
        editorJS: formData.get("editorJS") as File
    };

    if ( !data.name || !data.viewJS || !data.editorJS ) return new Response("Missing argument", {
        status: 400
    })
    
    // const body = await req.json() as IPage;

    // try {
    //     contains(body, ["content", "description", 'path', "visible", "title"]);
    // } catch (e: any) {
    //     return new Response(e, {
    //         status: 400
    //     })
    // }

    const repo = system.db.getRepository(BlocModel);

    const newBloc: IBloc = {
        name: data.name,
        viewJS: await data.viewJS.text(),
        editorJS: await data.editorJS.text()
    };

    repo.create(newBloc);
    await repo.getEntityManager().persist(newBloc).flush()

    return new Response("Bloc imported");
}