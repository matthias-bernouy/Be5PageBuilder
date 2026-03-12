import { EntitySchema } from '@mikro-orm/core';

export type IPage = {
  identifier: string;
  path: string;
  content: string;
  title: string;
}

export const PageModel = new EntitySchema<IPage>({
  name: "Page",
  properties: {
    identifier: { primary: true, type: 'string' },
    path: { type: 'string' },
    content: { type: 'string' },
    title: { type: 'string' }
  },
});