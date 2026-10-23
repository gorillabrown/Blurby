# Roadmap Review 2026-10-23 — Lessons Applied

**Provenance:** `lessons --candidates` (82 close-outs read) and `lessons --check <spec> --item <ID>`, run against `docs/governance/LESSONS_LEARNED.md` on `eb/gov-roadmap-review-2026-10-23`. Learning figures come from `kpis --json` (snapshot 2026-10-23T17:12:10Z).

## New live lessons since 2026-10-22

- **LL-164:** a lesson-status write in an older specification can silently undo a newer promotion (KF2-WAIVER-RETIRE-1). Promoted below.
- **LL-165** (UI-SWEEP-TRIAGE-1, recorded at its close-out in this review): a driver must prove which profile the app opened before its first action.
- **LL-166** (the same close-out): a no-effect verdict needs a detector that reads state, and a press made where the control should act.

LL-165 and LL-166 bear on every live check in the buffer. JUMP-LANDING-SAVE-1, BAND-ALIGN-2 and FLOW-PARA-KEYS-1 already require the scratch-profile preflight (Brain's profile guardrail, 2026-10-23), which is LL-165's practice. They are cited at dispatch. The close-outs since then (RENAME-RETRY-1, JSONSTORE-TIMEOUT-1, CI-AUDIT-ALLOWLIST-1 and READER-VISUAL-DIAG-1) applied existing lessons and recorded no new one, each with a reason, and each passes the close-out lessons gate.

## Which specification applied which (the buffer, Seq 80–84)

| Item | U9 before | Change made here | U9 after |
|---|---|---|---|
| PAGE-SAVE-RESTAMP-3 | PASS (LL-138, LL-143, LL-156, LL-151) | none | PASS |
| JUMP-LANDING-SAVE-1 | PASS (LL-138, LL-143) | none | PASS |
| ZIP-ASYNC-READ-1 | **FAIL**: no Lessons applied section | added: rule 43 (the red test (za1)/(za2) committed alone), rule 36 (re-grep on the base), rules 47/48 (suite and build on the owner's machine), rule 50 (the adm-zip reachability note in `DEPENDENCY_ADVISORIES.md` re-read, unchanged), LL-158 (the cap is checked on the bytes actually read, at real size) | see below |
| BAND-ALIGN-2 | PASS (LL-138, LL-142, LL-152, LL-141) | none | PASS |
| FLOW-PARA-KEYS-1 | **FAIL**: lessons were an inline bullet, not the section U9 reads | moved into a `##### Lessons applied` section: rule 43, LL-142 (check before fixing), LL-152 (base and fix measured like for like in the live step), LL-146 (the red test lives in `tests/`, and any evidence copy is `.txt`), and reading-mode separation | see below |

- **Declined by all five:** LL-160 to LL-162 (Narrate and ICU). That is right: none of the five numbers words under a runtime or touches Narrate. FLOW-PARA-KEYS-1 counts words book-wide, but from the app's own word table, not from tooling.
- **LL-164 check (D.4.5):** ROADMAP.md asks no run to append a lesson-status line. `grep -E "LL-[0-9]+ — status|Observation — held|--record-status"` finds nothing. The specifications written since LL-164 state "appends no lesson-status line", for example at `ROADMAP.md:1274`.

## Promotions and retirements recorded

- **LL-164 → standing rule 51**: "Compare every lesson-status line a specification appends with that lesson's current status, at dispatch and before close-out; never append a status that ranks below the current one." Applied and held in 3 close-outs, and it guards this review's own promotions.
- **LL-146 → standing rule 52**: "Evidence copies of code are saved under a name the test runner does not collect (`.txt`)." Applied and held in 2 close-outs, and every red-test-in-spec item since (the keys fixes, ZIP-ASYNC-READ-1) depends on it.
- **Kept as observations**, as in the previous review: LL-006, LL-024, LL-088, LL-093, LL-121, LL-137, LL-139, LL-142, LL-150, LL-154 and LL-157. The reasons are unchanged. LL-142 is now held in 7 close-outs, but it is the epic charter's principle and every measurement specification cites it directly, so a rule would only restate it.
- **Retirements:** none.

## Learning figures

| Metric | 2026-10-22 | 2026-10-23 |
|---|---|---|
| Live lessons | 118 | 117 |
| Lesson yield | 1.75 per close-out | 1.66 (6 of 82 recorded no new lesson) |
| Held rate | 0.97 | 0.98 |
| Promotion rate | 0.09 after promotions | 0.08 before this review's two; about 0.10 after |
| Repeated-trap rate | 0.03 | 0.03 |
| Effort calibration | 0.5 (median of 7) | 0.56 (median of 8) |

## Close-outs since the last review without a lesson or a reason

None.

## Candidate for the next close-out

FLOW-KEYS-FIX-1's memo candidate: when a mode has two pacers, a navigation command must move both, and a test must read each pacer's own position. A second occurrence would make it a lesson. Brain's ruling A on FOCUS-KEYS-FIX-1 is the same shape: two index spaces (loaded slice and whole book) that the published word alone cannot tell apart. Both point at one pattern: **test against each underlying position, not the published one.** Record it at FOCUS-KEYS-FIX-1's close-out.
