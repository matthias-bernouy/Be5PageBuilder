/**
 * Build script for publishing `be5-pagebuilder` to an npm registry.
 *
 * Strategy: this is a Bun-first package. It uses `Bun.file`, `Bun.Glob`,
 * `Bun.build`, and `with { type: "text" }` import attributes at runtime,
 * and the endpoint layer scans folders on disk at boot. We therefore do
 * NOT transpile or bundle — consumers run on Bun, which executes the
 * TypeScript source directly. The published tarball contains:
 *
 *   - `index.ts`            — public entry
 *   - `src/`                — runtime source (scanned by the router)
 *   - `w13c/`               — built-in blocs + shared UI components
 *   - `types/`              — ambient declarations + runtime constants
 *   - `dist/`               — `.d.ts` declaration files emitted by `tsc`
 *
 * Steps:
 *   1. Clean `dist/`.
 *   2. Run `tsc --emitDeclarationOnly` to produce declaration files.
 *   3. Sanity-check that the public entry still type-checks.
 *   4. Print a short summary.
 */

import { rmSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PKG_ROOT = import.meta.dir;
const DIST_DIR = join(PKG_ROOT, "dist");
const INDEX_FILE = join(PKG_ROOT, "index.ts");

function section(title: string) {
    console.log(`\n── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);
}

function fail(msg: string): never {
    console.error(`\n✗ ${msg}`);
    process.exit(1);
}

// ── 1. Pre-flight checks ────────────────────────────────────────────────
section("Pre-flight");
if (!existsSync(INDEX_FILE)) {
    fail("index.ts not found at package root — aborting.");
}
console.log("  ✓ index.ts present");

// ── 2. Clean dist/ ──────────────────────────────────────────────────────
section("Cleaning dist/");
rmSync(DIST_DIR, { recursive: true, force: true });
console.log("  ✓ dist/ cleaned");

// ── 3. Emit declarations via tsc ────────────────────────────────────────
// `tsconfig.json` already has `emitDeclarationOnly: true` and `outDir: dist`,
// so a plain `tsc` invocation does the right thing.
section("Emitting .d.ts declarations");
const tsc = Bun.spawnSync(["bun", "x", "tsc"], {
    cwd: PKG_ROOT,
    stdout: "inherit",
    stderr: "inherit",
});
if (tsc.exitCode !== 0) {
    fail(`tsc exited with code ${tsc.exitCode}`);
}
console.log("  ✓ declarations emitted");

// ── 4. Summary ──────────────────────────────────────────────────────────
section("Summary");

function countFiles(dir: string): number {
    if (!existsSync(dir)) return 0;
    let n = 0;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) n += countFiles(full);
        else if (entry.isFile()) n++;
    }
    return n;
}

const dtsCount = countFiles(DIST_DIR);
const distSize = existsSync(DIST_DIR) ? statSync(DIST_DIR).size : 0;

console.log(`  dist files : ${dtsCount}`);
console.log(`  dist bytes : ${distSize}`);
console.log("\n✓ Build complete.");
console.log("  Next steps:");
console.log("    • bun run dev                 (smoke test in this repo)");
console.log("    • npm pack --dry-run          (inspect the tarball contents)");
console.log("    • npm publish --access public (once 'files' field is final)");
