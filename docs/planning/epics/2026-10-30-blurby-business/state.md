---
epic: blurby-business
last_updated: 2026-11-02 23:01 UTC
updated_by: session 1 accepted baseline checkpoint
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale —
     sessions die without warning, and the disk must be handoff-ready at all times. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md.
2. Distrust, then verify: these files are MEMORY; the repo/system is REALITY. Run the
   cheapest check that confirms the "Where we are" block below (usually the current
   phase's exit-gate command). On conflict: believe reality, fix this file, note the
   correction in journal.md.
3. If `done.md` exists in this directory, do not start work — re-verify its claims
   against the charter DoD and report.
4. If `last_updated` above is older than the newest journal entry, trust the journal and
   repair this file before working.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P1 — Viewer
next_action:  await separate ready contract and Brain admission for HB-6 task 2 fixture generator
blockers:     none
session:      1 of ~40 budgeted; setup and baseline accepted, no product implementation
dod:          D1–D21 unmet
```

## Next actions — max 5, near horizon only

1. [ ] Read the register through the rule 11a guard: confirm BLURBY-BUSINESS-1 is not
       terminal, and confirm the LIBRARY-COMPLETION-VISIBILITY-1 window is closed (start gate).
2. [x] GIT WORK, first session: worktree created on `eb/blurby-business-1`; locked
       dependency installation and HB-6 task 1 full baseline passed and Brain accepted.
3. [ ] Re-verify every location cited in `phase1-specs.md` against the base, and journal
       any that moved.
4. [ ] HB-6 task 2 fixture generator: await separate ready contract and Brain admission.

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository (execution) | `C:\Projects\bb-business`; common Git directory `C:/Users/estra/Projects/Blurby/.git` | Verified clean at creation, BB-2026-11-02-1 anchor correction; old bq-main untouched |
| Run branch | `eb/blurby-business-1` from `origin/main` at or after the packet commit (scaffold base `5d07b515`) | scaffold, 2026-10-30 |
| Remote | `origin` = github.com/gorillabrown/Blurby (private) · network operations granted (`policy.git.networkOperations: allow`) | `Virtuoso/workspace-layout.json`, 2026-10-30 |
| Branch created | `eb/blurby-business-1` from exact `ac19ea60b6cd8b4fff3e5413b111925b7ef78485` | S1; remote main equality and scaffold ancestry verified |
| Push quirk | refs can land under `EB/`; always push with `HEAD:refs/heads/eb/blurby-business-1` | memory, Rodney 2026-10 |
| Baseline suite | 181 files; 2,452 passed / 1 skipped / 0 failed on `a67045eaf3241a18adde990e502a90b56a8a2c68` | S1 exact full suite, exit 0, 2026-11-02 22:56:18–22:58:51 UTC; Brain accepted |
| pdfjs-dist | 5.4.296, transitive via pdf-parse 2.4.5 only | `node_modules`, Rodney, 2026-10-30 |
| Register | read only through the rule 11a guard (pinned helper `fcfa9295`, `python -I`); `docs/planning/roadmap-reviews/2026-10-27-registry-helper-repair.md` | 2026-10-30 |
| Technical authority | Blurby.Brain (rule 11); merge go: Blurby.Roadmap | CLAUDE.md, memory |

## Blockers

- (none)

## Tried and failed

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-30 | Nine phases (eight delivery + completion) | the owner approved eight phases (D20); completion is mandatory | scaffold |
| 2 | 2026-10-30 | One run branch for the epic instead of six stacked item branches | an epic runs on one branch; the HB item branches in `phase1-specs.md` are superseded by `eb/blurby-business-1` | scaffold (policy.git template `eb/{item-id}`) |

## Evidence

- Setup evidence: `C:/Projects/Blurby-artifacts/business-worktree-prep-20261102/`; initial tree `b08fdf6e354e191962ae158396e17d50b2afe785`. Frozen charter/storyboard/specs/matrix match their packet-add commit.
- Qualified helper relocated to `C:/Projects/Blurby-artifacts/registry-helper-20261102-business/virtuoso-dev/plugins/virtuoso`; original manifest SHA256 `86a0fb68619372d6e73cdc4dc1ad5e7fc4c55c62fc75e2a836c0084e895c8d47`, 220 raw/canonical/inventory checks and imports reverified. No global activation or helper command invoked.
- BB-2026-11-02-1 source window CLOSED by confirmed Notes-only provider readback (recovery `20261102T223205Z`); snapshot 202 rows at 22:33:39 UTC is parent-confirmed evidence, not a fresh SQL read here. Visibility remains In Flight.
- Brain coordinates execution; Roadmap owns canonical governance/closeout. Business owner is this S1 executor on RodneySR, isolated from CPU/A2. BB-2 theme export supplement consumed for future HB-6; not implemented. Native remains paused.
- Baseline wave `BLURBY-BUSINESS-1-S1-BASELINE-20261102` ran 22:53:00–22:59:13 UTC and closed at 39/40 aggregate tools. `npm ci --no-audit --no-fund` exited 0 (660 packages, 51.76 s); expected ONNX two-block patch verified; package/lock unchanged. `npm test -- --maxWorkers=1` exited 0 once (152.53 s), with process-local 2 GiB JavaScript heap limit; this is not a total RAM cap.
- Brain-accepted baseline evidence: `C:/Projects/Blurby-artifacts/business-s1-baseline-20261102/parent-verification.json`, SHA256 `3fad01eecec99db60a0268933a4145316fbc2847d4ab1dd6673aa24ee1555416`; worker `receipt.final.json`, SHA256 `a72f61e7287c503f2ceb682b4dd70f31388924a349e9d71aa37c9be08e94842c`. Frozen charter/storyboard/specs/matrix remain unchanged. Only generated `tests/perf-baseline-results.json` is dirty, preserved unstaged at SHA256 `4834fca0f41d7c89b83fa02677a9f23ac77cdebb3b14c8ad59ef16cdeebf3208`.
- Builds, product implementation and D1–D21 remain unverified; no automatic successor. Earlier unsupported-model failure and setup CP1252 print failure remain preserved externally. This docs-only checkpoint changes state/journal only; exact resulting commit is recorded in its external receipt.
