#!/usr/bin/env node
/**
 * Node.js test runner — runs unit test files in the MAIN process (no --test flag).
 *
 * 【Why 根源】Node 22's `node --test` forks a child process per file and uses the
 * child's stdout as the TAP/IPC message channel. When code under test writes to
 * stdout, non-TAP bytes corrupt the parent's message parser.
 *
 * 【Fix】Run each file as the entry point (`node --import tsx <file>`) WITHOUT the
 * `--test` flag. `node:test` auto-runs registered tests IN-PROCESS when the module
 * is the main entry — no child process, no IPC.
 * `--test-force-exit` ensures the process exits even with dangling handles.
 *
 * 【Invariant】Only unit tests are run here — browser tests (tests/docs-browser/**)
 * require Playwright/Chromium and are excluded from Node.js CI.
 */
import { spawnSync } from "node:child_process";
import { resolve, relative } from "node:path";

process.env.CI = "true";

// Only unit tests — no browser, no dev server, no Chromium.
const testFiles = [
  "tests/collect-desktop-routes.test.ts",
  "tests/docs-sidebar-reconcile.test.ts",
];

let failed = 0;
for (const file of testFiles) {
  const full = resolve(file);
  const rel = relative(process.cwd(), full);
  console.log(`▶ ${rel}`);
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "--test-force-exit", full],
    {
      stdio: "inherit",
      env: { ...process.env, CI: "true" },
    },
  );
  if (result.status !== 0) {
    failed++;
    console.error(`✗ FAILED: ${rel}\n`);
  } else {
    console.log(`✓ ${rel}\n`);
  }
}

console.log("=".repeat(60));
if (failed > 0) {
  console.error(`✗ ${failed}/${testFiles.length} test file(s) failed`);
  process.exit(1);
}
console.log(`✓ All ${testFiles.length} test files passed`);
