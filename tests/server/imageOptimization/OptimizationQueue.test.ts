import { describe, test, expect } from "bun:test";
import { OptimizationQueue, type OptimizeJob } from "src/server/imageOptimization/OptimizationQueue";

const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));

describe("OptimizationQueue — sequential execution", () => {
    test("processes enqueued jobs one at a time, in insertion order", async () => {
        const log: string[] = [];
        const queue = new OptimizationQueue(async (job) => {
            log.push(`start:${job.key}`);
            await tick(10);
            log.push(`end:${job.key}`);
        });

        queue.enqueue("a", null);
        queue.enqueue("b", null);
        queue.enqueue("c", null);

        await tick(80);

        expect(log).toEqual([
            "start:a", "end:a",
            "start:b", "end:b",
            "start:c", "end:c",
        ]);
    });
});

describe("OptimizationQueue — dedup", () => {
    test("pending entries for the same key collapse to the latest payload", async () => {
        // The first enqueue starts the worker synchronously, so v1 is
        // already in flight before v2/v3 are recorded. v2 and v3 land in
        // pending where they collapse — the worker then runs once more for
        // the dedup'd v3. Total: 2 runs (v1 + v3), the in-flight one
        // wasted but its result discarded by isCurrent — see next test.
        const ran: OptimizeJob[] = [];
        const queue = new OptimizationQueue(async (job) => {
            ran.push(job);
            await tick(5);
        });

        queue.enqueue("page", { v: 1 });
        queue.enqueue("page", { v: 2 });
        queue.enqueue("page", { v: 3 });

        await tick(60);

        expect(ran).toHaveLength(2);
        expect((ran[0]!.payload as any).v).toBe(1);
        // v2 was overwritten by v3 in pending — never observed.
        expect((ran[1]!.payload as any).v).toBe(3);
    });

    test("a burst of N enqueues for the same key never produces more than 2 runs", async () => {
        // No matter how many saves arrive while the first one is in flight,
        // the pending entry collapses to one — the queue tops out at
        // (in-flight + 1 pending) for any single key.
        const ran: OptimizeJob[] = [];
        const queue = new OptimizationQueue(async (job) => {
            ran.push(job);
            await tick(5);
        });
        for (let i = 1; i <= 10; i++) queue.enqueue("page", { v: i });
        await tick(80);
        expect(ran.length).toBeLessThanOrEqual(2);
    });
});

describe("OptimizationQueue — generation race", () => {
    test("isCurrent flips to false when a newer enqueue arrives mid-job", async () => {
        const captured: { gen: number; isCurrent: () => boolean }[] = [];
        const queue = new OptimizationQueue(async (job, isCurrent) => {
            captured.push({ gen: job.generation, isCurrent });
            await tick(40);
        });

        queue.enqueue("p", null);
        // Wait for the worker to start.
        await tick(5);
        expect(captured).toHaveLength(1);
        expect(captured[0]!.gen).toBe(1);
        expect(captured[0]!.isCurrent()).toBe(true);

        // Newer save during the in-flight job — generation bumps to 2,
        // and the still-running first job's isCurrent must report stale.
        queue.enqueue("p", null);
        expect(captured[0]!.isCurrent()).toBe(false);

        // After the first job finishes, the queue picks up gen 2.
        await tick(120);
        expect(captured).toHaveLength(2);
        expect(captured[1]!.gen).toBe(2);
        expect(captured[1]!.isCurrent()).toBe(true);
    });

    test("a fresh enqueue after completion runs as a new job", async () => {
        let count = 0;
        const queue = new OptimizationQueue(async () => {
            count++;
            await tick(5);
        });

        queue.enqueue("p", null);
        await tick(30);
        expect(count).toBe(1);

        queue.enqueue("p", null);
        await tick(30);
        expect(count).toBe(2);
    });
});

describe("OptimizationQueue — runner errors don't kill the worker", () => {
    test("a job throwing still drains the rest of the queue", async () => {
        const ran: string[] = [];
        const queue = new OptimizationQueue(async (job) => {
            if (job.key === "boom") throw new Error("expected");
            ran.push(job.key);
            await tick(5);
        });

        queue.enqueue("a", null);
        queue.enqueue("boom", null);
        queue.enqueue("c", null);

        await tick(80);

        expect(ran).toEqual(["a", "c"]);
    });
});
