import type { Collection, Db } from "mongodb";
import type { TSystem } from "src/interfaces/contract/Repository/TModels";

/**
 * MongoDB-backed persistence for the single system-settings document.
 *
 * `get()` performs an in-place migration that strips legacy fields
 * (`homePage`/`page404`/`page500` as strings, `editor.blocAtPageCreation`)
 * and fills in any missing fields from the defaults. This is pre-v1 dev-DB
 * maintenance — see CLEAN.md section 4 for removal once dev DBs are clean.
 */
export class SystemRepository {

    private _collection: Collection<TSystem>;

    constructor(database: Db) {
        this._collection = database.collection<TSystem>("system");
    }

    clear(): Promise<unknown> {
        return this._collection.deleteMany({});
    }

    async get(): Promise<TSystem> {
        const defaults: TSystem = {
            initializationStep: 0,
            site: {
                name: "",
                favicon: "",
                visible: true,
                theme: "",
                home: null,
                notFound: null,
                serverError: null,
            },
            seo: { titleTemplate: "%s", defaultDescription: "", defaultOgImage: "" },
            editor: { layoutCategory: "" },
        };

        const doc = await this._collection.findOne({}) as any;
        if (!doc) {
            await this._collection.insertOne(defaults);
            return defaults;
        }

        const legacy = doc.site || {};
        const hasLegacySite = "homePage" in legacy || "page404" in legacy || "page500" in legacy;
        const hasLegacyEditor = doc.editor && "blocAtPageCreation" in doc.editor;

        const merged: TSystem = {
            initializationStep: doc.initializationStep ?? 0,
            site: {
                name: legacy.name ?? "",
                favicon: legacy.favicon ?? "",
                visible: legacy.visible ?? true,
                theme: legacy.theme ?? "",
                home: legacy.home ?? null,
                notFound: legacy.notFound ?? null,
                serverError: legacy.serverError ?? null,
            },
            seo: {
                titleTemplate: doc.seo?.titleTemplate ?? "%s",
                defaultDescription: doc.seo?.defaultDescription ?? "",
                defaultOgImage: doc.seo?.defaultOgImage ?? "",
            },
            editor: {
                layoutCategory: doc.editor?.layoutCategory ?? "",
            },
        };

        if (hasLegacySite || hasLegacyEditor) {
            // Replace entire `site` and `editor` subdocs so legacy fields
            // (homePage/page404/page500, blocAtPageCreation) are dropped.
            await this._collection.updateOne(
                {},
                { $set: { site: merged.site, editor: merged.editor } }
            );
        }

        return merged;
    }

    async update(update: Partial<TSystem>): Promise<TSystem> {
        const flatUpdate: Record<string, any> = {};
        for (const [section, value] of Object.entries(update)) {
            if (section === "initializationStep") {
                flatUpdate[section] = value;
            } else if (typeof value === "object" && value !== null) {
                for (const [key, val] of Object.entries(value)) {
                    flatUpdate[`${section}.${key}`] = val;
                }
            }
        }

        await this._collection.updateOne({}, { $set: flatUpdate }, { upsert: true });
        return this.get();
    }
}
