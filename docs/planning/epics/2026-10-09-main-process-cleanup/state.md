---
epic: main-process-cleanup
last_updated: 2026-10-09 23:45
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
phase:        P2 — Cloud retry sharing (C1 verifying; integrate next)
next_action:  full npm test on eb/cloud-retry-shared-1 @ f3abb524 (C1.5), then C1.6, then integrate (launch.md GIT WORK) → C2
blockers:     none
session:      1 of ~3 budgeted
dod:          C1 1-4 met (5-6 pending) | C2 unmet | S1 unmet | S2 unmet | L1 unmet | L2 unmet | DINT unmet
```

## Next actions — max 5, near horizon only

1. [x] Bootstrap: packet worktree + branch pushed (S1)
2. [x] Baseline on ef1d233b: npm ci 0; npm test 0 (210 files pass/1 skip; 3058 pass/133 skip); build 0
3. [x] Specs re-read; conflict check clean
4. [ ] C1.5/C1.6 on eb/cloud-retry-shared-1 @ f3abb524, then integrate (mpc-integ-cloud-retry-shared-1-1) → C2
5. [ ] P3: Monday In Flight TTS-SIDECAR-SHARED-1, worktree, Task 1

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

## Evidence

- **Baseline** (packet worktree @ ef1d233b): npm ci 0; npm test 0 — files 210 pass/1 skip, tests 3058 pass/133 skip, failing set ∅, KF-1 not seen; build 0. Logs: Blurby-artifacts/…/baseline-*.log
- **Monday** CLOUD-RETRY-SHARED-1 → In Flight (readback: In Flight, Seq 6, branch eb/cloud-retry-shared-1, started 2026-10-09; recovery 20261010T033734Z-… confirmed)
- **C1** on eb/cloud-retry-shared-1 @ f3abb524 (pushed): (1) targeted npm test exit 0, 29 pass, 7 new defs / 10 cases; (2) diff of both existing cloud tests vs origin/main = 0 bytes; (3) `status === 429` 0/0/1; (4) forceRefresh: true once per provider at line 22 ("google"/"microsoft"). Positive control: backoff-exponent mutation → 7 failed.
