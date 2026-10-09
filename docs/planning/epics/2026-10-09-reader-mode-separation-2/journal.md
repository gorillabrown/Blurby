# Journal — Separate Page, Focus, Flow, and Narrate runtimes

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. Write as you go. -->

## S0 — 2026-10-09 04:30 — scaffold

- **Did:** epic packet created ([charter](charter.md), [plan](plan.md), [state](state.md), [launch](launch.md)). No project work performed. Owner answers: packets live in `docs/planning/epics`; push the run branch at checkpoints and merge/push `main` only after `done.md`; GOV-HYGIENE block runs before launch; owner gates pause-and-keep-working.
- **Learned:** the run worktree's git link is broken (the repo moved from `C:\Users\estra\Projects\Blurby` to `C:\Projects\Blurby`). An uncommitted evidence file (`baseline-narrate-loopback.wav`) appears to sit in it. The archived baseline build lives in `%TEMP%`. The lessons parser reads 0 lessons until GOV-HYGIENE lands. See charter Assumptions A1–A7 and launch.md preflight.
- **Git:** `eb/reader-mode-separation-2` @ `74883154` (base `1e5485c6`); not on origin; uncommitted: unknown until the worktree is repaired.
- **Next:** P1 per plan.md, starting with charter A1.

## S0b — 2026-10-09 06:00 — pre-launch amendment (adversarial review)

- **Did:** No project work. The packet was amended before launch after an adversarial review raised 8 findings; the owner approved the amendment, recorded in ROADMAP as Mid-Dispatch Amendment 2026-10-09:
  - R1: authoritative packet is in the run worktree; the kickoff prompt bootstraps there.
  - R2: finalization is staged F1–F5 and resumable from git reality; `done.md` exists only after publication.
  - R3: no `src/` change before G0; contract/ports move to Wave B.
  - R4: the implementation-wave action ceiling is dropped (owner). Admission budgets 8/20/35 are kept, with no continuation grant.
  - R5: identities B0/I/S/F are named.
  - R6: D6 scope is `I..F`, with packet paths registered.
  - R7: refs are written in full (already fixed in fae71ebb); the harness guards are updated in P1.
  - R8: integration is verified in a clean worktree, never the primary checkout.
- **Learned:** The old baseline archive in `%TEMP%` lost all 21 files. B0 is rebuilt under the owner's rebuild policy: inputs must match, fresh validation, both manifests kept, and a hash mismatch alone is not an escalation.
- **Git:** run branch unchanged, `eb/reader-mode-separation-2` @ `74883154`; the amendment lands on `main` via `eb/epic-packet-amend-2026-10-09`.
- **Next:** P1 bootstrap per launch.md.

## S1 — 2026-10-08 23:40 (host clock; packet dates run a day ahead) — bootstrap

- **Did:** Bootstrap per launch.md. `git fetch origin --prune`. Charter A1 hit: `Mid-Dispatch Amendment — 2026-10-09` at ROADMAP.md:278 on both `refs/heads/main` and `refs/remotes/origin/main` (`aafbb1c9`). `git worktree repair` relinked W (gitdir → `C:/Projects/Blurby/.git/worktrees/reader-mode-separation-2`); the repair also reported 15 unrelated broken `C:/tmp/*` worktrees, left untouched. Branch `eb/reader-mode-separation-2`, HEAD `74883154` as expected. Uncommitted (A4): ` M tests/perf-baseline-results.json` (test noise, never staged) and `?? E/baseline-narrate-loopback.wav` (referenced by Issue `-2`, `baseline.json` and `paths.json` → register and commit). Merged `refs/remotes/origin/main` `--no-ff` cleanly (no overlapping paths) → **I = `92dda255bfad4395600a4371f0406f0f55c92899`**. Pushed; origin `refs/heads/eb/reader-mode-separation-2` = I, divergence 0/0. Switched to this authoritative packet.
- **Learned:** On this Windows checkout the loose-ref directory is `.git/refs/heads/EB/` (uppercase), so git enumerates the run branch as `EB/reader-mode-separation-2` and `git push origin eb/reader-mode-separation-2` fails with "cannot be resolved to branch". Push with the explicit refspec `HEAD:refs/heads/eb/reader-mode-separation-2` (origin uses lowercase `eb/`). Upstream tracking is set. The owner set `/goal` and said "proceed without my approval overnight" → launch Q2/A5 answered yes.
- **Decisions:** state.md Decision log #3 (explicit push refspec), #4 (A5 answered).
- **Git:** eb/reader-mode-separation-2 @ 92dda255; uncommitted: tests/perf-baseline-results.json (noise), E/baseline-narrate-loopback.wav (to commit at checkpoint).
- **Next:** register packet paths in `E/paths.json`; rebuild B0; update harness guards; lessons; A1-R.

## S1b — 2026-10-09 ~00:00 (host) — B0, guards, A1-R, A2

- **Did:**
  - B0 rebuilt in a detached worktree of `1e5485c6` at `C:\Projects\Blurby-artifacts\rms2-b0-checkout`. `npm ci --offline` gave 743 packages. Typecheck 0, build 0. 21 dist files archived at `rms2-baseline-build`, byte-identical to the original manifest. Recorded in `baseline-build-rebuild.json` (Decision 5).
  - Harness guards moved to W with an exact-set B0 check. Dry check passed; wrong-cwd and tampered-B0 negative controls refused.
  - A1-R PASS in 7/8 calls (`isolation.json`, 5f0608b6). A2 PASS in 10/20 calls (`flow-reproduction.json`, 2529a921). Committed `analyze-capture.mjs` and `live-run.ps1`.
  - The background census worker is writing `dependencies.json`, `ownership.json` and `census/`.
- **Learned:**
  - KF-1: the Qwen streaming test can leak a 500 ms stream-timeout rejection under full-suite load, so `npm test` exits 1 with 0 failures (1 of 3 runs).
  - `-WindowStyle Hidden` does not hide the BrowserWindow: it is visible and focused, so rAF is not throttled.
  - Fresh profiles download the Kokoro model twice concurrently (`kokoro`, `kokoro-marathon`), and the loads fail with error 13 (OBS-A1R-1, recurred).
  - Shutdown sometimes exits `0xC0000409` after the quit flush (OBS-A2-2).
  - B0 renders only EPUBs: non-EPUB sources must be converted imports, and the legacy inline record shows a re-import notice.
  - The September Flow blink does not reproduce on B0 in an isolated profile (DOM and screencast frame sizes).
  - The persisted position read 0 after a Flow pause at DOM word 34 (timing observation only).
  - W carries an old project-scoped copy of the virtuoso skill under `.claude/skills`; this run used the plugin skill.
  - Git normalizes CRLF to LF on the committed text evidence, so recorded SHA-256 values are over the working bytes.
- **Decisions:** 5–9.
- **Gate/DoD movement:** P1 exit gate passed. D1 is still unmet (A3, census, heard audio).
- **Git:** eb/reader-mode-separation-2 @ 2529a921; uncommitted: tests/perf-baseline-results.json (noise), census outputs (worker in progress).
- **Next:** integrate the census, then A3 per Decision 9.

## S1c — 2026-10-09 ~00:55 (host) — census, A3, G4 fixtures, owner gate

- **Did:**
  - Census integrated (63b10115): `--check` reproduces both manifests, and a drifted-manifest negative control exits 1.
  - A3 automated matrix used 28/35 calls (277967b3): 24 transitions and 4 same-mode cases per fixture, on the EPUB and on the converted two-chapter text fixture. Every destination is entered paused, with 1 visible cursor and 0 stale old-owner effects. Narrate starts exactly at 7 and at 0; first audio arrives in 499–596 ms. Pause/resume gives 1 resume and 0 cold starts. Rate went 1.0→1.4→1.0. Narrate crossed the natural chapter boundary on the text fixture.
  - Harness changes along the way:
    - The launcher seeds the installed Kokoro model, which resolves OBS-A1R-1 for automation.
    - Fixtures are now converted imports.
    - Anchors are set in paused Flow, because Page renders no word spans on the EPUB cover.
  - The G4 recorder was built by a worker and independently re-verified 5/5 (c61bca67).
  - Owner gate B1 raised with `g0-owner-checklist.md` and `g0-owner-observations.json`.
- **Learned:**
  - A bare `electron.exe <script>` launch defaults userData to `%APPDATA%\Electron`; the installed app's data is under `%APPDATA%\blurby`.
  - Meditations opens on its image-only cover in Page.
  - Flow starts at the start of the anchor's line.
  - Baseline anomalies OBS-A3-1..7 are recorded in `g0-matrix.json`.
  - Synthetic wheel input does not browse away in Flow, and Next-chapter during Narrate does not change the chapter.
  - The census found spec contradictions (Q-A..Q-E). The G4 recorder found the cross-owner comparison conflict (Q-F).
- **Decisions:** none new; Q-A..Q-G are queued for /mid-dispatch-decision.
- **Gate/DoD movement:** D1's automated half is complete; its owner half is pending (B1).
- **Git:** eb/reader-mode-separation-2 @ c61bca67 + this checkpoint; uncommitted: tests/perf-baseline-results.json (noise).
- **Next:** settle Q-A..Q-G; then stop cleanly, with every front blocked on B1 (no `src/` before D1).

## S1d — 2026-10-09 ~01:10 (host) — scope decisions; clean stop on B1

- **Did:**
  - Rendered `Issue.READER-MODE-SEPARATION-2-S1.2026-10-09.md` (Q-A..Q-G) and ran /virtuoso:mid-dispatch-decision under the owner's standing overnight authorization. Outcome: Type 1b, with Q-A as a Type 2 narrowing.
  - Staged the amendment as staging-memo fold-in 3 (registry row 3) and a provisional lesson as fold-in 4. Recorded the Decision block in the issue.
  - `baseline.json` now carries the B0 fresh automated G0 figures and G0 progress; admission stays BLOCKED.
- **Learned:** App.tsx's standalone reader window is live (LibraryView "open in new window" → `open-reader-window` → `#reader/<id>`), so it was kept outside the four-mode system rather than rewired.
- **Decisions:** #10.
- **Gate/DoD movement:** none (D1 waits on B1).
- **Git:** eb/reader-mode-separation-2 @ this checkpoint (pushed); uncommitted: tests/perf-baseline-results.json (noise only).
- **Stop:** every front is now blocked on B1. Pre-G0 rules forbid `src/` edits, and Wave B–E, the speed dialog, Monday In Flight and finalization all sit behind D1. Clean stop.
- **Resume:** once the owner writes "done" in B1, the next session:
  1. reads `g0-owner-observations.json`;
  2. sets `baseline.json` → `admission: PASS` with the observer, if all items are filled and no `new-problem` contradicts the matrix (otherwise route a mid-dispatch decision);
  3. runs the Monday Queued → In Flight handshake;
  4. starts Wave B (P3) per the state.md Q-A..Q-G block.
## S1e — 2026-10-09 ~01:30 (host) — front disposition; remaining unblocked fronts closed

- **Did:**
  - The stop-hook review found the earlier stop did not disposition every front. Added the Front disposition table F1–F16 to state.md.
  - Closed the three fronts that were actually unblocked:
    - `verification.json` (B0 and I recorded; S and F pending);
    - `test-migration.json` (spec-authorized substitutions plus the Q-F rule);
    - OBS-A3-2, classified read-only as a cross-owner overwrite (Decision #12).
  - Pre-registered the KF-1 decision table (Decision #11; staging fold-in 5).
- **Learned:** the document shell's `onRelocate` fraction estimate overwrites the Page highlight after a mode switch's re-pagination once the resume anchor has been consumed. Likely the same mechanism as OBS-A3-1. Wave B's copy-only handoff removes it.
- **Decisions:** #11, #12.
- **Gate/DoD movement:** none.
- **Git:** eb/reader-mode-separation-2 @ this checkpoint (pushed); uncommitted: tests/perf-baseline-results.json (noise).
- **Stop:** every front in the table is DONE, STAGED, or BLOCKED on B1, each with its gating clause. Clean stop per charter.

## S1f — 2026-10-09 ~02:30 (host) — owner direction: advance; Wave B begins

- **Did:**
  - The owner directed: "You make decisions … advance with recommendations. Iterate until the entire epic is complete." Applied in five steps:
    1. /virtuoso:mid-dispatch-decision Type 3: owner gate re-sequenced to OS-1 before F1. Decision #13; fold-in 6.
    2. Monday Queued → In Flight via the handshake as actor mid-dispatch-decision. Read back status "In Flight", Seq 1, Started 2026-10-09; created the "In Flight" label to match the registry's statusMappings.
    3. Base measured on W `d42cae8f`: typecheck/test/build all 0, 211/3063/133. The extra file and five tests were the G4 recorder, now renamed out of default discovery (0c3b4026).
    4. A worker produced the Waves B–E design (`design/waves-b-e-design.md`, 955 lines). It was reviewed and accepted, and OC-1..OC-9 were ruled (Decision #14; fold-in 7).
    5. Wave B steps B1–B5 dispatched to a worker.
- **Learned:**
  - The work register is writable only by roadmap-review, next-pointer, mid-dispatch-decision and pointer-closeout.
  - Narrate 0.80–2.00x needs a Kokoro UI-domain change (OC-7, authorized). Fractional WPM (112.5) is already representable end to end.
  - The default vitest discovery picks up `*.test.*` files under `docs/`.
- **Decisions:** #13, #14.
- **Git:** eb/reader-mode-separation-2 @ 3ee10afe + this entry; uncommitted: perf noise, plus the B1–B5 worker's files in flight.
- **Next:** verify and commit B1–B5, then B6 Page, B7 Focus, B8, and the B9 gate.

## S1g — 2026-10-09 (host) — Waves B, C, D complete

- **Did:**
  - Wave B (contracts, ports, broker, router core, Page, Focus, and the B8 OBS-A3-2 fix) passed gate **B9** on 5a34f6e1.
  - Wave C (Flow) passed gate **C4** on 9fa253b0.
  - Wave D (Narrate tree, all 12 G3 pairs plus 4 same-mode cases, and the `READER_MODE_MODULES` registry) was committed as e005d5eb and passed gate **D4**: typecheck, test and build all exit 0; 221 files, 3123 passed and 133 skipped; recorder 5/5; G1–G4 65/65; all 7 Narrate G4 scripts byte-identical with 0 dropped effects; audio 48/48.
  - Independent checks on Wave D:
    - 11 helpers are verbatim apart from their imports.
    - Narrate's anchor copy types against its own `FoliateView`, not `FlowScrollEngine`.
    - All 29 changed paths are in `paths.json`.
- **Learned:**
  - Enforcing allowance coverage with four trees exposed three allowances that no mode imports, including a dead `ProgressBar` import in legacy `ReaderView`.
  - The D3 registry makes the trees reachable from production before E1. This is by design and changes no behaviour.
- **Decisions:** #17.
- **Gate/DoD movement:** waveGates[2] D4 PASS.
- **Git:** eb/reader-mode-separation-2 @ e005d5eb + gate record; uncommitted: perf noise, plus the E1–E3 worker's files in flight.
- **Next:** verify and commit E1–E3 (cutover, OC-5 migrations), then E4–E7, then E8 (OS-1 G6) → S.

## S1h — 2026-10-09 (host) — Wave E: cutover, fixes, deletions, G1 completion

- **Did:**
  - Wave E code, in commit order:
    - E6 validator (197377ba).
    - E1–E3 cutover and migrations (3dd4b504).
    - Late full-book words fix (0b199425).
    - E4: seven legacy files deleted (8e245345).
    - E5 G1 completion (98cdbfe2).
    - Cutover review fixes (0e7cb3a9).
  - Full suite: 221 files, 3268 passed, 133 skipped; build 0.
  - The recorder now verifies on the genuine B0 tree (5/5 on src 0c790075).
- **Learned:**
  - After E1, the B0 launcher refuses W: W's src differs from the pin. G6 needs B0-checkout and candidate launchers.
  - E2's import relocations removed the last test readers of seven legacy files, so the §D.6 rule allowed deleting them.
  - Rewriting hooks into classes (DD-2) means the census's verbatim anchors cannot prove private copies exist. An explicit private-copy map is needed (Decision #22).
  - Two transient Windows `EPERM` rename failures in `tests/sync-queue.test.js`, during heavy concurrent runs; clean reruns exit 0. Watch at G5.
  - Both workers stopped once on the account usage limit. They were resumed with their partial work intact.
- **Decisions:** #18–#23.
- **Gate/DoD movement:** none recorded yet (S pending: G1 Q-E map, G5 gate, G6 owner session).
- **Git:** eb/reader-mode-separation-2 @ 6a891c3d; uncommitted: perf noise, plus the in-flight G6 harness (`live/`, paths.json) and Q-E map (boundary-policy.json, ownership test).
- **Next:** commit the Q-E map, then the harness and its B0/candidate dry runs, then the E7 G5 gate → S-candidate, then the speed amendment (brief in scratchpad) → F, then the OS-1 checklist.

## S1i — 2026-10-09 (host) — G1 Q-E map, G6 harness; PAUSED at owner request

- **Did:**
  - G1 Q-E private-copy map committed (ded41a04); boundaries + ownership 16/16.
  - G6 harness built (`E/live/`: build-candidate.mjs, isolated-launch-g6.cjs, live-run-g6.ps1, matrix-g6.mjs, assemble-live-qa.mjs, fixtures/ seeded with the exact A3 converted EPUB bytes; `paths.json → g6HarnessPaths`).
  - 13 launcher/assembler negative controls all refused before creating a profile. Among them: wrong root, existing profile, the A1 profile path, a one-byte-tampered B0 or candidate build, a candidate sha that isn't HEAD, and assembling into `E/live-qa.json`.
  - Candidate archive `C:\Projects\Blurby-artifacts\rms2-candidate-ded41a04cbf2\` (manifest sha 33207ad6…); `rms2-candidate-8e245345d7ff` is stale.
  - Complete runs, one harness revision before final:
    - B0 `%TEMP%\blurby-reader-mode-separation-2-g6-bzero20261009130207222`: epub 24/27, chapters 25/27. Matches g0 on every compared row.
    - Candidate `…-g6-cand20261009131533632`: epub 10/27, chapters 8/27.
  - Run `…-g6-bzerob20261009133534003` was INTERRUPTED: the host stopped its shell by mistake. It is not a result. Kept in place.
  - Live-profile SHA-256 re-verified unchanged after every launch (26481c13…/3e518dda…/342dd888…).
- **Learned (candidate findings; must be resolved before S is fixed):**
  1. **No visible cursor after a paused mode switch.** All 12 transitions and 4 same-mode cases have the correct index and stale 0, but `visibleCursorCount` is 0 after 3 s. B0 shows 1. Screenshot-confirmed: B0 highlights word 7 after Flow→Page and the candidate highlights nothing. This is a real G4/G6 regression; root-cause it before the G5 gate.
  2. Foliate paginator `TypeError: Cannot read properties of null (reading 'docBackground')` at mode switches: 23× on chapters, 5× on epub. Candidate only; likely the teardown of the old FoliateView racing the paginator. Investigate together with item 1.
  3. OBS-A3-1 (narrate→page lands on 0) is fixed on the candidate: lands on 7.
  4. Book transition fails on BOTH targets (B0 Narrate stops at book end). The EPUB section transition at 5480 misses on both. These are baseline behaviour, not regressions; rule them through mid-dispatch-decision, citing B0 evidence.
  5. `epub-converter.js` writes a random `dc:identifier` and zip timestamps, so re-conversion never matches g0's hashes. That is why the fixtures are seeded copies.
- **Decisions:** none new. Findings 1, 2 and 4 need decisions at resume.
- **Gate/DoD movement:** none. The harness is committed for review; it is not yet a gate.
- **Git:** eb/reader-mode-separation-2 @ (this commit); uncommitted: perf noise, Virtuoso/.recovery/.
- **Next (resume in order):**
  1. Root-cause and fix candidate findings 1 and 2 (shell/mode FoliateView mount after handoff), with a regression test.
  2. Re-run the final pair sequentially (port 5173):
     - `pwsh -File E\live\live-run-g6.ps1 -Target b0 -Label bzeroc -Fixtures epub,chapters`
     - `build-candidate.mjs` at the new HEAD
     - `-Target candidate -Candidate <HEAD> -Label candc`
     - then `assemble-live-qa.mjs --out=<scratch>`
  3. E7 G5 gate → record the S-candidate.
  4. Speed amendment. The brief is below because the session scratchpad is not durable.
  5. OS-1 owner checklist: heardAudio, the book-end ruling, removedCrossOwnerEffects.

<details><summary>Speed-amendment worker brief (verbatim copy of the scratchpad speed-brief.md)</summary>

- **Spec:** ROADMAP § READER-MODE-SEPARATION-2 "Mid-Dispatch Amendment — 2026-09-23 (speed dialog)" items 1–6; design §C rows S1–S5 and §E; staging memo fold-in 7 OC-6/7/8; LL-101.
- **S1 — declare `speedAmendmentPaths` in paths.json first.**
  - New: `src/components/ReaderSpeedDialog.tsx`, `tests/readerSpeedDialog.test.tsx`.
  - Modified:
    - `ReaderBottomBar.tsx`
    - `constants.ts`
    - `reader.css` (`.rbb-speed-*` only)
    - `kokoroRatePlan.ts`
    - `src/reader/modes/{focus,flow,narrate}/ModeRuntime.ts` (page only for OC-8)
    - `useReaderModeOrchestrator.ts`
    - `ReaderContainer.tsx` (freeze, owned)
    - `tests/readerModeControls.test.tsx`
    - `src/types.ts` only for the two optional fields
    - plus every test that greps the old Kokoro domain.
- **S2–S4 — values:**
  - Integer-index math only. Focus/Flow `i∈[0,88]`: label `((40+5i)/100).toFixed(2)+"x"`, WPM `(40+5i)*2.5`. Narrate `j∈[0,24]`: rate `(80+5j)/100`. `SPEED_DIALOG_REFERENCE_WPM = 250`.
  - Dialog (`ReaderSpeedDialog`): role=dialog, aria-modal, useFocusTrap, range over the index, aria-valuetext; Esc returns focus; open/close changes nothing.
  - Trigger: `rbb-speed-trigger` button only when `snapshot.speed !== null` (Page: none).
  - Persistence: Focus `focusWpm ?? wpm`, Flow `flowWpm ?? wpm`, Narrate `ttsRate` applied to its audio port. OC-8: Page ↑/↓ adjusts the key of `lastReadingMode`.
  - Kokoro UI 0.80–2.00 / 0.05; buckets stay [1.0, 1.2, 1.5]; `useNarration.ts` NOT edited.
- **Tests:**
  - 89/89/25 values; 1.05 reaches the fake audio port; keyboard path; no cross-mode key or state change; persisted value equals displayed value.
  - Every changed assertion goes in `test-migration.json → approvedSpeedDifferences[]`. No skips, no fixture edits.
- **Done when:**
  - `npm run typecheck`, the speed and control tests, G1–G4, and the audio invariants 48/48 all pass.
  - `npm test` 0 (KF-1 known), `npm run build` 0, `git diff --check` clean.
  - Changed paths ⊆ speedAmendmentPaths ∪ paths.json/test-migration.json.

</details>

## S1j — 2026-10-09 (host) — resumed after pause: S fixed, speed dialog built, F prepared

- **Did:**
  - Candidate regressions found by G6, fixed with red-then-green tests:
    - 15626073: arrival cursor painted after a paused switch; foliate close deferred one frame (docBackground errors).
    - d0c58af4: Flow releases its chunk visual state after apply (the stale `active-word`, two cursors).
  - Harness:
    - e814b21c: baseline-equal scoring (Decision #24).
    - c00559da: the rate case waits for the re-seed's first audio word.
    - d0c58af4: section sampling across the chunk boundary.
    - 14050199: frame/visibility probe; throttled cases are `invalid` (Decision #26).
  - S = d0c58af4 recorded in `verification.json → structuralCandidate`.
    - G5: typecheck 0, 3290/133, build 0, recorder 5/5 on B0, G1–G4 + audio 146/146.
    - G6 automated: fixthreea (26/27 + 26/27) vs bzeros.
  - Speed amendment built in a separate detached worktree while live runs used W, then applied: 966e3261.
    - Gate: typecheck 0, 3328 passed / 133 skipped, build 0, all 310 changed paths since I registered.
    - 89/89/25 values, OC-6/7/8, 26 approvedSpeedDifferences.
    - B0 check: ↑/↓ never re-paced a running engine (useReadingModeInstance.ts:97-176), so the candidate keeps that behaviour.
  - OS-1 checklist and observation template written; the BLOCKER(USER) is recorded.
- **Learned:**
  - B0 Narrate mode has no end-of-book handler (useFoliateSync.ts:198, useFlowScrollSync.ts:486). Only Flow crosses books, so the spec's "book transition" for Narrate is not baseline behaviour.
  - The harness reloads the renderer per case but not the main process. A hidden window can be throttled by Chromium for minutes, and that looks exactly like a broken narration pipeline.
  - B0 cleared Flow's chunk state only because `useNarration` returns a new object on every render, so a parent effect re-ran every commit. Parity required copying that accident deliberately.
  - Detached side worktrees with a `node_modules` junction let src work proceed while the launcher requires W clean.
- **Decisions:** #24–#27.
- **Gate/DoD movement:** S recorded; F code gated (D2–D6 automated parts green on 966e3261, to be re-run fresh at F1).
- **Git:** eb/reader-mode-separation-2 @ F (this commit); uncommitted afterwards by rule (Decision #27): live runs, live-qa.json, observation files, Evidence paste.
- **Next:** F automated live pair (after the harness worker finishes) → OS-1 → live-qa.json + validator → F1–F5.

## S1k — 2026-10-09 (host) — F′ fixes and automated G6 complete; waiting on OS-1

- **Did:**
  - F c282950f live runs exposed four issues:
    - the speed pile-up (fixed by the settle);
    - dropped dialog keys (fixed by the selected-index ref);
    - harness speed-capture contamination (now its own launch);
    - the EPUB section stall.
  - The section stall's root cause: a shared-scheduler underrun bug on B0 too, plus a candidate chunk-rebuild regression. Both fixed in F′ 9a171504 (Decision #28).
  - F′ gate: typecheck 0, 3342 / 133, build 0, recorder 5/5, 318 paths registered.
  - F′ live: every G6 case passes or is baseline-equal on EPUB and non-EPUB, with 0 stale effects. The speed dialog passes live (89/89/25, keyboard). Dry validator: only R6 ×26 and R7.
- **Learned:**
  - A 250 ms settle changes the harness's correct measurement point.
  - Rapid slider keys need a selected-index ref.
  - Every per-mode cache keyed on render version re-pays the work B0 did once per document.
  - A shared timer whose handle outlives its loop silently stops all word events after an underrun.
- **Decisions:** #28.
- **Gate/DoD movement:** D2–D6 and D8 values are green on F (automated). D1, D7 and the D8 observation wait on OS-1. F1 reruns everything fresh.
- **Git:** eb/reader-mode-separation-2 @ 9a171504 (F). Uncommitted by rule: state.md, journal.md.
- **Next:** the owner runs `os1-owner-checklist.md` and writes 'done' in the OS-1 BLOCKER → executor assembles live-qa.json, validator, F1–F5.

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/reader-mode-separation-2 @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->
