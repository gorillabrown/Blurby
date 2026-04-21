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
5. After successful completion: CLI auto-merges by default unless the sprint spec explicitly says not to; doc-keeper marks the Roadmap section COMPLETED, removes the pointer, and logs it to the completed table
6. Cowork prints the next pointer and checks queue depth


---

```
SPRINT QUEUE STATUS:
Queue depth: 2 — YELLOW
Next queue item: READER-4M-3
Health: YELLOW — depth 2 after `READER-4M-2` closeout (v1.69.0). Reader restoration lane continues with `READER-4M-3` as next dispatch; `QWEN-STREAM-1` is Lane D (Platform/Main Process) and parallel-safe with the reader sprints. Backfill to ≥3 before dispatching further code-changing sprints beyond the current two pointers. `KOKORO-RETIRE-1` and `KOKORO-RETIRE-2` remain paused until the streaming lane proves itself across `QWEN-STREAM-1` through `QWEN-STREAM-3`.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | READER-4M-3 | v1.70.0 | `sprint/reader-4m-3-global-anchor-continuity` | Full | **YES** | Full spec in `ROADMAP.md`. Unifies save/resume/mode switching around one canonical global word anchor and makes Narrate follow spoken-word truth on the shared surface. Depends on `READER-4M-2`. |
| 2 | QWEN-STREAM-1 | v1.71.0 | `sprint/qwen-stream-1-sidecar-foundation` | Full | **YES** | Full spec in `ROADMAP.md`. Streaming Qwen sidecar foundation: persistent Python subprocess with binary-framed PCM streaming protocol, main process engine manager, IPC/preload bridge, streaming types. No renderer playback integration yet. Lane D (Platform/Main Process) — parallel-safe with READER-4M-3. |

**Dispatch status:** Queue depth 2 — YELLOW after `READER-4M-2` closeout (v1.69.0). Current dispatchable pointer order is `READER-4M-3`, `QWEN-STREAM-1`. `QWEN-STREAM-1` is Lane D and can run in parallel with the Lane C/A `READER-4M-3` sprint. Backfill queue to ≥3 before dispatching beyond the current two pointers. Subsequent streaming sprints (`QWEN-STREAM-2`: accumulator + strategy + live playback, `QWEN-STREAM-3`: hardening + evidence + decision gate) will be spec'd and queued as earlier sprints complete.

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
30. ~~Dispatch TTS-HARDEN-2 to CLI~~ — COMPLETE (v1.57.0). Section-end continuation now has one active owner, handoff uses the stronger narration core contract, foliate fallback releases ownership once full-book metadata arrives, and active extraction follows the shared dedupe path.
31. ~~Backfill queue to ≥3~~ — COMPLETE. Re-promoted `EINK-6A` as a parked but fully spec'd fallback pointer so queue depth remains 3 (GREEN) while TTS/token work stays first.
32. ~~Dispatch TTS-RATE-1 to CLI~~ — COMPLETE (v1.58.0). Kokoro now offers exact `1.0x`–`1.5x` UI speeds in `0.1x` steps over fixed generation buckets (`1.0` / `1.2` / `1.5`), uses pitch-preserving tempo shaping instead of pitch-shifting playbackRate changes, keeps in-bucket speed edits restart-free via live buffered retiming, and passed the gated six-rate matrix release evidence (`artifacts/tts-eval/final-gate-22`). Existing Vite circular chunk warning unchanged.
33. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-CONT-1`, `TTS-RATE-2`, and `TTS-START-1`; queue depth restored to 4 (GREEN) with the TTS continuity lane prioritized ahead of parked e-ink work.
34. ~~Backfill queue to ≥3~~ — EXPIRED. Queue fell to depth 1 after `TTS-START-1` closeout; replace with a stronger stop condition.
35. ~~Dispatch TTS-START-1 to CLI~~ — COMPLETE (v1.62.0). Cached and uncached starts now share one opening-ramp planner contract, entry coverage warms the same startup shape before cruise coverage, cache replay reconstructs exact nonzero-start word spans from full context, and startup parity is now recorded in eval artifacts. Verification passed with the focused startup/cache neighborhood (`6` files, `70` tests), a dedicated startup-parity matrix (`artifacts/tts-eval/start1-startup-parity`) showing cached/uncached startup `370 / 508 ms` with matching opening ramps, the gated release matrix (`9` runs, PASS), full `npm test` (`125` files, `2005` tests), and `npm run build`; existing circular-chunk warning unchanged.
36. ~~Backfill queue to ≥3~~ — RED at the time, depth 1 after `TTS-START-1`; superseded by the four-mode reader restoration backfill below.
37. ~~Backfill queue to ≥3~~ — COMPLETE. Added `READER-4M-1`, `READER-4M-2`, and `READER-4M-3` from the approved four-mode reader/Narrate restoration design; queue depth restored to 4 (GREEN) with `READER-4M-1` as the next dispatch.
38. ~~Dispatch READER-4M-1 to CLI~~ — COMPLETE (v1.63.0). Live Foliate Flow now boots from an explicit rendered-word provider contract plus readiness-gated rebuilds, `narrate` is back in the shared reader/persisted mode contracts, compatibility aliases are localized, and the closeout fix keeps `narrate` on the flow-surface Foliate `onLoad` path.
39. ~~Backfill queue to ≥3~~ — COMPLETE. Finalized and retired the Qwen/Kokoro audit packet, added `QWEN-PROT-1` as the next bounded prototype slice, reprioritized the queue ahead of `READER-4M-2`, and preserved depth 3 without the parked e-ink fallback pointer.
40. ~~Dispatch QWEN-PROT-1 to CLI~~ — COMPLETE (v1.64.0). Qwen is now a first-class prototype engine across shared types, persistence, preload/main status plumbing, settings UI, and the browser test harness; selecting it no longer silently falls through to another engine, and the app reports truthful unavailable/warming/error states without attempting live synthesis.
41. ~~Backfill queue to ≥3~~ — COMPLETE. Added `QWEN-PROT-2` as the next bounded Qwen sidecar/playback slice and kept queue depth 3 while preserving the reader restoration lane behind it.
42. ~~Dispatch QWEN-PROT-2 to CLI~~ — COMPLETE (v1.65.0). Blurby can now spawn a configured Qwen Python sidecar, expose `qwenGenerate` through main/preload, route live narration through a dedicated Qwen strategy with restart-based rate changes, load truthful runtime speakers, and perform live in-app Qwen playback without silent fallback, packaged runtime work, or aligner scope.
43. ~~Backfill queue to ≥3~~ — COMPLETE. Promoted the approved Qwen-default / Kokoro-deprecation program, inserted `QWEN-DEFAULT-1` through `KOKORO-RETIRE-2` ahead of the reader-restoration lane, and restored queue depth to 7 (GREEN).
44. ~~Dispatch QWEN-DEFAULT-1 to CLI~~ — COMPLETE (v1.66.0). Qwen is now the default narration posture in product/UI/settings, Kokoro remains explicit legacy, and governance promotion landed.
45. ~~Dispatch QWEN-HARDEN-1 to CLI~~ — COMPLETE (v1.67.0). Qwen startup/playback hardening landed with timing budgets, playback reliability coverage, gate artifacts, and the retirement scorecard/listening-review evidence scaffold.
46. ~~Dispatch QWEN-PROVISION-1 to CLI~~ — COMPLETE (v1.68.0). Qwen now has an explicit CUDA-first supported-host policy, a deterministic one-shot preflight probe, typed `qwenPreflight` bridge coverage, and settings/runtime setup guidance that distinguishes not configured, broken, unsupported, and healthy host states without putting provisioning work on the narration hot path.
47. ~~Dispatch KOKORO-RETIRE-1 to CLI~~ — PAUSED on 2026-04-20. Subsequent live validation showed the current non-streaming local Qwen lane is not a sufficient successor path for sustained CPU narration, so retirement work is suspended pending the approved streaming-Qwen lane.
48. ~~Backfill queue to ≥3~~ — COMPLETE. Added `QWEN-STREAM-1` (streaming sidecar foundation) as queue position 3. Queue depth restored to 3 (GREEN). Spec based on approved design at `docs/superpowers/specs/2026-04-20-qwen-streaming-kokoro-backup-design.md`. Voice path: CustomVoice model with streaming generator (Option A), Kokoro reference samples as fallback (Option B).
49. ~~Dispatch READER-4M-2 to CLI~~ — COMPLETE (v1.69.0, 2026-04-20). Standalone Narrate mode landed alongside four-button bottom-bar controls. `N` is now the universal "enter Narrate paused" shortcut from any mode; `T` narration toggle removed. Pause/resume verified to stay in-mode for flow and narrate. 14 new tests (`tests/readerBottomBarControls.test.tsx`, `tests/useKeyboardShortcuts.test.ts`). Full `npm test` (2,102 tests) and `npm run build` passed.
50. **Dispatch READER-4M-3 to CLI** — Next action. Queue position 1, dispatch-ready. Backfill queue to ≥3 before dispatching so depth returns to GREEN.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| HOTFIX-13 | **Dissolved.** BUG-151/152/153 absorbed into SELECTION-1. BUG-154 parked (likely not a bug — needs live verification). |
| KOKORO-RETIRE-1 | **Paused.** Retirement posture was superseded as the immediate next step after live testing showed the current non-streaming local Qwen lane cannot sustain continuous CPU narration. Resume only after an execution-ready Qwen streaming lane exists and clears successor validation. |
| KOKORO-RETIRE-2 | **Paused.** Final Kokoro removal remains blocked behind the same streaming-lane proof; do not re-queue until `KOKORO-RETIRE-1` is reactivated and the updated scorecard is green. |
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
| READER-4M-2 | 2026-04-20 | PASS | Standalone Narrate mode + four-button controls. N key universal narrate entry. T toggle removed. 14 new tests. v1.69.0. |
| QWEN-PROVISION-1 | 2026-04-20 | PASS | Qwen provisioning/machine-realism hardening shipped at v1.68.0: `main/qwen-engine.js` gained a deterministic `preflight()` probe, IPC/preload/shared types now expose `qwenPreflight`, and settings now surface validation/setup guidance with explicit config-missing, broken-runtime, and supported-host reporting. The standalone `scripts/qwen_preflight.mjs` validator, `docs/testing/QWEN_RUNTIME_SETUP.md`, and `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` define the setup path and support matrix. Subsequent same-day live testing broadened current non-streaming local Qwen support to CPU-backed hosts but also showed that lane is still too slow for sustained continuous CPU narration, which is why Kokoro-retirement work is now paused behind the approved streaming-Qwen successor design. Verification passed with the focused provisioning suite (`16` tests across `4` files), full `npx vitest run tests`, and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-HARDEN-1 | 2026-04-20 | PASS | Qwen startup/playback hardening shipped at v1.67.0: `main/qwen-engine.js` now enforces per-command timeouts, deduplicates warmup/voice-list flights, and records truthful preload/status/generate timing plus spike metadata; renderer playback now stops cleanly on engine switches and authoritative handoffs, Qwen first-audio truth is scheduler-backed, and settings preview surfaces truthful timeout/error metadata instead of swallowing failures. Eval artifacts now capture warm preview and warm first-audio budgets, the gated matrix passes with `Warm preview latency p50/p95 = 1120 / 1156 ms`, `Warm first-audio latency p50/p95 = 465 / 507.6 ms`, and `0` startup spikes above `3000 ms`, and the retirement scorecard/listening-review artifacts are now in place with remaining provisioning and human-review blockers explicitly recorded. Verification passed with the focused Qwen hardening suites, adjacent eval/settings reruns, full `npx vitest run tests` (`138` files, `2083` tests), `npm run build`, and `node scripts/tts_eval_runner.mjs --matrix --gates`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-DEFAULT-1 | 2026-04-19 | PASS | Qwen-first default posture shipped at v1.66.0: new settings and narration profiles now default to Qwen, continuity/portability helpers preserve explicit legacy Kokoro selections without keeping it as a peer default, settings/runtime copy now presents Qwen as the primary live narration lane, and governance docs promoted the approved Qwen-default / Kokoro-deprecation program to the top of the queue. Verification passed with focused default/copy/persistence suites, full `npx vitest run tests`, and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-PROT-2 | 2026-04-18 | PASS | Bounded live Qwen prototype playback shipped at v1.65.0: Blurby now manages a configured Python sidecar in `main/qwen-engine.js`, exposes `qwenGenerate` over IPC/preload, uses a dedicated Qwen narration strategy with restart-based rate changes and heuristic/null-backed timing, surfaces truthful ready speaker lists in settings, and supports live in-app Qwen preview/playback without changing Kokoro defaults or adding packaged runtime/alignment work. Verification passed with focused Qwen runtime/settings/narration suites, broader touched-neighborhood reruns, full `npx vitest run tests` (`132` files, `2047` tests), and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-PROT-1 | 2026-04-18 | PASS | Bounded Qwen prototype foundation shipped at v1.64.0: `qwen` is now a first-class engine across shared types, persistence, preload/main status IPC, settings UI, and the browser test harness; `main/qwen-engine.js` truthfully reports config-missing/python-missing/prototype-stub states; and selecting Qwen no longer silently falls through to Web Speech or Kokoro. Verification passed with focused Qwen/settings/persistence suites plus full `vitest` and `npm run build`; a broad `npm test` invocation was blocked by unrelated vendored MeloTTS tests under `tmp/tts-candidates/`, and the existing Vite circular-chunk warning remained unchanged. |
| READER-4M-1 | 2026-04-18 | PASS | Infinite-scroll surface recovery and explicit mode foundation shipped at v1.63.0: `FoliatePageView` now exposes explicit rendered-word roots to `FlowScrollEngine`, live Flow boot/rebuild waits on `waitForSectionReady()` plus `foliateRenderVersion`, shared `ReaderMode` / persisted last-mode fields now admit `narrate`, keyboard compatibility is localized, and `ReaderContainer` Foliate `onLoad` now treats `narrate` as a flow-surface mode. Verification passed with focused reader/foundation suites, full `npm test` (`125` files, `2021` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-START-1 | 2026-04-17 | PASS | Startup parity shipped at v1.62.0: cached and uncached starts now share one opening-ramp planner contract (`13 -> 26 -> 52 -> 104 -> 148`), entry coverage warms that same shape before cruise coverage, `loadCachedChunk()` reconstructs exact nonzero-start spans from full-word context plus `startIdx`, and eval artifacts now record cached-vs-uncached startup parity plus opening-ramp shape. Verification passed with the focused startup/cache neighborhood (`6` files, `70` tests), dedicated startup-parity evidence (`artifacts/tts-eval/start1-startup-parity`) showing cached/uncached startup `370 / 508 ms` with `Opening ramp parity: match`, the gated release matrix (`9` runs, PASS), full `npm test` (`125` files, `2005` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-RATE-2 | 2026-04-17 | PASS | Segmented live Kokoro rate response shipped at v1.61.0: generated/cache buckets stay fixed, playback now splits into short scheduler-ready segments so same-bucket edits take effect by the next segment boundary instead of the full parent chunk, scheduler boundary semantics remain parent-chunk aware, and eval artifacts now record trusted `rateResponseLatencyMs` from real segment-start signals. Verification passed with the focused rate slice (`5` files, `42` tests), gated matrix release evidence (`artifacts/tts-eval/rate2-closeout`) showing `Rate response latency p50/p95: 210 / 210 ms`, full `npm test` (`124` files, `1995` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-CONT-1 | 2026-04-17 | PASS | Readiness-driven continuity shipped at v1.60.0: same-book and cross-book narration handoffs now resume from actual foliate/read-surface readiness instead of fixed `300ms` and `2500ms + 300ms` sleeps, the cross-book overlay is fallback-only rather than a blocking minimum dwell, and eval artifacts now record `sectionHandoffLatencyMs` and `crossBookResumeLatencyMs`. Verification passed with `npm test` (`123` files, `1976` tests), `npm run build`, a gated handoff matrix with non-null cross-book latency, and a section fixture run with non-null section latency; existing circular-chunk warning unchanged. |
| EPUB-TOKEN-1 | 2026-04-17 | PASS | Dropcap/split-token lexical stitching shipped at v1.59.0: no-whitespace contiguous styled fragments now resolve to one logical word across extraction, rendering, click/selection, and narration start paths; rendered spans carry token metadata; stitched-fragment interactions collapse to one stable global word index. Verification passed: focused slice `5/5` files and `43/43` tests, full suite `122/122` files and `1964/1964` tests, and `npm run build` with the existing non-blocking `settings -> tts -> settings` warning. Solon APPROVED. Plato READY with no findings. |
| TTS-RATE-1 | 2026-04-17 | PASS | Pitch-preserving Kokoro tempo shipped at v1.58.0: UI speed now moves in exact `0.1x` steps from `1.0x` to `1.5x`, generation/cache buckets stay fixed at `1.0` / `1.2` / `1.5`, exact-speed preview/status stays aligned to the selected speed, and in-bucket edits retime buffered playback live without restarting generation. Final verification passed with targeted tempo/rate suites, full release validation, and the gated six-rate matrix (`artifacts/tts-eval/final-gate-22`) covering `1.0` through `1.5` with PASS gate artifacts, drift max `2`, and zero pause/resume or handoff failures; existing circular-chunk warning unchanged. |
| TTS-HARDEN-2 | 2026-04-17 | PASS | Narration handoff and extraction integrity hardened: single active flow owner for section-end continuation, stronger narration core handoff contract for section/global-word swaps, foliate fallback ownership released once full-book metadata arrives, and active narration extraction moved onto the same dedupe path as background pre-extraction. Verification passed: targeted post-fix slice (`4` files, `28` tests), full `npm test` (`116` files, `1912` tests), and `npm run build`; existing circular-chunk warning unchanged. v1.57.0. |
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
