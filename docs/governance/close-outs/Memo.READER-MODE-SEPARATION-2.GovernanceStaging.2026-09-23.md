# Sprint Close-Out Governance Staging — READER-MODE-SEPARATION-2

Session: Wave A admission continuation. Date: 2026-09-23. Lane: Reader Engine. Branch: `eb/reader-mode-separation-2`. Pinned HEAD: `1e5485c66e547392e7752240df71700267e8ede7`.

This memo records governance change intent for later application by the registered writer. It is not a close-out or a G0 pass. The current user explicitly invoked Virtuoso and approved advancing the proposed bounded admission continuation. The memo location resolves from `Virtuoso/workspace-layout.json` role `closeOuts`; Virtuoso's worktree Rule 2 expressly requires this staging artifact. No registry permissions or canonical governance documents are changed. The earlier Wave A 40-action stop remains part of the evidence.

## Mid-Dispatch Decisions Registry — READER-MODE-SEPARATION-2

| # | Date | Pause point | Decision type | Disposition |
|---|---|---|---|---|
| 1 | 2026-09-23 | Wave A reached its 40-action admission ceiling with incomplete G0 evidence | Type 1b — Advance (Planner-Originated) | Resolved decision: owner approved prospective A1/A2/A3 re-slicing with 20/20/35-action limits; G0 execution remains incomplete and blocked |
| 2 | 2026-09-23 | Owner requested speed dialogs beyond the original P1 scope | Type 3 — Pivot Advance | Resolved decision: admit the specified speed dialogs after structural parity, with separate verification; cursor synchronization remains follow-on work |
| 3 | 2026-10-09 | Wave A census and G4 fixtures contradicted the spec in seven bounded places (Q-A..Q-G) before the first Wave B edit | Type 1b — Advance (Planner-Originated), Q-A as Type 2 narrowing | Resolved under the owner's standing overnight authorization: rules supplied for dead views, the standalone reader window, runtime code in narration types, shared constants/diagnostics/cache, per-mode ownership, cross-owner G4 comparison, and baseline anomalies; no gate loosened |

## Target: ROADMAP.md

### Fold-in 1 — Owner-approved admission continuation

Section: `READER-MODE-SEPARATION-2` → `Waves and verification gates`, after the existing 40-action paragraph.
Action: Insert after.
Decision: Type 1b — Advance (Planner-Originated); bounded admission re-slice.
Content:

> **Mid-dispatch amendment — Wave A admission continuation (2026-09-23).** The previous admission attempt reached its 40-action ceiling and stopped with partial live evidence; retain that record and the existing G0 requirements. The owner approved the proposed continuation after that stop. Execute the following independently bounded deliverables serially, recording their own action totals and evidence. These are a prospective re-slicing of unfinished admission, not a reset of the prior attempt or a waiver of its stop. A ceiling or failed exit criterion stops that slice; preserve its evidence and route the unresolved decision before dependent work.

| Slice | Owner / task | Maximum tool-use actions | Mechanical exit criterion |
|---|---|---:|---|
| A1 | Implementation agent: establish the isolated baseline profile and test-only launch/capture route | 20 | Record pinned source/build/document identity, fixed viewport, launched process identity, resolved app-data/storage paths and successful application writes within the dedicated test profile. Verify the known live-profile files retain their before/after hashes after flush and close. Retain launch/error output; zero unresolved isolation or write-path errors. No application source edit. |
| A2 | Implementation agent and reviewer: reproduce and classify Flow using the A1 route | 20 | On a hash-identified document at a recorded canonical position, capture Page → paused Flow → Play → Pause with timestamped screenshots and renderer/main-process error output. Observe each selected state for at least 5 seconds; paused states must retain content and position, and active Flow must retain the reading surface while its position advances. Record blink/content-loss and error observations explicitly. If the surface fails to stabilize, stop with a concrete reproduction and narrowly scoped proposed repair; do not infer that earlier file-write errors caused it or admit a production fix through this slice. |
| A3 | Implementation agent and reviewer: complete the independent G0 matrix | 35 | Record every original G0 live scenario on both EPUB and a non-EPUB fixture, including exact canonical positions, mode/play state, selection, scroll/effect traces, transitions and the required independent heard-audio observation. Record document/build hashes, viewport, engine/voice/device/rate and observer. Complete dependency and ownership census with exact paths. All original G0 requirements must be satisfied; retain explicit known sync/1.4x defect identifiers. Missing or failed evidence keeps G0 blocked. |

Serial dependency: A1 → A2 → A3 → complete Wave A/G0 → B → C → D → E. The remainder of Wave A must also fit a declared bounded task plan before execution; the split does not grant an unbounded contract or census task. A failed slice blocks its dependent slice. Retain SRL-053 live verification and SRL-089 dependency serialization. No production extraction may begin before the complete original G0 admission gate passes. Refresh Monday and prerequisites at admission; only after G0 passes may the parent perform the governed in-flight transition.

The added test-only surface under `docs/planning/roadmap-reviews/reader-mode-separation-2/admission/` is limited initially to `isolated-launch.cjs`, `capture.mjs`, `fixture.txt`, `isolation.json`, `flow-reproduction.json` and `baseline-build.json`. The latter records the independently archived pre-extraction build, with 21 files verified by SHA-256 and size; the build archive itself is outside the repository and does not imply G0 completion. Test-profile runtime artifacts stay within the dedicated profile and are not implicit Git staging targets. Record each retained screenshot, log, trace or other output as an exact file in `paths.json` when its name is known; no directory or wildcard staging. Launcher/capture instrumentation must not replace production behavior or manufacture baseline results. Application source changes are excluded from A1–A3. The existing baseline and issue remain preserved, with continuation evidence appended rather than silently rebaselined.

### Fold-in 2 — Owner-approved speed dialog amendment

Section: `READER-MODE-SEPARATION-2` → `Product requirements and success measures`, after the P0/P1/P2 paragraph.
Action: Insert after.
Decision: Type 3 — Pivot Advance; owner-approved speed-control scope addition.
Content:

> **Mid-dispatch amendment — speed dialog (2026-09-23).** The owner approves this explicit exception to P1's additional-feature exclusion. Page is purely manual and exposes no speed control. In Focus, Flow and Narrate, clicking the current displayed speed opens a dialog containing a slider. The displayed and selectable value is a multiplier with 0.05x increments. Focus and Flow use a fixed 250 WPM reference for 1.00x, preserving their 100–1200 WPM bounds as 0.40x–4.80x; the resulting 12.5 WPM increments are retained without integer rounding. Narrate permits 0.80x–2.00x. If an existing interface cannot represent a fractional WPM value, record that exact incompatibility and obtain a scoped decision before changing the representation or rounding policy.

Implement this feature only after the structural separation candidate has demonstrated G0–G6 parity. Preserve that candidate and its evidence independently. Then declare exact implementation/test paths and a bounded serial task for the slider amendment; verify it separately and re-run the affected regression, live-mode and final-candidate gates. The original four-mode baseline remains the structural comparison. The speed feature cannot be used to explain away a parity failure. The parent remains incomplete until both structural separation and this amendment are verified against the final candidate.

Acceptance checklist:

1. Page has neither a displayed speed action nor automatic playback; existing Page Space no-op remains intact.
2. For each of Focus, Flow and Narrate, clicking its displayed speed opens the slider dialog; slider changes update the selected mode's display and effective rate.
3. Focus/Flow enumerate exactly 89 selectable values from 0.40x through 4.80x inclusive. Every value maps to `multiplier * 250` WPM, including 0.45x = 112.5 WPM, 1.00x = 250 WPM and 4.80x = 1200 WPM. No out-of-range or silently rounded selection.
4. Narrate enumerates exactly 25 selectable values from 0.80x through 2.00x inclusive in 0.05x steps; verify endpoints and an intermediate 1.05x value through its audio rate port and the live UI.
5. Changing one mode's speed does not mutate another mode's settings or private state; opening/closing the dialog does not change position or start paused playback. Preserve each mode's existing play/pause semantics.
6. Verify keyboard-operable slider/dialog interaction and a visible current value. Record live observations and behavioral assertions for the approved speed differences separately from extraction parity.

Narrate cursor lead, heard-word synchronization, reload catch-up and rate-overlap repair remain follow-on sync work, as the owner expressly directed. This amendment does not authorize those repairs, a storage-format migration, or new shortcuts.

### Fold-in 3 — Mid-Dispatch Amendment (pre-Wave-B scope rules, Q-A..Q-G)
Section: §READER-MODE-SEPARATION-2 (inline full spec)
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
#### Mid-Dispatch Amendment — 2026-10-09 (pre-Wave-B scope rules)
**Pause point:** The Wave A census (`dependencies.json`, `ownership.json`, `census/`; 63b10115) and the G4 fixtures (`fixtures/*.baseline.json`; c61bca67) contradicted the spec in seven places before any `src/` edit. Issue: `docs/governance/bug-reports/Issue.READER-MODE-SEPARATION-2-S1.2026-10-09.md`.
**Decision:** Type 1b — Advance (Planner-Originated); Q-A is a Type 2 narrowing. Decided under the owner's standing overnight authorization.
**Rationale:** Each rule enforces the spec's stated isolation and parity intent more precisely; none loosens a gate, and the one new comparison rule is recomputed from data.
**Scope change:**
- **Q-A:**
  - Do not copy the dead non-EPUB views (`PageReaderView`, `ScrollReaderView`, `FlowText`, `VirtualScrollText`, `PausedTextView`, `FlowCursorController`). The mirrored per-mode layout drops `TextView.tsx` in all four modes, leaving 8 files each.
  - The shell keeps the existing non-EPUB re-import fallback, since that is the production non-EPUB behavior.
  - Wave E removes the dead view imports from `ReaderContainer.tsx` and proves via G1 that no production graph reaches the dead views. A dead file is deleted only if no retained test imports it; otherwise it stays unreachable, with evidence.
  - G0/G6 non-EPUB rows use converted imports.
- **Q-B:**
  - `src/App.tsx` (the live standalone reader window: Library "open in new window" → `open-reader-window` → `#reader/<id>`) stays untouched and outside the four-mode system.
  - Modes copy what they need from `useReader.ts` / `ReaderView.tsx` into their own directories. The originals remain solely as the standalone window's private engine, and no mode may import them (G1).
  - Wave E records App.tsx as their sole remaining consumer, with census evidence. Rewiring the standalone window is out of scope; it has no recorded baseline.
- **Q-C:**
  - `src/types/narration.ts` runtime exports (`narrationReducer`, `findSectionForWord`) remain TTS infrastructure behind Narrate's audio port, used by `useNarration.ts`, which is not edited.
  - Mode-behavior consumers, such as `useFoliateSync`'s section lookup, get private copies under `src/reader/modes/<mode>/helpers/`.
  - The ownership manifest classes narration.ts as infrastructure-port (TTS).
- **Q-D:**
  - `src/constants.ts` is allowed-shared as immutable configuration. Mode-specific values are copied into owner-local defaults with identical values, as the spec already requires; G1 asserts no mode writes it.
  - Diagnostics (`narrateDiagnostics.ts`, `dualSourceDiag.ts`) are reachable from modes only through a write-only diagnostics infrastructure port on the broker, which carries the captured session tuple and is owner-checked. TTS infrastructure may keep its direct use.
  - The `useNarrationCaching.ts` module-level extraction cache moves behind the document port, as immutable document/content preparation.
- **Q-E:** The ownership-manifest owner value `per-mode` is legal only with an exact `privateCopiesFor` list. G1 asserts each listed copy exists in exactly that mode's directory and nowhere shared.
- **Q-F:** G4 comparison rule.
  - (1) Recompute the cross-owner set mechanically: any `audio.*` effect in a step whose mode before and mode after are both not `narrate`.
  - (2) Assert that the stored `crossOwner: true` flags equal the recomputed set (instrument check).
  - (3) Drop exactly that set from the baseline.
  - (4) Assert that the candidate emits zero effects matching the same rule.
  - (5) Compare the remainder byte-for-byte after the spec's timestamp and session-id normalization.
  - No other effect may be dropped. Record the rule and the dropped list in `test-migration.json`. Fixture files are never edited.
- **Q-G:** Baseline anomalies.
  - Non-Narrate audio effects (OBS-A3-3 same-Page `audio.stop` and similar) are removed under Q-F.
  - OBS-A3-1 (Narrate(paused)→Page highlight on word 0 while the persisted anchor is 7) is governed by G3's handoff rule: destination = source canonical word, copy-only. The expected post-separation value is 7, and G6 lists the row as a removed cross-owner effect, citing the baseline persisted anchor 7.
  - OBS-A3-2 (Focus pacing→Page readback 209) is classified during Wave B, read-only, against Focus's own canonical position:
    - if Page shows a value other than Focus's snapshot, G3 governs and the change is a removed cross-owner effect;
    - if 209 is Focus's true canonical position, preserve it as baseline;
    - if unclassifiable after two attempts, record an issue and route it.
  - Preserved as baseline (G4 fixtures enforce): Flow resume = cold restart from the anchor; a warming Narrate start → the next press resumes; Narrate→Page issues `audio.stop` twice (idempotent stop/destroy may reproduce it).
**Follow-up items:** Owner may later decide to rewire the standalone reader window (new item, not this epic). Provisional lesson staged below (number assigned at fold-in).

## Target: docs/governance/LESSONS_LEARNED.md

### Fold-in 4 — Provisional lesson (number assigned at fold-in; worktree numbers are placeholders)
Section: end of catalog
Action: Append row
Content:
### LL-<next> — Mode-separation specs must be cut from an import-graph census, not a file inventory (READER-MODE-SEPARATION-2, 2026-10-09)
- **Applies to:** spec authoring, refactors, reader modes
- **Discovery:** A Full Spec written from a source inventory listed dead views as copy targets, a runtime-bearing file as "type-only", missed a live second entry point (App.tsx standalone window), and required byte-for-byte parity with behavior that included the very cross-owner effects the separation removes. All surfaced only at Wave A via a TypeScript-resolver import graph and a production-path trace recorder.
- **Rule:** Before declaring copy/move targets or parity gates, run an import-graph census from the real entry points (all of them) and tag the effects the change is meant to remove; write the parity gate as "baseline minus mechanically recomputed removed-effect set, removed set asserted absent".
- **Related:** LL-118 (trace imports bottom-up), LL-128 (verify targets before create).

## Target: close-out memo §Mid-Dispatch Decisions

### Fold-in 1 — Preserve the admission and speed decisions

Action: Migrate.
Source: this staging memo's two `ROADMAP.md` fold-ins, its Mid-Dispatch Decisions Registry, and both `Decision — 2026-09-23` blocks in `Issue.READER-MODE-SEPARATION-2.2026-09-23-2.md`.
Destination: final close-out memo → `Mid-Dispatch Decisions`.

Preserve the owner's authorization, prospective A1/A2/A3 action limits, unchanged G0 gate, known sync exclusions, speed ranges/reference/increments, deferred slider sequence and final verification disposition before any eventual inline-spec collapse. Do not describe proposed acceptance checks as completed. No automatic merge, push, cleanup or successor dispatch is authorized.
