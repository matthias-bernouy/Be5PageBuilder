import { EntitySchema } from '@mikro-orm/core';

export type IBloc = {
    id: string;
    name: string;
    viewJS: string;
    editorJS: string;
}

export const BlocModel = new EntitySchema<IBloc>({
  name: "Bloc",
  properties: {
    id: { primary: true, type: "string" },
    name: { type: 'string' },
    viewJS: { type: 'string' },
    editorJS: { type: 'string' }
  },
});