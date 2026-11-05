# Seven missing Spec Reference values — existing specification/evidence map

Date: 2026-11-02. Read-only planning/evidence audit; only this new report is authored. No provider, helper, source, runtime, test, status, Seq, completion or terminal-ledger operation.

## Scope and authority

Input inventory: `docs/governance/close-outs/Memo.Roadmap-inflight-inventory.2026-11-02.md`, derived from the full SQL census2026-11-02T22:39:26Z (202 rows,73 In Flight). Its seven blank fields are timestamped input findings, not a fresh live-register assertion. This audit did not read a provider file or snapshot and did not call the connector/helper. Parent must freshly read live revisions before any guarded reconciliation.

Registry read-only resolution from `Virtuoso/workspace-layout.json`: roadmap=`ROADMAP.md`; closeOuts=`docs/governance/close-outs`; issues=`docs/governance/bug-reports`; x-planningArchive=`docs/planning/.Archive`; workRegister is the live Notion connector. Archives and evidence are not independent live status authority. Inspected planning checkout HEAD: `cd85892a8bc044e756970a38aff489415ef72c31`.

**Finding: all seven have indexed existing specifications. None is a genuinely missing specification.** Six ROADMAP cards explicitly link the October23 snapshot; RELEASE-RUNBOOK-1 explicitly links the October23-2 snapshot. Do not author duplicate full specifications or move protected archive sections as part of pointer repair. No epic specification substitutes for these seven sprint specifications.

## Exact candidate field values

These values identify the full archived specification already selected by each current ROADMAP card. Actual explicit HTML anchors were checked in the target files. Values are proposals for a later parent-owned guarded transaction, not applied changes.

| Sprint Code | Proposed Spec Reference | Local location of full specification | Current ROADMAP pointer |
|---|---|---|---|
| BAND-ALIGN-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#band-align-1` | snapshot:2201, explicit anchor2199 | ROADMAP.md:565–570 |
| FOLIATE-OBSERVER-LEAK-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#foliate-observer-leak-1` | snapshot:2310, explicit anchor2308 | ROADMAP.md:574–581 |
| NARRATE-SENTENCE-INITIALS-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-initials-1` | snapshot:3049, explicit anchor3047 | ROADMAP.md:1365–1369 |
| PAGE-HELD-TURN-FAIL-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#page-held-turn-fail-1` | snapshot:1707, explicit anchor1705 | ROADMAP.md:517–521 |
| RELEASE-RUNBOOK-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#release-runbook-1` | snapshot-2:1108, explicit anchor1106 | ROADMAP.md:462–465 |
| RENAME-TMP-RACE-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#rename-tmp-race-1` | snapshot:1438, explicit anchor1436 | ROADMAP.md:493–497 |
| WS-PAIR-LOG-1 | `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#ws-pair-log-1` | snapshot:1791, explicit anchor1789 | ROADMAP.md:525–529 |

Snapshot SHA256s read in this audit:

- `ROADMAP_snapshot_2026-10-23.md`: `12a43b87d351ca91bb2edeb2a8dbdef95c9da381ef0d7fcfa7d43a12f97fb6d9`.
- `ROADMAP_snapshot_2026-10-23-2.md`: `8c5672ab693dcad74f5733beba2591d35678e7d447d087e54f4ae7421b475e71`.

ROADMAP records the six snapshot sections as retained from ROADMAP at6bd428e6, and the runbook section from27efb3a0. Those are existing provenance statements; this audit does not claim a new complete section-byte comparison against those historical commits. All seven inspected sections include Done-when criteria and Lessons applied. Six include Task list; the retained initials section does not. This maps existing specifications, not current U1–U10 dispatch readiness or a reason to alter that archive.

## Source and evidence map

Local Git objects were resolved/read without fetch, checkout or execution. Commit identities below establish available historical source/evidence objects, not current remote branch ownership, fresh ancestry acceptance, test reruns or completion.

All six held candidates carry `docs/governance/close-outs/Memo.<SPRINT-CODE>.GovernanceStaging.2026-10-23.md` at their listed commit; that exact full path is formed from the Sprint Code in each row. These memos are branch-resident and need not appear in the current checkout. They are governance staging/evidence, not terminal CloseOut records.

| Sprint | Available source/evidence commit | Inspected memo evidence and retained distinction |
|---|---|---|
| BAND-ALIGN-1 | `105a07c190b232caf40afdb42a6d23cc003add4c` | Memo records targeted167-pass, real-line-height packaged checks and suite2437/1. ROADMAP records owner tier2 approval2026-10-23. Band position/Part B belongs to BAND-ALIGN-2, not this Part A spec. |
| FOLIATE-OBSERVER-LEAK-1 | `5175927659228e2cf9c87cc74210e6d943371b41` | Memo records patch-package source/positive control and packaged observer checks. Current ROADMAP additionally records this candidate contained in combined package2d5772d3, held tip4ac4ff76: observer→visibility→lifetime. Do not integrate observer twice. |
| NARRATE-SENTENCE-INITIALS-1 | `c93f7c09186187b98ac6af83a7abce782e555517` | Memo records failing initial/era cases with opposite controls, narrate140-pass and full suite2447/1 on95ffc0cc. Snapshot names held sentence-resume35716c5f as branch base; later integration must preserve actual dependency order. |
| PAGE-HELD-TURN-FAIL-1 | `7ca5a4b75b903367194ade15e66ff5c934cc9b50` | Memo records reddcccdcc4, gap-range lost-turn detector and44-pass page-position suite. Built atop TOC-JUMP-SAVE-1db03f2f5; current ROADMAP preserves that same-file merge order. |
| RENAME-TMP-RACE-1 | `b37d199b03409d34e48fc7da160fb88686a15313` | Memo records red9052a19e, targeted48-pass and suite2431/1 plus typecheck/build onafd80266. Current ROADMAP identifies serialized JSON-writer repair as built/held. |
| WS-PAIR-LOG-1 | `4944def692ea3275aeb0f9365b5af8734b0044c0` | Memo records red318e19c8, unavailable-encryption controls, targeted50-pass and suite2442/1. Current ROADMAP orders it after WS-TOKEN-REGEN-1, before library-write chain. |

### RELEASE-RUNBOOK-1 evidence is already in the current checkout

- Available merge object: `3872c6e8b75c8c6656036ed09d1f84c10c97542a`.
- Actual deliverable: `docs/governance/RELEASE_RUNBOOK.md`.
- Staging/evidence: `docs/governance/close-outs/Memo.RELEASE-RUNBOOK-1.GovernanceStaging.2026-10-22.md` (also exists at the merge object).
- Historical issue: `docs/governance/bug-reports/Issue.RELEASE-RUNBOOK-1.2026-10-22.md`; timing evidence: `docs/governance/close-outs/Timing.RELEASE-RUNBOOK-1.jsonl`.
- Memo records owner choiceB, separate full architecture installers; owner-directed removal of version-bump requirement;11 sections replacing the original12 requirement. Historical installer issue text is not the last word: current ROADMAP records accepted BCJ ARM64 installer fix and gate12 met, while terminal close-out remains held for the smoke's ARM64 row.
- The current runbook card lacks an adjacent explicit release-runbook anchor (the preceding retained anchor is rename-retry-1). The archived explicit release-runbook-1 anchor is therefore the direct full-spec pointer; do not target the unrelated preceding anchor or manufacture an anchor edit in this audit.

## Closure and later reconciliation boundary

The absence of a register Spec Reference is an indexing defect, not proof of unbuilt work. Conversely, an existing full spec and green historical memo are not acceptance of moved-main integration or completion.

For these seven items, no item-named terminal `CloseOut.<ID>.*` was found in the inspected current closeOuts directory. Existing branch staging memos remain available as mapped above. This is a scoped local directory observation, not an exhaustive search of every remote branch or external artifact store.

The current integration interpretation is recorded in `docs/governance/bug-reports/Issue.ROADMAP-RELEASE-ORDER.2026-11-02.md`, Decision section, and `docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md`: owner-approved integrated RC scope supersedes old release-first ordering, while actual branch/wave admissions, moved-main reconciliation, prescribed fresh rule53/ARM64 evidence, Brain confirmation and designated merge gos remain. Historical snapshot freeze/design-pending text is preserved history and must be read alongside later rulings; pointer repair must not silently reimpose or lift a gate.

Recommendation for parent review: reconcile only these seven Spec Reference fields to the exact existing full-spec targets after a fresh SQL read, revision check, mutation plan and complete readback/confirmation. Do not change Status, Seq, prerequisites, completion dates, source state or evidence claims; do not create duplicate specifications. Existing branch-memo evidence may be indexed in a separately scoped reviewed transaction, with historical versus current acceptance clearly distinguished. No provider change is authorized by this report itself.
