import { describe, test, expect } from "bun:test";
import { classifyImages } from "src/server/imageOptimization/classifyImage";
import type { ImageMeasurement, ViewportLayout } from "src/server/imageOptimization/PlaywrightSession";
import { VIEWPORT_WIDTHS, VIEWPORT_HEIGHT } from "src/server/imageOptimization/viewports";

const VH = VIEWPORT_HEIGHT;

const rect = (viewport: number, cssWidth: number, top: number, height: number): ViewportLayout =>
    ({ viewport, cssWidth, top, height });

const img = (index: number, perViewport: ViewportLayout[]): ImageMeasurement => ({
    index,
    src: "",
    naturalWidth: 1000,
    perViewport,
});

// Quick helper: give an image the same rect at every measured viewport.
const everywhere = (index: number, r: Omit<ViewportLayout, "viewport">): ImageMeasurement =>
    img(index, VIEWPORT_WIDTHS.map(vw => ({ viewport: vw, ...r })));

describe("classifyImages — loading attribute", () => {
    test("an image above the fold at any viewport is eager", () => {
        const images = [everywhere(0, { cssWidth: 400, top: 100, height: 300 })];
        const cls = classifyImages(images, VH);
        expect(cls.get(0)!.loading).toBe("eager");
    });

    test("an image below the fold at every viewport is lazy", () => {
        const images = [everywhere(0, { cssWidth: 400, top: VH + 500, height: 300 })];
        const cls = classifyImages(images, VH);
        expect(cls.get(0)!.loading).toBe("lazy");
    });

    test("a 0-width image (display:none / hidden carousel slide) is lazy", () => {
        // Carousel next-slide: rect exists but cssWidth is 0.
        const images = [everywhere(0, { cssWidth: 0, top: 0, height: 0 })];
        const cls = classifyImages(images, VH);
        expect(cls.get(0)!.loading).toBe("lazy");
    });

    test("an image above fold only on desktop (hidden on mobile) is still eager", () => {
        // Mobile: cssWidth=0. Desktop: visible above fold.
        const pv: ViewportLayout[] = VIEWPORT_WIDTHS.map(vw =>
            vw < 768
                ? rect(vw, 0, 0, 0)
                : rect(vw, 800, 50, 600),
        );
        const cls = classifyImages([img(0, pv)], VH);
        expect(cls.get(0)!.loading).toBe("eager");
    });

    test("an image that scrolls into view on mobile but is already above fold on desktop is eager", () => {
        const pv: ViewportLayout[] = VIEWPORT_WIDTHS.map(vw =>
            vw < 768
                ? rect(vw, 320, VH + 300, 200)  // below fold on mobile
                : rect(vw, 1200, 100, 400),      // above fold on desktop
        );
        const cls = classifyImages([img(0, pv)], VH);
        expect(cls.get(0)!.loading).toBe("eager");
    });
});

describe("classifyImages — fetchpriority (LCP candidate)", () => {
    test("the largest above-fold image at smallest viewport gets high priority", () => {
        const small = everywhere(0, { cssWidth: 320, top: 400, height: 100 });
        const big = everywhere(1, { cssWidth: 320, top: 0, height: 500 });
        const cls = classifyImages([small, big], VH);
        expect(cls.get(1)!.fetchpriority).toBe("high");
        expect(cls.get(0)!.fetchpriority).toBe("auto");
    });

    test("only one image receives high priority", () => {
        const a = everywhere(0, { cssWidth: 320, top: 0, height: 300 });
        const b = everywhere(1, { cssWidth: 320, top: 350, height: 300 });
        const c = everywhere(2, { cssWidth: 320, top: 700, height: 50 });
        const cls = classifyImages([a, b, c], 1200);
        const highCount = [...cls.values()].filter(c => c.fetchpriority === "high").length;
        expect(highCount).toBe(1);
    });

    test("no image visible anywhere → no high priority awarded", () => {
        const a = everywhere(0, { cssWidth: 0, top: 0, height: 0 });
        const b = everywhere(1, { cssWidth: 300, top: VH + 1000, height: 200 });
        const cls = classifyImages([a, b], VH);
        expect(cls.get(0)!.fetchpriority).toBe("auto");
        expect(cls.get(1)!.fetchpriority).toBe("auto");
    });

    test("falls through to the next viewport when the smallest has no above-fold images", () => {
        // Nothing visible on the 320 viewport, but the image appears above
        // fold on 768. It still earns high priority on the first viewport
        // where it's visible.
        const pv: ViewportLayout[] = VIEWPORT_WIDTHS.map(vw =>
            vw < 600 ? rect(vw, 0, 0, 0) : rect(vw, 600, 50, 300),
        );
        const cls = classifyImages([img(0, pv)], VH);
        expect(cls.get(0)!.fetchpriority).toBe("high");
    });

    test("ties resolve deterministically on first-seen index", () => {
        // Two images identical in size — the one with the lower index wins
        // the comparison (`area > bestArea` requires strict gain).
        const a = everywhere(0, { cssWidth: 320, top: 0, height: 400 });
        const b = everywhere(1, { cssWidth: 320, top: 0, height: 400 });
        const cls = classifyImages([a, b], VH);
        expect(cls.get(0)!.fetchpriority).toBe("high");
        expect(cls.get(1)!.fetchpriority).toBe("auto");
    });
});

describe("classifyImages — empty input", () => {
    test("no measurements → empty map", () => {
        const cls = classifyImages([], VH);
        expect(cls.size).toBe(0);
    });
});
