export type TBloc = {
    id: string;
    name: string; 
    viewJS: string;
    editorJS: string;
}

export type TPage = {
  id?: string;
  identifier: string;
  path: string;
  content: string;
  title: string;
  description: string;
  visible: boolean;
  tags: string[];
}

export type TSystem = {
    id: number,
    css: string;
    icon: string;
    visible: boolean;
}