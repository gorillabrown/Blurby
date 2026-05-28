# Blurby — Development Roadmap

**Last updated**: 2026-05-28 — full Phase D buffer replenishment. 5 full specs queued (TTS-QUAL-CI-1, EXT-PAIR-1, SINGLE-INSTANCE-LOCK-1, THEME-SYNC-1, NARRATE-CLOSED-LOOP-CURSOR) + UX-POLISH-1 stub at position 6. Two new hotfix sprints (EXT-PAIR-1 for BUG-183, THEME-SYNC-1 for BUG-182) integrated into the conveyor belt. NARRATE-CLOSED-LOOP-CURSOR promoted from stub to full spec with file:line edit-site detail after READER-ISO-1E (2026-05-27) unblocked it. SRL-079 added (rebuild verification gate). **Next dispatch: TTS-QUAL-CI-1**.
**Current state**: v1.75.1 stable baseline plus READER-ISO-1A/1B/1C/1D/1E. All four mode adapters (Focus, Flow, Narrate) plus the typed contract (1A) and orchestrator shell (1B) are in place. S9 Flow lazy-follow remains intentionally deferred. Kokoro is the sole active engine; MOSS-Nano/Pocket TTS dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates. Graduated tiers: (1) CI quality gate active (TTS-QUAL-CI-1), (2) closed-loop cursor lands (NARRATE-CLOSED-LOOP-CURSOR), (3) all 2026-05-28 discovery bugs closed (EXT-PAIR-1, THEME-SYNC-1, SINGLE-INSTANCE-LOCK-1), (4) UX polish lands (UX-POLISH-1 + downstream).
**Queue**: GREEN — depth 6 (5 full specs at positions 1-5; 1 stub at position 6). **Conveyor belt order: TTS-QUAL-CI-1 → EXT-PAIR-1 → SINGLE-INSTANCE-LOCK-1 → THEME-SYNC-1 → NARRATE-CLOSED-LOOP-CURSOR → UX-POLISH-1**. Parallel-safe pairs: positions 1+3 (CI config + main-process), positions 2+4 (ws-server + Settings UI). Position 5 (NARRATE-CLOSED-LOOP-CURSOR) is the sole shared-core sprint and runs alone.
**Last sprint**: GOV-HUMAN-REVIEW-1 (2026-05-27) — removed MarcusAurelius stub, renamed `Hercules.md` → `hercules.md`, archived 8 superseded close-outs, reconciled roster across readme.md/CLAUDE.md/files. Docs-only; merge handed off to user per git-handoff rule.
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

The eager-spec buffer of 5 dispatchable sprints (positions 1–5 are full specs; position 6 is stub). Conveyor order applies dependency-first → risk-first → eat-the-frog tiebreakers. TTS-QUAL-CI-1 is the next dispatch (per the planning contract). NARRATE-CLOSED-LOOP-CURSOR sits at position 5 — it's the heaviest sprint but is now unblocked since READER-ISO-1E shipped 2026-05-27. Two new hotfix sprints (EXT-PAIR-1, THEME-SYNC-1) cover the 2026-05-28 discovery-pass bugs BUG-183 and BUG-182.

---

#### TTS-QUAL-CI-1 — CI Regression Gate Wiring *(position 1 — full spec)*

- **What:** Add a `quality-gate` job to `.github/workflows/ci.yml` that runs `npm run test:quality` (the `tts_eval_runner.mjs --mode=gate` harness against `docs/testing/tts_eval_baseline_v2.json` + `docs/testing/tts_quality_gates.v2.json`) so PRs that regress TTS quality fail CI. Scope the trigger so the gate runs on `main` pushes and on PRs touching TTS files without slowing unrelated PRs.
- **Why:** TTS-EVAL-3 built the eval harness, v2 baseline, and gates, and `npm run test:quality` exists — but nothing runs it in CI, so a regression only surfaces if someone runs it locally. Wiring the gate is the "Quality Gate Activation" phase entry. Held until now per Standing Rule "Broad-suite-before-CI"; TEST-GREEN-1 has since cleaned/classified the broad suite, so the gate now measures a stable runtime.
- **Prerequisites:** TEST-GREEN-1 complete (broad suite clean/classified — met) and TTS-EVAL-3 complete (harness + baseline + gates exist — met). Recommended after the reader-runtime isolation core so the gate measures stable behavior, but no hard code dependency on the adapters.
- **Baseline:** clean `main`. CI-config + scripts only; no runtime code.
- **Lane Ownership:** Lane D (Platform — workflow file) + Lane E (Governance — thresholds). No renderer/runtime code.
- **Forbidden During Parallel Run:** no `src/` runtime edits; do not change TTS engine code — only CI config and, if strictly needed, the gate runner's exit-code plumbing.
- **Shared-Core Touches:** none.
- **Merge Order:** independent; safest after the isolation core but may land any time deps are met.
- **WHERE (read order):** `.github/workflows/ci.yml` (current `test` job) → `package.json` (`test:quality`, line 22) → `scripts/tts_eval_runner.mjs` (`--mode=gate` exit-code behavior) → `docs/testing/tts_eval_baseline_v2.json` + `docs/testing/tts_quality_gates.v2.json` → `docs/governance/close-outs/CloseOut.TTS-EVAL-3.2026-05-18.md`.
- **Tasks:**
    1. `[hercules/sonnet]` Add a `quality-gate` job to `ci.yml` (ubuntu-latest only, to control cost): checkout → setup-node 20 + npm cache → `npm ci` → `npm run test:quality`. Confirm `tts_eval_runner.mjs --mode=gate` returns a non-zero exit on gate failure so CI actually blocks; if it does not, add an explicit threshold-check exit in the runner's gate mode.
    2. `[hercules/sonnet]` Scope the trigger: run `quality-gate` on `push` to `main` and on `pull_request` with a `paths:` filter for TTS surfaces (`src/**/tts*`, `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts`, `scripts/tts_eval_runner.mjs`, `docs/testing/tts_*`). Leave the existing `test`/`build` job unchanged.
    3. `[hippocrates/haiku]` Validate: `npm run test:quality` green on current `main` (gate passes at baseline); simulate a regression (temporarily perturb a gate threshold) to confirm the job would fail CI, then revert.
    4. `[hermes/haiku — governance tooling fold-in]` Create `scripts/recalc.py` (Python + openpyxl) — opens an `.xlsx` file, marks every formula cell as needing recalc (`cell.value` rewrite or `wb.calc_mode = 'auto'` equivalent for the openpyxl model), and saves. Usage: `python scripts/recalc.py docs/governance/sprint-queue.xlsx`. Rationale: the /roadmap-review and /roadmap-status skills both prescribe running a recalc script after Catalog edits to refresh the Dashboard tab's formula-driven KPIs (B12 category counts, B20 sprints-remaining, B24 % complete by LOE, B29 full-specs-queued, B32 buffer-health flag). Blurby was missing this script — discovered during the 2026-05-28 xlsx Catalog mirror operation when openpyxl edits left Dashboard cells with stale cached values until Excel reopened the file. Keep the script tiny (~30 LOC); add a `--dry-run` flag that reports which cells would be touched without saving.
    5. `[hermes/haiku — governance tooling fold-in]` Extend the Catalog tab's LOE column data-validation dropdown to include `XS` alongside the existing `S / M / L / XL`. Update `SINGLE-INSTANCE-LOCK-1` Catalog row (currently `LOE = S` as a conservative under-the-dropdown-limit) to `LOE = XS` — its ROADMAP spec calls XS (~5–10 LOC) and the Catalog should match. Also update Blurby's LOE-points mapping wherever it lives (likely the skill's frontmatter or Dashboard formula constants); standard mapping suggests `XS = 0.5 pts` if formulas use weighted sums. If the points mapping is hardcoded in Dashboard formulas, leave a note in `docs/governance/sprint-queue.xlsx` Dashboard notes and flag a tiny follow-up for the formula touch.
    6. `[marcusaurelius]` Docs pass: update CLAUDE.md (CI/CD line — add `npm run test:quality` as the active quality gate; add scripts/recalc.py to the tooling notes), ROADMAP (move TTS-QUAL-CI-1's full spec to dated archive on closeout), sprint-queue.xlsx Catalog (mark Completed, populate Date Completed + Close-Out File, clear Seq) → **then run `python scripts/recalc.py docs/governance/sprint-queue.xlsx`** to refresh Dashboard formulas now that the script exists. Auto-merge per planning contract.
- **Execution Sequence:** single wave (config + small script + dropdown extension; well under 40 tool uses). Test/Build tier = Quick (run `npm run test:quality` + lint the workflow + smoke-run `scripts/recalc.py --dry-run` against the Catalog).
- **Done when (SUCCESS CRITERIA):**
    1. `.github/workflows/ci.yml` has a `quality-gate` job running `npm run test:quality`.
    2. The job blocks the PR on gate failure (verified by a temporary threshold perturbation that turns CI red, then reverted).
    3. The gate runs on `main` pushes and on PRs touching TTS files; unrelated PRs are unaffected.
    4. The existing `test` + `build` job is unchanged and still green.
    5. `npm run test:quality` is green on `main` at the v2 baseline.
    6. `scripts/recalc.py` exists, takes an xlsx path argument, has a `--dry-run` mode, and refreshes Dashboard formula values when run against `docs/governance/sprint-queue.xlsx` (verified by opening the file in Excel post-script and confirming KPI cells show current values).
    7. `sprint-queue.xlsx` Catalog LOE dropdown accepts `XS` as a valid value; `SINGLE-INSTANCE-LOCK-1` row updated to `LOE = XS`.
    8. As a final closeout step, `python scripts/recalc.py docs/governance/sprint-queue.xlsx` is invoked so the Dashboard KPIs reflect post-mirror state (5 full specs queued, Buffer Healthy, etc.) without requiring a manual Excel-open trip.
- **Effort:** S. Core CI config + 30-LOC Python script + dropdown extension. Scope expanded marginally on 2026-05-28 to absorb queue-mirror tooling debt surfaced during /next-pointer.
- **Roster:** Zeus → Hercules • Hermes • Hippocrates • MarcusAurelius.
- **Source:** TTS-EVAL-3 close-out; `package.json` `test:quality`; Standing Rule "Broad-suite-before-CI"; SRL-070 (quality gates must measure real audio behavior, not self-referential metrics); 2026-05-28 xlsx Catalog mirror operation (surfaced both the missing recalc script and the missing XS dropdown value).

##### Implementation detail

- **Edit sites:** `.github/workflows/ci.yml` (new `quality-gate` job); possibly `scripts/tts_eval_runner.mjs` (exit-code guard in `--mode=gate`); `scripts/recalc.py` (NEW); `docs/governance/sprint-queue.xlsx` Catalog tab data validation rule on LOE column + row update for `SINGLE-INSTANCE-LOCK-1`; `CLAUDE.md` (CI/CD line + tooling notes); `ROADMAP.md` / `sprint-queue.xlsx` at closeout.
- **Tests:** `npm run test:quality` green at baseline; regression simulation turns the job red. `scripts/recalc.py --dry-run docs/governance/sprint-queue.xlsx` reports cells without modifying them; subsequent live run produces non-stale Dashboard KPIs.
- **Constants:** Quality-gate thresholds live in `docs/testing/tts_quality_gates.v2.json` — do NOT retune in this sprint; only wire the runner. LOE-points mapping (per the /roadmap-review and /roadmap-status skills): `S = 1`, `M = 3`, `L = 8`, `XL = 20`; recommended `XS = 0.5` for consistency.
- **Branch:** `sprint/tts-qual-ci-1` from clean `main`.
- **Commit hygiene:** Three logical commits acceptable: (a) CI config + runner exit-code plumbing, (b) scripts/recalc.py + LOE dropdown extension + SINGLE-INSTANCE-LOCK-1 row update, (c) MarcusAurelius docs pass. Explicit-stage; no destructive flags.

---

#### EXT-PAIR-1 — Chrome Extension Pairing Auth Timeout Repair *(position 2 — full spec)*

- **What:** Repair the Chrome extension pairing flow so a user-driven pair (open popup → enter 6-digit code → click Pair) reliably completes without the desktop side disconnecting on auth timeout. The current 5-second `WS_AUTH_TIMEOUT_MS` is shorter than a human paste-and-click and is being applied uniformly to BOTH the pre-paired pairing path AND the post-paired auth path. The extension's auto-reconnect loop floods the terminal with `Auth timeout` errors. Split the timer into two windows: a generous pairing window (matching `SHORT_CODE_TTL_MS = 5 min`) for the first-time pair, and the existing tighter window (5s) for stored-token re-auth. Preserve DoS protection on the post-paired path.
- **Why:** BUG-183 — Evan reported on 2026-05-28 that the extension cannot pair: Blurby displays the request banner with code 340780, the extension popup shows the same code input + "Pair" button, but submitting the code never completes the handshake. Terminal floods with `[ws-server] Auth timeout — disconnecting unauthenticated client` (20+ entries in a single observation window) — the extension is in an auto-reconnect loop where each new connection completes the WebSocket handshake but fails to send a valid `{type: "pair", code: ...}` message within `WS_AUTH_TIMEOUT_MS = 5000` (`main/constants.js:47`). The 5s window is sized for an automated re-auth using a stored token, NOT for a human entering a code through the extension popup. Without a wider window for first-time pairing, the entire connector surface is dead.
- **Prerequisites:** None. Independent of all active sprints. Parallel-safe (Lane D — main-process only).
- **Baseline:** clean `main` at v1.75.1 or later.
- **Lane Ownership:** Lane D (Platform / Main process — `main/ws-server.js`, `main/constants.js`).
- **Forbidden During Parallel Run:** no `src/` renderer edits, no IPC contract changes, no `Settings*` component touches.
- **Shared-Core Touches:** none.
- **Merge Order:** independent; safe to land any time.
- **WHERE (read order):**
  1. `main/ws-server.js` — `handleConnection()` (lines 105-177) for the auth timer init at line 154; `handleMessage()` (lines 219-294) for pair-vs-auth message handling, with the pair path at line 229-254 and the auth path at line 257-275.
  2. `main/constants.js` line 47 (`WS_AUTH_TIMEOUT_MS = 5000`) and line 43 (`SHORT_CODE_TTL_MS = 5 * 60 * 1000`).
  3. The Chrome extension's popup code if separately tracked (search for `EXT-*` close-outs first; `CloseOut.HOTFIX-14.*.md` for the BUG-155–158 connection-history precedent).
  4. `src/components/settings/ConnectorsSettings.tsx` for the renderer-side pairing UI.
- **Tasks:**
  1. `[aristotle/opus]` (read-only diagnosis, ~10 min) Instrument `handleConnection` with a temporary console log capturing every byte received from the client before the auth timer fires. Capture ONE full handshake attempt from a user-driven Pair click. Verify hypothesis A (timeout too short for user paste-and-click) vs. B (extension never sends pair message at all) vs. C (extension sends pair with wrong field shape). Output: `docs/governance/close-outs/Aristotle.EXT-PAIR-1.{date}.md` documenting the captured exchange.
  2. `[hercules/sonnet, electron-scope]` Per Aristotle's finding:
     - If hypothesis A (timeout): Add a NEW constant `WS_PAIRING_TIMEOUT_MS = 5 * 60 * 1000` in `main/constants.js`. In `main/ws-server.js` `handleConnection` line 154, initialize the auth timer at `WS_PAIRING_TIMEOUT_MS` for the pre-paired window. In `handleMessage` (after the first valid pair-or-auth message lands and `client.authenticated = true`), the timer is already cleared (lines 243 + 264) — so the wider initial window only applies until the first message arrives. For ALREADY-paired clients sending `{type: "auth", ...}` immediately, the tighter 5s window is functionally preserved (auth-or-die in 5s STILL fires if they don't send anything; but since they send immediately, no behavioral change).
     - Alternative if hypothesis A fix feels too permissive: keep `WS_AUTH_TIMEOUT_MS = 5000` for the IDLE post-connect window, but RESET the timer to `WS_PAIRING_TIMEOUT_MS` after the first valid (but unauthenticated) pair-attempt message — e.g., on receipt of `{type: "pair", code: "<invalid>"}`, give the user another window to retry. Aristotle's memo decides between these two approaches.
     - If hypothesis B/C (extension protocol bug): fix the extension's popup `Pair` button handler to send `{type: "pair", code: "<6 digits>"}` correctly. Document the protocol in `docs/governance/CONNECTORS.md` (create if absent — short doc, just the pair/auth message shapes).
  3. `[hercules/sonnet, electron-scope]` Replace the silent `console.log("[ws-server] Auth timeout — disconnecting unauthenticated client")` with a structured log that includes `client.remoteAddr`, elapsed-ms since connect, and `client.buffer.length` so future debugging shows whether anything was received. Also add an info-level log on successful pair-ok and auth-ok (currently silent).
  4. `[hippocrates/haiku]` Add `tests/wsServerAuth.test.js` with the WS server's state machine driven via mock sockets. Assert: (a) connect then send valid pair within `WS_PAIRING_TIMEOUT_MS` → succeeds; (b) connect then nothing within `WS_PAIRING_TIMEOUT_MS` → socket destroyed; (c) connect then send valid auth (post-paired path) within `WS_AUTH_TIMEOUT_MS` → succeeds; (d) connect then send invalid pair code → server replies `pair-failed` and connection remains until pairing timeout. Run `npm test` — must remain green.
  5. `[manual smoke test]` After merge + dev launch: open extension popup, enter the displayed 6-digit code, click Pair. Confirm handshake succeeds within 30s. Reopen extension within `SHORT_CODE_TTL_MS` (5 min) to confirm stored-token re-auth path still uses the tighter 5s window (extension auto-auths cleanly without retyping). Confirm terminal does NOT flood with `Auth timeout` lines after fix.
  6. `[marcusaurelius/sonnet]` Docs pass: close BUG-183 in `BUG_REPORT.md`, update CLAUDE.md open-bugs line, ROADMAP Completed Work Summary, `sprint-queue.xlsx` Catalog (mark Completed, populate close-out reference, recalc). Auto-merge.
- **Execution Sequence:** Wave A: Aristotle diagnosis. Wave B: Hercules implementation (tasks 2 + 3) + Hippocrates tests + manual smoke + MarcusAurelius docs. Aristotle gates Wave B.
- **Done when (SUCCESS CRITERIA):**
  1. User-driven Pair click in the extension popup successfully completes handshake within 30s of WebSocket connection (verified by manual smoke).
  2. Terminal no longer floods with `Auth timeout` while the extension popup is open and the user is in the process of pairing.
  3. The post-paired auth path retains the tight 5s window — verified by Hippocrates fixture (c).
  4. `npm test` green including new `wsServerAuth.test.js`; `npm run build` green; `npm run typecheck` green.
  5. BUG-183 closed in `BUG_REPORT.md` with resolution evidence.
- **Effort:** S–M. Investigation gate (Aristotle) then small-to-medium fix.
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • MarcusAurelius.
- **Source:** BUG-183 (filed 2026-05-28); `main/ws-server.js:154-160`; `main/constants.js:47`; terminal observation flood (20+ Auth timeout entries within seconds of 2026-05-28 dev launch).

##### Implementation detail

- **Edit sites:** `main/ws-server.js` lines 154-160 (auth timer init in `handleConnection`); `handleMessage` lines 219-294 if Aristotle finds the alt-approach (reset timer on first pair attempt) wins. `main/constants.js` after line 47 (add `WS_PAIRING_TIMEOUT_MS`). `tests/wsServerAuth.test.js` (new). Potentially the Chrome extension popup handler if Aristotle confirms hypothesis B/C.
- **Tests:** `tests/wsServerAuth.test.js` (new — 4 fixtures per Task 4). Existing `npm test` (3,005 tests) must remain green.
- **Constants:** Add `WS_PAIRING_TIMEOUT_MS = 5 * 60 * 1000` (5 minutes, matches `SHORT_CODE_TTL_MS`). Keep `WS_AUTH_TIMEOUT_MS = 5000` for the post-paired auth path.
- **Branch:** `sprint/ext-pair-1` from clean `main`. May split into wave-a (Aristotle) and wave-b (implementation) if combined exceeds 40 tool uses.
- **Commit hygiene:** Explicit-stage. Aristotle's diagnosis memo is its own commit; implementation is another. No destructive flags.
- **Cal cadence:** N/A (no TTS quality impact).

---

#### SINGLE-INSTANCE-LOCK-1 — Electron Main-Process Single-Instance Gate *(position 3 — full spec)*

- **What:** Add `app.requestSingleInstanceLock()` + the standard `second-instance` event handler to Blurby's Electron main process bootstrap so that a second launcher invocation focuses the existing window instead of spawning a duplicate `BrowserWindow`.
- **Why:** Confirmed reproducer 2026-05-28 — Evan launched Blurby twice from the Start menu and two independent windows opened. Previously documented in the 2026-05-27 live-QA discovery sweep as "F1" (MEDIUM, ~5 LOC fix). On v1.75.1 the main process does not implement a single-instance lock, so each launcher invocation spawns a new window with its own state. During the 2026-05-27 sweep three concurrent windows accumulated from rapid `open_application` calls and the third spawned blank (no associated state), which is alarming UX even if rare. The fix is the canonical Electron pattern and costs ~5 lines.
- **Prerequisites:** None. Independent of all active sprints. Parallel-safe with everything in the Active section (Lane D — main-process only; zero renderer/runtime touches).
- **Baseline:** clean `main` at or after TTS-QUAL-CI-1 close-out (or any sprint that doesn't itself touch `main.js`).
- **Lane Ownership:** Lane D (Platform / Main process). Touches only `main/main.js` (or equivalent main-process entry point).
- **Forbidden During Parallel Run:** no `src/` renderer edits; no preload edits; no IPC contract changes; no settings touches.
- **Shared-Core Touches:** none.
- **Merge Order:** independent; safe to land any time after the current dispatched sprint completes.
- **WHERE (read order):**
  1. `main/main.js` — locate `app.whenReady()` and BrowserWindow creation (`createWindow()` or equivalent).
  2. `main.js` (repo root, if present) — top-level entry referenced by `package.json` line 6 (`"main": "main.js"`).
  3. Existing close-outs touching `main/` for style precedent (e.g., `CloseOut.NARR-MEDIA-1.2026-05-17.md`).
  4. Electron docs: `app.requestSingleInstanceLock()`, `second-instance` event.
- **Tasks:**
  1. `[hermes/haiku]` In the main-process entry point, BEFORE `app.whenReady()`, call `const gotTheLock = app.requestSingleInstanceLock()`. If `!gotTheLock`, call `app.quit()` and `return`. This is the standard Electron pattern.
  2. `[hermes/haiku]` Add an `app.on('second-instance', (event, argv, workingDirectory) => { ... })` handler that: (a) restores the existing main window if minimized via `mainWindow.restore()`, (b) brings it to the foreground via `mainWindow.focus()`. If a deeplink/file-path was passed in `argv`, hand it to the existing file-open handler (mirroring whatever path Blurby uses today for first-launch file args).
  3. `[hippocrates/haiku]` Run `npm test` + `npm run build`. Both must remain green. No test failures and no new test required at this layer — single-instance behavior is verified by manual smoke (see below).
  4. `[marcusaurelius/sonnet]` Update CLAUDE.md (current state line if the sprint changes any system-state claim — likely no change), update ROADMAP.md Completed Work Summary table, update `sprint-queue.xlsx` Catalog (mark Completed, populate Date Completed + Close-Out File, clear Seq, dashboard recalc).
  5. `[manual smoke test]` After merge + reinstall (or `npm run dev`): launch Blurby once → confirm window visible. Launch Blurby again from Start menu while the first instance is running → confirm only one window remains and the existing window is focused/brought to front. No duplicate spawn.
- **Execution Sequence:** Single wave; ~5 tool uses; well under the 40 ceiling. No wave split needed.
- **Done when (SUCCESS CRITERIA):**
  1. `main.js` / `main/main.js` calls `app.requestSingleInstanceLock()` before any window creation.
  2. When the lock cannot be acquired, the second instance calls `app.quit()` and exits cleanly without spawning a window.
  3. The first instance's `second-instance` handler focuses the existing window (restoring from minimize if needed).
  4. `npm test` green, `npm run build` green, no regression in existing main-process behavior (file-open path, deep links, OS media controls from NARR-MEDIA-1 all still work).
  5. Manual smoke (per Task 5) passes.
- **Effort:** XS. ~5–10 LOC, single file, well-known Electron pattern.
- **Roster:** Zeus → Hermes • Hippocrates • MarcusAurelius.
- **Source:** 2026-05-27 live-QA discovery sweep (F1); 2026-05-28 reproducer confirmation by Evan ("Two windows opened successfully"); Electron `app.requestSingleInstanceLock` documentation.

##### Implementation detail

- **Edit sites:** `main/main.js` (or `main.js` at repo root — confirm location during execution from `package.json` `"main"` field). Single function-call insertion before `app.whenReady()` plus one `app.on('second-instance', ...)` handler. No other files touched.
- **Tests:** None added (behavior verified by manual smoke). Existing `npm test` (3,005 tests) must remain green; build must succeed.
- **Constants:** None. The fix is pure boilerplate.
- **Branch:** `sprint/single-instance-lock-1` from clean `main`.
- **Commit hygiene:** Explicit-stage `main/main.js` (or `main.js`) only. No destructive flags. One commit.
- **Cal cadence:** N/A (no TTS quality impact).

---

#### THEME-SYNC-1 — Settings Theme Propagation + Vite Circular Chunk Repair *(position 4 — full spec)*

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

#### NARRATE-CLOSED-LOOP-CURSOR — Real-Audio-Position as Single Source of Truth *(position 5 — full spec; promoted from stub 2026-05-28 after READER-ISO-1E shipped)*

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

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(position 6 — stub)*

Library card 3-line format, "New" dot auto-clear, Ctrl+K command palette entries, and Space bar starts the last-used reading mode after reader runtime controls are stable. Will be full-specced at next /roadmap-review when buffer needs replenishment after the position-1 sprint completes. Notes: 3-line format = title / author / progress%-and-time-left; "New" dot is the unread indicator on freshly-imported docs; command palette entries should include the existing import paths (Folder, URL, Drop), the mode switches (Focus/Flow/Narrate), and a recent-docs jump. Coordinate with Hotkey Map (existing Settings panel section) to avoid hotkey collisions.

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
last_review: 2026-05-28
finish_line: "TTS Quality Confidence + Reading Experience v2"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
buffer_target: 5
buffer_actual_full_specs: 5
buffer_actual_stubs: 1
-->
