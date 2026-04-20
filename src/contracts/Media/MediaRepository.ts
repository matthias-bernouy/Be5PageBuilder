export type MediaItem = {
    id: string;
    type: "folder" | "image" | "other";
    label: string;
    parent: string | null;
    createdAt: Date;
}

export type MediaDocument = {
    content: Uint8Array;
    mimetype: string;
    size: number;
} & MediaItem

export type MediaImage = {
    alt: string;
    width: number;
    height: number;
} & MediaDocument

export type MediaFolder = {
    type: "folder";
} & MediaItem

export type MediaFilter = {
    type?: ("folder" | "image" | "other")[];
    text?: string;
}

export interface MediaRepository {

    label: string;

    getItems(parent?: string, filter?: MediaFilter): Promise<Omit<MediaItem, 'content'>[]>;

    createFolder(label: string, parent?: string): Promise<MediaFolder>;

    deleteItem(id: string): Promise<void>;
    moveItem(id: string, newParentId?: string): Promise<void>;
    updateMetadata(id: string, data: Partial<MediaItem>): Promise<void>;

    upload(file: File, parent?: string): Promise<MediaDocument>;

    getItem(id: string): Promise<MediaItem | null>;

    getResponse(id: string, opts?: {
        w?: number,
        h?: number
    }): Promise<Response>
}