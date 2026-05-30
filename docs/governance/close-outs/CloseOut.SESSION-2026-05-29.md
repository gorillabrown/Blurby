---
sprint: EXT-PAIR-1 + SINGLE-INSTANCE-LOCK-1 + THEME-SYNC-1
date: 2026-05-29
status: all-pass (with one discovery)
---

# Phase Close-Out: Session 2026-05-29

## Sprint Brief

**Goal:** Ship the three hotfix sprints from the 2026-05-28 discovery sweep — WS pairing timeout (BUG-183), duplicate windows (F1), and Vite circular chunk / theme toggle (BUG-182).
**Result:** All three shipped, merged, and pushed on the same day; BUG-183 and BUG-182 confirmed fixed by live smoke on v1.75.1; a new einkMode CSS bug (BUG-184) surfaced during the BUG-182 smoke test.
**Learned:** Vite's circular-chunk detection operates at Rollup's chunk-assignment level, not at the import-statement level — grep-based import tracing misses edges created by Rollup's automatic module placement; programmatic build API (`chunk.imports` + `chunk.modules`) is the correct diagnostic tool.
**Recommend:** File BUG-184 (einkMode panel transparency) as an XS CSS hotfix before NARRATE-CLOSED-LOOP-CURSOR, and backfill the queue (depth 3, YELLOW threshold).
**Bottom line:** The 2026-05-28 discovery sweep is fully closed — three bugs fixed, three sprints shipped, one new einkMode CSS defect surfaced and scoped.

## Findings

| # | Finding | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|-----------|----------|
| F1 | EXT-PAIR-1: `WS_PAIRING_TIMEOUT_MS` (5 min) replaces 5s auth window | Pairing flow succeeds; `npm test` green | 3,014 tests pass; BUG-183 closed | Pass | — |
| F2 | SINGLE-INSTANCE-LOCK-1: `requestSingleInstanceLock` gate | Second launch focuses existing window | Smoke PASS by Evan | Pass | — |
| F3 | THEME-SYNC-1: Circular chunk `settings↔tts` eliminated | No `Circular chunk` build warning | Build clean; settings 102→92 KB, tts 123→132 KB | Pass | — |
| F4 | THEME-SYNC-1: BUG-182 theme toggle smoke | All 5 themes × 9 sub-pages clean | PASS on v1.75.1 (all combos clean with einkMode OFF) | Pass | — |
| F5 | Version label v1.75.1 confirmed on dev build | Version matches `package.json` | v1.75.1 displayed (F4 from prior session resolved) | Pass | — |
| F6 | einkMode ON strips Settings panel background | Settings panel opaque with einkMode ON | Transparent — library bleeds through `.menu-flap` | Discovery | MEDIUM |
| F7 | Initial smoke ran against stale v1.1.2 build | Smoke on correct build | First pass used old installed build; retest on dev build was definitive | Discovery | LOW |

## Interpretation

**F1–F5 (Pass):** All three sprints delivered exactly to spec. The circular chunk fix required three iterative build cycles to find all five shared modules (`kokoroStatus`, `qwenStatus`, `kokoroRatePlan`, `ttsProviderRegistry`, `tempoStretch`), but the final result is clean — one-directional settings→tts imports only.

**F6 (Discovery — einkMode panel transparency):** Root cause identified in code: `themes.css:145` has `[data-eink="true"] *:hover { background-color: inherit; }` — a nuclear wildcard hover rule that overrides `.menu-flap`'s `background: var(--bg-raised)` when the cursor is over the panel. The `[data-eink="true"]` attribute is set by the E-Ink Display Mode toggle (separate from the eink theme selection). Fix is XS: either scope the hover rule to exclude `.menu-flap`, or add a `[data-eink="true"] .menu-flap { background: var(--bg-raised) !important; }` override. Filed as BUG-184.

**F7 (Discovery — stale build smoke):** The first THEME-SYNC-1 smoke ran against Blurby.exe (v1.1.2), not the dev build with the fix. The retest on `npm run dev` (v1.75.1) was definitive. Lesson: always verify version label matches expected commit before issuing a smoke verdict.

## Dispositions

| Finding | Disposition | Rationale |
|---------|-------------|-----------|
| F6 — einkMode panel transparency | **Fix Now** (XS CSS hotfix, filed as BUG-184) | Root cause identified, 1-line fix, blocks einkMode usability |
| F7 — stale build smoke | **Log** (SRL-085) | Workflow lesson, not a code defect |

## Governance Updates

- **BUG_REPORT.md**: BUG-182 upgraded from "pending smoke" to confirmed fixed; BUG-184 filed (einkMode panel transparency)
- **CLAUDE.md**: Open bugs updated to reflect BUG-184
- **sprint-queue.xlsx**: Already current from individual sprint MarcusAurelius passes
- **ROADMAP.md**: Already current; finish line tier (3) "all 2026-05-28 discovery bugs closed" is now met

## Sprints Shipped

| Sprint | Commit | Merge | Key Deliverable |
|--------|--------|-------|-----------------|
| EXT-PAIR-1 | `d0a89dd` | `d75426b` | `WS_PAIRING_TIMEOUT_MS` + structured WS logging + 8 tests |
| SINGLE-INSTANCE-LOCK-1 | `50e6477` | `1a6adcb` | `requestSingleInstanceLock` + `second-instance` handler |
| THEME-SYNC-1 | `3722fa8` | `0fcf432` | 5 modules moved to TTS chunk, circular warning eliminated |

## Live-QA Artifacts

- `docs/studies/live-qa/2026-05-29_theme_sync_smoke.md` — initial smoke (stale build)
- `docs/studies/live-qa/2026-05-29_theme_sync_retest.md` — definitive retest on v1.75.1

## Gates

- **Audit gate**: Not triggered (hotfix sprints, no architecture changes)
- **Milestone review**: Finish line tier (3) met — all 2026-05-28 discovery bugs closed
- **Merge gate**: All three sprints merged to main with `--no-ff`, pushed, branches deleted
