import { EntitySchema } from '@mikro-orm/core';

export type ISystem = {
    id: number,
    css: string;
    icon: string;
    visible: boolean;
}

export const SystemModel = new EntitySchema<ISystem>({
  name: "System",
  properties: {
    id: { type: 'number', primary: true },
    css: { type: 'string' },
    icon: { type: 'string' },
    visible: { type: 'boolean' }
  },
});