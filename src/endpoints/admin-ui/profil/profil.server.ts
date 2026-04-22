import { parseHTML } from 'linkedom';
import type { Cms } from 'src/Cms';
import template from "./profil.html";
import { send_html } from 'src/server/send_html';

export default async function Server(_req: Request, cms: Cms) {
    const { document } = parseHTML(await Bun.file(template.index).text());

    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn?.setAttribute("data-logout-url", cms.auth.logoutUrl);

    const tokensUrl = cms.config.tokensUrl;
    if (tokensUrl) {
        const tokensBtn = document.getElementById("manage-tokens-btn");
        tokensBtn?.setAttribute("data-tokens-url", tokensUrl);
        tokensBtn?.removeAttribute("disabled");
    }

    return send_html(document.toString());
}
