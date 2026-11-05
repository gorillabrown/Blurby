# Roadmap review 2026-11-02 — Phase B assessment

Status: assessment complete and approved by the owner; continued to Phase C. No source implementation, dispatch, freeze lift, runtime admission, merge go, release or live-register status/sequence change is granted here.

## Provenance and approved Phase A outcome

- Live register: Notion `notion:database/3f87c96cc31e800580cfe019c89a56ca`, connector+snapshot taken at **2026-11-02T16:34:52Z**, 202 rows. This is the full SQL census recorded by Phase A, imported through the qualified helper into the isolated current-main checkout. Metrics: `2026-11-02-kpis.json`; selection: `2026-11-02-next.json`.
- Governing baseline: published main **88e82ba59ccb93281c6c0b949e3ed4a826195897**, verified against a fresh remote read during this review. Review branch `eb/roadmap-review-20261102`, managed worktree `C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby`.
- Owner approved Phase A and the isolated-checkout/archive reconciliation. All seven report/evidence files were copied byte-identically from the primary checkout; originals and all pre-existing primary/execution changes remain in place.
- Preflight in this checkout is **ready**, zero project writes, **four overlays applied**. Its workstreams and Brain1 pointer are already the merged consolidation result, not new changes by this review.
- Completed consolidation card preserved as **3,320 exact bytes**, SHA256 `b825af19390347feab75416ac5d3466f4d5017cdac6973aa4852fb7c9ba453d5`, in `docs/planning/.Archive/ROADMAP_snapshot_2026-11-02.md`. It now has one completed-summary row and the same anchor; the following block-order anchor is retained. Roadmap: **2,011 → 1,996 lines**. Verification receipt: `2026-11-02-phase-a-reconciliation.json`.
- Incoming TR-087 was consumed without a duplicate append; the 87-record terminal ledger is unchanged. The holding bay now correctly reads **0 open / 6 closed**, including the already absorbed Business epic.
- Previous complete review: 2026-10-30. Metrics below are the helper's results; current delivery Notes are treated as reported package evidence, not rerun test results.

## B.1 Work remaining

| Metric | Current measured value | Meaning |
|---|---:|---|
| Total | 202 | All live-register identities |
| Completed | 72 | Recorded completed items |
| Dissolved / Superseded | 9 / 6 | Retired scope, not delivered product |
| In Flight | 72 | A mixture of merged/release-held, built/package-verified-held and unfinished work |
| Queued | 43 | Includes stubs, prerequisite waits, parked Native and the Business epic |
| Blocked status | 0 | Does not mean there are no holds |
| Live work | 115 | 72 In Flight + 43 Queued |
| Terminal by count | 43.1% | Helper result: includes all 87 terminal items, including retirements; not a release-completion percentage |
| Effort-weighted completion / effort remaining | **Not computable** | Effort absent for 25 records |
| Dispatch buffer | Target 5; filled 4; ready 0 | Helper's current window/checks; not a claim that no useful specification exists anywhere |

The helper buffer window starts with GOV-SWEEP-FOLLOWTHROUGH-1, PAGE-REOPEN-CFI-1, BOOK-TEXT-COLOUR-1, FOLDER-SWITCH-HEADER-1 and NARRATE-START-STACK-1. All five are In Flight; four carry Full Spec. The zero should not be interpreted as a new failure of the separate queued CPU/Page specifications or a need to rewrite built work.

The provider selects **NARRATE-CPU-PROFILE-1 (Seq95, Full Spec)** as the next queued item with terminal prerequisites. **PAGE-ENTRY-KEYS-1 (Seq119, Full Spec)** also has no unmet recorded prerequisite. Those facts establish queue/prerequisite eligibility only: actual specification currency, branch/custody, host access, applicable freeze and runtime admissions still need the five separate readiness findings.

Likewise, Native's Queued/Full Spec/no-prerequisite fields do not override its explicit parked/pause disposition. The Business epic's empty prerequisite field does not override its charter's start and merge gates.

### Missing effort inputs

The exact 25 missing records are: BLURBY-SERVER-1; BOOK-TYPE-SCALE-2; DROPDOWN-DISMISS-1; EINK-APPEARANCE-2; EINK-DEVICE-SETTINGS-1; EINK-FLOW-VIEWPORT-1; EINK-MODE-AVAILABILITY-1; EINK-NARRATE-VIEWPORT-1; EINK-VIEW-REFRESH-1; FLOW-ZONE-AUTO; FOCUS-PAUSED-HANDOFF-1; FOLDER-RETRY-FEEDBACK-1; FOLDER-SWITCH-CONTENT-1; GOVERNANCE-SWEEP; LIBRARY-CONTENT-DEDUP-1; LIBRARY-FOOTER-REMOVE-1; LIBRARY-UI-TEXT-SIZE-1; NARRATE-BAND-SPACE-1; NARRATE-SELECTION-START-1; PROFILE-QUEUE-ISOLATION-1; READER-MODE-ISOLATION-1-PHASE-0; READER-PAGE-COUNTER-1; SK-HYG-2; SMOKE8-COVERAGE-RECHECK-1; TRAY-ICON-SIZE-1. Missing historical effort must not be invented to produce a percentage.

## B.2 Pace and finish line

**No deadline is declared** (`policy.roadmap.deadlines` is empty; helper pace=[]). Required pace, ahead/behind status and a projected finish date are not computable. The owner's completion mandate is direction, not a dated deadline.

The finish line remains the accepted Stage 8 release on one exact integrated candidate. The header says **eleven gates**, but the detailed Stage 8 contract explicitly includes a **twelfth** condition, the written release runbook. Phase C should reconcile the summary to the full enumerated contract without dropping, adding or waiving an existing gate.

Gate(1)'s historical pass on 36ac7466 and branch-specific x64 checks do not qualify a changed integrated candidate. Owner gate(2) remains failed/partial until the relevant smoke checks pass on that approved candidate. The merge-time ARM64 launch allowance and RodneySr placement rulings remain as recorded.

### Delivery evidence now waiting on integration

| Work | Latest reported state in live Notes / current roadmap | Remaining boundary |
|---|---|---|
| Observer + visibility + display lifetime | Combined candidate 2d5772d3, held tip4ac4ff76; x64 package verified, BUG-222 withhold lifted | Observer → visibility → display-lifetime merge order; exact integrated package and merge-time ARM64 evidence |
| Quit linger relaunch | Held tip5de476ce, package9e428caf; x64 package verified | Post-freeze/post-release train and fresh merge-time checks |
| Narrate queued-job cancellation | Fix53adf994, packagecf093ab7; x64 verified | Stacked on quit-linger; preserve current integration order |
| Narrate gap-pause repair | Tip e3498f60, fix5d51d111; reported zero skipped words and 82–92ms resumes | Sentence-resume and sentence-initials branches first; resolve engine/runtime conflicts and revalidate |
| Flow/Focus band R7a/R8 | Tip e8e6de06; reported package verification and BUG-235 merge-block lift | BAND-ALIGN-1 then BAND-ALIGN-2; preserve subsequent Play dependency |
| Play from image-only cover | Tip ebea7311, packagec57a7b4f; x64 verified | Stacked on band and pause-cancel work; fresh integrated checks |
| APP-TABS-1 | Tip8539ec4c, original package48da10c8; built/held | Post-release; visibility source window/integration dependency and fresh checks |

This review has not reproduced those runtime measurements. It accepts that the named evidence exists in the register/published records, while preserving each item's non-terminal status. Final package records and fresh merge-time checks remain the relevant proof.

## B.3 Scope discipline since the previous complete review

- **One newly terminal delivery:** AGENT-PROTOCOL-CONSOLIDATION-1. Classify **sideways**, because it is execution/governance tooling rather than a shipped Stage 8 application fix. It is useful and owner-directed; the classification is not a criticism. No previous completed classification for this item is being reversed.
- **Recorded-terminal score:** forward0 / (forward0 + sideways1 + backward0) = **0%**, a narrow score over that one terminal event. It is not a productivity measure and omits the substantial built-and-held product evidence above.
- **Published governance work without a separate register identity:** package-verification records, amendments and epic charter/governance publication. List as sideways support work; do not count each commit as a delivered item or guess how many independent deliveries those commits represent. Their unitemized contribution makes a broader all-work scope score **not computable**.
- **Added scope, not scored:** NARRATE-GAP-PAUSE-1 and PLAY-FIRST-TEXT-1 are forward product repairs; BLURBY-BUSINESS-1 is a separate owner-approved product initiative, sideways relative to the Stage 8 release. The latter is already absorbed and chartered; do not re-create it.
- **No backward terminal transition identified** in the fresh register/ledger. Native remains parked, not dissolved; no source or receipts are discarded.
- **Holding bay:** no open entry after reconciliation. Business is not missing intake work; its charter/run constraints govern any later start.

## Open findings and learning obligations

F-009 was opened by the preceding review and remains open across this review. F-010/F-011 were opened in the subsequent consolidation close-out. None is silently closed here.

| Finding | Assessment and recommended Phase C/D disposition |
|---|---|
| F-009: Narrate latency on mainstream x64 | Carry into the existing CPU profiling item. Require actual same-host/candidate measurements and Brain1's technical disposition. Do not relax the ARM64-derived budgets merely because a branch passed or a different machine is slower. The gap-pause fix's strong warm-resume evidence does not by itself resolve the original click/speed-change figures. |
| F-010: five wording issues | Draft narrow corrections to documentation duty, role wording, primary architecture/temporary x64 placement and the Git reference. AGENTS.md/CLAUDE.md are writable by roadmap-review, but the **overlays role is explicitly read-only with allowedWriters=[]**. Overlay changes need a separately previewed authorized ownership/registry path; the finding's generic “ordinary governance edit” does not grant that permission. Do not rewrite the plugin or fork its protocols again. |
| F-011: timing helper writes outside fences | Preserve all backfill lines in their owning worktrees. Plan a bounded helper side-effect/actor-permission repair and a separate decision on historical lines; do not delete or broadly stage them. No timing call is run for this assessment. |
| LL-143 recurrence | The helper now explicitly says “revise or retire” after two failures to hold. Prefer strengthening the existing guard with base **and prescribed-result** checks; decide and record during D.4, not a duplicate rule or silent retirement now. |
| LL-151 / standing rule55 recurrence | It is already promoted; do not promote it twice. Consider a narrow command-name collision/alias check in the applicable governance tooling plan. |

The previous review dispositioned twelve promotion candidates, leaving none undecided. Fresh candidate output now has sixteen entries: LL-006,024,068,088,093,109,117,121,129,137,139,142,143,150,154,157. New relevant review signals include LL-068/117/129 and LL-143. Similar Applies-to text alone does not establish semantic duplication. D.4 will give every candidate a sourced disposition.

### Learning and estimate quality

Helper-reported current values: 120 live lessons; yield1.68 per close-out (87 close-outs, eight reporting no new lesson); held-rate0.98 over162 applications; promotion-rate0.12; median time-to-apply3.5days. Effort-calibration median actual/estimate0.62 (nine records); row-error0.90 (141 rows); total-error0.85 (17 runs); added-share0.58. Starting load is not computable because no bound startingLoad event exists. These historical figures are not a finish-date forecast or a budget grant.

Compared with the previous report: live lessons118→120; close-outs86→87; total-error0.79→0.85. Pricing remains weak. Use short bounded waves and measured source/package evidence; do not turn agent-time estimates into wall-clock promises.

## Opinion and recommendation

**Prioritize acceptance and integration of already-built release repairs over opening another large build.** Phase C should produce an explicit gate/merge dependency map, reconcile the twelve-condition release summary, identify what evidence is still missing on the exact integrated candidate, and preserve technical/owner authority.

Use existing CPU profiling to answer F-009 and retain Page keyboard-entry repair as a concrete queued candidate for later specification/readiness work. Neither starts merely because this assessment names it. Keep Business behind its charter's actual start and merge conditions, and keep Native parked with its expired clocks and paused monitor.

Governance maintenance should be narrow: address permitted F-010 wording through the appropriate writers, route read-only overlay ownership explicitly, and fence the F-011 tooling repair separately. Avoid another general agent-protocol migration: that work is already completed.

## Checkpoint and applied boundaries

Approve this assessment and continue to the delivery plan / revise / pause. Phase C is planning only. Approval does not authorize code implementation, runtime tests, a merge train, a freeze lift, publication, Business launch, new budget or Native resume.

Applied so far: owner-approved Phase A archive correction, copied/hash-verified reports, and canonical snapshot import in the new isolated checkout. No product source, terminal ledger, release gate, live register Status/Seq or unrelated primary-checkout edit has changed.

