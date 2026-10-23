# Roadmap Review 2026-10-23-2 — Lessons Applied

**Provenance:** `lessons --open` (117 live), `lessons --candidates` (85 close-outs read) and `lessons --check ROADMAP.md --item <ID>`, all on `eb/gov-roadmap-review-2026-10-23-2`. Learning figures come from `kpis --json` (snapshot 2026-10-23T18:01:13Z).

## New live lessons since the morning review

None recorded. LL-165 and LL-166 (from UI-SWEEP-TRIAGE-1) were already counted this morning.

## Which specification applied which

| Item | U9 | New this review |
|---|---|---|
| PAGE-SAVE-RESTAMP-3 (80) | PASS | — |
| JUMP-LANDING-SAVE-1 (81) | PASS | — |
| ZIP-ASYNC-READ-1 (82) | PASS | — |
| BAND-ALIGN-2 (83) | PASS | owner amendment: LL-165, LL-166 and rule 50 (the pinned `flowReadingZone` tests) added |
| FLOW-PARA-KEYS-1 (84) | PASS | its LL-142 line updated: measured live, two causes |
| BLOCK-TAG-CASE-1 (85, new) | PASS | LL-142, LL-152, LL-161, LL-165, LL-166, rules 43, 45, 50, 51 |

LL-160 to LL-162 (ICU and Narrate) are still declined by every buffer item, and that is right. BLOCK-TAG-CASE-1 counts words, but it compares the renderer with the main extractor at the app's runtime. It runs no tooling outside it.

## Candidates

- **LL-151** is new on the list: "A gate recorder must be proven able to record a failure before its PASS is trusted", held in 3 close-outs. **Decision: keep as an observation.** Standing rule 43 (red first, with a control) already requires it for tests. LL-151's extra reach, gate recorders, is narrow, and the specifications that build recorders cite it.
- The other 11 (LL-006, LL-024, LL-088, LL-093, LL-121, LL-137, LL-139, LL-142, LL-150, LL-154, LL-157) keep this morning's decisions and reasons. LL-142 is now held in 10 close-outs, and it stays the epic charter's principle, cited directly.
- **Promotions and retirements:** none.

## Learning figures

| Metric | 2026-10-23 | 2026-10-23-2 |
|---|---|---|
| Live lessons | 117 | 117 |
| Lesson yield | 1.66 | 1.62 |
| Held rate | 0.98 | 0.98 |
| Promotion rate | 0.08 (before the morning's two) | 0.09 |
| Repeated-trap rate | 0.03 | 0.03 |
| Effort calibration | 0.56 | 0.56 |

## Close-outs without a lesson or a reason

None.

## Candidate for the next close-out

FOCUS-KEYS-FIX-1: an XHTML document's `tagName` is lowercase, and CSS selectors match case-insensitively. A probe built on selectors can therefore see blocks that code built on `tagName` cannot. Test each underlying position or element test, not a stand-in.
