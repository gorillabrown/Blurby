# Blurby — Development Roadmap

**Last updated**: 2026-05-31 — NARRATE-INTENT-CURSOR-1 complete (PARTIAL: A1 PASS regression held, A4 FAIL 0-of-3 — consume lifecycle landed but reactive, not preventive; PAUSE-RESUME-UNIFY-1 completes the A4 fix by seeding resume from heardFloor rather than the stale anchor). **Next dispatch: NARRATE-PAUSE-RESUME-UNIFY-1 (full scope — cold-start resume seed must prefer heardFloor/resumeTarget over stale anchor).**
**Current state**: v1.75.1 stable baseline plus READER-ISO-1A/1B/1C/1D/1E. All four mode adapters (Focus, Flow, Narrate) plus the typed contract (1A) and orchestrator shell (1B) are in place. S9 Flow lazy-follow remains intentionally deferred. Kokoro is the sole active engine — Kokoro-only is now an explicit design constraint (the unification deletes dormant-engine reseed code rather than preserving it). MOSS-Nano/Pocket TTS dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates. Graduated tiers: (1) CI quality gate active (TTS-QUAL-CI-1, ✓ shipped), (2) **narration dual-source unification complete (NARRATE-DUAL-SOURCE-DIAG-1 through NARRATE-SUBSCRIBER-CURSOR-1)**, (3) all 2026-05-28 discovery bugs closed (EXT-PAIR-1 ✓, THEME-SYNC-1 ✓, SINGLE-INSTANCE-LOCK-1 ✓), (4) UX polish lands (UX-POLISH-1 + downstream).
**Queue**: GREEN — depth 6 active (DIAG-1 + INTENT-CURSOR-1 done; 4 active queued: 3 full specs — NARRATE-PAUSE-RESUME-UNIFY-1, NARRATE-A5-RATE-RESEED-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1 — plus 1 gated full spec NARRATE-SUBSCRIBER-CURSOR-1; 2 stubs UX-POLISH-1, HYG-XLSX-DASHBOARD-RESTORE). **Conveyor belt order: NARRATE-PAUSE-RESUME-UNIFY-1 → NARRATE-A5-RATE-RESEED-1 → NARRATE-APPLYRATECHANGE-COLLAPSE-1 → NARRATE-SUBSCRIBER-CURSOR-1 → UX-POLISH-1 → HYG-XLSX-DASHBOARD-RESTORE**. The narration unification sprints all touch the shared-core freeze set and MUST run sequentially (no parallel dispatch in this window). The stub positions can resume parallel scheduling.
**Last sprint**: NARRATE-INTENT-CURSOR-1 (2026-05-31, PARTIAL) — resume-anchor consume lifecycle landed (A1 PASS, A4 FAIL 0-of-3 — reactive not preventive; PAUSE-RESUME-UNIFY-1 completes). Prior: NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30), THEME-SYNC-1 (2026-05-29).
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
| THEME-SYNC-1 | 2026-05-29 | Vite circular chunk fix — 5 shared TTS modules moved to TTS chunk, eliminated `settings -> tts -> settings` cycle; BUG-182 confirmed fixed by live smoke on v1.75.1 dev build | `CloseOut.THEME-SYNC-1.2026-05-29.md` |
| NARRATE-DUAL-SOURCE-DIAG-1 | 2026-05-30 | Instrumented gate replay validated A4 root cause: REFUTED in-hook dual-source race, CONFIRMED never-cleared reader-layer resumeAnchor; A5 = wrong rate-change seed source. Reshaped Stage-2 sequence. | NARRATE-DUAL-SOURCE-DIAG-1.md (verdict) |
| NARRATE-INTENT-CURSOR-1 | 2026-05-31 | PARTIAL: resume-anchor consume lifecycle (`shouldConsumeResumeAnchorOnAdvance`, CONSUME on first word-advance past anchor in both truth-sync + onWordAdvance paths, CLEAR-before-SET in onWordClick). A1 PASS regression held; A4 FAIL 0-of-3 — consume is reactive (fires after seed), not preventive. Necessary infrastructure for PAUSE-RESUME-UNIFY-1. 19 new tests. | `NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md` |

**Dissolved sprints:**
- `TEST-HARNESS-1` — Nano probes irrelevant after Kokoro-only pivot (2026-05-15)
- `TTS-CANARY-1` — Sidecar engines dormant, canary probes unnecessary (2026-05-15)
- `TTS-REGISTRY-DISPATCH-1` — Single active engine, registry dispatch unnecessary (2026-05-15)
- `NARRATE-CLOSED-LOOP-CURSOR` — Half-step approach: introduced `getHeardPositionWordIndex()` oracle at `audioScheduler.ts:521,1036` but consumed it in only ONE call site (Kokoro re-entry seed). 2026-05-29 live-QA gate showed A4 FAIL ("play→pause→play restarts from book beginning") despite the oracle landing. ULTRATHINK 2026-05-29 (`docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md`) identified dual-source race (`cursorWordIndex` ⟷ `lastConfirmedAudioWordRef`) as root cause; Evan's two-cursor framing (subscriber + intent with explicit authority lifecycle) is the right destination. Superseded by `NARRATE-DUAL-SOURCE-DIAG-1` → `NARRATE-INTENT-CURSOR-1` → `NARRATE-PAUSE-RESUME-UNIFY-1` → `NARRATE-APPLYRATECHANGE-COLLAPSE-1` → `NARRATE-SUBSCRIBER-CURSOR-1`. Branch preserved at `sprint/narrate-closed-loop-cursor` commit `0f1b2c8` for reference.

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
36. **SRL-086 + SRL-087 — Verify state before consequential action (umbrella).** Codebase facts must be grep-verified at the moment of consequence (SRL-086); environment state — current git branch, working directory, build version, file freshness — must be verified before edits or workflows that depend on it (SRL-087). SRL-079 (rebuild gate) and SRL-085 (smoke build-version gate) are concrete instances of the same principle. Umbrella: *accumulated context is not verified state; trust must be earned by an explicit verification step at the moment of consequence.* **Why:** Two occurrences in under one hour on 2026-05-29 of the trust-without-verify error: (a) the original ULTRATHINK + first roadmap-review fold-in propagated codex-parent's "~14 speakNextChunk call sites" without grep — actual count was 6 (SRL-086); (b) the same fold-in's "corrective" grep then ran against the dissolved branch instead of main because branch state wasn't verified — half the corrections were branch-specific and required a third commit (`cb6e894`) to reconcile against main's actual line numbers (SRL-087). Cost asymmetry: verify is cheap (seconds); recovery is expensive (~25 min of git handoff + amendment commits for the second occurrence). The rate of recurrence (two occurrences, two different verification axes, same day) is decisive evidence the principle is load-bearing, not theoretical. **How to apply:** Any Cowork workflow that produces dispatch-ready artifacts (`/roadmap-review`, `/write-spec`, sprint-spec amendments, adversarial-review fold-ins, Aristotle enumeration memos, Hercules instrumentation passes) MUST begin with explicit state verification — at minimum: `git status`, `git branch --show-current`, and confirm build version where the verdict depends on it. Spec citations for line-number-dependent claims MUST include branch + commit hash + grep date (format: *"lines X, Y, Z grep-verified against main @ HASH on DATE"*). Aristotle's enumeration memos remain authoritative at execution time — they re-grep from source then — but the pre-execution spec should be precise enough that the memo confirms rather than discovers. (Promoted 2026-05-29 jointly after two same-day occurrences of the verify-before-acting pattern across two different verification axes.)

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Active Conveyor Belt — Narration Dual-Source Unification

DIAG-1's instrumented live-QA gate (verdict YELLOW, 2026-05-30) reshaped this sequence. The gate REFUTED the in-hook dual-source race as A4's cause and CONFIRMED that A4 is a **reader-layer resume-anchor LIFECYCLE failure** — a `resumeAnchorRef` (owned by `useDocumentLifecycle.ts` / `ReaderContainer.tsx`, not the narration hook) that is set on the last hard-selection and never consumed/cleared, so every cold-start resume seeds from it. A5 is a separate in-hook seed-source defect (`applyRateChange` Kokoro bucket-change seeds from the pre-fetch head, not the heard position). The five active sprints supersede the dissolved `NARRATE-CLOSED-LOOP-CURSOR` and **MUST run sequentially** — they touch the shared-core freeze set (`src/hooks/useNarration.ts`, `src/utils/audioScheduler.ts`, and now also `src/components/ReaderContainer.tsx` / `src/hooks/useDocumentLifecycle.ts` for the anchor lifecycle). No parallel dispatch in this window.

Sequencing rationale (post-verdict reshape — A4-fix-first → cheap-win → cleanup → gated):
- **INTENT-CURSOR-1 (refocused, primary A4 fix)** formalizes the reader-layer `resumeAnchorRef` as the intent cursor with an explicit SET → ACTIVE → CONSUMED → CLEARED lifecycle — adding the CONSUME-on-first-advance and CLEAR-on-fresh-start steps the gate proved are missing. It is the principled fix for A4's root cause and preserves A1.
- **PAUSE-RESUME-UNIFY-1** hardens the resume seed: A4 fires through the cold-start `startCursorDriven` path (NOT the in-hook `resume:*` branches), so the cold-start seed must prefer heard/resume-target over a stale anchor. INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 jointly fix A4 as two small sequential sprints — lifecycle first, then resume-seed robustness. If INTENT-CURSOR-1 alone makes A4 pass 3-of-3, PAUSE-RESUME-UNIFY-1 shrinks to a robustness pass.
- **A5-RATE-RESEED-1 (new)** is a small, surgical, high-confidence fix for A5 — reseed the Kokoro bucket-change from `heardFloor`, not `nextGenWordIndexRef`. Independent of the A4 anchor work; lands fast.
- **APPLYRATECHANGE-COLLAPSE-1** collapses the reseed paths into one helper and deletes dormant-engine code per the Kokoro-only constraint — sequenced AFTER A5-RATE-RESEED-1 so it builds on the corrected heardFloor-primary seed.
- **SUBSCRIBER-CURSOR-1 (gated)** is the last and heaviest — retires `WORD_ADVANCE` reducer dispatch for word position, demotes cursor to closure ref subscription. Gated on an A2 retest: only dispatch if a perceptible cursor-lead remains after INTENT/PAUSE-RESUME land.

Deep architectural rationale: `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md` (the verdict — read this before dispatching INTENT-CURSOR-1) and `docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md` (the prior architectural analysis, partially superseded by the verdict).

All 2026-05-28 discovery bugs closed: EXT-PAIR-1 (BUG-183), SINGLE-INSTANCE-LOCK-1 (F1), THEME-SYNC-1 (circular chunk and theme smoke for BUG-182).

---

#### NARRATE-DUAL-SOURCE-DIAG-1 — COMPLETE (2026-05-30)

Verdict YELLOW: A1 PASS; A4 FAIL (0-of-3) = reader-layer never-cleared `resumeAnchor` (in-hook dual-source race REFUTED, reader-layer-anchor hypothesis CONFIRMED); A5 FAIL = `applyRateChange` Kokoro bucket-change seeds from `nextGenWordIndexRef` (pre-fetch head) instead of `heardFloor` (heard position). Full spec in git history (≤ `df9c978`); verdict in `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md`. (Full archival move to `docs/planning/.Archive/ROADMAP_legacy.md` is deferred to the next governance sweep.)

---

#### NARRATE-INTENT-CURSOR-1 — COMPLETE (PARTIAL, 2026-05-31) ✅ COMPLETED

Resume-anchor consume lifecycle landed: `shouldConsumeResumeAnchorOnAdvance` in `persistentReadingAnchor.ts`, CONSUME on first word-advance strictly past the anchor in both `applyNarrationActiveWord` (truth-sync/A4 path) and `onWordAdvance` (focus/flow), CLEAR-on-fresh-start (option c) before click SET. A1 PASS regression held. A4 FAIL 0-of-3: consume is reactive (fires at `approxWordIdx:67` after resume seed already read `startIdx:66`), and persistent hard-selection re-populates anchor on resume. Necessary but not sufficient — PAUSE-RESUME-UNIFY-1 completes A4 by seeding resume from heardFloor. Full spec in git history (≤ `f3dcfb4`); gate report in `docs/studies/investigations/NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md`. (Full archival deferred to next governance sweep.)

*(Original full spec follows for reference until archival)*

#### ~NARRATE-INTENT-CURSOR-1 — Formalize the reader-layer resume-anchor as the intent cursor with a full lifecycle (the A4 fix)~ *(position 1 — full spec, COMPLETED PARTIAL)*

- **What:** Formalize the reader-layer `resumeAnchorRef` (declared `useDocumentLifecycle.ts:131`) as the **intent cursor** with an explicit `SET → ACTIVE → CONSUMED → CLEARED` lifecycle. Today the anchor is SET on click/hard-selection (5 sites: `ReaderContainer.tsx:1343`, `usePersistentReadingAnchor.ts:69`, `useDocumentLifecycle.ts:165`, `useReaderMode.ts:246`, `useReaderModeOrchestrator.ts:128`), ACTIVE-skips relocate/onLoad updates (`ReaderContainer.tsx:1259` relocate, `1382` onLoad), but its ONLY clear-to-null is `ReaderContainer.tsx:1353` (explicit-selection-with-no-index). Add the two missing lifecycle steps: **CONSUME on first word-advance past the anchor** (clear it once narration has advanced beyond it) and **CLEAR on fresh start / new selection**. This stops the anchor from persisting stale and leaking into the next cold-start resume — which is exactly the A4 failure mode the DIAG-1 gate captured. **CONSUME must also un-gate progress persistence:** while the anchor is active, `onRelocate` suppresses BOTH the cursor update AND the progress-save (`shouldPersistRelocateProgress` is gated on `!hasResumeAnchor`, `ReaderContainer.tsx` ~1276–1282), freezing the persisted position at the click; so consuming the anchor must restore progress-save, otherwise continued progress is still lost across pause/resume and `useReaderMode:mode-change` re-seeds from the stale frozen position (the "gravity well" Evan observed 2026-05-30 — see `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1-A4-mechanism-addendum.md`).
- **Why:** DIAG-1's verdict (YELLOW, 2026-05-30) is decisive — A4's root cause is the never-consumed/never-cleared reader-layer `resumeAnchor`, pinned at the last hard-selection and fed into cold `startCursorDriven` (NOT any in-hook `resume:*` branch; `resumeAnchor:consumed` never fired across all three A4 trials). **A1 passes today only because the anchor is *fresh* at click time; A4 fails because the *same* anchor is *stale* at resume time.** The intent-cursor lifecycle is the principled fix that preserves A1 and fixes A4: consume the anchor once narration advances past it, and clear it on a fresh start, so a stale anchor can never seed a later resume. (Refocused 2026-05-30 from the original in-hook `nextKokoroExactStartRef` framing — DIAG-1 proved the cursor authority that drives A4 lives in the reader layer, not in-hook. The in-hook dual-source race the original spec leaned on was REFUTED.)
- **Prerequisites:** `NARRATE-DUAL-SOURCE-DIAG-1` merged.
- **Baseline:** clean `main` at v1.75.1 + NARRATE-DUAL-SOURCE-DIAG-1 merged.
- **Lane Ownership:** Lane A (Runtime Core) + the reader layer (document-lifecycle / ReaderContainer anchor ownership).
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (word-advance CONSUME hook), `src/components/ReaderContainer.tsx` + `src/hooks/useDocumentLifecycle.ts` (anchor CLEAR/CONSUME lifecycle).
- **Merge Order:** FIRST in the reshaped unification sequence.
- **WHERE (read order):**
  1. `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md` — the verdict (A4 = reader-layer never-cleared anchor; `resumeAnchor:consumed` absence is the smoking gun).
  2. `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1-prep.md` §4 — the full `resumeAnchorRef` lifecycle map (declaration, 5 SET sites, ACTIVE-skip sites, the lone clear at `ReaderContainer.tsx:1353`).
  3. `src/hooks/useNarration.ts` — the cold-start `startCursorDriven` seed path that consumes the reader-layer anchor at resume.
  4. `src/hooks/useDocumentLifecycle.ts:131` (declaration) + `:165` (SET); `usePersistentReadingAnchor.ts:69`, `useReaderMode.ts:246`, `useReaderModeOrchestrator.ts:128` (SET sites); `ReaderContainer.tsx:1343` (SET), `:1259`/`:1382` (ACTIVE-skip), `:1353` (the only clear-to-null).
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo) Produce `docs/studies/investigations/NARRATE-INTENT-CURSOR-design.md` mapping the full `resumeAnchorRef` lifecycle (declaration / all SET sites / ACTIVE-skip / the lone clear) and designing the exact CONSUME (first word-advance past the anchor) and CLEAR (fresh-start / new-selection) points cross-layer (reader ↔ narration hook). Specify where the consume signal originates (audio word-advance) and where the clear executes (reader layer), with edge cases: anchor set while no narration active; anchor set then immediately superseded by a new selection; anchor consumed mid stop-and-reseed window.
  2. `[athena/opus, renderer-scope]` (cross-system implementation; touches hook + reader layer) Implement consume-on-advance + clear-on-fresh-start across `useNarration.ts` and the reader layer (`ReaderContainer.tsx` / `useDocumentLifecycle.ts`) per the memo: fire `resumeAnchor:consumed` and null the anchor on the first word-advance past it; clear the anchor on fresh start / new selection. Preserve the existing SET and ACTIVE-skip behavior that A1 relies on.
  3. `[hippocrates/haiku]` Run `npm test`. Add `tests/narrateIntentCursor.test.ts`: assert CONSUME fires on the first word-advance past the anchor; assert the anchor is null after consume; assert A1 regression (anchor fresh at click time still drives exact start); assert pause→resume no longer re-seeds from a stale anchor.
  4. `[plato/sonnet]` Architecture review (parallel with Live-QA per SRL-012): verify single-writer discipline on the anchor (no new uncontrolled writers introduced); verify SRL-073 transition tests (consume/clear on ownership change, no-op on same-owner); verify the consume logic doesn't fire spuriously on retry/late-tick.
  5. `[live-qa, Evan + Cowork]` Live audio QA — fixture: The Raven. **A1 must still PASS** (hard-click exact start per Evan's ear) AND **A4 re-check** (pause → wait 3s → resume, three times): does clearing the anchor alone fix A4? Record whether A4 is now 3-of-3 PASS or only partially improved. Operator drives; Evan verdicts.
  6. `[marcusaurelius/sonnet]` Docs: ROADMAP Completed Work Summary; CLAUDE.md current-state update (note the intent-cursor/resume-anchor lifecycle landed); sprint-queue.xlsx Catalog (mark Completed); append SRL entry if a generalizable insight emerges. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle design memo. ~10-15 tool uses; gates Wave B.
  - Wave B — Athena implementation + Hippocrates tests. ~25-30 tool uses.
  - Wave C — Plato + Live-QA + MarcusAurelius. Plato/Live-QA parallel per SRL-012. ~25-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. Live-QA **A1 still PASS** on The Raven (hard-click lands on clicked word per Evan's ear).
  2. `resumeAnchor` is CONSUMED on the first word-advance past it (grep/test verifiable; the anchor is no longer pinned after narration advances).
  3. **Progress persistence restored on consume:** after a consumed click, the persisted reading position advances with playback (no longer frozen at the click — `onRelocate` stops logging "resume anchor active … skipping"), and a subsequent pause→resume / `useReaderMode:mode-change` continues from the heard position, NOT the clicked word, per Evan's ear. (Addresses the gravity-well cycle; see A4-mechanism-addendum.)
  4. **A4 measured** in live-QA: if full 3-of-3 PASS, PAUSE-RESUME-UNIFY-1 folds to a robustness pass; if partial, PAUSE-RESUME-UNIFY-1 completes it.
  5. `npm test` green; `npm run build` green; `npm run typecheck` green.
  6. SRL-070 honored: gate is Evan's ear.
  7. `npm run test:quality` (Kokoro v2) shows no regression (enforced by CI gate per TTS-QUAL-CI-1).
- **Effort:** **S** (~1 session).
- **Roster:** Zeus → Aristotle • Athena • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** DIAG-1 verdict (reader-layer never-cleared `resumeAnchor` CONFIRMED as A4 root cause); 2026-05-29 ULTRATHINK two-cursor model; SRL-070; SRL-073 (transition tests).

##### Implementation detail
- **Edit sites:** `src/hooks/useNarration.ts` — emit the consume signal on first word-advance past the anchor (onWordAdvance gate). `src/components/ReaderContainer.tsx` — add the CLEAR-on-fresh-start step and execute the CONSUME clear (alongside the existing `:1353` clear and the `:1259`/`:1382` ACTIVE-skip). `src/hooks/useDocumentLifecycle.ts` — anchor declaration (`:131`) and SET (`:165`) participate in the lifecycle; expose a consume/clear path if the clear executes here. Re-grep all anchor sites at execution time per SRL-086/SRL-087.
- **Tests:** `tests/narrateIntentCursor.test.ts` (new). Existing `tests/useNarration.test.tsx`, `tests/narration/*.test.ts`, and reader-lifecycle suites must stay green.
- **Constants:** None added; `TTS_TRUSTED_CURSOR_LAG_MS` and `NARRATION_CURSOR_LAG_MS` unchanged.
- **Branch:** `sprint/narrate-intent-cursor-1` from clean `main` + DIAG-1 merged.
- **Commit hygiene:** Explicit-stage. Aristotle's memo committed separately. Wave B and Wave C may share one commit.
- **Cal cadence:** Quick-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after — CI gate auto-enforces.

---

#### NARRATE-PAUSE-RESUME-UNIFY-1 — Harden the resume seed: prefer heard/resume-target over a stale anchor on the cold-start path *(position 2 — full spec)*

- **What:** Introduce `resumeTargetRef: React.MutableRefObject<number | null>` as the single resume-truth ref. On `pause()`, capture `getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current` into `resumeTargetRef.current` BEFORE `kokoroStrategy.pause()` clears scheduler sources. **DIAG-1 confirmed A4 fires through the cold-start `startCursorDriven` path (NOT the in-hook `resume:*` branches), seeded by the reader-layer anchor** — so beyond capturing the resume target at pause, the **cold-start seed itself must prefer heard/resume-target over a stale anchor**. The cold-restart/resume seed evaluates the priority chain `intent ?? resumeTarget ?? subscriber` (intent = the reader-layer anchor lifecycle from INTENT-CURSOR-1; resumeTarget = the heard position captured at pause; subscriber = the live audio cursor). Clear `resumeTargetRef` after consumption by the resume/cold-start path. This completes the A4 fix: INTENT-CURSOR-1 stops the anchor from going stale; this sprint makes the cold-start seed robust even if a stale anchor somehow survives, by preferring the heard position. The `heardFloor`-null edge case (cold engine at resume) falls back to `lastConfirmedAudioWordRef`.
- **Why:** A4 (play→pause→play resets to book beginning) was the gate-blocking failure that ended NARRATE-CLOSED-LOOP-CURSOR. Evan's verbatim verdict: *"play - pause - play resets anchor."* Per the ULTRATHINK lifecycle enumeration Stage 4/5, root cause is: `pause()` doesn't capture an explicit resume target; `resume()` reads from `cursorWordIndex` (stale, possibly mid-`WORD_ADVANCE` batch) or `heardFloor` (returns null after pause cleared scheduler closure state) or the seed-chain falls through to `nextGenWordIndexRef ?? 0`. Capturing heardFloor at pause-time (before clearance) and consuming it at resume-time fixes this directly. The fix is small but the architectural payoff is large: it proves the two-cursor priority chain works on the actual failing case.
- **Prerequisites:** `NARRATE-INTENT-CURSOR-1` complete (provides the reader-layer anchor lifecycle / intent slot of the priority chain). If INTENT-CURSOR-1 alone made A4 pass 3-of-3, this sprint shrinks to a robustness pass that hardens the cold-start seed priority chain.
- **Baseline:** clean `main` + DIAG-1 + INTENT-CURSOR-1 merged.
- **Lane Ownership:** Lane A.
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (pause/resume entry points + cold-start `startCursorDriven` seed); plus `src/components/ReaderContainer.tsx` / `src/hooks/useDocumentLifecycle.ts` IF the cold-start seed reads the anchor cross-layer (confirm in Aristotle's memo).
- **Merge Order:** SECOND in the unification sequence.
- **WHERE (read order):**
  1. ULTRATHINK Stage 4 + Stage 5 lifecycle entries.
  2. DIAG-1 logs for A4 — specifically the path identifier(s) that fire on the pause-to-restart-at-zero transition.
  3. `src/hooks/useNarration.ts` — `pause()` (~line 1877), `resume()` (~line 1905), surrounding state-machine entries.
  4. `src/hooks/narration/kokoroStrategy.ts` — `kokoroStrategy.pause()` to confirm where scheduler sources get cleared.
  5. `src/utils/audioScheduler.ts:1036` — `getHeardFloorWordIndex` for the capture-before-clear invariant.
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo, ~20 min) Produce `docs/studies/investigations/NARRATE-PAUSE-RESUME-UNIFY-design.md` covering: (a) exact ordering of operations in `pause()` — confirm `getHeardFloorWordIndex()` returns a valid value BEFORE `kokoroStrategy.pause()` is called; (b) edge cases — pause while no narration active (resumeTargetRef stays null), pause during stop-and-reseed window from rate change, pause after intent cursor set but before consumed; (c) the `resume()` consume rule: clear `resumeTargetRef` after `getNextChunkSeed()` reads it.
  2. `[hercules/sonnet, renderer-scope]` Implement per memo: add `resumeTargetRef`; modify `pause()` to capture heardFloor before strategy pause; modify `resume()` to call `restartGeneration('resume')` (helper introduced in this sprint as a single-line wrapper around `getNextChunkSeed()` + `speakNextChunkKokoro()`); clear resumeTargetRef post-consume.
  3. `[hippocrates/haiku]` `npm test`. Add `tests/narratePauseResumeUnify.test.ts`: assert pause captures heardFloor; assert resume seed reads from priority chain in correct order; assert resumeTargetRef cleared after consume; assert no-narration-active pause is a no-op; assert intent supersedes resumeTarget if both set.
  4. `[plato/sonnet]` Architecture review parallel with Live-QA per SRL-012: verify capture-before-clear ordering; verify resumeTargetRef has single-writer (pause() only); verify consume-on-resume clears the ref (no leak to next session).
  5. `[live-qa, Evan + Cowork]` THE A4 GATE — fixture: The Raven OR Why Nations Fail. Sequence: (a) play; (b) pause mid-stanza on a known word (e.g., "darkness" or "Lenore"); (c) wait 3 s; (d) press play; (e) verdict: did audio resume from (or within 1-2 words of) the pause word, OR did it restart from book beginning? Repeat 3 times for stress. PASS criterion: 3-of-3 resumptions within ±2 words of pause position, per Evan's ear. SRL-070: Evan's ear is the gate.
  6. `[marcusaurelius/sonnet]` Docs pass. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle memo. ~10 tool uses.
  - Wave B — Hercules implementation + Hippocrates tests. ~20-25 tool uses.
  - Wave C — Plato + Live-QA + MarcusAurelius. Plato/Live-QA parallel. ~25-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A4 PASS 3-of-3** on The Raven in live-QA: 3-of-3 pause/resume cycles preserve position per Evan's ear (no restart-at-book-beginning, no jump to last hard selection).
  2. `resumeTargetRef` declared and used as documented; single-writer (pause); single-consumer (resume).
  3. `pause()` captures heardFloor BEFORE strategy pause (verifiable from code order; verifiable from a unit test that asserts the captured value matches the pre-pause heardFloor).
  4. `restartGeneration('resume')` helper exists (will be reused/extended in APPLYRATECHANGE-COLLAPSE-1).
  5. `npm test` green; `npm run build` green; `npm run typecheck` green.
  6. SRL-070 honored.
  7. `npm run test:quality` (Kokoro v2) shows no regression.
- **Effort:** **S** (~1 session).
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** DIAG-1 verdict (A4 fires through the cold-start `startCursorDriven` path, NOT in-hook `resume:*` branches; `heardFloor`-null cold-engine edge case at resume); 2026-05-29 ULTRATHINK Stage 4/5; live-QA 2026-05-29 verdict 4 (A4 FAIL verbatim: "play - pause - play resets anchor").

##### Implementation detail
- **Edit sites:** `src/hooks/useNarration.ts` — declare `resumeTargetRef`; modify `pause()` (line **1868** on main; was cited as 1877 earlier — that was the dissolved branch's line) to capture heardFloor before strategy.pause(); modify `resume()` (line **1896** on main; was 1905 on dissolved) to use `restartGeneration('resume')`; add `restartGeneration(reason)` helper (used here, expanded in APPLYRATECHANGE-COLLAPSE-1). Note: main's resume() already has THREE branches (cursor-mismatch at 1901, handoff-pending at 1937, bare at 1962); the heardFloor capture in the handoff-pending branch was DROPPED by the dissolved-branch supersede, so this sprint restores that capture as part of the `restartGeneration` path AND adds the `resumeTargetRef` mechanism for the bare-resume case. Aristotle's memo must specify whether bare-resume gets routed through `restartGeneration` (unifying the three branches) or whether bare-resume stays as `kokoroStrategy.resume()` direct call with the `resumeTargetRef` set independently — that's a design call hanging on DIAG-1's verdict about which branch A4 fires through.
- **Tests:** `tests/narratePauseResumeUnify.test.ts` (new). Existing narration suite must stay green.
- **Constants:** None added.
- **Branch:** `sprint/narrate-pause-resume-unify-1` from `main` + DIAG-1 + INTENT-CURSOR-1.
- **Commit hygiene:** Explicit-stage. Single commit feasible after memo.
- **Cal cadence:** Quick-cal post-merge. CI gate enforces TTS-QUAL-CI-1 quality.

---

#### NARRATE-A5-RATE-RESEED-1 — Reseed rate-change from the heard position, not the pre-fetch head (the A5 fix) *(position 3 — full spec)*

- **What:** In `applyRateChange()`'s Kokoro bucket-change branch (~`useNarration.ts:1750` on main — re-grep at execution time per SRL-086/SRL-087), change the reseed source from `nextGenWordIndexRef` (the generation pre-fetch head) to the heard position: `getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current` (fall back to `cursorWordIndex` only if both are null). The DIAG-1 oracle `getHeardFloorWordIndex` (added in `efbf925`, flag-independent pure read) is the canonical heard-position source. Surgical single-branch change; no collapse, no dormant-engine deletion (that is APPLYRATECHANGE-COLLAPSE-1's job).
- **Why:** DIAG-1's A5 FAIL captured `speakNextChunkKokoro:seed startIdx 1111` (from `nextGenWordIndexRef` = end-of-doc on the 1111-word fixture) while `heardFloor` = 565 — the rate-change reseeded from the pre-fetch head, not where audio actually was, producing silence on a short doc and a forward-skip on a long doc. This is the one part of the dual-source framing that survived the verdict (vindicated for rate-change seeding only). Standalone (not folded into APPLYRATECHANGE-COLLAPSE-1) because it is small, surgical, high-confidence, user-facing-severe, and **independent of the A4 anchor work** — it lands fast and de-risks the cheap win before the larger collapse refactor builds on top of it.
- **Prerequisites:** `NARRATE-DUAL-SOURCE-DIAG-1` merged (provides `getHeardFloorWordIndex`).
- **Baseline:** `main` + DIAG-1 (+ INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 if sequenced after them; it can also dispatch in parallel-free isolation since its change is independent of the A4 anchor work).
- **Lane Ownership:** Lane A.
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (the `applyRateChange` Kokoro bucket-change branch only).
- **Merge Order:** THIRD in the unification sequence.
- **WHERE (read order):**
  1. `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md` §A5 + the captured logs (the `startIdx 1111` vs `heardFloor 565` evidence).
  2. `src/hooks/useNarration.ts` — `applyRateChange` (~1713-1862 on main), specifically the Kokoro bucket-change branch (~1750).
  3. `src/utils/audioScheduler.ts` — `getHeardFloorWordIndex` (the DIAG-1 oracle).
  4. `src/hooks/narration/kokoroStrategy.ts` — passthrough confirmation.
- **Tasks:**
  1. `[aristotle/opus]` (tiny read-only memo) Confirm the exact seed line in the Kokoro bucket-change branch and the `heardFloor`-null cold edge case (use `lastConfirmedAudioWordRef` when `heardFloor` is null). Re-grep line numbers per SRL-086/SRL-087.
  2. `[hercules/sonnet, renderer-scope]` Implement the seed-source change: bucket-change reseed reads `getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current` (fall back to `cursorWordIndex` only if both null), not `nextGenWordIndexRef`.
  3. `[hippocrates/haiku]` `npm test`. Add `tests/narrateA5RateReseed.test.ts` asserting the bucket change seeds from `heardFloor`/`lastConfirmedAudio`, not `nextGenWordIndexRef`. **The regression test MUST use a doc LONGER than the chunk pre-fetch window so it exposes the forward-skip, not just a stall** (per Aristotle's nuance — on a short doc the defect manifests as silence, on a long doc as a forward-skip; the test must catch the skip).
  4. `[live-qa, Evan + Cowork]` THE A5 GATE on a LONG doc (Why Nations Fail): play, change WPM 175→250, verdict — position preserved per ear. PASS criterion: 3-of-3 rate changes preserve position. SRL-070.
  5. `[marcusaurelius/sonnet]` Docs pass. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle tiny memo. ~5-10 tool uses; gates Wave B.
  - Wave B — Hercules implementation + Hippocrates tests. ~15-20 tool uses.
  - Wave C — Live-QA + MarcusAurelius. ~15-20 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A5 PASS 3-of-3** on a long doc per Evan's ear (no silence, no forward-skip).
  2. The bucket-change reseed reads `heardFloor`/`lastConfirmedAudio` (grep/test verifiable; no longer `nextGenWordIndexRef`).
  3. `npm test` green; `npm run build` green; `npm run typecheck` green.
  4. `npm run test:quality` (Kokoro v2) shows no regression.
  5. SRL-070 honored.
- **Effort:** **S**.
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** DIAG-1 verdict §A5 (`applyRateChange:kokoro-bucket` seeds from `nextGenWordIndexRef`=1111 instead of `heardFloor`=565).

##### Implementation detail
- **Edit site:** `src/hooks/useNarration.ts` — the Kokoro bucket-change reseed in `applyRateChange()` (~line 1750 on main; re-grep at execution time per SRL-086/SRL-087).
- **Tests:** `tests/narrateA5RateReseed.test.ts` (new) — regression test MUST use a doc longer than the pre-fetch window to expose the forward-skip. Existing narration suite must stay green.
- **Constants:** None added.
- **Branch:** `sprint/narrate-a5-rate-reseed-1` from `main` + DIAG-1 (+ INTENT/PAUSE-RESUME if sequenced after).
- **Commit hygiene:** Explicit-stage. Aristotle memo may share the implementation commit given its size.
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after — CI gate enforces.

---

#### NARRATE-APPLYRATECHANGE-COLLAPSE-1 — Collapse 14 reseed paths into one helper + delete dormant-engine code *(position 4 — full spec)*

- **Sequencing note (2026-05-30 reshape):** Now sequenced FOURTH, AFTER NARRATE-A5-RATE-RESEED-1. The collapse builds on the corrected heardFloor-primary seed that A5-RATE-RESEED-1 establishes; `restartGeneration` must seed from the priority chain (heardFloor/subscriber), NOT from `nextGenWordIndexRef`. Folding A5 into this sprint was explicitly rejected in favor of landing the cheap A5 fix first and refactoring on top of corrected behavior.
- **What:** Collapse the **6 per-engine/debounce `speakNextChunk` reseed branches** in `applyRateChange()` (`useNarration.ts:1713-1862` on main) into a single `restartGeneration(reason: 'rate-change' | 'voice-change' | 'click' | 'resume')` helper. Helper body: `kokoroStrategy.stop(); const seed = getNextChunkSeed(); speakNextChunkKokoro({ startIdx: seed, reason });`. Per the explicit Kokoro-only design constraint (CLAUDE.md current-state notes), delete the non-Kokoro engine reseed paths entirely — Web speech, Qwen, Pocket, Nano are dormant/disabled/retired and their reseed code in `applyRateChange` is dead. Also folds `applyVoiceChange` (Stage 10) into the same helper with a `'voice-change'` reason. This sprint addresses A5 (rate-change skip) at its root and pays down the maintenance burden codex-parent flagged. **Count + line correction (re-verified against main 2026-05-29):** the prior "14 paths" figure was an over-count propagated from codex-parent's dispatch summary; grep-verified count is **6 direct calls at lines 1750 (Kokoro bucket change), 1793 (Qwen), 1812 (Pocket), 1830 (Nano), 1844 (Web no-debounce), 1860 (Web debounced)** — one per engine branch with the Web engine having both a no-debounce and a debounced variant. (Earlier draft of this spec cited dissolved-branch line numbers 1759/1802/1821/1839/1853/1869 — those are wrong for main; the function body shifted up by ~9 lines because the dissolved branch grew above. Aristotle's Task 1 memo MUST re-grep at execution time per SRL-086/SRL-087 — line numbers may shift further if intermediate sprints land.) A 7th Kokoro branch (same-bucket-segmented at lines ~1754-1776 on main) does NOT call speakNextChunk; it calls `kokoroStrategy.refreshBufferedTempo()` and stays out of scope for this collapse.
- **Why:** The 14-path duplication is the largest single accidental-complexity surface in the narration code. Each engine + each debounce variant copy-pasted the stop-and-reseed pattern; over time they drifted (some seed from `cursorWordIndex`, some from `heardFloor`, some from `nextGenWordIndexRef`). A5 (rate-change skip per live-QA gate) almost certainly originates from one of the drifted variants. The Kokoro-only design constraint makes this cleanup safe: dormant engines won't be revived without an explicit reseed-path re-architecture, so deleting their applyRateChange branches doesn't lock anything out. The collapse also forces every rate-change to use the priority chain established in INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1, closing the last large coupling between cursor-state and audio-scheduling decisions.
- **Prerequisites:** `NARRATE-INTENT-CURSOR-1` complete (`getNextChunkSeed()` helper). `NARRATE-PAUSE-RESUME-UNIFY-1` complete (`restartGeneration('resume')` helper to extend). DIAG-1 verdict confirming A5 maps to multi-path reseed.
- **Baseline:** clean `main` + DIAG-1 + INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 merged.
- **Lane Ownership:** Lane A.
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (heavy: `applyRateChange` + `applyVoiceChange` + the reseed branches).
- **Merge Order:** FOURTH in the unification sequence (after A5-RATE-RESEED-1).
- **WHERE (read order):**
  1. ULTRATHINK Stage 8/9/10 lifecycle entries.
  2. DIAG-1 logs for A5 — which of the 14 branches fires on the rate-change failure path.
  3. `src/hooks/useNarration.ts:1722-1871` — `applyRateChange` in full; map each branch to its engine + debounce variant.
  4. `src/hooks/useNarration.ts` — `applyVoiceChange` (line TBD by Aristotle); confirm it has similar multi-path structure.
  5. `src/hooks/narration/kokoroStrategy.ts` — `stop()` behavior, including whether it clears scheduler sources synchronously (affects whether heardFloor returns null mid-restart).
  6. `src/hooks/narration/{webStrategy,qwenStrategy,pocketStrategy,nanoStrategy}.ts` (if present) — confirm they're truly dormant (no active usage) before deleting their reseed branches.
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo, ~45 min) Produce `docs/studies/investigations/NARRATE-APPLYRATECHANGE-COLLAPSE-design.md` covering: (a) full enumeration of the **6 reseed branches** with their seed-source per branch (lines **1750, 1793, 1812, 1830, 1844, 1860** per the 2026-05-29 main re-verification — re-grep from source at execution time per SRL-086/SRL-087 because intermediate sprints may shift these); also re-confirm the 7th Kokoro same-bucket-segmented branch at lines ~1754-1776 truly does not need restart (calls `refreshBufferedTempo` instead); (b) confirmation each non-Kokoro strategy is dormant (no active dispatch); (c) `restartGeneration(reason)` final signature and body; (d) `applyVoiceChange` mapping to same helper; (e) the stop-and-reseed race-window mitigation (drain late onWordAdvance into transient holding ref during stop; commit only when new chunk's first advance fires — per ULTRATHINK Stage 7 fix); (f) which existing tests for `applyRateChange` need updating to assert the new single-path behavior.
  2. `[athena/opus, renderer-scope]` (cross-system implementation; touches reducer + strategy boundaries) Implement collapse: extend `restartGeneration(reason)` to handle `'rate-change'` and `'voice-change'` reasons; rewrite `applyRateChange` body to: (1) update WPM state, (2) if speaking, call `restartGeneration('rate-change')`; (3) if paused, just stash new rate (Stage 9 behavior); rewrite `applyVoiceChange` similarly. Delete non-Kokoro branches (Web, Qwen, Pocket, Nano reseed paths). Add stop-and-reseed race-window mitigation per Aristotle's design (transient holding ref).
  3. `[hippocrates/haiku]` `npm test`. Existing applyRateChange tests need updating to reflect single-path behavior. Add `tests/narrateApplyRateChangeCollapse.test.ts`: assert one call site invokes `restartGeneration('rate-change')`; assert paused-state rate change is a no-op for restartGeneration; assert race-window mitigation drops late onWordAdvance from old chunk.
  4. `[plato/sonnet]` Architecture review (parallel with Live-QA): verify `restartGeneration` is the SOLE entry point for stop-and-reseed; grep for stray `kokoroStrategy.stop() ... speakNextChunkKokoro` patterns and confirm zero remain outside the helper; verify deletion of non-Kokoro branches doesn't break any other code path (referenced strategies' types still exist as type-level placeholders).
  5. `[live-qa, Evan + Cowork]` THE A5 GATE — fixture: Why Nations Fail (or Meditations if F2 is also fixed). Sequence: (a) play; (b) change WPM 175 → 250 via arrow keys; (c) verdict: did narration continue from where it was (1-2 word re-read acceptable) OR did it skip ahead? Also test voice change with same protocol. PASS criterion: 3-of-3 rate changes preserve position; voice change preserves position; per Evan's ear. SRL-070.
  6. `[marcusaurelius/sonnet]` Docs pass. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle memo. ~15-20 tool uses (heavier enumeration); gates Wave B.
  - Wave B1 — Athena implementation. ~25-30 tool uses.
  - Wave B2 — Hippocrates tests + test updates. ~20-25 tool uses.
  - Wave C — Plato + Live-QA + MarcusAurelius. Plato/Live-QA parallel. ~25-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A5 PASS** in live-QA: 3-of-3 rate changes preserve position per Evan's ear (no skip).
  2. Voice change PASS in live-QA (same protocol, voice swap).
  3. `applyRateChange` has exactly ONE call to `restartGeneration` (grep-verifiable).
  4. Non-Kokoro reseed branches deleted from `applyRateChange` and `applyVoiceChange`.
  5. `restartGeneration(reason)` handles all four reasons (`'rate-change' | 'voice-change' | 'click' | 'resume'`).
  6. Stop-and-reseed race-window mitigation in place; verified by unit test.
  7. `npm test` green; `npm run build` green; `npm run typecheck` green.
  8. SRL-070 honored.
  9. `npm run test:quality` (Kokoro v2) shows no regression.
- **Effort:** **M** (~1-2 sessions; the cross-engine deletion is the heavy part).
- **Roster:** Zeus → Aristotle • Athena • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** 2026-05-29 ULTRATHINK Stage 8/9/10; codex-parent's effort-mismatch note flagging ~14 unfully-traced speakNextChunk sites; live-QA 2026-05-29 A5 PARTIAL (rate-change skip improved but not eliminated); Kokoro-only design constraint (CLAUDE.md).

##### Implementation detail
- **Edit sites:** `src/hooks/useNarration.ts:1722-1871` — full `applyRateChange` rewrite to single restartGeneration call; `applyVoiceChange` similar rewrite; `restartGeneration(reason)` helper extension; stop-and-reseed race-window mitigation in onWordAdvance gate.
- **Tests:** `tests/narrateApplyRateChangeCollapse.test.ts` (new); existing `tests/applyRateChange*.test.ts` updated (specific test names enumerated in Aristotle's memo).
- **Constants:** None added; dormant-engine constants (if any specific to their reseed paths) deleted alongside the branches.
- **Branch:** `sprint/narrate-applyratechange-collapse-1` from `main` + prior 3 unification sprints.
- **Commit hygiene:** Explicit-stage. Wave B1 (implementation) and Wave B2 (test updates) may share one commit. Deletion of non-Kokoro branches in same commit as collapse (semantic atomicity).
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after. CI gate enforces.

---

#### NARRATE-SUBSCRIBER-CURSOR-1 — Retire WORD_ADVANCE reducer action; visual highlight via direct callback *(position 5 — full spec, GATED)*

- **What:** Complete the cursor demotion. Rename `lastConfirmedAudioWordRef` → `subscriberCursorRef` (single-writer = audio scheduler onWordAdvance callback). Remove the `WORD_ADVANCE` reducer action that currently dispatches into React state for word position — that dispatch is the source of A2 (cursor lead due to React batching trailing audio clock). Visual highlight subscribes to `subscriberCursorRef` updates via a direct callback path (bypass React reducer batching for word-position updates). `cursorWordIndex` is removed from React reducer state — `status`, `wpm`, `voice`, and other session-level metadata stay. Scroll-follow (`FlowScrollEngine.followWord`) continues to read the same value but now via the subscriber ref instead of the reducer slice. This is the largest blast-radius sprint of the five; ships LAST so any regressions are localized and the prior 4 sprints have established a stable foundation.
- **Why:** A2 (cursor lead, "minor skip-ahead, much tighter than before" per Evan's verdict) was substantially improved by NARRATE-CLOSED-LOOP-CURSOR's heard-floor introduction but is fundamentally constrained by the React batching layer between scheduler callback and visual highlight. As long as `WORD_ADVANCE → reducer → render` is in the visual-highlight path, the cursor will always be 16-50ms behind the audio clock, papered over by lag compensation. Removing React from this path is the only way to actually eliminate the lead, not just compensate for it. Per ULTRATHINK technical-dimensional analysis: *"any architecture that uses React state (`cursorWordIndex`) as the seed for audio scheduling will always race the audio clock and lose."* By position 5 in the sequence, audio scheduling no longer reads from React state at all (positions 2-4 retired that). This sprint completes the symmetry by removing React state from the visual-highlight write path too.
- **Prerequisites / dispatch gate:** **A2-RETEST GATE — before dispatch, re-measure A2 (cursor lead) by ear on current main; only dispatch this sprint if a perceptible or growing lead remains. If A2 is acceptable post-INTENT/PAUSE-RESUME, defer this sprint to the backlog.** (DIAG-1 did not exercise A2; the dual-source framing this sprint rested on is weakened by the A4 refutation but not disproven for A2 specifically.) Plus: all of DIAG-1, INTENT-CURSOR-1, PAUSE-RESUME-UNIFY-1, APPLYRATECHANGE-COLLAPSE-1 merged. The priority chain (`intent ?? resumeTarget ?? subscriber`) is the only seed path; no audio decision still reads from `cursorWordIndex`.
- **Baseline:** clean `main` + prior 4 unification sprints merged.
- **Lane Ownership:** Lane A (Runtime Core) + Lane C (UI surface: visual highlight rewire).
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints. Largest blast radius in the sequence.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (reducer state shape), `src/components/ReaderContainer.tsx` (visual highlight subscription path), `src/types.ts` (NarrationState type), `src/hooks/useFlowScrollSync.ts` (scroll-follow consumer — read-site change only).
- **Merge Order:** FIFTH and LAST in the unification sequence (gated on the A2 retest).
- **WHERE (read order):**
  1. ULTRATHINK technical-dimensional analysis (§4.2) + Stage 2 lifecycle entry.
  2. `src/hooks/useNarration.ts` — reducer definition; every `WORD_ADVANCE` dispatch (~lines 463, 972, 1073, 1159, 1313 per Explore agent enumeration); `cursorWordIndex` slice readers; `lastConfirmedAudioWordRef` (line 187) — to be renamed.
  3. `src/components/ReaderContainer.tsx` — `applyNarrationActiveWord` callback; visual highlight setter wiring; current consumer of `cursorWordIndex` slice for highlight.
  4. `src/hooks/useFlowScrollSync.ts:486+` — `FlowScrollEngine.followWord(narration.cursorWordIndex)` — consumer must be re-wired to subscriber ref.
  5. `src/types.ts` (and `src/types/narration.ts`) — `NarrationState` type; remove `cursorWordIndex` field; `subscriberCursorRef` typing.
  6. SRL-067 (visual and audio pipelines must not share raw word indexes unless they share tokenization) — this sprint MAKES that explicit.
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo, ~60 min — heaviest of the five) Produce `docs/studies/investigations/NARRATE-SUBSCRIBER-CURSOR-design.md` covering: (a) every `WORD_ADVANCE` dispatch site with file:line (**grep-verified on main 2026-05-29 post-checkout: 6 sites at lines 463, 972, 1073, 1158, 1246, 1305**; the earlier draft of this spec cited 1255/1314 — those were dissolved-branch line numbers; main's line numbers above are correct; re-enumerate from source at execution time per SRL-086/SRL-087 in case intermediate sprints shift the lines); (b) every `cursorWordIndex` read site outside `useNarration.ts` (especially ReaderContainer, useFlowScrollSync, any test fixtures); (c) the rename mapping `lastConfirmedAudioWordRef` → `subscriberCursorRef`; (d) the visual-highlight callback architecture — how does ReaderContainer subscribe to subscriberCursorRef updates without React state? Options: (i) imperative DOM mutation via `data-highlighted-word` attribute toggling; (ii) a thin local React state in ReaderContainer that's set via `useEffect` synced to the ref via a poll/listener; (iii) ref forwarding pattern with subscription callback. Recommend (i) per ULTRATHINK technical finding that React batching is the original sin — direct DOM mutation is the only path that won't re-introduce the lag; **HOWEVER, if recommending (i), Aristotle's memo MUST explicitly address the React-reconciliation hazard: imperative DOM mutations on attributes React thinks it owns can be reset when React re-renders the containing tree (triggered by mode switches, settings changes, navigation, or any unrelated React state update). Specify which DOM nodes/attributes are safe to mutate imperatively (typically: nodes/attrs that React doesn't read back as state — `data-*` attributes outside React's reconciliation surface, or refs to elements whose className is React-controlled but whose `dataset` is not), and which would conflict. If conflict is unavoidable for the chosen approach, fall back to option (ii) or (iii); the lag from a single useState write is materially smaller than from the WORD_ADVANCE reducer + render cycle, so even (ii) is a win.** Aristotle owns this decision and its risk enumeration. (e) the FlowScrollEngine.followWord rewire — same subscription pattern; (f) regression risk enumeration; (g) staged rollout plan if memo identifies a high-risk consumer.
  2. `[athena/opus, renderer-scope + cross-system]` Implement per memo. Athena because this touches reducer + render path + scroll-follow. Rename `lastConfirmedAudioWordRef` → `subscriberCursorRef`; remove `cursorWordIndex` from reducer state; remove `WORD_ADVANCE` action; wire visual highlight via direct DOM mutation (recommended approach per Aristotle memo); update FlowScrollEngine.followWord consumer; ensure `getNextChunkSeed()` (from INTENT-CURSOR-1) now reads subscriberCursorRef in its fallback slot.
  3. `[hippocrates/haiku]` `npm test`. Existing tests that reference `cursorWordIndex` slice need updating to read subscriber ref instead. Add `tests/narrateSubscriberCursor.test.ts`: assert WORD_ADVANCE action removed (any dispatch attempt is a type error); assert visual highlight updates within one frame of subscriber ref update (faster than React batch); assert FlowScrollEngine.followWord receives updates correctly.
  4. `[plato/sonnet]` Architecture review (parallel with Live-QA): verify ZERO remaining `WORD_ADVANCE` dispatches grep-clean; verify ZERO React state holds word position; verify single-writer discipline on subscriberCursorRef (only onWordAdvance writes); verify SRL-067 newly satisfied (visual pipeline = subscriber ref subscribers; audio pipeline = priority chain consumers; they're independent).
  5. `[live-qa, Evan + Cowork]` THE A2 GATE + REGRESSION SUITE — fixture: The Raven AND prose. Run **A2** (cursor tracks heard word — listen for growing or jumpy lead); **A1, A4, A5, A6** as regression checks (must still PASS); **B6 prose tracking** (no accumulating lead in prose). PASS criteria: A2 cursor stays locked to heard word with no perceptible lead OR a tiny constant offset (the bar from codex-parent's spec); A1/A4/A5/A6/B6 unchanged from prior sprints.
  6. `[marcusaurelius/sonnet]` Docs pass: ROADMAP completed, CLAUDE.md update with NARRATION ARCHITECTURE COMPLETE section noting the dual-source unification finish, sprint-queue.xlsx, LESSONS_LEARNED SRL entry on "removing React from realtime callback paths," TECHNICAL_REFERENCE.md update for the new two-cursor model. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle memo (heaviest in the five; ~60 min budget). Gates Wave B.
  - Wave B1 — Athena implementation: rename, reducer slice removal, WORD_ADVANCE removal. ~30-35 tool uses.
  - Wave B2 — Athena: visual highlight direct-DOM rewire, FlowScrollEngine.followWord rewire. ~20-25 tool uses.
  - Wave B3 — Hippocrates test updates + new tests. ~25-30 tool uses.
  - Wave C — Plato + Live-QA + MarcusAurelius. Plato/Live-QA parallel per SRL-012. ~25-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A2 PASS** in live-QA: cursor tracks heard word with no perceptible growing/jumpy lead on both The Raven AND prose, per Evan's ear+eye.
  2. **Regression PASS** on A1, A4, A5, A6, B6 — no regression from prior unification sprints.
  3. `WORD_ADVANCE` reducer action removed; `cursorWordIndex` removed from `NarrationState`; grep-verifiable zero references.
  4. `subscriberCursorRef` renamed from `lastConfirmedAudioWordRef`; single-writer (onWordAdvance only); single-purpose documented in code comment.
  5. Visual highlight updates within one frame of subscriber ref write (no React batching latency); verified by performance test or measured by Aristotle's memo's chosen instrumentation.
  6. FlowScrollEngine.followWord consumer continues to function (scroll-follow regression check passes per SRL-058 active-render QA gate).
  7. SRL-067 newly satisfied: visual pipeline and audio pipeline read independent sources.
  8. `npm test` green; `npm run build` green; `npm run typecheck` green.
  9. `npm run test:quality` (Kokoro v2) shows no regression.
- **Effort:** **M** (~2 sessions; the rename + WORD_ADVANCE removal + visual highlight rewire is the heaviest single-sprint change in the unification sequence; ships last so regressions are localized).
- **Roster:** Zeus → Aristotle • Athena • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** 2026-05-29 ULTRATHINK §4.2 (React batching as original sin) + Stage 2 lifecycle; live-QA 2026-05-29 A2 PARTIAL (lead reduced but not eliminated); SRL-067; SRL-058.

##### Implementation detail
- **Edit sites:** `src/hooks/useNarration.ts` — remove `cursorWordIndex` from reducer state; remove `WORD_ADVANCE` action; rename `lastConfirmedAudioWordRef` → `subscriberCursorRef` (line 187 on main, same as dissolved); update `getNextChunkSeed()` (from INTENT-CURSOR-1) to read subscriberCursorRef in its fallback slot; remove every `dispatch({type: WORD_ADVANCE, ...})` call (**6 sites grep-verified against main 2026-05-29 post-checkout: lines 463, 972, 1073, 1158, 1246, 1305** — the earlier draft of this spec cited 1255/1314, which were dissolved-branch line numbers; main's are correct here). `src/components/ReaderContainer.tsx` — rewire `applyNarrationActiveWord` to subscribe to subscriberCursorRef via direct callback (architecture choice in Aristotle's memo; see React-reconciliation hazard requirement above); remove `cursorWordIndex` slice consumer. `src/hooks/useFlowScrollSync.ts:486+` — rewire `FlowScrollEngine.followWord` consumer. `src/types.ts` / `src/types/narration.ts` — remove `cursorWordIndex` from NarrationState.
- **Tests:** `tests/narrateSubscriberCursor.test.ts` (new). Existing tests referencing `cursorWordIndex` slice need updating (Aristotle's memo enumerates).
- **Constants:** `TTS_TRUSTED_CURSOR_LAG_MS` and `NARRATION_CURSOR_LAG_MS` — review if still needed after subscriber direct-callback path lands; lag may be consumable purely inside `getHeardFloorWordIndex()` now. Aristotle's memo decides.
- **Branch:** `sprint/narrate-subscriber-cursor-1` from `main` + prior 4. Pre-split waves required given the per-wave 40-tool-use ceiling: Wave A (memo, may auto-merge as docs-only); Wave B1 (rename + reducer surgery); Wave B2 (visual highlight + FlowScrollEngine rewire); Wave B3 (tests); Wave C (Plato + Live-QA + MarcusAurelius).
- **Commit hygiene:** Explicit-stage. Aristotle memo separate commit. Wave B1+B2 may be one commit (semantic atomicity of the rename + state removal). Wave B3 separate commit (tests). Wave C MarcusAurelius separate.
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after — CI gate enforces TTS-QUAL-CI-1. Manual smoke against The Raven AND prose is part of live-QA, not separate cal.

---

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(position 6 — stub)*

Library card 3-line format, "New" dot auto-clear, Ctrl+K command palette entries, and Space bar starts the last-used reading mode after reader runtime controls are stable. Will be full-specced at next /roadmap-review when buffer needs replenishment after the unification sequence (positions 1-5) completes. Notes: 3-line format = title / author / progress%-and-time-left; "New" dot is the unread indicator on freshly-imported docs; command palette entries should include the existing import paths (Folder, URL, Drop), the mode switches (Focus/Flow/Narrate), and a recent-docs jump. Coordinate with Hotkey Map (existing Settings panel section) to avoid hotkey collisions.

---

#### HYG-XLSX-DASHBOARD-RESTORE — Restore sprint-queue.xlsx Dashboard formulas + openpyxl quarantine *(position 7 — stub)*

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
buffer_actual_full_specs: 5
buffer_actual_stubs: 2
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
