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

export const SCENARIOS: Scenario[] = [
    // Structural — run first so later scenarios' insertions don't pollute the count.
    listenerScan,
    listenerGrowth,
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
