# Sprint 2 — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all placeholder speed reading features, add keyboard shortcuts, build Flow mode auto-advance, polish UX, and create comprehensive test coverage.

**Architecture:** Extend the existing useReader RAF-based playback engine with rhythm pause calculations. Add focus marks and focus span rendering to ReaderView. Build Flow mode as a word-level highlight system in ScrollReaderView with its own RAF loop. Reading modes controlled by mutually exclusive buttons: scroll (default), spacebar activates speed, shift+spacebar activates flow.

**Tech Stack:** React 19, TypeScript, CSS custom properties, requestAnimationFrame, Vitest

**Spec:** `docs/superpowers/specs/2026-03-18-sprint-2-design.md`

**Already completed (skip):** Item G (Manual Rescan) — implemented during Sprint 1 polish.

---

## Plan 1: Engine & Controls (Items A + B)

### Task 1: Rhythm Pause Calculation Utilities

**Files:**
- Create: `src/utils/rhythm.ts`
- Modify: `src/utils/text.ts` (add `tokenizeWithMeta`)
- Test: `tests/rhythm.test.js`
- Test: `tests/text.test.js` (add tokenizeWithMeta tests)

- [ ] **Step 1: Write failing test for tokenizeWithMeta**

In `tests/text.test.js`, add:

```javascript
import { tokenizeWithMeta } from "../src/utils/text.ts";

describe("tokenizeWithMeta", () => {
  it("returns words and paragraph break indices", () => {
    const result = tokenizeWithMeta("Hello world.\n\nSecond paragraph.\n\nThird.");
    expect(result.words).toEqual(["Hello", "world.", "Second", "paragraph.", "Third."]);
    expect(result.paragraphBreaks.has(1)).toBe(true);  // "world." ends paragraph 1
    expect(result.paragraphBreaks.has(3)).toBe(true);  // "paragraph." ends paragraph 2
    expect(result.paragraphBreaks.has(4)).toBe(true);  // "Third." ends last paragraph
  });

  it("handles single paragraph", () => {
    const result = tokenizeWithMeta("Just one paragraph here.");
    expect(result.words).toEqual(["Just", "one", "paragraph", "here."]);
    expect(result.paragraphBreaks.size).toBe(1); // last word
    expect(result.paragraphBreaks.has(3)).toBe(true);
  });

  it("handles empty input", () => {
    const result = tokenizeWithMeta("");
    expect(result.words).toEqual([]);
    expect(result.paragraphBreaks.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/text.test.js`

- [ ] **Step 3: Implement tokenizeWithMeta**

In `src/utils/text.ts`, add:

```typescript
export interface TokenizedContent {
  words: string[];
  paragraphBreaks: Set<number>; // indices of words that end a paragraph
}

export function tokenizeWithMeta(text: string | null | undefined): TokenizedContent {
  if (!text) return { words: [], paragraphBreaks: new Set() };
  const paragraphs = text.split(/\n{2,}/);
  const words: string[] = [];
  const paragraphBreaks = new Set<number>();

  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).filter(Boolean);
    if (paraWords.length === 0) continue;
    words.push(...paraWords);
    paragraphBreaks.add(words.length - 1); // last word of this paragraph
  }

  return { words, paragraphBreaks };
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Write failing tests for rhythm pause calculations**

Create `tests/rhythm.test.js`:

```javascript
import { describe, it, expect } from "vitest";
import { calculatePauseMs } from "../src/utils/rhythm.ts";

const DEFAULT_PUNCT_MS = 1000;
const ALL_ON = { commas: true, sentences: true, paragraphs: true, numbers: true, longerWords: true };
const ALL_OFF = { commas: false, sentences: false, paragraphs: false, numbers: false, longerWords: false };

describe("calculatePauseMs", () => {
  it("returns 0 when all pauses disabled", () => {
    expect(calculatePauseMs("hello", ALL_OFF, DEFAULT_PUNCT_MS, false)).toBe(0);
  });

  it("adds pause for comma words", () => {
    expect(calculatePauseMs("however,", ALL_ON, DEFAULT_PUNCT_MS, false)).toBeGreaterThan(0);
  });

  it("adds longer pause for sentence-ending words", () => {
    const commaPause = calculatePauseMs("word,", ALL_ON, DEFAULT_PUNCT_MS, false);
    const sentencePause = calculatePauseMs("word.", ALL_ON, DEFAULT_PUNCT_MS, false);
    expect(sentencePause).toBeGreaterThan(commaPause);
  });

  it("adds longest pause for paragraph breaks", () => {
    const sentencePause = calculatePauseMs("word.", ALL_ON, DEFAULT_PUNCT_MS, false);
    const paraPause = calculatePauseMs("word.", ALL_ON, DEFAULT_PUNCT_MS, true);
    expect(paraPause).toBeGreaterThan(sentencePause);
  });

  it("adds pause for numbers", () => {
    expect(calculatePauseMs("2024", ALL_ON, DEFAULT_PUNCT_MS, false)).toBeGreaterThan(0);
    expect(calculatePauseMs("2024", ALL_OFF, DEFAULT_PUNCT_MS, false)).toBe(0);
  });

  it("adds pause for longer words (>8 chars)", () => {
    expect(calculatePauseMs("extraordinary", ALL_ON, DEFAULT_PUNCT_MS, false)).toBeGreaterThan(0);
    expect(calculatePauseMs("hello", ALL_ON, DEFAULT_PUNCT_MS, false)).toBe(0); // 5 chars, no long-word pause
  });

  it("stacks comma + number pauses", () => {
    const commaOnly = calculatePauseMs("word,", { ...ALL_OFF, commas: true }, DEFAULT_PUNCT_MS, false);
    const numberOnly = calculatePauseMs("123", { ...ALL_OFF, numbers: true }, DEFAULT_PUNCT_MS, false);
    const both = calculatePauseMs("123,", { ...ALL_OFF, commas: true, numbers: true }, DEFAULT_PUNCT_MS, false);
    expect(both).toBe(commaOnly + numberOnly);
  });
});
```

- [ ] **Step 6: Implement calculatePauseMs**

Create `src/utils/rhythm.ts`:

```typescript
import type { RhythmPauses } from "../types";

/**
 * Calculate extra pause duration for a word based on rhythm pause settings.
 * @param word - The current word being displayed
 * @param pauses - Which pause types are enabled
 * @param punctMs - Base punctuation pause duration in ms
 * @param isParagraphEnd - Whether this word ends a paragraph
 * @returns Extra milliseconds to add to the word's display time
 */
export function calculatePauseMs(
  word: string,
  pauses: RhythmPauses,
  punctMs: number,
  isParagraphEnd: boolean
): number {
  let extra = 0;

  // Sentence endings (.!?) — longest punctuation pause
  if (pauses.sentences && /[.!?]["'»)\]]*$/.test(word)) {
    extra += Math.round(punctMs * 1.5);
    // Paragraph break adds on top of sentence pause
    if (pauses.paragraphs && isParagraphEnd) {
      extra += Math.round(punctMs * 0.5); // total ~2x for paragraph
    }
  }
  // Comma/colon/semicolon — shorter pause (only if not already a sentence end)
  else if (pauses.commas && /[,;:]["'»)\]]*$/.test(word)) {
    extra += punctMs;
    if (pauses.paragraphs && isParagraphEnd) {
      extra += punctMs; // paragraph after a comma clause
    }
  }
  // Paragraph break without punctuation
  else if (pauses.paragraphs && isParagraphEnd) {
    extra += Math.round(punctMs * 2);
  }

  // Numbers — additive
  if (pauses.numbers && /\d/.test(word)) {
    extra += Math.round(punctMs * 0.5);
  }

  // Longer words (>8 chars) — additive
  if (pauses.longerWords && word.length > 8) {
    extra += (word.length - 8) * 15;
  }

  return extra;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`

- [ ] **Step 8: Commit**

```bash
git add src/utils/rhythm.ts src/utils/text.ts tests/rhythm.test.js tests/text.test.js
git commit -m "feat: add rhythm pause calculation utilities and tokenizeWithMeta"
```

---

### Task 2: Wire Rhythm Pauses into Playback Engine

**Files:**
- Modify: `src/hooks/useReader.ts`
- Modify: `src/App.tsx` (pass rhythmPauses + paragraphBreaks to useReader)

- [ ] **Step 1: Update useReader to accept rhythm pauses**

In `src/hooks/useReader.ts`, add parameters:

```typescript
import { calculatePauseMs } from "../utils/rhythm";
import type { RhythmPauses } from "../types";

export function useReader(
  wpm: number,
  setWpm: ...,
  initialPauseMs?: number,
  punctuationPauseMs?: number,
  rhythmPauses?: RhythmPauses,
  paragraphBreaks?: Set<number>
)
```

- [ ] **Step 2: Replace hasPunctuation check with calculatePauseMs**

In the tick function (around line 39-42), replace:

```typescript
// BEFORE:
if (hasPunctuation(currentWord)) {
  effectiveInterval += punctPause;
}

// AFTER:
if (rhythmPausesRef.current) {
  effectiveInterval += calculatePauseMs(
    currentWord,
    rhythmPausesRef.current,
    punctPause,
    paragraphBreaksRef.current?.has(idx) || false
  );
} else if (hasPunctuation(currentWord)) {
  effectiveInterval += punctPause; // fallback to legacy behavior
}
```

Store `rhythmPauses` and `paragraphBreaks` in refs so the tick function doesn't need them in the dependency array.

- [ ] **Step 3: Update App.tsx to pass rhythm pauses**

In `src/App.tsx`, compute `tokenizeWithMeta` and pass to useReader:

```typescript
import { tokenizeWithMeta } from "./utils/text";

// In AppInner, after activeDoc is set:
const tokenized = useMemo(() => {
  if (!activeDoc?.content) return { words: [], paragraphBreaks: new Set<number>() };
  return tokenizeWithMeta(activeDoc.content);
}, [activeDoc?.content]);

// Pass to useReader:
const reader = useReader(wpm, setWpm, settings?.initialPauseMs, settings?.punctuationPauseMs, settings?.rhythmPauses, tokenized.paragraphBreaks);
```

- [ ] **Step 4: Run tests**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReader.ts src/App.tsx
git commit -m "feat: wire rhythm pauses into playback engine with per-word delay calculation"
```

---

### Task 3: Enable Rhythm Pause Settings Controls

**Files:**
- Modify: `src/components/settings/SpeedReadingSettings.tsx`

- [ ] **Step 1: Wire all rhythm pause toggles**

Replace disabled toggles with working ones. For each pause type:

```tsx
<div className="settings-toggle-row">
  <span className="settings-toggle-label">Commas, colons, etc.</span>
  <div
    className={`settings-toggle ${settings.rhythmPauses.commas ? "active" : ""}`}
    onClick={() => onSettingsChange({
      rhythmPauses: { ...settings.rhythmPauses, commas: !settings.rhythmPauses.commas }
    })}
    role="switch"
    aria-checked={settings.rhythmPauses.commas}
  >
    <div className="settings-toggle-thumb" />
  </div>
</div>
```

Repeat for: `sentences`, `paragraphs`, `numbers`, `longerWords`.

Remove all "Coming soon" text and `disabled` classes from rhythm pause section.

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/SpeedReadingSettings.tsx
git commit -m "feat: enable rhythm pause toggle controls in speed reading settings"
```

---

### Task 4: Focus Marks

**Files:**
- Modify: `src/components/ReaderView.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add focus mark rendering**

In `ReaderView.tsx`, the ORP display area (around line 129-141) has `.reader-guide-top` and `.reader-guide-bottom` divs. When `settings.focusMarks` is true, render triangular markers:

```tsx
<div className="reader-guide-line reader-guide-top">
  {settings?.focusMarks && <span className="focus-mark" style={{ left: `${orpPercent}%` }}>▼</span>}
</div>
```

Calculate `orpPercent` from the focus character's position:
```typescript
const orpPercent = currentWord ? ((before.length + 0.5) / currentWord.length) * 100 : 50;
```

Add `focusMarks` to the ReaderView props (passed from settings in App.tsx).

- [ ] **Step 2: Add CSS**

```css
.focus-mark {
  position: absolute;
  font-size: 10px;
  color: var(--accent);
  transform: translateX(-50%);
  line-height: 1;
}
.reader-guide-top .focus-mark { bottom: 0; }
.reader-guide-bottom .focus-mark { top: 0; }
```

- [ ] **Step 3: Enable toggle in SpeedReadingSettings**

Wire Focus Marks toggle (remove `disabled` class):
```tsx
<div
  className={`settings-toggle ${settings.focusMarks ? "active" : ""}`}
  onClick={() => onSettingsChange({ focusMarks: !settings.focusMarks })}
>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ReaderView.tsx src/styles/global.css src/components/settings/SpeedReadingSettings.tsx
git commit -m "feat: add ORP focus marks (▼▲) with settings toggle"
```

---

### Task 5: Focus Span (Variable Opacity)

**Files:**
- Modify: `src/components/ReaderView.tsx`
- Test: `tests/features.test.js`

- [ ] **Step 1: Write failing test for focus span calculation**

```javascript
import { calculateFocusOpacity } from "../src/utils/text.ts";

describe("calculateFocusOpacity", () => {
  it("returns 1.0 for characters within span range", () => {
    // word "extraordinary" (13 chars), ORP at index 3, focusSpan 0.4
    expect(calculateFocusOpacity(3, 3, 13, 0.4)).toBe(1);
    expect(calculateFocusOpacity(4, 3, 13, 0.4)).toBe(1);
  });

  it("returns reduced opacity for characters outside span", () => {
    expect(calculateFocusOpacity(10, 3, 13, 0.4)).toBeLessThan(1);
  });

  it("returns 1.0 for all chars when focusSpan is 1.0", () => {
    expect(calculateFocusOpacity(0, 3, 13, 1.0)).toBe(1);
    expect(calculateFocusOpacity(12, 3, 13, 1.0)).toBe(1);
  });
});
```

- [ ] **Step 2: Implement calculateFocusOpacity**

In `src/utils/text.ts`:

```typescript
export function calculateFocusOpacity(charIndex: number, orpIndex: number, wordLength: number, focusSpan: number): number {
  const spanChars = Math.max(1, Math.floor(focusSpan * wordLength));
  const distance = Math.abs(charIndex - orpIndex);
  return distance <= spanChars ? 1 : 0.3;
}
```

- [ ] **Step 3: Update ReaderView word rendering**

When `settings.focusSpan < 1`, render each character of the word with individual opacity:

```tsx
{settings?.focusSpan != null && settings.focusSpan < 1 ? (
  <span className="reader-word-display">
    {currentWord.split("").map((char, i) => (
      <span key={i} style={{ opacity: calculateFocusOpacity(i, pivotIndex, currentWord.length, settings.focusSpan) }}>
        {char}
      </span>
    ))}
  </span>
) : (
  // existing before/focus/after rendering
)}
```

- [ ] **Step 4: Enable slider in SpeedReadingSettings**

- [ ] **Step 5: Commit**

```bash
git add src/utils/text.ts src/components/ReaderView.tsx src/components/settings/SpeedReadingSettings.tsx tests/features.test.js
git commit -m "feat: add focus span variable opacity with settings slider"
```

---

### Task 6: Reading Ruler

**Files:**
- Modify: `src/components/ScrollReaderView.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add reading ruler overlay**

In `ScrollReaderView.tsx`, add after the scroll content div:

```tsx
{settings?.readingRuler && (
  <div className="reading-ruler" aria-hidden="true" />
)}
```

Add `settings` to ScrollReaderView props (pass `readingRuler` and `layoutSpacing`).

- [ ] **Step 2: Add CSS**

```css
.reading-ruler {
  position: fixed;
  left: 0;
  right: 0;
  top: 40%;
  height: 2px;
  background: var(--accent);
  opacity: 0.4;
  pointer-events: none;
  z-index: 10;
}
```

- [ ] **Step 3: Enable toggle in SpeedReadingSettings**

- [ ] **Step 4: Commit**

```bash
git add src/components/ScrollReaderView.tsx src/styles/global.css src/components/settings/SpeedReadingSettings.tsx
git commit -m "feat: add reading ruler overlay for scroll/flow mode"
```

---

### Task 7: Layout Spacing

**Files:**
- Modify: `src/components/ReaderView.tsx`
- Modify: `src/components/ScrollReaderView.tsx`
- Modify: `src/components/settings/LayoutSettings.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Pass layoutSpacing to reader views**

In `App.tsx`, pass `settings.layoutSpacing` as a prop to both ReaderView and ScrollReaderView.

- [ ] **Step 2: Apply spacing CSS in ReaderView**

On the pause text container and word display:

```tsx
style={{
  lineHeight: layoutSpacing?.line || 1.5,
  letterSpacing: `${layoutSpacing?.character || 0}px`,
  wordSpacing: `${layoutSpacing?.word || 0}px`,
}}
```

- [ ] **Step 3: Apply spacing CSS in ScrollReaderView**

On `.scroll-reader-text`:

```tsx
style={{
  fontSize: `${18 * scale}px`,
  lineHeight: layoutSpacing?.line || 1.5,
  letterSpacing: `${layoutSpacing?.character || 0}px`,
  wordSpacing: `${layoutSpacing?.word || 0}px`,
}}
```

- [ ] **Step 4: Enable LayoutSettings sliders**

In `LayoutSettings.tsx`, remove `disabled`, remove opacity wrapper, wire onChange:

```tsx
<input
  type="range"
  className="settings-slider"
  min={1} max={3} step={0.1}
  value={settings.layoutSpacing.line}
  onChange={(e) => onSettingsChange({
    layoutSpacing: { ...settings.layoutSpacing, line: Number(e.target.value) }
  })}
/>
```

Repeat for character and word spacing.

- [ ] **Step 5: Commit**

```bash
git add src/components/ReaderView.tsx src/components/ScrollReaderView.tsx src/components/settings/LayoutSettings.tsx src/App.tsx
git commit -m "feat: enable layout spacing controls (line, character, word spacing)"
```

---

### Task 8: Flow Text Size

**Files:**
- Modify: `src/components/settings/TextSizeSettings.tsx`
- Modify: `src/components/ScrollReaderView.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Enable flow text size slider**

In `TextSizeSettings.tsx`, remove `disabled` and opacity from the flow slider, wire onChange:

```tsx
onChange={(e) => onSettingsChange({ flowTextSize: Number(e.target.value) })}
```

- [ ] **Step 2: Pass flowTextSize to ScrollReaderView**

In `App.tsx`, pass `settings.flowTextSize` as a separate prop.

In `ScrollReaderView`, use `flowTextSize` for the scale calculation instead of `focusTextSize`:
```typescript
const scale = (flowTextSize || 100) / 100;
```

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/TextSizeSettings.tsx src/components/ScrollReaderView.tsx src/App.tsx
git commit -m "feat: enable flow reader text size control"
```

---

### Task 9: Keyboard Shortcuts

**Files:**
- Modify: `src/hooks/useKeyboardShortcuts.ts`
- Modify: `src/components/ReaderView.tsx` (onKeyDown for focused container)
- Modify: `src/components/ScrollReaderView.tsx` (onKeyDown)
- Modify: `src/App.tsx` (pass new handlers)
- Modify: `src/components/settings/HotkeyMapSettings.tsx`

- [ ] **Step 1: Add Shift+Up/Down for coarse WPM adjustment**

In the `useReaderKeys` handler, before the existing ArrowUp/Down checks, add:

```typescript
if (e.code === "ArrowUp" && e.shiftKey) { e.preventDefault(); adjustWpm(100); return; }
if (e.code === "ArrowDown" && e.shiftKey) { e.preventDefault(); adjustWpm(-100); return; }
```

Also add to both ReaderView and ScrollReaderView `onKeyDown` handlers.

- [ ] **Step 2: Add B for toggle favorite**

Add `toggleFavorite` and `activeDocId` as parameters to `useReaderKeys`:

```typescript
if (e.code === "KeyB" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
  e.preventDefault();
  toggleFavorite?.(activeDocId);
  return;
}
```

- [ ] **Step 3: Add Shift+F for mode switch**

```typescript
if (e.code === "KeyF" && e.shiftKey) {
  e.preventDefault();
  switchMode?.();
  return;
}
```

Pass `switchMode` callback that calls `handleSwitchToScroll` or `handleSwitchToFocus` depending on current mode.

- [ ] **Step 4: Add Ctrl/Cmd+, for settings**

In `useGlobalKeys` (works in all views):

```typescript
if ((e.ctrlKey || e.metaKey) && e.key === ",") {
  e.preventDefault();
  openSettings?.();
}
```

`openSettings` opens the flap and navigates to settings.

- [ ] **Step 5: Update reading mode buttons to be mutually exclusive**

In both reader views, render three mode buttons (scroll/speed/flow) where the active one is highlighted and clicking any selects it:
- **Scroll** (default when opening) — passive scroll reading
- **Speed** (spacebar activates) — RSVP one-word-at-a-time
- **Flow** (shift+spacebar activates) — auto-advancing highlight

Space in scroll mode switches to speed mode and starts playback.
Shift+Space in scroll mode switches to flow mode and starts flow playback.

- [ ] **Step 6: Update HotkeyMapSettings**

Change implemented shortcuts from "planned" to "implemented":
- Shift+Up/Down
- B (toggle favorite)
- Shift+F (speed reading mode)
- Ctrl/Cmd+, (reader settings)

Change deferred shortcuts to "future".

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useKeyboardShortcuts.ts src/components/ReaderView.tsx src/components/ScrollReaderView.tsx src/App.tsx src/components/settings/HotkeyMapSettings.tsx
git commit -m "feat: add keyboard shortcuts (Shift+arrows, B, Shift+F, Ctrl+,) and mutually exclusive mode buttons"
```

---

## Plan 2: Flow Mode Auto-Advance (Item C)

### Task 10: Flow Mode Word-Level Rendering

**Files:**
- Modify: `src/components/ScrollReaderView.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add flow state**

```typescript
const [flowPlaying, setFlowPlaying] = useState(false);
const [flowWordIndex, setFlowWordIndex] = useState(activeDoc.position || 0);
const flowAccRef = useRef(0);
const flowRafRef = useRef<number | null>(null);
const flowLastTimeRef = useRef(0);
```

- [ ] **Step 2: Word-level rendering with highlight**

Replace paragraph-based rendering with word spans when flow is active:

```tsx
{flowPlaying || flowWordIndex > 0 ? (
  <div className="scroll-reader-text flow-text" style={{ fontSize: `${18 * scale}px` }}>
    {words.map((word, i) => (
      <span
        key={i}
        ref={i === flowWordIndex ? flowWordRef : null}
        className={i === flowWordIndex ? "flow-word-active" : ""}
        onClick={() => { setFlowWordIndex(i); }}
      >
        {word}{' '}
      </span>
    ))}
  </div>
) : (
  // existing paragraph rendering for passive scroll
  <div className="scroll-reader-text" style={{ fontSize: `${18 * scale}px` }}>
    {displayBlocks.map((block, i) => (
      <p key={i} className="scroll-reader-paragraph">{block}</p>
    ))}
  </div>
)}
```

**Optimization note:** For very large documents (>50k words), use a virtual window rendering only ~3000 words around the current position. This can be added later if performance is an issue.

- [ ] **Step 3: Add CSS for flow highlight**

```css
.flow-word-active {
  background: var(--accent);
  color: var(--bg);
  border-radius: 2px;
  padding: 1px 3px;
  margin: 0 -3px;
}

.flow-text {
  line-height: 1.8;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ScrollReaderView.tsx src/styles/global.css
git commit -m "feat: add word-level rendering with highlight for flow mode"
```

---

### Task 11: Flow Mode RAF Playback Loop

**Files:**
- Modify: `src/components/ScrollReaderView.tsx`

- [ ] **Step 1: Implement RAF-based auto-advance**

```typescript
const flowTick = useCallback((timestamp: number) => {
  if (!flowLastTimeRef.current) flowLastTimeRef.current = timestamp;
  const delta = timestamp - flowLastTimeRef.current;
  flowLastTimeRef.current = timestamp;

  flowAccRef.current += delta;
  const interval = 60000 / wpm;

  // Calculate extra pause for current word
  const currentWord = words[flowWordIndex] || "";
  const extraPause = rhythmPauses
    ? calculatePauseMs(currentWord, rhythmPauses, punctuationPauseMs || 1000, paragraphBreaks?.has(flowWordIndex) || false)
    : 0;
  const effectiveInterval = interval + extraPause;

  if (flowAccRef.current >= effectiveInterval) {
    flowAccRef.current -= effectiveInterval;
    setFlowWordIndex((prev) => {
      const next = prev + 1;
      if (next >= words.length) {
        setFlowPlaying(false);
        return prev;
      }
      return next;
    });
  }

  flowRafRef.current = requestAnimationFrame(flowTick);
}, [wpm, words, flowWordIndex, rhythmPauses, punctuationPauseMs, paragraphBreaks]);

// Start/stop loop
useEffect(() => {
  if (flowPlaying) {
    flowLastTimeRef.current = 0;
    flowRafRef.current = requestAnimationFrame(flowTick);
  } else if (flowRafRef.current) {
    cancelAnimationFrame(flowRafRef.current);
  }
  return () => { if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current); };
}, [flowPlaying, flowTick]);
```

- [ ] **Step 2: Auto-scroll to keep highlighted word visible**

```typescript
const flowWordRef = useRef<HTMLSpanElement | null>(null);

useEffect(() => {
  if (flowPlaying && flowWordRef.current) {
    flowWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}, [flowWordIndex, flowPlaying]);
```

- [ ] **Step 3: Wire Shift+Space to start flow**

In the onKeyDown handler:

```typescript
if (e.code === "Space" && e.shiftKey) {
  e.preventDefault();
  setFlowPlaying((prev) => !prev);
} else if (e.code === "Space" && !e.shiftKey) {
  e.preventDefault();
  // Switch to focus/speed mode
  onSwitchToFocus?.();
}
```

- [ ] **Step 4: Add play/pause button to top bar**

```tsx
<button
  className={`btn reader-mode-btn ${flowPlaying ? "active" : ""}`}
  onClick={() => setFlowPlaying((prev) => !prev)}
  aria-label={flowPlaying ? "Pause flow reading" : "Start flow reading"}
>
  {flowPlaying ? "pause" : "flow"}
</button>
```

- [ ] **Step 5: Update progress tracking**

When flow is playing, update progress based on `flowWordIndex`:

```typescript
useEffect(() => {
  if (flowPlaying) {
    onProgressUpdate(flowWordIndex);
  }
}, [flowWordIndex, flowPlaying, onProgressUpdate]);
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ScrollReaderView.tsx
git commit -m "feat: add RAF-based flow mode auto-advance with rhythm pauses and auto-scroll"
```

---

## Plan 3: Polish & Testing (Items D + F)

### Task 12: UX Polish

**Files:**
- Modify: `src/components/LibraryView.tsx`
- Modify: `src/components/DocGridCard.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Rename export/import buttons**

In `LibraryView.tsx` footer, change:
```
"export" → "backup"
"import" → "restore"
```

- [ ] **Step 2: Add grid card context actions**

In `DocGridCard.tsx`, add a hover overlay with action buttons:

```tsx
<div className="doc-grid-actions">
  <button onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(doc.id); }}>★</button>
  <button onClick={(e) => { e.stopPropagation(); onArchive?.(doc.id); }}>📦</button>
  <button onClick={(e) => { e.stopPropagation(); onDelete?.(doc.id); }}>🗑</button>
</div>
```

Add props: `onToggleFavorite`, `onArchive`, `onDelete` to DocGridCard.

CSS:
```css
.doc-grid-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  opacity: 0;
  transition: opacity 0.15s ease;
}
.doc-grid-card:hover .doc-grid-actions { opacity: 1; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LibraryView.tsx src/components/DocGridCard.tsx src/styles/global.css
git commit -m "fix: rename export/import to backup/restore, add grid card hover actions"
```

---

### Task 13: Manual Test Checklist Document

**Files:**
- Create: `docs/manual-test-checklist.md`

- [ ] **Step 1: Write the test checklist**

Copy the full checklist from the Sprint 2 spec (Section F.2) into `docs/manual-test-checklist.md`, adding the new features from this sprint (rhythm pauses, focus marks, focus span, layout spacing, flow mode, new shortcuts).

- [ ] **Step 2: Commit**

```bash
git add docs/manual-test-checklist.md
git commit -m "docs: add comprehensive manual test checklist"
```

---

### Task 14: Expanded Pure Function Tests

**Files:**
- Modify: `tests/features.test.js`
- Modify: `tests/text.test.js`

- [ ] **Step 1: Add bubble count edge case tests**

```javascript
describe("bubbleCount edge cases", () => {
  it("returns 0 for negative progress", () => {
    expect(bubbleCount(-5)).toBe(0);
  });
  it("returns 10 for >100% progress", () => {
    expect(bubbleCount(150)).toBe(15); // or clamp — verify actual behavior
  });
});
```

- [ ] **Step 2: Add formatDisplayTitle tests**

```javascript
import { formatDisplayTitle } from "../src/utils/text.ts";

describe("formatDisplayTitle", () => {
  it("replaces underscore-space with colon-space", () => {
    expect(formatDisplayTitle("Blink_ The Power")).toBe("Blink: The Power");
  });
  it("replaces remaining underscores with spaces", () => {
    expect(formatDisplayTitle("trading_options_ebook")).toBe("Trading Options Ebook");
  });
  it("converts ALL CAPS to title case", () => {
    expect(formatDisplayTitle("REIMAGINING CIVIL SOCIETY")).toBe("Reimagining Civil Society");
  });
  it("replaces dash-author with pipe", () => {
    expect(formatDisplayTitle("Steve Jobs - Walter Isaacson")).toBe("Steve Jobs | Walter Isaacson");
  });
  it("capitalizes first letter", () => {
    expect(formatDisplayTitle("lowercase title")).toBe("Lowercase Title"); // ALL CAPS triggers title case
  });
});
```

- [ ] **Step 3: Run all tests**

Run: `npm test`

- [ ] **Step 4: Commit**

```bash
git add tests/features.test.js tests/text.test.js
git commit -m "test: add edge case tests for bubbleCount, formatDisplayTitle, and rhythm pauses"
```

---

### Task 15: Update Roadmap

**Files:**
- Modify: `ROADMAP.md`

- [ ] **Step 1: Add Phase 6 to ROADMAP**

Add a Phase 6 section documenting Sprint 2 deliverables, all checked off.

- [ ] **Step 2: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: add Phase 6 (Sprint 2) to roadmap"
```

---

## Task Summary

| # | Task | Plan | Dependencies |
|---|------|------|-------------|
| 1 | Rhythm Pause Utilities | 1 | None |
| 2 | Wire Rhythm Pauses to Engine | 1 | Task 1 |
| 3 | Enable Rhythm Pause Controls | 1 | Task 2 |
| 4 | Focus Marks | 1 | None |
| 5 | Focus Span | 1 | None |
| 6 | Reading Ruler | 1 | None |
| 7 | Layout Spacing | 1 | None |
| 8 | Flow Text Size | 1 | None |
| 9 | Keyboard Shortcuts + Mode Buttons | 1 | None |
| 10 | Flow Word-Level Rendering | 2 | Task 1 (rhythm utils) |
| 11 | Flow RAF Playback Loop | 2 | Task 10 |
| 12 | UX Polish | 3 | None |
| 13 | Manual Test Checklist | 3 | None |
| 14 | Expanded Tests | 3 | Tasks 1, 5 |
| 15 | Update Roadmap | 3 | All |

**Parallelizable:** Tasks 1, 4, 5, 6, 7, 8, 9, 12, 13 can run concurrently. Tasks 2-3 depend on 1. Tasks 10-11 depend on 1. Task 14 depends on 1 and 5.
