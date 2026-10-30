# Roadmap review 2026-10-30 — Phase B assessment

## Provenance

- Metrics: `virtuoso_registry kpis --json` through the qualified helper root (rule 11a guard PASS). Provider connector+snapshot, `notion:database/3f87c96cc31e800580cfe019c89a56ca`, snapshot `takenAt` 2026-10-28T19:04:46Z.
  - The helper marks the snapshot stale (46.8 h, limit 24 h).
  - The 2026-10-30 live SQL census in the audit matched it on every active row's status, Seq and Spec State, so the counts below hold for today.
  - The snapshot is re-imported before any Phase D write.
- Lessons figures: `docs/governance/LESSONS_LEARNED.md`; 86 close-outs read; ledger `docs/governance/terminal-ledger.jsonl`, as of 2026-10-30.

## B.1 Work remaining

| Metric | Value |
|---|---|
| Items | 197: Completed 71, In Flight 68, Queued 42, Dissolved 9, Superseded 6, Blocked 1 |
| Percent complete by count | 43.7 % |
| Percent complete by effort | **Not computable.** Effort is missing for 24 items: BLURBY-SERVER-1, BOOK-TYPE-SCALE-2, DROPDOWN-DISMISS-1, EINK-APPEARANCE-2, EINK-DEVICE-SETTINGS-1 and others; all are Stubs or diagnosis items with no Effort value. |
| Dispatch buffer | Target 5. The helper counts 4 Full-Spec queued items at the head of its eligible list and 0 that pass U9 as dispatch-ready. |

The count understates delivery. Most of the 68 In Flight items are built or merged and wait only on the Stage 8 freeze, release gates or package confirmation; none has crossed to Completed. The finish line is a release gate, not item throughput.

## B.2 Pace

No deadline is declared (`policy.roadmap.deadlines` is empty), so pace against a date is not computable. The owner's 2026-10-30 mandate is "advance to completion", with no date.

## B.3 Scope discipline (since 2026-10-27)

- **Delivered:** no item reached a terminal state. Forward 0, sideways 0, backward 0. The score is 0/0, so it is not computable.
- **Work delivered but not yet terminal:**
  - NARRATE-QUIT-LINGER-1 (b): built and held at `5de476ce` on RodneySr. Rule 53 (b)–(d) passed on x64; 9 of 9 relaunches during the linger reopen, against 0 of 8 at base. Package confirmation and Rodney's arm64 launch are pending.
  - Governance: the RodneySr placement note and the Rodney/git alignment commits. These are sideways, with no register entry.
- **Scope added** (listed, not scored):
  - AGENT-PROTOCOL-CONSOLIDATION-1, owner directive 2026-10-28: sideways, tooling.
  - The NARRATE-QUIT-LINGER-1 (a) split, pause cancel, opens in Phase C: forward, because it is a Narrate defect reproduced in 3 of 3 runs.
  - NATIVE-PATH-ATTESTATION-1 and BLOCK-TEXT-ORDER-1 were registered by the 2026-10-27 review and were counted there.
- **Scope removed from the critical path:** R-2026-10-30-1 takes NATIVE-PATH-ATTESTATION-1 off FOLIATE-DISPLAY-LIFETIME-1's prerequisites and off the visibility package's path. It is parked, not withdrawn: Queued, with nothing deleted.
- **Holding bay:** 0 open entries. Nothing absorbed or withdrawn.

### Carried from the previous review

The 2026-10-27 lessons-applied report rechecked five cards (U9 PASS) and gave all twelve computed promotion candidates an explicit disposition. No candidate was left undecided, so nothing new is carried into D.4 from it.

### Open findings, open across two reviews

These findings in `docs/governance/Findings.md`, from the 2026-10-26 governance sweep, are still open and were not dispositioned at 2026-10-27. Proposed dispositions, to be appended in Phase D:

| Finding | Proposed disposition |
|---|---|
| F-001 Held-state evidence reconciliation (+ its 2026-10-26 outcome entry) | **Accepted with reason.** The seven build/package evidence gaps are owned by each item's own rule 53 verification and are not presumed delivered. RodneySr now runs those package checks. |
| F-002 Lessons hygiene needs semantic review | **Accepted, deferred.** No semantic dedup without a reviewed pass. Revisit at the next review that has close-outs to read. |
| F-003 Legacy close-out template links | **Accepted.** Both legacy copies are preserved, and no canonical replacement is guessed. |
| F-004 Physical roadmap order vs Seq | **Accepted.** The live Seq is the authority, and physical card order is presentation. |
| F-005 Uncovered classifications / local infrastructure | **Accepted.** Preservation items; never deleted automatically. |
| F-006 Structured workstream migration deferred | **Fixed by a planned item.** It is the source of preflight's standing `roadmap.lanes` warning. Proposed: fold the reviewed `lanes` → `workstreams` rename into AGENT-PROTOCOL-CONSOLIDATION-1's governance scope, or a small governance item after it. |
| F-007 Verification exclusions | **Accepted.** A documentation-only sweep never claimed runtime verification. |
| F-008 Footprint candidates need ownership | **Accepted.** Matches rule 10: no workspace deletion without an explicit request. |

### Board comments

0 open board comments.

## Learning figures (2026-10-30)

- Live lessons: 118.
- Lesson yield: 1.66 per close-out; 8 of 86 close-outs said they had no new lesson.
- Held rate: 0.98 of 153 applied lessons.
- Promotion rate: 0.12.
- Median time to apply: 3.5 days.
- Repeated-trap rate: 0.03 (inferred).
- Effort calibration: 0.56, actual ÷ estimate, median of 8.
- Row error: 0.90 median over 134 rows. Total error: 0.79 over 16 runs. Added share: 0.59.

Estimates remain weak: a median 79–90 % error, with most working minutes spent on rows added after the first listing.

## Opinion

The project is gate-bound, not build-bound. The critical path to the Stage 8 release now runs through RodneySr's three jobs:
1. NARRATE-QUIT-LINGER-1 (b), package confirmation;
2. FOLIATE-DISPLAY-LIFETIME-1, native routes;
3. the combined visibility, observer-leak and display-lifetime candidate under full rule 53.

After those come the held merge train once the freeze lifts and the owner's gate (2) smoke re-run. R-2026-10-30-1 removes the largest open-ended blocker, the native-observation qualification. The main risk is the single host: every long run is serialized on RodneySr while GoG holds Rodney.
