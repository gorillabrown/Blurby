# Blurby — Development Roadmap

**Last updated**: 2026-05-29 — SINGLE-INSTANCE-LOCK-1 completed (Electron single-instance lock). 2 full specs queued (THEME-SYNC-1, NARRATE-CLOSED-LOOP-CURSOR) + 2 stubs (UX-POLISH-1 at 3, HYG-XLSX-DASHBOARD-RESTORE at 4). **Next dispatch: THEME-SYNC-1**.
**Current state**: v1.75.1 stable baseline plus READER-ISO-1A/1B/1C/1D/1E. All four mode adapters (Focus, Flow, Narrate) plus the typed contract (1A) and orchestrator shell (1B) are in place. S9 Flow lazy-follow remains intentionally deferred. Kokoro is the sole active engine; MOSS-Nano/Pocket TTS dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates. Graduated tiers: (1) CI quality gate active (TTS-QUAL-CI-1), (2) closed-loop cursor lands (NARRATE-CLOSED-LOOP-CURSOR), (3) all 2026-05-28 discovery bugs closed (EXT-PAIR-1, THEME-SYNC-1, SINGLE-INSTANCE-LOCK-1), (4) UX polish lands (UX-POLISH-1 + downstream).
**Queue**: GREEN — depth 4 (2 full specs at positions 1-2; 2 stubs at positions 3-4). **Conveyor belt order: THEME-SYNC-1 → NARRATE-CLOSED-LOOP-CURSOR → UX-POLISH-1 → HYG-XLSX-DASHBOARD-RESTORE**. Position 2 (NARRATE-CLOSED-LOOP-CURSOR) is the sole shared-core sprint and runs alone.
**Last sprint**: SINGLE-INSTANCE-LOCK-1 (2026-05-29) — Electron single-instance lock.
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
| READER-PERSISTENT-ANCHOR-STEP3-REPAIR | 2026-05-24 | Repaired persistent-anchor UX (S1/S4/S8/S12 exact-start/S18); S5 partial, S9 deferred; S13 Narrate sync proven a unified post-isolation closed-loop problem; merged at `25b6a26` | `CloseOut.READER-PERSISTENT-ANCHOR-STEP3.6.2026-05-24.md` |
| READER-ISO-1A | 2026-05-24 | Added typed reader-mode adapter contracts and current-word anchor service with 73 tests and no runtime behavior change | `CloseOut.READER-ISO-1A.2026-05-24.md` |
| READER-ISO-1B | 2026-05-25 | Extracted mode routing into `useReaderModeOrchestrator` while preserving current reader behavior | `CloseOut.READER-ISO-1B.2026-05-25.md` |
| READER-ISO-1C | 2026-05-26 | FocusModeAdapter + passive surface command types with 27 adapter tests | `CloseOut.READER-ISO-1C.2026-05-26.md` |
| READER-ISO-1D | 2026-05-26 | FlowModeAdapter + section-handoff resolution + browse-away with 40 adapter tests | `CloseOut.READER-ISO-1D.2026-05-26.md` |
| READER-ISO-1E | 2026-05-27 | NarrateModeAdapter + audio truth-sync ownership with 45 adapter tests | `CloseOut.READER-ISO-1E.2026-05-27.md` |
| GOV-HUMAN-REVIEW-1 | 2026-05-27 | Deferred governance hygiene: MarcusAurelius stub removed, Hercules.md renamed, 8 close-outs archived, rosters reconciled | `CloseOut.GOV-HUMAN-REVIEW-1.2026-05-27.md` |
| TTS-QUAL-CI-1 | 2026-05-28 | CI regression gate wired (`quality-gate` job), `scripts/recalc.py` governance tooling added, LOE dropdown extended with XS | `CloseOut.TTS-QUAL-CI-1.2026-05-28.md` |
| EXT-PAIR-1 | 2026-05-29 | Chrome extension pairing auth timeout repair — `WS_PAIRING_TIMEOUT_MS` (5 min) replaces 5s initial auth window, structured WS logging, 8 new tests, BUG-183 closed | `CloseOut.EXT-PAIR-1.2026-05-29.md` |
| SINGLE-INSTANCE-LOCK-1 | 2026-05-29 | Electron single-instance lock — `app.requestSingleInstanceLock()` + `second-instance` focus handler prevents duplicate windows | `CloseOut.SINGLE-INSTANCE-LOCK-1.2026-05-29.md` |

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
22. **SRL-060:** Narrate sync gates must verify heard audio, not only visual cursor position.
23. **SRL-061:** Cross-surface cursor visuals need one declared owner per mode.
24. **SRL-062:** Narrate timing repairs should be sized as investigation-heavy.
25. **SRL-063:** Fixed cursor-lag constants are provisional when audio output latency is hardware-dependent.
26. **SRL-064:** Narrate exact-start and continuous sync are separate acceptance gates.
27. **SRL-065:** Active retarget paths must have a single resync owner.
28. **SRL-066:** Downstream chunk dispatch must use resolved plan boundaries, not raw targets.
29. **SRL-067:** Visual and audio pipelines must not share raw word indexes unless they share tokenization.
30. **SRL-068:** Prefer canonical content alignment over tokenizer unification across renderer/source boundaries.
31. **SRL-069:** Prefetched audio boundaries must be source-owned before driving heard-audio cursors.
32. **SRL-070:** Narrate/sync QA gates require an audio-independent ground truth (Evan's ear, or a non-self-referential instrument such as schedule-vs-wallclock drift). Scheduler-derived metrics (boundary drift, scroll-follow, handoff index) are NOT sync evidence.
33. **SRL-073:** Adapter/anchor services that mutate active-owner state must include transition tests proving cleanup happens when ownership changes, plus no-op tests proving same-owner selection does not clear valid state.
34. **SRL-074:** Orchestrators route public lifecycle actions; ref-heavy teardown/truth-sync functions stay as building blocks in the owning hook until their adapter owns the relevant refs — do not force them across a boundary just to make an extraction look complete.
35. **SRL-079 — Source-fix verification needs rebuild gate.** Any bug whose disposition is "RESOLVED in source — production build needs rebuild" stays OPEN in BUG_REPORT.md until `npm run build` + a smoke-test pass against the bug's original reproducer confirms the rebuilt binary behaves correctly. The fix is not closed when the source diff lands; it is closed when the binary the user is actually running embodies the diff. **Why:** Five consecutive bugs drifted past close-out with the fix in source but the running binary stale (BUG-176/178/179/180/181), and the 2026-05-27 live-QA discovery sweep re-found BUG-181 as "F2" because rebuild had never happened. The pattern wastes downstream investigation cycles. **How to apply:** Any sprint with "verification blocked by stale production build" in close-out remains OPEN. Adopt rebuild+smoke as the explicit final acceptance step for source-fix-only sprints. (Promoted 2026-05-28 after the discovery sweep / rebuild verification pass.)

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Active Conveyor Belt

The eager-spec buffer of 2 dispatchable sprints (positions 1–2 are full specs; positions 3-4 are stubs). Conveyor order applies dependency-first → risk-first → eat-the-frog tiebreakers. THEME-SYNC-1 is the next dispatch (per the planning contract). NARRATE-CLOSED-LOOP-CURSOR sits at position 2 — it's the heaviest sprint but is now unblocked since READER-ISO-1E shipped 2026-05-27. SINGLE-INSTANCE-LOCK-1 completed 2026-05-29 (F1 fixed). One remaining hotfix sprint (THEME-SYNC-1) covers the 2026-05-28 discovery-pass bug BUG-182.

---

#### THEME-SYNC-1 — Settings Theme Propagation + Vite Circular Chunk Repair *(position 1 — full spec)*

- **What:** Resolve BUG-182 (Settings panel does not fully repaint on light↔dark theme toggle) by (a) breaking the `settings -> tts -> settings` circular chunk identified by `npm run build` 2026-05-28, and (b) auditing theme-context subscription across Settings sub-pages to confirm clean propagation after the chunk fix. The circular chunk is the leading hypothesis for the theme bug — circular imports across Vite chunks produce nondeterministic module-init order, which can leave context providers (theme included) wired to stale subscriptions on first paint after a toggle.
- **Why:** BUG-182 (filed 2026-05-28) — Evan reported the Settings panel shows mixed light/dark widgets after theme toggle, with screenshot evidence in conversation. Concurrent observation: `npm run build` 2026-05-28 emitted `Circular chunk: settings -> tts -> settings. Please adjust the manual chunk logic for these chunks.` Both findings touch the Settings × TTS overlap. Bundling the fix because (1) the circular chunk is a plausible root cause of the theme repaint bug, and (2) the chunk warning is real hygiene debt that should be cleared either way. Settings is a frequently-visited surface; visual inconsistency degrades trust.
- **Prerequisites:** None. Independent of all active sprints. Parallel-safe (Lane C UI + Lane B/E build config).
- **Baseline:** clean `main` at v1.75.1 or later.
- **Lane Ownership:** Lane C (UI surfaces: `src/components/settings/`, `src/components/ThemeProvider.tsx`, theme CSS pipeline) + Lane B/E (build config: `vite.config.js`).
- **Forbidden During Parallel Run:** no `main/` edits, no `useNarration.ts` / `audioScheduler.ts` / `kokoroStrategy.ts` runtime touches (stay out of the closed-loop cursor scope). No CI workflow edits.
- **Shared-Core Touches:** none.
- **Merge Order:** independent; safe to land any time.
- **WHERE (read order):**
  1. `vite.config.js` (80 lines) — manual-chunks logic at lines 18-57 defines `vendor`, `tts`, `settings` chunks. The `tts` branch captures `src/hooks/narration/`, `src/hooks/useNarration`, narrationPlanner, audioPlayer, etc. The `settings` branch captures `src/components/settings/`, `src/components/SettingsMenu`, `src/contexts/SettingsContext`.
  2. `src/components/ThemeProvider.tsx` — theme context provider.
  3. `src/components/settings/ThemeSettings.tsx` — theme toggle UI.
  4. `src/styles/themes.css` — theme CSS variables.
  5. Find the actual circular import: grep `src/components/settings/` recursively for imports from any file matched by the `tts` chunk pattern; grep `src/hooks/narration/` and `src/utils/audioPlayer*` etc. for imports from any file matched by the `settings` chunk pattern. The shared file (most likely `src/contexts/SettingsContext.tsx`, which both UI panels and runtime narration code would want for engine settings) is the cycle root.
  6. SRL list (RoadMap Standing Rules): PR-7 (CSS custom properties for theming), PR-12 (context for cross-cutting concerns).
- **Tasks:**
  1. `[aristotle/opus]` (read-only diagnosis, ~15 min) Trace the circular import chain. Output `docs/studies/investigations/THEME-SYNC-1-investigation.md` covering: (a) the exact file at the cycle boundary (likely `src/contexts/SettingsContext.tsx` or equivalent); (b) the import graph showing both directions of the cycle; (c) recommended fix — likely one of: extract the boundary file into a new `shared` chunk added BEFORE the `tts`/`settings` branches in `vite.config.js`; OR refactor to remove the cross-chunk import (e.g., split SettingsContext into a UI-facing module and a runtime-facing module).
  2. `[aristotle/opus]` In the same diagnosis, reproduce BUG-182 in `npm run dev` mode (where manual chunks are NOT applied) — this isolates whether the chunk warning is the actual root cause vs. an independent theme-subscription bug. If reproducible in dev mode, the chunk fix alone won't close BUG-182; an additional theme-audit step is needed.
  3. `[hercules/sonnet, renderer-scope]` Apply the Aristotle-recommended chunk fix in `vite.config.js`. If extracting to a `shared` chunk, add a new branch BEFORE the `tts` and `settings` branches that captures the boundary file(s).
  4. `[hercules/sonnet, renderer-scope]` (conditional on Aristotle Task 2) If chunk fix alone does NOT close BUG-182 — audit theme-aware components in `src/components/settings/` to confirm each subscribes to either the same CSS-variable channel on `<html data-theme>` OR the same React context from `ThemeProvider`. Fix any component that reads theme from a stale snapshot or that mounts before the ThemeProvider settles.
  5. `[hippocrates/haiku]` Verify: `npm run build` produces NO `Circular chunk` warning. `npm test` green. `npm run typecheck` green.
  6. `[live-qa, with Evan]` Manual smoke: open Settings panel, toggle Theme between Light and Dark several times. Visit each sub-page (Reading Layout, Speed Reading, Narration TTS, Theme, Library Layout, Connectors, Cloud Sync, Hotkey Map). Confirm ALL widgets repaint to the active theme — no mixed-color states.
  7. `[marcusaurelius/sonnet]` Docs pass: close BUG-182 in BUG_REPORT.md, update CLAUDE.md open-bugs line, ROADMAP Completed Work Summary, `sprint-queue.xlsx` Catalog (mark Completed, populate close-out reference). Auto-merge.
- **Execution Sequence:** Wave A: Aristotle diagnosis (Tasks 1 + 2). Wave B: Hercules chunk fix + conditional theme audit + Hippocrates + Live-QA + MarcusAurelius docs.
- **Done when (SUCCESS CRITERIA):**
  1. `npm run build` emits NO `Circular chunk: settings -> tts -> settings` warning.
  2. Settings panel repaints all sub-pages cleanly on theme toggle (light → dark and dark → light). Verified by Evan in live smoke.
  3. `npm test` green; `npm run build` green; `npm run typecheck` green.
  4. BUG-182 closed in BUG_REPORT.md with resolution evidence.
- **Effort:** S. Build-config fix + small UI audit.
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • Live-QA (Evan) • MarcusAurelius.
- **Source:** BUG-182 (filed 2026-05-28); 2026-05-28 build warning `Circular chunk: settings -> tts -> settings`; Evan screenshot in conversation.

##### Implementation detail

- **Edit sites:** `vite.config.js` lines 18-57 (manualChunks function). Possibly `src/contexts/SettingsContext.tsx` if it's the cycle boundary and Aristotle recommends a split. Possibly `src/components/settings/*.tsx` if theme-subscription audit identifies misaligned components.
- **Tests:** Existing `npm test` (3,005 tests) must remain green. Stretch goal: add a build-log assertion that fails if `Circular chunk` appears in build output (defer to a follow-up sprint if scope inflates).
- **Constants:** None.
- **Branch:** `sprint/theme-sync-1` from clean `main`.
- **Commit hygiene:** Explicit-stage `vite.config.js` + any settings-component edits. No destructive flags.
- **Cal cadence:** N/A (no TTS quality impact).

---

#### NARRATE-CLOSED-LOOP-CURSOR — Real-Audio-Position as Single Source of Truth *(position 2 — full spec; promoted from stub 2026-05-28 after READER-ISO-1E shipped)*

- **What:** Make the currently-playing audio source's real word position (via `audioScheduler.getPlayingSourceMaxWordIndex(now)` at `src/utils/audioScheduler.ts:521`) the SINGLE source of truth for (a) the visual cursor's advance and (b) every chunk re-entry / continuation seeding decision in Narrate mode. Retire the ahead-of-heard refs (`lastConfirmedAudioWordRef` at `useNarration.ts:187`, `nextGenWordIndexRef` at `useNarration.ts:188`) as seed sources where the closed loop makes them redundant. Retire the accumulating-error lag-escalation constants (120→220→350→450 ms ladder, ceiling clamp). Bound the prefetch window so the schedule cannot run hundreds of seconds ahead of audible playback (DEV log captured ~227s drift). Closes the unified Bug 1 (visual cursor lead) + Bug 2 (content omission at re-entry) defect that Step 3.6 proved are one root cause.
- **Why:** The persistent-anchor repair lane (Steps 3.1–3.6) closed in late May with this single residual defect: the system has no signal for what has actually been spoken. Every cursor advance and every re-entry seed derives from either the predicted boundary schedule (`audioScheduler.ts` tick at `audioCtx.currentTime − lag`, line ~949) or from the produced-end of generation (`nextGenWordIndexRef`), both of which are "ahead-of-heard" — the whole book is prefetched. The 450ms lag and Step 3.5 source-clamp cap the lead but don't remove the structural ahead-of-heardness, so (1) the cursor advances ahead of audio audibly in The Raven and prose, and (2) at section handoffs / stalls / resumes, playback continues from a position ahead of what Evan actually heard, dropping words (Step 3.6: Evan did not hear "This it is and nothing more."). SRL-070 explicitly forbids closing this gate on self-referential telemetry (boundary-drift, schedule-vs-wallclock); only Evan's ear closes it. SRL-072 forbids iterating on the ahead-of-heard refs themselves; the loop must be closed at the cursor and re-entry seed level. This sprint was deliberately deferred until READER-ISO-1E (`NarrateModeAdapter` + audio truth-sync ownership, shipped 2026-05-27) created a clean adapter boundary so the scheduler surgery doesn't simultaneously cross a refactoring boundary.
- **Prerequisites:** READER-ISO-1E complete (met, 2026-05-27, `CloseOut.READER-ISO-1E.2026-05-27.md`). The Narrate adapter owns truth-sync lifecycle; this sprint reuses that ownership to drive heard-position into the cursor and seeds. Recommend dispatching after at least one of TTS-QUAL-CI-1 / EXT-PAIR-1 / SINGLE-INSTANCE-LOCK-1 / THEME-SYNC-1 has merged so the CI quality gate (if TTS-QUAL-CI-1 lands first) enforces no regression on Kokoro quality.
- **Baseline:** clean `main` at v1.75.1 + READER-ISO-1A/B/C/D/E.
- **Lane Ownership:** Lane A (Runtime Core: narration/scheduler state machine; cursor/audio-truth synchronization).
- **Forbidden During Parallel Run:** This sprint touches the **shared-core freeze set** (`src/hooks/useNarration.ts`, `src/utils/audioScheduler.ts`, indirectly `src/components/ReaderContainer.tsx`). NO other code-changing sprint runs in parallel. Only Lane E governance work may run alongside.
- **Shared-Core Touches:** `src/hooks/useNarration.ts`, `src/utils/audioScheduler.ts`. Both explicit and substantial.
- **Merge Order:** This sprint is the SOLE shared-core sprint in its dispatch window. No integration window required because it stands alone.
- **WHERE (read order):**
  1. `src/utils/audioScheduler.ts` — `getPlayingSourceMaxWordIndex` at line 521 (already exists; THIS is the heard-position oracle the sprint hangs on); the lag-compensated tick path at line 949 (`const now = Math.max(0, audioCtx.currentTime - lagSec)`); the prefetch/generation surface around lines 791-807 (consumed boundaries); the source-clamp at line 982.
  2. `src/hooks/useNarration.ts` — `lastConfirmedAudioWordRef` declared at line 187, `nextGenWordIndexRef` at line 188; writes scattered across lines 461, 631, 1072, 1086, 1157, 1165, 1244, 1304, 1483-1484, 1542-1543, 1601-1602, 1635, 1671, 1697, 1931 (full list to be enumerated in Aristotle's memo); seed READS at line 1194 (`startIdx = nextGenWordIndexRef.current` inside `speakNextChunkKokoro` at line 1187) and line 1287 (`startIdx = lastConfirmedAudioWordRef.current`); `resyncToCursor` at line 1617 (currently writes both refs based on cursorWordIndex; needs to honor heard-position as floor).
  3. `src/hooks/narration/kokoroStrategy.ts` — Kokoro chunk pipeline (consumer of the seeds above; verify no implicit ahead-of-heard caching beyond useNarration's refs).
  4. `src/types/narration.ts` — type contracts for chunk/boundary/word state; will need an addition for the public oracle method.
  5. `src/constants.ts` — `TTS_CURSOR_TRUTH_SYNC_INTERVAL`, lag constants (120/220/350/450 if still present), `TTS_MAX_RATE`.
  6. `docs/governance/close-outs/.Archive/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.6.2026-05-24.md` for the schedule-vs-wallclock drift log and calibration data.
  7. `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` — SRL-060 (heard-audio gate), SRL-068, SRL-069 (prefetched boundaries must be source-owned), SRL-070 (no self-referential telemetry as gate evidence), SRL-072 (no iteration on ahead-of-heard refs), SRL-073 (transition/cleanup tests), SRL-074 (ref-heavy teardown stays in owning hook).
- **Tasks:**
  1. `[aristotle/opus]` (read-only diagnosis + design memo, ~30 min) Produce `docs/studies/investigations/NARRATE-CLOSED-LOOP-design.md` covering: (a) the exact seed-read points to retarget with file:line; (b) which lag constants become redundant after the loop closes vs. which remain as a soft-cap fallback (likely retain only 120ms baseline); (c) the prefetch-window bound semantics — e.g., "scheduler refuses to schedule a new chunk if its target word > getHeardPositionWordIndex() + PREFETCH_WINDOW_WORDS"; recommended value of PREFETCH_WINDOW_WORDS derived from Step 3.6 drift log (expect ~200-400 words at default WPM); (d) the cursor-update cadence (per-tick continues, but cursor word is set to `max(currentCursor, heardPosition)` — monotonic, never retracts, never exceeds heard); (e) the `resyncToCursor` reseed semantics (seed from `max(heardPosition, cursorTargetWordIndex)` — heard-as-floor, never reseed below what's already audible; honor forward user-jumps); (f) which writes of `lastConfirmedAudioWordRef` and `nextGenWordIndexRef` remain necessary as bookkeeping vs. which can be deleted entirely. Output gates Wave B.
  2. `[athena/opus, renderer-scope]` (heavy implementation per memo)
     - Add `audioScheduler.getHeardPositionWordIndex()` as the public reader-mode-facing oracle wrapping `getPlayingSourceMaxWordIndex(audioCtx.currentTime)` with appropriate null-handling for the not-yet-playing case.
     - Add types in `src/types/narration.ts` for the oracle's return value.
     - In `useNarration.ts`, replace seed reads at line 1194 (`speakNextChunkKokoro`) and line 1287 with `audioScheduler.getHeardPositionWordIndex() ?? lastConfirmedAudioWordRef.current` (heard preferred; existing ref as fallback during the very-first-chunk pre-audio window).
     - In `resyncToCursor` (line 1617), seed `nextGenWordIndexRef` from `Math.max(heardPosition ?? 0, cursorTargetWordIndex)` — never reseed below what's already been heard; forward user jumps still honored.
     - Add cursor-from-heard logic in the existing per-tick update path: cursor word advances to `getHeardPositionWordIndex()`, but never RETRACTS (monotonic forward). Invariant: `cursorWordIndex <= heardPosition <= producedEndOfGeneration`.
     - In `audioScheduler.ts` chunk-dispatch path (around lines 791-807), refuse to schedule a new chunk if its target word > `getHeardPositionWordIndex() + PREFETCH_WINDOW_WORDS`. Add to `src/constants.ts`.
     - Retire (delete or comment-rationalize) the lag-escalation constants 220→350→450 ms if Aristotle confirms they're redundant. Retain the 120 ms baseline lag as a soft buffer.
  3. `[hippocrates/haiku]` Run `npm test` (must stay green). Add regression tests:
     - `tests/narrateClosedLoopCursor.test.ts` — assert cursor never advances ahead of heard position when both are populated; assert `resyncToCursor` never seeds `nextGenWordIndexRef` below current heard; assert prefetch window bound clamps a too-eager chunk schedule.
     - `tests/audioSchedulerHeardOracle.test.ts` — assert `getHeardPositionWordIndex()` matches `getPlayingSourceMaxWordIndex(audioCtx.currentTime)` across all source-state transitions; assert null return when no source is playing.
  4. `[plato/sonnet]` Architecture review (parallel with Live-QA per SRL-012): verify SRL-070 (no self-referential telemetry as gate evidence), SRL-072 (no iteration on ahead-of-heard refs), SRL-073 (transition/cleanup tests for adapter state changes), SRL-074 (ref-heavy teardown stays in owning hook), and the closed-loop invariant `cursorWordIndex ≤ heardPosition ≤ producedEndOfGeneration` is enforced wherever the involved variables co-update.
  5. `[live-qa, Evan]` Live audio QA — THIS IS THE GATE. Per SRL-070, Evan's ear is the ONLY acceptable gate; scheduler-derived metrics (boundary-drift, schedule-vs-wallclock) are NOT sync evidence. Two fixtures:
     - **The Raven** (poem; explicit prior failure surface): play through several "Nevermore" handoffs; confirm NO content omission, cursor tracks heard word with no audible lead, hard-click starts exactly at the clicked word.
     - **Prose fixture** (Meditations or Why Nations Fail): play through one chapter including at least one section boundary; confirm same invariants.
     - Operator (Cowork) drives via computer-use MCP; Evan provides ground-truth ear + visual sync verdict.
  6. `[marcusaurelius/sonnet]` Docs pass: ROADMAP Completed Work Summary (one-line entry, archive full spec to dated archive file), CLAUDE.md current-state update (note closed-loop cursor landed), sprint-queue.xlsx Catalog (mark Completed, populate close-out reference, recalc Dashboard), append SRL-080+ to LESSONS_LEARNED.md capturing lessons from closing the loop, update `docs/governance/TECHNICAL_REFERENCE.md` if scheduler architecture changed materially. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle design memo. ~30 min budget; gates Wave B.
  - Wave B — Athena implementation + Hippocrates tests. ~30-40 tool uses; near the per-wave ceiling — Zeus must pre-split into Wave B1 (audioScheduler oracle + types + chunk-dispatch bound) and Wave B2 (useNarration seed retargeting + cursor-from-heard + resyncToCursor) if the memo expands scope.
  - Wave C — Plato + Live-QA + MarcusAurelius docs. Plato and Live-QA run in parallel per SRL-012 (both read-only); MarcusAurelius blocks on both passing.
- **Done when (SUCCESS CRITERIA):**
  1. Live-QA fixture pass: on The Raven AND on prose, NO content omitted at any handoff (section, stall, resume, hard-click); cursor tracks heard word with no accumulating lead; hard-click starts exactly at the clicked word. Evan's ear verdict: PASS.
  2. Implementation invariant verified by tests: `cursorWordIndex ≤ getHeardPositionWordIndex() ≤ nextGenWordIndexRef` holds across all transitions.
  3. Prefetch window bound observable in scheduler: scheduler refuses to schedule a chunk with target > heard + PREFETCH_WINDOW_WORDS.
  4. `npm test` green (3,005+ tests; new closed-loop tests added); `npm run build` green; `npm run typecheck` green.
  5. Aristotle's design memo persisted at `docs/studies/investigations/NARRATE-CLOSED-LOOP-design.md`.
  6. No code path in `useNarration.ts` writes `lastConfirmedAudioWordRef` or `nextGenWordIndexRef` from cursor-state-only sources (writes must come from audio-source-truth or from explicit user-intent jumps).
  7. SRL-070 honored: gate is Evan's ear, not any scheduler-derived metric.
  8. `npm run test:quality` (Kokoro v2 baseline) shows no quality regression. If TTS-QUAL-CI-1 has merged, this is enforced automatically; otherwise run manually before merge.
- **Effort:** L. Heaviest sprint in the buffer. ~1-2 sessions if Aristotle's memo is clean; longer if architecture surprises emerge during Athena's implementation pass.
- **Roster:** Zeus → Aristotle • Athena • Hippocrates • Plato • Live-QA (Evan) • MarcusAurelius.
- **Source:** Persistent-anchor repair Steps 3.5/3.6 (Bug 1 + Bug 2 — the residual S13 Narrate cursor/content sync defect after SELECTION-1, NARR-PAUSE-1, NARR-SPOKEN-1, NARR-CURSOR-2); SRL-060, SRL-068, SRL-069, SRL-070, SRL-072, SRL-073, SRL-074; `CloseOut.READER-ISO-1E.2026-05-27.md` (NarrateModeAdapter owns truth-sync lifecycle).

##### Implementation detail

- **Edit sites:**
  - `src/utils/audioScheduler.ts` — new `getHeardPositionWordIndex()` method wrapping `getPlayingSourceMaxWordIndex` (line 521); prefetch-window bound in chunk-dispatch (around lines 791-807); review tick lag at line 949 (likely retain 120ms baseline only).
  - `src/hooks/useNarration.ts` — seed read at line 1194 (`speakNextChunkKokoro`) and line 1287; `resyncToCursor` (line 1617-1697); cursor-update path (existing per-tick; Aristotle's memo lists exact lines).
  - `src/types/narration.ts` — type addition for the new public oracle.
  - `src/constants.ts` — add `PREFETCH_WINDOW_WORDS` (Aristotle's recommended value); delete or comment 220/350/450 lag escalation if Aristotle confirms redundant; retain 120 baseline.
- **Tests:** `tests/narrateClosedLoopCursor.test.ts` (new), `tests/audioSchedulerHeardOracle.test.ts` (new). Existing `tests/audioScheduler.test.ts`, `tests/useNarration.test.tsx`, narration suite must remain green.
- **Constants:** `PREFETCH_WINDOW_WORDS` (Aristotle's memo specifies; expect ~200-400 words). Retire 220/350/450 lag escalations. Retain 120ms baseline.
- **Branch:** `sprint/narrate-closed-loop-cursor` from clean `main`. Pre-split waves: `sprint/narrate-closed-loop-cursor-wave-a` (Aristotle memo, may merge to main early as docs-only), `sprint/narrate-closed-loop-cursor-wave-b1` (audioScheduler side), `sprint/narrate-closed-loop-cursor-wave-b2` (useNarration side).
- **Commit hygiene:** Explicit-stage. Aristotle's memo is its own commit. Implementation may be 1-2 commits depending on the wave split.
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2 baseline) before AND after to confirm no quality regression. If TTS-QUAL-CI-1 has merged by this sprint's dispatch, the CI gate enforces this automatically on PR.

---

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(position 3 — stub)*

Library card 3-line format, "New" dot auto-clear, Ctrl+K command palette entries, and Space bar starts the last-used reading mode after reader runtime controls are stable. Will be full-specced at next /roadmap-review when buffer needs replenishment after the position-1 sprint completes. Notes: 3-line format = title / author / progress%-and-time-left; "New" dot is the unread indicator on freshly-imported docs; command palette entries should include the existing import paths (Folder, URL, Drop), the mode switches (Focus/Flow/Narrate), and a recent-docs jump. Coordinate with Hotkey Map (existing Settings panel section) to avoid hotkey collisions.

---

#### HYG-XLSX-DASHBOARD-RESTORE — Restore sprint-queue.xlsx Dashboard formulas + openpyxl quarantine *(position 4 — stub)*

Per SRL-080 + Evan's 2026-05-28 disposition. Three tasks: (a) manually rebuild the Dashboard tab's formula-driven KPIs in Excel (B12 category counts, B20 sprints-remaining, B24 % complete by LOE, B29 full-specs-queued, B32 buffer-health flag) per the /roadmap-review skill's "Sprint queue spreadsheet structure" reference; (b) extend `scripts/recalc.py` with a guardrail — refuse to operate on cells whose worksheet name matches `Dashboard`, with `--allow-dashboard` as an explicit opt-out; (c) document the convention in `CLAUDE.md` (or a new `docs/governance/SPREADSHEET_CONVENTIONS.md`) — openpyxl edits the Catalog tab only; Excel computes Dashboard from Catalog. LOE: XS. Lane E (governance tooling). No code surface, no shared-core touches. Parallel-safe with every other queued sprint. Will be full-specced when the queue head reaches it (likely after one of the hotfix sprints ships).

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
last_review: 2026-05-29
finish_line: "TTS Quality Confidence + Reading Experience v2"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
buffer_target: 5
buffer_actual_full_specs: 2
buffer_actual_stubs: 2
-->
