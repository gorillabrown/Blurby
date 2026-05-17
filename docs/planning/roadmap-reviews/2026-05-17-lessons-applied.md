# Lessons-Learned Review — 2026-05-17

## Scope

Reviewed LL-108 through LL-117 (most recent 10 entries) plus standing rules against the 5 new full specs (NARR-MEDIA-1, NARR-PAUSE-1, NARR-CURSOR-2, TTS-EVAL-3, NARR-SPOKEN-1).

## Applicable Lessons

| Lesson | Applies To | Status |
|--------|-----------|--------|
| LL-108 (Canonical anchors mode-aware) | NARR-PAUSE-1, NARR-CURSOR-2 | Already embodied — specs preserve `lastConfirmedAudioWordRef` ownership and mode-aware anchor contract |
| LL-109 (Streaming stop() race) | NARR-PAUSE-1 | Already embodied — named-pause state machine guards against race conditions in strategy lifecycle |
| LL-114 (Spoken normalization ≠ display) | NARR-SPOKEN-1 | Already embodied — spec explicitly separates spoken token stream from display word stream |
| LL-115 (Cache identity = data not path) | TTS-EVAL-3 | Not directly applicable — eval harness reads cache, doesn't write identity |

## Standing Rules Check

All 10 standing rules reviewed against new specs:
- Rule 1 (branch-per-sprint): ✅ All specs include branch names
- Rule 2 (explicit-stage commits): ✅ All specs state commit hygiene
- Rule 3 (no destructive flags): ✅ Noted in all specs
- Rule 4 (test before proceeding): ✅ All specs have focused + full test verification steps
- Rule 5 (build verification): ✅ All specs include `npm run build`
- Rule 6 (CSS custom properties): ✅ NARR-CURSOR-2 uses existing CSS vars
- Rule 7 (no Node imports in renderer): ✅ No spec crosses the boundary
- Rule 8 (async file I/O): ✅ No new main-process file I/O in these sprints
- Rule 9 (constants separation): ✅ New constants defined with names in specs
- Rule 10 (preload minimal): ✅ NARR-MEDIA-1 spec explicitly avoids preload bloat (no new IPC needed)

## Updates to Standing Rules

None required. Existing rules adequately cover the new conveyor.

## Conclusion

All 5 full specs align with lessons learned and standing rules. No amendments needed.
