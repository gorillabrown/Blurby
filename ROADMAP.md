# Blurby — Development Roadmap

**Last updated**: 2026-05-22 — READER-PERSISTENT-ANCHOR Step 3.1 is code-complete; manual QA revalidation remains required before READER-ISO-1A.
**Current state**: v1.75.1 stable baseline plus committed Phase 0, governance sweep, roadmap queue recovery, and broad-suite drift triage. The reader persistent-anchor hotfix branch remains unmerged; Step 3.1 commit `e6ebb07` landed fixes for S1, S4, S5, and S18 after Step 3 improved manual QA to 13 pass / 2 partial / 3 fail. S9 Flow lazy-follow is intentionally deferred as high-risk, and the full 18-scenario manual QA rerun is the active blocker before adapter isolation. Kokoro is the sole active local/cacheable model engine; Web Speech remains a platform fallback. MOSS-Nano and Pocket TTS are dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates.
**Queue**: GREEN (depth 9). 5 full specs + 4 stubs. Active gate: READER-PERSISTENT-ANCHOR Step 3.1 full 18-scenario manual QA rerun.
**Last sprint**: TEST-GREEN-1 (2026-05-22) — classified and resolved 12 broad-suite failures before adapter extraction. Latest branch close-out: READER-PERSISTENT-ANCHOR Step 3.1 is code-complete/manual-QA-pending and still not main-landed.
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
| BASELINE-SYNC-1 | 2026-05-22 | Committed Phase 0 reader stabilization, governance sweep, and roadmap queue recovery in three pushed commits | `CloseOut.BASELINE-SYNC-1.2026-05-22.md` |
| TEST-GREEN-1 | 2026-05-22 | Classified and resolved 12 broad-suite failures: 10 fixed, 1 quarantined, obsolete tests removed, and environmental flakes documented | `CloseOut.TEST-GREEN-1.2026-05-22.md` |

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
15. **SRL-053:** Foliate reader-mode runtime changes require screen-interaction manual QA before merge or roadmap advancement.
16. **SRL-054:** Reader-anchor specs must distinguish hard-selected anchor, last-read progress, live playback cursor, and temporary browse-away position.
17. **SRL-055:** Shared Foliate surface behavior needs at least one live UI gate for real layout movement, rendering, and follow behavior.
18. **SRL-056:** Hard-selected anchors must only be cleared by cause-aware lifecycle events that truly invalidate them.
19. **SRL-057:** Same-section and cross-section Foliate movement must be accepted separately.
20. **SRL-058:** Each reading mode needs its own active-render QA gate.
21. **SRL-059:** CSS-column word-position indexes need live rect validation before same-section movement decisions.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate

#### READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Persistent Anchor Manual QA Repair *(position 1 — full spec)*

- **Status:** Code-complete on `hotfix/reader-persistent-anchor` through `e6ebb07`; Step 3 manual QA rerun complete at 13 pass / 2 partial / 3 fail; Step 3.1 fixes landed for S1, S4, S5, and S18; manual QA rerun required before merge or queue advancement.
- **What:** Repair the user-facing persistent-anchor failures discovered by Step 2 manual QA across Page, Focus, Flow, and Narrate while preserving the Step 2 wins that passed.
- **Why:** The branch is automation-green but manual-QA-red. Adapter isolation should not extract or codify broken Page jump-back, blank Focus playback, Flow non-follow, Narrate wrong-start, or hard-click retarget behavior.
- **Prerequisites:** `hotfix/reader-persistent-anchor` remains unmerged; `docs/studies/reviews/Reader_Persistent_Anchor_Step2_Manual_QA_2026-05-22.md` and `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP-2.2026-05-22.md` accepted as source evidence.
- **Done when:**
  1. Page mode opens paused with Play disabled, and Page Jump back returns to the exact hard-selected anchor after paginated browsing away.
  2. Focus paused mode keeps the infinite-scroll surface, shows Jump back after browsing away, and Focus Play renders the first active word exactly at the hard-selected anchor with no blank overlay.
  3. Flow Play centers the current hard-selected word, keeps a single underline cursor, rolls the text through the reading window, and manual browse-away pauses Flow while showing Jump back.
  4. Narrate Play starts exactly at the hard-selected word, active narration continues on browse-away, and Narrate Jump back continues to work without restarting audio.
  5. Hard-clicking a new word updates the hard-selected anchor and retargets playback consistently in paused and active Focus, Flow, and Narrate.
  6. Book reopen uses Page mode at the persistent hard-selected/last-read word without stale CFI overriding it; switching to Narrate does not jump to a different restore position.
  7. Inactive mode buttons do not show selected-looking ghost fills while Page is active.
  8. Preserved contracts remain intact: mode selection never auto-starts, paused cross-mode handoff lands on the anchor, Flow has no double highlight, Narrate browse-away remains audio-owned, and `getEffectiveWords` does not flood the console.
  9. The 18-scenario manual QA matrix passes or any remaining miss has explicit user-approved disposition.
  10. Focused regression tests, `npx tsc --noEmit`, and `git diff --check` pass.
- **Effort:** L. Cross-mode Foliate runtime repair with manual QA gate.
- **Roster:** codex-parent for implementation; one manual screen QA pass after automated verification.
- **Source:** Step 2 manual QA report; Step 2 close-out; SRL-053; SRL-054; SRL-055.

##### Implementation detail

- **Primary edit sites:** `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/components/ReaderBottomBar.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/usePersistentReadingAnchor.ts`, `src/hooks/useFoliateSync.ts`, `src/hooks/useDocumentLifecycle.ts`, `src/utils/persistentAnchor.ts`.
- **Test roster:** existing persistent-anchor matrix tests plus focused additions for Page jump-back motion, Focus first-word render, Flow follow/auto-pause, Narrate exact hard-selected start, active hard-click retarget, reopen CFI precedence, and inactive button styling.
- **Manual QA roster:** Step 3 rerun saved at `docs/studies/reviews/Reader_Persistent_Anchor_Step3_Repair_Manual_QA_2026-05-22.md`; Step 3.1 must rerun the same 18-scenario matrix after repair.
- **Branch:** continue from `hotfix/reader-persistent-anchor` or create `hotfix/reader-persistent-anchor-step3-repair` from that branch. Do not merge to `main` until manual QA passes.
- **Commit hygiene:** Preserve passing Step 2 behavior. Prefer commits grouped by failure cluster: jump-back/reopen, Focus/Flow playback, Narrate exact start/retarget, button polish/tests.

##### Step 3.1 repair gate

- **Problem:** Step 3 resolved the highest-risk Narrate and Flow failures, but three manual-QA failures remain: S1 Page same-section Jump Back no-op, S4 Focus active overlay blank/frozen, and S5 Focus paused browse-away missing Jump Back.
- **Scope:** Fix S1, S4, and S5 first. Investigate S18 Page reopen lag alongside S1 if it shares the same same-section movement or stale-CFI root. Treat S9 Flow lazy follow as secondary polish unless it is cheap and low-risk.
- **Done when:** S1, S4, and S5 pass in screen-interaction manual QA; S9 and S18 are either fixed or explicitly dispositioned; the full 18-scenario matrix is rerun; focused tests, `npx tsc --noEmit`, and `git diff --check` pass.
- **Merge gate:** Do not merge `hotfix/reader-persistent-anchor` or dispatch `READER-ISO-1A` until this Step 3.1 gate passes.
- **Step 3.1 code result:** Commit `e6ebb07` fixed S1 with `forceMotion` in the highlight pipeline, S4 by using global words in `onWordAdvance`, S5 by preserving Focus browse-away state, and S18 with a separate cheap reopen-position fix. S9 was investigated and deferred as a dedicated Flow-Foliate scroll coordination problem.

#### Stage 2 — Adapter Isolation

#### READER-ISO-1A — Adapter Contracts + Current Word Anchor Service *(position 2 — full spec)*

- **What:** Add type-only reader mode adapter contracts and a tested current-word anchor service. This phase creates the boundary without moving runtime behavior yet.
- **Why:** Flow, Narrate, Focus, and Page need an explicit contract before implementation moves. The anchor service must preserve word `0`, hard selection precedence, resume anchors, and soft visible fallback ordering.
- **Prerequisites:** `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` complete with manual QA pass; TEST-GREEN-1 complete or current broad-suite failures formally classified; `docs/planning/specs/2026-05-21-reader-mode-runtime-isolation-design.md` accepted as source.
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

#### READER-ISO-1B — Orchestrator Shell + Mode Selection Semantics *(position 3 — full spec)*

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

#### READER-ISO-1C — Focus Adapter + Passive Surface Contract Start *(position 4 — full spec)*

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

#### READER-ISO-1D — Flow Adapter + Section Handoff Restart Ownership *(position 5 — full spec)*

- **What:** Move Flow lifecycle, `FlowScrollEngine` ownership, section-handoff restart, browse-away pause, and visual-follow commands behind a Flow adapter.
- **Why:** Flow has repeatedly regressed Narrate and shared Foliate behavior because its scroll engine, restart logic, and visual cursor live in shared component paths. After Step 3 repair, Flow ownership must be isolated without changing Narrate truth-sync.
- **Prerequisites:** READER-ISO-1C complete; READER-PERSISTENT-ANCHOR-STEP3-REPAIR manual QA pass remains green; Flow manual QA scenarios 6-10 have passing baseline evidence.
- **Done when:**
  1. `FlowModeAdapter` or equivalent owns Flow select/start/pause/stop, FlowScrollEngine construction, restart, teardown, and browse-away pause behavior.
  2. Flow start uses the shared current-word anchor and preserves exact word `0`.
  3. Flow section-handoff restart lives inside Flow adapter ownership and does not call or mutate Narrate runtime state.
  4. Flow visual commands are typed as surface requests and use the single underline cursor path.
  5. Manual browse-away pauses Flow, shows Jump back, and does not persist browse-away as progress.
  6. Narrate exact-start, Narrate browse-away, and Narrate audio truth-sync regression tests still pass.
  7. `npm test -- tests/flowModeAdapter.test.ts tests/useReaderMode.test.ts tests/foliate-bridge.test.ts` or equivalent focused suite passes.
  8. `npx tsc --noEmit` and `git diff --check` pass.
- **Effort:** L. Cross-cutting runtime migration with high shared-surface regression risk.
- **Roster:** codex-parent with explorer assistance for current FlowScrollEngine call graph before edits if available.
- **Source:** Isolation spec Phase 4; SRL-046; SRL-047; SRL-053; SRL-055; Step 3 manual QA pass.

##### Implementation detail

- **Edit sites:** new `src/reader/modes/FlowModeAdapter.ts`, `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`, `src/utils/FlowScrollEngine.ts`, shared surface command types, `tests/flowModeAdapter.test.ts`, `tests/useReaderMode.test.ts`, `tests/foliate-bridge.test.ts`.
- **Tests:** Flow adapter lifecycle, exact anchor start including word `0`, section handoff restart after `onComplete`, browse-away pause, jump-back visibility, single underline cursor, and Narrate non-interference.
- **Constants:** Preserve existing Flow WPM and line-window settings. Do not tune pacing in this sprint unless a failing test proves the adapter migration changed behavior.
- **Branch:** `sprint/reader-iso-1d-flow-adapter` from clean `main` after prior isolation sprints land.
- **Commit hygiene:** Flow adapter only. Do not migrate Narrate or add new Flow UX features.

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
