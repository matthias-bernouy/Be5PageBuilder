import type { TBloc, TPage, TSnippet, TSystem, TTemplate } from "./TModels";

export type BlocListItemResponse = {
    id: string, 
    name: string, 
    group: string, 
    description: string
}

export interface CmsRepository {

    // BLOC
    createBloc(bloc: TBloc): Promise<TBloc>;
    replaceBloc(bloc: TBloc): Promise<TBloc>;

    getBlocsEditorJS(): Promise<{ id: string, editorJS: string }[]>;
    getBlocsJS(): Promise<{ id: string, editorJS: string, viewJS: string }[]>;
    getBlocsList(): Promise<BlocListItemResponse[]>;
    getBlocViewJS(htmlTag: string): Promise<string | null>;


    // PAGE
    createPage(page: TPage, oldPath?: string): Promise<TPage>;
    getPage(path: string): Promise<TPage | null>;
    getAllPages(): Promise<TPage[]>;

    // NEW VERSION
    insertPage(path: string, title: string): Promise<void>;
    getPageById(id: string): Promise<TPage | null>;


    // SYSTEM
    getSystem(): Promise<TSystem>;
    updateSystem(system: Partial<TSystem>): Promise<TSystem>;

    // TEMPLATE
    createTemplate(template: TTemplate): Promise<TTemplate>;
    getTemplateById(id: string): Promise<TTemplate | null>;
    getAllTemplates(): Promise<TTemplate[]>;
    updateTemplate(id: string, data: Partial<TTemplate>): Promise<TTemplate | null>;
    deleteTemplate(id: string): Promise<void>;

    // SNIPPET
    createSnippet(snippet: TSnippet): Promise<TSnippet>;
    getSnippetById(id: string): Promise<TSnippet | null>;
    getSnippetByIdentifier(identifier: string): Promise<TSnippet | null>;
    getAllSnippets(): Promise<TSnippet[]>;
    updateSnippet(id: string, data: Partial<TSnippet>): Promise<TSnippet | null>;
    deleteSnippet(id: string): Promise<void>;
    findPagesUsingSnippet(identifier: string): Promise<TPage[]>;

}