export class FetchComponent extends HTMLElement {
    static get observedAttributes() {
        return ["url"];
    }

    connectedCallback(): void {
        this.fetchAndRender();
    }

    attributeChangedCallback(_name: string, oldVal: string | null, newVal: string | null): void {
        if (oldVal !== newVal && this.isConnected) this.fetchAndRender();
    }

    private async fetchAndRender(): Promise<void> {
        const url = this.getAttribute("url");
        if (!url) return;

        this.dispatchEvent(new CustomEvent("w13c:loading", { bubbles: true }));

        try {
            const res = await fetch(url, { headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json() as unknown;
            this.stamp(data);
            this.dispatchEvent(new CustomEvent("w13c:data", { bubbles: true, detail: data }));
        } catch (err) {
            this.dispatchEvent(new CustomEvent("w13c:error", { bubbles: true, detail: err }));
        }
    }

    private stamp(data: unknown): void {
        const tpl = this.querySelector<HTMLTemplateElement>(":scope > template");
        if (!tpl) return;

        for (const child of [...this.childNodes]) {
            if (child !== tpl) child.parentNode!.removeChild(child);
        }

        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
            const scratch = document.createElement("template");
            scratch.innerHTML = interpolate(tpl.innerHTML, item);
            this.appendChild(scratch.content);
        }
    }
}

function interpolate(html: string, data: unknown): string {
    return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => escape(resolve(data, path)));
}

function resolve(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, k) => (acc != null ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

function escape(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

customElements.define("cms-fetch", FetchComponent);
