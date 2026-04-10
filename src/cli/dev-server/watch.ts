import { watch, type FSWatcher } from "node:fs";
import type { DevBloc } from "./scan";
import type { BuiltBloc } from "./build";
import { buildDevBloc } from "./build";

export type ReloadEmitter = {
    subscribe: (fn: (tag: string) => void) => () => void;
    emit: (tag: string) => void;
};

export type WatchHandle = {
    stop: () => void;
};

export function createReloadEmitter(): ReloadEmitter {
    const listeners = new Set<(tag: string) => void>();
    return {
        subscribe(fn) {
            listeners.add(fn);
            return () => { listeners.delete(fn); };
        },
        emit(tag) {
            for (const fn of listeners) {
                try { fn(tag); }
                catch (e) { console.error(`[watch] listener error: ${e instanceof Error ? e.message : e}`); }
            }
        },
    };
}

/**
 * Filenames the watcher must ignore. The build pipeline writes temporary
 * `.__p9r_dev_*.ts` wrapper files inside each bloc folder and removes them
 * again; without this filter every rebuild would trigger another rebuild.
 */
const IGNORED = /(?:^|[\\/])(?:\.__p9r_dev_|\.p9r-dev[\\/]|node_modules[\\/])/;

function watchBloc(
    bloc: DevBloc,
    devBlocs: Map<string, BuiltBloc>,
    emitter: ReloadEmitter,
): FSWatcher {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let building = false;
    let pending = false;

    const rebuild = async () => {
        if (building) { pending = true; return; }
        building = true;
        try {
            const built = await buildDevBloc(bloc);
            devBlocs.set(built.tag, built);
            console.log(`[watch] Rebuilt ${built.tag}`);
            emitter.emit(built.tag);
        } catch (e) {
            console.error(`[watch] ${bloc.tag}: ${e instanceof Error ? e.message : e}`);
        } finally {
            building = false;
            if (pending) {
                pending = false;
                setTimeout(rebuild, 10);
            }
        }
    };

    const onChange = (_type: string, filename: string | null) => {
        if (filename && IGNORED.test(filename)) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(rebuild, 150);
    };

    // `recursive: true` is only supported on macOS and Windows. Bloc folders
    // are typically flat (Bloc.ts, BlocEditor.ts, template.html, style.css,
    // configuration.html, manifest.json) so a shallow watch is enough.
    // Assets/ subfolder edits don't trigger rebuilds — that's fine for now.
    return watch(bloc.folder, onChange);
}

export function startWatchers(
    blocs: DevBloc[],
    devBlocs: Map<string, BuiltBloc>,
    emitter: ReloadEmitter,
): WatchHandle {
    const watchers = blocs.map(b => watchBloc(b, devBlocs, emitter));
    return {
        stop() {
            for (const w of watchers) {
                try { w.close(); } catch {}
            }
        },
    };
}
