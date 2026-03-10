
export type PageDefinition = {
    content: string,
    path: string,
    identifier: string,
    title: string
}

export const pages: Map<string, PageDefinition> = new Map();