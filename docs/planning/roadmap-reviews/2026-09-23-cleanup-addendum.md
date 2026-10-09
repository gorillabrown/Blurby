# Blurby cleanup roadmap addendum
Date: 2026-09-23 (America/Chicago); final live read 2026-09-24T04:51:59Z.
Source: monday:board/18432450217 via live monday.com connector and Virtuoso provider; primary source checkout main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8.

## Scope and authorization
The owner explicitly requested five additions using roadmap-review. This is a focused backlog addition to the approved review, not a rerun of its completion audit or a new implementation dispatch. The requested five scopes were treated as approval to record them; no extra phase approval was needed for this bounded addition. No completed item was reclassified, no historical ledger was modified, and the existing first five priorities were preserved. There is an existing mode-separation execution worktree at commit 7488315425ae9c8b6566362b44fd55e235117217; it was inspected only for identity and was not modified.

## Recorded plan
| Seq | Item | Lane | Prerequisites |
|---|---|---|---|
| 6 | [Remove the unused legacy parser module](https://estrattbrown.monday.com/boards/18432450217/pulses/13122896722) (CLEANUP-LEGACY-PARSERS-1) | Library & Content | READER-MODE-SEPARATION-2 |
| 7 | [Share MOSS and Pocket sidecar process and request handling](https://estrattbrown.monday.com/boards/18432450217/pulses/13122892116) (TTS-SIDECAR-SHARED-1) | TTS / Narration Engine | READER-MODE-SEPARATION-2 |
| 8 | [Share MOSS and Pocket engine lifecycle and request handling](https://estrattbrown.monday.com/boards/18432450217/pulses/13122908614) (TTS-ENGINE-SHARED-1) | TTS / Narration Engine | READER-MODE-SEPARATION-2; TTS-SIDECAR-SHARED-1 |
| 9 | [Share cloud retry handling with provider token refresh](https://estrattbrown.monday.com/boards/18432450217/pulses/13122896723) (CLOUD-RETRY-SHARED-1) | Platform & Maintenance | READER-MODE-SEPARATION-2 |
| 10 | [Remove the unused mode barrel and update structural tests](https://estrattbrown.monday.com/boards/18432450217/pulses/13122892318) (CLEANUP-MODE-BARREL-1) | Reader Engine | READER-MODE-SEPARATION-2 |

All five are Blocked / Stub, in the existing Blocked / deferred group. Mode separation remains step 1. The engine extraction follows the sidecar extraction to avoid competing changes to their shared contract. The new group is Codebase Simplification. Effort estimates are deliberately not invented; these items will be estimated when fully specified.

## Source checks and acceptance intent
- Legacy parser: current file is 398 lines. No production reference found in the searched main/src/scripts/package surfaces; production parsing uses file-parsers via epub-converter and library/misc IPC. A fresh complete reference/packaging census is still required before deletion.
- Sidecars: 408 and 402 lines. Duplicated child process, JSON-lines, correlation, timeout, cancellation and shutdown handling is the extraction target. Preserve provider settings and private mutable state per instance.
- Engines: 331 and 308 lines. Extract lifecycle/request coordination while preserving exported factories, provider metadata/defaults, independent singleton ownership and dormant IPC. Sharing process infrastructure does not authorize merging reading-mode behavior.
- Cloud retry: both withRetry loops retry 429/503/504 with the same capped backoff, invoke provider-specific forced token refresh on 401, and continue only for a first-attempt 401. Preserve these exact semantics, original errors and conditional-write/upload behavior.
- Mode barrel: four lines and no production import found, but two tests read it: narrLayer1bConsolidation.test.ts, "removes NarrateMode export from modes barrel"; tts7b-cursorContract.test.ts, "mode exports no longer include NarrateMode". Both currently assert absence of NarrateMode in its text. The item requires meaningful replacement assertions. Reconcile with the separation parent's edit-site inventory before acting; avoid a duplicate deletion if the parent already removes it.

Estimated aggregate outcome supplied by the owner: approximately 650 fewer lines, dependency-count delta zero. This has not been measured or apportioned among items and is not a quota. Preserve behavior and no new dependencies; actual line savings are measured after implementation, including helper and test additions.

## Lessons and readiness
The current shipped rubric is v1.1: U1–U9, adding Lessons applied to the prior review's v1.0 checks. No new item is marked Full Spec or dispatch-ready. The provider's structured lessons query returned zero recognized records; that does not mean the project's narrative lessons are absent. The additions carry the existing isolation-first instruction, dormant-engine preservation, exact-path/no-cleanup rules, preserved regression intent, and serial dependent-work rule. Full specifications must apply U9 explicitly.

| Finding for the five additions | Result |
|---|---|
| Specification | GAP by design: backlog stubs; exact helper/test design, effort and full U1–U9 review await specification |
| Prerequisites | BLOCKED: mode separation unfinished; engine extraction also waits for sidecar extraction |
| Repository | GAP for dispatch: no cleanup implementation branch/base admitted; primary planning changes preserved in place |
| External register | PASS: five creates confirmed, all supplied fields read back, original 62 board rows unchanged, recovery empty |
| Execution environment | GAP for dispatch: cleanup execution/test environment not evaluated or claimed |

The existing first item's historical Full Spec label is preserved; this bounded update does not re-certify its current execution admission or mutate its pinned handoff.

## Reconciliation and verification
The board now has 67 rows, of which 62 have Sprint Codes (five original samples are excluded): 44 Completed, 6 Dissolved, 1 Superseded, 1 Queued, 10 Blocked, 0 In Flight. Ten sequenced items; the new five occupy 6–10. No status or field on any pre-existing row changed.

No deadline is declared. Effort-weighted completion or duration is not computable: the five new items have no estimate, four older items lack effort, and historical values 1/2/3/8 lack scale mappings. The existing specification buffer gap is not filled by labelling these stubs ready.

Roadmap backup: Virtuoso/.backups/20260924T045017Z-cleanup-addendum/ROADMAP.md.
Receipts: cleanup-register-before/after.json, cleanup-mutation-plans.json, cleanup-mutation-confirmations.json and cleanup-items.json under this report's 2026-09-23 prefix.
Blocked-work tracking: [cleanup issue](../../governance/bug-reports/Issue.CLEANUP-BACKLOG.2026-09-23.md).

No application source/test edits, builds, tests, merges, pushes, or implementation worktree changes were performed. Existing unrelated work and the prior pinned handoff were preserved. The registry check reports three existing stale helper-script warnings; they remain untouched and are not used by this review.

