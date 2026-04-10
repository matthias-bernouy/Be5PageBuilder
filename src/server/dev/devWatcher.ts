import { watch, type FSWatcher } from "node:fs";

export type DevWatcherHandle = {
    stop: () => void;
};

/**
 * Watches a bloc folder recursively and invokes `onChange` at most once
 * per debounce window. Bun/Node's `fs.watch` is flaky on some platforms
 * but the worst case here is an extra rebuild — acceptable for dev.
 */
export function startDevWatcher(folder: string, onChange: () => void, debounceMs = 120): DevWatcherHandle {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            onChange();
        }, debounceMs);
    };

    let watcher: FSWatcher;
    try {
        watcher = watch(folder, { recursive: true }, () => trigger());
    } catch (err) {
        console.error(`[dev] Failed to start watcher on ${folder}:`, err);
        return { stop: () => {} };
    }

    return {
        stop: () => {
            if (timer) clearTimeout(timer);
            try { watcher.close(); } catch {}
        },
    };
}
