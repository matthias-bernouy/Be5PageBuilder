import { pages } from "../../data/Pages";


export function getPages(url: URL){
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const size = parseInt(url.searchParams.get("size") || "20", 10);

    const pagesArray = Array.from(pages.values());
    
    const start = page * size;
    const end = start + size;
    const paginatedItems = pagesArray.slice(start, end);

    return {
        data: paginatedItems,
        meta: {
            total: pages.size,
            page: page,
            size: size,
            total_pages: Math.ceil(pages.size / size)
        }
    };
}