import type { TBloc, TPage } from "./TModels";
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


}