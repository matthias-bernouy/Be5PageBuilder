import { send_css } from 'be5-system';
import type { Be5PageBuilder } from 'src/Be5PageBuilder';
import not_found from 'src/Be5System/not_found';
import { getSystemConfig } from 'src/data/queries/system/getSystemConfig';

export default async function ClientStyleCssServer(req: Request, system: Be5PageBuilder){

    const config = await getSystemConfig(system);
    if (!config){
        return not_found("")
    }
    return send_css(config.css);
}