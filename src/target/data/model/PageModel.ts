import { EntitySchema } from '@mikro-orm/core';

export type IPage = {
  id?: string;
  identifier: string;
  path: string;
  content: string;
  title: string;
  description: string;
  visible: boolean;
  tags: string[];
}

export const PageModel = new EntitySchema<IPage>({
  name: "Page",
  properties: {
    id: { primary: true, type: 'string' },
    identifier: { unique: true, type: 'string' }, // Is for ?identifier=test-page or anything
    path: { type: 'string' }, // Is for /article or /page or anything
    content: { type: 'text' },
    title: { type: 'string' }, // Meta-title, title
    description: { type: 'string' }, // Meta-description
    visible: { type: 'boolean', default: false },
    tags: { type: 'json' }
  },
});