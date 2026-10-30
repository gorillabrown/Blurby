# Roadmap review 2026-10-30 — Phase D lessons applied

Provenance:
- Lessons: `docs/governance/LESSONS_LEARNED.md` (prefix LL), 118 live.
- Close-outs: `docs/governance/close-outs`, 86 read.
- Computed: 2026-10-30 through the qualified helper root (rule 11a guard PASS).
- Previous complete review: 2026-10-27.

## Live lessons applied by the specifications this review wrote

**NARRATE-PAUSE-CANCEL-1** (`docs/planning/specs/2026-10-30/NARRATE-PAUSE-CANCEL-1.md`). U9 PASS, 18 cited: LL-142, LL-152, LL-165, LL-031, LL-109, LL-169, LL-066, LL-106, LL-007, LL-161, LL-160, LL-143, LL-132, LL-157, LL-159, LL-021, LL-034, LL-122. Material effects:
- **LL-152:** the same harness, byte-identical, for base and after. No (S) extension (Brain1 R1).
- **Standing rule 55 (LL-151/166):** the R2 checker must FAIL on all 3 base runs before its PASS counts.
- **LL-165:** scratch userData is proved before input.
- **LL-007:** the preload security note; the method takes a string prefix only.
- **LL-157/159:** the cancel is distinct from shutdown and acknowledgement semantics.
- **LL-142:** no estimated timing in the D6 and gap figures.

**BAND-ALIGN-2 R7:** see its amendment's own Lessons applied section and U9 output, recorded in the phase brief.

## Existing specifications re-checked (D.4.5)

`lessons --check` against ROADMAP.md, U9 PASS for each:

| Item | Cited |
|---|---|
| NARRATE-CPU-PROFILE-1 | LL-142, 151, 152, 160, 162, 165, 166 |
| PAGE-ENTRY-KEYS-1 | LL-031, 080, 160, 161, 165 |
| NARRATE-ARROW-PAUSE-1 | LL-138, 146, 149, 158, 161, 165, 166, 167 |
| PAGE-PAGES-READ-1 | LL-138, 149, 152, 156, 158, 165, 166, 167 |
| LIBRARY-WRITE-RACE-3 | LL-138, 146, 149, 156, 158, 165, 166, 167 |
| NARRATE-PAUSED-CLICK-1 | LL-031, 072, 073, 108, 109, 160, 161, 165 |
| FOCUS-WORD-ONLY-1 | LL-090, 120, 165 (card gains the R7 sequencing note) |
| POSITION-PROMPT-COPY-1 | LL-073, 090, 165 |

U9 alone does not clear prerequisite, source, package, execution-environment or release gates.

## Promotion candidates (D.4.2)

`lessons --candidates` returned the same 12 as on 2026-10-27 (86 close-outs both times; no close-out was filed since): LL-006, 024, 088, 093, 109, 121, 137, 139, 142, 150, 154, 157.

There is no new evidence, so each keeps its 2026-10-27 disposition: retain as an Observation, or keep the prior disposition, for the reasons recorded in `2026-10-27-lessons-applied.md`. No promotion, retirement or status append, and no candidate left undecided.

## Standing rules changed (D.4.3)

No lesson was promoted. Two placement amendments were recorded on standing rule 53's temporary-placement note:
- the owner's RodneySr placement (2026-10-30);
- Brain1's R-2026-10-30-2, which moves the arm64 launch to merge time.

Rule 53's standing text is unchanged.

## Learning figures, against 2026-10-27

| Figure | 2026-10-30 | 2026-10-27 |
|---|---|---|
| Live lessons | 118 | unchanged; no close-outs since |
| Lesson yield | 1.66 per close-out | same inputs |
| Held rate | 0.98 (153 applied) | same inputs |
| Promotion rate | 0.12 | same inputs |
| Time to apply | 3.5 days median | same inputs |
| Effort calibration | 0.56 (8 records) | — |
| Row error | 0.90 (134 rows) | — |
| Total error | 0.79 (16 runs) | — |
| Added share | 0.59 | — |

The 2026-10-27 report did not tabulate the estimate figures, so they cannot be compared. NARRATE-PAUSE-CANCEL-1 shows the estimate weakness directly: the helper total is 27 m of agent time, against about 5 h of RodneySr wall clock, and both are recorded in the spec.

## Close-outs since the last review without a lesson

None. The only close-out since 2026-10-27, FOLIATE-DISPLAY-LIFETIME-1's held record, passes the lessons gate.
