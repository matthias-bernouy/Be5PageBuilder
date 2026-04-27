import type { ControlCms } from 'src/control/ControlCms';
import type { TTemplate } from 'src/socle/contracts/Repository/TModels';
import { DEFAULT_TEMPLATE_CONTENT } from '../validation/template/content';
import type { TemplateCreateDto } from '../validation/template/parseCreateDto';

export async function createTemplate(cms: ControlCms, dto: TemplateCreateDto): Promise<TTemplate> {
    return cms.repository.createTemplate({
        name: dto.name,
        category: dto.category,
        description: '',
        content: DEFAULT_TEMPLATE_CONTENT,
        createdAt: new Date(),
    });
}
