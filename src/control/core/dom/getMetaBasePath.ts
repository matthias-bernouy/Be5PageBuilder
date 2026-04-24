
export function getMetaBasePath(){
    const meta = document.querySelector('meta[name="basePath"]');
    const path = meta ? meta.getAttribute('content')! : '/';
    return path;
}