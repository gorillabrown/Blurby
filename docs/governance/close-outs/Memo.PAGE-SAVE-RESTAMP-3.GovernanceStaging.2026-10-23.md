# Dispatch Close-Out Governance Staging — PAGE-SAVE-RESTAMP-3 (Wave A)

Wave A of PAGE-SAVE-RESTAMP-3 (rare page-save edge cases after the restamp guard) is built and held for the Stage 8
freeze on `eb/page-save-restamp-3` (tip `88c1dae7`). Waves B and C are not built: B waits on JUMP-LANDING-SAVE-1, and
C was mostly absorbed by KEEP-FURTHEST-FIX-1 (`36ac7466`). This file stages the governance changes for the close-out.

## Run record

- **Base, stacked (decision, tier 1).** The spec requires TOC-JUMP-SAVE-1 and PAGE-HELD-TURN-FAIL-1 merged first (same
  file). Both are built and held, not merged, so the branch is cut from the held chain tip `7ca5a4b7`
  (`origin/eb/page-held-turn-fail-1`, which contains TOC-JUMP-SAVE-1 `db03f2f5`), with `origin/main` `31883386` merged
  in (`2fd83f12`, clean merge). No other unmerged branch touches the three edit sites.
- **Register:** Notion Seq 80 moved Queued → In Flight, Started 2026-10-23 (recovery
  `20261023T205110Z-external-set-status-PAGE-SAVE-RESTAMP-3`, confirmed by read-back).
- **Base gates on `2fd83f12`:** `npm test` 181 files, 2,457 passed / 1 skipped / 0 failed; `npm run typecheck` exit 0;
  `npm run build` exit 0.
- **Commits:** `c9b10127` (A-1 red tests), `5755124b` (A1, A2, A4, test hc1), `28f8c634` ((pn4) made non-vacuous),
  `88c1dae7` (review notes N1–N3, comments only).
- **Tip gates on `88c1dae7`:** `npm test` 181 files, 2,462 passed / 1 skipped / 0 failed (base + 5 new tests);
  `npm run typecheck` exit 0; `npm run build` exit 0. Pushed to `origin/eb/page-save-restamp-3`.

## Done-when, Wave A

| Row | Result | Evidence |
|---|---|---|
| A-1 positive control | PASS | `c9b10127`: `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exit 1, 2 failed / 46 passed. (pr1): Word0–Word99 carry the book's numbers, Word100–Word159 keep provisional ones (expected 120, received 100 … expected 179, received 159): 60 of 160. (pc1): `expected [ [ 'doc-1', -1, 'cfi:3:beta' ] ] to deeply equal [ [ 'doc-1', -1, 'cfi:3:beta' ], …(1) ]`. (pn4) and (fr1n) pass. |
| A-2 tests | PASS | (pr1), (pc1), (pn4), (fr1n), (hc1) in `describe("PAGE-SAVE-RESTAMP-3")`; additions only, no existing expectation changed. 160 paragraphs sufficed (no 400 fallback). |
| A-3 mutation controls | PASS after a fix | First run: deleting the open-without-cfi cancel left (pn4) green. Cause: the test's `init` stub and its `loadSection` used two different `rawDoc()` documents, so the held turn was never replayed (vacuous pin). Fixed in `28f8c634` (one shared document). Re-run: (pn4) fails with `expected [ { …(2) } ] to deeply equal []`, the save `["doc-1", 2, "cfi:0:gamma"]` (the spec's prediction). Making fr1's guard `if (true)` fails (fr1n): `expected 21 to be 4`. Both reverted in the working tree; `git diff --stat -- src/` empty after each. |
| A-4 | PASS | `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/foliate-bridge.test.ts` exit 0, 55/55. |
| A-5 greps | PASS (spec count corrected) | `sectionWrapsRef`: 3 lines (declaration `:318`, the load's set `:672`, the re-stamp's get `:1111`). The spec's "exactly 4" is wrong for its own prescribed code: the load awaits the local `wrap`, so its await line does not name the ref (Solon). `wordOffsetInSection >= 0)) return false`: exit 1. `kind=click`: one line, inside `holdWordClick`. |
| A-6 live check | PASS (pass condition amended) | See below. |
| A-7 | PASS | Tip gates above (rules 47, 48), on this machine. |
| A-8 fence | PASS | `git diff --name-status 2fd83f12 88c1dae7` lists `M src/reader/modes/page/FoliateView.tsx`, `M src/reader/modes/page/ModeRuntime.ts`, `M tests/readerModes/pagePositionSave.test.tsx`, plus this memo and `Timing.PAGE-SAVE-RESTAMP-3.jsonl`. |

### A-6 live check

- Builds: control `c9b10127` (unfixed) and fixed `88c1dae7`, each `npx electron-builder --win --x64 --dir --publish never`,
  run from a copy of `release\win-unpacked`. Fresh scratch profile per run.
- LL-165: launched with `BLURBY_USER_DATA_DIR` and `--user-data-dir`; `app.getPath('userData')` read over the main
  inspector equalled the scratch profile before the first action, every run. Live profile hashes unchanged in every
  run: `library.json` `d4b884bd…cffbdf6`, `settings.json` `2e1d5245…7f2d2e`.
- PAGE-SAVE-RESTAMP-2's main hook (with `process.mainModule.require`), mode `reject`. The book opens on its cover
  (no spans), so the driver presses the app's Next page once after the rejection, then clicks word 3 ("eBook"), waits
  1.5 s, clicks word 63 ("you"), waits 1.5 s, then `app.quit()`.
- **Finding: the spec's pass condition did not discriminate.** On the control build the FIRST click after a known
  failure is lost (its report reaches `onHeldClickSave` while `heldClickAnchor` is still null), and the second click
  saves through the anchor the first click left behind. So "library.json's cfi is the second click's" holds on both
  builds. Amended condition (tier 1, measurement design): (a) both clicks produce a save, in order, each with its own
  span's cfi, position -1; (b) library.json's cfi is the second click's and its position is unchanged.
- Control (`record-control-3`, repeated as `record-control-4`): (a) FAILS, click 1 has no save; (b) holds.
- Fixed (`record-fixed-1`): (a) MET, click 1 saved `epubcfi(/6/4!/4/2[pg-header]/2[pg-header-heading],/8,/8)`, then
  click 2 saved `epubcfi(/6/4!/4/2[pg-header]/4,/118,/118)`, both position -1; (b) MET, library.json position 0 (=
  $before), cfi = click 2's.
- Driver and records: the session group's notes folder, `page-save-restamp-3\` (`driver.mjs`,
  `record-control-1..4.json`, `record-fixed-1.json`). Not committed.
- **Risk found:** with the driver attached (CDP plus `--inspect`), `app.quit()` never exited within 20 s on either
  build, so the app was killed every run. library.json was already written by the normal delayed save 1.5 s after
  click 2, so the click saves are proven, but the quit flush is not. It does not separate the builds. It may be the
  inspector or NARRATE-QUIT-LINGER-1's class (quit reliability); it needs its own look.
- Owner smoke deferred to the batched release gate (2) list.

## Review findings and dispositions

- **Solon (spec compliance): APPROVED,** 9 of 9; one spec error (the A-5 count).
- **Plato (quality): MINOR_FIXES, no critical.**
  - W1 (two back-to-back re-stamp runs could interleave; the re-stamp's own wrap is not registered and there is no
    `cancelled` check after the wait): a red test (rw1) with two and then three immediate `bookWordSections`
    identities stayed green on the current code, so it is not reachable in the harness. No behaviour change without a
    red test (rule 43). **Follow-up.**
  - W2 (`sectionStart` computed before the wait, `sectionWords` after it): no reproduction attempted, same rule.
    **Follow-up**, folded with W1.
  - N1–N3: comments fixed in `88c1dae7`. N3's helper for the three `page-turn-lost` strings was not done (style only).
  - N4 noted: (hc1)'s regression guard is the private-field assertion; A4 has no behavioural effect to assert.

## Target: ROADMAP.md

### Fold-in 1 — Wave A built and held
Section: §PAGE-SAVE-RESTAMP-3, the Wave A bullet list
Action: Insert after
Content:
- **Wave A built and held (2026-10-23):** `eb/page-save-restamp-3` @ `88c1dae7`, stacked on PAGE-HELD-TURN-FAIL-1's tip `7ca5a4b7` plus `main` `31883386`. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → this branch. Evidence: `docs/governance/close-outs/Memo.PAGE-SAVE-RESTAMP-3.GovernanceStaging.2026-10-23.md`.

### Fold-in 2 — A-5's count
Section: §PAGE-SAVE-RESTAMP-3, Done-when A-5
Action: Replace
Old: prints exactly 4 lines: the declaration, the set, and the await in the load, plus the await in the re-stamp.
New: prints exactly 3 lines: the declaration, the load's set, and the re-stamp's await.

### Fold-in 3 — A-6's pass condition
Section: §PAGE-SAVE-RESTAMP-3, Done-when A-6
Action: Replace
Old: `library.json`'s `cfi` for the book is the second click's cfi, and its `position` is unchanged from before the open.
New: both clicks produce an `update-doc-progress` save, in order, each with its own span's cfi and position -1, and `library.json`'s `cfi` is the second click's, with `position` unchanged from before the open. (On the unfixed build the first click's save is missing; the second click's alone does not discriminate.) Fresh profiles open on the cover, so turn one page before clicking.

### Fold-in 4 — Wave C re-scope note
Section: §PAGE-SAVE-RESTAMP-3, the Wave C bullet
Action: Insert after
Content:
- **KEEP-FURTHEST-FIX-1 landed (`36ac7466`).** It added `noteHighWater` and `furthestCfiRef`, and Keep at furthest sends the furthest page's cfi. Left for Wave C: Page turns still do not call `recordPages` (the pages-read count), and `furthestCfi` lives only on the in-memory `activeDoc`, not in `library.json`. The next roadmap review re-scopes Wave C (its C-2 tests and C-5 fence assume the pre-fix code).

### Fold-in 5 — follow-up stub for the review's W1 and W2
Section: the stubs after PAGE-SAVE-RESTAMP-3
Action: Insert after
Content:
- **RESTAMP-RERUN-RACE-1 — Two re-stamp runs in a row on one section document** *(stub; not a release gate)*. From PAGE-SAVE-RESTAMP-3's quality review (W1, W2): the re-stamp effect does not register its own wrap in `sectionWrapsRef` and does not check `cancelled` after waiting, so a second `bookWordSections` identity during the first run's yielding wrap could unwrap mid-wrap; it also computes `sectionStart` before the wait and `sectionWords` after it. Not reproduced in the harness (two and three immediate renders green). Find a reachable trigger first (does `bookWordSections` ever change identity twice in a session?); fix only with a red test. Lane: Reader Engine.

## Target: docs/governance/LESSONS_LEARNED.md

Lesson numbers below are provisional placeholders; reassign at fold-in against the catalog tip.

### Fold-in 6 — lesson candidate (LL-NEW-a)
Action: Append
Content:
### LL-NEW-a — A live pass condition must fail on the control build, not only pass on the fixed one (PAGE-SAVE-RESTAMP-3, 2026-10-23)
**Verdict:** A-6 said the fix is proven when library.json holds the second click's cfi. On the unfixed build it already did: the first click's save is the one lost, and the second saves through the anchor the first left. The control run, made before the fixed run, caught it.
**Evidence:** this memo, A-6 (`record-control-3`, `record-control-4`, `record-fixed-1`).
**Recommendation:** Run every live check on the unfixed build first and require its pass condition to fail there; state the condition per action (each click saved, in order), not only as the end state.
**Applies to:** live checks and CDP drivers for save, position and persistence fixes.
**Status:** Observation
Related: LL-151, standing rule 43.

### Fold-in 7 — lesson candidate (LL-NEW-b)
Action: Append
Content:
### LL-NEW-b — A pin whose fixture builds two objects where the code needs one passes vacuously (PAGE-SAVE-RESTAMP-3, 2026-10-23)
**Verdict:** (pn4) built its held turn on one `rawDoc()` document and loaded another, so the replay it pinned could never run; it stayed green with the guarded line deleted. Only the mutation control showed it.
**Evidence:** this memo, A-3; fix `28f8c634`.
**Recommendation:** Every pin gets its mutation control run before it is counted. In fixture code, create a shared object once and pass it, never call a factory twice for "the same" object.
**Applies to:** pin tests in `tests/readerModes/` and anywhere fixtures are built by factory helpers.
**Status:** Observation
Related: LL-151, LL-138.

## Target: CLAUDE.md

### Fold-in 8 — queue line
Section: §Current operational state, Queue
Action: Replace (at close-out, by the planner)
Content: record PAGE-SAVE-RESTAMP-3 Wave A as built and held (`88c1dae7`, stacked after PAGE-HELD-TURN-FAIL-1), Wave B waiting on JUMP-LANDING-SAVE-1, Wave C for re-scoping.

## Lessons

- **Applied:** standing rule 43 / LL-138 (red first: `c9b10127` before `5755124b`; pins with mutation controls);
  rule 44 / LL-143 (every gate run in `pwsh` with exact exit codes; A-5's count error found by running it); rule 36
  (every cited line re-grepped: the cancel moved `:864` → `:874`, the link cancel `:795` → `:799`); LL-151 (the live
  check ran the control build first, which found the non-discriminating condition); LL-165 (profile read-back before
  every driver action, live hashes unchanged); rules 47, 48 (full suite, typecheck and build on this machine); LL-136
  (the fence lists the time log).
- **Added:** LL-NEW-a and LL-NEW-b (candidates above).
