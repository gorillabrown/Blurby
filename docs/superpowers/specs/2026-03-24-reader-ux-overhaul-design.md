# Reader UX Overhaul — Design Spec

**Date:** 2026-03-24
**Status:** Approved
**Scope:** Keyboard consistency, command palette routing, TTS architecture, flow mode animation, page view readability

---

## 1. Tab Key — Universal Menu Flap Toggle

### Current Behavior
- **Library view:** Tab cycles focus zones (search → grid → sidebar)
- **Reader view:** Tab cycles reading modes (page → focus → flow)

### Target Behavior
- **All views:** Tab toggles the menu flap open/closed
- Shift+Tab: no special behavior (default prevented with Tab)
- **Accessibility:** F6 replaces Tab for focus-zone cycling in library view (search → grid → sidebar). This is a standard pattern for panel-based navigation (used in VS Code, Outlook, etc.)

### Implementation
- `useLibraryKeyboard` (useKeyboardShortcuts.ts, ~line 412-422): Replace Tab handler with `toggleFlap()` call. Move the existing focus-zone cycling logic to F6.
- `useReaderKeys` (useKeyboardShortcuts.ts, ~line 149): Replace `switchMode()` call with `toggleFlap()` call
- Remove `handleSwitchMode` and `switchMode` prop chain from ReaderContainer (dead code after this change)
- The `toggleFlap` callback is already wired through both view hierarchies

---

## 2. Command Palette — Direct Settings Sub-Page Navigation

### Current Behavior
- Only 2 settings items exist: "Settings: Cloud Sync" and "Settings: Reading Speed"
- Both call `onOpenSettings` which opens the menu flap to the generic settings page

### Target Behavior
- All 8 settings sub-pages searchable: Theme, Layout, Speed Reading, Hotkeys, Connectors, Help, Text Size, Cloud Sync
- Selecting one opens the menu flap directly to that sub-page

### Implementation
- **CommandPalette.tsx:** Add all 8 settings sub-pages to the action registry with consistent naming ("Settings: Theme", "Settings: Layout", etc.). Each calls `onOpenSettings(pageId)`.
- **`onOpenSettings` callback signature:** Change from `() => void` to `(page?: string) => void`. The optional parameter specifies which sub-page to navigate to.
- **LibraryContainer.tsx:** Update `handleOpenSettings` to accept an optional page string. Set `menuFlapOpen(true)` and forward the page identifier to MenuFlap.
- **MenuFlap.tsx:** Accept an optional `targetView` prop. Guard the existing `useEffect` that resets view to "queue" on open — when `targetView` is provided, set view to that value instead of "queue". When `targetView` is absent/null, keep current behavior (reset to "queue").

### Settings Page Identifiers
| Palette Label | Page ID |
|--------------|---------|
| Settings: Theme | theme |
| Settings: Layout | layout |
| Settings: Speed Reading | speed |
| Settings: Hotkeys | hotkeys |
| Settings: Connectors | connectors |
| Settings: Help | help |
| Settings: Text Size | text-size |
| Settings: Cloud Sync | cloud-sync |

---

## 3. Remove Tab from Mode Switching — Space Starts Flow

### Current Behavior
- Tab cycles page → focus → flow reading modes
- Space toggles play/pause in Focus and Flow modes
- Shift+Space enters Flow mode from Page view

### Target Behavior
- Tab no longer switches modes (see Section 1 — Tab is now menu flap toggle)
- Space in Page view starts Flow mode (the default playback mode)
- Shift+Space in Page view starts Focus mode (preserves keyboard access to RSVP)
- Mode buttons in ReaderBottomBar remain for explicit Focus/Flow selection
- Space in Focus/Flow continues to toggle play/pause as today

### Implementation
- Remove `switchMode` callback from `useReaderKeys` hook (already covered by Section 1)
- Update Space key handler in `useReaderKeys` / `handleTogglePlay` in ReaderContainer:
  - When `readingMode === "page"` and Space: call `handleEnterFlow()`
  - When `readingMode === "page"` and Shift+Space: call `handleEnterFocus()`
  - When `readingMode === "focus"` or `"flow"` and Space: toggle play/pause (existing behavior)
- `handleSwitchMode` in ReaderContainer becomes dead code — remove entirely
- **ReaderBottomBar.tsx:** Update `HINT_TEXT` for page mode from `"space focus  ⇧space flow"` to `"space flow  ⇧space focus"` to reflect the reversal

---

## 4. TTS Leads the Cursor

### Current Behavior
- Cursor advances at WPM speed via RAF loop
- TTS speaks 4-word chunks and tries to keep up
- TTS falls behind at any meaningful speed

### Target Behavior
- When TTS is active, cursor advances **only** on TTS word boundary events
- WPM controls TTS speech rate via `wpmToRate()` — user speed preference is respected
- Cursor never outruns the voice
- When TTS is not active, RAF loop works exactly as today (no change)

### Implementation
- **ReaderContainer:** When entering Flow/Focus with `ttsActive`, skip starting the RAF advancement loop. Rely entirely on `narration.startCursorDriven()` callbacks to update `highlightedWordIndex`.
- **PageReaderView:** Add guard to RAF loop — if TTS is active, don't advance. Safety net against state drift.
- **useNarration.ts:** Add a `hold()`/`resume()` mechanism for page-boundary pauses. When the `onWordAdvance` callback signals a page boundary (returns `false` or a "hold" signal), TTS stops auto-chaining to the next chunk via `speakNextChunk()`. After the page turn completes, the caller invokes `resume()` which calls `speakNextChunk()` to continue. This prevents TTS from speaking across page boundaries while the visual cursor pauses for the page turn (Section 5).

### Edge Cases
- **Document end:** When TTS reaches the last word, stop TTS and flow. Do not attempt to chain further chunks. Call `narration.stop()` and set `flowPlaying = false`.

---

## 5. Flow/TTS Respects Pagination

### Current Behavior
- Flow mode treats text as continuous, advancing through all words regardless of page boundaries
- Page turns are only manual (click/arrow)

### Target Behavior
- Flow highlight advances within the current page only
- When the highlight reaches the last word on the current page, pause briefly (~600ms), then trigger a page turn
- After page turn completes (using existing `PAGE_TRANSITION_MS` animation), continue flow from the first word of the new page
- Same behavior for TTS-driven mode — TTS hold/resume mechanism pauses speech at page boundary, resumes after page turn
- At end of document (last word of last page): stop flow, stop TTS if active

### Edge Cases
- **Manual page turn during flow:** If user presses arrow keys or clicks to manually turn the page while flow is auto-advancing, stop flow playback. User can restart with Space. This prevents desync between flow position and displayed page.
- **Document end:** Flow stops automatically. TTS stops. No error, no wrap-around.

### Implementation
- **PageReaderView:** The page structure already exists via `paginateWords()` returning `Array<{ start, end }>`. The flow RAF loop and TTS callbacks need to check: "is the next word index beyond the current page's `end`?" If yes:
  1. Pause for `FLOW_PAGE_TURN_PAUSE_MS` (600ms)
  2. If TTS active, call `narration.hold()` to stop chunk chaining
  3. Call `nextPage()`
  4. Wait for `PAGE_TRANSITION_MS`
  5. If TTS active, call `narration.resume()` to continue speaking
  6. Resume flow from first word of new page
- **ReaderContainer:** TTS `onWordAdvance` callback needs the same page-boundary check. Return a hold signal when boundary is reached.

### New Constant
- `FLOW_PAGE_TURN_PAUSE_MS = 600` (tunable, in constants.ts)

---

## 6. Flow Mode — Sliding Window (Min 3, Max 5, Default 3)

### Current Behavior
- `DEFAULT_FLOW_WORD_SPAN = 1`, configurable 1-5
- Highlight jumps forward by the full span (e.g., 3 words at a time)
- Interval = `baseInterval * wordSpan` (longer intervals for wider spans)

### Target Behavior
- Default: 3, Min: 3, Max: 5
- Sliding window: advance 1 word per tick, keeping `wordSpan` words highlighted
- Example (span=3): `[5,6,7]` → `[6,7,8]` → `[7,8,9]`
- Interval = `60000 / wpm` (one word's worth of time, not multiplied by span)

### Design Note
With 1-word-per-tick advancement and a sliding window, the first `wordSpan - 1` words in the window get slightly less total viewing time than in the old jump-by-span approach. This is the intended behavior — the sliding window provides continuous motion rather than discrete jumps, and 3-word minimum span ensures adequate context.

### Implementation
- **constants.ts:** `DEFAULT_FLOW_WORD_SPAN = 3`
- **SpeedReadingSettings.tsx:** Change slider `min={3} max={5}`
- **PageReaderView RAF loop:**
  - Change advance step from `wordSpan` to `1`
  - Change interval from `baseInterval * wordSpan` to `baseInterval`
  - Highlight range: `[highlightedWordIndex, highlightedWordIndex + wordSpan)`
- **Migration:** Runtime clamp — wherever `flowWordSpan` is read from settings, apply `Math.max(3, value)`. No schema migration needed. This ensures existing users with `flowWordSpan: 1` are bumped to 3 without a version bump.

---

## 7. Flow Cursor — Bold Underline

### Current Behavior
- `.flow-highlight-cursor`: translucent overlay box (`opacity: 0.25`, accent background) covering the highlighted words
- Full word-height rectangle

### Target Behavior
- 3-4px solid accent-colored bar positioned at the bottom of the highlighted words
- Full opacity (thin accent line, not a covering wash)
- Slides smoothly under text using existing `translate3d()` transitions
- Words themselves are not visually altered (no background color change)
- Brief pause at end of page before page turn (Section 5)

### Implementation
- **global.css:** Update `.flow-highlight-cursor`:
  - `height: var(--flow-cursor-height, 3px)` (CSS custom property, consistent with theming approach)
  - `opacity: 1` (not 0.25)
  - `border-radius: 1.5px` (half of height for rounded ends)
  - Keep existing `transition`, `position: absolute`, `pointer-events: none`, `z-index`
  - Keep line-wrap and high-WPM variants
- **PageReaderView:** Adjust cursor positioning:
  - Current: `y = wordRect.top`, `height = wordRect.height`
  - New: `y = wordRect.bottom - 3` (bottom of word, minus bar height), `height = 3` (fixed)
  - `width` still spans first-to-last highlighted word's horizontal extent

---

## 8. Page View Readability — Text Size, Margins, Two-Column

### Default Text Size: 110%
- The page view font size is controlled by `flowTextSize` in settings (confusingly named — it controls both Page and Flow text size). Current default: `DEFAULT_FOCUS_TEXT_SIZE = 100` (in constants.ts).
- Change `DEFAULT_FOCUS_TEXT_SIZE` from `100` to `110`.
- Only affects new installs — existing user settings preserved (settings override default).

### Double Left/Right Margins
- The page reader padding is on `.page-reader-view` (global.css, ~line 3376: `padding: 40px 60px 20px`), NOT on `.page-reader-content`.
- Double the left/right values: `padding: 40px 120px 20px`

### Two-Column Layout Above ~1280px
- When **viewport width** exceeds **1280px**, switch to two-column layout
- Use CSS media query: `@media (min-width: 1280px)` with `column-count: 2; column-gap: 48px;` on `.page-reader-content`
- Below threshold: single column (current behavior)

### Two-Column Cursor Handling
- `getBoundingClientRect()` on word `<span>` elements returns correct viewport-relative positions even in multi-column layout. The `translate3d()` cursor positioning uses `wRect.left - cRect.left`, which works correctly across columns.
- **Column-break edge case:** If the sliding window (3-5 words) straddles a column break (last word of column 1, first words of column 2), the cursor `width` calculation would span across the column gap. **Mitigation:** Clamp the cursor to words in the same column. Detect column break by checking if consecutive highlighted words have a large horizontal discontinuity (word N's right edge > word N+1's left edge by more than the gap). When detected, render the cursor only over the words in the leading column until they slide out of the window.

### Implementation
- **constants.ts:** `DEFAULT_FOCUS_TEXT_SIZE = 110`
- **global.css:**
  - Change `.page-reader-view` padding from `40px 60px 20px` to `40px 120px 20px`
  - Add media query for two-column layout on `.page-reader-content`
  - Add `break-inside: avoid` on paragraph elements within `.page-reader-content` for clean column breaks
- **PageReaderView:** Add column-break detection in `positionFlowCursor` — clamp cursor to single column when window straddles a break

---

## Dependency Order

```
[1, 3] Tab + Space changes (keyboard layer, no deps)
    ↓
[2] Command palette settings routing (depends on menu flap changes from 1)
    ↓
[8] Page view readability (CSS + constants, independent but should land before flow changes)
    ↓
[6] Flow sliding window (constants + RAF loop changes)
    ↓
[7] Flow underline cursor (CSS + positioning, depends on 6's sliding window)
    ↓
[5] Pagination-aware flow (depends on 6 and 7 being stable)
    ↓
[4] TTS leads cursor (depends on 5's pagination awareness)
```

## Files Affected

| File | Sections |
|------|----------|
| `src/hooks/useKeyboardShortcuts.ts` | 1, 3 |
| `src/components/ReaderContainer.tsx` | 1, 3, 4, 5 |
| `src/components/CommandPalette.tsx` | 2 |
| `src/components/MenuFlap.tsx` | 2 |
| `src/components/LibraryContainer.tsx` | 2 |
| `src/components/PageReaderView.tsx` | 4, 5, 6, 7, 8 |
| `src/components/ReaderBottomBar.tsx` | 3 |
| `src/components/settings/SpeedReadingSettings.tsx` | 6 |
| `src/hooks/useNarration.ts` | 4, 5 |
| `src/constants.ts` | 5, 6, 8 |
| `src/styles/global.css` | 7, 8 |

## Success Criteria

1. Tab toggles menu flap in both library and reader views
2. F6 cycles focus zones in library view (search → grid → sidebar)
3. All 8 settings sub-pages searchable and directly navigable via Ctrl+K
4. Space in Page view starts Flow mode; Shift+Space starts Focus mode
5. Tab does NOT cycle reading modes
6. With TTS active, cursor never advances ahead of spoken word
7. TTS pauses at page boundaries and resumes after page turn
8. Flow/TTS pause and page-turn at end of each page with ~600ms pause
9. Manual page turn during flow stops flow playback
10. At document end, flow and TTS stop cleanly
11. Flow highlight is a 3-4px accent underline sliding smoothly under text
12. Flow word span defaults to 3, min 3, max 5, sliding window (1-word advance)
13. Existing users with flowWordSpan < 3 are clamped to 3 at runtime
14. Page view text 10% larger by default (DEFAULT_FOCUS_TEXT_SIZE = 110)
15. Page view side margins doubled (60px → 120px)
16. Two-column layout above 1280px viewport width
17. Flow cursor clamps to single column when window straddles a column break
18. All existing tests pass, build clean
