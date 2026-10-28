# Chunk-Synchronized Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to execute this plan. Do not start implementation until you have read this plan and the linked design spec. Treat each dispatch below as a bounded sprint. Do not re-enable Qwen, change TTS defaults, or expand TTS engine scope while executing this plan.

**Goal:** Implement the approved shared visual reading model for `Flow` and `Narrate`: natural-language chunks are lightly highlighted, the active word is strongly highlighted only when the mode has truthful word-level timing, and both modes use the infinite scroll surface.

**Architecture:** Add a shared chunk model and visual-state layer between the existing word extraction, Flow engine, Narration hook, and Foliate renderer. Flow remains WPM-clocked. Narrate becomes timing-truth-clocked: word highlight only from trusted word or character timestamps, otherwise chunk-only highlight. The renderer renders declared state only and never invents timing.

**2026-05-21 lock-in note:** Later Flow section-handoff work proved that "shared surface" and "shared pacer" must stay separate. Foliate Flow is paced by `FlowScrollEngine`; Narrate is paced by TTS/audio truth-sync. Selecting Narrate does not auto-start, Play/Space starts from the exact selected/current word, and any delayed startup retry must preserve `{ targetMode: "narrate", resumeNarration: true }`.

**Tech Stack:** React 19, TypeScript, Electron preload/main bridge as currently wired, foliate-js rendered word spans, Vitest/jsdom, existing audio scheduler and narration strategies.

## Source Material

- Approved design spec: `docs/planning/specs/2026-05-10-chunk-synchronized-reading-design.md`
- Current app posture: `ROADMAP.md` states Qwen is retired/disabled for Desktop v2 and Kokoro remains default/available.
- Current queue posture: `docs/governance/SPRINT_QUEUE.md` keeps `POSTV2-REVIEW-1` as the active review/merge lane. This plan is implementation-ready but should not displace that queue item unless explicitly promoted.

## Non-Negotiable Product Contract

- `Flow` and `Narrate` use the same natural chunk model.
- The whole active chunk is lightly highlighted in both modes.
- `Flow` strongly highlights the active word from selected WPM.
- `Narrate` strongly highlights the active word only from trustworthy speech timing.
- `Narrate` must not use WPM, heuristic scheduler timing, elapsed duration estimates, or Flow pacing to fake spoken-word sync.
- If a narration engine does not provide trustworthy word or character timing, `Narrate` shows chunk-only highlight.
- Headings are standalone chunks even without punctuation.
- Source line breaks after punctuation are hard chunk delimiters.
- Browser viewport wraps are not chunk delimiters.
- Qwen remains retired/disabled in this work.

## Current Code Shape

- `src/components/ReaderContainer.tsx` owns reading mode, `highlightedWordIndex`, narration, Flow refs, Foliate refs, and full-book word selection via `getEffectiveWords()`.
- `src/components/FoliatePageView.tsx` wraps rendered words as `.page-word` spans and exposes `highlightWordByIndex`, `clearHighlight`, `applySoftHighlight`, `clearSoftHighlight`, `getRenderedWordRoots`, and `getScrollContainer`.
- `src/utils/foliateHelpers.ts` already groups text nodes by block, identifies heading tags via `BLOCK_TAGS`, extracts words, and records paragraph breaks.
- `src/utils/foliateStyles.ts` injects word highlight CSS into Foliate iframe documents.
- `src/utils/FlowScrollEngine.ts` currently owns WPM advancement, line maps, scroll positioning, and the shrinking/timer cursor.
- `src/hooks/useFlowScrollSync.ts` starts Flow only for `readingMode === "flow"` and drives `FlowScrollEngine`; Narrate must not use that engine as its pacer or word-truth source.
- `src/hooks/useNarration.ts` owns cursor-driven narration, engine strategies, `cursorWordIndex`, `onWordAdvance`, `onTruthSync`, and scheduler bridge callbacks.
- `src/hooks/narration/kokoroStrategy.ts` can pass `wordTimestamps` through Kokoro-generated chunks.
- `src/hooks/narration/mossNanoStrategy.ts` and `src/hooks/narration/pocketTtsStrategy.ts` currently mark segments as `timingTruth: "segment-following"` with `wordTimestamps: null`.
- `src/utils/audioScheduler.ts` currently falls back to heuristic word timing when timestamps are missing or invalid. This is acceptable for audio pacing telemetry but is not acceptable as Narrate word-highlight truth.

## Target Data Model

Create `src/types/chunkReading.ts`:

```ts
export type ReadingChunkKind =
  | "heading"
  | "paragraph"
  | "line"
  | "sentenceGroup"
  | "sentence"
  | "clause";

export interface ChunkSourceWord {
  word: string;
  globalWordIndex: number;
  sectionIndex?: number;
  tokenId?: string;
  blockId?: string;
  blockTag?: string;
  blockOrdinal?: number;
  sourceTextBefore?: string;
  sourceTextAfter?: string;
  sourceLineBreakAfter?: boolean;
  paragraphBreakAfter?: boolean;
}

export interface ReadingChunk {
  id: string;
  startWordIndex: number;
  endWordIndex: number;
  kind: ReadingChunkKind;
  reason: string;
  wordCount: number;
}

export type ChunkReadingSyncLevel = "wpm" | "word-synced" | "chunk-synced";

export interface ChunkReadingVisualState {
  mode: "flow" | "narrate";
  activeChunkId: string | null;
  activeChunkRange: { startWordIndex: number; endWordIndex: number } | null;
  activeWordIndex: number | null;
  syncLevel: ChunkReadingSyncLevel;
}
```

Rules:

- Chunk ranges are half-open: `startWordIndex <= wordIndex < endWordIndex`.
- `activeWordIndex` is `null` for chunk-synced Narrate.
- `syncLevel: "wpm"` is valid only for Flow.
- `syncLevel: "word-synced"` requires validated narration timing.
- `syncLevel: "chunk-synced"` means no bold word highlight.

## Dispatch 1: Natural Chunk Model

**Sprint ID:** `CHUNK-SYNC-1`

**Objective:** Add a deterministic natural chunk extractor and enough source metadata to distinguish headings, paragraphs, source line breaks, sentence groups, sentences, and clause fallback.

### Files to Create

- `src/types/chunkReading.ts`
- `src/utils/naturalChunks.ts`
- `tests/naturalChunks.test.ts`

### Files to Modify

- `src/utils/foliateHelpers.ts`
- `src/types/narration.ts`
- `src/components/ReaderContainer.tsx`

### Implementation Steps

1. Create `src/types/chunkReading.ts` with the target data model above.

2. Extend `FoliateWord` in `src/utils/foliateHelpers.ts`:

```ts
export interface FoliateWord {
  word: string;
  range: Range | null;
  sectionIndex: number;
  tokenId?: string;
  blockTag?: string;
  blockOrdinal?: number;
  blockId?: string;
  paragraphBreakAfter?: boolean;
  sourceLineBreakAfter?: boolean;
}
```

3. Update `collectBlockTextNodes()` and `extractWordsFromView()` so each block group receives:

- `blockTag`
- stable `blockOrdinal` within the rendered section
- `blockId` formatted as `${sectionIndex}:${blockOrdinal}:${block.tagName.toLowerCase()}`
- `paragraphBreakAfter: true` on the last word of each block

4. Add source line-break detection for text inside a block. A source line break is a chunk delimiter only when it occurs after punctuation in the source text, not when the browser wraps a rendered line. Add a helper in `src/utils/foliateHelpers.ts`:

```ts
export function hasPunctuatedSourceLineBreakAfter(text: string, absoluteEndOffset: number): boolean {
  const before = text.slice(0, absoluteEndOffset);
  const after = text.slice(absoluteEndOffset);
  return /[.!?;:,]["')\]]?\s*$/.test(before) && /^\s*\r?\n/.test(after);
}
```

When `buildWordsFromTextNodes()` receives a combined block string, mark `sourceLineBreakAfter` on the word whose span ends before a matching line break.

5. Create `src/utils/naturalChunks.ts` with:

```ts
import type { ChunkSourceWord, ReadingChunk } from "../types/chunkReading";

export interface NaturalChunkOptions {
  targetMinWords?: number;
  targetMaxWords?: number;
  softMaxWords?: number;
  hardMaxWords?: number;
}

export function buildNaturalChunks(
  words: ChunkSourceWord[],
  options?: NaturalChunkOptions,
): ReadingChunk[] {
  // deterministic, no DOM access
}

export function findChunkForWord(
  chunks: ReadingChunk[],
  wordIndex: number,
): ReadingChunk | null {
  return chunks.find((chunk) => wordIndex >= chunk.startWordIndex && wordIndex < chunk.endWordIndex) ?? null;
}
```

6. Implement delimiter priority in `buildNaturalChunks()`:

- Heading block: if every word in a block belongs to `H1` through `H6`, create one `kind: "heading"` chunk even if there is no punctuation.
- Paragraph boundary: end chunk at `paragraphBreakAfter`.
- Source line break after punctuation: end chunk at `sourceLineBreakAfter`.
- Sentence grouping: prefer ending after `.`, `!`, `?`, `;`, `:` before commas.
- Commas are weaker split candidates and should be used only to keep very long sentences under `hardMaxWords`.
- Clause fallback: split long chunks at whitespace nearest `softMaxWords`; never exceed `hardMaxWords` unless a single tokenized block is shorter than two words.

7. Add an adapter in `ReaderContainer.tsx` to create `ChunkSourceWord[]` from the best available word source:

- For Foliate full-book extraction, preserve `FoliateWord` metadata when available.
- For plain text or cached string arrays, create `ChunkSourceWord` entries with `globalWordIndex` and `paragraphBreakAfter` derived from existing `paragraphBreaks`.
- Do not block reading if metadata is incomplete. Missing metadata should degrade to sentence and clause chunking.

### Required Tests

Add `tests/naturalChunks.test.ts` with cases for:

- Heading without punctuation becomes one heading chunk.
- Paragraph boundaries split chunks.
- Source line break after `.`, `!`, `?`, `;`, `:`, and `,` is a hard delimiter.
- Browser line wrapping is not modeled as a delimiter because no `sourceLineBreakAfter` flag exists.
- Prefer sentence terminators over commas.
- Commas split only when needed by `softMaxWords` or `hardMaxWords`.
- Long sentence falls back to clause chunks under `hardMaxWords`.
- `findChunkForWord()` returns the correct chunk for start, middle, final, and out-of-range word indexes.

### Verification Commands

```powershell
npx vitest run tests/naturalChunks.test.ts
npx vitest run tests/foliateWordOffsets.test.ts tests/crossBookFlow.test.ts
```

### Completion Criteria

- A deterministic chunk list can be built for Foliate and non-Foliate books.
- Chunking does not depend on viewport layout.
- Existing paragraph-break behavior is preserved for current Flow tests.

## Dispatch 2: Shared Rendering Layer

**Sprint ID:** `CHUNK-SYNC-2`

**Objective:** Replace mode-specific single-word visual treatment with a shared chunk-plus-word visual state that Foliate can render inside iframe documents.

### Files to Create

- `src/utils/chunkReadingVisualState.ts`
- `tests/chunkReadingVisualState.test.ts`
- `tests/foliateChunkHighlight.test.ts`

### Files to Modify

- `src/components/FoliatePageView.tsx`
- `src/utils/foliateStyles.ts`
- `src/utils/foliateWordHighlight.ts`
- `src/styles/flow.css`

### Implementation Steps

1. Create `src/utils/chunkReadingVisualState.ts`:

```ts
import type { ChunkReadingVisualState, ReadingChunk } from "../types/chunkReading";

export function createChunkReadingVisualState(params: {
  mode: "flow" | "narrate";
  chunks: ReadingChunk[];
  wordIndex: number | null;
  chunkId?: string | null;
  syncLevel: "wpm" | "word-synced" | "chunk-synced";
}): ChunkReadingVisualState {
  // Select chunk by chunkId first, then by wordIndex.
}
```

2. Add an imperative Foliate API method in `FoliatePageView.tsx`:

```ts
applyChunkReadingVisualState(state: ChunkReadingVisualState | null): void;
clearChunkReadingVisualState(): void;
```

This method should:

- Remove previous `.page-word--chunk-active` and `.page-word--active-word` classes from all rendered roots.
- Apply `.page-word--chunk-active` to every span whose `data-word-index` is inside `activeChunkRange`.
- Apply `.page-word--active-word` only when `activeWordIndex !== null`.
- Handle multi-part tokens by applying classes to every span with matching `data-word-index`.
- Work through `getRenderedWordRoots()` so it applies inside Foliate iframe documents.

3. Keep `highlightWordByIndex()` for compatibility during migration, but do not use it for new Flow/Narrate rendering after Dispatch 4.

4. Update `src/utils/foliateStyles.ts`:

```css
.page-word--chunk-active {
  background: color-mix(in srgb, var(--accent, #FF5B7F) 16%, transparent);
  border-radius: 4px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.page-word--active-word {
  font-weight: 800;
  color: var(--text, currentColor);
  background: color-mix(in srgb, var(--accent, #FF5B7F) 28%, transparent);
}
```

Use concrete fallbacks in the injected string because iframe CSS may not inherit every root variable.

5. Update `src/styles/flow.css` so the legacy shrinking cursor remains available only for non-migrated code paths and does not render over chunk-highlighted Flow or Narrate. The new visual target is:

- no second cursor line
- no Flow shading in Narrate
- one light chunk highlight
- one strong active word only when the mode declares a word

### Required Tests

Add `tests/chunkReadingVisualState.test.ts`:

- Finds chunk by active word.
- Keeps `activeWordIndex: null` for `chunk-synced`.
- Does not return a word outside the active chunk.
- Returns `activeChunkRange` as half-open range.

Add `tests/foliateChunkHighlight.test.ts`:

- Applies chunk class across multiple wrapped word spans.
- Applies active word class only to the active word.
- Clears stale chunk and active word classes.
- Applies all token parts for a split token.
- Does not apply active word class when `activeWordIndex` is `null`.

### Verification Commands

```powershell
npx vitest run tests/chunkReadingVisualState.test.ts tests/foliateChunkHighlight.test.ts
npx vitest run tests/flowReadingZone.test.ts tests/flowTimerCursor.test.ts
```

### Completion Criteria

- Foliate can render active chunk and active word from one visual state object.
- The renderer does not compute timing or infer sync level.
- Existing word-click and legacy highlight behavior still work.

## Dispatch 3: Flow Migration To Chunk-Synchronized Infinite Scroll

**Sprint ID:** `CHUNK-SYNC-3`

**Objective:** Make Flow use the new chunk visual model while retaining WPM-driven word advancement and infinite scroll positioning.

### Files to Modify

- `src/utils/FlowScrollEngine.ts`
- `src/hooks/useFlowScrollSync.ts`
- `src/components/ReaderContainer.tsx`
- `src/components/ReaderBottomBar.tsx`
- `src/styles/flow.css`
- `tests/flow-scroll-engine.test.js`
- `tests/flowReadingZone.test.ts`
- `tests/flowTimerCursor.test.ts`

### Implementation Steps

1. Extend `FlowScrollEngine` callbacks:

```ts
interface FlowScrollEngineCallbacks {
  onWordAdvance?: (wordIndex: number) => void;
  onChunkChange?: (chunk: ReadingChunk) => void;
  onComplete?: () => void;
  onProgressUpdate?: (progress: FlowProgress) => void;
}
```

2. Add `setChunks(chunks: ReadingChunk[])` and `getActiveChunk()` to `FlowScrollEngine`.

3. When the WPM clock advances a word:

- Find the chunk with `findChunkForWord(chunks, wordIndex)`.
- Emit `onChunkChange()` only when chunk id changes.
- Emit `onWordAdvance()` for every WPM word tick.
- Update progress from word index and total words as today.

4. Replace shrinking cursor logic for Flow with chunk visual state emission. Keep scroll positioning methods, but change the primary scroll target:

- On chunk change, scroll the chunk start into the configured reading zone.
- During a chunk, scroll only if the active word is about to leave the comfortable zone.
- Do not chase every word with micro-scroll when it remains visible.

5. Update `useFlowScrollSync.ts`:

- Accept `readingMode: "page" | "focus" | "flow" | "narrate"` or import `ReaderMode` directly.
- Pass `chunks` to `FlowScrollEngine`.
- On `onWordAdvance`, set highlighted word as today and emit `ChunkReadingVisualState` with `syncLevel: "wpm"`.
- On `onChunkChange`, update the active chunk visual state and scroll anchor.
- Stop using `engine.followWord()` as the visual authority for Narrate. Narrate gets its own driver in Dispatch 4.

6. Update `ReaderContainer.tsx`:

- Build chunks once per active document/render version from Dispatch 1.
- Store `chunkReadingVisualState` in parent state.
- Pass visual state to `FoliatePageView`.
- Keep `Flow` in infinite scroll surface.
- Preserve the rule that Flow does not auto-play on mode entry. Space or Play starts; Space or Play pauses while remaining in Flow mode.

7. Update `ReaderBottomBar.tsx` only if needed to keep controls truthful:

- Flow play button starts/pauses Flow.
- Narrate play button starts/pauses narration.
- No mode auto-plays on mode switch.

### Required Tests

Update or add Flow tests:

- Flow emits active chunk state at start.
- Flow advances active word by WPM.
- Flow changes chunk when word crosses natural chunk boundary.
- Flow keeps active chunk in zone on chunk change.
- Flow does not render the old duplicate cursor when chunk highlighting is active.
- Flow mode entry does not auto-play.
- Space and Play both pause/resume while staying in Flow mode.

### Verification Commands

```powershell
npx vitest run tests/flow-scroll-engine.test.js tests/flowReadingZone.test.ts tests/flowTimerCursor.test.ts
npx vitest run tests/readerModeControls.test.tsx tests/readerKeyboard.test.tsx
```

### Completion Criteria

- Flow visually matches the new model: light active chunk plus strong WPM word.
- Flow keeps the active chunk in the reading zone.
- The old shrinking/timer cursor does not double-render with the new highlight model.
- Existing keyboard and bottom-bar controls remain intact.

## Dispatch 4: Narrate Timing Truth And Chunk-Only Fallback

**Sprint ID:** `CHUNK-SYNC-4`

**Objective:** Make Narrate use the same chunk visual model, with active word locked only to trustworthy spoken timing and chunk-only fallback when timing is unavailable.

### Files to Create

- `src/utils/narrationTimingTruth.ts`
- `tests/narrationChunkSync.test.tsx`
- `tests/narrationTimingTruth.test.ts`

### Files to Modify

- `src/hooks/useNarration.ts`
- `src/hooks/narration/kokoroStrategy.ts`
- `src/hooks/narration/mossNanoStrategy.ts`
- `src/hooks/narration/pocketTtsStrategy.ts`
- `src/utils/audioScheduler.ts`
- `src/components/ReaderContainer.tsx`
- `src/components/FoliatePageView.tsx`
- `tests/narrTiming.test.ts`
- `tests/useNarrationMossNano.test.tsx`
- `tests/useNarration.test.ts`
- `tests/narrationIntegration.test.ts`

### Implementation Steps

1. Create `src/utils/narrationTimingTruth.ts`:

```ts
export type NarrationTimingTruth =
  | { level: "word"; source: "word-timestamps" | "char-timestamps"; wordIndex: number }
  | { level: "chunk"; source: "chunk-start"; chunkStartWordIndex: number }
  | { level: "none"; source: "stopped" | "buffering" | "paused" };

export function classifyNarrationTiming(params: {
  wordTimestamps: unknown;
  timestampSource?: string | null;
  schedulerFallback?: boolean;
}): "word-synced" | "chunk-synced" {
  // Only validated word or char timestamps return "word-synced".
  // Heuristic, segment-following, null, and mismatched timestamps return "chunk-synced".
}
```

2. Update `src/utils/audioScheduler.ts` so telemetry distinguishes:

- `timestampSource: "kokoro-duration-tensor"` or equivalent validated real timing
- `timestampSource: "heuristic"` for scheduler fallback
- `visualSyncLevel: "word-synced" | "chunk-synced"`

The key rule: scheduler heuristics may continue to support internal playback behavior, but must be labeled `visualSyncLevel: "chunk-synced"` so UI does not bold-highlight fake spoken words.

3. Update `TtsStrategy` or strategy callback metadata in `src/types/narration.ts` so `onWordAdvance` can carry timing truth:

```ts
export interface NarrationWordAdvanceMeta {
  visualSyncLevel: "word-synced" | "chunk-synced";
  timestampSource?: string | null;
}
```

If changing the callback signature is too invasive, add a separate optional callback:

```ts
onTimedWordAdvance?: (wordIndex: number, meta: NarrationWordAdvanceMeta) => void;
```

4. Update `kokoroStrategy.ts`:

- When Kokoro chunks include validated `wordTimestamps`, emit word advances with `visualSyncLevel: "word-synced"`.
- When Kokoro falls back to scheduler heuristic, do not emit UI-active-word truth. It may still update internal audio progress, but Narrate visual state must be chunk-synced.
- Preserve current audio reliability behavior.

5. Update `mossNanoStrategy.ts` and `pocketTtsStrategy.ts`:

- Their current `wordTimestamps: null` and `timingTruth: "segment-following"` paths must map to chunk-synced visuals.
- They can emit active chunk start when segment playback starts.
- They must not emit bold active word indexes unless future real timestamps are added.

6. Update `useNarration.ts`:

- Add state fields or refs for `visualSyncLevel`, `activeNarrationChunkStart`, and `truthfulActiveWordIndex`.
- `syncNarrationCursor()` should only drive `activeWordIndex` for UI when meta says `word-synced`.
- Chunk playback start should update active chunk even when no word timing exists.
- Buffering and pause should hold last truthful visual state.
- Stop should clear active word and keep or clear chunk according to existing resume-anchor behavior.
- Do not route Narrate through Flow WPM or `FlowScrollEngine.followWord()` as a word-truth source.

7. Update `ReaderContainer.tsx`:

- In `readingMode === "narrate"`, use narration truth state to create `ChunkReadingVisualState`.
- If Narrate is word-synced, pass `activeWordIndex`.
- If Narrate is chunk-synced, pass `activeWordIndex: null`.
- Keep Narrate on the infinite scroll surface with no Flow shading.
- On chunk change, scroll chunk start into the reading window.

8. Update `FoliatePageView.tsx`:

- Ensure Narrate applies chunk highlight with no Flow zone shading.
- Ensure active word is absent for chunk-synced Narrate.

### Required Tests

Add `tests/narrationTimingTruth.test.ts`:

- Valid word timestamps classify as `word-synced`.
- Null timestamps classify as `chunk-synced`.
- Heuristic scheduler fallback classifies as `chunk-synced`.
- Segment-following classifies as `chunk-synced`.
- Bad or mismatched timestamps classify as `chunk-synced`.

Add `tests/narrationChunkSync.test.tsx`:

- Kokoro with valid timestamps renders chunk and active word.
- Kokoro with heuristic fallback renders chunk only.
- MOSS-Nano renders chunk only with current `wordTimestamps: null`.
- Pocket TTS renders chunk only with current `wordTimestamps: null`.
- Pause holds the last visual state.
- Buffering holds the last visual state.
- Stop clears active word.
- Narrate mode entry does not auto-play.
- Space and Play pause/resume while staying in Narrate mode.

Update `tests/narrTiming.test.ts`:

- Keep existing scheduler heuristic tests for audio telemetry.
- Add assertions that heuristic timing is not visual word truth.

### Verification Commands

```powershell
npx vitest run tests/narrationTimingTruth.test.ts tests/narrationChunkSync.test.tsx tests/narrTiming.test.ts
npx vitest run tests/useNarration.test.ts tests/useNarrationMossNano.test.tsx tests/narrationIntegration.test.ts
```

### Completion Criteria

- Narrate word highlight is locked to real speech timing only.
- Engines without word timing show active chunk only.
- Narrate no longer appears disconnected from audio by advancing bold words from fake timing.
- Narrate uses infinite scroll without Flow shading.

## Dispatch 5: Integration Gates, Cleanup, And Governance

**Sprint ID:** `CHUNK-SYNC-5`

**Objective:** Finish integration, remove stale duplicate visual paths, add evidence gates, and publish the implementation evidence without disturbing the current Desktop v2 queue unless explicitly promoted.

### Files to Create

- `docs/testing/chunk-synchronized-reading-checklist.md`
- `docs/testing/chunk-synchronized-reading-evidence.md`

### Files to Modify

- `src/components/ReaderContainer.tsx`
- `src/components/FoliatePageView.tsx`
- `src/hooks/useFlowScrollSync.ts`
- `src/utils/FlowScrollEngine.ts`
- `src/styles/flow.css`
- `tests/componentStyleCleanup.test.ts`
- `ROADMAP.md`
- `docs/governance/SPRINT_QUEUE.md`

### Implementation Steps

1. Remove or quarantine duplicate visual paths:

- Old Flow shrinking underline must not render in Flow/Narrate once chunk visual state is active.
- Old single-word `page-word--flow-cursor` should not be the active Flow/Narrate presentation.
- Keep compatibility methods only where other modes still call them.

2. Add manual evidence checklist in `docs/testing/chunk-synchronized-reading-checklist.md`:

```md
# Chunk-Synchronized Reading Checklist

- [ ] Flow: mode entry does not auto-play.
- [ ] Flow: Play starts and pauses while staying in Flow.
- [ ] Flow: Space starts and pauses while staying in Flow.
- [ ] Flow: active natural chunk is lightly highlighted.
- [ ] Flow: active WPM word is strongly highlighted.
- [ ] Flow: active chunk stays in reading window.
- [ ] Narrate with Kokoro timestamps: active chunk is lightly highlighted.
- [ ] Narrate with Kokoro timestamps: active spoken word is strongly highlighted.
- [ ] Narrate without timestamps: active chunk is highlighted and no word is bolded.
- [ ] Narrate: no Flow shading is visible.
- [ ] Narrate: mode entry does not auto-play.
- [ ] Narrate: Play and Space pause/resume while staying in Narrate.
```

3. Add evidence report in `docs/testing/chunk-synchronized-reading-evidence.md` with sections:

- Automated verification commands
- Manual fixture books
- Timing truth observations
- Known limitations
- Screenshots or screen recordings captured outside the repo if available

4. Update `ROADMAP.md` and `docs/governance/SPRINT_QUEUE.md` only after implementation is complete:

- If POSTV2 review is still active, add this work as a post-v2 prepared package or deferred lane, not as the active pointer.
- If the user explicitly promotes this work, move `CHUNK-SYNC-1` to the active queue pointer and preserve queue depth rules.
- Do not change Qwen retirement posture.

5. Run the broad verification set.

### Required Tests

Add or update cleanup tests:

- `TTSSettings` line-budget tests are unrelated and should remain passing.
- Component style cleanup should catch duplicate Flow/Narrate cursor rendering if a testable selector exists.
- No stale Qwen-specific assertions should be introduced.

### Verification Commands

```powershell
npx vitest run tests/naturalChunks.test.ts tests/chunkReadingVisualState.test.ts tests/foliateChunkHighlight.test.ts
npx vitest run tests/flow-scroll-engine.test.js tests/flowReadingZone.test.ts tests/flowTimerCursor.test.ts
npx vitest run tests/narrationTimingTruth.test.ts tests/narrationChunkSync.test.tsx tests/narrTiming.test.ts
npx vitest run tests/useNarration.test.ts tests/useNarrationMossNano.test.tsx tests/narrationIntegration.test.ts
npx vitest run tests
npm run build
```

### Completion Criteria

- All focused tests pass.
- Full suite passes.
- Build passes.
- Manual checklist exists and is filled out during live app verification.
- Governance docs reflect whether this package is deferred, active, or completed.

## Cross-Dispatch Acceptance Matrix

| Area | Required result |
|---|---|
| Chunk extraction | Headings, paragraphs, source line breaks after punctuation, sentence groups, sentences, and clause fallback produce deterministic chunks. |
| Flow visual | Active chunk is light highlighted and active WPM word is strongly highlighted. |
| Flow behavior | Infinite scroll keeps the active chunk in the reading window without duplicate cursor rendering. |
| Narrate visual with timing | Active chunk is light highlighted and active spoken word is strongly highlighted from trusted timing only. |
| Narrate visual without timing | Active chunk is light highlighted and there is no strong word highlight. |
| Narrate behavior | Infinite scroll keeps active spoken chunk visible; pause/buffer holds truthful state. |
| Controls | No mode auto-plays; Space and Play start/pause while remaining in the selected mode. |
| TTS posture | Qwen remains retired/disabled; Kokoro and current fallback engines remain governed by existing roadmap posture. |

## Recommended CLI Dispatch Prompt

Use this prompt for the first implementation run:

```text
Execute Dispatch 1 from C:\Users\estra\Projects\Blurby\docs\superpowers\plans\2026-05-10-chunk-synchronized-reading.md.

Scope: CHUNK-SYNC-1 only. Add the natural chunk model, source metadata, and tests. Do not implement Flow or Narrate rendering yet. Do not re-enable Qwen or change TTS defaults. Preserve the current POSTV2 queue posture unless the plan explicitly requires a documentation note.

Required verification:
- npx vitest run tests/naturalChunks.test.ts
- npx vitest run tests/foliateWordOffsets.test.ts tests/crossBookFlow.test.ts

Close out with changed files, verification output, any chunking edge cases discovered, and whether Dispatch 2 is unblocked.
```

## Rollback Plan

Each dispatch is isolated:

- Dispatch 1 adds pure chunking and metadata. If it regresses extraction, disable the adapter in `ReaderContainer.tsx` and keep existing word arrays.
- Dispatch 2 adds a new visual API while keeping old highlight methods. If it regresses rendering, stop passing `ChunkReadingVisualState`.
- Dispatch 3 migrates Flow. If Flow regresses, restore the old `FlowScrollEngine` visual path while keeping chunk extraction.
- Dispatch 4 migrates Narrate. If Narrate regresses, keep chunk highlight only and disable active word rendering until timing truth is corrected.
- Dispatch 5 is documentation and cleanup. If governance conflicts with current release work, keep this plan as the authoritative handoff and defer queue promotion.

## Plan Self-Review

- The plan implements the approved design spec and does not include Qwen reactivation.
- The plan distinguishes Flow WPM truth from Narrate speech timing truth.
- The plan explicitly prevents heuristic Narrate word highlighting.
- The plan includes tests before each implementation area.
- The plan names exact files and commands for CLI execution.
- The plan avoids changing the active Desktop v2 queue unless explicitly promoted.
