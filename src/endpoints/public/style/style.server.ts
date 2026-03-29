import { send_css } from 'be5-system';
import type { PageBuilder } from 'src/PageBuilder';

export default async function ClientStyleCssServer(req: Request, system: PageBuilder){

    return send_css("");
}