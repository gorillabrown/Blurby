##### Mid-Dispatch Amendment — 2026-10-30 (readiness)

- **Authority:** readiness revision for dispatch, 2026-10-30, under rule 6a (CLI executes, it does not investigate). The import and `narrateEngine.ts` resolutions below are Blurby.Brain1's ruling. Questions still open are tagged **[Brain]** at the end; the dispatch does not decide them.
- **Effect:** this block supersedes the rows it names. Everything else in the original specification stands, including the "What" and "Why" rows, ns6–ns9, the Constants row and Failure handling.
- **Read at:** `origin/main` @ `88e82ba5`, `origin/eb/narrate-sentence-initials-1` @ `c93f7c09`, `origin/eb/narrate-gap-pause-1` @ `e3498f60` and `origin/eb/play-first-text-1` @ `ebea7311`. The integration was built with `git merge-tree --write-tree` and plumbing only; no branch was checked out or written.

###### Superseded: Prerequisites and "Branch / baseline"

- **Base:** an integration commit built in merge-train order:
  1. `origin/main`;
  2. then `origin/eb/narrate-sentence-initials-1` @ `c93f7c09`. It contains NARRATE-SENTENCE-RESUME-1's tip `35716c5f` (ancestry checked);
  3. then `origin/eb/narrate-gap-pause-1` @ `e3498f60`. It contains NARRATE-QUIT-LINGER-1 `5de476ce` and NARRATE-PAUSE-CANCEL-1 `e1d0da2b` (ancestry checked).
- **Branch:** cut `eb/narrate-paused-click-1` from that commit. Push it as `git push origin HEAD:refs/heads/eb/narrate-paused-click-1`, with the explicit refspec, so the ref does not land under `EB/`. This replaces the pin `d8e44864`.
- **Merge-tree results at `origin/main` @ `88e82ba5`:**

  | Step | Result | Conflicts | Resolution |
  |---|---|---|---|
  | main + `c93f7c09` | exit 1 | `src/reader/modes/narrate/ModeRuntime.ts`, imports only (lines 68–72). `narrateEngine.ts` auto-merges. | Keep both lines: `import { logNarrateStartError } from "./helpers/logStartError";` then `import { sentenceStartAt } from "./engine/chunkPlan";`. Resolved tree `7e8a4a9a`. |
  | step 1 + `e3498f60` | exit 1 | (i) `src/reader/modes/narrate/engine/narrateEngine.ts` at 511–520; (ii) `docs/governance/BUG_REPORT.md`, the BUG-237 **Status** line only. `ModeRuntime.ts` auto-merges. | (i) Keep the sentence branches' `wordAt()` (doc line plus its 4-line body). Drop the stray doc line `/** Paused in a gap: resume from the first chunk not yet started, at its trim. */`, which no longer heads any method; the BUG-237 doc line above `nextScheduledPause()` stays. Both rules are Blurby.Brain1's. (ii) Keep `origin/main`'s line ("RESOLVED IN SOURCE 2026-10-30 … package-verified x64"); see **[Brain] Q3**. Resolved tree `40f74988`. |
  | integration + `ebea7311` (play-first-text) | exit 1 | `docs/governance/BUG_REPORT.md`, the BUG-236 **Status** line only. `ModeRuntime.ts`, `src/constants.ts` and `boundary-policy.json` auto-merge. | Docs only. Keep `origin/main`'s line. |

  No other conflict exists. If `origin/main` has moved past `88e82ba5`, re-run each step with `git merge-tree --write-tree --name-only` before merging. Stop and report any new conflict in a source or test file. A conflict confined to `docs/` is resolved by keeping `origin/main`'s text.
- **Check after building:** while `origin/main` is still `88e82ba5`, `git rev-parse HEAD^{tree}` on the integration commit is `40f74988b799605d4fcb264a3f8f5870a2aa300d`. A different tree means a resolution differs: stop.
- **Merge order:** this item merges after the whole Narrate stack: sentence-resume, sentence-initials, quit-linger, pause-cancel, gap-pause. If PLAY-FIRST-TEXT-1 (`origin/eb/play-first-text-1` @ `ebea7311`) lands on `main` first, merge `origin/main` into this branch again. Then add (ns10) and re-run Done-when 3 and 4 before the merge go. CHAPTER-STEP-CFI-1 is stopped and is not a dependency.

###### Superseded: "Edit sites" (re-cited at the integration tree, `ModeRuntime.ts` 805 lines)

- **Re-cited lines:**
  - `start()` 262–312. `clickedWord` at 290 exempts an explicit selection from the sentence rewind at 301; `consumeModeStartAnchor()` at 719–725 clears `explicitSelectionAnchor`.
  - `pause()` 314–320 and `resume()` 322–328.
  - `togglePlay()` 330–335 sends a paused engine with no failure to `resume()`.
  - `hardSelect()` 419ff. It sets `explicitSelectionAnchor` at 432; a click while paused only sets where Play starts (comment at 434).
  - `onEngineCursor()` clears the anchor at 676.
- **The edit, in `resume()` (322–328):** after the alive/engine/not-playing guard (323) and the engine-paused guard (324), add:

  ```ts
  if (this.state.explicitSelectionAnchor != null) { this.start({ cause: "play-button" }); return; }
  ```

  Otherwise keep `this.engine.resume()`. The `!= null` test honours word 0. `start()` consumes the anchor without a sentence rewind (`clickedWord`). `engineFor()` (625–627) returns the same engine, and `engine.play()` raises the epoch, so the paused generation is stale.
- **Line shifts:** when play-first-text is merged in, `pause()` moves to 335 and `resume()` to 346. Re-grep there.
- **Unchanged:** no engine change, timer, shared type or producer change. `narrateEngine.ts` is outside the fence: the integration only resolves it and it is never edited.

###### Superseded: Done-when 1–2 (the ns rows), Done-when 3 and the Tests row

- **Lagging fake (LL-173):** the rows below run on a test-local `LaggingOutput extends FakeAudioOutput`, defined in `tests/narrate/narrate.mode.test.ts` and passed through `open({ output })`.
  - It overrides `playbackPosition()` to return `this.now() - lag`, with `lag = 0.05` s, as in `narrate.gapPause.test.ts`'s `LatentOutput`. `harness/fakeAudioOutput.ts` is not edited.
  - (ns1), (ns2) and (ns5) run at that lag. (ns1) also runs once at lag 0, and that run is labelled a control, not proof.
- **(ns1)–(ns4)** stand as written, with one change to the red expectation.
  - On this base the wrong request is the sentence-resume word for the paused point, not literally 8. The fixture's breaks are `[6, 8, 17]`, so a pause at 8 resumes at that sentence's first word.
  - The rows assert the latest `narrate-request` word is 20 and the producer's text begins `w20`; that assertion is red on the base.
  - The rows must not pass on a snapshot that only reads 20.
- **(ns5)** keeps its hold/select/Play/release row as (ns5a) and adds two rows for pause-cancel's cancelled-rejection path:
  - **(ns5b) Rejection while paused.** Use a test-local `FakeProducer` subclass with `cancelQueued(prefix)`. It fails the held queued requests with `new Error("narrate generation cancelled")` (`NARRATE_CANCELLED_ERROR`).
    - Pause. The queued job rejects while the engine is paused. `onError` (engine 426–438) rewinds `nextWord` to that chunk's first word and calls `fill()`, which does nothing while paused.
    - Then hardSelect 20 and Play. The latest request is 20, no request is made at the rewound word, and no F4 failure appears.
  - **(ns5c) Rejection after the new start.** Hold the rejection until after select 20 and Play. The epoch guard drops it (`epoch !== this.epoch`): the new epoch's `nextWord` is unchanged, it schedules nothing, and there is no F4.
- **(ns10) Play-first-text cancel (once play-first-text is in the tree):**
  - Set-up:
    1. Play on a text section, then pause, so the engine exists and is paused.
    2. Show a zero-word section; use `tests/readerModes/harness/zeroWordBook.ts`.
    3. Call `start()`, so play-first-text's move begins and sets `explicitSelectionAnchor` to the first-text word.
    4. Call `pause()` before the move resolves, then `togglePlay()`.
  - Assert:
    - `exportHandoff("persistent").explicitSelectionAnchor` is `null` after the pause;
    - the new `resume()` branch makes no `narrate-request` at the first-text word: the no-selection path runs, under (ns6)'s sentence policy.
  - **Positive control (standing rule 55):** the same sequence without the pause requests the first-text word first, which proves the detector can see that request.
  - This row is red against play-first-text's `pause()` as written: it clears `firstTextToken` but not the anchor (`ebea7311`, `ModeRuntime.ts` 327–329 and 762–763; at the integration with play-first-text merged in, 335–337 and 770). See **[Brain] Q1**.
- **Done-when 3 (replaces the command):**

  ```
  npx vitest run tests/narrate/narrate.mode.test.ts tests/narrate/narrate.engine.test.ts tests/narrate/narrate.crossings.test.ts tests/narrate/narrate.trace.test.ts tests/narrate/narrate.gapPause.test.ts tests/narrate/narrate.pauseCancel.test.ts tests/narrate/narrate.startStack.test.ts tests/readerModes/narrate.contract.test.ts
  ```

  It exits 0. Once play-first-text is in the tree, add `tests/narrate/narrate.playFirstText.test.ts`. Engine timing and fail-closed table validation are kept.

###### Superseded: Done-when 4 (the package check)

- **Local gates:** `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr.
- **Rule 53, under ROADMAP standing rule 53's "Temporary placement" note:**
  - (a) build `--dir --x64` and `--dir --arm64` on RodneySr from the final commit, with `origin/main` merged in before the build. Across the pair, `dist/`, `main/`, `main.js`, `preload.js` and `package.json` are byte-identical; arch-specific native-module entries may differ. Record each `app.asar`'s SHA-256.
  - (b) grep the built `main.js` for `BLURBY_USER_DATA_DIR`. Launch the x64 package on a fresh scratch profile on RodneySr for 25 s: no error, unhandled-rejection or crash line, and no crash dump. The two live files hash the same before and after.
  - (c) `npx asar list` shows every changed `main/` file the integration brings: `main/ipc/narrate.js`, `main/narrate/constants.js`, `main/narrate/producer.js` and `main/quit-sequence.js`. The renderer bundle matches `dist/`.
  - (d) the automated package trace, on the x64 package (next bullet).
  - The arm64 launch runs at merge (R-2026-10-30-2). Until then the item reads "package-verified (x64, RodneySr); arm64 launch at merge".
- **(d) automated package trace.** A probe script kept in the artifacts folder, never in the tree, drives the x64 `release\win-unpacked\Blurby.exe` on a scratch profile with *Meditations*. It records the eval trace's `narrate-request` word and the first `word` trace with source `audio` after each Play:
  1. pause, click a word in a later sentence, Play: the request word and the first cursor word are the clicked word;
  2. click the first text section's word 0;
  3. two paused clicks: the last one wins;
  4. an ordinary resume with no click: the sentence-start word, unchanged.
  - Words are matched by text under the app's Electron numbering (LL-160, LL-161).
  - Outputs go to `C:\Projects\Blurby-artifacts\narrate-paused-click-1\package-trace\`.
  - F7 and F8 are not accepted by these checks.
- **Deferred:** the owner's heard check (the clicked word is heard first after pause/click/Play, with zero, two and no selections) goes on release gate (2)'s batched list. It is not run per item.

###### Added: Host, inputs and execution

- **Host:** RodneySr, for now (GoG bandwidth, 2026-10-30). Use a new worktree from `C:\Projects\bq-main`. Never touch its detached `36ac7466`, its `stash@{0}` or the RUN 4 evidence.
- **Inputs:**
  - the pushed `eb/narrate-paused-click-1` base above, then `npm ci`;
  - artifacts under `C:\Projects\Blurby-artifacts\narrate-paused-click-1\`;
  - the probe's `--exe` is the x64 `release\win-unpacked\Blurby.exe` in that worktree.
  - Confirm that RodneySr can fetch and push `origin` and has Node/npm before launch.
- **Hold:** build and hold. There is no merge without Blurby.Roadmap's go after Blurby.Brain's package confirmation.
- **Execution:** the Virtuoso plugin protocol, as written in CLAUDE.md and the project's Virtuoso overlays. No local agent is named here.
- **Fence:** unchanged: `ModeRuntime.ts` and `tests/narrate/narrate.mode.test.ts`, plus this item's memo, time log and BUG_REPORT subcase. The integration commit's own merge resolutions are part of the base, not of this item's diff.
- **Staging (LL-172):** stage exact paths only, and diff `git status --porcelain` against the staging plan before every commit.

###### Superseded: Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | The integration base is built in merge-train order with the ruled resolutions, its tree is checked, and `eb/narrate-paused-click-1` is pushed | calculable | integration-merge | mechanical | low | 10m | — | — |
| 2 | Production-path regression controls (ns1–ns10, lagging fake) are red on the base for the request mismatch and green for accepted behaviour | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 3 | `resume()` starts at a paused explicit selection and leaves ordinary resume unchanged | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 4 | Local gates, independent review and the rule 53 x64/arm64 pair with the automated package trace are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 28m · sum 28m; 3 of 4 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; row 1 = 2 merges × 5m). Timing to be priced at dispatch: `timing` was not run for this revision (LL-172).

###### Lessons applied (amendment 2026-10-30; adds to the original section)

- **LL-169:** two guards stay separate. The engine epoch decides whether an operation is current: a paused generation, or a cancelled rejection arriving after the new start, never schedules (ns5a–ns5c). The retained engine and output are a separate resource lifetime: they are reused, not torn down, by the `resume()` branch.
- **LL-173:** every timing-sensitive row runs on a fake whose heard position lags its scheduling head. A row run at zero lag is labelled a control.
- **Standing rule 55** (the promoted null-verdict lesson; cited by its rule): the (ns10) negative carries a positive control, and its detector reads the trace's request word, not snapshot state.
- **Standing rule 53** (package verification; cited by its rule) as above, under the temporary placement.
- **LL-172:** no `timing` call in this revision; exact-path staging.
- **Reviewed, not applicable:** LL-168 (no install test), LL-170 (no grouping or stamping change), LL-171 (no register sequence), LL-174 (no callback is widened; `start()`'s signature is unchanged). 120 live lessons were reviewed.

###### Open questions

- **[Brain] Q1:** play-first-text's `pause()` clears `firstTextToken` but leaves the `explicitSelectionAnchor` (and `resumeAnchor`) that `startAtFirstText()` set (`ebea7311`, 762–763). With the new `resume()` branch, a later Play after that cancel starts at the first-text word, and (ns10) is red.
  - Should this item, once play-first-text is merged in, also clear `explicitSelectionAnchor` in `pause()` when `firstTextToken` was non-null? That is inside this fence (`ModeRuntime.ts`).
  - Or should play-first-text carry the fix?
  - Note that in the real UI the cancel is reached through `runtime.pause()` callers; a second Space during the move goes to `togglePlay()`, not `pause()`.
- **[Brain] Q2:** if this item merges before play-first-text, (ns10) cannot run here. Does play-first-text's re-merge carry (ns10) and a fresh rule 53 check?
- **[Brain] Q3:** keep `origin/main`'s BUG-237 status line in the step 2 docs conflict, and its BUG-236 line in the play-first-text re-merge? This revision proposes yes.
