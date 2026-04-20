import { describe, test, expect, beforeEach } from "bun:test";
import { SegmentedSwitch } from "w13c/core/Form/SegmentedSwitch/SegmentedSwitch";

/**
 * Replace the default `attachInternals` polyfill from setup.ts with one
 * that records `setFormValue` calls so we can assert them.
 */
function instrumentAttachInternals(): { calls: string[] } {
    const calls: string[] = [];
    (HTMLElement.prototype as any).attachInternals = function () {
        return {
            setFormValue: (v: string) => { calls.push(v); },
            setValidity: () => {},
            states: { add: () => {}, delete: () => {}, has: () => false },
            form: null,
            labels: [],
        };
    };
    return { calls };
}

/**
 * Build an element with 3 <option> children already in its light DOM and
 * mount it. This mimics the real-world flow where the HTML fragment
 * already contains the light-DOM children at upgrade time.
 */
function mountWithOptions(valueAttr?: string, opts = ["left", "center", "right"]): SegmentedSwitch {
    document.body.innerHTML = "";
    const el = document.createElement("p9r-segmented-switch") as SegmentedSwitch;
    if (valueAttr !== undefined) el.setAttribute("value", valueAttr);
    for (const v of opts) {
        const o = document.createElement("option");
        o.setAttribute("value", v);
        o.textContent = v;
        el.appendChild(o);
    }
    document.body.appendChild(el);
    return el;
}

describe("SegmentedSwitch", () => {

    let internals: { calls: string[] };

    beforeEach(() => {
        internals = instrumentAttachInternals();
    });

    test("registers itself as <p9r-segmented-switch>", () => {
        expect(customElements.get("p9r-segmented-switch")).toBe(
            SegmentedSwitch as unknown as CustomElementConstructor,
        );
    });

    // --- Bug #1: slotchange miss on upgrade ---

    test("--total-options reflects option count after mount (slotchange sync'd explicitly)", () => {
        const el = mountWithOptions();
        expect(el.style.getPropertyValue("--total-options")).toBe("3");
    });

    test("clicking an option updates the value and sets the form value", () => {
        const el = mountWithOptions();
        const options = Array.from(el.querySelectorAll("option")) as HTMLElement[];

        internals.calls.length = 0;
        options[1]!.click();

        expect(el.value).toBe("center");
        expect(internals.calls).toContain("center");
    });

    test("options get role=radio and tabindex=0 after mount", () => {
        const el = mountWithOptions();
        const options = Array.from(el.querySelectorAll("option"));
        for (const opt of options) {
            expect(opt.getAttribute("role")).toBe("radio");
            expect(opt.getAttribute("tabindex")).toBe("0");
        }
    });

    // --- Bug #2: init value was silently skipped ---

    test("init with <p9r-segmented-switch value=center> registers the form value", () => {
        const el = mountWithOptions("center");
        expect(el.value).toBe("center");
        // The polyfill recorded at least one setFormValue("center") — not
        // zero, which was the pre-fix behaviour.
        expect(internals.calls).toContain("center");
    });

    test("init with value attribute marks the matching option as selected", () => {
        const el = mountWithOptions("right");
        const options = Array.from(el.querySelectorAll("option")) as HTMLElement[];
        expect(options[2]!.hasAttribute("selected")).toBe(true);
        expect(options[0]!.hasAttribute("selected")).toBe(false);
    });

    test("init with value attribute sets --active-index", () => {
        const el = mountWithOptions("right");
        expect(el.style.getPropertyValue("--active-index")).toBe("2");
    });

    // --- Regression: no infinite loop through the setter ---

    test("setting the value programmatically does not infinite-loop", () => {
        const el = mountWithOptions("left");
        // If there were an infinite loop we'd either hang or blow the stack
        // before this line returns.
        el.value = "center";
        expect(el.value).toBe("center");
        expect(el.getAttribute("value")).toBe("center");
    });

    test("setting the same value twice is idempotent on setAttribute but still re-runs effects", () => {
        const el = mountWithOptions("center");

        // Baseline: setFormValue was called at least once on init.
        const before = internals.calls.length;
        el.value = "center";
        // The setter always runs side effects (setFormValue, slider, selections)
        // so calls count grows — but setAttribute was skipped, so no infinite loop.
        expect(internals.calls.length).toBeGreaterThan(before);
    });

    // --- Reconnect (the other scenario the original analysis raised) ---

    test("re-attaching the element re-runs the slot sync", () => {
        const el = mountWithOptions();
        expect(el.style.getPropertyValue("--total-options")).toBe("3");

        const parent = el.parentElement!;
        parent.removeChild(el);
        el.style.setProperty("--total-options", "0"); // tamper to prove it's re-computed
        parent.appendChild(el);

        expect(el.style.getPropertyValue("--total-options")).toBe("3");
    });
});
