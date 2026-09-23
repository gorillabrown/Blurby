# Issue: Blurby restart review — reconciliation and dispatch holds
Date: 2026-09-23
Actor: roadmap-review
State: open support/implementation gates; roadmap ceremony completed through Phase D; owner approved Phase C
Scope: governance and dispatch readiness; no implementation has started

Provider: monday.com connector via Virtuoso external provider.
Source: monday:board/18432450217.
Snapshot: 2026-09-23T19:33:07Z.
Repository: main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8.

## Holds and next actions
| ID | Affected action | Evidence | Required next action / owner |
|---|---|---|---|
| RR-01 | Phase C checkpoint | Owner explicitly approved the five-wave plan on 2026-09-23 | RESOLVED; Phase D completed |
| RR-02 | Claiming terminal ledger reconciliation complete | Ledger empty; policy ordinary writers = pointer-closeout; roadmap-review is a correction writer only | Route the prepared historical terminal candidates to pointer-closeout; validate dates, evidence, and partial dispositions before append. Do not forge corrections or actor identity |
| RR-03 | Dispatch readiness | Head now Full Spec with U1–U8 PASS; four successors remain blocked stubs | Head begins with clean-worktree baseline gates; respecify successors after isolation; buffer 1/5 |
| RR-04 | Dispatching SUBSCRIBER unconditionally | Canonical dependencies now include mode separation, HEARD, COLLAPSE, and DIAG; the future probe result is still unknown | Preserve Blocked state and the PASS/PARTIAL/FAIL routing. Re-specify against isolated Narrate; a HEARD PASS makes this a retirement candidate |
| RR-05 | Prerequisite normalization | The five sequenced items now use canonical register IDs; all four former tasks depend on READER-MODE-SEPARATION-2, and SUBSCRIBER explicitly depends on HEARD | Structured lookup repaired during owner-directed reprioritization; retain qualitative probe-verdict gates in prose |
| RR-06 | Certifying all discovery bugs closed in the running app | EXT-PAIR item close-out says smoke pending; session close-out says fixed; BUG_REPORT retains pending caveat | Reconcile retained smoke evidence or conduct a new bounded first-pairing smoke when the running build is available; do not claim absent historical evidence |
| RR-07 | Editing shared working tree during implementation | Unrelated dirty IDE, lessons, check-in, and perf-baseline files; many preserved worktrees | Use an isolated implementation checkout and explicit file staging after admission; no cleanup or wholesale staging |
| RR-08 | Legacy auto-push conflict | ROADMAP/CLAUDE now state registry policy: exact-path local commits, networkOperations=ask | RESOLVED in current dispatch guidance; no Git mutations performed |
| RR-09 | Duplicate SRL-090 and split lesson sources | Active compensation rule uses a descriptive label; registered lessons received append-only corrections; dirty retrospective preserved | Active ambiguity RESOLVED; physical consolidation remains a separate governance task |
| RR-10 | Adding cursor lag based on the old diagnosis | constants.ts:119 is 450 ms trusted lag, :113 is 350 ms heuristic lag; scheduler tick/getAudioProgress already consume these. Historical memo states trusted lag is 350 ms and assumes the visual path is uncompensated | After mode separation, trace the new publication/consumer ownership and measure residual before selecting or adding delay; avoid double compensation |
| RR-11 | Claiming adapter scaffolding establishes independent reading modes | Narrate still aliases Flow; shared hooks/container retain mutable state, refs, callbacks, and rendering effects | READER-MODE-SEPARATION-2 is the owner-mandated first item. Prove private mode runtimes, explicit copied-value handoffs, and full transition/stale-callback isolation before downstream fixes |

## Historical reconciliation batch — approved and applied
The owner approved and the review added four already-completed records to Monday with no sequence: SK-HYG-2 (2026-05-16), FLOW-ZONE-AUTO (2026-05-19), READER-MODE-ISOLATION-1-PHASE-0 (2026-05-21), GOVERNANCE-SWEEP (2026-05-22). The audit cites their close-outs/commits. The two already-dissolved register records were added to the roadmap summary. All four external creations were read back and confirmed. The register now has 56 records. These changes repair history; none is new delivery.

## Evidence and disposition
- [Owner-directed mode separation](../../planning/roadmap-reviews/2026-09-23-mode-separation.md)
- [Phase C plan](../../planning/roadmap-reviews/2026-09-23-plan.md)
- [Phase A audit](../../planning/roadmap-reviews/2026-09-23-audit.md)
- [Migration verification](../../planning/roadmap-reviews/2026-09-23-monday-migration.md)
- [Terminal candidate handoff](../../planning/roadmap-reviews/2026-09-23-terminal-backfill-review.json)

Monday migration itself is complete: 52 records, 832 matching field values after documented transforms, all 56 external mutations confirmed, no outstanding recovery entries. HYG-XLSX-DASHBOARD-RESTORE was explicitly superseded by the owner's switch to Monday, and its full spec is retained. No other live item was retired.

The register now contains 57 records. READER-MODE-SEPARATION-2 is the queued head with a Full Spec; the four existing narration/UX items are blocked and marked Stub pending re-specification. Their previous full specs are retained intact in the dated pre-isolation archive. All five sequenced items have resolvable prerequisite IDs and valid roadmap anchors.

No application tests or live QA were run. Historical test counts are not current environment evidence.

## Phase D completion
[Readiness findings](../../planning/roadmap-reviews/2026-09-23-readiness.md) and [phase brief](../../planning/roadmap-reviews/2026-09-23-phase-brief.md) record the final disposition. The head mutation was verified across 13 fields; the other 61 board rows were unchanged. Provider recovery is empty. No application implementation was dispatched.

Final reconciliation also normalized 16 non-ID/annotated prerequisite strings on 14 terminal records, preserving their original wording in notes. No disposition or sequence changed. The deferred export heading is visible to the cockpit parser. See the reconciliation plans, confirmations and final read under roadmapReviews.
