# Blurby — Development Roadmap

**Last updated**: 2026-05-22 — Roadmap review applied: Reader Runtime Solidification is the active conveyor ahead of UX polish and CI gating.
**Current state**: v1.75.1 stable baseline plus uncommitted Phase 0 and governance-sweep changes. Kokoro is the sole active local/cacheable model engine; Web Speech remains a platform fallback. MOSS-Nano and Pocket TTS are dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates.
**Queue**: GREEN (depth 10). 5 full specs + 5 stubs. Next dispatch: BASELINE-SYNC-1.
**Last sprint**: GOVERNANCE-SWEEP (2026-05-22) — doc hygiene and queue-source recovery completed after READER-MODE-ISOLATION-1 Phase 0.
**Queue source of truth**: `docs/governance/sprint-queue.xlsx` is the authoritative FIFO sprint queue. Keep its Catalog and Dashboard tabs current after every dispatch/closeout.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Sprint closeout convention:** Unless a sprint explicitly says otherwise, every successful CLI sprint auto-merges: stage specific files, commit on sprint branch, merge to `main` with `--no-ff`, push, update governance docs and `docs/governance/sprint-queue.xlsx`.

---

## Completed Work Summary

| Sprint | Date | Result | Close-Out |
|--------|------|--------|-----------|
| KOKORO-DEEPEN-1 | 2026-05-11 | Kokoro readiness and preflight checks | — |
| KOKORO-DEEPEN-2 | 2026-05-11 | Natural chunk highlighting for Kokoro TTS | — |
| KOKORO-DEEPEN-3 | 2026-05-11 | Voice mixing feasibility study | — |
| TTS-REGISTRY-1 | 2026-05-12 | Provider capability truth in ttsProviderRegistry | `ROADMAP_ARCHIVE_2026-05-14.md` |
| TTS-NORMALIZE-1 | 2026-05-13 | English-first spoken-text normalization | `ROADMAP_ARCHIVE_2026-05-14.md` |
| TTS-CACHE-TIMING-1 | 2026-05-13 | Schema-versioned v2 cache identities and atomic timing sidecars | `CloseOut.TTS-CACHE-TIMING-1.2026-05-14.md` |
| TTS-SYNC-1 | 2026-05-15 | Centralized narration highlight sync policy | `CloseOut.TTS-SYNC-1.2026-05-15.md` |
| TTS-DIAG-1 | 2026-05-15 | Provider-neutral diagnostics bundle | `CloseOut.TTS-DIAG-1.2026-05-15.md` |
| ENGINE-DORMANCY-1 | 2026-05-16 | Disabled dormant sidecar engines at settings/IPC | `CloseOut.ENGINE-DORMANCY-1.2026-05-16.md` |
| TTS-INTEGRATE-1 | 2026-05-16 | Merged sync and diagnostics branches to main | `CloseOut.TTS-INTEGRATE-1.2026-05-16.md` |
| TTS-CACHE-HARDEN-1 | 2026-05-16 | Cache-hit timing parity, type harmonization, IPC validation | `CloseOut.TTS-CACHE-HARDEN-1.2026-05-16.md` |
| TTS-EVENT-SYNC-1 | 2026-05-16 | Event-driven word sync from research | `CloseOut.TTS-EVENT-SYNC-1.2026-05-16.md` |
| NORMALIZER-ENRICH-1 | 2026-05-17 | Normalizer gap fill from abogen research | `CloseOut.NORMALIZER-ENRICH-1.2026-05-17.md` |
| TTS-RENDER-MAP-1 | 2026-05-17 | Sioyek-inspired word position index | `CloseOut.TTS-RENDER-MAP-1.2026-05-17.md` |
| TTS-PIPELINE-1 | 2026-05-17 | End-to-end pipeline integration tests | `CloseOut.TTS-PIPELINE-1.2026-05-17.md` |
| TTS-ARCH-DOC-1 | 2026-05-17 | Architecture decision records for TTS | `CloseOut.TTS-ARCH-DOC-1.2026-05-17.md` |
| SK-HYG-2 | 2026-05-16 | Directory reorganization (Lane E governance) | `CloseOut.SK-HYG-2.2026-05-16.md` |
| NARR-MEDIA-1 | 2026-05-17 | MediaSession integration — OS media controls for narration | `CloseOut.NARR-MEDIA-1.2026-05-17.md` |
| NARR-PAUSE-1 | 2026-05-18 | Named-pause state machine — 7 pause reasons with auto-resume | `CloseOut.NARR-PAUSE-1.2026-05-18.md` |
| TTS-PARITY-1 | 2026-05-18 | Cache/progress/resume parity hardening — 3 OutsideAudit.9 defects | `CloseOut.TTS-PARITY-1.2026-05-18.md` |
| NARR-SPOKEN-1 | 2026-05-18 | Spoken/display word separation — punctuation-only token filtering | `CloseOut.NARR-SPOKEN-1.2026-05-18.md` |
| NARR-CURSOR-2 | 2026-05-18 | Silence-aware cursor hold — gaps and pause-reason freeze | `CloseOut.NARR-CURSOR-2.2026-05-18.md` |
| TTS-EVAL-3 | 2026-05-18 | Quality evaluation + CI gate — Kokoro v2 baseline + `npm run test:quality` | `CloseOut.TTS-EVAL-3.2026-05-18.md` |
| FLOW-ZONE-AUTO | 2026-05-19 | Descending auto-advancing reading zone + render-loop fix | — |
| READER-MODE-ISOLATION-1 Phase 0 | 2026-05-21 | Preflight stabilization for Foliate Flow/Narrate word-0 recentering and browse-away reset | `CloseOut.READER-MODE-ISOLATION-1-PHASE-0.2026-05-21.md` |
| GOVERNANCE-SWEEP | 2026-05-22 | Doc hygiene sweep: moved 1 memo, archived 7 dispatch files, created 6 hub readmes, repaired queue/agent references | — |

**Dissolved sprints:**
- `TEST-HARNESS-1` — Nano probes irrelevant after Kokoro-only pivot (2026-05-15)
- `TTS-CANARY-1` — Sidecar engines dormant, canary probes unnecessary (2026-05-15)
- `TTS-REGISTRY-DISPATCH-1` — Single active engine, registry dispatch unnecessary (2026-05-15)

---

## Active & Remaining Sprint Skeletons

### Standing Rules All Skeletons Inherit

1. **PR-2 / PR-3 / POSTV2 type gate:** After any code change run `npm run typecheck` and `npm test`; after any UI/dependency change run `npm run build`.
2. **PR-7:** CSS custom properties for all theming — no inline styles.
3. **PR-10:** All JSON writes must be atomic (write-tmp + rename).
4. **PR-12:** Context for cross-cutting concerns (settings, toasts, theme); props for direct parent-child data.
5. **PR-17:** Never drive imperative DOM animations from React useEffect — use a plain class.
6. **PR-26:** Settings that control a runtime engine must have explicit sync bridges.
7. **SRL-012:** For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible.
8. **Queue depth >=3:** If queue drops below 3 after completion, stop and backfill before next dispatch.
9. **Spec-compliance before quality:** Each task gets Solon check (does it match spec?) before Plato check (is it well-built?).
10. **Dispatch sizing:** 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.
11. **SRL-046:** Cross-mode/shared-surface refactors must start with a preflight stabilization gate that locks exact-anchor, visual-follow, and mode-switch invariants.
12. **SRL-047:** Mode adapter specs must include lifecycle reset requirements for local visual refs, browse-away state, cursor baselines, and recenter affordances.
13. **Broad-suite-before-CI:** Do not dispatch CI gate wiring while default broad-suite failures are being waived as unrelated debt; first classify or fix them.
14. **Agent rename propagation:** Any agent rename must include a grep-and-replace pass across governing docs and workflow references before the rename sprint closes.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 0 — Baseline Sync

#### BASELINE-SYNC-1 — Commit Phase 0 + Governance Sweep Baseline *(position 1 — full spec)*

- **What:** Review, explicitly stage, verify, and commit the current uncommitted Phase 0 reader stabilization plus GOVERNANCE-SWEEP hygiene changes. This sprint is a baseline-recovery dispatch: it separates intentional work from unrelated local dirt and leaves `main` in a named, recoverable state before adapter extraction starts.
- **Why:** Phase 0 fixed load-bearing Flow/Narrate guardrails, and GOVERNANCE-SWEEP fixed source-of-truth hygiene. Starting adapter work before committing those changes would make rollback, bisecting, and future review muddy.
- **Prerequisites:** READER-MODE-ISOLATION-1 Phase 0 complete; GOVERNANCE-SWEEP complete; current dirty worktree available for review.
- **Done when:**
  1. Phase 0 runtime/test/spec files are reviewed and staged intentionally.
  2. GOVERNANCE-SWEEP moves, archives, readmes, and content repairs are reviewed and staged intentionally.
  3. Roadmap-review artifacts and queue updates are staged intentionally.
  4. Unrelated dirt is excluded or explicitly documented as deferred.
  5. Focused Phase 0 tests pass: `npm test -- tests/useReaderMode.test.ts tests/phase0Stabilization.test.ts`.
  6. Governance sweep verification passes: no `Hephaestus`, no `v1.76.0`, no active `sprint-queue.md`, no `~20k`, and no ghost agents in tracked governance docs.
  7. `git diff --check` passes.
  8. Commits are split by concern where practical: Phase 0 runtime/test/spec, governance sweep hygiene, roadmap/workbook sync.
- **Effort:** M. Mostly git/document hygiene with enough judgment required to avoid staging unrelated dirt.
- **Roster:** codex-parent / CLI worker only. No parallel workers; the value is coherent staging and review.
- **Source:** `docs/planning/roadmap-reviews/2026-05-21-plan.md`; `docs/governance/close-outs/CloseOut.READER-MODE-ISOLATION-1-PHASE-0.2026-05-21.md`; GOVERNANCE-SWEEP Phase 6 summary; `governance-sweep-spec.2026-05-21.md`.

##### Implementation detail

- **Edit sites:** No feature edits expected. Review current diffs in `src/components/FoliatePageView.tsx`, `tests/useReaderMode.test.ts`, `tests/phase0Stabilization.test.ts`, governance sweep archive/readme/content files, `ROADMAP.md`, and `docs/governance/sprint-queue.xlsx`.
- **Tests:** `npm test -- tests/useReaderMode.test.ts tests/phase0Stabilization.test.ts`; governance grep checks from GOVERNANCE-SWEEP; `git diff --check`.
- **Constants:** None.
- **Branch:** No new feature branch required; this sprint reconciles current dirty `main`. If a branch is required by tooling, create `sprint/baseline-sync-1` only after preserving the dirty state.
- **Commit hygiene:** Explicit-stage only. Do not use destructive cleanup. Do not stage `.idea/workspace.xml`, `tests/perf-baseline-results.json`, `.governance-sweep-backup/`, or other local-only artifacts unless deliberately approved.

#### Stage 1 — Test Health

#### TEST-GREEN-1 — Broad Suite Failure Triage *(position 2 — full spec)*

- **What:** Reproduce and classify the 12 broad-suite failures reported during Phase 0: PDF export, FlowScrollEngine chunks, TTS cache/parity, silence cursor, CSS injection, and structural checks. Fix only failures that are cheap and clearly in-scope; otherwise document a formal classification and unblock path.
- **Why:** `TTS-QUAL-CI-1` cannot be meaningful while broad-suite failures are waived as unrelated debt. A failing default suite also makes adapter isolation riskier because regressions are harder to distinguish from noise.
- **Prerequisites:** BASELINE-SYNC-1 completed; working tree clean except explicitly deferred local artifacts.
- **Done when:**
  1. Full `npm test` is rerun and the current failing files are captured.
  2. Each failure is classified as fix-now, quarantine/skip-with-ticket, obsolete test, product bug, or environmental flake.
  3. Any fix-now failures are repaired with focused tests.
  4. Any deferred failures have an explicit owner document or follow-up row.
  5. Default verification path for future reader-mode work is documented.
  6. `npx tsc --noEmit` passes or failures are classified separately.
- **Effort:** M. Investigation-heavy but bounded by classification, not mandatory repair of every historical failure.
- **Roster:** codex-parent; optional explorer only if failures span unrelated subsystems.
- **Source:** READER-MODE-ISOLATION-1 Phase 0 close-out full-suite note; `docs/planning/roadmap-reviews/2026-05-21-assessment.md`.

##### Implementation detail

- **Edit sites:** Likely `tests/*`, possibly source files for cheap obvious failures. Do not modify reader-mode runtime unless a failure directly proves a reader regression.
- **Tests:** `npm test`; focused reruns for each failed file; `npx tsc --noEmit`; `git diff --check`.
- **Constants:** None expected.
- **Branch:** `sprint/test-green-1-broad-suite-triage` from clean `main`.
- **Commit hygiene:** One classification artifact plus fixes if any. Keep broad-suite evidence concise; do not commit large generated logs.

#### Stage 2 — Adapter Isolation

#### READER-ISO-1A — Adapter Contracts + Current Word Anchor Service *(position 3 — full spec)*

- **What:** Add type-only reader mode adapter contracts and a tested current-word anchor service. This phase creates the boundary without moving runtime behavior yet.
- **Why:** Flow, Narrate, Focus, and Page need an explicit contract before implementation moves. The anchor service must preserve word `0`, hard selection precedence, resume anchors, and soft visible fallback ordering.
- **Prerequisites:** TEST-GREEN-1 complete or current broad-suite failures formally classified; `docs/planning/specs/2026-05-21-reader-mode-runtime-isolation-design.md` accepted as source.
- **Done when:**
  1. `src/reader/modes/ReaderModeAdapter.ts` or equivalent typed contract exists.
  2. `src/reader/anchors/useCurrentWordAnchor.ts` or equivalent anchor service exists.
  3. Contract tests compile and anchor precedence tests pass.
  4. Word index `0` is explicitly covered as a valid anchor.
  5. No runtime behavior changes are introduced in this sprint.
  6. `npm test -- tests/currentWordAnchor.test.ts tests/readerModeAdapterContract.test.ts tests/useReaderMode.test.ts` or equivalent focused coverage passes.
  7. `npx tsc --noEmit` and `git diff --check` pass.
- **Effort:** M. New contracts and tests, intentionally behavior-preserving.
- **Roster:** codex-parent or single worker; no parallel split needed.
- **Source:** `docs/planning/specs/2026-05-21-reader-mode-runtime-isolation-design.md` Phase 1; SRL-046; SRL-047; READER-4M-3 anchor lessons.

##### Implementation detail

- **Edit sites:** `src/reader/modes/ReaderModeAdapter.ts` (new), `src/reader/anchors/useCurrentWordAnchor.ts` (new), `tests/currentWordAnchor.test.ts` (new), `tests/readerModeAdapterContract.test.ts` (new), possibly exports/index files.
- **Tests:** Anchor precedence, explicit selection outranks resume/soft visible, mode-advance only from active mode, word `0`, adapter snapshot contract.
- **Constants:** None.
- **Branch:** `sprint/reader-iso-1a-adapter-anchor-contracts` from clean `main`.
- **Commit hygiene:** Behavior-preserving contract commit only. If runtime wiring becomes necessary, stop and amend scope.

#### READER-ISO-1B — Orchestrator Shell + Mode Selection Semantics *(position 4 — full spec)*

- **What:** Extract mode selection/start/pause/stop routing from `useReaderMode.ts` into an orchestrator shell while preserving current behavior. Keep mode selection separate from playback and preserve delayed readiness retry intent.
- **Why:** `startFlow(...)` still carries mode-specific meaning for both Flow and Narrate. The orchestrator shell is the first step toward preventing Flow fixes from erasing Narrate intent.
- **Prerequisites:** READER-ISO-1A complete.
- **Done when:**
  1. A `useReaderModeOrchestrator` or equivalent shell owns mode select/start/pause/stop routing.
  2. Selecting Page, Focus, Flow, or Narrate does not start playback.
  3. Play/Space starts the selected mode from the current anchor.
  4. `C` navigation remains global across all modes unless a text input owns the key event.
  5. Delayed Foliate readiness retries preserve original mode intent and do not default Narrate to Flow.
  6. Existing Narrate exact-start tests and Phase 0 structural gates pass.
  7. `npx tsc --noEmit` and `git diff --check` pass.
- **Effort:** L. Cross-cutting hook extraction with high regression risk.
- **Roster:** codex-parent with optional explorer for hook call graph before edits.
- **Source:** Isolation spec Phase 2; `docs/governance/TECHNICAL_REFERENCE.md` Reader Runtime Lock-In Contracts; SRL-047.

##### Implementation detail

- **Edit sites:** `src/hooks/useReaderMode.ts`, new `src/reader/useReaderModeOrchestrator.ts`, `tests/useReaderMode.test.ts`, `tests/useKeyboardShortcuts.test.ts`, `tests/phase0Stabilization.test.ts`.
- **Tests:** Mode selection no auto-start, Space/Play start behavior, `C` in every mode, delayed Foliate extraction preserves Narrate options, no bare `startFlow()` in retry paths.
- **Constants:** `FOLIATE_SECTION_LOAD_WAIT_MS` behavior must be preserved.
- **Branch:** `sprint/reader-iso-1b-orchestrator-shell` from clean `main`.
- **Commit hygiene:** One orchestrator extraction commit plus test commit if helpful. Do not combine with Flow/Narrate adapter migration.

#### READER-ISO-1C — Focus Adapter + Passive Surface Contract Start *(position 5 — full spec)*

- **What:** Move Focus lifecycle behind the new adapter boundary and begin typing passive Foliate surface commands without moving Flow or Narrate ownership yet.
- **Why:** Focus is the lowest-risk adapter migration and proves that the adapter contract can own lifecycle and anchor updates without disturbing Flow or Narrate.
- **Prerequisites:** READER-ISO-1B complete.
- **Done when:**
  1. Focus has a `FocusModeAdapter` or equivalent adapter.
  2. Focus starts from the exact current anchor, including word `0`.
  3. Focus updates the shared anchor only while Focus is active.
  4. Focus pause/resume stays in Focus and does not mutate Flow/Narrate runtime state.
  5. Passive surface command types exist for highlight/scroll requests used by Focus or shared code.
  6. Flow and Narrate focused regression tests still pass.
  7. `npx tsc --noEmit` and `git diff --check` pass.
- **Effort:** M. Bounded adapter migration with meaningful integration checks.
- **Roster:** codex-parent or single worker.
- **Source:** Isolation spec Phase 3 and Phase 6 setup; SRL-046/SRL-047.

##### Implementation detail

- **Edit sites:** `src/reader/modes/FocusModeAdapter.ts` (new), `src/hooks/useReadingModeInstance.ts`, `src/modes/FocusMode.ts` only if needed, passive surface type file, `tests/focusModeAdapter.test.ts`, `tests/useReaderMode.test.ts`.
- **Tests:** Focus exact anchor start, word `0`, mode-advance ownership, pause/resume, Flow/Narrate state untouched.
- **Constants:** Existing Focus WPM behavior must remain unchanged.
- **Branch:** `sprint/reader-iso-1c-focus-adapter` from clean `main`.
- **Commit hygiene:** Focus adapter only. Do not migrate Flow or Narrate in this sprint.

#### READER-ISO-1D — Flow Adapter + Section Handoff Restart Ownership *(stub)*

Move Flow lifecycle and FlowScrollEngine ownership behind a Flow adapter. Flow section-handoff restart must live only inside Flow adapter ownership and must not touch Narrate truth-sync.

---

#### READER-ISO-1E — Narrate Adapter + Audio Truth-Sync Ownership *(stub)*

Move Narrate lifecycle behind a Narrate adapter. Narrate remains audio/TTS truth-sync owned, starts at the exact selected/current word, and never starts or follows FlowScrollEngine.

---

#### GOV-HUMAN-REVIEW-1 — Deferred Governance Review Items *(stub)*

Resolve the six human-review items left by GOVERNANCE-SWEEP: MarcusAurelius stub, stale roadmap header traces, ROADMAP_SPECS references/duplication, close-out volume, and naming-convention outliers.

---

#### TTS-QUAL-CI-1 — CI Regression Gate Wiring *(stub)*

Wire `npm run test:quality` into GitHub Actions CI matrix after TEST-GREEN-1 establishes a clean or formally classified default-suite baseline. PRs touching TTS files should auto-run quality gates and block regressions.

---

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(stub)*

Library card 3-line format, "New" dot auto-clear, Ctrl+K command palette entries, and Space bar starts the last-used reading mode after reader runtime controls are stable.

---

## Deferred Lanes

- **KOKORO-EXPORT-1** — Long-form audio export (M4B/SRT/ASS). Optional future after Reading Experience v2.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — Wire `createStrategy?` seam in `ttsProviderRegistry.ts`. Premature while non-Kokoro engines are dormant.
- **Playback-buffered-seconds backpressure** — `scheduler.getBufferedSeconds()` throttle. Revisit if TTS-EVAL-3 soak run reveals buffer pressure.
- **Track B** — Chrome Extension (EXT-ENR-C and beyond)
- **Track C** — Android APK (APK-0 through APK-4)
- **Phase 7** — Cloud Sync
- **Phase 8** — RSS/News
- **Idea Themes A-K** — See `docs/governance/IDEAS.md`

See `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` for full deferred specs.

---

## Notes

- TTS Architecture Complete finish line reached 2026-05-17. All decisions documented in `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`.
- Desktop v2.0 shipped.
- New active stage established: Reader Runtime Solidification before Quality Gate Activation and UX polish (2026-05-22).
- SSML as internal format explicitly **rejected** per research consensus — structured text + normalizer trace is cleaner than SSML payload. (2026-05-17)

<!-- Frontmatter:
loe_unit: t-shirt
last_review: 2026-05-22
finish_line: "Reader Runtime Solidification"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
-->
