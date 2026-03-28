import { send_css } from 'be5-system';
import type { PageBuilder } from 'src/PageBuilder';
import not_found from 'src/Be5System/not_found';
import { getSystemConfig } from 'src/data/queries/system/getSystemConfig';

export default async function ClientStyleCssServer(req: Request, system: PageBuilder){

    const config = await getSystemConfig(system);
    if (!config){
        return not_found("")
    }
    return send_css(config.css);
}