# Sprint 26 — Architecture Overhaul: foliate-js + CFI + Edge TTS + Per-Book Settings

**Status:** SCOPED — ready for sprint planning
**Estimated effort:** 40-60 hours across 4 waves
**Dependencies:** Sprint 25 (current) must be committed and stable
**Branch:** `sprint/26-foliate-architecture`

---

## Context

Blurby currently extracts plain text from EPUBs via `cheerio.text()`, losing all formatting, images, and structure. Pagination uses pixel-estimation that diverges from actual CSS rendering, causing content to fall between page boundaries. Reading position is tracked by word index, which is fragile and non-standard.

Readest (reference app, MIT licensed) demonstrates a superior approach: render EPUB HTML natively via `foliate-js`, use CSS multi-column pagination, and track position via EPUB CFI. This sprint adopts that architecture while preserving Blurby's unique 4-mode reader (Page/Focus/Flow/Narration).

---

## Wave 1: foliate-js EPUB Rendering (15-20h)

### Goal
Replace text extraction with native HTML rendering for EPUBs. All formatting, images, and structure preserved.

### What Changes

| Component | Current | New |
|-----------|---------|-----|
| EPUB loading | `cheerio.text()` → plain string | `foliate-js EPUB` → BookDoc with HTML sections |
| Content storage | `library.json` stores extracted text | `library.json` stores file path; content loaded on-demand via foliate |
| Page rendering | `<span>` per word, pixel-estimation pagination | `<foliate-view>` custom element with CSS multi-column pagination |
| Images | Stripped | Rendered inline from EPUB ZIP (blob URLs) |
| Bold/italic | Stripped | Preserved (native HTML) |
| Lists/tables | Flattened to text | Preserved (native HTML) |
| Headings | Flattened to text | Rendered with original styling |

### Implementation Steps

1. **Install foliate-js** — `npm install foliate-js` or vendor as submodule (API unstable per author)
2. **New IPC: `open-epub-foliate`** — main process opens EPUB with foliate-js, returns BookDoc metadata (title, author, TOC, section count, cover)
3. **New component: `FoliatePageView.tsx`** — wraps `<foliate-view>` custom element
   - Receives EPUB file path, loads via foliate
   - Handles pagination events (`relocate`, `load`)
   - Exposes page navigation (next/prev/goTo)
   - Applies user style overrides (font, size, margins, theme)
4. **PageReaderView routing** — if doc is EPUB, render `FoliatePageView`; else fall back to current word-by-word rendering (TXT, PDF, MOBI)
5. **Style injection** — apply Blurby theme CSS (background, text color, accent) into foliate's iframe
6. **TOC integration** — foliate provides `.toc` natively; wire to chapter dropdown and C hotkey
7. **Cover extraction** — use foliate's `.getCover()` for library thumbnails

### What Stays the Same
- Non-EPUB formats (TXT, PDF, MOBI) continue using current text extraction
- Library management, metadata, favorites, queue — unchanged
- Bottom bar, mode buttons, settings — unchanged

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/components/FoliatePageView.tsx` | **NEW** — foliate-view wrapper |
| `src/components/PageReaderView.tsx` | Modify — route EPUB to FoliatePageView |
| `src/components/ReaderContainer.tsx` | Modify — pass file path + format info |
| `main/ipc-handlers.js` | Modify — new `open-epub-foliate` handler |
| `preload.js` | Modify — expose new IPC |
| `package.json` | Add foliate-js dependency |

### Risks
- foliate-js API is "not stable" — may need to vendor/fork
- Custom element registration in Electron renderer may need CSP adjustments
- iframe isolation may complicate keyboard shortcut handling
- Performance unknown with very large EPUBs (900K+ chars like Arthur Young)

---

## Wave 2: EPUB CFI Position Tracking (8-12h)

### Goal
Replace fragile `highlightedWordIndex` with EPUB CFI for position tracking. Enables exact-word resume across sessions.

### What Changes

| Aspect | Current | New |
|--------|---------|-----|
| Position storage | `wordIndex: number` in library.json | `cfi: string` in library.json (+ wordIndex fallback for non-EPUB) |
| Resume on open | Navigate to page containing word N | `view.goTo(cfi)` — exact position |
| Progress save | `onHighlightedWordChange(pageStart)` | `view.addEventListener('relocate', e => saveCFI(e.detail.cfi))` |
| Progress % | `wordIndex / totalWords` | foliate's `e.detail.fraction` (0-1) |
| Bookmarks | Not implemented | CFI-based bookmarks (future) |
| Annotations | Note at wordIndex | Note at CFI range (future) |

### Implementation Steps

1. **Add `cfi` field to `BlurbyDoc`** in `types.ts` (optional, alongside existing `position`)
2. **Save CFI on relocate** — foliate fires `relocate` event with `{cfi, fraction, section, location}`; debounce save to library.json
3. **Resume from CFI** — on book open, call `view.goTo(doc.cfi)` if available; fall back to `doc.position` (word index) for non-EPUB
4. **Progress display** — use `fraction` for %, page number from `location.current`/`location.total`
5. **Migration** — existing books without CFI: on first open with foliate, generate CFI from approximate word position
6. **Library card display** — show `fraction * 100`% instead of word-based calculation

### Files to Modify
| File | Action |
|------|--------|
| `src/types.ts` | Add `cfi?: string` to BlurbyDoc |
| `src/components/FoliatePageView.tsx` | Handle relocate events, save CFI |
| `src/components/ReaderContainer.tsx` | Pass initial CFI to FoliatePageView |
| `src/components/LibraryContainer.tsx` | Use CFI-based progress for display |
| `main/ipc-handlers.js` | Save CFI in library.json |

---

## Wave 3: Edge TTS as Alternative Engine (8-12h)

### Goal
Add Microsoft Edge TTS as a third TTS engine alongside Kokoro and Web Speech. 200+ voices, SSML support, word boundary marks for precise cursor sync.

### What Changes

| Aspect | Current | New |
|--------|---------|-----|
| TTS engines | Kokoro (local AI) + Web Speech (browser) | + Edge TTS (Microsoft, free, no API key) |
| Voices | Kokoro: 24 voices, Web: ~3 | + Edge: 200+ voices across 40+ languages |
| Word sync | Time-division estimation | Edge: real word boundary events via SSML |
| Quality | Kokoro: excellent, Web: robotic | Edge: near-human, comparable to Kokoro |
| Requirements | Kokoro: CPU/model download, Web: none | Edge: internet connection required |
| Latency | Kokoro: ~300ms first chunk, Web: instant | Edge: ~200ms WebSocket roundtrip |

### Implementation Steps

1. **Install `msedge-tts`** — `npm install msedge-tts` (Node.js, works in Electron main process)
2. **New main process module: `main/tts-edge.js`** — Edge TTS wrapper
   - `listVoices()` → 200+ voices with language/gender metadata
   - `generate(text, voice, rate)` → PCM audio buffer + word boundary timestamps
   - Word boundaries: `{type, offset, duration, text}` for each word
   - SSML generation with prosody control (rate, pitch, volume)
3. **IPC channels** — `tts-edge-generate`, `tts-edge-voices`, `tts-edge-status`
4. **useNarration.ts** — add Edge as third engine option
   - `speakNextChunkEdge()` — generates audio via IPC, plays with real word boundaries
   - Word boundary timestamps replace time-division estimation (more accurate cursor sync)
   - Pre-buffer pattern same as Kokoro
5. **Settings UI** — Engine selector: "Kokoro (Local AI)", "Edge (Microsoft)", "Web Speech (Basic)"
   - Edge voice picker with language filter and preview
   - Show "requires internet" note for Edge
6. **Fallback chain** — Edge → Kokoro → Web Speech (configurable order)
7. **LRU cache** — cache generated audio by text+voice+rate hash (200 slots, same as Readest)

### Key Advantage Over Kokoro
- **No model download** (Kokoro needs ~100MB ONNX model)
- **No "App Not Responding"** (Edge is a network call, not CPU inference)
- **Word-level boundary events** (Kokoro uses time estimation; Edge gives exact timestamps)
- **200+ voices** vs Kokoro's 24

### Tradeoff
- **Requires internet** (Kokoro works offline)
- **Microsoft dependency** (free tier, no API key, but could be rate-limited)

### Files to Create/Modify
| File | Action |
|------|--------|
| `main/tts-edge.js` | **NEW** — Edge TTS wrapper |
| `main/ipc-handlers.js` | Add Edge TTS IPC channels |
| `preload.js` | Expose Edge TTS APIs |
| `src/hooks/useNarration.ts` | Add `speakNextChunkEdge()` |
| `src/components/settings/SpeedReadingSettings.tsx` | Engine selector + Edge voice picker |
| `src/types.ts` | Add Edge voice types |
| `package.json` | Add msedge-tts dependency |

---

## Wave 4: Per-Book Settings + 3-Tier Cascade (6-8h)

### Goal
Each book can override global settings (font, margins, spacing, theme). Settings cascade: Global → Book → View.

### What Changes

| Aspect | Current | New |
|--------|---------|-----|
| Settings scope | Global only | Global → per-book override |
| Font per book | Same for all books | "Use Georgia for this novel, Calibri for this textbook" |
| Margins per book | Same for all | Wider margins for poetry, narrow for dense text |
| Theme per book | Same for all | Dark theme for nighttime reading, light for others |
| Storage | `settings.json` | `settings.json` (global) + `bookConfigs` map in `library.json` |

### Implementation Steps

1. **Add `BookConfig` type** — subset of `BlurbySettings` that can be overridden per book
   ```typescript
   interface BookConfig {
     fontFamily?: string;
     fontSize?: number;
     layoutSpacing?: { line?: number; char?: number; word?: number };
     margins?: { top?: number; bottom?: number; left?: number; right?: number };
     theme?: string;
     ttsVoice?: string;
     ttsRate?: number;
   }
   ```
2. **Add `bookConfigs: Record<string, BookConfig>` to settings** — keyed by doc ID
3. **Merge function** — `effectiveSettings(global, bookConfig)` returns merged settings
4. **Per-book settings UI** — small "Book Settings" button in reader header or settings flap
   - Shows only overridable fields
   - "Reset to global" button per field
   - Visual indicator when a book has custom settings
5. **ReaderContainer** — compute `effectiveSettings` from global + active book's config
6. **Pass effective settings** to FoliatePageView (style injection) and bottom bar

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/types.ts` | Add `BookConfig` interface |
| `src/utils/settings.ts` | **NEW** — `effectiveSettings()` merge function |
| `src/components/settings/BookSettingsPanel.tsx` | **NEW** — per-book override UI |
| `src/components/ReaderContainer.tsx` | Compute effective settings |
| `src/components/FoliatePageView.tsx` | Apply per-book styles |

---

## Wave 5: Medium Priority Polish (8-10h)

### 5A: In-Book Search with CFI Navigation
- Use foliate's built-in `search.js` module
- Returns CFI array of matches
- Navigate between results with keyboard (Ctrl+G next, Ctrl+Shift+G prev)
- Highlight matches in rendered text
- Search bar in header or command palette

### 5B: Highlight Style Variants
- Add `style` field to notes/highlights: `"highlight" | "underline" | "squiggly"`
- Add `color` field: 5 preset colors + custom hex
- Use foliate's `overlayer.js` for rendering highlights on EPUB content
- Right-click menu shows style/color picker

### 5C: Pull-Once Sync Optimization
- On book open: pull config once (not continuous polling)
- Debounced push on progress change (30s interval)
- Manual conflict UI: "Local: Ch 5, 45% | Remote: Ch 12, 72% — which to keep?"
- Per-datatype sync timestamps

---

## Sprint Summary

| Wave | Scope | Hours | Dependencies |
|------|-------|-------|-------------|
| **1** | foliate-js EPUB rendering | 15-20h | None |
| **2** | EPUB CFI position tracking | 8-12h | Wave 1 |
| **3** | Edge TTS engine | 8-12h | None (parallel with 1-2) |
| **4** | Per-book settings + cascade | 6-8h | Wave 1 |
| **5** | Search + highlights + sync | 8-10h | Waves 1-2 |
| **Total** | | **45-62h** | |

### Execution Order
```
[Wave 1] foliate-js EPUB rendering
    ↓
[Wave 2] CFI position tracking (depends on Wave 1)

[Wave 3] Edge TTS (PARALLEL with Waves 1-2)

    ↓ (Waves 1-2 complete)
[Wave 4] Per-book settings (depends on Wave 1)
    ↓
[Wave 5] Search + highlights + sync polish (depends on Waves 1-2)
```

### Success Criteria

1. Open any EPUB → formatted HTML with bold, italic, images, lists, headings
2. Close and reopen → exact resume position via CFI
3. Edge TTS with 200+ voice selection, word-level cursor sync
4. Per-book font/margin override, persisted across sessions
5. In-book search returns highlighted results navigable by keyboard
6. Highlights with 3 styles × 5 colors, persisted in library
7. `npm test` passes, `npm run build` clean
8. Non-EPUB formats (TXT, PDF, MOBI) continue working via current pipeline

### Migration Path
- Existing library entries keep their extracted text (backward compatible)
- On first foliate open, CFI is generated from approximate position
- Old `position` (word index) field kept as fallback
- No data loss — existing progress, notes, favorites all preserved

---

## Key Libraries

| Library | Purpose | License | Size |
|---------|---------|---------|------|
| [foliate-js](https://github.com/johnfactotum/foliate-js) | EPUB parsing + rendering + search + annotations | MIT | ~50KB (modular) |
| [msedge-tts](https://www.npmjs.com/package/msedge-tts) | Edge TTS with SSML + word boundaries | MIT | ~15KB |
| [@zip.js/zip.js](https://www.npmjs.com/package/@zip.js/zip.js) | ZIP decompression for EPUB (foliate dependency) | BSD-3 | ~80KB |

Sources:
- [foliate-js on GitHub](https://github.com/johnfactotum/foliate-js)
- [msedge-tts on npm](https://www.npmjs.com/package/msedge-tts)
- [edge-tts-universal on npm](https://www.npmjs.com/package/edge-tts-universal)
