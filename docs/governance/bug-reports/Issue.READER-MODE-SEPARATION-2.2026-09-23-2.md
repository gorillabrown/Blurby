# G0 admission pause — READER-MODE-SEPARATION-2

Date: 2026-09-23. Branch: `eb/reader-mode-separation-2`. Monday item 13119306772 remains Queued, Seq 1. Production extraction has not begun.

## 1. tl;dr

The automated baseline and live observation routes passed. The independent four-mode baseline remains incomplete, and Wave A reached its 40-action ceiling. The owner also requested a speed-control change outside the approved scope.

## 2. Executive Summary

The pinned worktree passed dependency installation, typecheck, 3,058 tests, and build. With Vite started before Electron, the desktop UI rendered. Page, Focus, Flow, and Narrate were observed on the Meditations EPUB. The owner confirmed hearing Narrate in this live session and reported its cursor ahead of speech, with reload jumping speech forward. A Realtek headphone loopback captured nonzero output during Narrate and silence while paused. The owner later reported Flow blinking without stabilizing. The non-EPUB and exact-position baseline matrix is unfinished. No production source or Monday status was changed.

The owner separately directed: Page is manual with no speed control; Focus, Flow, and Narrate should open a speed slider by clicking the displayed speed, with 0.05x steps. Narrate range is 0.8x–2.0x. Focus/Flow retain 100–1200 WPM bounds, with 1.00x fixed at 250 WPM. The owner directed keeping the Narrate cursor/reload repair for the follow-on sync work. The speed request conflicts with the current specification's P1 exclusion of additional features and needs a scoped amendment before implementation.

## 3. Evidence of issue

- Worktree HEAD `1e5485c66e547392e7752240df71700267e8ede7`; primary checkout and all unrelated work preserved. `npm ci --offline`, `npm run typecheck`, `npm test`, `npm run build` exited 0. Tests: 210 files/3,058 passed, 1 file/133 skipped, no failures. See `docs/planning/roadmap-reviews/reader-mode-separation-2/baseline.json` for hashes.
- A 1000×720 Blurby Electron window rendered after Vite was launched first. On EPUB, Page static navigation, Focus word advancement/pause, Flow highlight/follow/browse, and Narrate selection/playing/cursor/chapter movement were observed. Screenshots for the first three modes are retained in the evidence directory. UI control was intermittent because window geometry changed and concurrent input was detected.
- The owner explicitly confirmed hearing Narrate during this session and reported the cursor running ahead of speech and reload advancing speech to the cursor. No simultaneous exact spoken-word/visible-word pair or offset was given.
- WASAPI loopback on Headphones (Realtek USB2.0 Audio) recorded 5 seconds of silence while paused (RMS/peak 0) and 10 seconds of nonzero output while Narrate showed playing (RMS 0.0721; peak 0.9475) at 48 kHz. `baseline-narrate-loopback-48k.wav` and `baseline-paused-loopback.wav` are retained. A 16-kHz capture attempt returned silence and is not used as proof. The 48-kHz output has no independent transcription.
- The EPUB used by the live library has SHA-256 `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`, matching `resources/sample-meditations.epub`. Non-EPUB scenarios and exact canonical word indices were not captured.
- The owner reported Flow blinking and never stabilizing. A read-only capture showed Flow selected with content present; it did not establish the cause. Electron logged `ENOENT` renames of `library.json.tmp` and `sync-queue.json.tmp` while the dev instance was running. That instance and Vite were stopped. Both persisted JSON files existed and parsed after shutdown; no temporary file remained at inspection. No library repair or deletion was performed.
- `npm test` regenerated tracked `tests/perf-baseline-results.json`; it remains unstaged. No source extraction, staging, commit, push, merge, or Monday transition occurred.

## 4. Possible cause(s)

1. The unpackaged Electron app needs a running Vite renderer, explaining the first blank launch.
2. UI automation and concurrent desktop input made complete, repeatable baseline capture harder; the cause of the intermittent window geometry change and Flow blink is not established. The fixed-name temporary JSON writes may race, but the log does not prove they caused the UI blink.
3. The reported Narrate cursor lead may be the already documented sync defect. No word-level measurement in this attempt establishes its magnitude or mechanism.
4. The approved plan excludes the newly requested speed popup and 0.05x increments; the Focus/Flow 1.00x reference is 250 WPM.

## 5. Likely solution(s)

1. Re-slice Wave A into a bounded admission continuation. Use isolated app data to avoid writes to the live library, classify the Flow blink, and capture non-EPUB behavior and canonical-index traces for each mode. Keep the known Narrate sync defect labelled as baseline behavior; its repair belongs to follow-on sync work.
2. Amend the dispatch scope for the speed control using 250 WPM as Focus/Flow 1.00x. Keep Page manual. Preserve the structural separation gates and evaluate the slider change separately against mode parity.
3. Pass G0 only after the independent matrix is complete; then transition Monday through mutation-plan, connector, readback, and confirmation, and continue serial waves. If admission cannot be completed, route a mid-dispatch decision without production edits.

## 6. Confidence in cause and solution identification (1–10)

8 — the renderer start order, observed UI, owner heard-audio report, captured output, and missing matrix fields are directly evidenced. The Flow blink and cursor-lead mechanisms remain open.

## Decision — 2026-09-23

- **Type:** 1b — Advance (Planner-Originated)
- **Decided:** Advance the unfinished Wave A admission through the owner-approved A1/A2/A3 slices with 20/20/35-action limits and unchanged G0 requirements.
- **Instruction:** Execute A1 isolated-profile admission, then A2 Flow reproduction/classification, then A3 completion of the independent G0 matrix, stopping each slice on its ceiling or failed exit criterion.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, ROADMAP fold-in 1 and registry decision 1.
- **Lessons:** No new lesson — Flow's cause is unestablished, and the prospective re-slice applies the existing action-ceiling rule.

Session: Wave A admission continuation. Date: 2026-09-23. Owner decision: after asking how to unblock, the owner explicitly invoked Virtuoso and instructed, “Let's advance with your plan now.” This authorizes the prospective bounded continuation described below; the earlier 40-action stop and all preceding evidence remain unchanged.

Execute A1 isolated-profile admission (at most 20 tool-use actions), then A2 Flow reproduction/classification (at most 20), then A3 remaining independent G0 matrix (at most 35). Each slice must satisfy its recorded exit criteria before its dependent slice. Preserve the baseline and exact source/build/document identities. A1/A2/A3 may add only test-only launcher/capture/fixture and evidence files through the exact manifest; they do not authorize application source changes. Production extraction remains blocked until complete G0 passes. Persistent Flow failure produces a concrete reproduction and proposed bounded repair decision, not an inferred cause or silent baseline waiver.

## Decision — 2026-09-23

- **Type:** 3 — Pivot Advance
- **Decided:** Admit the owner's specified speed dialogs as an explicit scope addition after structural parity is proved, while retaining cursor synchronization as follow-on work.
- **Instruction:** Complete structural G0–G6 parity first, then declare exact slider implementation/test paths and a bounded serial task, implement the approved values, and verify the resulting final candidate separately.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, ROADMAP fold-in 2 and registry decision 2.
- **Lessons:** No new lesson — this records an owner product decision; no implementation finding has yet been established.

The approved speed scope is Page manual with no speed control; Focus/Flow speed dialogs in 0.05x steps, 1.00x = 250 WPM, 0.40x–4.80x = 100–1200 WPM, retaining fractional 12.5 WPM steps; Narrate speed dialog in 0.05x steps from 0.80x–2.00x. Implement and verify the slider change only after structural parity is proved, with its own exact paths and final-candidate verification. Narrate cursor lead/reload repair remains follow-on sync work.

The executable amendment, task acceptance criteria and later fold-in instructions are recorded in `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, resolved from registry role `closeOuts` and created under Virtuoso's expressly required worktree staging procedure. Canonical `ROADMAP.md`, `CLAUDE.md`, lessons and registry are not amended here. This decision records authorized work, not G0 completion or a Monday transition.
