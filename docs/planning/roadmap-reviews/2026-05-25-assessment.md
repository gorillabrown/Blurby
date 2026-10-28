# Roadmap Assessment — 2026-05-25

## Finish Line

`TTS Quality Confidence + Reading Experience v2` remains correct. The active phase is **Reader Runtime Solidification** — isolate Page/Focus/Flow/Narrate behind adapter ownership so cross-mode fixes stop ricocheting, then close the deferred Narrate audio-truth defect where the surgery is safe.

## Health Read

**Status: GREEN (with one watch item).**

The risk profile that was YELLOW/RED on 2026-05-22 (a branch green in automation but red in live UI) has resolved. The persistent-anchor repair lane closed by explicit disposition with S1/S4/S8/S12/S18 fixed and verified by screen QA, and the two behavior-preserving isolation slices (1A, 1B) landed with the suite green (2,894 tests). The one known correctness defect — S13 Narrate cursor/content sync — is no longer an open thrash: Step 3.6 proved it is a single closed-loop "no signal for what was actually heard" problem and it is now an explicit, properly-sequenced post-isolation sprint (`NARRATE-CLOSED-LOOP-CURSOR`).

**Watch item:** the eager-spec buffer is at **2 full specs (1C, 1D) against a target of 5.** This is the primary action of this review.

## % Work Remaining (LOE, t-shirt S=1 / M=3 / L=8)

Active path (7 sprints, 37 pts):

| Bucket | Sprints | Pts |
|---|---:|---:|
| Adapter isolation core (1C, 1D, 1E) | 3 | 19 |
| Narrate closed-loop (post-isolation) | 1 | 8 |
| Governance follow-up (GOV-HUMAN-REVIEW-1) | 1 | 1 |
| Quality gate (TTS-QUAL-CI-1) | 1 | 1 |
| UX polish (UX-POLISH-1) | 1 | 8 |
| **Total active** | **7** | **37** |

Reader Runtime Solidification phase specifically: ~25 pts completed (REPAIR 8, 1A 3, 1B 8, BASELINE-SYNC-1 3, TEST-GREEN-1 3) vs ~28 pts remaining in the isolation+governance core → **roughly half the solidification phase remains by LOE.** CI + UX polish (9 pts) belong to the two following phases.

## Pace

3 sprints completed in the 3 days since the prior review (REPAIR closed 05-24, READER-ISO-1A 05-24, READER-ISO-1B 05-25), on top of six manual-QA repair rounds (3.1–3.6). That is **~1 sprint/day plus heavy diagnostic QA — ahead of pace.** Caveat: the remaining critical path is serial and gated (1C → 1D → 1E → NARRATE-CLOSED-LOOP), and two items are L. Realistic isolation-core burn-down is ~6–8 working days at current velocity.

## Scope Discipline

Baseline = 2026-05-22 Active set (9): REPAIR, 1A, 1B, 1C, 1D, 1E, GOV, CI, POLISH.
Current Active set (7): 1C, 1D, 1E, NARRATE-CLOSED-LOOP, GOV, CI, POLISH.

| Delta | Item(s) | Class |
|---|---|---|
| Completed | REPAIR, 1A, 1B | Forward (3) |
| Added | NARRATE-CLOSED-LOOP-CURSOR | Forward — discovered scope, properly deferred (1) |
| Carried unchanged | 1C, 1D, 1E, GOV, CI, POLISH | — |
| Re-specced sideways | none | 0 |
| Un-completed / backward | none | 0 |

**Scope-discipline score = 100% forward (4/4), 0 sideways, 0 backward — healthy (>80%).**

`NARRATE-CLOSED-LOOP-CURSOR` is the only addition. It is not drift: six patch rounds proved the Narrate defect is one closed-loop problem that cannot be safely fixed before adapter isolation. Adding it as one explicit post-isolation sprint *replaces* open-ended pre-isolation thrash with a single sequenced fix — the disciplined move, consistent with the 2026-05-22 finding that "manual QA found product-visible defects that automation missed; that is real scope, not drift."

## Key Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Buffer at 2/5 full specs | `/next-pointer` and dispatch readiness degrade beyond 1D | Phase D promotes 1E, GOV, CI to full spec |
| NARRATE-CLOSED-LOOP cannot be fully specced yet | Edit sites depend on the Narrate adapter (1E) that does not exist | Keep as flagged buffer gap; spec it at the 1E close-out, not now |
| Flow adapter (1D) regressing Narrate | Flow has repeatedly disturbed Narrate via shared scroll/cursor paths | 1D spec forbids Narrate truth-sync changes; SRL-060 live-audio gate |
| Treating the ~9ms boundary-drift metric as sync proof | It is self-referential (cursor-vs-schedule) — masked the defect for 4 rounds | SRL-070 standing rule: heard-audio is the only Narrate sync ground truth |

## Recommendation

Health is GREEN; the architecture is converging exactly as designed. The single corrective action is buffer replenishment. **Promote READER-ISO-1E, GOV-HUMAN-REVIEW-1, and TTS-QUAL-CI-1 to full specs** (reaching 5 full specs: 1C, 1D, 1E, GOV, CI), hold `NARRATE-CLOSED-LOOP-CURSOR` as a flagged buffer gap to be specced at 1E close-out, and promote SRL-070/071/072 into the Standing Rules. No resequencing of the conveyor is warranted — the current order is dependency-correct.
