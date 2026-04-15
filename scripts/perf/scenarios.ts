/**
 * Perf scenarios. Two flavors:
 *
 *  - "browser" scenarios run entirely in the page via page.evaluate — fast, good for
 *    measuring internal machinery (ObserverManager, MutationObserver, serialization).
 *
 *  - "driver" scenarios are orchestrated from node using Playwright's real input APIs
 *    (page.keyboard, page.mouse). They exercise the actual code paths a human would
 *    trigger: key events bubbling through TextEditor, real clicks on the BlocActionGroup,
 *    actual drag gestures, etc.
 *
 * Each scenario returns a flat object of numeric metrics (ms by default). The runner
 * compares them against the baseline.
 */

import type { Page } from "playwright";

export type BrowserScenario = {
    kind?: "browser";
    name: string;
    run: string; // stringified async arrow evaluated in the page
    tolerances?: Record<string, number>;
    absolutes?: Record<string, number>;
};

export type DriverScenario = {
    kind: "driver";
    name: string;
    run: (page: Page) => Promise<Record<string, number>>;
    tolerances?: Record<string, number>;
    absolutes?: Record<string, number>;
};

export type Scenario = BrowserScenario | DriverScenario;

const bulkInsert = (count: number) => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    const longTasks = [];
    let po;
    try {
        po = new PerformanceObserver(list => {
            for (const e of list.getEntries()) longTasks.push(e.duration);
        });
        po.observe({ entryTypes: ['longtask'] });
    } catch {}

    // Reset — remove everything inserted in prior scenarios.
    main.querySelectorAll('p.__perf__').forEach(el => el.remove());
    await new Promise(r => setTimeout(r, 150));
    longTasks.length = 0;

    const t0 = now();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < ${count}; i++) {
        const p = document.createElement('p');
        p.className = '__perf__';
        p.textContent = 'bulk ' + i;
        frag.appendChild(p);
    }
    main.appendChild(frag);
    const syncAppendMs = now() - t0;

    // Wait for observers to settle (up to 1 s or 4 quiet frames).
    await new Promise(r => setTimeout(r, 500));

    if (po) po.disconnect();
    const totalLongTaskMs = longTasks.reduce((a, b) => a + b, 0);
    const maxLongTaskMs = longTasks.length ? Math.max(...longTasks) : 0;

    return {
        syncAppendMs: +syncAppendMs.toFixed(2),
        longTaskCount: longTasks.length,
        totalLongTaskMs: +totalLongTaskMs.toFixed(1),
        maxLongTaskMs: +maxLongTaskMs.toFixed(1),
        elementsAfter: document.querySelectorAll('*').length,
    };
}
`;

const hoverCost = () => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    // Ensure we have at least 200 paragraphs.
    let ps = main.querySelectorAll('p');
    if (ps.length < 200) {
        const frag = document.createDocumentFragment();
        for (let i = ps.length; i < 200; i++) {
            const p = document.createElement('p');
            p.className = '__perf__';
            p.textContent = 'hover ' + i;
            frag.appendChild(p);
        }
        main.appendChild(frag);
        await new Promise(r => setTimeout(r, 300));
        ps = main.querySelectorAll('p');
    }
    const samples = [];
    for (let i = 0; i < 50; i++) {
        const p = ps[(i * 3) % ps.length];
        const rect = p.getBoundingClientRect();
        const t = now();
        p.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, clientX: rect.x + 5, clientY: rect.y + 5 }));
        p.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: rect.x + 5, clientY: rect.y + 5 }));
        samples.push(now() - t);
    }
    samples.sort((a, b) => a - b);
    return {
        hoverMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(3),
        hoverP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(3),
        hoverMaxMs: +samples[samples.length - 1].toFixed(3),
    };
}
`;

const typingCost = () => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    // Create a fresh editable target at the top of main.
    const p = document.createElement('p');
    p.className = '__perf__';
    p.setAttribute('contenteditable', 'true');
    main.prepend(p);
    await new Promise(r => setTimeout(r, 300));
    p.focus();
    const sel = getSelection();
    const r = document.createRange();
    r.selectNodeContents(p);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);

    const samples = [];
    for (let i = 0; i < 100; i++) {
        const t = now();
        document.execCommand('insertText', false, 'a');
        samples.push(now() - t);
    }
    samples.sort((a, b) => a - b);
    p.remove();
    return {
        typingMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(3),
        typingP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(3),
        typingMaxMs: +samples[samples.length - 1].toFixed(3),
    };
}
`;

const serializeCost = () => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    const samples = [];
    for (let i = 0; i < 20; i++) {
        const t = now();
        const _ = main.innerHTML.length;
        samples.push(now() - t);
    }
    samples.sort((a, b) => a - b);
    return {
        serializeMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(3),
        serializeP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(3),
        serializedBytes: main.innerHTML.length,
    };
}
`;

const editorObserverScaling = () => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    // How long until a newly inserted <p> receives p9r-is-editor?
    const samples = [];
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('p');
        p.className = '__perf__';
        p.textContent = 'obs ' + i;
        const t = now();
        main.appendChild(p);
        // Spin microtasks until the attribute lands or 50 ms pass.
        const deadline = t + 50;
        while (!p.hasAttribute('p9r-is-editor') && now() < deadline) {
            await new Promise(r => setTimeout(r, 1));
        }
        samples.push(now() - t);
    }
    samples.sort((a, b) => a - b);
    return {
        observerLagMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(2),
        observerLagP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(2),
        observerLagMaxMs: +samples[samples.length - 1].toFixed(2),
    };
}
`;

const memoryFootprint = () => `
async () => {
    const mem = performance.memory;
    return {
        heapUsedMB: mem ? +(mem.usedJSHeapSize / 1048576).toFixed(2) : 0,
        domElements: document.querySelectorAll('*').length,
    };
}
`;

/* =========================================================================
 *  Driver scenarios — use Playwright's real input APIs so the editor's real
 *  event handlers (TextEditor, BlocActionGroup, DragManager…) are exercised.
 *  These are slower than browser scenarios (~1-5s each) but realistic.
 * ========================================================================= */

/** p95 / median / max helper. */
function stats(samples: number[], fix = 3): { median: number; p95: number; max: number; min: number } {
    const s = [...samples].sort((a, b) => a - b);
    const q = (p: number) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
    return {
        min: +s[0].toFixed(fix),
        median: +q(0.5).toFixed(fix),
        p95: +q(0.95).toFixed(fix),
        max: +s[s.length - 1].toFixed(fix),
    };
}

async function ensureFocusedParagraph(page: Page) {
    await page.evaluate(() => {
        const main = document.querySelector("main")!;
        let p = main.querySelector("p");
        if (!p) { p = document.createElement("p"); main.appendChild(p); }
        (p as HTMLElement).focus();
        const sel = getSelection()!;
        const r = document.createRange();
        r.selectNodeContents(p);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
    });
}

const typeAndEnter: DriverScenario = {
    kind: "driver",
    name: "type-and-enter",
    async run(page): Promise<Record<string, number>> {
        await ensureFocusedParagraph(page);
        const typeSamples: number[] = [];
        const enterSamples: number[] = [];
        for (let cycle = 0; cycle < 20; cycle++) {
            for (let i = 0; i < 10; i++) {
                const t = await page.evaluate(() => performance.now());
                await page.keyboard.type("x");
                const t2 = await page.evaluate(() => performance.now());
                typeSamples.push(t2 - t);
            }
            const t = await page.evaluate(() => performance.now());
            await page.keyboard.press("Enter");
            const t2 = await page.evaluate(() => performance.now());
            enterSamples.push(t2 - t);
        }
        const ty = stats(typeSamples);
        const en = stats(enterSamples);
        return {
            typeMedianMs: ty.median, typeP95Ms: ty.p95, typeMaxMs: ty.max,
            enterMedianMs: en.median, enterP95Ms: en.p95, enterMaxMs: en.max,
        };
    },
};

const slashOpenLibrary: DriverScenario = {
    kind: "driver",
    name: "slash-open-library",
    async run(page): Promise<Record<string, number>> {
        // A fresh empty <p> at the end so "/" opens the library.
        await page.evaluate(() => {
            const main = document.querySelector("main")!;
            const p = document.createElement("p");
            main.appendChild(p);
        });
        await page.waitForTimeout(300);
        await page.evaluate(() => {
            const p = document.querySelector("main p:last-of-type") as HTMLElement;
            p.focus();
        });

        const samples: number[] = [];
        for (let i = 0; i < 8; i++) {
            const t = await page.evaluate(() => performance.now());
            await page.keyboard.press("/");
            const opened = await page.evaluate(async () => {
                // BlocLibrary is registered under the tag <w13c-action-bar>.
                const deadline = performance.now() + 1500;
                while (performance.now() < deadline) {
                    const lib = document.querySelector("w13c-action-bar");
                    if (lib && (lib as HTMLElement).offsetParent !== null) return performance.now();
                    await new Promise(r => requestAnimationFrame(r));
                }
                return -1;
            });
            if (opened > 0) samples.push(opened - t);
            // Close it deterministically — remove the library element and add a fresh empty <p>.
            await page.evaluate(() => {
                document.querySelector("w13c-action-bar")?.remove();
                const main = document.querySelector("main")!;
                const p = document.createElement("p");
                main.appendChild(p);
                (p as HTMLElement).focus();
            });
            await page.waitForTimeout(150);
        }
        if (samples.length === 0) return { slashOpenMedianMs: -1, slashOpenSamples: 0 };
        const s = stats(samples);
        return { slashOpenMedianMs: s.median, slashOpenP95Ms: s.p95, slashOpenMaxMs: s.max, slashOpenSamples: samples.length };
    },
};

const hoverRealMouse: DriverScenario = {
    kind: "driver",
    name: "hover-real-mouse",
    async run(page): Promise<Record<string, number>> {
        // Ensure at least 30 paragraphs.
        await page.evaluate(() => {
            const main = document.querySelector("main")!;
            while (main.querySelectorAll("p").length < 30) {
                const p = document.createElement("p");
                p.textContent = "hover target " + main.querySelectorAll("p").length;
                main.appendChild(p);
            }
        });
        await page.waitForTimeout(400);

        const boxes = await page.evaluate(() =>
            Array.from(document.querySelectorAll("main p")).slice(0, 30).map(p => {
                const r = (p as HTMLElement).getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            })
        );

        const frameTimes: number[] = [];
        await page.evaluate(() => {
            (window as any).__perfFrames = [];
            let last = performance.now();
            const loop = () => {
                const t = performance.now();
                (window as any).__perfFrames.push(t - last);
                last = t;
                (window as any).__perfRaf = requestAnimationFrame(loop);
            };
            (window as any).__perfRaf = requestAnimationFrame(loop);
        });

        for (const b of boxes) {
            await page.mouse.move(b.x, b.y, { steps: 3 });
        }
        await page.waitForTimeout(200);

        const frames = await page.evaluate(() => {
            cancelAnimationFrame((window as any).__perfRaf);
            const f = (window as any).__perfFrames as number[];
            (window as any).__perfFrames = null;
            return f;
        });
        frameTimes.push(...frames);
        if (frameTimes.length === 0) return { hoverFramesP95Ms: 0, hoverFramesMaxMs: 0, hoverFrameCount: 0 };
        const s = stats(frameTimes);
        return { hoverFrameMedianMs: s.median, hoverFrameP95Ms: s.p95, hoverFrameMaxMs: s.max, hoverFrameCount: frameTimes.length };
    },
};

/**
 * Forces the BAG's duplicate button to show on a plain <p> (via the
 * `p9r-force-duplicate-button` opt-in attribute documented in CLAUDE.md) and
 * measures the real hover→click→duplicate cycle. This exercises the full
 * BlocActionGroup pipeline: feature map refresh, positioning, click handler,
 * deep-clone, and the subsequent ObserverManager pass on the clone.
 */
const bagDuplicate: DriverScenario = {
    kind: "driver",
    name: "bag-duplicate",
    async run(page): Promise<Record<string, number>> {
        await page.evaluate(() => {
            const main = document.querySelector("main")!;
            main.querySelectorAll("p.__perf_bag__").forEach(n => n.remove());
            const p = document.createElement("p");
            p.className = "__perf_bag__";
            p.setAttribute("p9r-force-duplicate-button", "true");
            p.textContent = "dup target";
            main.appendChild(p);
        });
        await page.waitForTimeout(400);

        const countBefore = await page.evaluate(() => document.querySelectorAll("main p.__perf_bag__").length);
        const samples: number[] = [];
        for (let i = 0; i < 8; i++) {
            const box = await page.evaluate(() => {
                const p = document.querySelector("main p.__perf_bag__:last-of-type") as HTMLElement;
                const r = p.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            });
            await page.mouse.move(box.x + 50, box.y + 50);
            await page.mouse.move(box.x, box.y);
            const btn = await page.evaluate(async () => {
                const deadline = performance.now() + 800;
                while (performance.now() < deadline) {
                    const b = document.querySelector('p9r-bloc-action-group [data-action="duplicate"]') as HTMLElement | null;
                    if (b && b.offsetParent !== null) {
                        const r = b.getBoundingClientRect();
                        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                    }
                    await new Promise(r => requestAnimationFrame(r));
                }
                return null;
            });
            if (!btn) break;
            const t = await page.evaluate(() => performance.now());
            await page.mouse.click(btn.x, btn.y);
            const t2 = await page.evaluate(() => performance.now());
            samples.push(t2 - t);
            await page.waitForTimeout(60);
        }
        const countAfter = await page.evaluate(() => document.querySelectorAll("main p.__perf_bag__").length);
        if (samples.length === 0) return { bagDuplicateSamples: 0, bagDuplicateMedianMs: -1, bagDuplicateCreated: 0 };
        const s = stats(samples);
        return {
            bagDuplicateMedianMs: s.median,
            bagDuplicateP95Ms: s.p95,
            bagDuplicateMaxMs: s.max,
            bagDuplicateCreated: countAfter - countBefore,
        };
    },
};

/**
 * Measures the full HTML5 drag cycle on a text bloc: dragstart → dragover
 * (DragManager positions the drop indicator) → drop (DOM reorder + observer
 * pass on the moved node). Uses synthetic DataTransfer + dispatched events
 * because Playwright's native `page.mouse` doesn't trigger HTML5 drag across
 * all chromium versions under Bun.
 */
const dragReorder: DriverScenario = {
    kind: "driver",
    name: "drag-reorder",
    async run(page): Promise<Record<string, number>> {
        await page.evaluate(() => {
            const main = document.querySelector("main")!;
            main.querySelectorAll("p.__perf_drag__").forEach(n => n.remove());
            for (let i = 0; i < 6; i++) {
                const p = document.createElement("p");
                p.className = "__perf_drag__";
                p.textContent = "drag " + i;
                main.appendChild(p);
            }
        });
        await page.waitForTimeout(400);

        const result = await page.evaluate(async () => {
            const now = () => performance.now();
            const samples: number[] = [];
            const indicatorSamples: number[] = [];
            for (let i = 0; i < 6; i++) {
                const ps = Array.from(document.querySelectorAll("main p.__perf_drag__")) as HTMLElement[];
                if (ps.length < 2) break;
                const src = ps[0];
                const dst = ps[ps.length - 1];
                const srcRect = src.getBoundingClientRect();
                const dstRect = dst.getBoundingClientRect();
                const dt = new DataTransfer();
                const t0 = now();
                src.dispatchEvent(new DragEvent("dragstart", {
                    bubbles: true, cancelable: true, dataTransfer: dt,
                    clientX: srcRect.x + 5, clientY: srcRect.y + 5,
                }));
                await new Promise(r => requestAnimationFrame(r));
                dst.dispatchEvent(new DragEvent("dragover", {
                    bubbles: true, cancelable: true, dataTransfer: dt,
                    clientX: dstRect.x + 5, clientY: dstRect.y + dstRect.height - 2,
                }));
                const tIndicator = now();
                // Wait one frame for DragManager to position the indicator.
                await new Promise(r => requestAnimationFrame(r));
                const indicator = document.querySelector("[class*='drop-indicator'], [data-p9r-drop-indicator]") as HTMLElement | null;
                if (indicator) indicatorSamples.push(now() - tIndicator);
                dst.dispatchEvent(new DragEvent("drop", {
                    bubbles: true, cancelable: true, dataTransfer: dt,
                    clientX: dstRect.x + 5, clientY: dstRect.y + dstRect.height - 2,
                }));
                src.dispatchEvent(new DragEvent("dragend", {
                    bubbles: true, cancelable: true, dataTransfer: dt,
                }));
                samples.push(now() - t0);
                await new Promise(r => setTimeout(r, 80));
            }
            const stat = (arr: number[]) => {
                if (arr.length === 0) return { median: -1, p95: -1, max: -1 };
                const s = [...arr].sort((a, b) => a - b);
                const q = (p: number) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
                return { median: +q(0.5).toFixed(3), p95: +q(0.95).toFixed(3), max: +s[s.length - 1].toFixed(3) };
            };
            return { full: stat(samples), ind: stat(indicatorSamples), n: samples.length };
        });

        return {
            dragCycleMedianMs: result.full.median,
            dragCycleP95Ms: result.full.p95,
            dragCycleMaxMs: result.full.max,
            dragIndicatorMedianMs: result.ind.median,
            dragSamples: result.n,
        };
    },
};

/**
 * Simulates a user holding the Enter key to create many paragraphs in a row.
 * Reproduces the hand-reported lag: each Enter triggers the parent editor's
 * `onChildrenAdded` → `CompSync.init()` which currently re-runs
 * `slotEditor.viewEditor()` on EVERY sibling, giving O(N²) work.
 */
const holdEnter30: DriverScenario = {
    kind: "driver",
    name: "hold-enter-30",
    async run(page): Promise<Record<string, number>> {
        await ensureFocusedParagraph(page);
        // Type something in the starting paragraph so Enter creates a real sibling
        // rather than triggering Backspace-on-empty behavior on the following key.
        await page.keyboard.type("seed");

        const enterSamples: number[] = [];
        const t0 = await page.evaluate(() => performance.now());
        for (let i = 0; i < 30; i++) {
            const t = await page.evaluate(() => performance.now());
            await page.keyboard.press("Enter");
            const t2 = await page.evaluate(() => performance.now());
            enterSamples.push(t2 - t);
        }
        const tEnd = await page.evaluate(() => performance.now());

        const s = stats(enterSamples);
        return {
            holdEnterTotalMs: +(tEnd - t0).toFixed(1),
            holdEnterMedianMs: s.median,
            holdEnterP95Ms: s.p95,
            holdEnterMaxMs: s.max,
            holdEnterLastMs: +enterSamples[enterSamples.length - 1].toFixed(3),
        };
    },
};

/**
 * Simulates a real OS key-repeat: Enter held down for ~500ms. Playwright's
 * `keyboard.down` + `up` replays native auto-repeat keydown events, unlike
 * 30 sequential `press()` calls which are discrete. Catches focus-race bugs
 * where the double-rAF focus-on-new-sibling hasn't fired yet, so every
 * repeated Enter lands on the SAME original target and `target.after()`
 * stacks siblings behind it.
 */
const holdEnterReal: DriverScenario = {
    kind: "driver",
    name: "hold-enter-real",
    async run(page): Promise<Record<string, number>> {
        await ensureFocusedParagraph(page);
        await page.keyboard.type("seed");

        const countBefore = await page.evaluate(() => document.querySelectorAll("main p").length);

        // Simulate OS key-repeat: 15 synthetic keydowns at ~33ms intervals,
        // all dispatched to whatever is `activeElement` at fire time (which is
        // what the OS does). Playwright's `keyboard.down` only fires once, so
        // we hand-roll the loop via CDP-free page.evaluate.
        const t0 = await page.evaluate(() => performance.now());
        await page.evaluate(async () => {
            const fire = () => {
                const target = document.activeElement as HTMLElement;
                if (!target) return;
                const ev = new KeyboardEvent("keydown", {
                    key: "Enter", code: "Enter", keyCode: 13, which: 13,
                    bubbles: true, cancelable: true, repeat: true,
                });
                target.dispatchEvent(ev);
            };
            for (let i = 0; i < 15; i++) {
                fire();
                await new Promise(r => setTimeout(r, 33));
            }
        });
        // Let observers + rAFs settle
        await new Promise(r => setTimeout(r, 300));
        const tEnd = await page.evaluate(() => performance.now());

        const countAfter = await page.evaluate(() => document.querySelectorAll("main p").length);
        const created = countAfter - countBefore;

        // Check stacking: are all created <p> adjacent and in insertion order,
        // or are they piled up right after the seed paragraph?
        // Distinguish "stacked" from "chained": if focus stayed on the seed
        // (because async focus transfer lost the race), every repeated Enter
        // landed on seed and `seed.after()` stacked all siblings. In that
        // case activeElement is still seed. If chaining worked, focus should
        // have walked forward and activeElement is the last created <p>.
        const focusState = await page.evaluate(() => {
            const ps = Array.from(document.querySelectorAll("main p")) as HTMLElement[];
            const seed = ps.find(p => (p.textContent || "").includes("seed"));
            return {
                focusOnSeed: document.activeElement === seed,
                lastEmptyIsActive: ps.length > 0 && document.activeElement === ps[ps.length - 1],
            };
        });

        return {
            holdRealTotalMs: +(tEnd - t0).toFixed(1),
            holdRealCreated: created,
            holdRealStacked: focusState.focusOnSeed ? 1 : 0,
            holdRealChained: focusState.lastEmptyIsActive ? 1 : 0,
        };
    },
};

const selectTextToolbar: DriverScenario = {
    kind: "driver",
    name: "select-text-toolbar",
    async run(page): Promise<Record<string, number>> {
        // Create a paragraph with enough text.
        await page.evaluate(() => {
            const main = document.querySelector("main")!;
            const existing = main.querySelector("p.__perf_sel__") as HTMLElement | null;
            const p = existing ?? document.createElement("p");
            p.className = "__perf_sel__";
            p.textContent = "The quick brown fox jumps over the lazy dog ".repeat(3);
            if (!existing) main.appendChild(p);
        });
        await page.waitForTimeout(300);

        const samples: number[] = [];
        for (let i = 0; i < 8; i++) {
            // Collapse selection first.
            await page.evaluate(() => getSelection()?.removeAllRanges());
            await page.waitForTimeout(50);
            const t = await page.evaluate(() => performance.now());
            const opened = await page.evaluate(async () => {
                const p = document.querySelector("main p.__perf_sel__")!;
                const r = document.createRange();
                r.setStart(p.firstChild!, 4);
                r.setEnd(p.firstChild!, 25);
                const sel = getSelection()!;
                sel.removeAllRanges();
                sel.addRange(r);
                document.dispatchEvent(new Event("selectionchange"));
                const deadline = performance.now() + 1000;
                while (performance.now() < deadline) {
                    const bar = document.querySelector("w13c-floating-toolbar") as HTMLElement | null;
                    if (bar && (bar.offsetParent !== null || getComputedStyle(bar).visibility !== "hidden")) {
                        return performance.now();
                    }
                    await new Promise(r => requestAnimationFrame(r));
                }
                return -1;
            });
            if (opened > 0) samples.push(opened - t);
        }
        if (samples.length === 0) return { selectToolbarSamples: 0, selectToolbarMedianMs: -1 };
        const s = stats(samples);
        return { selectToolbarMedianMs: s.median, selectToolbarP95Ms: s.p95, selectToolbarMaxMs: s.max, selectToolbarSamples: samples.length };
    },
};

/**
 * Single-paragraph insert cost: time from `appendChild(p)` to the node receiving
 * `p9r-is-editor`. This is the user-perceived latency of "I added one element".
 * Baseline-free intuition: <5ms is healthy, >15ms is a bug.
 */
const singleParagraphInsert = () => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    // Warmup: the very first insert pays one-time costs (shadow root creation, etc.).
    {
        const warm = document.createElement('p');
        main.appendChild(warm);
        const deadline = now() + 100;
        while (!warm.hasAttribute('p9r-is-editor') && now() < deadline) {
            await new Promise(r => setTimeout(r, 1));
        }
    }

    const samples = [];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('p');
        p.textContent = 'single ' + i;
        const t = now();
        main.appendChild(p);
        const deadline = t + 100;
        while (!p.hasAttribute('p9r-is-editor') && now() < deadline) {
            await new Promise(r => setTimeout(r, 1));
        }
        samples.push(now() - t);
        // Small gap so each insert is isolated.
        await new Promise(r => setTimeout(r, 10));
    }
    samples.sort((a, b) => a - b);
    return {
        singleInsertMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(2),
        singleInsertP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(2),
        singleInsertMaxMs: +samples[samples.length - 1].toFixed(2),
    };
}
`;

/**
 * Build a large grid (rows × cols <p> inside a wrapper). Measures raw DOM
 * append time, observer settle wait, and final serialized byte count. Mimics
 * the "grid of items" workload users hit when composing big templates.
 */
const largeGridBuild = (rows: number, cols: number) => `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    main.querySelectorAll('.__perf_grid__').forEach(el => el.remove());
    await new Promise(r => setTimeout(r, 100));

    const t0 = now();
    const grid = document.createElement('div');
    grid.className = '__perf_grid__';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(${cols}, 1fr)';
    for (let r = 0; r < ${rows}; r++) {
        for (let c = 0; c < ${cols}; c++) {
            const cell = document.createElement('div');
            const p = document.createElement('p');
            p.textContent = 'cell ' + r + ',' + c;
            cell.appendChild(p);
            grid.appendChild(cell);
        }
    }
    main.appendChild(grid);
    const appendMs = now() - t0;

    // Wait for ObserverManager to editorize everything.
    const tObs = now();
    const total = grid.querySelectorAll('p').length;
    const deadline = tObs + 5000;
    while (now() < deadline) {
        const done = grid.querySelectorAll('p[p9r-is-editor]').length;
        if (done >= total) break;
        await new Promise(r => setTimeout(r, 10));
    }
    const observeMs = now() - tObs;

    const tSer = now();
    const editorModeBytes = main.innerHTML.length;
    const serializeMs = now() - tSer;

    // Serialized for save: switches to VIEW mode and strips runtime attrs.
    const em = document.EditorManager;
    const tView = now();
    const viewModeBytes = em ? em.getContent().length : -1;
    const viewSerializeMs = now() - tView;

    return {
        buildAppendMs: +appendMs.toFixed(2),
        buildObserveMs: +observeMs.toFixed(1),
        buildSerializeMs: +serializeMs.toFixed(2),
        buildViewSerializeMs: +viewSerializeMs.toFixed(2),
        buildCellCount: total,
        buildEditorModeBytes: editorModeBytes,
        buildViewModeBytes: viewModeBytes,
    };
}
`;

/**
 * Simulates the real "save page" flow: build a big grid, then POST /api/page
 * with the serialized HTML. Captures network + server + Mongo roundtrip.
 */
const pageSaveRoundtrip: BrowserScenario = {
    name: "page-save-roundtrip",
    run: `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    main.querySelectorAll('.__perf_save__').forEach(el => el.remove());
    const grid = document.createElement('div');
    grid.className = '__perf_save__';
    for (let i = 0; i < 200; i++) {
        const p = document.createElement('p');
        p.textContent = 'save ' + i;
        grid.appendChild(p);
    }
    main.appendChild(grid);
    await new Promise(r => setTimeout(r, 400));

    // Serialize through the real pipeline: EditorManager.getContent() switches
    // to VIEW mode first, so runtime-only attrs (p9r-is-editor, etc.) are
    // stripped — this is what save() actually sends to the API.
    const em = document.EditorManager;
    if (!em) throw new Error('EditorManager not on document');
    const tSer = now();
    const content = em.getContent();
    const serializeMs = now() - tSer;
    // Also capture the raw editor-mode bytes for comparison.
    const editorModeBytes = main.innerHTML.length;

    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '/perf-test';
    const identifier = urlParams.get('identifier') || 'perf-test';

    const body = {
        content,
        path, identifier,
        title: 'Perf Test',
        description: '',
        visible: true,
        tags: '',
    };
    const target = '/page-builder/api/page?path=' + encodeURIComponent(path) + '&identifier=' + encodeURIComponent(identifier);

    const samples = [];
    const payloadBytes = JSON.stringify(body).length;
    for (let i = 0; i < 5; i++) {
        const t = now();
        const res = await fetch(target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('save failed: ' + res.status + ' ' + await res.text());
        samples.push(now() - t);
    }
    samples.sort((a, b) => a - b);
    return {
        pageSaveMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(1),
        pageSaveP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(1),
        pageSaveMaxMs: +samples[samples.length - 1].toFixed(1),
        pageSaveSerializeMs: +serializeMs.toFixed(2),
        pageSavePayloadBytes: payloadBytes,
        pageSaveContentBytes: content.length,
        pageSaveEditorModeBytes: editorModeBytes,
    };
}
`,
};

/** POST /api/template with a reasonably large HTML body. */
const templateSaveRoundtrip: BrowserScenario = {
    name: "template-save-roundtrip",
    run: `
async () => {
    const now = () => performance.now();
    const cells = [];
    for (let i = 0; i < 200; i++) cells.push('<div><p>template cell ' + i + '</p></div>');
    const content = '<div class="grid">' + cells.join('') + '</div>';
    const payload = JSON.stringify({ name: 'perf-tpl', description: '', content, category: 'perf' });
    const payloadBytes = payload.length;

    const samples = [];
    for (let i = 0; i < 5; i++) {
        const t = now();
        const res = await fetch('/page-builder/api/template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            credentials: 'include',
        });
        if (!res.ok) throw new Error('template save failed: ' + res.status);
        samples.push(now() - t);
    }
    samples.sort((a, b) => a - b);
    return {
        templateSaveMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(1),
        templateSaveP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(1),
        templateSaveMaxMs: +samples[samples.length - 1].toFixed(1),
        templateSavePayloadBytes: payloadBytes,
    };
}
`,
};

/**
 * Reads the listener tallies collected by the init-script installed before
 * navigation (see run.ts → installListenerTracker). No timing — this is a
 * structural signal: big jumps mean we leaked handlers.
 */
const listenerScan: BrowserScenario = {
    name: "listener-scan",
    run: `
async () => {
    const tracker = (window).__perfListeners;
    if (!tracker) return { listenersTotal: -1, listenersWindow: -1, listenersDocument: -1 };
    // Only counts live listeners (add - remove). Tracker is installed before any
    // app code runs, so this number reflects everything the editor attached.
    const byType = tracker.byType();
    const topTypes = Object.entries(byType).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const out = {
        listenersTotal: tracker.total(),
        listenersWindow: tracker.onWindow(),
        listenersDocument: tracker.onDocument(),
        listenersDistinctTypes: Object.keys(byType).length,
    };
    for (const [t, n] of topTypes) out['listeners_' + t] = n;
    return out;
}
`,
};

/**
 * Measures how many listeners get attached per element as the editor
 * editorizes new nodes. Baseline → add 200 <p> → wait for observer → diff.
 */
const listenerGrowth: BrowserScenario = {
    name: "listener-growth",
    run: `
async () => {
    const tracker = (window).__perfListeners;
    if (!tracker) return { growthBefore: -1, growthAfter: -1, growthDelta: -1, growthPerElement: -1 };
    const main = document.querySelector('main');
    const now = () => performance.now();

    // Let any pending init settle.
    await new Promise(r => setTimeout(r, 200));
    const before = tracker.total();
    const byTypeBefore = tracker.byType();

    const frag = document.createDocumentFragment();
    for (let i = 0; i < 200; i++) {
        const p = document.createElement('p');
        p.className = '__perf_growth__';
        p.textContent = 'growth ' + i;
        frag.appendChild(p);
    }
    const t0 = now();
    main.appendChild(frag);

    // Wait until every inserted <p> is editorized.
    const deadline = t0 + 5000;
    while (now() < deadline) {
        const done = main.querySelectorAll('p.__perf_growth__[p9r-is-editor]').length;
        if (done >= 200) break;
        await new Promise(r => setTimeout(r, 10));
    }
    await new Promise(r => setTimeout(r, 200));

    const after = tracker.total();
    const byTypeAfter = tracker.byType();
    const delta = after - before;

    // Per-type diff, top 5 growers.
    const diffs = {};
    const keys = new Set([...Object.keys(byTypeBefore), ...Object.keys(byTypeAfter)]);
    for (const k of keys) {
        const d = (byTypeAfter[k] || 0) - (byTypeBefore[k] || 0);
        if (d !== 0) diffs[k] = d;
    }
    const top = Object.entries(diffs).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const out = {
        growthBefore: before,
        growthAfter: after,
        growthDelta: delta,
        growthPerElement: +(delta / 200).toFixed(2),
    };
    for (const [t, n] of top) out['growth_' + t] = n;

    // Clean up so later scenarios start from a neutral DOM.
    main.querySelectorAll('.__perf_growth__').forEach(el => el.remove());
    return out;
}
`,
    absolutes: {
        // Hard sanity cap: more than 3 listeners per plain <p> means something
        // is leaking or we're attaching handlers that could live on a delegated parent.
        growthPerElement: 3,
    },
};

/**
 * Cost of EditorManager.switchMode(). `save()` and `getContent()` both call it
 * twice back-to-back, and it iterates every registered editor to dispatch
 * `onSwitchMode`. With a 400-cell grid this hot loop happens on every save —
 * worth a timing signal so regressions in `onSwitchMode` overrides surface.
 */
const modeSwitchCost: BrowserScenario = {
    name: "mode-switch-cost",
    run: `
async () => {
    const main = document.querySelector('main');
    const em = document.EditorManager;
    if (!em) return { modeSwitchMedianMs: -1, modeSwitchP95Ms: -1, modeSwitchMaxMs: -1, modeSwitchEditors: -1 };
    const now = () => performance.now();

    // Build a grid of paragraphs so onSwitchMode has something to iterate.
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 200; i++) {
        const p = document.createElement('p');
        p.className = '__perf_switch__';
        p.textContent = 'switch ' + i;
        frag.appendChild(p);
    }
    main.appendChild(frag);
    // Wait until all 200 are editorized.
    const deadline = now() + 5000;
    while (now() < deadline) {
        if (main.querySelectorAll('p.__perf_switch__[p9r-is-editor]').length >= 200) break;
        await new Promise(r => setTimeout(r, 10));
    }
    await new Promise(r => setTimeout(r, 200));

    const editorCount = document.compIdentifierToEditor?.size ?? 0;
    const samples = [];
    for (let i = 0; i < 10; i++) {
        const t0 = now();
        em.switchMode(p9r.mode.VIEW);
        const toView = now() - t0;
        const t1 = now();
        em.switchMode(p9r.mode.EDITOR);
        const toEditor = now() - t1;
        samples.push(toView, toEditor);
        await new Promise(r => setTimeout(r, 20));
    }
    samples.sort((a, b) => a - b);

    // Cleanup.
    main.querySelectorAll('.__perf_switch__').forEach(el => el.remove());
    return {
        modeSwitchMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(2),
        modeSwitchP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(2),
        modeSwitchMaxMs: +samples[samples.length - 1].toFixed(2),
        modeSwitchEditors: editorCount,
    };
}
`,
    absolutes: { modeSwitchMedianMs: 50, modeSwitchP95Ms: 120, modeSwitchMaxMs: 200 },
};

/**
 * Leak detector: insert 500 paragraphs, remove them all, check that
 *   (a) the editor registry empties out,
 *   (b) no listener accumulates on window or document.
 * Per-element listeners are ignored — once the <p> is removed its handlers
 * are GC'd even if `removeEventListener` was never called, so they don't
 * constitute a real leak. Window/document handlers do survive, so a forgotten
 * `removeEventListener` on a global target would show up here.
 */
const deleteCleanup: BrowserScenario = {
    name: "delete-cleanup",
    run: `
async () => {
    const tracker = (window).__perfListeners;
    if (!tracker) return { cleanupLeakedWindowListeners: -1, cleanupLeakedDocumentListeners: -1 };
    const main = document.querySelector('main');
    const now = () => performance.now();

    await new Promise(r => setTimeout(r, 200));
    const beforeWindow = tracker.onWindow();
    const beforeDocument = tracker.onDocument();
    const beforeEditors = document.compIdentifierToEditor?.size ?? 0;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < 500; i++) {
        const p = document.createElement('p');
        p.className = '__perf_cleanup__';
        p.textContent = 'cleanup ' + i;
        frag.appendChild(p);
    }
    main.appendChild(frag);
    const ready = now() + 6000;
    while (now() < ready) {
        if (main.querySelectorAll('p.__perf_cleanup__[p9r-is-editor]').length >= 500) break;
        await new Promise(r => setTimeout(r, 10));
    }
    await new Promise(r => setTimeout(r, 200));
    const afterInsertWindow = tracker.onWindow();
    const afterInsertDocument = tracker.onDocument();
    const afterInsertEditors = document.compIdentifierToEditor?.size ?? 0;

    // Delete them all at once and measure cleanup time.
    const t0 = now();
    main.querySelectorAll('p.__perf_cleanup__').forEach(el => el.remove());
    const syncRemoveMs = now() - t0;
    // MutationObserver fires on microtask — wait for dispose() to have run.
    await new Promise(r => setTimeout(r, 300));

    const afterWindow = tracker.onWindow();
    const afterDocument = tracker.onDocument();
    const afterEditors = document.compIdentifierToEditor?.size ?? 0;
    return {
        cleanupWindowBefore: beforeWindow,
        cleanupWindowPeak: afterInsertWindow,
        cleanupWindowAfter: afterWindow,
        cleanupLeakedWindowListeners: afterWindow - beforeWindow,
        cleanupDocumentBefore: beforeDocument,
        cleanupDocumentPeak: afterInsertDocument,
        cleanupDocumentAfter: afterDocument,
        cleanupLeakedDocumentListeners: afterDocument - beforeDocument,
        cleanupEditorsBefore: beforeEditors,
        cleanupEditorsPeak: afterInsertEditors,
        cleanupEditorsAfter: afterEditors,
        cleanupLeakedEditors: afterEditors - beforeEditors,
        cleanupSyncRemoveMs: +syncRemoveMs.toFixed(2),
    };
}
`,
    absolutes: {
        // Hard zero tolerance on shared targets and editor registry.
        // Per-element listeners are excluded — they're GC'd with the removed node.
        cleanupLeakedWindowListeners: 0,
        cleanupLeakedDocumentListeners: 0,
        cleanupLeakedEditors: 0,
        cleanupSyncRemoveMs: 100,
    },
};

/**
 * Deeply nested insertion: build a 30-level chain of <ul><li>…</ul></li> that
 * collapses to a single subtree insertion. ObserverManager.make_it_editor runs
 * querySelectorAll('*') on the root when the subtree lands, so this exercises
 * the pathological "one mutation, many editors" path.
 */
const deepNesting: BrowserScenario = {
    name: "deep-nesting-build",
    run: `
async () => {
    const main = document.querySelector('main');
    const now = () => performance.now();
    const DEPTH = 30;

    // Build detached tree — one single insertion triggers one mutation record.
    let root = document.createElement('ul');
    root.className = '__perf_deep__';
    let cursor = root;
    for (let i = 0; i < DEPTH; i++) {
        const li = document.createElement('li');
        const child = document.createElement('ul');
        li.appendChild(child);
        cursor.appendChild(li);
        cursor = child;
    }
    // Leaf paragraph at the bottom.
    const leaf = document.createElement('p');
    leaf.textContent = 'leaf';
    cursor.appendChild(leaf);

    const totalEditables = root.querySelectorAll('ul, li, p').length;

    const t0 = now();
    main.appendChild(root);
    // Wait until the leaf paragraph is editorized (last-to-be-reached).
    const deadline = t0 + 5000;
    while (now() < deadline) {
        if (leaf.hasAttribute('p9r-is-editor')) break;
        await new Promise(r => setTimeout(r, 5));
    }
    const settleMs = now() - t0;

    // Count how many descendants got editorized (ul only — li is not registered).
    const editorized = root.querySelectorAll('[p9r-is-editor]').length;

    // Cleanup.
    root.remove();
    await new Promise(r => setTimeout(r, 200));
    return {
        deepNestingSettleMs: +settleMs.toFixed(2),
        deepNestingNodes: totalEditables,
        deepNestingEditorized: editorized,
    };
}
`,
    absolutes: { deepNestingSettleMs: 150 },
};

/**
 * Core Web Vitals on the editor page. Re-navigates so the measurement starts
 * from a clean document state, then collects LCP (largest-contentful-paint),
 * CLS (layout-shift entries), and classic navigation timings. INP is not
 * measured here — it needs real continuous interaction; `hover-real-mouse` /
 * `typing-cost` already cover per-event handler latency on this codebase.
 */
const webVitals: DriverScenario = {
    kind: "driver",
    name: "web-vitals",
    async run(page): Promise<Record<string, number>> {
        const currentUrl = page.url();
        // Install collectors BEFORE navigation so the first entries aren't lost.
        await page.evaluate(() => {
            const w = window as unknown as {
                __vitals?: { lcp: number; cls: number; entries: number };
                __lcpObserver?: PerformanceObserver;
                __clsObserver?: PerformanceObserver;
            };
            w.__vitals = { lcp: 0, cls: 0, entries: 0 };
        });
        await page.goto(currentUrl, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => {
            const w = window as unknown as { __vitals: { lcp: number; cls: number; entries: number } };
            w.__vitals = { lcp: 0, cls: 0, entries: 0 };
            const lcp = new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    w.__vitals.lcp = Math.max(w.__vitals.lcp, e.startTime);
                }
            });
            lcp.observe({ type: "largest-contentful-paint", buffered: true });
            const cls = new PerformanceObserver((list) => {
                for (const e of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
                    if (!e.hadRecentInput) {
                        w.__vitals.cls += e.value;
                        w.__vitals.entries++;
                    }
                }
            });
            cls.observe({ type: "layout-shift", buffered: true });
        });
        // Give the editor time to boot, paint, and settle layout shifts.
        await page.waitForSelector("main p", { timeout: 10000 });
        await page.waitForTimeout(3000);

        const result = await page.evaluate(() => {
            const w = window as unknown as { __vitals: { lcp: number; cls: number; entries: number } };
            const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
            const paints = performance.getEntriesByType("paint") as Array<PerformanceEntry & { name: string; startTime: number }>;
            const fcp = paints.find(p => p.name === "first-contentful-paint")?.startTime ?? 0;
            return {
                lcp: w.__vitals.lcp,
                cls: w.__vitals.cls,
                clsEntries: w.__vitals.entries,
                fcp,
                domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
                loadEvent: nav ? nav.loadEventEnd - nav.startTime : 0,
            };
        });
        return {
            lcpMs: +result.lcp.toFixed(1),
            cls: +result.cls.toFixed(4),
            clsShifts: result.clsEntries,
            fcpMs: +result.fcp.toFixed(1),
            domContentLoadedMs: +result.domContentLoaded.toFixed(1),
            loadEventMs: +result.loadEvent.toFixed(1),
        };
    },
    absolutes: { lcpMs: 2500, cls: 0.1, fcpMs: 2000, domContentLoadedMs: 2000 },
};

/**
 * Shadow DOM topology survey. Walks every shadow root reachable from the
 * document, reports max depth + total shadow root count + max slotted children
 * in a single host. Deep shadow trees inflate style recalc cost and make
 * debugging harder; this is a structural canary for accidental nesting.
 */
const shadowDomDepth: BrowserScenario = {
    name: "shadow-dom-depth",
    run: `
async () => {
    const visit = (root, depth, acc) => {
        acc.maxDepth = Math.max(acc.maxDepth, depth);
        const hosts = root.querySelectorAll('*');
        for (const el of hosts) {
            if (el.shadowRoot) {
                acc.totalShadowRoots++;
                // Count slotted children on this host (light-DOM children projected in).
                acc.maxSlotted = Math.max(acc.maxSlotted, el.children.length);
                visit(el.shadowRoot, depth + 1, acc);
            }
        }
    };
    const acc = { maxDepth: 0, totalShadowRoots: 0, maxSlotted: 0 };
    visit(document, 0, acc);

    // Also measure the cost of a style recalc triggered by toggling a CSS variable on :root.
    const now = () => performance.now();
    const samples = [];
    for (let i = 0; i < 20; i++) {
        document.documentElement.style.setProperty('--__perf_probe', String(i));
        const t = now();
        // Force layout by reading a property that depends on it.
        void document.body.getBoundingClientRect();
        samples.push(now() - t);
    }
    document.documentElement.style.removeProperty('--__perf_probe');
    samples.sort((a, b) => a - b);
    return {
        shadowMaxDepth: acc.maxDepth,
        shadowRootCount: acc.totalShadowRoots,
        shadowMaxSlottedChildren: acc.maxSlotted,
        recalcMedianMs: +samples[Math.floor(samples.length / 2)].toFixed(3),
        recalcP95Ms: +samples[Math.floor(samples.length * 0.95)].toFixed(3),
    };
}
`,
    absolutes: { shadowMaxDepth: 5, recalcP95Ms: 5 },
};

/**
 * Reloads the editor while recording every HTTP request. Flags duplicate URLs
 * (same full URL fetched more than once — usually a bug), oversized payloads,
 * and responses served without compression. `getContent()` / `save()` aren't
 * called here — this is strictly the boot-time waterfall.
 */
const networkDuplicates: DriverScenario = {
    kind: "driver",
    name: "network-duplicates",
    async run(page): Promise<Record<string, number>> {
        type Req = { url: string; status: number; bytes: number; encoded: boolean };
        const requests: Req[] = [];
        const reqListener = (req: import("playwright").Request) => { /* noop — response captures the size */ void req; };
        const respListener = async (resp: import("playwright").Response) => {
            try {
                const url = resp.url();
                // Ignore anything not from the app origin (favicons etc. are fine).
                if (!url.startsWith(page.url().split("/").slice(0, 3).join("/"))) return;
                const enc = (resp.headers()["content-encoding"] || "").toLowerCase();
                const lenHdr = resp.headers()["content-length"];
                let bytes = lenHdr ? parseInt(lenHdr, 10) : 0;
                if (!bytes) {
                    try { const buf = await resp.body(); bytes = buf.byteLength; } catch { /* aborted */ }
                }
                requests.push({ url, status: resp.status(), bytes, encoded: enc === "gzip" || enc === "br" || enc === "deflate" });
            } catch { /* response already disposed */ }
        };
        page.on("request", reqListener);
        page.on("response", respListener);

        const currentUrl = page.url();
        await page.goto(currentUrl, { waitUntil: "load" });
        await page.waitForSelector("main p", { timeout: 10000 });
        await page.waitForTimeout(500);

        page.off("request", reqListener);
        page.off("response", respListener);

        const urls = new Map<string, number>();
        for (const r of requests) urls.set(r.url, (urls.get(r.url) ?? 0) + 1);
        const duplicates = Array.from(urls.values()).filter(n => n > 1).reduce((a, n) => a + (n - 1), 0);
        const duplicateUrls = Array.from(urls.entries()).filter(([, n]) => n > 1).length;
        const totalBytes = requests.reduce((a, r) => a + r.bytes, 0);
        const oversize = requests.filter(r => r.bytes > 500 * 1024).length;
        const uncompressed = requests.filter(r => !r.encoded && r.bytes > 50 * 1024).length;
        const failed = requests.filter(r => r.status >= 400).length;

        return {
            netRequestCount: requests.length,
            netUniqueUrls: urls.size,
            netDuplicateUrls: duplicateUrls,
            netDuplicateRequests: duplicates,
            netTotalKB: +(totalBytes / 1024).toFixed(1),
            netOversizePayloads: oversize,
            netUncompressedLargePayloads: uncompressed,
            netFailedRequests: failed,
        };
    },
    absolutes: {
        netDuplicateRequests: 0,
        netOversizePayloads: 0,
        netFailedRequests: 0,
    },
};

/**
 * Full create→destroy cycle. Adds 200 <p>, waits for editorization, then
 * removes them all. Checks three things that must hold after teardown:
 *   - document.compIdentifierToEditor returns to its pre-insert size
 *   - listener count returns to its pre-insert count (no leaked handlers)
 *   - heap delta is small (no retained Editor instances)
 * Absolute ceilings catch leaks the baseline might hide (baseline itself
 * could be leaky — we want a structural guarantee).
 */
const editorLifecycleLeak: BrowserScenario = {
    name: "editor-lifecycle-leak",
    run: `
async () => {
    const tracker = (window).__perfListeners;
    const main = document.querySelector('main');
    const mapBefore = document.compIdentifierToEditor?.size ?? -1;
    const listenersBefore = tracker ? tracker.total() : -1;
    // Only document+window listeners are reliable: element listeners die with
    // GC when the target is removed, but our tracker never sees the remove.
    // Document/window survive across the whole test, so residual > 0 = leak.
    const globalBefore = tracker ? (tracker.onWindow() + tracker.onDocument()) : -1;
    const heapBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;

    // Insert 200 <p> and wait for editorization.
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 200; i++) {
        const p = document.createElement('p');
        p.className = '__perf_leak__';
        p.textContent = 'leak ' + i;
        frag.appendChild(p);
    }
    main.appendChild(frag);
    const deadline = performance.now() + 5000;
    while (performance.now() < deadline) {
        const done = main.querySelectorAll('p.__perf_leak__[p9r-is-editor]').length;
        if (done >= 200) break;
        await new Promise(r => setTimeout(r, 10));
    }
    await new Promise(r => setTimeout(r, 200));
    const mapPeak = document.compIdentifierToEditor?.size ?? -1;
    const listenersPeak = tracker ? tracker.total() : -1;

    // Switch mode both ways to exercise the new onSwitchMode path and
    // make sure it doesn't leak anything either.
    document.EditorManager?.switchMode(p9r.mode.VIEW);
    document.EditorManager?.switchMode(p9r.mode.EDITOR);
    await new Promise(r => setTimeout(r, 100));

    // Remove all inserted nodes and wait for ObserverManager to dispose.
    main.querySelectorAll('.__perf_leak__').forEach(el => el.remove());
    await new Promise(r => setTimeout(r, 600));

    if (performance.memory) {
        // Give GC a nudge. Not guaranteed but helps stabilize numbers.
        for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 60));
    }

    const mapAfter = document.compIdentifierToEditor?.size ?? -1;
    const listenersAfter = tracker ? tracker.total() : -1;
    const globalAfter = tracker ? (tracker.onWindow() + tracker.onDocument()) : -1;
    const heapAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;

    return {
        leakMapBefore: mapBefore,
        leakMapPeak: mapPeak,
        leakMapAfter: mapAfter,
        leakMapResidual: mapAfter - mapBefore,
        leakListenersBefore: listenersBefore,
        leakListenersPeak: listenersPeak,
        leakListenersAfter: listenersAfter,
        leakGlobalResidual: globalAfter - globalBefore,
        leakHeapGrowthKB: +((heapAfter - heapBefore) / 1024).toFixed(1),
    };
}
`,
    absolutes: {
        // Map MUST return to baseline — strict 0.
        leakMapResidual: 0,
        // Document + window listeners MUST return to baseline. Element-level
        // listeners are fine to "leak" in our tracker (GC collects them with
        // the node), but listeners on `document`/`window` outlive the DOM.
        leakGlobalResidual: 0,
    },
};

export const SCENARIOS: Scenario[] = [
    // Structural — run first so later scenarios' insertions don't pollute the count.
    listenerScan,
    listenerGrowth,
    editorLifecycleLeak,
    // Internals — cheap, always-on signals.
    { name: "bulk-insert-200",      run: bulkInsert(200),
        absolutes: { syncAppendMs: 5, maxLongTaskMs: 150 } },
    { name: "bulk-insert-1000",     run: bulkInsert(1000),
        absolutes: { syncAppendMs: 15, maxLongTaskMs: 400 } },
    { name: "observer-scaling",     run: editorObserverScaling(),
        absolutes: { observerLagMedianMs: 15, observerLagP95Ms: 25, observerLagMaxMs: 40 } },
    { name: "single-p-insert",      run: singleParagraphInsert(),
        absolutes: { singleInsertMedianMs: 10, singleInsertP95Ms: 20, singleInsertMaxMs: 30 } },
    { name: "hover-cost",           run: hoverCost(),
        absolutes: { hoverMedianMs: 2, hoverP95Ms: 5, hoverMaxMs: 10 } },
    { name: "typing-cost",          run: typingCost(),
        absolutes: { typingMedianMs: 3, typingP95Ms: 6, typingMaxMs: 15 } },
    { name: "serialize-cost",       run: serializeCost(),
        absolutes: { serializeMedianMs: 5, serializeP95Ms: 10 } },
    { name: "large-grid-build",     run: largeGridBuild(20, 20),
        absolutes: { buildAppendMs: 50, buildObserveMs: 2000, buildSerializeMs: 15, buildViewSerializeMs: 50 } },
    { name: "memory-footprint",     run: memoryFootprint() },
    modeSwitchCost,
    deleteCleanup,
    deepNesting,
    shadowDomDepth,
    webVitals,
    networkDuplicates,
    // Network roundtrips.
    pageSaveRoundtrip,
    templateSaveRoundtrip,
    // Human-like — exercise the real editor pipeline.
    typeAndEnter,
    slashOpenLibrary,
    hoverRealMouse,
    bagDuplicate,
    selectTextToolbar,
    dragReorder,
    holdEnter30,
    holdEnterReal,
];

// Absolute thresholds for driver scenarios (attached here because the scenario
// objects are defined inline above; mutating after definition keeps that terse).
typeAndEnter.absolutes = { typeMedianMs: 15, typeP95Ms: 30, enterMedianMs: 20, enterP95Ms: 40 };
slashOpenLibrary.absolutes = { slashOpenMedianMs: 50, slashOpenP95Ms: 100 };
hoverRealMouse.absolutes = { hoverFrameP95Ms: 25, hoverFrameMaxMs: 50 };
bagDuplicate.absolutes = { bagDuplicateMedianMs: 30, bagDuplicateP95Ms: 60 };
selectTextToolbar.absolutes = { selectToolbarMedianMs: 20, selectToolbarP95Ms: 40 };
dragReorder.absolutes = { dragCycleMedianMs: 30, dragCycleP95Ms: 60, dragIndicatorMedianMs: 20 };
holdEnter30.absolutes = { holdEnterMedianMs: 20, holdEnterP95Ms: 40, holdEnterMaxMs: 80 };
(pageSaveRoundtrip as BrowserScenario).absolutes = { pageSaveMedianMs: 200, pageSaveP95Ms: 500, pageSaveSerializeMs: 50 };
(templateSaveRoundtrip as BrowserScenario).absolutes = { templateSaveMedianMs: 200, templateSaveP95Ms: 500 };
