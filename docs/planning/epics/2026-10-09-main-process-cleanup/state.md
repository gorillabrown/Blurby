---
epic: main-process-cleanup
last_updated: 2026-10-10 00:40
updated_by: session 1
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History → journal.md; route → plan.md; contract →
     charter.md. Never end a work burst with this file stale. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

0. **Authoritative copy.** Read and write the packet only at
   `C:\Projects\Blurby\.worktrees\epic-main-process-cleanup\docs\planning\epics\2026-10-09-main-process-cleanup`.
   Any other copy (the primary checkout's, or `main`'s before completion) is a launch snapshot.
   If that path does not exist yet, run the bootstrap in your kickoff prompt first.
1. Read charter.md, then plan.md, then all of this file, then the **last** journal entry.
2. Distrust, then verify: files are memory; the repo is reality. Check "Where we are" against git
   (`git log` on each item branch, `git merge-base --is-ancestor <commit> refs/remotes/origin/main`
   for merged items). Believe reality, fix this file, journal the correction.
3. If `done.md` exists here **and** on `refs/remotes/origin/main` (`git show refs/remotes/origin/main:docs/planning/epics/2026-10-09-main-process-cleanup/done.md`),
   the epic is finished: re-verify and report; do no work. If it exists only here, resume
   launch.md → Completion protocol step 3 (publish); do not stop.
4. If `last_updated` is older than the newest journal entry, trust the journal and repair this file.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P5 — complete (done.md written; publishing packet to main)
next_action:  if done.md is not on refs/remotes/origin/main, resume launch.md Completion step 3 (publish); else stop. Owner runs /pointer-closeout
blockers:     none
session:      1 of ~3 budgeted
dod:          C1 met | C2 met | S1 met | S2 met | L1 met | L2 met | DINT met (b95dbb55)
```

## Next actions — max 5, near horizon only

1. [x] All items merged; DINT passed on b95dbb55; done.md written
2. [ ] Publish the packet to main (launch.md Completion step 3), then stop

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby` (primary checkout dirty with unrelated work: never touch) | scaffold, 2026-10-09 |
| Base | `origin/main` @ `9597240d` at scaffold (moves as items merge and as READER-MODE-SEPARATION-2 publishes) | `git rev-parse`, 2026-10-09 |
| Remote / policy | `origin`; `policy.git` = push, networkOperations allow, template `eb/{item-id}` | registry, 2026-10-09 |
| Git gotcha | a `main/` directory exists, so write `refs/heads/main` / `refs/remotes/origin/main` in full | 2026-10-09 |
| Test noise | `npm test` rewrites tracked `tests/perf-baseline-results.json`: never stage it | 2026-10-09 |
| Known flake KF-1 | `tests/qwenStreaming.test.js` unhandled `stream-timeout` → `npm test` exit 1 with 0 failed tests (1 of 3 runs, RMS-2 session) | RMS-2 state.md, 2026-10-09 |
| Spec edit sites | `withRetry` at line 15 in `main/cloud-google.js` and `main/cloud-onedrive.js`; no commits since `cd384b78` touch any edit site; the RMS-2 run touches none of these files | `git diff`, scaffold 2026-10-09 |
| Monday items | CLOUD-RETRY 13122896723, SIDECAR 13122892116, LEGACY 13122896722, all Queued | connector, 2026-10-09 |
| Toolchain | node v24.14.0, npm 11.9.0; `gh` logged in | 2026-10-09 |

## Blockers

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-09 | Combine the three ready cleanups; merge each to `main` as it passes (Rule 5b) | Owner, at scaffold | Owner |
| 2 | 2026-10-09 | Monday In Flight transitions run as actor `mid-dispatch-decision` | workRegister allowedWriters has no epic/virtuoso actor; same precedent as the RMS-2 epic (its journal S1f) | Grant: Monday transition |
| 3 | 2026-10-09 | Item branches are pushed with an explicit refspec and upstream reset (`worktree add -b … refs/remotes/origin/main` tracks origin/main, so a plain `push -u origin <branch>` fails) | git behavior observed at bootstrap | Grant: create/push branches |
| 4 | 2026-10-09 | CLEANUP-LEGACY-PARSERS-1 edits CLAUDE.md and TECHNICAL_REFERENCE.md directly, not via a staging memo | the spec names both as edit sites and L1 greps them; specs govern | Charter: specs govern |
| 5 | 2026-10-09 | Logs kept in `C:\Projects\Blurby-artifacts\epic-main-process-cleanup\` | charter: no evidence in %TEMP% | Constraint |
| 6 | 2026-10-09 | Sidecar Task 1 fake: kill() emits exit on a microtask, not synchronously | a real ChildProcess exits asynchronously; with the sync fake of tests/pocketTtsEngine.test.js the start-timeout resolves `sidecar-exited` (verified: 2 failures), which is a fake artefact, not code behavior. Recorded as a finding | Grant: test helper structure |
| 7 | 2026-10-09 | Legacy re-census hits in `Virtuoso/work-register.snapshot.json` (3) and `Virtuoso/reports/planning-cockpit.html` (1) classed as doc references; item proceeds | both are Lane E register/report data written after the 2026-10-08 census (01588c90); they match the item's own ID `cleanup-legacy-parsers-1` and its description prose; no require/import/path/build reference exists anywhere outside docs. Owner may overrule: `git revert 91e48416` | Trigger wording "non-doc reference" (flagged for owner) |
| 8 | 2026-10-10 | charter.md left unedited at completion (launch.md step 2 says set status complete) | the kickoff prompt says never touch charter.md; the user's instruction wins | Kickoff prompt |

## Evidence

- **Baseline** (packet worktree @ ef1d233b): npm ci 0; npm test 0 — files 210 pass/1 skip, tests 3058 pass/133 skip, failing set ∅, KF-1 not seen; build 0. Logs: Blurby-artifacts/…/baseline-*.log
- **Monday** CLOUD-RETRY-SHARED-1 → In Flight (readback: In Flight, Seq 6, branch eb/cloud-retry-shared-1, started 2026-10-09; recovery 20261010T033734Z-… confirmed)
- **C1** on eb/cloud-retry-shared-1 @ f3abb524 (pushed): (1) targeted npm test exit 0, 29 pass, 7 new defs / 10 cases; (2) diff of both existing cloud tests vs origin/main = 0 bytes; (3) `status === 429` 0/0/1; (4) forceRefresh: true once per provider at line 22 ("google"/"microsoft"). Positive control: backoff-exponent mutation → 7 failed.
- **C2** dd3db29c pushed to main (integ worktree mpc-integ-cloud-retry-shared-1-1, attempt 1): ci/typecheck/test/build 0; 3068 pass/133 skip; `merge-base --is-ancestor f3abb524 refs/remotes/origin/main` exit 0. C1.5: npm test 0, 3068/133 (+10, skips unchanged); C1.6: exactly the 4 paths.
- **S1** eb/tts-sidecar-shared-1: Task 1 65cb5774 — targeted cmd exit 0 (51 tests; 11 defs / 20 cases), `git diff origin/main --stat -- main/` empty. Task 2 18f453fa — same cmd exit 0, tests/ diff vs 65cb5774 = 0 bytes; IPC/package suites exit 0 (9); helper counts 0/0/3; export check exit 0; npm test 0 (3088/133, +20, skips unchanged); diff = 4 paths. Positive control: hard-wired env var → Pocket env-var test failed.
- **S2** 7a462bf7 pushed to main (mpc-integ-tts-sidecar-shared-1-1, attempt 1): ci/typecheck/test/build 0, 3088/133; `--is-ancestor 18f453fa` exit 0.
- **L1** eb/cleanup-legacy-parsers-1 @ 91e48416 (from 7a462bf7): (1) file absent; (2) git grep exit 1 (fired on CLAUDE.md:166 before the edit); (3) parser suites exit 0 (73); (6) exactly 3 paths. Census: Decision #7.
- **L1.4/L1.5** on 91e48416: npm test 0 (3088/133), build 0.
- **L2** b95dbb55 pushed to main (mpc-integ-cleanup-legacy-parsers-1-1, attempt 1): ci/typecheck/test/build 0, 3088/133; `--is-ancestor 91e48416` exit 0.
- **DINT** fresh worktree mpc-dint-1 @ b95dbb55: ci 0, typecheck 0, npm test 0 (212 files/1 skip; 3088/133; failing ∅), build 0; combined targeted command 0 (13 files, 162 tests); ancestors f3abb524/18f453fa/91e48416 → 0/0/0.

