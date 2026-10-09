# Mode separation — next-pointer admission hold
Date: 2026-09-23. Ceremony: next-pointer. Item: Separate Page, Focus, Flow, and Narrate runtimes (READER-MODE-SEPARATION-2).
Register: https://estrattbrown.monday.com/boards/18432450217/pulses/13119306772

## Disposition
The owner will run implementation in a fresh Codex session. The handoff is prepared; production extraction is NOT READY until that session verifies its live desktop/audio observation route and passes G0. This task cannot attest to another session's access. Do not interpret the user's choice of host as a waiver of baseline or listening evidence. The head remains Queued, Full Spec, Seq 1; no implementation is in flight. This issue is the bounded handoff for the external environment gate; if that session cannot resolve it, route to mid-dispatch-decision without changing production code.

## Five findings
| Finding | Result | Evidence |
|---|---|---|
| Specification | PASS | U1–U4/U6/U7 rechecked; 84 source/test hashes match the review, constants and six assertion migrations verified; no extensions. Head-only enrichment names the reachable governance base and owner-approved isolation-first queue exception |
| Prerequisites | PASS | Adapter contracts/current-word anchor (READER-ISO-1A), orchestrator shell/selection (1B), Focus adapter/passive surface (1C), Flow adapter/section restart (1D), Narrate adapter/audio truth (1E) are all Completed in live Monday |
| Repository | PASS | Clean governance worktree and pinned commit below; application, tests, scripts, package/lock and config unchanged. Main and its index preserved. Execution branch absent |
| External register | PASS | Live connector read, 57 identified records among 62 rows, fresh provider snapshot; status/spec/completion mutations supported, no compatibility adapter; recovery empty |
| Execution environment | BLOCKED | Local Node 24.14.0, npm 11.9.0, TypeScript 5.9.3, Vitest 4.1.2, Electron binary and declared openpyxl 3.1.5 present. Fresh-session dependency installation and actual UI/audio access have not been demonstrated; G0 type/test/build/live baseline is unrun |

Rubric U8 passes for the revised repository plan. This is not a claim that candidate runtime gates have passed.

## Pinned repository handoff
- Source baseline: local main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8.
- Governance base: 1e5485c66e547392e7752240df71700267e8ede7, on eb/roadmap-review-2026-09-23, direct child of that source baseline.
- Clean governance checkout: C:/Users/estra/Projects/Blurby/.worktrees/roadmap-review-2026-09-23.
- Execution branch to create: eb/reader-mode-separation-2.
- Execution checkout to create: C:/Users/estra/Projects/Blurby/.worktrees/reader-mode-separation-2.
- Specification in the pinned commit: ROADMAP.md#reader-mode-separation-2.
- Exactly 61 governance files committed, including review evidence and provider registry. No application source or test changes.
- Remote detected: origin = https://github.com/gorillabrown/Blurby.git. Default detected: origin/main -> main. Local main and last-known origin/main agree; no fetch performed, so no remote-current claim.
- Git policy: exact-path local commits, no separation-of-duties or independent-reviewer requirement; network operations ask; no automatic merge/push/cleanup.
- Primary unrelated work retained: .idea/workspace.xml; docs/governance/close-outs/SpecRetro.Lessons_Learned.md; docs/planning/roadmap-reviews/checkins/2026-05-31-status.md; tests/perf-baseline-results.json; historical untracked scaffolding, June review files, backup and lock files. The primary review files also remain preserved in place.
- All 21 pre-existing worktrees retained. One documentation handoff worktree added. No implementation branch/worktree exists.
- Seven existing review documents contain an extra blank line at EOF. The full packet whitespace check reports these; archived report bytes were preserved. Head specification, registry and tracked governance edits pass their scoped whitespace check.
- Primary preflight reports three retired local Virtuoso scripts as warnings. Do not run or delete these scripts; use the installed launcher. The isolated governance checkout preflight is ready with zero writes.

## Repository reconciliation recipe — before implementation
Run each command sequentially, inspecting each result. Any unexpected result stops admission. Do not run network operations to make this recipe work.

```powershell
Set-Location 'C:/Users/estra/Projects/Blurby'
$env:GIT_OPTIONAL_LOCKS = '0'
git --no-optional-locks status --porcelain
git --no-optional-locks diff --cached --name-only
git --no-optional-locks rev-parse main
git --no-optional-locks show -s --format='%H %P' 1e5485c66e547392e7752240df71700267e8ede7
git --no-optional-locks show 1e5485c66e547392e7752240df71700267e8ede7:ROADMAP.md
git --no-optional-locks diff --name-only cd384b78cd5325e96429fe867c8b080ce1b39bb8 1e5485c66e547392e7752240df71700267e8ede7
git --no-optional-locks branch --list eb/reader-mode-separation-2
git --no-optional-locks worktree list --porcelain
```

Require: main remains the named source baseline; governance commit parent equals it; specification contains the separation anchor and pinned-base branch plan; the 61 changed files are the governance-only packet; primary index empty; no execution branch/worktree already exists. Primary dirt is preserved, never staged or moved. Inspect the current Git index lock path and running Git processes; report a lock, never delete it. If the base has changed or work is already in flight, stop for reconciliation rather than duplicate dispatch.

Then, only when those checks pass:
```powershell
git worktree add -b eb/reader-mode-separation-2 'C:/Users/estra/Projects/Blurby/.worktrees/reader-mode-separation-2' 1e5485c66e547392e7752240df71700267e8ede7
Set-Location 'C:/Users/estra/Projects/Blurby/.worktrees/reader-mode-separation-2'
git --no-optional-locks branch --show-current
git --no-optional-locks rev-parse HEAD
git --no-optional-locks status --porcelain
& "$HOME/.virtuoso/bin/virtuoso.ps1" virtuoso_preflight --root . --mode check
```

Require the exact branch, pinned HEAD, empty status and usable registry. Re-read CLAUDE.md, the registered lessons, this issue, and the full head spec. Refresh Monday through its connector/provider; do not use the committed snapshot as live truth. Detect and validate dependencies inside this new worktree; dependency installation is not claimed complete by the presence of the primary checkout's node_modules. Resolve any needed network access under policy before installation.

First execute **Wave A admission only**: confirm actual screen and heard-audio observation/capture access, capture an independent baseline, then run npm run typecheck, npm test and npm run build as G0 specifies. Record failures and stop before production extraction. No cached prior success, mocked audio or scheduler-derived timing substitutes for live evidence. Once every finding passes, record the in-flight transition through mutation-plan -> connector -> readback -> confirmation and continue the approved serial waves A -> B -> C -> D -> E. No future waveform, UI or test outcome is pre-approved here.

Stage exact paths from the execution manifest, verify the cached set, and commit only under current policy. No merge, push, branch deletion, reset, clean, stash or unrelated edits. Existing Page Space no-op and known sync/1.4x defects remain baseline behavior. SRL-053 requires live verification; SRL-089 requires serial execution of dependent waves.

## Pipeline and provenance
Provider: Virtuoso connector+snapshot from monday:board/18432450217, final readback observed 2026-09-23T19:48:31Z. The head's notes and evidence link now record this pinned base and admission hold. All three requested field values matched readback; Queued/Seq 1 stayed unchanged; the other 61 board rows were unchanged. Mutation confirmation succeeded and outstanding recovery is empty.
57 actual work records: 44 Completed, 6 Dissolved, 1 Superseded, 1 Queued, 5 Blocked, 0 In Flight. The five board samples with no Sprint Code are excluded.
One complete eligible specification / target five; zero unconditional dispatch-ready items while this environment gate is open. Five unfinished items in Reader Runtime Solidification, six unfinished overall including deferred export. Last roadmap review: 2026-09-23 (today). No deadline declared, so no pace target.
Effort-weighted remaining percentage and buffer duration are not computable: missing effort on SK-HYG-2, FLOW-ZONE-AUTO, READER-MODE-ISOLATION-1-PHASE-0 and GOVERNANCE-SWEEP; unmapped historical effort values 1/2/3/8; no calibrated effort-to-duration conversion. Head effort XL.
No application tests, build or live QA were run by next-pointer. Performed checks were provider readback, registry validation, source hashes, constants/assertions, JSON parsing, exact staging, commit/base identity, clean isolated checkout and zero application-tree delta.
