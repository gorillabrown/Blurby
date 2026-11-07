# Roadmap review 2026-11-06: Lessons applied

*Provenance.* The registered `lessons` role (`docs/governance/LESSONS_LEARNED.md`), `lessons --candidates` and `kpis --json` through the provider (connector and snapshot, `notion:database/3f87c96cc31e800580cfe019c89a56ca`). The previous review with a lessons record is 2026-11-03-2.

## Specifications

This review wrote no new specification. It opened two stubs, which carry no U9 duty yet.

**D.4.5 result.** All 46 Queued items at Full Spec were checked with `lessons --check` and `timing --rows-from-spec`:

| Result | Count | Items |
|---|---|---|
| U9 and U10 pass | 31 | Includes the belt's first five Queued items. UNCERTIFIED-ANCHOR-HOLD-1 and XHTML-PARSE-MEASURE-1 failed U10 and gained task lists in this review |
| U9 pass, U10 fail | 14 | CFI-POSITION-CONSISTENCY-1, FLOW-SAVE-AS-YOU-GO-1, NARRATE-SAVE-AS-YOU-GO-1, FLOW-TOC-JUMP-WORD-1, FLOW-RESTAMP-CURRENT-1, FOCUS-RESTAMP-CURRENT-1, NARRATE-RESTAMP-CURRENT-1, AUTO-ARCHIVE-1, FOCUS-PAUSED-HANDOFF-1, BOOK-TYPE-SCALE-2, PDF-CANVAS-ARM64-1, EINK-NARRATE-VIEWPORT-1, LIBRARY-UI-TEXT-SIZE-1, SMOKE8-COVERAGE-RECHECK-1 |
| U9 and U10 fail | 1 | NATIVE-PATH-ATTESTATION-1 (parked; it has only a roadmap entry) |

U10 never blocks a dispatch and is always closable. The 14 specifications predate U10. Each dispatch closes its own gap at `/next-dispatch`.

## Promotion candidates: 22 decided

The test: promote when the lesson is general and no existing rule states it. An existing rule that already says it gets the status record and no new text.

| Decision | Lessons | Rule |
|---|---|---|
| New rule | LL-142 | 56 |
| New rule | LL-137 | 57 |
| New rule, merged | LL-160, LL-161 | 58 |
| New rule | LL-165 | 59 |
| New rule | LL-162 | 60 |
| New rule, merged | LL-117, LL-129, LL-139, LL-150 | 61 |
| New rule, merged | LL-029, LL-031, LL-109 | 62 |
| Already a rule | LL-006 (PR-10), LL-068 (the type and build gate), LL-088 (SRL-089) | 3, 1, 37 |
| Not promoted | LL-024, LL-093 | Flagged on shared tags alone, not on a second occurrence |
| Not promoted | LL-121, LL-154, LL-157 | Narrow. Reading-mode isolation, the one Notion tool and `main/quit-sequence.js` each already hold them |
| Keep as revised | LL-143 | Its two "did not hold" reports predate the 2026-11-02 revision, and both were runs that skipped the dry run. Rule 44 stands |

`lessons --candidates` will keep listing the 6 unpromoted lessons, because a decision not to promote leaves no record it can read. They are decided, not carried.

## F-002

Narrowed, still open. Details are in `docs/governance/Findings.md`. No lesson was merged or retired.

## Close-outs with no lesson and no reason

None. All 24 close-outs since the last review pass the lessons gate, GOV-SWEEP-FOLLOWTHROUGH-1 included.

## Learning figures

| Figure | 2026-11-03 and 2026-11-03-2 | Now |
|---|---|---|
| Lesson yield (per close-out) | 1.76 | 1.51 |
| Held rate | 0.98 | 0.98 |
| Promotion rate | 0.11 | 0.2 |
| Repeated-trap rate | 0.03 | 0.02 (inferred) |
| Effort calibration | 0.62 | 0.65 |
| Row error | 0.90 | 0.89 |
| Total error | not read here | 0.75 |

Live lessons fell from 142 to 126 because 16 were promoted. Row error stays near 0.9, so single-row time estimates remain poor. The two task lists this review wrote carry planning estimates of 2h30m and 2h45m, and the helper prices them at 15 and 17 minutes. Its medians span unlike work, so those totals read low.
