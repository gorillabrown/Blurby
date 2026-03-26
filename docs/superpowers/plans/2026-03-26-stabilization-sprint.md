# Sprint 25S: Stabilization Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 13 bugs to achieve a fully stable reader across all four modes (Page, Focus, Flow, Narration) for both EPUB and non-EPUB formats.

**Architecture:** Two-phase approach — Phase 1 fixes critical blockers serially (5 bugs), Phase 2 runs two parallel tracks for mode integrity (Foliate DOM track: 5 bugs, Narration UX track: 3 bugs). Shared utilities extracted where fixes overlap. All EPUB visual feedback (cursor, highlight) uses positioned overlays, never DOM injection.

**Tech Stack:** Electron 41, React 19, TypeScript 5.9, Vitest 4.1, foliate-js (EPUB renderer), Web Speech API + Kokoro AI (TTS)

**Spec:** `docs/superpowers/specs/2026-03-26-stabilization-sprint-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/utils/segmentWords.ts` | Shared `Intl.Segmenter`-based word tokenization utility (S-09) |
| `src/utils/getOverlayPosition.ts` | Shared Range→viewport position utility for foliate overlays (S-06, S-08) |
| `src/components/ReturnToReadingPill.tsx` | Floating "Return to reading" pill component (S-11) |
| `src/components/BacktrackPrompt.tsx` | High-water mark backtrack prompt dialog (S-04) |
| `tests/segmentWords.test.ts` | Tests for shared word segmentation |
| `tests/getOverlayPosition.test.ts` | Tests for overlay position utility |

### Modified Files
| File | Changes |
|------|---------|
| `src/styles/global.css` | S-01: `-webkit-app-region: no-drag` on voice engine toggle; S-11: pill styles; S-04: backtrack prompt styles; S-12: CONFIRMED indicator styles |
| `.github/workflows/release.yml` | S-02: Fix latest.yml merge logic + verification step |
| `src/components/FoliatePageView.tsx` | S-03: Guard initial CFI; S-10: Re-extract words on section change with index continuity; S-09: Use `segmentWords` in click handler; S-06: Overlay cursor for Flow mode; S-08: Overlay highlight for narration |
| `src/components/ReaderContainer.tsx` | S-04: Page-based progress + high-water mark; S-05: Fix narrate button wiring; S-10: Handle `onWordsReextracted`; S-11: Decouple view from highlight when paused |
| `src/hooks/useNarration.ts` | S-12: Generation ID guard, pre-buffer invalidation on rate change |
| `src/components/ReaderBottomBar.tsx` | S-12: CONFIRMED indicator; S-14: Mode-aware time calculation |
| `src/components/settings/SpeedReadingSettings.tsx` | S-01: Verify click handler wiring (may be CSS-only fix) |
| `src/types.ts` | S-04: Add `furthestPosition` to BlurbyDoc |

---

## Phase 1: Critical Blockers (Serial)

### Task 1: S-01 — Kokoro AI Button Unclickable

**Files:**
- Modify: `src/styles/global.css` (search for voice-engine or tts-engine toggle styles)
- Modify: `src/components/settings/SpeedReadingSettings.tsx:12-116` (verify click handler exists)

- [ ] **Step 1: Identify the CSS selector for the voice engine toggle buttons**

Open `SpeedReadingSettings.tsx` and find the className for the System/Kokoro AI button pair. Then search `global.css` for that class and any parent with `-webkit-app-region: drag`.

- [ ] **Step 2: Add no-drag override**

In `global.css`, add `-webkit-app-region: no-drag` to the voice engine toggle button group. Pattern to follow — search for existing `no-drag` declarations in the file for the exact pattern used elsewhere in the settings flap.

```css
/* Voice engine toggle — prevent drag region from swallowing clicks */
.settings-mode-toggle,
.settings-mode-toggle .settings-mode-btn {
  -webkit-app-region: no-drag;
}
```

The actual class names in SpeedReadingSettings.tsx are `settings-mode-toggle` (line 314) and `settings-mode-btn` (lines 316, 322). Verify these match before applying.

- [ ] **Step 3: Verify click handler wiring**

In `SpeedReadingSettings.tsx`, confirm the Kokoro AI button's `onClick` calls `onSettingsChange({ ttsEngine: "kokoro" })` (or equivalent). If the handler is missing, add it.

- [ ] **Step 4: Manual test**

Run: `npm start`
Test: Open Settings → Speed Reading → Voice engine. Click "Kokoro AI" → should toggle. Click "System" → should toggle back. Close and reopen settings → selection persists.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/components/settings/SpeedReadingSettings.tsx
git commit -m "fix(S-01): make Kokoro AI button clickable in settings flap"
```

---

### Task 2: S-02 — Auto-Updater latest.yml Missing x64

**Files:**
- Modify: `.github/workflows/release.yml:82-106`

- [ ] **Step 1: Read the current merge logic**

Read `.github/workflows/release.yml` lines 82-106. Understand how x64 and arm64 `latest.yml` files are currently merged via sed.

- [ ] **Step 2: Fix the sed merge logic**

The current logic extracts ARM64 entries and inserts them into the x64 base. Common failure modes:
- sed anchoring on wrong line (e.g., first `size:` match vs the one in `files:` array)
- Missing newline handling
- ARM64 file not found at expected path

Rewrite the merge section to be more robust:

```yaml
      - name: Merge latest.yml for both architectures
        run: |
          # Use x64 as base
          cp artifacts-x64/latest.yml merged-latest.yml

          # Extract arm64 file entry
          ARM_URL=$(grep -A2 '  - url:' artifacts-arm64/latest.yml | head -1 | sed 's/.*url: //')
          ARM_SHA=$(grep -A2 '  - url:' artifacts-arm64/latest.yml | sed -n '2p' | sed 's/.*sha512: //')
          ARM_SIZE=$(grep -A2 '  - url:' artifacts-arm64/latest.yml | sed -n '3p' | sed 's/.*size: //')

          # Append arm64 entry after the last size: line in files array
          sed -i "/^files:/,/^[^ ]/{
            /^    size:/{
              a\\  - url: ${ARM_URL}\\n    sha512: ${ARM_SHA}\\n    size: ${ARM_SIZE}
            }
          }" merged-latest.yml

          # Verify both architectures present
          if ! grep -q "x64" merged-latest.yml; then
            echo "ERROR: x64 entry missing from latest.yml"
            exit 1
          fi
          if ! grep -q "arm64" merged-latest.yml; then
            echo "ERROR: arm64 entry missing from latest.yml"
            exit 1
          fi

          echo "--- Merged latest.yml ---"
          cat merged-latest.yml

          cp merged-latest.yml artifacts/latest.yml
```

Adapt this to match the actual workflow structure (job names, artifact paths, upload step).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "fix(S-02): robust latest.yml merge for x64 + arm64 auto-updater"
```

Note: V-02 verification (trigger workflow, inspect output) happens in Phase 4.

---

### Task 3: S-03 — EPUB Starts on Page ~3 Instead of Cover

**Files:**
- Modify: `src/components/FoliatePageView.tsx:306-311` (relocate listener), `~146-200` (init logic)
- Modify: `src/components/ReaderContainer.tsx:666-672` (onRelocate handler)

- [ ] **Step 1: Find the initial CFI navigation code**

In `FoliatePageView.tsx`, locate where `view.init()` or `view.goTo()` is called with the saved CFI. This is likely near the component mount / useEffect.

- [ ] **Step 2: Guard initial navigation**

Only pass `lastLocation` to `view.init()` when a saved CFI exists:

```typescript
// Only restore position if user has a saved CFI (not first open)
const initOptions = savedCfi
  ? { lastLocation: savedCfi }
  : {};
await view.init(initOptions);

// If no saved position AND foliate didn't land on cover, force it
if (!savedCfi) {
  const loc = await view.goToFraction(0);
  // This ensures cover page is shown on first open
}
```

- [ ] **Step 3: Manual test**

Test with a Project Gutenberg EPUB that has a cover image:
- Delete the book from library (clear saved position)
- Re-add and open → should land on cover (page 0)
- Read a few pages, close, reopen → should restore saved position

- [ ] **Step 4: Commit**

```bash
git add src/components/FoliatePageView.tsx src/components/ReaderContainer.tsx
git commit -m "fix(S-03): EPUB opens to cover on first read, restores CFI on subsequent"
```

---

### Task 4: S-04 — False Progress on Open (Page-Based + Backtrack Prompt)

**Files:**
- Modify: `src/types.ts:2-41` (add `furthestPosition` to BlurbyDoc)
- Modify: `src/components/ReaderContainer.tsx:145-199` (progress calculation), `~660-700` (reader close)
- Create: `src/components/BacktrackPrompt.tsx`
- Modify: `src/styles/global.css` (prompt styles)

- [ ] **Step 1: Add `furthestPosition` to BlurbyDoc type**

In `src/types.ts`, add to the `BlurbyDoc` interface:

```typescript
furthestPosition?: number; // Page number (non-EPUB) or fraction 0.0-1.0 (EPUB)
```

- [ ] **Step 2: Update progress calculation to be page-based**

In `ReaderContainer.tsx`, find the progress save logic. Ensure:
- For non-EPUB: `progress = currentPage / totalPages` (should already be correct)
- For EPUB: `progress = fraction` from foliate relocate event
- Key fix: page 0 / fraction 0 = 0% even when `highlightedWordIndex > 0`

```typescript
// In the progress save function:
const progress = useFoliate
  ? currentFractionRef.current  // fraction from foliate relocate
  : totalPages > 0 ? currentPage / totalPages : 0;

// Page 0 / fraction 0 = 0% regardless of word index
const displayProgress = Math.max(0, progress);
```

- [ ] **Step 3: Track high-water mark**

Add `furthestPositionRef` and update it whenever position advances:

```typescript
const furthestPositionRef = useRef<number>(activeDoc?.furthestPosition ?? 0);

// In relocate/progress handler:
const currentPos = useFoliate ? fraction : currentPage;
if (currentPos > furthestPositionRef.current) {
  furthestPositionRef.current = currentPos;
}
```

- [ ] **Step 4: Add engagement tracking**

```typescript
const hasEngagedRef = useRef(false);

// Set true on: mode start, word click, page turn
// In startFocus/startFlow/startNarration:
hasEngagedRef.current = true;
// In word click handler:
hasEngagedRef.current = true;
// In page turn handler:
hasEngagedRef.current = true;
```

- [ ] **Step 5: Create BacktrackPrompt component**

Create `src/components/BacktrackPrompt.tsx`:

```typescript
interface BacktrackPromptProps {
  currentPage: number;      // Display page (approximate for EPUB)
  furthestPage: number;     // Display page of furthest position
  onSaveAtCurrent: () => void;
  onKeepFurthest: () => void;
}

export default function BacktrackPrompt({
  currentPage, furthestPage, onSaveAtCurrent, onKeepFurthest
}: BacktrackPromptProps) {
  // Handle Enter key → default to "Keep at furthest"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") { onKeepFurthest(); }
      if (e.key === "Escape") { onKeepFurthest(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKeepFurthest]);

  return (
    <div className="backtrack-prompt">
      <button className="backtrack-btn secondary" onClick={onSaveAtCurrent}>
        Save at page {currentPage}
      </button>
      <button className="backtrack-btn primary" onClick={onKeepFurthest}>
        Keep at page {furthestPage}
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Add backtrack prompt styles to global.css**

```css
.backtrack-prompt {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}
.backtrack-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.backtrack-btn.primary {
  background: var(--accent);
  color: white;
}
.backtrack-btn.secondary {
  background: var(--overlay-light);
  color: var(--text);
}
```

- [ ] **Step 7: Wire backtrack prompt into reader close flow**

In `ReaderContainer.tsx`, in the `finishReading()` or exit handler:

```typescript
// Calculate threshold
const currentPos = useFoliate ? currentFractionRef.current : currentPage;
const furthest = furthestPositionRef.current;
const threshold = useFoliate
  ? 2 / Math.max(1, estimatedTotalPages)  // ~2 page equivalent in fraction
  : 2;  // 2 pages for non-EPUB

const isBacktracked = currentPos < (furthest - threshold);

if (isBacktracked && hasEngagedRef.current) {
  // Show prompt instead of immediately saving
  setShowBacktrackPrompt(true);
  return; // Don't close yet
}

// Normal close — save at current position
saveAndClose(currentPos);
```

- [ ] **Step 8: Manual test**

- Open new EPUB → 0% progress
- Advance 50 pages → progress updates
- Return to page 0, close → prompt appears
- Select "Save at page 0" → progress resets to 0%
- Reopen, advance 50 pages, go to page 48, close → no prompt (within threshold)

- [ ] **Step 9: Commit**

```bash
git add src/types.ts src/components/ReaderContainer.tsx src/components/BacktrackPrompt.tsx src/styles/global.css
git commit -m "fix(S-04): page-based progress with high-water mark backtrack prompt"
```

---

### Task 5: S-05 — Narrate Auto-Starts on Click

**Files:**
- Modify: `src/components/ReaderBottomBar.tsx:225-242` (narrate button onClick)
- Modify: `src/components/ReaderContainer.tsx:391-404` (handleSelectMode), `~438` (N key shortcut)

- [ ] **Step 1: Identify the narrate button's onClick handler**

In `ReaderBottomBar.tsx`, find the Narrate button (around line 242). Check what callback it fires — likely `onToggleTts` prop. Trace this prop back to `ReaderContainer.tsx` to see what function it maps to.

**NOTE:** The button wiring may already be correct — `onToggleTts` at line 242 may already map to `handleSelectMode("narration")` (lines 391-404, 407-409). If so, the auto-start bug is elsewhere. Check if `handleSelectMode` itself, or a `useEffect` watching `lastReadingMode`/`readingMode`, inadvertently triggers `startNarration()`. The bug could also be in the `N` key handler or in `handleTogglePlay` being called instead of `handleSelectMode`.

- [ ] **Step 2: Fix the actual auto-start trigger**

Once the root cause is identified:
- If button wiring is wrong: change to call `handleSelectMode("narration")`
- If `handleSelectMode` auto-starts: remove the `startNarration()` call from within it
- If a `useEffect` triggers it: guard the effect with a `readingMode === "page"` check

In `ReaderContainer.tsx`, ensure the prop passed to `ReaderBottomBar` for the narrate button is `handleSelectMode("narration")`:

```typescript
// In ReaderBottomBar props:
onToggleTts={() => handleSelectMode("narration")}
```

- [ ] **Step 3: Verify N key shortcut**

Check the keyboard shortcut for `N` (around line 438). Ensure it also calls `handleSelectMode("narration")`, not `startNarration()`.

- [ ] **Step 4: Verify Space still starts narration**

Confirm `handleTogglePlay` (line 416) still calls `startNarration()` when `lastReadingMode === "narration"` and `readingMode === "page"`. This should already be correct.

- [ ] **Step 5: Manual test**

- Open a book in Page mode
- Click Narrate button → button highlights, bottom bar shows TTS rate, NO audio
- Press Space → TTS begins
- Press Space → pauses
- Click Narrate button again → stops and deselects

- [ ] **Step 6: Commit**

```bash
git add src/components/ReaderBottomBar.tsx src/components/ReaderContainer.tsx
git commit -m "fix(S-05): narrate click selects mode, Space starts playback"
```

---

## Phase 2, Track A: Foliate DOM (Serial — S-10 First)

### Task 6: S-10 — Stale Range Objects After Navigation + Shared Utilities

**Files:**
- Create: `src/utils/segmentWords.ts` (shared utility for S-09 and S-10)
- Create: `tests/segmentWords.test.ts`
- Create: `src/utils/getOverlayPosition.ts` (shared utility for S-06 and S-08)
- Create: `tests/getOverlayPosition.test.ts`
- Modify: `src/components/FoliatePageView.tsx:19-47` (extractWordsFromView), `304-311` (relocate/section events)

- [ ] **Step 1: Create segmentWords utility**

Create `src/utils/segmentWords.ts`:

```typescript
const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

/**
 * Tokenize text into words using Intl.Segmenter.
 * Consistent tokenization for both word extraction and click position mapping.
 */
export function segmentWords(text: string): string[] {
  return Array.from(segmenter.segment(text))
    .filter(s => s.isWordLike)
    .map(s => s.segment);
}

/**
 * Count words using Intl.Segmenter tokenization (same as segmentWords).
 * NOTE: src/utils/text.ts already exports a countWords using whitespace splitting.
 * After creating this file, update all foliate-related imports to use this version.
 * Keep text.ts countWords for non-EPUB paths where Segmenter isn't needed.
 */
export function countWordsSegmenter(text: string): number {
  let count = 0;
  for (const s of segmenter.segment(text)) {
    if (s.isWordLike) count++;
  }
  return count;
}
```

- [ ] **Step 2: Write tests for segmentWords**

Create `tests/segmentWords.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { segmentWords, countWordsSegmenter } from "../src/utils/segmentWords";

describe("segmentWords", () => {
  it("splits simple sentence", () => {
    expect(segmentWords("Hello world")).toEqual(["Hello", "world"]);
  });

  it("handles punctuation-attached words", () => {
    const words = segmentWords("Hello, world! How's it going?");
    expect(words).toContain("Hello");
    expect(words).toContain("world");
    expect(words).toContain("How's");
  });

  it("handles multiple spaces and newlines", () => {
    expect(segmentWords("a  b\n\nc")).toEqual(["a", "b", "c"]);
  });

  it("returns empty for empty/whitespace input", () => {
    expect(segmentWords("")).toEqual([]);
    expect(segmentWords("   ")).toEqual([]);
  });

  it("countWords matches segmentWords length", () => {
    const text = "The quick brown fox jumps over the lazy dog.";
    expect(countWordsSegmenter(text)).toBe(segmentWords(text).length);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run tests/segmentWords.test.ts`
Expected: All pass.

- [ ] **Step 4: Create getOverlayPosition utility**

Create `src/utils/getOverlayPosition.ts`:

```typescript
export interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Get viewport-relative position for a DOM Range, accounting for
 * shadow DOM vs iframe rendering in foliate.
 *
 * @param range - DOM Range from extracted word
 * @param containerEl - The foliate container element for offset calculation
 * @returns OverlayRect in viewport coordinates, or null if range is disconnected
 */
export function getOverlayPosition(
  range: Range,
  containerEl: HTMLElement
): OverlayRect | null {
  // Guard: check range is still connected to DOM
  if (!range.startContainer.isConnected) return null;

  const rangeRect = range.getBoundingClientRect();

  // Check if range lives in an iframe (range's document differs from main document)
  const rangeDoc = range.startContainer.ownerDocument;
  if (rangeDoc && rangeDoc !== document) {
    // Find the iframe element that contains this document
    const iframes = containerEl.querySelectorAll("iframe");
    for (const iframe of iframes) {
      try {
        if (iframe.contentDocument === rangeDoc) {
          const iframeRect = iframe.getBoundingClientRect();
          return {
            top: rangeRect.top + iframeRect.top,
            left: rangeRect.left + iframeRect.left,
            width: rangeRect.width,
            height: rangeRect.height,
          };
        }
      } catch {
        // Cross-origin iframe — skip
      }
    }
  }

  // Shadow DOM or same document — getBoundingClientRect is viewport-relative
  return {
    top: rangeRect.top,
    left: rangeRect.left,
    width: rangeRect.width,
    height: rangeRect.height,
  };
}
```

- [ ] **Step 5: Write tests for getOverlayPosition**

Create `tests/getOverlayPosition.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getOverlayPosition } from "../src/utils/getOverlayPosition";

describe("getOverlayPosition", () => {
  it("returns null for disconnected range", () => {
    // Create a range on a detached node
    const detachedDiv = document.createElement("div");
    detachedDiv.textContent = "test";
    const range = document.createRange();
    range.selectNodeContents(detachedDiv);

    const container = document.createElement("div");
    const result = getOverlayPosition(range, container);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/getOverlayPosition.test.ts`
Expected: Pass.

- [ ] **Step 7: Implement word re-extraction on section change**

In `FoliatePageView.tsx`, modify the section load / relocate event handlers:

1. Refactor `extractWordsFromView` to use `segmentWords` from the shared utility
2. The word array (`foliateWordsRef`) must represent the full document, not just current section
3. On section change:
   - Re-extract words for the newly visible section(s)
   - Merge into the full array at the correct section offset
   - Null out Range references for unloaded sections (keep word strings)
   - Call `onWordsReextracted?.()` callback

```typescript
import { segmentWords } from "../utils/segmentWords";

// In extractWordsFromView: replace inline Segmenter with segmentWords()
function extractWordsFromView(view: any): FoliateWord[] {
  const words: FoliateWord[] = [];
  // ... walk text nodes ...
  // Instead of: new Intl.Segmenter(...).segment(textContent)
  // Use: segmentWords(textContent) for word splitting
  // ... build { word, range, sectionIndex } array ...
  return words;
}

// Add to FoliatePageView props interface:
onWordsReextracted?: () => void;

// In relocate/section-load handler:
const handleSectionChange = useCallback(() => {
  const view = viewRef.current;
  if (!view) return;

  const freshWords = extractWordsFromView(view);
  const existingWords = foliateWordsRef.current;

  // Merge: update ranges for sections present in fresh extraction,
  // null out ranges for sections no longer loaded
  // ... merge logic ...

  foliateWordsRef.current = mergedWords;
  onWordsReextracted?.();
}, [onWordsReextracted]);
```

- [ ] **Step 8: Add Range connectivity guard**

Add a guard function used throughout FoliatePageView:

```typescript
function isRangeValid(range: Range | null): range is Range {
  return range !== null && range.startContainer.isConnected;
}
```

Use this before any Range operation in highlight, click, and cursor code.

- [ ] **Step 9: Manual test**

Open an EPUB. Enter Flow mode. Navigate across 3+ sections. Verify:
- No console errors about detached nodes
- Cursor continues smoothly after section changes
- Word extraction remains accurate

- [ ] **Step 10: Commit**

```bash
git add src/utils/segmentWords.ts tests/segmentWords.test.ts src/utils/getOverlayPosition.ts tests/getOverlayPosition.test.ts src/components/FoliatePageView.tsx
git commit -m "fix(S-10): re-extract words on section change, shared segmentWords + getOverlayPosition utilities"
```

---

### Task 7: S-09 — Word Click Maps to Wrong Position

**Files:**
- Modify: `src/components/FoliatePageView.tsx:78-100` (getWordAtPoint), `221-274` (click handler)

- [ ] **Step 1: Update click handler word counting to use segmentWords**

In the click handler (around line 221-274), find where the text-node walker counts words to determine the clicked word's offset. Replace any `split(/\s+/)` usage with `segmentWords()`:

```typescript
import { segmentWords, countWordsSegmenter } from "../utils/segmentWords";

// In the click position mapping:
// Walk text nodes in the section, counting words with segmentWords()
let wordOffset = 0;
const walker = document.createTreeWalker(sectionRoot, NodeFilter.SHOW_TEXT);
let node: Text | null;
while ((node = walker.nextNode() as Text)) {
  if (node === clickedTextNode) {
    // Count words in this node up to the click offset
    const textBeforeClick = node.textContent!.slice(0, clickOffset);
    wordOffset += countWordsSegmenter(textBeforeClick);
    break;
  }
  wordOffset += countWordsSegmenter(node.textContent || "");
}
```

- [ ] **Step 2: Map (sectionIndex, wordOffset) to foliateWordsRef**

```typescript
// Find the word in the full array
const sectionStart = foliateWordsRef.current.findIndex(
  w => w.sectionIndex === currentSectionIndex
);
if (sectionStart >= 0) {
  const globalIndex = sectionStart + wordOffset;
  onWordClick?.(globalIndex);
}
```

- [ ] **Step 3: Manual test**

Open an EPUB. Click the word "the" in the middle of a paragraph. Verify:
- The highlighted word is the exact one clicked
- Not an earlier occurrence of the same word
- Repeat across 5+ different words in different sections

- [ ] **Step 4: Commit**

```bash
git add src/components/FoliatePageView.tsx
git commit -m "fix(S-09): unify word click tokenization with Intl.Segmenter"
```

---

### Task 8: S-06 — Flow Mode Invisible on EPUBs (Overlay Cursor)

**Files:**
- Modify: `src/components/FoliatePageView.tsx` (add overlay cursor rendering + animation)
- Modify: `src/styles/global.css` (overlay cursor styles)

- [ ] **Step 1: Add overlay cursor state and ref to FoliatePageView**

Add to props: `readingMode`, `flowPlaying`, `highlightedWordIndex`, `wpm`

Add internal state:

```typescript
const cursorRef = useRef<HTMLDivElement>(null);
const flowRafRef = useRef<number>(0);
```

- [ ] **Step 2: Implement Flow cursor overlay animation**

```typescript
// Flow cursor overlay — runs when readingMode === "flow" && flowPlaying
useEffect(() => {
  if (readingMode !== "flow" || !flowPlaying) {
    if (cursorRef.current) cursorRef.current.style.display = "none";
    return;
  }

  const cursor = cursorRef.current;
  const container = containerRef.current;
  if (!cursor || !container) return;

  cursor.style.display = "block";

  const words = foliateWordsRef.current;
  let currentIdx = highlightedWordIndex;
  const msPerWord = 60000 / wpm;
  let lastAdvance = performance.now();

  const tick = (now: number) => {
    const elapsed = now - lastAdvance;
    if (elapsed >= msPerWord) {
      currentIdx++;
      lastAdvance = now;
      onWordAdvance?.(currentIdx); // Callback to ReaderContainer
    }

    const word = words[currentIdx];
    if (!word?.range) {
      flowRafRef.current = requestAnimationFrame(tick);
      return;
    }

    const pos = getOverlayPosition(word.range, container);
    if (pos) {
      cursor.style.transform = `translate3d(${pos.left}px, ${pos.top + pos.height}px, 0)`;
      cursor.style.width = `${pos.width}px`;
    }

    flowRafRef.current = requestAnimationFrame(tick);
  };

  flowRafRef.current = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(flowRafRef.current);
}, [readingMode, flowPlaying, wpm]);
```

- [ ] **Step 3: Add cursor div to JSX**

```tsx
{/* Flow cursor overlay for EPUB */}
<div
  ref={cursorRef}
  className="foliate-flow-cursor"
  style={{ display: "none" }}
/>
```

- [ ] **Step 4: Add overlay cursor styles to global.css**

```css
.foliate-flow-cursor {
  position: fixed;
  height: 2px;
  background: var(--accent);
  pointer-events: none;
  z-index: 100;
  transition: transform 0.05s linear, width 0.05s linear;
  will-change: transform;
}
```

- [ ] **Step 5: Manual test**

Open EPUB → enter Flow mode. Verify:
- Underline cursor slides across words at WPM speed
- Cursor visible across section changes
- Cursor snaps (no glide) on line wrap / page turn

- [ ] **Step 6: Commit**

```bash
git add src/components/FoliatePageView.tsx src/styles/global.css
git commit -m "fix(S-06): Range-based overlay cursor for EPUB Flow mode"
```

---

### Task 9: S-07 — Focus Mode Not Centered in Foliate Overlay

**Files:**
- Modify: `src/components/ReaderContainer.tsx` (Focus overlay rendering for EPUB)
- Modify: `src/styles/global.css` (overlay styles)

- [ ] **Step 1: Verify existing Focus mode overlay**

Check how Focus mode renders for non-EPUB content. The RSVP word should display in a full-viewport centered div. For EPUB, ensure the same overlay is used — it should sit on top of foliate, not inside it.

- [ ] **Step 2: Fix overlay positioning**

If the Focus overlay uses a container that's scoped to the foliate component, move it to the reader viewport level:

```tsx
{/* Focus mode overlay — always at reader viewport level, never inside foliate */}
{readingMode === "focus" && (
  <div className="focus-overlay">
    <div className="focus-word">{currentWord}</div>
  </div>
)}
```

```css
.focus-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  z-index: 200;
}
```

- [ ] **Step 3: Manual test**

Open EPUB → enter Focus mode. Word displays dead-center. Compare with Focus on a TXT file — same visual result.

- [ ] **Step 4: Commit**

```bash
git add src/components/ReaderContainer.tsx src/styles/global.css
git commit -m "fix(S-07): Focus mode centered in full-viewport overlay for EPUBs"
```

---

### Task 10: S-08 — Narrate Highlight Doesn't Advance in Foliate DOM

**Files:**
- Modify: `src/components/FoliatePageView.tsx` (overlay highlight for narration)
- Modify: `src/styles/global.css` (highlight overlay styles)

- [ ] **Step 1: Add narration highlight overlay state**

Add to FoliatePageView props: `narrationWordIndex` (current word being spoken)

Add highlight div ref:

```typescript
const highlightRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 2: Implement overlay highlight positioning**

```typescript
// Narration highlight overlay — position over current word
useEffect(() => {
  const highlight = highlightRef.current;
  const container = containerRef.current;
  if (!highlight || !container) return;

  if (narrationWordIndex == null || narrationWordIndex < 0) {
    highlight.style.display = "none";
    return;
  }

  const word = foliateWordsRef.current[narrationWordIndex];
  if (!word?.range) {
    highlight.style.display = "none";
    return;
  }

  const pos = getOverlayPosition(word.range, container);
  if (pos) {
    highlight.style.display = "block";
    highlight.style.transform = `translate3d(${pos.left}px, ${pos.top}px, 0)`;
    highlight.style.width = `${pos.width}px`;
    highlight.style.height = `${pos.height}px`;
  } else {
    highlight.style.display = "none";
  }
}, [narrationWordIndex]);
```

- [ ] **Step 3: Handle page turns during narration**

When narration advances past the visible page:

```typescript
// If the word's range is null (unloaded section), trigger page turn
useEffect(() => {
  if (narrationWordIndex == null) return;
  const word = foliateWordsRef.current[narrationWordIndex];
  if (word && !word.range) {
    // Word exists but range is null — section not loaded
    // Trigger foliate navigation to this word's section
    foliateApiRef.current?.goToSection?.(word.sectionIndex);
  }
}, [narrationWordIndex]);
```

- [ ] **Step 4: Add highlight div to JSX**

```tsx
{/* Narration highlight overlay for EPUB */}
<div
  ref={highlightRef}
  className="foliate-narration-highlight"
  style={{ display: "none" }}
/>
```

- [ ] **Step 5: Add highlight overlay styles**

```css
.foliate-narration-highlight {
  position: fixed;
  background: rgba(var(--accent-rgb), 0.3);
  border-radius: 2px;
  pointer-events: none;
  z-index: 100;
  will-change: transform;
}
```

- [ ] **Step 6: Remove old `<mark>` injection code**

Find and remove the `highlightWord` implementation in `FoliateViewAPI` that uses `surroundContents(mark)`. Replace it with a call to update `narrationWordIndex` state, which the overlay handles.

- [ ] **Step 7: Manual test**

Open EPUB → start narration. Verify:
- Highlight advances word-by-word
- Highlight continues across page boundaries
- Highlight continues across section boundaries
- No leftover `<mark>` elements in foliate DOM

- [ ] **Step 8: Commit**

```bash
git add src/components/FoliatePageView.tsx src/styles/global.css
git commit -m "fix(S-08): overlay-based narration highlight for EPUBs, removes DOM injection"
```

---

## Phase 2, Track B: Narration UX (Parallel with Track A)

### Task 11: S-11 — Page Browsing Yanks User Back in Narrate Mode

**Files:**
- Create: `src/components/ReturnToReadingPill.tsx`
- Modify: `src/components/ReaderContainer.tsx` (decouple view on pause, pill visibility)
- Modify: `src/styles/global.css` (pill styles)

- [ ] **Step 1: Create ReturnToReadingPill component**

Create `src/components/ReturnToReadingPill.tsx`:

```typescript
import { useEffect } from "react";

interface ReturnToReadingPillProps {
  visible: boolean;
  onReturn: () => void;
}

export default function ReturnToReadingPill({ visible, onReturn }: ReturnToReadingPillProps) {
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onReturn();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onReturn]);

  if (!visible) return null;

  return (
    <button className="return-to-reading-pill" onClick={onReturn}>
      Return to reading
    </button>
  );
}
```

- [ ] **Step 2: Add pill styles to global.css**

```css
.return-to-reading-pill {
  position: fixed;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.85;
  z-index: 500;
  transition: opacity 0.2s;
  -webkit-app-region: no-drag;
}
.return-to-reading-pill:hover {
  opacity: 1;
}
```

- [ ] **Step 3: Decouple view from highlight when narration paused**

In `ReaderContainer.tsx`, find any code that scrolls/navigates to the highlight position on page change. Guard it:

```typescript
// Only auto-scroll to highlight when narration is actively playing
const shouldFollowHighlight = readingMode === "narration" && narration.speaking;

// In page turn / scroll handlers:
if (!shouldFollowHighlight) {
  // Allow free navigation — don't snap back
}
```

- [ ] **Step 4: Track browsed-away state and wire pill**

```typescript
const [isBrowsedAway, setIsBrowsedAway] = useState(false);
const highlightPageRef = useRef<number>(0); // Page where highlight lives

// On page change:
const handlePageChange = (newPage: number) => {
  if (readingMode === "narration" && !narration.speaking) {
    const onHighlightPage = newPage === highlightPageRef.current;
    setIsBrowsedAway(!onHighlightPage);
  }
};

// Return handler:
const handleReturnToReading = useCallback(() => {
  // Navigate to highlight's page
  if (useFoliate) {
    foliateApiRef.current?.goToHighlightPage?.();
  } else {
    setCurrentPage(highlightPageRef.current);
  }
  setIsBrowsedAway(false);
}, [useFoliate]);
```

Add to JSX:
```tsx
<ReturnToReadingPill
  visible={isBrowsedAway && readingMode === "narration"}
  onReturn={handleReturnToReading}
/>
```

- [ ] **Step 5: Fix resume behavior**

When Space is pressed while browsed away:

```typescript
// In handleTogglePlay:
if (isBrowsedAway) {
  handleReturnToReading();
  // Then resume after navigation completes
  setTimeout(() => narration.resume(), 100);
  return;
}
```

- [ ] **Step 6: Manual test**

- Open book → start narration → pause
- Turn 5 pages forward → pill appears, no snap-back
- Press Enter → returns to highlight page, pill disappears
- Pause again, browse away, press Space → returns and resumes

- [ ] **Step 7: Commit**

```bash
git add src/components/ReturnToReadingPill.tsx src/components/ReaderContainer.tsx src/styles/global.css
git commit -m "fix(S-11): decouple narrate view from highlight on pause, add Return pill"
```

---

### Task 12: S-12 — Narrate Speed Changes Delayed

**Files:**
- Modify: `src/hooks/useNarration.ts:407-419` (updateWpm / rate change)
- Modify: `src/components/ReaderBottomBar.tsx:73-84` (CONFIRMED indicator)
- Modify: `src/styles/global.css` (CONFIRMED indicator styles)

- [ ] **Step 1: Add generation ID guard to useNarration**

**NOTE:** `useNarration.ts` already has partial rate-change handling at lines 407-419 (`updateWpm`): it nulls `nextChunkBufferRef`, checks `kokoroInFlightRef`, and calls `speakNextChunk()`. Add the `generationIdRef` pattern alongside the existing `kokoroInFlightRef` guard — the generation ID handles stale IPC results returning after a rate change, while `kokoroInFlightRef` prevents overlapping requests. Both are needed.

In `useNarration.ts`:

```typescript
const generationIdRef = useRef(0);

// In rate change handler (adjustRate or updateWpm):
const adjustRate = useCallback((newRate: number) => {
  speedRef.current = Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, newRate));

  // Invalidate pre-buffer
  nextChunkBufferRef.current = null;

  // Increment generation ID to discard in-flight Kokoro results
  generationIdRef.current++;

  // If currently speaking, regenerate from current position
  if (speakingRef.current && engineRef.current === "kokoro") {
    const currentGenId = generationIdRef.current;
    // Cancel current audio and regenerate
    // ... existing cancel logic ...
    // Guard: only use result if generation ID still matches
  }
}, []);
```

- [ ] **Step 2: Guard Kokoro IPC results by generation ID**

In `speakNextChunkKokoro()`, capture the generation ID before the IPC call:

```typescript
const genId = generationIdRef.current;
const audioBuffer = await window.electronAPI.kokoroGenerate(text, speedRef.current);

// Discard if a rate change happened during generation
if (genId !== generationIdRef.current) {
  // Stale result — discard and regenerate at new rate
  speakNextChunk();
  return;
}
```

- [ ] **Step 3: Verify CONFIRMED indicator in ReaderBottomBar**

**NOTE:** `ReaderBottomBar.tsx` already has a `rateStatus` state machine (lines 69-84) with "confirming" and "set" states and a `handleSetTtsRate` callback that shows a CONFIRMED/SET visual indicator. Verify this existing indicator:
1. Triggers correctly on rate changes during active narration
2. Is visible in the bottom bar UI (not hidden by CSS)
3. Shows during both Kokoro and Web Speech rate changes

If the indicator already works, skip to Step 5. If it's not rendering or not triggering during active narration, debug and fix the existing implementation rather than adding new state.

- [ ] **Step 4: Add CONFIRMED styles (if needed)**

Only add these styles if Step 3 finds the existing indicator lacks CSS:

```css
.rate-confirmed {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  animation: fadeConfirmed 1s ease-out forwards;
}
@keyframes fadeConfirmed {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
```

- [ ] **Step 5: Manual test**

- Start narration at 1.0x
- Change rate to 1.5x mid-sentence → audio speed changes within 1-2 words
- "CONFIRMED" flashes next to rate
- Change rate 3x rapidly → no crashes, final rate applied

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useNarration.ts src/components/ReaderBottomBar.tsx src/styles/global.css
git commit -m "fix(S-12): immediate TTS rate change with generation ID guard + CONFIRMED indicator"
```

---

### Task 13: S-14 — Time-to-Complete Ignores Active Mode

**Files:**
- Modify: `src/components/ReaderBottomBar.tsx` (time calculation)
- Reference: `src/constants.ts:62-74` (TTS_RATE_BASELINE_WPM = 150)

- [ ] **Step 1: Find the time calculation**

In `ReaderBottomBar.tsx`, find where `timeRemaining` is calculated. It likely uses `wordsRemaining / wpm`.

- [ ] **Step 2: Make it mode-aware**

```typescript
import { TTS_RATE_BASELINE_WPM } from "../constants";

// In the time calculation:
const effectiveWpm = (readingMode === "narration" || lastReadingMode === "narration")
  ? Math.round(ttsRate * TTS_RATE_BASELINE_WPM)
  : wpm;

const chapterTimeRemaining = formatTime(chapterWordsRemaining, effectiveWpm);
const docTimeRemaining = formatTime(docWordsRemaining, effectiveWpm);
```

Ensure both chapter and document time displays use `effectiveWpm`.

- [ ] **Step 3: Manual test**

- Enter narration at 1.0x → time shows ~150 WPM estimate
- Change to 2.0x → time halves
- Switch to Focus mode → time recalculates based on WPM setting (e.g., 300)

- [ ] **Step 4: Commit**

```bash
git add src/components/ReaderBottomBar.tsx
git commit -m "fix(S-14): mode-aware time-to-complete using TTS rate for narration"
```

---

## Phase 3 + 4: Verification

### Task 14: Full Test Suite + Build

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All 512+ tests pass. Zero failures.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Clean build, no errors, no warnings.

- [ ] **Step 3: Fix any failures**

If tests or build fail, fix the issues before proceeding to manual verification.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve test/build issues from stabilization sprint"
```

---

### Task 15: Manual Verification Matrix (V-01 through V-15)

Run the app with `npm start` and execute each verification test:

- [ ] **V-01:** Click Kokoro AI button → toggles, persists
- [ ] **V-02:** (Deferred — requires workflow trigger) Inspect latest.yml logic in code
- [ ] **V-03:** Open new EPUB → lands on cover
- [ ] **V-04:** Open EPUB, don't engage, close → 0%, no prompt
- [ ] **V-04b:** Read to page 50, go to page 2, close → prompt appears
- [ ] **V-05:** Click Narrate → highlights, no audio. Space → starts.
- [ ] **V-06:** EPUB Flow mode → cursor slides across words
- [ ] **V-07:** EPUB Focus mode → word centered
- [ ] **V-08:** EPUB Narrate → highlight advances, survives page turns
- [ ] **V-09:** Click word in EPUB → correct word highlighted
- [ ] **V-10:** Navigate 3+ sections in any mode → no Range errors
- [ ] **V-11:** Pause narration, browse 5 pages → pill, no snap-back
- [ ] **V-12:** Change TTS rate mid-narration → immediate, CONFIRMED
- [ ] **V-13:** TTS rate synced between flap and bottom bar
- [ ] **V-14:** Time display mode-aware (narrate vs focus)
- [ ] **V-15:** Kokoro narration across page boundary → continuous

---

### Task 16: Integration Tests (I-01 through I-06)

- [ ] **I-01:** Open EPUB → Flow → cross 3 sections → pause → click word → correct position
- [ ] **I-02:** Open EPUB → Narrate → change rate 3x → cross page → pause → browse 5 pages → pill → resume
- [ ] **I-03:** Open EPUB → read 50 pages → cover → close → prompt → "Save at 0" → reopen → 0%
- [ ] **I-04:** Open EPUB → Focus (centered) → Flow (cursor) → Narrate (highlight) → Page
- [ ] **I-05:** Open TXT → Focus/Flow/Narrate/rate change/browse/pill/word click/close at start
- [ ] **I-06:** Settings → Kokoro AI → change TTS rate in flap → Narrate → bottom bar synced

---

### Task 17: Final Test + Commit

- [ ] **Step 1: Final test run**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Final commit if needed**

```bash
git add -A
git commit -m "chore: final verification pass for Sprint 25S stabilization"
```
