# Dispatch Close-Out Governance Staging — RESTAMP-RERUN-RACE-1

RESTAMP-RERUN-RACE-1 is built and held for the Stage 8 freeze on `eb/restamp-rerun-race-1`. It found that, in Page mode (PageFoliateView), the re-stamp effect can run twice on one section document at once. It fixed review findings W1 and W2 (decision branch A), with the red tests committed first. A reader sees no difference. This file stages the governance changes for the close-out.

## Run record

- **Base, stacked (spec).** Branch cut from `refs/remotes/origin/eb/jump-landing-save-1` @ `8a7c9db6`. `refs/remotes/origin/main` @ `28ec48e2` merged in as `ec914abf` (clean). This item's base is `ec914abf`. Before the cut: `.git/index.lock` absent, and the branch absent on origin (`git ls-remote` empty).
- **Commits:**
  - `dd0b8524`: red first, the harness alone (rc0, rr1–rr5).
  - `b1f7097c`: the fix, with the evidence file.
  - Then this memo and the time log.
  - A first build took branch (B) as an unpushed commit, `fe2a48fd`. It was rebuilt as (A) after the spec-compliance review (Deviation 1). That history was reshaped locally before any push; no work was lost.
- **Gates** (this machine; Windows on ARM; Git Bash):
  - `npm run typecheck` exit 0; `npm run build` exit 0.
  - `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes` exit 0: 13 files, 98 tests.
  - `npm test`: see the suite note below.
- **Re-grepped lines (rule 36):** every line the spec cites matched at `ec914abf`. The table is in the evidence file, section 1.

### Suite note (rules 47, 48)

Three full runs were made while other sessions were building on this machine. Each run had one different failure, and every failing test passes alone:

- `npm test` #1 (on `fe2a48fd`, the first build, which made no code change): 182 files, 2,475 passed / 2 skipped / 0 failed.
- `npm test` #2 (with the fix): `tests/folderWatcher.test.js` BUG-193's timing guard failed with a read of 58 ms against a 50 ms budget. It passes 3/3 alone.
- `npm test` #3: `tests/narrate/narrate.runaway.test.ts` timed out at 10 s. It passes 3/3 alone.
- `npm test` #4 (on `b1f7097c`, with the fix): exit 0. 182 files, **2,476 passed / 2 skipped / 0 failed**.

Neither flaky test touches Page mode or this item's files.

## Done-when

| Row | Result | Evidence |
|---|---|---|
| 1 census | PASS | (rc0) is committed green. The measured count is **1** non-empty `bookWordSections` identity per document. Settings change, page turn, `renderVersion` bump and a second emission of the same snapshot each add 0. The table has file:line rows and four new sources: the shell's snapshot cache `ReaderContainer.tsx:216`, the runtime's `own` `ModeRuntime.ts:120-122`, the port pass-through `createReaderPorts.ts:120-127`, and foliate's `getContents` shape. |
| 2 harness | PASS | k1 = 50 spans held on the first try (no fallback). A `data-rr-probe` on run 1's first span proves run 2 ran. The table of oracles o1–o7 and the base failures (verbatim) are in `docs/studies/investigations/RESTAMP-RERUN-RACE-1.repro.2026-10-23.md`. `mount` takes `{ strict?: boolean }`; existing calls are unchanged. |
| 3 decision | **(A)** | rr4 is red on the base (`o7 section 1 start: expected +0 to be 5`). The census shows that a rendered section with words can be missing from the set: the extractor skips a duplicate href (`epub-word-extractor.js:224`), and foliate renders every spine item. rr2 is red too (W1 with different data). Red first `dd0b8524`, then the spec's four edits at `FoliateView.tsx:1111-1124` (`b1f7097c`). |
| 4 tests | PASS | `pagePositionSave.test.tsx` 61/61, three runs. Every PAGE-SAVE-RESTAMP-2/-3, TOC-JUMP-SAVE-1 and JUMP-LANDING-SAVE-1 test is green and unedited. |
| 5 gates | PASS | `npm test` #4 exit 0 (2,476 / 2 skipped / 0 failed); typecheck and build exit 0. Two earlier runs each had one load flake (suite note). |
| 6 fence | PASS | `git diff --name-status ec914abf HEAD`: `M src/reader/modes/page/FoliateView.tsx`, `M tests/readerModes/pagePositionSave.test.tsx`, `A docs/studies/investigations/RESTAMP-RERUN-RACE-1.repro.2026-10-23.md`, plus this memo and `Timing.RESTAMP-RERUN-RACE-1.jsonl`. Nothing in `main/`, the shared-core freeze set, Flow, Focus or Narrate. |
| 7 package | PASS here, **awaiting Blurby.Brain** | See Package verification. |

### The fix (only the re-stamp effect)

- `:1113-1114`: wait on any registered wrap for the document (the load's, or an earlier re-stamp's), then `if (cancelled) return;`.
- `:1116-1117`: `sectionStart` is read after the wait, with its `< 0` skip kept (W2).
- `:1121-1123`: `const rewrap = wrapWordsInSpans(…); sectionWrapsRef.current.set(doc, rewrap); await rewrap;` (W1).
- `:1124`: `if (cancelled) return;`, placed before `rendererNumberedDocsRef.current.delete(doc)`. The held-turn report's own `!cancelled` check became redundant and was dropped.
- **Spec failure-handling case:** a cancelled run returns without renumbering only when the next set is empty. Within a mount the set is never emptied (rc0), and a document switch remounts the view. No test covers this; this is the stop reason.

### Deviations (tier-1 decisions)

1. **The first build took (B), and the item was rebuilt as (A).** The first build argued that rr4's fixture is unreachable: foliate's reflowable paginator holds one section (`paginator.js:1127-1133`), and fixed layout gives no index. On that basis it committed a reachable-shape rr4 variant and a guard comment. Solon ruled that the rule's rr4 clause is literal: rr4 is red, and a missing section is possible. Arguing reachability is the planner's call, not the builder's (LL-142). The rebuild follows the spec's branch (A) exactly. The reachability observation stays in the evidence file as context.
2. **rr2 is committed.** The spec commits a green rr2 under (B). Under (A) it is one of the red cases, red on the base and green after the fix, so it guards W1 directly.
3. **rr5 stubs `customElements.define` during the StrictMode mount.** It is restored in a `finally`. StrictMode's second open effect imports `foliate-js/view.js` while the first import is pending, misses `vi.mock`, and evaluates the real module. Its define of `foliate-view` would then throw. This is a test-environment artifact. rr5 proves the double run: `readBookBytes` is called twice, and contents are empty.
4. **Quality review fixes applied:** a describe-level `afterEach(vi.useRealTimers)`, so a failed k1 cannot leak fake timers; the define spy restored in `finally`; run 2 proved by the probe; and the reachable-shape rr4 dropped, because it could not prove that the re-stamp parked.

## Review findings and dispositions

- **Solon (spec compliance), on the first (B) build: CHANGES_REQUIRED.** It found that the decision rule forces (A). Acted on: the item was rebuilt as (A). It found rr2 evidence-only, the rr5 stub and the fourth comment bullet acceptable. The comment is moot under (A).
- **Plato (quality), on the first build: CHANGES_REQUIRED (tests only).**
  - 1 (fake timers leak on a failed k1): fixed.
  - 2 (define spy leak): fixed.
  - 3 (reachable rr4 cannot prove the park): the test was dropped.
  - 4 (prove run 2 ran): probe added.
  - 5 (comment overstated): moot, the comment was removed under (A).
  - 6 (rc0): accepted as is.
  - It verified the citations, including `paginator.js:1127-1133` and `fixed-layout.js:308-312`.
- Neither reviewer re-reviewed the (A) rebuild. It follows the spec's prescribed edits line for line.

## Package verification (standing rule 53; LL-167)

- **(a) Build:** at `b1f7097c` (the final code commit; later commits are docs outside `build.files`), with `origin/main` `28ec48e2` merged in. `npm run build` exit 0, then `npx electron-builder --win --dir --arm64 --publish never` exit 0. Output: `release\win-arm64-unpacked\` in this worktree; `Blurby.exe` is a PE32+ ARM64 binary.
- **(b) `BLURBY_USER_DATA_DIR`:** present in the packaged `main.js`, at `:27` (comment) and `:29` (`app.setPath("userData", …)`).
- **(c) Launch:** native arm64, on a fresh, empty scratch profile under the session scratchpad, with `--inspect=10611`. The port was checked free first.
  - Profile proved before anything else (LL-165): `app.getPath('userData')` over the main inspector equalled the scratch profile, 0.44 s after spawn.
  - Alive at 25 s: no exit, no `.dmp` under `Crashpad`, no error line.
  - Output, 7 lines: the inspector banner; `[ws-server] Listening…`; and the expected first-launch `Backup failed … library.json: ENOENT` on the empty profile.
  - No input was sent.
  - Script and record: the group notes folder, `restamp-rerun-race-1\launch25.mjs.txt` and `launch-rec.json`.
- **(d) asar:** `npx asar list` gives 11,581 entries. Extracted into the scratchpad (never a worktree root):
  - its `dist/` is byte-identical to the worktree's `dist/` (21 files, sha256);
  - `main.js`, `preload.js` and `main/` are identical to the tree.
  - The renderer bundle differs from the item base (`App-Bvln41y1.js` → `App-DeJxwzxo.js`), as expected for the fix.
- **(e) Done-when on the packaged exe:** none can be automated there. Every Done-when is a jsdom test against the effect, and the effect has no reader-visible behaviour (the spec has no owner smoke).
- **Blurby.Brain:** sent for confirmation; merge is held until it confirms.

## Target: ROADMAP.md

### Fold-in 1 — built and held
Section: §RESTAMP-RERUN-RACE-1, the heading's status
Action: Replace
Content: **built `<tip>` on `eb/restamp-rerun-race-1`, stacked on JUMP-LANDING-SAVE-1 `8a7c9db6` + main `28ec48e2`, 2026-10-23: branch (A), red first `dd0b8524` (rr2, rr4), fix `b1f7097c`; typecheck and build 0; In Flight, merge held for the Stage 8 freeze and Blurby.Brain's rule 53 confirmation. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → JUMP-LANDING-SAVE-1 → this item.** Evidence: `docs/governance/close-outs/Memo.RESTAMP-RERUN-RACE-1.GovernanceStaging.2026-10-23.md`.

### Fold-in 2 — follow-up stub: fixed-layout re-stamp numbering
Section: the stubs after RESTAMP-RERUN-RACE-1
Action: Insert after
Content:
- **FIXED-LAYOUT-RESTAMP-1 — Page re-stamp numbers every fixed-layout page from 0** *(stub; unmeasured; not a release gate)*. foliate's fixed-layout renderer returns every iframe from `getContents()` with no `index` (`fixed-layout.js:308-312`). The re-stamp and the load then take the loaded-slice start for `undefined`, which is 0, so both pages of a spread would carry overlapping `data-word-index` values. Measure with a pre-paginated fixture first (LL-142). Lane: Reader Engine.

## Target: docs/governance/LESSONS_LEARNED.md

Lesson numbers are provisional placeholders; reassign them at fold-in against the catalog tip.

### Fold-in 3 — lesson candidate (LL-NEW-e)
Action: Append
Content:
### LL-NEW-e — A decision rule's clauses are applied as written; reachability arguments go to the planner (RESTAMP-RERUN-RACE-1, 2026-10-23)
**Verdict:** The builder took "not reachable" for a red rr4 by arguing that its fixture shape cannot occur, and replaced the red fixture with a green variant. The spec's rule tied (A) to two checkable clauses, and both held. Spec review sent it back, and the rebuild cost one extra commit cycle.
**Evidence:** this memo, Deviation 1; Solon's review.
**Recommendation:** When a spec's decision rule names observable conditions, apply them literally. Put a reachability argument in the evidence file and the report for the planner to rule on. Never use it to swap a red fixture for a green one.
**Applies to:** reproduce-then-decide items (repro harnesses, "fix or close as not reachable").
**Status:** Observation
Related: LL-142, standing rule 43.

### Fold-in 4 — lesson candidate (LL-NEW-f)
Action: Append
Content:
### LL-NEW-f — Under React StrictMode in vitest, a concurrent first dynamic import can miss vi.mock (RESTAMP-RERUN-RACE-1, 2026-10-23)
**Verdict:** StrictMode's second open effect imported `foliate-js/view.js` while the first import was pending. That import evaluated the real module despite `vi.mock`, and its `customElements.define` threw. Warming the import from the test did not help.
**Evidence:** evidence file, harness note (rr5).
**Recommendation:** Prove the double run (count a side effect), and neutralise the real module's side effect for the mount, restoring it in `finally`. Do not read the failure as app behaviour.
**Applies to:** StrictMode mounts of views that dynamically import ESM side-effect modules in tests.
**Status:** Observation

## Target: CLAUDE.md

### Fold-in 5 — queue line
Section: §Current operational state, Queue
Action: Replace (at close-out, by the planner)
Content: record RESTAMP-RERUN-RACE-1 (98) as built and held (branch A), stacked after JUMP-LANDING-SAVE-1.

## Not staged

`npm test` rewrote `tests/perf-baseline-results.json`. It is outside the fence and left unstaged.

## Lessons

- **Applied:**
  - LL-142: the census was measured (rc0), and the decision followed the rule's checkable clauses after review.
  - Standing rule 43: red first, alone (`dd0b8524`).
  - LL-166: every verdict reads DOM and runtime state through the oracles.
  - k1 was proven before any green counted.
  - LL-165: the profile was proved before anything else in the rule 53 launch.
  - Standing rule 52: the launch script is saved as `.txt`.
  - Standing rule 36: the cited lines were re-grepped.
  - Rule 50: no existing test was edited.
  - Rules 47 and 48: the suite, typecheck and build were run on this machine.
  - LL-136: the fence lists the time log.
- **Added (candidates):** LL-NEW-e, LL-NEW-f (above).
