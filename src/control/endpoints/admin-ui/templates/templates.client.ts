document.addEventListener("click", async (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>(".btn-delete-tpl");
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();

    const id = decodeURIComponent(btn.dataset.id ?? "");
    if (!confirm("Delete this template?")) return;

    const res = await fetch("../api/template?id=" + encodeURIComponent(id), { method: "DELETE" });
    if (res.ok) window.location.reload();
});
