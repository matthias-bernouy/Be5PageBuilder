import { EntitySchema } from '@mikro-orm/core';

export type IBloc = {
    htmlTag: string;
    clientJavascript: string;
    editorJavascript: string;
}

export const BlocModel = new EntitySchema<IBloc>({
  name: "Bloc",
  properties: {
    htmlTag: { primary: true, type: 'string' },
    clientJavascript: { type: 'string' },
    editorJavascript: { type: 'string' }
  },
});