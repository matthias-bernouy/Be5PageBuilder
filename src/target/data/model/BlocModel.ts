import { EntitySchema } from '@mikro-orm/core';

export type IBloc = {
    id: string;
    htmlTag: string;
    clientJavascript: string;
    editorJavascript: string;
}

export const BlocModel = new EntitySchema<IBloc>({
  name: "Bloc",
  properties: {
    id: { primary: true, type: "string" },
    htmlTag: { unique: true, type: 'string' },
    clientJavascript: { type: 'string' },
    editorJavascript: { type: 'string' }
  },
});