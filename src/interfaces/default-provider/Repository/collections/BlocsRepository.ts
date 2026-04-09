import type { Collection, Db } from "mongodb";
import type { TBloc } from "src/interfaces/contract/Repository/TModels";

/**
 * MongoDB-backed persistence for blocs. Owned by DefaultPageBuilderRepository;
 * not exported as part of the public contract.
 */
export class BlocsRepository {

    private _collection: Collection<TBloc>;

    constructor(database: Db) {
        this._collection = database.collection<TBloc>("blocs");
    }

    clear(): Promise<unknown> {
        return this._collection.deleteMany({});
    }

    async create(bloc: TBloc): Promise<TBloc> {
        const result = await this._collection.insertOne(bloc);
        if (!result.acknowledged) {
            throw new Error("Failed to create bloc");
        }
        return bloc;
    }

    async getEditorJS(): Promise<{ id: string, editorJS: string }[]> {
        const blocs = await this._collection
            .find({}, { projection: { id: 1, editorJS: 1, _id: 0 } })
            .toArray();
        return blocs.map(bloc => ({ id: bloc.id, editorJS: bloc.editorJS }));
    }

    async getViewJS(id: string): Promise<string | null> {
        const bloc = await this._collection.findOne({ id }, { projection: { viewJS: 1, _id: 0 } });
        return bloc ? bloc.viewJS : null;
    }
}
