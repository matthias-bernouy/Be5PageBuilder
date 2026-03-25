import { PageModel, type IPage } from "src/target/data/model/PageModel";
import type { Be5PageBuilder } from "src/Be5PageBuilder";
import contains from "src/Be5System/contains";
import { BlocModel, type IBloc } from "src/target/data/model/BlocModel";
import { randomUUIDv7 } from "bun";

export default async function importBloc(req: Request, system: Be5PageBuilder) {

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const viewFile = formData.get("viewJS") as File;
    const editorFile = formData.get("editorJS") as File;

    if (!name || !viewFile || !editorFile) {
        return new Response("Missing argument", { status: 400 });
    }

    const repo = system.db.getRepository(BlocModel);
    const em = repo.getEntityManager(); // Plus propre que repo.getEntityManager()
    
    // const body = await req.json() as IPage;

    // try {
    //     contains(body, ["content", "description", 'path', "visible", "title"]);
    // } catch (e: any) {
    //     return new Response(e, {
    //         status: 400
    //     })
    // }

    const blocEntity = repo.create({
        id: randomUUIDv7(),
        name: name,
        viewJS: await viewFile.text(),
        editorJS: await editorFile.text()
    });

    await em.persist(blocEntity).flush()

    return new Response("Bloc imported");
}