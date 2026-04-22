document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("media-grid") as (HTMLElement & { upload: () => void }) | null;
    if (!grid) return;
    document.getElementById("btn-upload")?.addEventListener("click", () => grid.upload());
    document.getElementById("btn-new-folder")?.addEventListener(
        "click",
        () => grid.dispatchEvent(new Event("new-folder"))
    );
});
