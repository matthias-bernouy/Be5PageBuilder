import type { TBloc, TPage, TSystem, TTemplate } from "./TModels";
import type { TBlocMetadata } from "./TQueries";


export interface PageBuilderRepository {

    // BLOC
    createBloc(bloc: TBloc): Promise<TBloc>;

    getBlocsMetadata(): Promise<TBlocMetadata[]>;
    getBlocsEditorJS(): Promise<{ id: string, editorJS: string }[]>;
    getBlocViewJS(htmlTag: string): Promise<string | null>;


    // PAGE
    createPage(page: TPage, oldIdentifier?: string): Promise<TPage>;
    getPageByIdentifier(identifier: string): Promise<TPage | null>;
    getAllPages(): Promise<TPage[]>;


    // SYSTEM
    getSystem(): Promise<TSystem>;
    updateSystem(system: Partial<TSystem>): Promise<TSystem>;

    // TEMPLATE
    createTemplate(template: TTemplate): Promise<TTemplate>;
    getTemplateById(id: string): Promise<TTemplate | null>;
    getAllTemplates(): Promise<TTemplate[]>;
    updateTemplate(id: string, data: Partial<TTemplate>): Promise<TTemplate | null>;
    deleteTemplate(id: string): Promise<void>;

}