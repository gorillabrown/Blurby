# Close-Out: THEME-SYNC-1 — Settings Theme Propagation + Vite Circular Chunk Repair

**Date:** 2026-05-29
**Branch:** `sprint/theme-sync-1`
**Baseline:** clean main at v1.75.1 + SINGLE-INSTANCE-LOCK-1
**Result:** Complete (circular chunk eliminated; BUG-182 confirmed fixed by live smoke)

## Summary

Eliminated the Vite build's `Circular chunk: settings -> tts -> settings` warning by tracing the bidirectional dependency and moving 5 shared TTS-adjacent modules to the TTS chunk in `vite.config.js`. Code audit of Settings sub-pages found no inline color styles or stale theme subscriptions — all components use CSS variables from ThemeProvider. BUG-182 marked RESOLVED after Evan's live smoke test on the v1.75.1 dev build.

## Root Cause (Circular Chunk)

Five utility modules were imported by both TTS-chunk and settings-chunk files. Without explicit TTS chunk assignment, Rollup placed them in the settings chunk, creating tts→settings reverse edges:

**Edge 1:** `tempoStretch`, `kokoroRatePlan`, `ttsProviderRegistry` — shared between `ttsPreview.ts`/`TTSSettings.tsx` (settings) and `kokoroStrategy.ts`/`audioScheduler.ts`/`narrateDiagnostics.ts` (TTS).

**Edge 2:** `kokoroStatus`, `qwenStatus` — shared between `useKokoroSettingsStatus`/`useQwenPrototypeStatus` (settings) and `useNarration.ts` (TTS).

**SettingsContext hypothesis disproved** — SettingsContext is only imported by `LibraryContainer` and `ReaderContainer` (neither in any manual chunk).

## Deliverables

1. **`vite.config.js`** — Added 5 entries to the TTS chunk matcher:
   - `src/utils/audio/` (covers `tempoStretch.ts` + `segmentKokoroChunk.ts`)
   - `src/utils/kokoroRatePlan`
   - `src/utils/ttsProviderRegistry`
   - `src/utils/kokoroStatus`
   - `src/utils/qwenStatus`

2. **`docs/studies/investigations/THEME-SYNC-1-investigation.md`** — Full diagnosis with cycle path, disproved hypotheses, and BUG-182 theme audit findings.

## Validation

- `npm run build` clean: NO circular chunk warning
- `npm test` green: 3,014 tests pass
- Settings chunk: 102.90 KB → 92.90 KB (modules moved out)
- TTS chunk: 123.03 KB → 132.97 KB (modules moved in)
- BUG-182 live smoke PASS on v1.75.1 dev build: all 5 themes × 9 Settings sub-pages repaint cleanly with E-Ink Display Mode OFF.

## Files Changed

- `vite.config.js` — TTS chunk matcher expanded with 5 shared-module entries
- `docs/studies/investigations/THEME-SYNC-1-investigation.md` — new (diagnosis)
- `docs/governance/BUG_REPORT.md` — BUG-182 marked RESOLVED with live-smoke evidence
- `CLAUDE.md` — queue depth, open bugs, most recent sprint
- `ROADMAP.md` — header, completed table, spec removed, positions renumbered
- `docs/planning/.Archive/ROADMAP_legacy.md` — archived THEME-SYNC-1 spec
