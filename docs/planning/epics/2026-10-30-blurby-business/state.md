---
epic: blurby-business
last_updated: 2026-10-30 21:30
updated_by: session 0
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
next_action:  check the start gate (LIBRARY-COMPLETION-VISIBILITY-1 window), then GIT WORK first-session steps
blockers:     none
session:      0 of ~40 budgeted
dod:          D1–D21 unmet
```

## Next actions — max 5, near horizon only

1. [ ] Read the register through the rule 11a guard: confirm BLURBY-BUSINESS-1 is not
       terminal, and confirm the LIBRARY-COMPLETION-VISIBILITY-1 window is closed (start gate).
2. [ ] GIT WORK, first session: create the worktree `C:\Projects\bb-business` on branch
       `eb/blurby-business-1`, then run `npm ci` and the `npm test` baseline.
3. [ ] Re-verify every location cited in `phase1-specs.md` against the base, and journal
       any that moved.
4. [ ] Start HB-6 Wave A.

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository (execution) | `C:\Projects\bb-business`, a worktree of RodneySr's `C:\Projects\bq-main` | HEARSAY — the first session creates and verifies it |
| Run branch | `eb/blurby-business-1` from `origin/main` at or after the packet commit (scaffold base `5d07b515`) | scaffold, 2026-10-30 |
| Remote | `origin` = github.com/gorillabrown/Blurby (private) · network operations granted (`policy.git.networkOperations: allow`) | `Virtuoso/workspace-layout.json`, 2026-10-30 |
| Branch created | not yet — the first session creates it | S0 |
| Push quirk | refs can land under `EB/`; always push with `HEAD:refs/heads/eb/blurby-business-1` | memory, Rodney 2026-10 |
| Baseline suite | 2,452 passed / 1 skipped / 0 failed (gate (1) run 4, `36ac7466`); newer tips are higher | CLAUDE.md, HEARSAY for the run base |
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

- (none yet)
