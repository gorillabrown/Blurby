BLURBY

# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top pointer, read the referenced Roadmap section, then execute from the full spec. After completion, remove it, log it, backfill to ≥3.

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained at all times. If depth drops below 3 after completion: Cluade Code investigates bottlenecks and issues; Cowork brainstorms and drafts specs (if next work is known) or stops to discuss (if not); Claude CLI performs work/receives dispatches. 

No dispatch fires until ≥3 pointers exist with full specs in the Roadmap, and no code-changing pointer is dispatch-ready unless its referenced spec names explicit edit-site coordinates.

Parallel dispatch rule: code-changing sprints may run in parallel only when lane ownership is explicit and shared-core freeze files are not edited by both sprints at the same time.

**How to use:**
1. Pull the top pointer block
2. Open the Roadmap section listed on the `Read:` line — that's the full dispatch spec
3. Confirm the full spec includes explicit edit-site coordinates for every planned code change: file, function/method, approximate live anchor, and exact modification type. If any code-changing step lacks coordinates, stop and harden the spec before dispatch.
4. Execute from the Roadmap spec under `gog-lead` orchestration with the named sub-agent roster
5. After completion: doc-keeper marks the Roadmap section COMPLETED, removes the pointer, logs to completed table
6. Cowork prints the next pointer and checks queue depth


---

```
SPRINT QUEUE STATUS:
Queue depth: 3 — GREEN
Next sprint: TTS-HARDEN-2 (Narration Handoff Integrity & Extraction Dedupe)
Health: GREEN — TTS-HARDEN-1 landed cleanly, so the hardening lane can advance to handoff/extraction integrity.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | TTS-HARDEN-2 | v1.57.0 | `sprint/tts-harden-2-handoff-integrity` | Full | **YES** | Full spec: 12 tasks, 9 success criteria. Section/chapter handoff ownership cleanup, extraction dedupe on active narration start, and stale orchestration test realignment. Depends on TTS-HARDEN-1. |
| 2 | TTS-RATE-1 | v1.58.0 | `sprint/tts-rate-1-pitch-preserving-tempo` | Full | **YES** | Full spec: 12 tasks (3 waves), 11 success criteria. 0.1-step speed UX (1.0–1.5), fixed generation buckets (1.0/1.2/1.5), pitch-preserving tempo shaping, in-bucket no-restart behavior, multi-rate matrix verification. Depends on TTS-HARDEN-2. |
| 3 | EPUB-TOKEN-1 | v1.59.0 | `sprint/epub-token-1-dropcap-stitching` | Full | **YES** | Full spec: 11 tasks (3 waves), 9 success criteria. Dropcap/split-token lexical stitching, stable global word identity across fragments, click/selection/narration alignment regressions covered. Depends on TTS-RATE-1. |

**Dispatch status:** Queue depth 3 — GREEN. Dispatch order is `TTS-HARDEN-2` → `TTS-RATE-1` → `EPUB-TOKEN-1`.

### Parallel Dispatch Guardrails

Before dispatching two queued sprints in parallel, verify all of these are true:

1. Both ROADMAP sprint specs include:
   - `Lane Ownership`
   - `Forbidden During Parallel Run`
   - `Shared-Core Touches`
   - `Merge Order`
2. The two sprints do not both edit the shared-core freeze set in the same execution window:
   - `src/hooks/useNarration.ts`
   - `src/hooks/useFlowScrollSync.ts`
   - `src/components/ReaderContainer.tsx`
   - `src/utils/FlowScrollEngine.ts`
   - `src/types.ts`
3. If one sprint needs shared-core integration, it runs as a second phase after the first sprint merges.

If any guardrail fails, run the sprints sequentially.

**Next Cowork actions:**
1. ~~Dispatch FLOW-INF-A to CLI~~ — COMPLETE (v1.41.0)
2. ~~Dispatch FLOW-INF-B to CLI~~ — COMPLETE (v1.42.0)
3. ~~Backfill queue to ≥3~~ — DONE (FLOW-INF-C spec'd)
4. ~~Dispatch EXT-ENR-B to CLI~~ — COMPLETE (v1.43.0)
5. ~~Backfill queue to ≥3~~ — DONE (HOTFIX-15 spec'd, queue GREEN)
6. ~~Dispatch HOTFIX-15 to CLI~~ — COMPLETE (v1.43.1)
7. ~~Dispatch NARR-TIMING to CLI~~ — COMPLETE (v1.44.0)
8. ~~Backfill queue~~ — STAB-1A spec'd (queue YELLOW, depth 2)
9. ~~Backfill queue to ≥3~~ — DONE (PERF-1 spec'd, queue GREEN depth 3)
10. ~~Dispatch STAB-1A to CLI~~ — COMPLETE (v1.45.0)
11. ~~Dispatch FLOW-INF-C to CLI~~ — COMPLETE (v1.46.0)
12. ~~Dispatch PERF-1 to CLI~~ — COMPLETE (v1.47.0)
13. ~~Backfill queue to ≥3~~ — DONE (REFACTOR-1A/1B + TEST-COV-1 spec'd from Aristotle audit, queue GREEN depth 3)
14. ~~Dispatch REFACTOR-1A to CLI~~ — COMPLETE (v1.48.0)
15. **Backfill queue to ≥3** — YELLOW, depth 2. Spec a third sprint before dispatching REFACTOR-1B.
16. ~~Dispatch REFACTOR-1B to CLI~~ — COMPLETE (v1.49.0)
17. ~~Backfill queue to ≥3~~ — DONE (NARR-LAYER-1A + NARR-LAYER-1B spec'd from narration-as-layer investigation, queue GREEN depth 3)
18. ~~Dispatch TEST-COV-1 to CLI~~ — COMPLETE (v1.50.0)
19. ~~Dispatch NARR-LAYER-1A to CLI~~ — COMPLETE (v1.51.0)
20. ~~Backfill queue~~ — DONE (`TTS-EVAL-1` spec'd; queue remains YELLOW depth 2 until a third active sprint is added)
21. ~~Dispatch NARR-LAYER-1B to CLI~~ — COMPLETE (v1.52.0)
22. ~~Backfill queue to ≥3~~ — COMPLETE. TTS-EVAL-2 and TTS-EVAL-3 added; queue depth restored to 3 (GREEN).
23. ~~Dispatch TTS-EVAL-1 to CLI~~ — COMPLETE (v1.53.0)
24. **Backfill queue to ≥3** — YELLOW, depth 2. Add one additional sprint before next dispatch beyond TTS-EVAL-2.
25. ~~Dispatch TTS-EVAL-2 to CLI~~ — COMPLETE (v1.54.0)
26. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-RATE-1` and `EPUB-TOKEN-1`; queue depth restored to 3 (GREEN).
27. ~~Dispatch TTS-EVAL-3 to CLI~~ — COMPLETE (v1.55.0)
28. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-HARDEN-1` and `TTS-HARDEN-2`; queue depth restored to 4 (GREEN).
29. ~~Dispatch TTS-HARDEN-1 to CLI~~ — COMPLETE (v1.56.0). Truthful Kokoro readiness now flows end-to-end from engine snapshot to renderer consumers; crash/load/warm-up failures fail closed and recover cleanly.
30. **Dispatch TTS-HARDEN-2 to CLI** — NEXT. Handoff ownership and extraction dedupe now build on the hardened engine/status contract.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| HOTFIX-13 | **Dissolved.** BUG-151/152/153 absorbed into SELECTION-1. BUG-154 parked (likely not a bug — needs live verification). |
| EINK-6A | Parked. Fully spec'd in ROADMAP.md. Re-queue when e-ink becomes priority. |
| EINK-6B | Parked. Fully spec'd in ROADMAP.md. Depends on EINK-6A. |
| GOALS-6B | Parked. Fully spec'd in ROADMAP.md. Independent — can run anytime. |
| EXT-ENR-C | Documented but deferred. In-browser reader is lower priority than connection fixes. |
| APK-0 | Roadmapped, not yet execution-ready. Needs detailed WHERE/Tasks/SUCCESS CRITERIA. |
| APK-1–4 | Roadmapped, not yet execution-ready. Depend on APK-0. |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| TTS-HARDEN-1 | 2026-04-16 | PASS | Kokoro bootstrap and recovery hardened end-to-end: authoritative readiness/status snapshot (`status/reason/recoverable`) from engine to renderer, fail-fast load/warm-up errors, packaged import shim allowlist + resolver restoration, sprint/marathon worker crash recovery with future-only retries, shutdown cleanup for retry timers/pending work, renderer truth wiring via normalized status helpers, and regression coverage across engine/worker/settings/hooks. Verification passed: focused Kokoro slice (`7` files, `75` tests), full `npm test` (`116` files, `2001` tests), and `npm run build`; existing circular-chunk warning unchanged. v1.56.0. |
| TTS-EVAL-3 | 2026-04-16 | PASS | Quality gate release workflow shipped: versioned threshold config (`docs/testing/tts_quality_gates.v1.json`), gate evaluator (`scripts/tts_eval_gate.mjs`), in-runner gate enforcement via `--gates` (`scripts/tts_eval_runner.mjs`), baseline policy + snapshot (`docs/testing/TTS_EVAL_BASELINE_POLICY.md`, `docs/testing/tts_eval_baseline_v1.json`), release checklist (`docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`), and new gate coverage in `tests/ttsEvalGate.test.ts`. Verification passed: gated matrix run (`artifacts/tts-eval/baseline-v1`), targeted TTS eval suites (32 tests), full `npm test` (114 files, 1977 tests), and `npm run build`; existing circular-chunk warning unchanged. v1.55.0. |
| TTS-EVAL-2 | 2026-04-16 | PASS | Matrix + soak evaluation tooling shipped: scenario manifest (`tests/fixtures/narration/matrix.manifest.json`), deterministic soak profiles (`scripts/tts_eval_profiles.mjs`), runner matrix/soak modes with deterministic artifact naming + checkpoints + interrupt-safe writes (`scripts/tts_eval_runner.mjs`), aggregate metrics reducer (`scripts/tts_eval_metrics.mjs`) with startup p50/p95 and drift summaries, and new coverage in `tests/ttsEvalMatrixRunner.test.ts`. Verification passed with smoke matrix + short soak artifact runs and full `npm test` (113 files, 1972 tests) + `npm run build`; existing circular-chunk warning unchanged. v1.54.0. |
| TTS-EVAL-1 | 2026-04-16 | PASS | Flow/narration evaluation harness shipped: trace schema (`src/types/eval.ts`), fixture corpus (`tests/fixtures/narration/`), opt-in trace sink wiring in narration/flow hooks, first-audio timing capture, runner + metrics (`scripts/tts_eval_runner.mjs`), lifecycle/trace tests (`tests/ttsEvalTrace.test.ts`, `tests/ttsEvalLifecycle.test.ts`), review artifacts (`TTS_EVAL_REVIEW_TEMPLATE.md`, `TTS_EVAL_RUNBOOK.md`), and baseline outputs (`tests/fixtures/narration/baseline/`). Verification passed: targeted trace suites, baseline fixture run, `npm test` (112 files, 1967 tests), and `npm run build` (existing circular chunk warning unchanged). v1.53.0. |
| NARR-LAYER-1B | 2026-04-16 | PASS | Narration-layer consolidation complete: removed standalone narration mode from core contracts and orchestration, deleted `src/modes/NarrateMode.ts`, migrated settings (`schema 7 -> 8`) from narration-mode state to flow + `isNarrating`, removed Foliate narration overlay machinery and associated CSS, and consolidated runtime behavior to flow-layer narration. Added `tests/narrLayer1bConsolidation.test.ts` with 25 targeted checks. Verification passed: `npm test` (110 files, 1945 tests) and `npm run build` green; existing Vite circular chunk warning remains. v1.52.0. |
| TEST-COV-1 | 2026-04-16 | PASS | Critical path coverage + security hardening: URL scheme validation for `addDocFromUrl`, `site-login`, and `open-url-in-browser`; explicit force-refresh on 401 for Google and Microsoft cloud retries; 75 new tests across auth/cloud/queue/ErrorBoundary/foliateWordOffsets + URL regression. 1,967 tests across 108 files. `npm test` and `npm run build` passed; existing Vite circular-chunk warning remains. v1.50.0. |
| NARR-LAYER-1A | 2026-04-16 | PASS | Narration-as-flow foundation: FlowScrollEngine follower mode, `isNarrating` state, narration→flow sync wiring, flow-specific `N` toggle, narration band suppression during flow narration, bottom-bar flow+narration state, section/cross-book handoff support. 18 new tests in `tests/narrationLayer.test.ts`. Full suite green at 1,985 tests; `npm run build` passed; existing Vite circular-chunk warning remains. v1.51.0. |
| REFACTOR-1B | 2026-04-07 | PASS (17/18 — criterion 4 aspirational) | FoliatePageView helpers extracted to `foliateHelpers.ts` + `foliateStyles.ts` (1,947→1,724 lines), TTSSettings split into 3 sub-components (874→583 lines), 179→27 inline styles, global.css (5,406 lines) split into 8 domain files + `src/styles/index.css`, new `src/styles/tts-settings.css` (418 lines), 6 empty catch blocks annotated, 3 build warnings fixed. 32 new tests (1,892 total across 101 files). v1.49.0. |
| REFACTOR-1A | 2026-04-07 | PASS | ReaderContainer decomposition: 33 useEffects → 5 custom hooks (useNarrationSync, useNarrationCaching, useFlowScrollSync, useFoliateSync, useDocumentLifecycle), fileHashes cleanup on document delete, main.js constants extracted to main/constants.js. 74 new tests (1,860 total across 100 files). v1.48.0. |
| PERF-1 | 2026-04-07 | PASS | Full performance audit & remediation: startup parallelized (`loadState`→`createWindow`→`Promise.all([initAuth,initSyncEngine])`), folder watcher before sync, `getComputedStyle` cached (3→1 call), settings saves debounced 500ms, WPM persistence debounced 300ms, EPUB chapter cache LRU 50-cap, snoozed doc Set index, voice sync deps 7→2, Vite code splitting (vendor/tts/settings, 16 chunks), `rebuildLibraryIndex` debounced 100ms. 32 new tests (1,786 total across 98 files). v1.47.0. |
| FLOW-INF-C | 2026-04-07 | PASS | Cross-book continuous reading: transition overlay (2.5s countdown), auto-open next queued book + resume flow, `getNextQueuedBook()` utility, `finishReadingWithoutExit()` for seamless book switching, Escape/click-to-cancel. 21 new tests (1,754 total across 97 files). v1.46.0. |
| STAB-1A | 2026-04-07 | PASS | Startup & flow stabilization: `.foliate-loading` CSS (pulsing backdrop), async `wrapWordsInSpans` (batched setTimeout yields), TTS preload verified wired, sentence-snap tolerance ±15→±25, FlowScrollEngine `buildLineMap()` retry (5×100ms) + instant initial scroll. BUG-162/163/164/165 resolved. 19 new tests (1,736 total across 96 files). v1.45.0. |
| NARR-TIMING | 2026-04-07 | PASS | Real word-level timestamps from Kokoro duration tensor. kokoro-js fork (patch-package), 4-layer validation, scheduler integration with heuristic fallback. BUG-161 fully resolved. 18 new tests (1,717 total across 95 files). v1.44.0. |
| HOTFIX-15 | 2026-04-07 | PASS | Narration cursor polish: colRight ancestor tightened to `p, blockquote, li, figcaption` + width guard (95% cap) + null guard (BUG-159). Proportional band height `lineHeight * 1.08` + dynamic re-measurement on word change >2px threshold (BUG-160). Truth-sync interval halved 12→6 words (BUG-161 partial). 16 new tests (1,699 total across 94 files). v1.43.1. |
| EXT-ENR-B | 2026-04-07 | PASS | Push event system for Chrome extension auto-discovery. Server emits `ws-connection-attempt` / `ws-pairing-success` events. `PairingBanner` in library screen shows pairing code with countdown, auto-dismisses on success, suppresses when already connected, 60s cooldown on dismiss. `ConnectorsSettings` polling reduced 5s→15s. 29 new tests (1,683 total across 93 files). v1.43.0. |
| FLOW-INF-B | 2026-04-06 | PASS | Timer bar cursor (5px/6px e-ink, accent glow, line-completion flash), FlowProgress computation with chapter/book percentage + estimated time remaining, ReaderBottomBar progress display. 18 new tests (1,654 total across 92 files). v1.42.0. |
| FLOW-INF-A | 2026-04-06 | PASS | CSS mask-image reading zone with configurable position/size, FlowScrollEngine dynamic zone position, ReaderBottomBar zone controls, ResizeObserver recomputation. 27 new tests (1,636 total across 91 files). v1.41.0. |
| NARR-CURSOR-1 | 2026-04-06 | PASS | Collapsing narration cursor: overlay right-edge anchored to `<p>` ancestor, left edge advances with narration, width derived per tick. CSS simplified to 2-stop gradient. NARRATION_BAND_PAD_PX removed. 16 new tests (1,609 total across 90 files). v1.40.0. |
| EXT-ENR-A | 2026-04-06 | PASS | Resilient extension connection: exponential backoff, pending article persistence, article-ack, EADDRINUSE retry cap, auth timeout, three-state UI, lifecycle hooks. 18 new tests (1,593 total across 89 files). v1.39.0. |
| HOTFIX-14 | 2026-04-06 | PASS | URL extraction fetchWithBrowser fallback (BUG-155), authenticated-only client count + 5s polling + 15s heartbeat (BUG-156). 12 new tests (1,575 total across 88 files). v1.38.2. |
| SELECTION-1 | 2026-04-06 | PASS | Word anchor contract: soft/hard/resume tiers, mode s
