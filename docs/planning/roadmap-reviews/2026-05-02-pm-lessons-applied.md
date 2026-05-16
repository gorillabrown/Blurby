# Roadmap Review — Phase D Lessons Applied (2026-05-02 PM)

> Lessons-learned review for the three new MOSS-NANO eager skeletons (13a, 13b, 13c). The morning's lessons-applied artifact covered SK-HYG-1, EINK-6A, EINK-6B, and GOALS-6B; this artifact extends coverage to the new track.

## Standing Rules Updates

The 10-rule Standing Rules section in `ROADMAP.md` (added by the morning ceremony) is unchanged. No new universally-applicable rules surfaced from the audit reading; all relevant rules are already captured (PR-2, PR-3, PR-7, PR-10, PR-12, PR-17, PR-26, SRL-012, queue depth ≥3, dispatch sizing).

One **non-standing** lesson that surfaced strongly during the audit reading is `LL-031 — Generation ID Pattern for Stale Async Results`. This is sprint-specific (only sprints touching async-result-with-stale-detection), so it stays as a regular lesson rather than being promoted to Standing Rule. It is referenced inline in the MOSS-NANO-13b skeleton.

## Lessons Checklist (by theme)

### Async + Generation ID Patterns

- **LL-031 — Generation ID Pattern for Stale Async Results.**
  - 13a: ✅ Embodied. Adapter delegates lifecycle generation tracking to the engine (`main/moss-nano-engine.js:85`). Adapter does NOT mint its own counters.
  - 13b: ✅ Core fix. Task #3 explicitly bumps `generationId` in `setContinuityScope` so the existing in-flight guard at line 317 catches scope-change-mid-flight. The bug is precisely a generation-ID-pattern miss.
  - 13c: ✅ Producer respects generation IDs by reading the strategy's emitted trace events (which already carry generation), not by inferring them.

- **LL-066 — Silent `.catch(() => {})` Is a Systemic Anti-Pattern.**
  - 13a: ⚠️ Spec includes structured-failure resolution (`structuredFailure("sidecar-process-exited", ...)`) instead of swallowing errors. Plato review explicitly checks for this in task #8.
  - 13b: ⚠️ Timeout enforcement uses `Promise.race` with explicit rejection sentinel — no silent catch. Plato review verifies leak window.
  - 13c: ✅ Producer error handling explicitly checked in Plato review.

### Atomic Persistence

- **PR-10 / LL-006 — Atomic JSON Writes (write-tmp + rename).**
  - 13a: N/A (no JSON writes in adapter).
  - 13b: N/A (no persistence changes).
  - 13c: ✅ Producer emits sealed live-evidence JSON. Spec inherits atomic-write rule via Standing Rule PR-10. Implementation should use existing utility helpers (e.g., the `safeWriteJson` pattern used by `main/library.js`); deviation requires waiver.

### Test Coverage Patterns

- **PR-2 / PR-3 — `npm test` after code change, `npm run build` after UI/dependency change.**
  - 13a: ✅ Tasks 6 + 7 explicit. Adds `child_process` dependency surface — build verification required.
  - 13b: ✅ Tasks 7 + 8 explicit.
  - 13c: ✅ Tasks 7 + 8 explicit. Adds new IPC channel — build verification required.

- **SRL-012 — For Full-tier sprints, Solon and Plato MUST be parallel-eligible.**
  - 13a: ✅ Tasks 7 (Solon) and 8 (Plato) are read-only and can run in parallel after task 6 (`npm test`) completes.
  - 13b: ✅ Tasks 8 (Solon) and 9 (Plato) parallel-eligible.
  - 13c: ✅ Tasks 8 (Solon) and 9 (Plato) parallel-eligible.

### Architecture Boundaries

- **Electron CommonJS vs renderer ESM/TS.**
  - 13a: ✅ All implementation work is in `main/` (CommonJS) + `scripts/` (Python). Renderer is untouched.
  - 13b: ✅ Engine work in main (CommonJS); strategy work in renderer (TS). Boundary respected — no import crosses.
  - 13c: ✅ Producer is a Node script; main wiring is CommonJS; preload + renderer changes use existing ESM/TS pattern.

- **All file I/O in main process modules must be async (`fs.promises`).**
  - 13a: ✅ Spec uses `child_process.spawn` (async by nature). No sync `fs` calls.
  - 13b: N/A.
  - 13c: ✅ Producer reads/writes via Node async APIs. Gate validation uses `existsSync` (sync, but it's a CLI tool — acceptable per existing `tts_eval_runner.mjs` patterns).

### Dispatch Sizing

- **40 tool-use ceiling per wave; sprints with 5+ implementation tasks must be pre-split.**
  - 13a: ⚠️ 5 implementation tasks (1, 2, 3, 4, 5). **Pre-split into Wave A (impl + test) and Wave B (verify + docs + git) — explicitly noted in spec.**
  - 13b: ✅ 4 implementation tasks (1, 2, 3, 4). Single-wave dispatchable.
  - 13c: ⚠️ 6 implementation tasks (1, 2, 3, 4, 5, 6). **Pre-split into Wave A (impl 1–4 + test rewrite 5) and Wave B (producer integration test 6 + verify + docs + git) — explicitly noted in spec.**

## Skeletons Reviewed

### Newly written (eager, this ceremony)

| Skeleton | Lessons checked | Applied | Flagged | N/A |
|----------|----------------|---------|---------|-----|
| MOSS-NANO-13a | 11 | 7 | 1 (Plato review of Promise leak; covered by task 8) | 3 |
| MOSS-NANO-13b | 11 | 8 | 0 | 3 |
| MOSS-NANO-13c | 11 | 9 | 0 | 2 |

### Existing skeletons (re-reviewed)

EINK-6B and GOALS-6B were reviewed in the morning's lessons-applied artifact — no additional lessons surfaced from this afternoon's MOSS-NANO addition that change those skeletons.

### Stubs (deferred)

MOSS-NANO-13d, MOSS-NANO-13e, POLISH-1, RELEASE-1 — full lessons review will run when their eager skeletons are written at Stage 3 close.

## Summary

| Skeleton | Spec status | Lessons applied | Standing Rules waivers |
|----------|------------|----------------|----------------------|
| MOSS-NANO-13a | Eager (full WHERE/Tasks/SUCCESS CRITERIA) | All applicable | None |
| MOSS-NANO-13b | Eager | All applicable | None |
| MOSS-NANO-13c | Eager | All applicable | None |
| MOSS-NANO-13d | Stub | TBD at Stage 3 mid | TBD |
| MOSS-NANO-13e | Stub | TBD at Stage 3 mid | TBD |
| POLISH-1 | Stub | TBD at Stage 3 close | TBD |
| RELEASE-1 | Stub | TBD at Stage 3 close | TBD |
