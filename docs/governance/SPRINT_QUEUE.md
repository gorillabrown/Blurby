# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to >=3.

**Full specs:** `ROADMAP.md` (Phase 6 section for `EINK-6A`, `EINK-6B`, `GOALS-6B`)

**Queue rules:** FIFO — top sprint executes next. >=3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 3
Next sprint: EINK-6A (E-ink Greyscale Runtime)
Health: GREEN — Queue depth healthy.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| 1 | EINK-6A | v1.29.0 | `sprint/eink-6a-greyscale-runtime` | Full | — | Decouple e-ink behavior from theme choice, add `einkMode`, audit consumers, and make the app greyscale whenever e-ink mode is active. |
| 2 | EINK-6B | v1.30.0 | `sprint/eink-6b-reading-ergonomics` | Full | — | Add e-ink-specific Focus/Flow behavior with burst focus, stepped flow, reload-gap tuning, and chunk-safe reader ergonomics. |
| 3 | GOALS-6B | v1.31.0 | `sprint/goals-6b-reading-goals` | Full | — | Add daily/weekly reading goals, library progress widget, goal settings, and goal-hit feedback. |

**Full specs:** `ROADMAP.md` (Phase 6 section for `EINK-6A`, `EINK-6B`, `GOALS-6B`).

**Agent staging rule:** All queued sprints are Full-tier and must explicitly stage `test-runner` -> `spec-compliance-reviewer` -> `quality-reviewer` -> `doc-keeper` -> `blurby-lead`.

---

## Deferred Sprints (Phase 1 supersedes)

| Sprint ID | Disposition |
|-----------|-------------|
| TD-2 | Deferred. Mode wiring is feature work. Specs stale. Re-triage post-Phase 2. |
| HOTFIX-1 | Deferred. Grid bugs may fold into Phase 1.5 or later. |
| Sprint 23 | Partially absorbed by Phase 1. Remainder re-triage post-Phase 2. |
| Sprint 25 | Deferred to Phase 5 (ROADMAP_V2). |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| TTS-6S | 2026-04-04 | PASS | Cursor sync, pause shaping & backlog fill hotfix. Tick advances all crossed boundaries (BUG-096), reduced punctuation weight boosts 1.4→1.12/1.15→1.05 (BUG-097), parallel prefetch for first 2 ramp chunks + duplicate-chunk guard (BUG-098). 13 new tests (1,209 total). v1.28.0. |
| HOTFIX-11 | 2026-04-04 | PASS | Bug reporter diagnostics. Wired NarrateDiagSnapshot + console ring buffer into bug reporter. Collapsible diagnostics/console sections in modal. Backward-compatible JSON. BUG-099/BUG-100 resolved. 8 new tests (1,196 total). v1.27.1. |
| TTS-6Q | 2026-04-04 | PASS | Diagnostics & regression shields. NarrateDiagSnapshot/NarrateDiagEvent diagnostics surface, bucket/cursor/extraction invariant checks, 14 new regression-shield tests (1,188 total). v1.27.0. |
| TTS-6P | 2026-04-04 | PASS | Session continuity & recovery. resolveNarrationContext utility with book > active profile > flat settings cascade, voice validation, rate clamping, graceful fallback for stale/missing state. `isBookNarrationValid` checker. 12 new tests (1,174 total). v1.26.0. |
| TTS-6O | 2026-04-04 | PASS | Performance budgets & background isolation. Explicit startup/restart/steady-state budget constants, narratePerf instrumentation utility, background pre-extraction on reader open (1s delay), 9 new tests (1,162 total). v1.25.0. |
| TTS-6N | 2026-04-04 | PASS | Narration runtime stability & extraction sync. Kokoro rate clamped to buckets at NarrateMode boundary (constructor + setSpeed), HOTFIX-10 section restamping deferred via requestIdleCallback during active narration, extraction handoff reordered (word swap before DOM restamp). 12 new tests (1,153 total). v1.24.0. |
| TTS-6M | 2026-04-04 | PASS | Narration portability & reset safety. NarrationExportPayload with schema versioning, export/import/validate/apply utilities, merge and replace import modes, granular reset (profiles/overrides/all), settings UI for export/import/reset. 15 new tests (1,141 total). v1.23.0. |
| TTS-6L | 2026-04-04 | PASS | Narration profiles & sharing foundations. NarrationProfile type, createDefaultNarrationProfile/profileFromSettings/resolveNarrationProfile utilities, profile manager UI in TTSSettings, book-level profile assignment, profile-sync to flat settings, TDZ bugfix in useNarration 