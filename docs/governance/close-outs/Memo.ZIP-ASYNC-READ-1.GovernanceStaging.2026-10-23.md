# Dispatch Close-Out Governance Staging — ZIP-ASYNC-READ-1

Branch `eb/zip-async-read-1` from `refs/remotes/origin/eb/zip-read-followups-1` @ `29b3e7e5` (ZIP-READ-FOLLOWUPS-1's held tip, verified after `git fetch origin --prune`), in worktree `C:\Projects\Blurby\.claude\worktrees\zip-async-read-1-9fddb0`. Build and hold: the merge waits for the Stage 8 freeze, for ZIP-READ-FOLLOWUPS-1 to merge first, and for Blurby.Roadmap's go. The run wrote nothing to the register (standing rule 46).

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met | On `29b3e7e5`: `git grep -n "new AdmZip(" -- main` printed exactly `main/zip-read.js:18:  return new AdmZip(filePath);`. `git grep -n "openZip(" -- main` printed the five call sites (`epub-converter.js:1053`, `epub-word-extractor.js:168`, `file-parsers.js:359`, `:547`, `:624`) and the definition `zip-read.js:12`. |
| 2 | Met | `6ad30e42` commits `tests/zipAsyncRead.test.js` alone, verbatim from the specification. `npx vitest run tests/zipAsyncRead.test.js` on the base: 2 failed, 1 passed. (za1) `AssertionError: expected [ Array(1) ] to deeply equal []`; (za2) `AssertionError: promise resolved "{ readFile: [Function readFile], …(30) }" instead of rejecting`; (za3) passed. |
| 3 | Met | `16064a99` applies the specification's `openZip` as written. `npx vitest run tests/zipAsyncRead.test.js tests/zipEntryCap.test.js`: 16 passed in 2 files, exit 0 ((o), (p), (r), (s) unchanged and passing). |
| 4 | Met | `git grep -n "new AdmZip(" -- main` prints exactly `main/zip-read.js:26:  return new AdmZip(buffer);`. `git grep -n "readFileSync" -- main/zip-read.js` prints nothing. |
| 5 | Met | On tree `16064a99`, this machine (the owner's): `npm test` 178 files, 2,439 passed / 1 skipped / 0 failed, exit 0; `npm run typecheck` exit 0; `npm run build` exit 0. Identical to the prototype's counts on `29b3e7e5`. |
| 6 | Met (no live check by design) | Main-process read path only; same archives, same messages. |
| 7 | Met, measured against the stacked base | The branch stacks on ZIP-READ-FOLLOWUPS-1, which is not on `main` yet, so `git diff --name-status refs/remotes/origin/main` also lists that item's files. Against its tip, `git diff --name-status refs/remotes/origin/eb/zip-read-followups-1` lists exactly `M main/zip-read.js`, `A tests/zipAsyncRead.test.js`, this memo and `Timing.ZIP-ASYNC-READ-1.jsonl`. Once ZIP-READ-FOLLOWUPS-1 merges, the `origin/main` form of the check gives the same list. |

## Lessons applied

- **Standing rule 43 (LL-138):** (za1) and (za2) committed alone first (`6ad30e42`), red by assertion on the base.
- **Standing rule 36:** every cited line re-grepped on the base before editing (Done-when 1).
- **LL-158:** the cap is checked again on the bytes read.
- **Standing rule 50 (LL-156):** DEPS-AUDIT-1's adm-zip reachability note (`docs/governance/DEPENDENCY_ADVISORIES.md`) re-read: it concerns entry reads (through `main/zip-read.js` caps) and adm-zip's extract and async APIs. A buffer-backed constructor uses none of them, so the note is unchanged.
- **Standing rules 47 and 48:** full suite, typecheck and build on the owner's machine.
- **LL-164 / standing rule 51:** no lesson-status line appended.

## Lessons added

None.

## Fold-ins

None to governance documents at this stage. Close-out (after the merge go) archives the ROADMAP.md section and records completion in the register.
