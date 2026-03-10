import { send_html } from 'be5-system';
import { parseHTML } from 'linkedom';
import { join } from "node:path"
import { pages } from 'src/data/Pages';

export default async function Server(req: Request){
    const html = await Bun.file(join(__dirname, "./index.html")).text();
    const { document } = parseHTML(html);

    const pageList = Array.from(pages.values());

    const tableBody = document.querySelector("tbody")!;

    for ( const page of pageList ) {
        tableBody.innerHTML += `
            <tr onclick="window.location.href='/admin/article?identifier=${page.identifier}'">
                <td><input type="checkbox"></td>
                <td><strong>${page.title}</strong></td>
                <td><span class="url-text">${page.identifier}</span></td>
            </tr>
        `
    }


    return send_html(document.toString());
}