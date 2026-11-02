# Stage 8 release / held integration order — decision brief

Date: 2026-11-02. Status: pending technical disposition; existing freeze preserved. Recorded by roadmap-review under the registered issues role. Accountable technical authority: Blurby.Brain1, Claude session `local_3dfa75ff-41e8-4d54-872c-3a2c333ca582`; parent Blurby.Roadmap retains merge gos. Owner retains design/functionality decisions and smoke acceptance.

## Evidence and question

- ROADMAP.md, Stage 8, *Gate (1) sequencing and freeze*: code/lockfile merges frozen until gate(1) passes and the owner's batched smoke is done on the same candidate. Later release-fix exceptions moved the target to `36ac7466`.
- `docs/planning/roadmap-reviews/2026-10-23-plan.md`, *Post-freeze merge train*: release items close first, then built branches merge.
- `docs/planning/roadmap-reviews/2026-10-30-plan.md`, C.1: freeze lift/integration is listed before integrated release checks.
- ROADMAP.md, *Held dispatch update*: observer → visibility → display lifetime is still named a post-release stack.
- Current provider census `2026-11-02T16:34:52Z`: these repairs remain In Flight. Package verification is not merge permission. Owner gate(2) remains failed/partial.

**Requested technical disposition:** identify whether a recorded, authorized exception admits any named held branches into the Stage 8 release-fix candidate before the existing owner smoke passes. Cite the ruling, exact branches/candidate and gates to rerun. If there is no exception, confirm the release-first/post-freeze train interpretation; if that cannot satisfy acceptance, specify the narrow amendment that must be taken to the authorized decision maker. Do not grant a general freeze lift or revive Native.

Recommended interim interpretation: retain the stricter freeze, continue planning/evidence indexing only, and grant no merge go. Any change to owner functionality or acceptance scope goes separately to the owner.

## Delivery and closure

This file is the local routed issue/decision brief, not a consumed chat receipt. No direct Claude-session messaging tool is exposed in this session; Brain1 has not been messaged through the superseded Codex Brain chat. Before relying on a ruling, obtain its actual text and record source/receipt, then reconcile the current plan and ROADMAP without altering historical records. No runtime, transfer, merge, release or new budget is admitted by this issue.

Close when the cited ruling resolves the order and the planner records the exact admission boundary, candidate and unchanged/full gate requirements. Until then: integration held; documentation/readiness review may continue.

## Decision — completed handoff reconciled after owner resume, 2026-11-02

The owner supplied and this session read the canonical handoff at `docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md` on main `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`. Section1 records the owner's “Yes, include them all,” relayed by Brain1 and **confirmed to Blurby.Roadmap 2026-10-31**. Brain1's acknowledged CPU/release ruling supplied by the owner is preserved verbatim in `Brain1.NARRATE-CPU-PROFILE-1.rulings.2026-11-02.md`; its earlier pending-confirmation statement must be read alongside that now-available Roadmap confirmation, not silently substituted for it.

**Disposition:** the release-first/post-freeze interpretation is superseded by the documented scope exception for planning one integrated release candidate containing package-verified held fixes and the remaining approved smoke fixes. This resolves the contradictory-order question as documentary history. It grants no per-branch merge go, package acceptance or new runtime admission in this Codex session.

**Boundary:** the merge-train inventory, dependency graph, source-conflict rulings and declared integration waves remain to be completed. Each branch requires moved-main reconciliation, fresh prescribed rule53 checks on RodneySr, technical package confirmation, the parent merge go and ARM64 launch at merge. Keep main status lines plus branch-only new entries/resolutions in docs-only BUG_REPORT conflicts (N-Q3). After the train, repeat the whole gate(1) contract and owner gate(2) on the same exact candidate. All twelve existing release requirements remain.

APP-TABS follows visibility and the handoff's specific scope/dependency conditions; no extra feature scope is inferred. CHAPTER-STEP-CFI-1 stays excluded/stopped, Native remains parked and Business keeps its charter gates. CPU profiling and Page entry are not silently added to the candidate by this ruling. No application branch has been merged under the lift by this session.

The owner paused this task to let Claude finish its documents, then explicitly said “resume.” The completed main handoff and its three PREPARED AND HELD amendments were merged into this review branch only. Execution remains held until its separate readiness/admission conditions are satisfied, and technical-authority replacement for Brain1's usage outage is pending the owner's answer.
