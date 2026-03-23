import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { PageModel } from 'src/target/data/model/PageModel';
import type { Be5PageBuilder } from 'src/Be5PageBuilder';
import template from "./pages.html";

export default async function Server(req: Request, system: Be5PageBuilder){
    const { document } = parseHTML(await Bun.file(template.index).text());

    const repo = system.db.getRepository(PageModel);
    const pageList = await repo.findAll();

    const tableBody = document.querySelector("tbody")!;

    // for ( const page of pageList ) {
    //     tableBody.innerHTML += `
    //         <tr onclick="window.location.href='./article?identifier=${page.identifier}'">
    //             <td><strong>${page.title}</strong></td>
    //             <td><span class="url-text">${page.path}</span></td>
    //             <td><span class="url-text">${page.identifier}</span></td>
    //             <td><span class="url-text">${page.visible}</span></td>
    //         </tr>
    //     `
    // }


    return send_html(document.toString());
}