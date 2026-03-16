import { EntitySchema } from '@mikro-orm/core';

export type IPage = {
  identifier: string;
  path: string;
  content: string;
  title: string;
  description: string;
  visible: boolean;
}

export const PageModel = new EntitySchema<IPage>({
  name: "Page",
  properties: {
    identifier: { primary: true, type: 'string' }, // Is for ?identifier=test-page or anything
    path: { type: 'string' }, // Is for /article or /page or anything
    content: { type: 'string' },
    title: { type: 'string' }, // Meta-title, title
    description: { type: 'string' }, // Meta-description
    visible: { type: 'boolean' }
  },
});