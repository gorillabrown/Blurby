# Sprint Close-Out Governance Staging — CLEANUP-MODE-BARREL-1

Base `05a5480a`. Branch `eb/cleanup-mode-barrel-1`. No register writes (standing rule 46).

## Evidence

Dry-runs on the base match the spec: `git ls-files src/modes` lists five files; the gate 2/3 pattern hits only `tests/perf-baseline.test.ts:27`, `:28` and `vite.config.js:49`.

### Done-when 4 — positive control at C1

`npx vitest run tests/modeLegacyRetired.test.ts` → exit 1, 2 failed / 1 passed:

- × (a) src/modes/ holds only ModeInterface.ts — received `FlowMode.ts`, `FocusMode.ts`, `PageMode.ts`, `index.ts` beside `ModeInterface.ts`
- × (b) vite.config.js has no legacy NarrateMode chunk rule — the config contains `src/modes/NarrateMode`
- ✓ (c) no src file imports a legacy src/modes engine or barrel. No `src` importer exists on the base; the only importer is `tests/perf-baseline.test.ts`, which is outside `src/`.

### C2 (`39f16cbf`)

- Done-when 1: `git ls-files src/modes` → `src/modes/ModeInterface.ts` only. Done-when 2 and 3: each exits 1, empty. Done-when 4 and 5: the seven files exit 0 (112 tests). `npm run typecheck` exit 0. Done-when 7: fence exact (plus memo and time log).
- Done-when 6, after `npm ci` in the worktree:
  - First full `npm test`: exit 1, 1 failed / 2,050 passed / 1 skipped. Failing ID: `tests/sync-queue.test.js > enqueue and getPendingOps > clearQueue empties all pending ops`. Its error text was not captured (the run logged summary lines only).
  - Second full `npm test`: exit 0, 150 files, 2,051 passed, 1 skipped.
  - `npm run build`: exit 0.
- **Finding for the planner:** the failing test runs the base's fixed-`.tmp` `saveQueue` (`main/sync-queue.js`), the BUG-185/KF-2 writer that SETTINGS-WRITE-DURABLE-1 replaces. This item's diff cannot reach it: it deletes four unimported files and edits one test import and one config line. Merged on the second green run with this disclosed; the flake should disappear once SETTINGS-WRITE-DURABLE-1 lands.
