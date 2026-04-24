import type { Collection, Db } from "mongodb";
import type { TBloc } from "src/socle/contracts/Repository/TModels";

/**
 * MongoDB-backed persistence for blocs. Owned by DefaultCmsRepository;
 * not exported as part of the public contract.
 */
export class BlocsRepository {

    private _collection: Collection<TBloc>;

    constructor(database: Db) {
        this._collection = database.collection<TBloc>("blocs");
        // Enforce tag uniqueness at the storage layer. Idempotent: MongoDB is
        // a no-op when the index already exists with the same spec. Fails loud
        // if pre-existing duplicates prevent index creation, but the server
        // stays up.
        this._collection.createIndex({ id: 1 }, { unique: true })
            .catch(err => {
                console.error(`[blocs] Failed to ensure unique index on "id": ${err instanceof Error ? err.message : err}`);
            });
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

    async replace(bloc: TBloc): Promise<TBloc> {
        const result = await this._collection.replaceOne({ id: bloc.id }, bloc, { upsert: true });
        if (!result.acknowledged) {
            throw new Error("Failed to replace bloc");
        }
        return bloc;
    }

    async getEditorJS(): Promise<{ id: string, editorJS: string }[]> {
        const blocs = await this._collection
            .find({}, { projection: { id: 1, editorJS: 1, _id: 0 } })
            .toArray();
        return blocs.map(bloc => ({ id: bloc.id, editorJS: bloc.editorJS }));
    }

    async getAllJS(): Promise<{ id: string, editorJS: string, viewJS: string }[]> {
        const blocs = await this._collection
            .find({}, { projection: { id: 1, editorJS: 1, viewJS: 1, _id: 0 } })
            .toArray();
        return blocs.map(bloc => ({ id: bloc.id, editorJS: bloc.editorJS, viewJS: bloc.viewJS }));
    }

    /**
     * Light projection used by `p9r list-blocs` and any consumer that needs
     * to know what blocs exist without downloading the compiled JS payloads.
     * Missing `group` / `description` fall back to an empty string so older
     * records inserted before those columns existed still display cleanly.
     */
    async getList(): Promise<{ id: string, name: string, group: string, description: string }[]> {
        const blocs = await this._collection
            .find({}, { projection: { id: 1, name: 1, group: 1, description: 1, _id: 0 } })
            .toArray();
        return blocs.map(bloc => ({
            id:          bloc.id,
            name:        bloc.name,
            group:       bloc.group       || "",
            description: bloc.description || "",
        }));
    }

    async getViewJS(id: string): Promise<string | null> {
        const bloc = await this._collection.findOne({ id }, { projection: { viewJS: 1, _id: 0 } });
        return bloc ? bloc.viewJS : null;
    }
}
