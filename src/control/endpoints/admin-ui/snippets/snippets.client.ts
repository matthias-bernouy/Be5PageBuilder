document.addEventListener("click", async (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>(".btn-delete-snippet");
    if (!btn) return;
    ev.preventDefault();
    ev.stopPropagation();

    const id = decodeURIComponent(btn.dataset.id ?? "");
    if (!confirm("Delete this snippet?")) return;

    const res = await fetch("../api/snippet?id=" + encodeURIComponent(id), { method: "DELETE" });

    if (res.status === 409) {
        const body = await res.json() as { pages: { title: string; identifier: string }[] };
        const pageList = body.pages.map(p => "• " + (p.title || p.identifier)).join("\n");
        if (!confirm(
            "This snippet is used on " + body.pages.length + " page(s):\n\n" +
            pageList + "\n\nDelete anyway? References will break."
        )) return;
        const forceRes = await fetch(
            "../api/snippet?id=" + encodeURIComponent(id) + "&force=true",
            { method: "DELETE" }
        );
        if (forceRes.ok) window.location.reload();
        return;
    }

    if (res.ok) window.location.reload();
});
