# Roadmap Review 2026-10-22 — Lessons Applied (Phase D.4)

**Provenance:** `lessons --open`, `lessons --candidates` (77 close-outs read) and `lessons --check ROADMAP.md --item <ID>`, all against `docs/governance/LESSONS_LEARNED.md` on `eb/rr-2026-10-22`. The learning figures come from the `kpis --json` learning block, as of 2026-10-22.

## New live lessons since 2026-10-14

LL-160 (runtime ICU), LL-161 (check a word by its text), LL-162 (sweep the whole corpus offline) and LL-163 (registry alias renamed upstream).

## Which specification applied which

| Item | U9 | Lessons it cites |
|---|---|---|
| PDF-IMPORT-DIAG-1 (new) | PASS | LL-138 (rule 43), LL-142, LL-146, LL-148 (rule 49), LL-160, LL-143 (rule 44), LL-136 (rule 41), LL-153 (rule 46); rules 47, 48 |
| ELECTRON-42-UPGRADE-1 | PASS | LL-160, LL-157, LL-159, LL-151, LL-152, rules 41, 43, 44, 46, 47, 48 |
| READER-VISUAL-DIAG-1 | PASS | LL-152, LL-142, LL-146, rules 45, 38, 41 |
| PAGE-POSITION-SAVE-2 | PASS | 17 lessons and rules, including LL-156, LL-158 and LL-159 |
| KF2-WAIVER-RETIRE-1 | PASS | LL-136, LL-143, LL-153, LL-156; control count amended this review under rule 50 |

- **Declined by all:** LL-161 and LL-162. That is right: neither applies to a PDF conversion fix, an Electron bump, a read-only diagnosis or governance work. They bear on the Narrate stubs (37–46), and the next specifications of those must cite them.
- **Tool warnings:** the tool warns `lesson-closed-cited` where a specification cites a promoted lesson by its LL number. The specifications name the rule beside the number, so these are left as they are.

## Promotions and retirements recorded

- **LL-148 → standing rule 49** ("A file never names the merge that lands it"). Held in four close-outs, and the previous review asked to revisit it on recurrence.
- **LL-156 → standing rule 50** ("A waiver moves with its code"). Held in two close-outs, and this review applied it again to KF2-WAIVER-RETIRE-1's control.
- **Kept as observations:**
  - LL-006: already standing rule 3's subject.
  - LL-024 and LL-093: their recurrences are older and narrow.
  - LL-088, LL-121, LL-139, LL-150 and LL-154: narrow; the specifications that need them cite them.
  - LL-137: encoding hygiene for tooling, applied by the planner's reads, not by specifications.
  - LL-142: the epic charter's principle, cited directly by every measurement specification.
  - LL-157: QUIT-FLUSH-1 built it into `main/quit-sequence.js`, so the code now carries it.
- **Retirements:** none.

## Learning figures

| Metric | 2026-10-14 | 2026-10-22 |
|---|---|---|
| Live lessons | see the 2026-10-14 record | 118 |
| Lesson yield | — | 1.75 per close-out (2 of 77 recorded no new lesson) |
| Held rate | — | 0.97 |
| Promotion rate | — | 0.07 (0.09 after this review's two) |
| Repeated-trap rate | — | 0.03 |
| Effort calibration | — | 0.5 (actual ÷ estimate, median of 7) |

## Close-outs since the last review without a lesson or a reason

None. NARRATE-REBUILD-1 recorded LL-160 to LL-162, and GOV-NOTION-MAPPING-1 recorded LL-163.

## Candidate for the next close-out

PDF-IMPORT-DIAG-1 should record the lesson this review found: a test that injects a fake for a third-party dependency proves nothing about the installed version's API. Keep one test per dependency that loads the real package. The defect shipped because all three `pdfToEpub` tests inject `_deps.pdfParse`.
