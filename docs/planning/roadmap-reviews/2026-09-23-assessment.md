# Blurby — Phase B assessment, amended by owner direction
Date: 2026-09-23.
Owner response: organize work into product lanes and make complete reading-mode separation step 1. The assessment and Phase C sequence now reflect that direction. The next ceremony checkpoint is the concrete Phase C plan.

## Provenance
Provider: connector+snapshot. Source: monday:board/18432450217. Snapshot: 2026-09-23T19:10:02Z, not stale.
Command: virtuoso_registry --root . --actor roadmap-review kpis --json.
Current output: [mode-isolation KPIs](2026-09-23-kpis-mode-isolation.json).
The earlier [56-item KPI snapshot](2026-09-23-kpis.json) remains historical evidence from before this owner-directed scope change.
Source baseline: main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8. No implementation, build, test run, or live QA was performed during the review.

## Assessment
The first problem to address is the modes' shared runtime ownership. Previous work created adapters and a routing shell but deliberately retained shared hooks, callbacks, anchors, and rendering lifecycles. The user's repeated cross-mode regression experience is consistent with the current coupling: Narrate is still mapped to Flow for compatibility, and common hooks/container own multiple modes' mutable state.

The first delivery stage is therefore complete separation of Page, Focus, Flow, and Narrate. Use matching public contracts and mirrored module layouts, with independent behavior implementations. Intentional duplication is acceptable. Future consolidation is a separate decision after isolation and parity are proven.

After that gate, re-evaluate narration cursor/window sync and rate-change audio on the isolated Narrate runtime, then finish the Space shortcut through the new public router. The heavy subscriber rewrite remains conditional on measured residuals. Separation itself is not proof that an existing audio defect is fixed.

## Product lanes
The six live Monday lanes are UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance. Each item has one primary lane. These are ownership categories, not permission to share mutable runtime state or execute overlapping changes in parallel. Definitions and remaining work are in [the lane report](2026-09-23-lanes.md).

## Current provider metrics
| Metric | Provider result | Meaning / limit |
|---|---:|---|
| Total items | 57 | Includes historical and deferred records plus the newly admitted mode-separation item |
| Queued | 1 | READER-MODE-SEPARATION-2, a planning stub |
| In flight | 0 | No implementation has begun |
| Blocked | 5 | Four downstream narration/UX items plus deferred export |
| Completed | 44 | Historical register claims |
| Dissolved | 6 | Retained history |
| Superseded | 1 | Obsolete Excel dashboard restoration |
| Unknown status | 0 | All implementation states mapped |
| Percent complete by count | 89.5% | The provider counts all terminal states, including dissolved/superseded. This is disposition coverage, not a release forecast |
| Total / completed effort | Not computable | Mode separation and four historical items have no effort; numeric values 1, 2, 3, 8 have no scale entries |
| Percent complete by effort | Not computable | Same missing inputs |
| Dispatch buffer target | 5 | Policy default |
| Dispatch buffer filled | 0 | The first five sequenced items are stubs; old specs were retained as reference pending re-authoring |

Effort is missing for READER-MODE-SEPARATION-2, SK-HYG-2, FLOW-ZONE-AUTO, READER-MODE-ISOLATION-1-PHASE-0, and GOVERNANCE-SWEEP. No effort total or duration is inferred.

## Pace and scope discipline
**No deadline is declared.** The provider returns an empty pace list and no invalid deadlines. Pace against a date, a required rate, and a projected finish are not computable for a declared finish line.

No source implementation landed on main after the July planning review. For that interval, observed merged product deliveries forward / sideways / backward are 0 / 0 / 0; the scope-discipline ratio is not computable because its denominator is zero.

The current change is an explicit owner-directed foundation requirement, not new delivery credit: mode separation precedes the prior fixes. The scope cost is real and still unsized. Monday migration and historical reconciliation are administrative support. Deferred export, extension expansion, mobile/sync, RSS, and ideas have not been admitted.

## Evidence that remains relevant after isolation
- The trusted cursor lag is 450 ms in constants.ts:119; heuristic lag is 350 ms at :113. Scheduler tick/getAudioProgress already consume those constants. The old memo's assumed uncompensated 350 ms path must be re-traced, avoiding double compensation.
- A5 position held 3-of-3 in the historical gate; clean audio did not. The reported 1.4x overlap is a separate residual.
- Page-mode Space currently reaches a no-op; the future fix should call the separated router's public entry contract.
- EXT-PAIR individual and session close-outs disagree about smoke completion. Preserve and reconcile evidence.
- The terminal ledger remains empty, with 51 candidates routed for close-out; 11 lack dates/evidence. Roadmap-review has correction permission, not ordinary append permission.
- Existing dirty files, preserved worktrees, and unverified runtime environment remain distinct from specification readiness.

## Planning decision
[Phase C](2026-09-23-plan.md) makes READER-MODE-SEPARATION-2 the first stage, describes its five extraction/verification waves, and holds the four dependent items. This reflects the owner's requested priority. The prior probe-first overall sequence is superseded; the probe remains first within the later narration work.

No application changes, Git commit/merge/push, or implementation dispatch occurred.

## Final Phase D update
Phase C was explicitly approved; the mode-separation head now has a full specification (XL) and passes U1–U8. Buffer is 1/5; four dependent stubs remain blocked. Final provider snapshot 2026-09-23T19:33:07Z: 57 items, 44 Completed, 6 Dissolved, 1 Superseded, 1 Queued, 5 Blocked. Missing effort is now four historical records, not five; numeric scale gaps remain. Earlier figures above describe the pre-specification assessment snapshot. See [final phase brief](2026-09-23-phase-brief.md) and [final KPIs](2026-09-23-kpis-final.json).
