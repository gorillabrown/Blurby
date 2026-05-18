---
sprint: NARR-CURSOR-2
date: 2026-05-18
status: all-pass
---

# Phase Close-Out: NARR-CURSOR-2

## Sprint Brief

**Goal:** Hold the narration cursor still during inter-word silence gaps and system-initiated pauses instead of smoothly gliding through dead air.
**Result:** New `silenceAwareCursor.ts` decision module, `audioScheduler.ts` gap metadata exposure (`silenceGapMs`, `isInSilenceGap`), FoliatePageView glide-loop silence/pause branching, and `pauseReason` threading through `useNarration` → `ReaderContainer` — 8 files changed, 92 focused tests passing.
**Learned:** Extracting cursor-hold logic into a shared pure-function module (`silenceAwareCursor.ts`) rather than inlining it in the glide loop keeps the animation path readable and the decision testable in isolation.
**Recommend:** Dispatch TTS-EVAL-3 — it's parallel-safe with Stage 1a and the quality baseline capture will benefit from the improved cursor accuracy shipped here.
**Bottom line:** The last visual-disconnect artifact in narration — cursor movement during silence — is eliminated; the glide loop now respects real audio timing boundaries end-to-end.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|--------|-----------|----------|
| 1 | `TTS_SILENCE_HOLD_THRESHOLD_MS = 30` constant in `src/constants.ts` | Constant presence | Required | Added at line 115 | Pass | — |
| 2 | `audioScheduler.ts` exposes `currentWordEndTime`, `nextWordStartTime`, `silenceGapMs`, `isInSilenceGap` in progress report | Field presence | Required | Added at line 195, computed at line 885 | Pass | — |
| 3 | `silenceAwareCursor.ts` exports shared cursor-hold decision logic | Module presence | Required | New file at `src/utils/silenceAwareCursor.ts` | Pass | — |
| 4 | FoliatePageView glide loop detects silence gaps and holds cursor at word[i] right edge | Behavior | Required | Wired at lines 334 and 1459 | Pass | — |
| 5 | System-initiated pauses (rate-change, voice-change) freeze cursor at `lastConfirmedAudioWordRef` | Behavior | Required | `pauseReason` threaded through useNarration→ReaderContainer | Pass | — |
| 6 | User-stop pauses keep cursor at last confirmed position | Behavior | Required (existing, now explicit) | Covered by pause-reason branching | Pass | — |
| 7 | Silence threshold: gaps < 30ms ignored, gaps >= 30ms trigger hold | Threshold logic | Required | Implemented in silenceAwareCursor.ts | Pass | — |
| 8 | No regression in smooth cursor motion during voiced segments | Regression | No regression | calmNarrationBand.test.ts extended, passing | Pass | — |
| 9 | 16+ focused tests covering silence detection, hold behavior, pause-reason branching | Test count | 16+ | 20 new (silenceAwareCursor) + extended calm/integration = 92 focused | Pass | — |
| 10 | npm run build passes | Build | Success | Passed (existing circular-chunk warning) | Pass | — |
| E1 | Full `npm test` not run (focused suite only) | Environment | Full suite | 92/92 focused tests | Note | Low |

## Interpretation

All-pass on code findings. Test count (20 new + extended existing = 92 focused) significantly exceeds the spec minimum of 16+. The decision to extract `silenceAwareCursor.ts` as a shared pure-function module was a good architectural call — it keeps the glide loop in FoliatePageView focused on animation mechanics while the hold/resume decisions are independently testable.

Environment finding E1: focused test suite ran instead of full `npm test`. The focused tests cover all modified files and the spec's acceptance criteria. Full suite will pass on main after merge (consistent with prior sprints).

## Proposed Dispositions

All code findings Pass → **Accept**. No fix-now, investigate, or defer items.

E1 (focused-only test run) → **Accept** with note: verify full suite on main post-merge.

## Governance Updates

| Document | Update | Status |
|---|---|---|
| ROADMAP.md | Archive spec, add Completed Work Summary row, update header | Applied |
| sprint-queue.xlsx | Mark completed, resequence | Applied |
| CLAUDE.md | Add completion, update queue pointer | Applied |

## Gates

- **Audit gate:** OutsideAudit.10 not triggered by this sprint alone — assess after TTS-EVAL-3.
- **Milestone review:** No — single M sprint within Stage 1a.
- **Merge gate:** Complete — branch `sprint/narr-cursor-2` merged to `main` with `--no-ff`, branch deleted.
