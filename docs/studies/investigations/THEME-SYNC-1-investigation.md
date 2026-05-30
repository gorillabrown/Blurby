# Aristotle Diagnosis — THEME-SYNC-1: Circular Chunk + Theme Propagation

**Date:** 2026-05-29
**Method:** Static import-chain trace + code-reading audit of theme context subscription
**Verdict:** Circular chunk root cause confirmed (tempoStretch at boundary). BUG-182 root cause TBD — chunk cycle does NOT touch theme context; theme propagation via CSS variables appears correct in code; live verification needed.

## Circular Chunk Diagnosis

**Build warning:** `Circular chunk: settings -> tts -> settings`

### Cycle Path

**settings → tts (2 direct imports):**

1. `src/components/settings/NarrationDataSection.tsx` imports `src/utils/narrationPortability` (TTS chunk)
2. `src/components/settings/PronunciationOverridesEditor.tsx` imports `src/utils/pronunciationOverrides` (TTS chunk)

**tts → settings (1 indirect import via shared module):**

3. `src/utils/audioScheduler.ts` imports `src/utils/audio/tempoStretch`
   - `audioScheduler` is pulled into the TTS chunk (imported by `kokoroStrategy.ts` et al.)
   - `tempoStretch` gets assigned to the **settings chunk** because `src/components/settings/ttsPreview.ts` also imports it
   - This creates the tts→settings edge

### Cycle Root (Multiple Edges)

The cycle has TWO independent tts→settings edges, each caused by a utility module that Rollup assigned to the settings chunk because settings-only files import it:

**Edge 1: `tempoStretch` + `kokoroRatePlan` + `ttsProviderRegistry`**
These modules are imported by both settings-chunk files (`ttsPreview.ts`, `TTSSettings.tsx`, `TtsEngineSelector.tsx`) and TTS-chunk files (`kokoroStrategy.ts`, `audioScheduler.ts`, `narrateDiagnostics.ts`). Without explicit TTS assignment, Rollup placed them in the settings chunk.

**Edge 2: `kokoroStatus` + `qwenStatus`**
`useNarration.ts` (TTS chunk) imports both `src/utils/kokoroStatus` and `src/utils/qwenStatus`. These modules were pulled into the settings chunk because their only other importers are settings-panel hooks (`useKokoroSettingsStatus`, `useQwenPrototypeStatus`).

### SettingsContext Hypothesis: DISPROVED

`src/contexts/SettingsContext.tsx` plays NO role in the cycle. It only imports from `../types` and `../constants`, and is only imported by `LibraryContainer` and `ReaderContainer` (neither in any manual chunk).

### Fix (Applied)

Added 5 modules to the TTS chunk matcher in `vite.config.js`:
- `src/utils/audio/` (covers `tempoStretch.ts` and `segmentKokoroChunk.ts`)
- `src/utils/kokoroRatePlan`
- `src/utils/ttsProviderRegistry`
- `src/utils/kokoroStatus`
- `src/utils/qwenStatus`

This keeps all TTS-adjacent utilities in the TTS chunk. Cross-chunk imports now flow one way only: settings → tts (settings UI importing TTS utilities for preview). The tts → settings edge is eliminated.

**Verified**: `npm run build` emits NO circular chunk warning. Settings chunk shrank from 102.90 KB → 92.90 KB; TTS chunk grew from 123.03 KB → 132.97 KB.

## BUG-182 Theme Propagation Audit

**Bug:** Settings panel shows mixed light/dark widgets after theme toggle.

### Code-Reading Findings

1. **ThemeProvider** (`src/components/ThemeProvider.tsx`): Sets CSS variables on `document.documentElement` in a `useEffect` that depends on `[theme, systemTheme, einkMode, accentColor, fontFamily]`. Also sets `data-theme` attribute. This is correct.

2. **ThemeSettings** (`src/components/settings/ThemeSettings.tsx`): Uses `useContext(ThemeContext)` to get setters. On toggle, calls both `onSettingsChange(updates)` (persists) AND context setters (instant visual update). This is correct.

3. **Settings components**: All use CSS classes referencing `var(--bg)`, `var(--text)`, etc. from `global.css`. No inline color styles found in settings sub-pages that would bypass the CSS variable channel.

### Assessment

The circular chunk does NOT cause BUG-182 — the cycle involves `tempoStretch`/`narrationPortability`/`pronunciationOverrides`, none of which participate in theme context or CSS variable propagation. The theme code looks correct in static analysis. BUG-182 may be:
- A timing issue on first paint after toggle (transient)
- A component that reads from stale settings state rather than CSS variables
- Only reproducible with specific theme transitions or on specific sub-pages

**Recommendation:** Fix the circular chunk (real debt regardless), then have Evan live-test the theme toggle. If BUG-182 persists, a targeted sub-page-by-sub-page audit with live CSS inspection is needed.
