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

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/reader-mode-separation-2 @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->
