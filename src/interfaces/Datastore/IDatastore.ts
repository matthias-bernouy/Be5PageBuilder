import type { TBloc, TPage } from "./TModels";
import type { TBlocMetadata } from "./TQueries";


export interface IDatastore {

    // BLOC
    createBloc(bloc: TBloc): Promise<TBloc>;

    getBlocsMetadata(): Promise<TBlocMetadata[]>;
    getBlocEditorJS(htmlTag: string): Promise<string | null>;
    getBlocViewJS(htmlTag: string): Promise<string | null>;


    // PAGE
    createPage(page: TPage): Promise<TPage>;
    getPageByIdentifier(identifier: string): Promise<TPage | null>;
    getAllPages(): Promise<TPage[]>;


}