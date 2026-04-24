import "@bernouy/webcomponents";
import type { LateralDialog, TagSuggest } from "@bernouy/webcomponents";

type PageRow = {
    title: string;
    path: string;
    visible: boolean;
    tags: string[];
    editorHref: string;
    publicUrl: string;
};

type PagesData = {
    pages: PageRow[];
};

type SortKey = "title" | "path" | "visibility";
type SortDir = "asc" | "desc";
type Visibility = "all" | "published" | "draft";

type State = {
    q: string;
    visibility: Visibility;
    tags: Set<string>;
    sort: SortKey;
    direction: SortDir;
};

const DEFAULT_SORT: SortKey = "title";
const DEFAULT_DIR: SortDir = "asc";

const dataEl = document.getElementById("pages-data");
if (!dataEl) console.warn("[pages] missing #pages-data script");
const DATA: PagesData = dataEl
    ? JSON.parse(dataEl.textContent || "{}") as PagesData
    : { pages: [] };

const state: State = readStateFromUrl();
let suppressChange = false;

const searchInput = document.getElementById("pages-search") as HTMLInputElement | null;
const visibilitySwitch = document.getElementById("pages-visibility") as HTMLElement & { value: string } | null;
const tagFilterEl = document.getElementById("pages-tag-filter") as TagSuggest | null;
const clearBtn = document.getElementById("pages-clear") as HTMLButtonElement | null;
const filtersBtn = document.getElementById("pages-filters-btn") as HTMLButtonElement | null;
const filtersBadge = document.getElementById("pages-filters-badge") as HTMLElement | null;
const filtersPanel = document.getElementById("pages-filters-panel") as LateralDialog | null;
const tableEl = document.querySelector("p9r-table") as HTMLElement | null;
const emptyEl = document.getElementById("pages-empty") as HTMLElement | null;
const headerRow = tableEl?.querySelector('p9r-row[slot="header"]') as HTMLElement | null;

applyStateToInputs();
bindInputs();
refresh();

window.addEventListener("popstate", () => {
    const next = readStateFromUrl();
    Object.assign(state, next);
    applyStateToInputs();
    refresh();
});

function readStateFromUrl(): State {
    const params = new URL(window.location.href).searchParams;
    const v = params.get("visibility");
    const visibility: Visibility = v === "published" || v === "draft" ? v : "all";
    const rawSort = params.get("sort") || "";
    const [sortKey, sortDir] = rawSort.split(":");
    const sort: SortKey =
        sortKey === "title" || sortKey === "path" || sortKey === "visibility"
            ? sortKey
            : DEFAULT_SORT;
    const direction: SortDir = sortDir === "desc" ? "desc" : DEFAULT_DIR;
    const tagsParam = params.get("tags") || "";
    const tags = new Set(tagsParam.split(",").map(s => s.trim()).filter(Boolean));
    return { q: params.get("q") || "", visibility, tags, sort, direction };
}

function writeStateToUrl() {
    const url = new URL(window.location.href);
    const p = url.searchParams;
    if (state.q) p.set("q", state.q); else p.delete("q");
    if (state.visibility !== "all") p.set("visibility", state.visibility); else p.delete("visibility");
    if (state.tags.size > 0) p.set("tags", [...state.tags].join(",")); else p.delete("tags");
    if (state.sort !== DEFAULT_SORT || state.direction !== DEFAULT_DIR) {
        p.set("sort", `${state.sort}:${state.direction}`);
    } else {
        p.delete("sort");
    }
    history.replaceState(null, "", url.toString());
}

function bindInputs() {
    if (searchInput) {
        let debounce: ReturnType<typeof setTimeout> | null = null;
        searchInput.addEventListener("input", () => {
            const v = searchInput.value;
            if (debounce) clearTimeout(debounce);
            debounce = setTimeout(() => {
                state.q = v;
                onStateChange();
            }, 200);
        });
    }

    if (visibilitySwitch) {
        visibilitySwitch.addEventListener("change", () => {
            if (suppressChange) return;
            const v = visibilitySwitch.value;
            state.visibility = v === "published" || v === "draft" ? v : "all";
            onStateChange();
        });
    }

    if (tagFilterEl) {
        tagFilterEl.addEventListener("change", () => {
            if (suppressChange) return;
            const raw = tagFilterEl.value || "";
            const tags = raw.split(",").map(s => s.trim()).filter(Boolean);
            state.tags = new Set(tags);
            onStateChange();
        });
    }

    if (headerRow) {
        headerRow.addEventListener("click", (ev) => {
            const cell = (ev.target as HTMLElement).closest("p9r-cell[data-sort]") as HTMLElement | null;
            if (!cell) return;
            const key = cell.dataset.sort as SortKey;
            if (key !== "title" && key !== "path" && key !== "visibility") return;
            if (state.sort === key) {
                state.direction = state.direction === "asc" ? "desc" : "asc";
            } else {
                state.sort = key;
                state.direction = "asc";
            }
            onStateChange();
        });
    }

    if (filtersBtn && filtersPanel) {
        filtersBtn.addEventListener("click", () => filtersPanel.show());
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", clearFilters);
    }
}

function clearFilters() {
    state.q = "";
    state.visibility = "all";
    state.tags.clear();
    // Keep sort — users rarely want it reset with filters
    applyStateToInputs();
    onStateChange();
}

function applyStateToInputs() {
    suppressChange = true;
    try {
        if (searchInput && searchInput.value !== state.q) searchInput.value = state.q;
        if (visibilitySwitch && visibilitySwitch.value !== state.visibility) {
            visibilitySwitch.value = state.visibility;
        }
        if (tagFilterEl) {
            const desired = [...state.tags].join(",");
            if (tagFilterEl.value !== desired) tagFilterEl.value = desired;
        }
    } finally {
        suppressChange = false;
    }
}

function onStateChange() {
    writeStateToUrl();
    refresh();
}

function refresh() {
    updateSortIndicators();
    updateFilterCount();
    const visible = filterAndSort(DATA.pages);
    renderRows(visible);
    if (emptyEl) emptyEl.hidden = visible.length > 0;
}

function countActiveFilters(): number {
    let n = 0;
    if (state.q) n++;
    if (state.visibility !== "all") n++;
    n += state.tags.size;
    return n;
}

function updateFilterCount() {
    const n = countActiveFilters();
    if (filtersBadge) {
        filtersBadge.textContent = String(n);
        filtersBadge.hidden = n === 0;
    }
    if (filtersBtn) {
        if (n > 0) filtersBtn.dataset.active = "true";
        else delete filtersBtn.dataset.active;
    }
    if (clearBtn) clearBtn.disabled = n === 0;
}

function updateSortIndicators() {
    if (!headerRow) return;
    headerRow.querySelectorAll<HTMLElement>("p9r-cell[data-sort]").forEach(cell => {
        const key = cell.dataset.sort;
        const arrow = cell.querySelector(".sort-arrow");
        if (key === state.sort) {
            cell.dataset.direction = state.direction;
            if (arrow) arrow.textContent = state.direction === "asc" ? "↑" : "↓";
        } else {
            delete cell.dataset.direction;
            if (arrow) arrow.textContent = "↕";
        }
    });
}

function filterAndSort(pages: PageRow[]): PageRow[] {
    const q = state.q.trim().toLowerCase();
    const filtered = pages.filter(p => {
        if (q) {
            const hay = `${p.title}\n${p.path}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        if (state.visibility === "published" && !p.visible) return false;
        if (state.visibility === "draft" && p.visible) return false;
        if (state.tags.size > 0) {
            let hit = false;
            for (const t of p.tags) {
                if (state.tags.has(t)) { hit = true; break; }
            }
            if (!hit) return false;
        }
        return true;
    });

    const dirMul = state.direction === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
        let cmp = 0;
        if (state.sort === "title") {
            cmp = (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" });
        } else if (state.sort === "path") {
            cmp = a.path.localeCompare(b.path, undefined, { sensitivity: "base" });
        } else {
            cmp = Number(b.visible) - Number(a.visible);
        }
        if (cmp === 0) cmp = a.path.localeCompare(b.path, undefined, { sensitivity: "base" });
        return cmp * dirMul;
    });

    return filtered;
}

function renderRows(pages: PageRow[]) {
    if (!tableEl) return;
    tableEl.querySelectorAll('p9r-row:not([slot="header"])').forEach(r => r.remove());
    for (const page of pages) {
        const row = document.createElement("p9r-row");
        row.setAttribute("href", page.editorHref);

        const titleCell = document.createElement("p9r-cell");
        const strong = document.createElement("strong");
        strong.textContent = page.title || "Untitled";
        titleCell.appendChild(strong);
        row.appendChild(titleCell);

        const pathCell = document.createElement("p9r-cell");
        const pathTag = document.createElement("p9r-tag");
        pathTag.textContent = page.publicUrl;
        pathCell.appendChild(pathTag);
        row.appendChild(pathCell);

        const tagsCell = document.createElement("p9r-cell");
        for (const t of page.tags) {
            const tagEl = document.createElement("p9r-tag");
            tagEl.setAttribute("style", "background: var(--primary-muted); border:none; color: var(--primary-contrasted);");
            tagEl.textContent = t;
            tagsCell.appendChild(tagEl);
        }
        row.appendChild(tagsCell);

        const statusCell = document.createElement("p9r-cell");
        const statusTag = document.createElement("p9r-tag");
        statusTag.setAttribute("color", page.visible ? "success" : "danger");
        statusTag.textContent = page.visible ? "Published" : "Draft";
        statusCell.appendChild(statusTag);
        row.appendChild(statusCell);

        tableEl.appendChild(row);
    }
}
