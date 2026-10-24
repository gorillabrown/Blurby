<a id="restamp-rerun-race-1-spec"></a>

#### RESTAMP-RERUN-RACE-1 — Two re-stamp runs in a row on one section document: reproduce first, then fix or close as not reachable *(position 98 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on `eb/jump-landing-save-1` @ `8a7c9db6`; build-and-hold under the Stage 8 freeze; not a release gate)*

- **What:** in Page mode (PageFoliateView), find out whether the re-stamp effect, which renumbers a section's word spans when the book's word list arrives (`bookWordSections`), can run twice on one section document at the same time. Do this with a deterministic test harness, before any code change. Then do one of two things:
  - **(A) Red found on a reachable trigger:** fix W1 and W2, with the red test committed first.
  - **(B) No reachable red:** close the item as "not reachable". Commit the harness as green guard tests, the evidence file, and a guard comment at the effect. Make no behaviour change (standing rule 43).
- **Why:**
  - **Source.** PAGE-SAVE-RESTAMP-3's quality review (Plato) raised two findings. Memo: `docs/governance/close-outs/Memo.PAGE-SAVE-RESTAMP-3.GovernanceStaging.2026-10-23.md` on `origin/eb/page-save-restamp-3` @ `c3510303`, lines 66–71.
    - **W1:** the re-stamp's own wrap is not registered in `sectionWrapsRef`, and nothing checks `cancelled` after the wait. A second `bookWordSections` identity that arrives during the first run's yielding wrap could unwrap the section halfway through that wrap.
    - **W2:** `sectionStart` is computed before the wait, but `sectionWords` after it.
  - **The code at the base** (`src/reader/modes/page/FoliateView.tsx` @ `8a7c9db6`):
    - The effect is at `:1102-1130`, and its dependencies are `[bookWordSections, invalidateWordPositionIndex, scheduleWordPositionIndexRebuild]` (`:1130`).
    - In order, it computes `sectionStart` (`:1111`), awaits only the load's wrap (`:1113`), unwraps (`:1114`), reads `sectionWords` (`:1115`), and then awaits an unregistered `wrapWordsInSpans` (`:1117`).
    - It deletes the document from `rendererNumberedDocsRef` even after cancellation (`:1119`). `cancelled` gates only `reportHeldTurnRef` (`:1120`) and the index rebuild (`:1122`).
    - The load path registers its wrap (`:671-673`) in `sectionWrapsRef` (`:318`).
  - **Why the earlier red test (rw1) stayed green.** rw1 was never committed: `git grep rw1 -- tests` is empty at the base. Two things in the code explain the green result:
    - The wrap yields only every `WRAP_BATCH_SIZE` = 50 block groups (`src/reader/modes/page/helpers/foliateWordWrapping.ts:11`, `:143-144`). A section with 50 groups or fewer never yields, so the two runs cannot interleave.
    - When the data is the same, two interleaved runs converge. A run skips a text node whose `parentNode` is already gone (`foliateWordWrapping.ts:133`), so whichever run wraps a node first wins, and both stamp the same numbers.

    So a red result needs a section with more than 50 groups, a second run that starts while the first is parked at a yield, and a detector that can see the difference.
  - **The planner's static census** (this review traced it; the run measures it in Task 1, LL-142):
    - **The section data is fixed for each document.** Book words are set once per document id: the extraction is deduplicated at `src/components/ReaderContainer.tsx:291`, and `setBookWordsState` (`:293`) is its only writer.
    - **Only the identity can change.** Each new document snapshot is a deep copy (`src/reader/document/ReaderDocumentSnapshot.ts:112`, `:169-170`). Page adopts a snapshot only when the document port emits one (`src/reader/modes/page/ModeRuntime.ts:215-223`), and the shell emits only when book words change (`ReaderContainer.tsx:519-523`). The view reads `document.bookWords?.sections` (`src/reader/modes/page/useModeBindings.ts:36`).
    - **StrictMode** (`src/main.tsx:22`) runs effects twice in development, but only at mount. At that point `getContents()` is still empty, because the view opens in another effect. So the loop does nothing.
    - **W2's only path** is a rendered section missing from `bookWordSections`, because a section that is present takes its start from the book (`src/reader/modes/page/helpers/foliateWordOffsets.ts:48-49`). The extractor leaves a section out only when it has no words, a duplicate href or no zip entry (`main/epub-word-extractor.js:223-228`, `:271`).

    The census therefore predicts outcome (B). The harness decides.
- **Prerequisites:** JUMP-LANDING-SAVE-1 (built and held at `8a7c9db6`, stacked on PAGE-SAVE-RESTAMP-3 `c3510303`). This item stacks on it.
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Identity census, measured (LL-142).**
     - Add **(rc0)** to `tests/readerModes/pagePositionSave.test.tsx`. Drive the real Page runtime and document port, as test (w) does at `:492`, through `usePageModeBindings` in a small host component that records each distinct `bookWordSections` identity the view receives.
     - The actions: book words arrive; then a settings change, a page turn, a `renderVersion` bump, and a second port emission with the same book words.
     - **(rc0)** asserts the number of non-empty identities the view receives while it has contents. The test is committed green, whatever the count, with the measured count in it.
     - Write the census table to `docs/studies/investigations/RESTAMP-RERUN-RACE-1.repro.2026-MM-DD.md`. It has one row per identity source listed under Why, each with its file:line (re-grepped at the base, standing rule 36) and the measured count. Add a row for each source the run finds that is not listed there.
  2. **Reproduction harness on the base, no code change.** Add a `describe("RESTAMP-RERUN-RACE-1")` block to the same test file. It reuses `mount`, `render`, `settle` and `loadSection`. Add an optional second parameter `{ strict?: boolean }` to `mount`, which wraps the element in `React.StrictMode`; existing calls stay unchanged.
     - **Fixture.** One section document, index 3, with 160 `<p>Word{i}</p>` blocks, so 3 yields. The canonical words are `Word0..Word159`. Section set S1 = `[{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 180, wordCount: 160 }]`.
     - **Sequence (rr1, W1, same data, new identity):**
       1. `mount()`. Set `renderer.contents = [{ doc, index: 3 }]`, dispatch `load`, then `settle()`. The load's wrap has finished, and the spans carry the renderer's numbering.
       2. `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })`.
       3. `render({ bookWordSections: S1, getCanonicalSectionWords })`. Run 1 is now parked at its first yield.
       4. **Window check (k1):** `doc.querySelectorAll("span.page-word").length === 50`. If k1 fails, the harness is not interleaving. That is a harness failure (see Failure handling), not a "not reachable" verdict.
       5. `render({ bookWordSections: structuredClone(S1) })`, a new identity with the same data. This cancels run 1, and run 2 starts.
       6. Drain inside `act`: `vi.runAllTimersAsync()`, then `vi.useRealTimers()` and `settle()`.
     - **(rr2, sensitivity control):** the same sequence, but the second set has `startWordIdx: 40`, so the data differs. This only proves the detector can see an interleave. It is not counted toward the decision unless the census in step 1 shows the data can change within a mount.
     - **(rr3, held turn):** the same as rr1, with a page turn held on the document before step 3. Oracle o5 applies.
     - **(rr4, W2):** a rendered section that is missing from the section set (index 1, 160 blocks, no canonical words), with its load's wrap still yielding when the set arrives. A lower section (index 0, 5 words, listed first in `contents`) loads during the wait, so the loaded-slice offsets move.
     - **(rr5, StrictMode):** `mount(…, { strict: true })` with S1 already set at mount, then load the section. This proves the double run at mount does not touch spans: after the load, the spans equal the book's numbering, and the count is 160.
     - **Oracles, read from DOM and runtime state, not screenshots (LL-166):**
       - o1: the number of spans equals the number of words (160);
       - o2: no `span.page-word span.page-word` (no nested spans);
       - o3: in document order, `data-word-index` and text equal the book's (`20 + i`, `Word{i}`);
       - o4: no `data-word-index` appears twice;
       - o5: the held turn is saved exactly once, with its re-stamped index, and there is no `page-turn-lost` diagnostic;
       - o6: the last `word-position-index-build` diagnostic reports `duplicates=0`;
       - o7 (rr4): section 1's first span index equals `getSectionGlobalOffset(1, <words at the time it wraps>, S)`, and its spans do not overlap section 0's.
     - Record each case's result for each oracle on the base in the evidence file, with the failing output verbatim. Keep any evidence script under a `.txt` name (standing rule 52).
  3. **Decision rule** (record which branch was taken, and why, in the evidence file and the memo):
     - **(A) Fix.** Take this branch if rr1, rr3 or rr5 is red, or if rr4 is red and the census shows that a rendered section with words can be missing from `bookWordSections`, or if rr2 is red and the census shows the section data can change within a mount.
       - Commit the red cases alone first (standing rule 43), with their failing output.
       - Then change only the effect at `FoliateView.tsx:1102-1130`:
         - after the wait at `:1113`, `if (cancelled) return;`;
         - move the `sectionStart` computation (`:1111`) after the wait, keeping its `< 0` skip (W2);
         - register the re-stamp's own wrap: `const rewrap = wrapWordsInSpans(…); sectionWrapsRef.current.set(doc, rewrap); await rewrap;`;
         - after that await, `if (cancelled) return;`, placed before `rendererNumberedDocsRef.current.delete(doc)` (`:1119`).
       - The red cases turn green, and every existing test in the file stays green and unedited.
     - **(B) Not reachable.** Take this branch otherwise.
       - Commit rc0 and rr1–rr5 as green guard tests. rr2 is committed only if it is green; a red rr2 is recorded in the evidence file only, never committed red or skipped.
       - Add one guard comment block above `FoliateView.tsx:1102`. It states:
         - the section data is fixed per document (`ReaderContainer.tsx:291`), and a new identity carries the same data;
         - two runs with the same data converge (`foliateWordWrapping.ts:133`);
         - StrictMode's double run happens at mount, with no contents;
         - this item and its evidence file are the reference;
         - "if `bookWordSections` can change data within a mount, register this wrap in `sectionWrapsRef` and check `cancelled` after each await".
       - No other line of `src/` changes.
  4. **Tests.** `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes` passes. Every PAGE-SAVE-RESTAMP-2/-3, TOC-JUMP-SAVE-1 and JUMP-LANDING-SAVE-1 test is green and unedited, or named under standing rule 50.
  5. `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  6. **Fence:** `git diff --name-status <merge-base after origin/main merged>` lists exactly the following (standing rule 41):
     - `M src/reader/modes/page/FoliateView.tsx` (in branch B, comment lines only; show it with `git diff -U0`);
     - `M tests/readerModes/pagePositionSave.test.tsx`;
     - `A docs/studies/investigations/RESTAMP-RERUN-RACE-1.repro.2026-MM-DD.md`;
     - the staging memo and the time log.

     Nothing in `main/`, the shared-core freeze set, or Flow, Focus or Narrate.
  7. **Package verification (standing rule 53, both branches), checked by Blurby.Brain.**
     - Build `npx electron-builder --win --dir --arm64` from the final commit with `origin/main` merged in, in this worktree.
     - Grep `main.js` for `BLURBY_USER_DATA_DIR`.
     - Launch natively on arm64 on a fresh scratch profile, proved before the first input (LL-165), for 25 s with no error line and no crash dump.
     - `npx asar list`, and check that the bundle matches `dist/`.
     - Write the results to a "Package verification" section of the memo. Push and hold until Brain confirms.
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; Blurby.Brain for the rule 53 check. There is no owner smoke: the effect has no user-visible behaviour in a packaged build.
- **Source:** PAGE-SAVE-RESTAMP-3 quality review W1 and W2 (memo above, lines 66–71); roadmap review 2026-10-23-4 stub (fold-in 5); roadmap review 2026-10-23-5.
- **Path:** dispatch.
- **Decision tier:** technical (CLAUDE.md Rule 11, tier 1), decided by the planner. Neither branch changes anything a reader sees in a packaged build. **Owner questions:** none.

##### Implementation detail
- **Edit sites** (verified at `8a7c9db6`; re-grep at the merged base, standing rule 36):

  ```
  git grep -n -E "sectionWrapsRef|restampVisibleSections|await wrapWordsInSpans|unwrapWordSpans\(doc\)" -- src/reader/modes/page/FoliateView.tsx
  git grep -n -E "WRAP_BATCH_SIZE|if \(!parent\)" -- src/reader/modes/page/helpers/foliateWordWrapping.ts
  git grep -n -E "extractedBookWordsRef.current\?.docId === docId|setBookWordsState\(" -- src/components/ReaderContainer.tsx
  ```

  - `src/reader/modes/page/FoliateView.tsx:1102-1130`: the re-stamp effect. This is the only `src/` edit site (code in branch A, a comment in branch B).
  - `:318` `sectionWrapsRef`, and `:671-673` the load's registered wrap: read only, unless branch A registers the re-stamp's wrap there.
  - `tests/readerModes/pagePositionSave.test.tsx`: `mount` (`:132`; an optional `strict` parameter added), the new `describe` block after `JUMP-LANDING-SAVE-1` (`:807`).
- **Tests:** rc0 and rr1–rr5 in the existing file. In branch A, the red subset is committed alone first.
- **Constants:** none. `WRAP_BATCH_SIZE` is read, not changed.
- **Branch:** `eb/restamp-rerun-race-1`, cut from `origin/eb/jump-landing-save-1` @ `8a7c9db6`, with `origin/main` (`d2a70ff1` at authoring) merged in. A trial `git merge-tree --write-tree` at authoring was clean. Push with `git push origin HEAD:refs/heads/eb/restamp-rerun-race-1`; never merge (Stage 8 freeze). Merge order after the release: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → JUMP-LANDING-SAVE-1 → this branch.
- **Staging plan:** explicit paths only. `tests/perf-baseline-results.json` and the Timing backfills stay unstaged.
- **Failure handling:**
  - **k1 cannot be made to hold.** If fake timers do not park run 1 at its first yield, because `act` does not flush the microtasks or React's scheduler needs a real timer, try two things: fake only `setTimeout` after `mount`, and if that fails, use a `vi.spyOn(globalThis, "setTimeout")` that holds callbacks of 0 ms in a queue the test releases. If neither holds within the timebox, stop and file an issue with the attempts. Do not declare "not reachable" without a working window check.
  - **Branch A's `cancelled` return leaves a document unrenumbered** when the next dependency set is empty (`:1103` returns early): a test must cover it, or the stop reason must name it. Within a mount, this happens only on a document switch, which remounts the view (dependencies `:1093`).
  - **Branch A turns an existing test red:** stop and name it (standing rule 50).
  - Rollback: `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Lane:** Reader Engine. Execution surface A. Page mode only; no sibling-mode imports.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Identity census measured (rc0) and tabled with file:line in the evidence file | calculable | diagnosis | bounded | medium | 40m | — | — |
| 2 | Deterministic interleave harness (k1 holds) with rr1–rr5 run on the base, each oracle's result recorded | frontier | positive-control | bounded | high | — | ≤1h30m — stop and file an issue with the attempts | — |
| 3 | Decision applied: red committed then the effect fixed (A), or guard tests and comment only (B) | calculable | renderer-fix | bounded | medium | 35m | — | — |
| 4 | Targeted tests, suite, typecheck and build green; fence checked; memo and time log; pushed | calculable | verify-gate | bounded | medium | 35m | — | — |
| 5 | Rule 53 arm64 package built, launched on a proved scratch profile, and sent to Blurby.Brain | calculable | packaging-verify | bounded | medium | 40m | — | — |

##### Lessons applied
- **LL-142:** the census is measured (rc0), not assumed from the static trace, and the harness reproduces the race before any change.
- **Standing rule 43:** branch A commits its red tests alone first, with the failing output. Branch B makes no behaviour change without a red result.
- **LL-166:** each verdict reads DOM and runtime state through the oracles. A green verdict counts only once k1 has shown that the interleave window is open.
- **LL-165:** the rule 53 launch proves its scratch profile before the first input.
- **Standing rule 52:** evidence scripts are saved under `.txt` names.
- **Standing rule 50:** a pinned PAGE-SAVE-RESTAMP or JUMP-LANDING test turned red is named, not edited.
- **Standing rule 36:** every cited line is re-grepped at the merged base.
- **Standing rule 51:** this specification appends no lesson-status line.
