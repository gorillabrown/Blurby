# Stage 8 smoke specification and execution gaps — 2026-10-26

**Status:** OPEN — planning/readiness issue, no new numbered product defect or release-gate ruling.

**Source:** owner-approved Phase C plan and the [Phase D readiness assessment](../../planning/roadmap-reviews/2026-10-26-readiness.md), shared rubric v1.2. Live register readback contains 192 items; canonical cache timestamp `2026-10-26T20:03:03Z`. Notion remains the status authority; this issue is a local routing record.

## What is specified

Five scoped implementation specifications are inline in ROADMAP.md and reconciled Queued / Full Spec in the live register:

- LIBRARY-COMPLETION-VISIBILITY-1 — Seq 116.
- NARRATE-PAUSED-CLICK-1 — Seq 117, only the proven paused-click/start defect.
- PAGE-ENTRY-KEYS-1 — Seq 119, the source-confirmed early native-forwarding interval.
- FOCUS-WORD-ONLY-1 — Seq 123, visual mask/band controls only.
- POSITION-PROMPT-COPY-1 — Seq 134, labels/order with unchanged anchor handlers.

U9 and U10 each exit 0 for the five specifications in `C:/Projects/Blurby-artifacts/smoke-stage8-20261026-145107/review-spec-mechanical-final.json`. The full source/rubric review is in the readiness assessment. These are specification results, not implementation test results.

## Holds and the action that clears each

| Hold | Route / required action |
|---|---|
| Stage 8 release and integration hold | The existing release authority must approve a concrete candidate integration window. Do not merge held branches or lift the freeze through this planning issue. |
| Library surface custody | Planner/repository operator reconciles APP-TABS-1's In Flight ownership with LibraryView/DocCard changes and assigns an exclusive window. Preserve its tab/home filtering. |
| Nonterminal prerequisite stacks | Integrate approved NARRATE-SENTENCE-RESUME-1 before paused-click; BAND-ALIGN-2 before Focus visual removal; preserve KEEP-FURTHEST-FIX-1's gate and Page's held input/save/jump stack. Re-grep at the final cut. |
| Actual repository admission | Preserve unrelated dirt; commit authorized planning paths per policy and prove plan reachability from the execution base before kickoff. No stash/reset/clean or broad staging. |
| Execution and package acceptance | Resolve local tooling/owner availability, then use the exact integrated ARM64 package, fresh verified profile, live-file hashes, computed-style/UI evidence and owner-heard audio where named. A fake clock cannot clear heard-audio acceptance. |

The five items are not dispatched by this record. Their source-backed specification depth reaches the default target of five, but holds prevent treating that as five immediately executable items.

## Remaining diagnosis/specification gaps

### Focus entry — FOCUS-PAUSED-HANDOFF-1

The owner saw the wrong paused word after Page-to-Focus entry, with Play correcting it. The planner must capture canonical anchor, visible cursor and re-stamp/arrival order on the real view with a proven detector. No shared root cause with Flow or Narrate is inferred. Removing Focus's mask does not certify this fixed.

### Folder responsiveness — FOLDER-SWITCH-CONTENT-1

The approved user-facing direction is an explicit loading state rather than old-folder cards presented as the newly selected folder. Cached/persisted records remain intact until a valid scan permits pruning.

Before prescribing a performance change, record run IDs and phase timestamps for cancellation, scan, extraction, first addition, save, broadcast and final prune. The existing source deliberately waits up to 30 seconds for an old run; tests pin that behavior. Recursive listing/stat caps and 30-second save/broadcast batching are separate contributors. The captured warning proves a timeout occurred in the session; it does not attribute the whole approximately 93-second observation gap. Do not shorten a tested contract, cap imports or delete records as an unapproved workaround.

### Queue attribution — PROFILE-QUEUE-ISOLATION-1

Normal library.json/settings.json remained unchanged, while sync-queue.json changed. Source inspection finds `getDataPath → initSyncEngine → initSyncQueue(dataPath) → writeJSON(queuePath)`, with no hardcoded normal-profile queue path. Writer identity and whether isolation was breached remain unresolved.

Use bounded process/file-write attribution with actual path/PID proof before any corrective code. Prove the recorder detects an owned control write. The older pre-install backup is not the exact pre-Part-B queue, so it cannot supply a semantic before/after comparison for that interval. Preserve current evidence and the queue; no clearing, restoring, blame or data-loss claim.

### Narrate visual residual — NARRATE-SELECTION-START-1

F9 is separated into NARRATE-PAUSED-CLICK-1. F7/F8 remain: paused band/cursor mismatch and the Play viewport jump. Trace competing arrival, click, start and playing-follow scroll writers, including asynchronous completion and user browse-away. The approved regular-display policy preserves the viewport when the active selected word is already visible; E-ink screenwise behavior remains its own item. Do not certify visual alignment from the F9 request/clock fix.

### Completion confirmation and coverage

AUTO-ARCHIVE-1 needs the confirmation-first design and acceptance tests fully amended; its historical silent-exit behavior remains superseded. LIBRARY-COMPLETION-VISIBILITY-1 neither changes completion detection nor implements the prompt.

SMOKE8-COVERAGE-RECHECK-1 owns missing exact evidence: check 31 visual deadlines/immediate quit, check 32 active-scan overlap, check 33 exact scenario, check 35 disconnected quit, and earlier input/handoff partials. Run against one approved candidate and retain fail/no-action controls.

## Disposition

Keep each gap explicit in the live item and its next specification. The planner resolves diagnosis and design before implementation dispatch; the repository operator resolves custody/base admission; the designated verifier and available owner resolve package/UI/audio acceptance. This issue does not alter Status/Seq, waive an existing gate, create a release exception, or authorize implementation. No original smoke failure or partial result is promoted to PASS.
