# Blurby — restart phase brief
Date: 2026-09-23.
Ceremony: Phase A audit applied; assessment amended by the owner's lane/isolation direction; Phase C explicitly approved; Phase D specification and readiness review completed with recorded buffer and governance gaps.

## Where the project stands
The app remains at source baseline main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8, package 1.75.1. The latest landed source implementation is the A5 rate-change position fix from May 31, merged June 1; the July main tip is planning/governance. Historical A5 position QA passed 3/3, while the 1.4x audio-overlap finding remains open. Cursor/highlight synchronization still lacks a validated repair.

The completed ISO-1 series supplied contracts, routing and three adapters. It left shared mutable hooks, visual state and lifecycle code in place. The owner has now made full Page/Focus/Flow/Narrate runtime separation the first delivery gate.

## Delivery sequence
Group: Reader Runtime Solidification. Goal: independent reading modes, followed by TTS Quality Confidence + Reading Experience v2.

| Seq | Descriptive work / ID | Lane | Specification / current gate |
|---:|---|---|---|
| 1 | **Separate all four reading-mode runtimes** — READER-MODE-SEPARATION-2 | Reader Engine | Full Spec; rubric PASS; begin with clean checkout and baseline admission |
| 2 | **Align highlighting and follow with heard audio** — NARRATE-HEARD-CURSOR-1 | TTS / Narration Engine | Blocked Stub; separation then fresh audio-grounded probe and specification |
| 3 | **Preserve position and clean rate-change audio** — NARRATE-APPLYRATECHANGE-COLLAPSE-1 | TTS / Narration Engine | Blocked Stub; separation then re-specification; preserve A5 position behavior |
| 4 | **Conditional cursor publication cleanup** — NARRATE-SUBSCRIBER-CURSOR-1 | TTS / Narration Engine | Blocked Stub; separation, earlier items and HEARD verdict; no unconditional rewrite |
| 5 | **Make Space resume the saved mode** — UX-POLISH-1 | UX polish | Blocked Stub; separation then public-router implementation |

KOKORO-EXPORT remains blocked/deferred without a sequence. Library & Content and Platform & Maintenance complete the owner's four product lanes; Chrome Extension is a distinct lane with its existing completed/deferred scope. The six lane views are verified against the register; product lanes do not override overlapping-code serialization.

## First dispatch: five serial waves
A: lock source/build behavior baselines, complete ownership/import census and versioned contracts.
B: extract Page and Focus with independent state/view/controller/binding modules.
C: extract Flow, proving it runs without audio services.
D: extract Narrate's own surface, audio bridge, anchor and callback lifecycle.
E: remove old shared behavior and prove the complete isolation/transition matrix.

The modes use matching structures and lifecycle APIs, private implementations, copied-value handoffs and session-checked side effects. Runtime/view/CSS sharing across modes is excluded. The router owns selection and public routing only. Later consolidation is a separate owner decision.

Acceptance includes zero forbidden dependency edges, private resource ownership, 12 directed transitions plus four same-mode selections, word zero, delayed extraction, document switches, stale callback rejection, unchanged unaffected-mode baselines, full type/test/build checks, and per-mode live UI/audio evidence. Existing sync and 1.4x overlap defects remain documented exceptions pending the later work; extraction earns no claim that they are fixed.

## Five readiness findings
| Finding | Result |
|---|---|
| Specification | The head passes U1–U8, with no project extensions; exact sources, test assertions, commands, failure ceilings and rollback are inline |
| Prerequisites | Head's ISO-1A/B/C/D/E prerequisites are Completed; successors wait on the unfinished head and their stated additional gates |
| Repository | Named eb/reader-mode-separation-2 branch/base and explicit-path plan; isolated execution checkout still to be created; unrelated primary-tree work preserved |
| External register | Monday readable/writable; head's 13-field mutation plus 28 historical-prerequisite/note field updates read back and confirmed; canonical snapshot refreshed; recovery empty |
| Execution environment | Node/npm and local test/build/Electron tooling present; no application suite, build or live QA executed by this review; baseline and live access are gates |

**Buffer: 1 rubric-ready specification of target 5.** D.2 stops eager authoring at the hard isolation dependency. Four blocked stubs are an explicit buffer gap; they require the future isolated runtime's real edit sites. No further owner decision is needed to understand this plan.

Effort for the first item is XL across five serial waves. Estimated elapsed buffer duration is **not computable**: no calibrated effort-to-time conversion exists, and the full five-item buffer is blocked. No delivery date was invented.

## Metrics and provenance
All register figures below come from Virtuoso's provider KPIs, **connector+snapshot**, source **monday:board/18432450217**, observed **2026-09-23T19:33:07Z**; see [final KPIs](2026-09-23-kpis-final.json) and [connector read](2026-09-23-review-final-read.json).

- 57 register items: 44 Completed, 6 Dissolved, 1 Superseded, 1 Queued, 5 Blocked, 0 In Flight, 0 unknown.
- Provider terminal-by-count result: 89.5%. This includes dissolved/superseded items and is not a release-readiness or product-completion percentage.
- Total effort, completed effort and effort-weighted completion are not computable: four historical rows lack effort, and numeric sizes 1/2/3/8 lack scale entries.
- Pace/deadline verdict: not computable because no deadline is declared; no required-rate forecast is reported.
- Scope-discipline ratio for newly delivered work since the prior July review: not computable, with zero new landed implementation deliveries and zero denominator. The owner explicitly added mode isolation scope; it has not been implemented and is not counted as delivery.

The five original sample board rows are excluded from register totals because they have no Sprint Code. Lane counts are 2 UX, 36 TTS, 10 Reader, 1 Chrome, 0 Library, 8 Platform, from the same final register snapshot.

## Lessons applied and main risks
The [lessons review](2026-09-23-lessons-applied.md) locks baseline/live gates, exact anchors, cancellation identity, private visual ownership, serial dependent work, and independent heard-audio evidence. It corrects the stale trusted-lag value to 450 ms and disambiguates the SRL-090 collision without overwriting the dirty retrospective.

1. Hidden shared state/rendering behavior can survive a directory split. The source ownership/import census, private view/style trees and stale-side-effect tests gate actual isolation.
2. Extraction can silently change current behavior. Separate baseline builds, preserved assertions, per-wave gates and scoped rollback prevent accepting a changed fixture as parity.

## Remaining governance and evidence work
- Terminal ledger: still empty. 51 historical terminal candidates are prepared, 11 missing dates/evidence. Ordinary append belongs to pointer-closeout under policy; the roadmap review did not impersonate that actor or fabricate corrections. [Handoff](2026-09-23-terminal-backfill-review.json).
- Chrome extension pairing: individual and aggregate close-outs disagree about smoke completion. Reconcile retained evidence or perform a fresh bounded smoke on the verified app build.
- Physical lessons-file consolidation and formal A5 close-out remain separate support work. Current active guidance has been corrected and source links retained.
- No code implementation, source commit, merge, push, build, test run or live QA was performed. Existing worktrees and unrelated changes were preserved.

## Deliverables
- [Live work register](https://estrattbrown.monday.com/boards/18432450217)
- [Inline separation specification](../../../ROADMAP.md#reader-mode-separation-2)
- [Audit](2026-09-23-audit.md), [assessment](2026-09-23-assessment.md), [approved plan](2026-09-23-plan.md)
- [Readiness report](2026-09-23-readiness.md), [lessons applied](2026-09-23-lessons-applied.md), [lanes](2026-09-23-lanes.md)
- [Outstanding issues](../../governance/bug-reports/Issue.ROADMAP-REVIEW.2026-09-23.md)
- [Generated planning cockpit](../../../Virtuoso/reports/planning-cockpit.html)
- [Final verification receipt](2026-09-23-final-verification.json)

The next implementation is Wave A of mode separation. The roadmap ceremony has prepared that work; it has not dispatched it.


## Final reconciliation note
The generated cockpit initially flagged 17 findings: an unrecognized deferred export entry and 16 historical prerequisite strings. The deferred item now has a recognized unsequenced roadmap heading. Fourteen terminal records were normalized to unambiguous prerequisite IDs; original wording remains verbatim in notes. No terminal status, sequence, date or evidence claim changed. Connector formatting normalization (blank long-text objects and three trimmed leading blank lines) is recorded in the readback receipt.

Cockpit validation: **zero roadmap/register drift**. Its automatic recommendation still calls for buffer replenishment at 1/5; this is the documented isolation dependency gap, not a newly discovered discrepancy or a request to repeat the ceremony.
