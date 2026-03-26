# Sprint 25S: Stabilization Sprint — Design Spec

**Date:** 2026-03-26
**Branch:** `sprint/25s-stabilization`
**Goal:** Fix 13 active bugs across two phases to achieve a fully functional, stable app. Two previously-fixed bugs (S-13, S-15) verified but not reimplemented.

---

## Scope

### Active Bugs (13)

| ID | Bug | Phase | Track |
|----|-----|-------|-------|
| S-01 | Kokoro AI button unclickable in settings | 1 | — |
| S-02 | Auto-updater latest.yml missing x64 | 1 | — |
| S-03 | EPUB starts on page ~3 instead of cover | 1 | — |
| S-04 | Opening a book falsely marks it "started" | 1 | — |
| S-05 | Narrate auto-starts when button clicked | 1 | — |
| S-06 | Flow mode invisible on EPUBs | 2 | A (Foliate DOM) |
| S-07 | Focus mode not centered in foliate overlay | 2 | A (Foliate DOM) |
| S-08 | Narrate highlight doesn't advance in foliate DOM | 2 | A (Foliate DOM) |
| S-09 | Word click maps to wrong position in EPUB | 2 | A (Foliate DOM) |
| S-10 | Stale Range objects after foliate page navigation | 2 | A (Foliate DOM) |
| S-11 | NM page browsing yanks user back | 2 | B (Narration UX) |
| S-12 | NM speed changes delayed | 2 | B (Narration UX) |
| S-14 | Time-to-complete ignores active mode | 2 | B (Narration UX) |

### Verified (No Implementation — Confirm in Phase 4)

| ID | Bug | Status |
|----|-----|--------|
| S-13 | TTS rate slider disconnected between bottom bar and flap | Fixed in prior session |
| S-15 | Kokoro page-turn pause too long | Fixed in prior session |

---

## Sprint Structure

```
sprint/25s-stabilization
│
├── Phase 1: Critical Blockers (serial, ~4h)
│   S-01 → S-02 → S-03 → S-04 → S-05
│
├── Phase 2: Mode Integrity (parallel tracks, ~8h)
│   ├── Track A: Foliate DOM (serial within track)
│   │   S-10 → S-09 → S-06 → S-07 → S-08
│   │
│   └── Track B: Narration UX (parallel with Track A)
│       S-11 → S-12 → S-14
│
├── Phase 3: Integration Testing (~2h)
│   I-01 through I-06
│
└── Phase 4: Verification Matrix
    npm test → npm run build → V-01–V-15 → I-01–I-06 → npm test
```

**Merge policy:** `--no-ff` to main after Phase 4 passes. Branch deleted after merge.

---

## Phase 1: Critical Blockers

### S-01: Kokoro AI Button Unclickable

**Files:** `SpeedReadingSettings.tsx`, `global.css`

**Root cause:** `-webkit-app-region: drag` inherited from the settings flap container swallows pointer events on the Kokoro AI button.

**Fix:** Add `-webkit-app-region: no-drag` to the `.voice-engine-toggle` button group (or whatever class wraps the System/Kokoro pair) in `global.css`. Same pattern applied elsewhere in the flap.

**Verification (V-01):** Click toggles between System and Kokoro AI. Setting persists on reopen. TTS engine switches when Kokoro is selected.

---

### S-02: Auto-Updater latest.yml Missing x64

**Files:** `.github/workflows/release.yml`

**Root cause:** ARM64 build overwrites `latest.yml` instead of merging. The existing sed-based merge logic has a bug — likely inserting the ARM64 entry at the wrong position or not preserving the x64 base file.

**Fix:** Correct the sed insertion logic to reliably produce a `latest.yml` with both `files:` entries. Add a verification step that greps the final `latest.yml` for both architecture strings before uploading.

**Verification (V-02):** Trigger test workflow run. Inspect uploaded `latest.yml` — must contain both x64 and arm64 installer entries in the `files:` array.

---

### S-03: EPUB Starts on Page ~3 Instead of Cover

**Files:** `FoliatePageView.tsx`, `ReaderContainer.tsx`

**Root cause:** Foliate's initial CFI navigation skips cover/TOC sections and lands on first text content section.

**Fix:** On first open (no saved CFI), don't pass an `initialCfi` to foliate — let it open to its natural first page (the cover). Only restore CFI on subsequent opens where a saved position exists. In `FoliatePageView.tsx`, guard the initial navigation: if `savedCfi` is null/undefined, don't call `view.goTo()`.

**Implementation note:** Verify that foliate's `view.init({ lastLocation: null })` actually opens to the cover. If it skips the cover even with `null`, add an explicit `view.goToFraction(0)` call after initialization to force page 0. Test with EPUBs that have cover images (e.g., the Project Gutenberg titles in the library).

**Verification (V-03):** Open new EPUB → lands on cover. Close and reopen → lands on saved position. Open previously-read EPUB → restores to last position, not cover.

---

### S-04: Opening a Book Falsely Marks It "Started"

**Files:** `ReaderContainer.tsx`, library data model

**Root cause:** EPUB word extraction starts at the first text word, which is >0%. Progress system treats any non-zero word index as "started."

**Fix (two parts):**

**Part A — Page-based progress floor:**
- Progress percentage uses page position as primary gate: `progress = currentPage / totalPages`
- Page 0 = 0% regardless of word index
- For foliate EPUBs: use the `fraction` from relocate events
- For non-EPUB formats: existing `currentPage / totalPages` computation (already correct)
- Word index within a page is used only for resumption (which word to highlight on reopen), not for the progress bar
- Key change: ensure page 0 / fraction 0 = 0% even when `highlightedWordIndex > 0` due to word extraction skipping images

**Part B — High-water mark with backtrack prompt:**
- Track `furthestPosition` alongside current position in the doc's library entry
  - **Non-EPUB:** `furthestPosition` is a page number (integer). Threshold: closing > 2 pages behind.
  - **Foliate EPUB:** `furthestPosition` is a fraction (0.0–1.0) from relocate events. No stable "page number" exists — foliate uses CSS columns. Threshold: closing fraction < furthest fraction by more than `2 / totalEstimatedPages` (approximate 2-page equivalent using `fraction * estimatedTotalPages`).
- On reader close, evaluate:
  - If current position is within threshold of `furthestPosition`: silent save at current position
  - If current position is beyond threshold behind `furthestPosition` AND user has engaged with backtracked content (mode start, word click, or page turn): show prompt
- Prompt UI: floating dialog (not modal), two buttons:
  - **Left (secondary):** "Save at page [current]" (for EPUBs, show approximate page via `Math.round(fraction * estimatedPages)`)
  - **Right (primary/default):** "Keep at page [furthest]"
- Default action (Enter / dismiss) = keep at furthest
- Engagement tracking: set a `hasEngagedRef` boolean to true on mode start, word click, or page turn events

**Verification (V-04):** Open new EPUB → 0%. Advance 50 pages → progress updates. Return to page 0, close → prompt appears. Select "Save at page 0" → progress resets to 0%.

**Verification (V-04b):** Read to page 50, go back to page 2, close → prompt appears with both options. Select "Keep at page 50" → progress preserved.

---

### S-05: Narrate Auto-Starts on Click

**Files:** `ReaderContainer.tsx`

**Root cause:** The bottom bar Narrate button is likely wired to `startNarration()` directly instead of `handleSelectMode("narration")`. The `handleSelectMode` path (ReaderContainer ~lines 391-404) already correctly sets `lastReadingMode` without starting playback. The `handleTogglePlay` path (Space, ~lines 416-426) then calls `startNarration()` which begins TTS. The bug is in the button's onClick handler, not the mode architecture.

**Fix:** Ensure the bottom bar Narrate button calls `handleSelectMode("narration")` (select only), NOT `startNarration()`. Also verify the `N` keyboard shortcut follows the same path. The Space → `handleTogglePlay` → `startNarration()` flow is correct and should not change.

This makes narration consistent with Focus and Flow — click/key selects, Space starts.

**Verification (V-05):** Click Narrate → button highlights, no audio. Press Space → TTS begins. Press Space again → pauses. Click Narrate again while active → stops and deselects.

---

## Phase 2: Mode Integrity

### Track A: Foliate DOM (Serial — S-10 First)

#### S-10: Stale Range Objects After Foliate Page Navigation

**Files:** `FoliatePageView.tsx`

**Root cause:** Words extracted from section N hold DOM Range references to section N's nodes. When foliate navigates to section M, those nodes are unloaded. Any code touching stale Ranges throws or returns garbage.

**Fix:**
1. Hook into foliate's section-change / relocate event
2. On every section load: re-extract words via `extractWordsFromView()`
3. Replace `foliateWordsRef.current` with fresh results
4. Invalidate any cached Range-dependent state (line maps, highlight positions)
5. Emit callback (`onWordsReextracted`) so ReaderContainer knows the word array is fresh
6. Guard: any code touching a Range must check `range.startContainer.isConnected` first. If disconnected, skip and wait for re-extraction.

**Index continuity:** `foliateWordsRef` must always represent the full document's word array, not just the current section. On section change, re-extract words for the newly-loaded section(s) and merge into the full array at the correct offset (using `sectionIndex` to determine position). `highlightedWordIndex` is a global document index and must remain valid across re-extractions. If a section is unloaded and its Ranges become stale, keep the word strings in the array (for text display in Focus mode) but null out the Range references; re-populate Ranges when the section is loaded again.

**Verification (V-10):** Start Flow mode on EPUB. Navigate across 3+ sections. Cursor continues smoothly. No console errors about detached nodes.

---

#### S-09: Word Click Maps to Wrong Position in EPUB

**Files:** `FoliatePageView.tsx`, `ReaderContainer.tsx`

**Root cause:** Text node walker and word extractor use different tokenization, causing word offset counts to diverge.

**Fix:** Unify both paths to use `Intl.Segmenter` with `granularity: "word"` (already used by `extractWordsFromView()`). The click handler's text-node walker currently uses `split(/\s+/)` which counts differently for punctuation-attached words, contractions, and Unicode. Extract a shared `countWordsInTextNode(textNode)` utility that uses `Intl.Segmenter`, and use it in both paths.

1. Extract shared utility: `segmentWords(text: string): string[]` using `Intl.Segmenter({ granularity: "word" })`, filtering to `segment.isWordLike`
2. Click handler's text-node walker: use `segmentWords()` on each `textNode.textContent`, count words until reaching clicked node + offset
3. `extractWordsFromView()`: use same `segmentWords()` function (replacing its current inline Segmenter usage)
4. Both produce `(sectionIndex, wordOffsetInSection)` → look up in `foliateWordsRef` by matching section index + adding offset

**Verification (V-09):** Open EPUB. Click the word "the" in the middle of a paragraph. Highlighted word is the exact one clicked, not an earlier occurrence. Repeat across 5+ different words in different sections.

---

#### S-06: Flow Mode Invisible on EPUBs

**Files:** `FoliatePageView.tsx`, `FlowCursorController.ts`

**Root cause:** `FlowCursorController` looks for `[data-word-index]` elements in the DOM. Foliate renders in a shadow DOM / iframe — those elements don't exist.

**Fix (Option B — Range-based overlay, recommended):**
1. Create absolutely-positioned cursor `<div>` layered above the foliate container
2. On each Flow tick, get current word's Range from `foliateWordsRef`
3. Call `range.getBoundingClientRect()` for viewport position
4. **Coordinate transform:** Foliate uses a `<foliate-view>` custom element with shadow DOM. `getBoundingClientRect()` on Ranges inside shadow DOM returns viewport-relative coordinates — no iframe offset needed. If foliate wraps content in an iframe (some EPUB renderers do), detect via `range.startContainer.ownerDocument !== document` and add `iframe.getBoundingClientRect()` offset. Implement as a `getOverlayPosition(range, containerEl)` utility that handles both cases.
5. Animate cursor div to position using `translate3d()` — same GPU-accelerated approach as existing FlowCursorController
6. On line wrap / page turn: snap (no glide) to new line's first word position

**Fallback if Range disconnected:** Pause cursor until S-10's re-extraction fires, then resume from new Range.

**Non-EPUB path:** Existing `FlowCursorController` kept as-is. The foliate overlay cursor is a parallel code path in `FoliatePageView.tsx`, activated when `useFoliate && readingMode === "flow"`.

**Option A evaluation (rejected):** Injecting `data-word-index` attributes into foliate's rendered DOM would fight foliate's lifecycle — it re-renders sections on navigation, wiping injected attributes. Option B avoids this entirely by overlaying.

**Verification (V-06):** Open EPUB in Flow mode. Underline cursor slides across words at WPM speed. Cursor visible across section changes. Matches non-EPUB Flow behavior visually.

---

#### S-07: Focus Mode Not Centered in Foliate Overlay

**Files:** `ReaderContainer.tsx`, `global.css`

**Root cause:** Focus mode RSVP word display is positioned relative to foliate container without accounting for iframe layout, causing offset.

**Fix:** Focus mode on EPUBs uses the same overlay approach as non-EPUBs — a full-viewport centered `<div>` on top of foliate, not inside it. Foliate content hidden/dimmed beneath. Word text from extracted word array (plain string), not DOM.

Ensure overlay div uses identical centering CSS: `display: flex; align-items: center; justify-content: center;` with reader viewport as containing block.

**Verification (V-07):** Open EPUB, enter Focus mode. Word displays dead-center vertically and horizontally. Same visual result as Focus on a TXT file.

---

#### S-08: Narrate Highlight Doesn't Advance in Foliate DOM

**Files:** `ReaderContainer.tsx`, `FoliatePageView.tsx`

**Root cause:** Narration cursor advances `highlightedWordIndex`, but highlight rendering in foliate doesn't update — `<mark>` wrapper not applied to new word, or old one not removed.

**Fix:** Overlay-based highlight system (consistent with S-06 — no DOM mutation in foliate):
1. Create an absolutely-positioned highlight `<div>` layered above the foliate container (same overlay layer as the Flow cursor from S-06)
2. On each `onWordAdvance` callback from useNarration, get current word's Range from `foliateWordsRef`
3. Use `getOverlayPosition(range, containerEl)` (shared utility from S-06) to get viewport-relative position
4. Position the highlight div over the word using `translate3d()` with accent background + opacity
5. If new word is on different page/section, trigger foliate page turn *before* positioning highlight
6. If Range is stale (S-10 scenario), hide highlight and queue; apply after re-extraction fires

**Why overlay, not `<mark>` injection:** The existing `highlightWord` method uses `surroundContents(mark)` which mutates foliate's DOM. This breaks when foliate re-renders sections (same reason Option A was rejected for S-06). The overlay approach is consistent across S-06, S-07, and S-08 — all EPUB visual feedback uses positioned overlays, never DOM injection.

**Page turn sequencing:** `foliateApi.next()` → wait for relocate event → re-extract words (S-10) → reposition highlight. Prevents "highlight disappears after page turn."

**Verification (V-08):** Start narration on EPUB. Highlight advances word-by-word through formatted text. Cross page boundary — highlight continues on new page without gaps. Cross section boundary — same.

---

### Track B: Narration UX (Parallel with Track A)

#### S-11: Narrate Mode Page Browsing Yanks User Back

**Files:** `ReaderContainer.tsx`

**Root cause:** When narration is paused and user turns a page, highlight position reasserts and snaps the view back.

**Fix (three parts):**

**Part A — Decouple view from highlight when paused:** When narration is paused, disable "scroll to highlight" behavior. Page turns via arrow keys / nav buttons work normally.

**Part B — "Return to reading" pill:**
- Floating pill at bottom-center, just above bottom bar
- Accent-colored, semi-transparent background
- Text: "Return to reading"
- Appears when visible page differs from highlight's page
- Click or press **Enter** → navigate to highlight page, dismiss pill
- Auto-dismisses when user manually navigates back to highlight page
- CSS: `position: fixed; bottom: [above-bottom-bar]; left: 50%; transform: translateX(-50%); z-index` above reader content

**Part C — Resume behavior:**
- Space pressed on highlight page → resume from current position
- Space pressed on different page → navigate to highlight page first, then resume

**Verification (V-11):** Start narration, pause. Turn 5 pages forward. Pill appears. No snap-back. Press Enter → returns to highlight. Resume narration → continues from where left off.

---

#### S-12: Narrate Speed Changes Delayed

**Files:** `useNarration.ts`, `ReaderBottomBar.tsx`

**Root cause:** Changing TTS rate only takes effect on next chunk (~40 words later). Pre-buffer not invalidated on rate change.

**Fix:**
1. In `useNarration.ts`, when `speedRef.current` changes: null out `nextChunkBufferRef.current` to discard the pre-buffered chunk
2. Regenerate pre-buffer at new rate from current word position
3. If Kokoro is mid-generation via IPC (`api.kokoroGenerate`): use a generation ID guard — increment a `generationIdRef` counter on rate change; when the IPC result returns, compare its generation ID to current; discard if stale. This avoids needing an abort mechanism on the IPC channel.
4. Visual confirmation: when rate changes, show "CONFIRMED" indicator briefly next to rate display in bottom bar (CSS fade, 1s duration)

**Verification (V-12):** Start narration. Change rate mid-sentence. Audio speed changes within 1-2 words. "CONFIRMED" indicator flashes. Repeat 3x rapidly — no crashes, final rate applied.

---

#### S-14: Time-to-Complete Ignores Active Mode

**Files:** `ReaderBottomBar.tsx`

**Root cause:** Time remaining always uses WPM-based estimate even when narration is active.

**Fix:** Mode-aware time calculation:
- **Page / Focus / Flow:** `wordsRemaining / wpm` (existing)
- **Narration:** `wordsRemaining / (ttsRate * TTS_RATE_BASELINE_WPM)` — derives effective WPM from TTS rate using the existing constant (currently 150)

Ensure this logic applies to both chapter time remaining AND document time remaining displays. Use the `TTS_RATE_BASELINE_WPM` constant from `src/constants.ts`, not a magic number.

**Verification (V-14):** Enter narration at 1.0x → time based on ~150 WPM. Change to 2.0x → time halves. Switch to Focus → recalculates based on WPM setting.

---

## Phase 3: Integration Testing

| Test | Validates | Scenario |
|------|-----------|----------|
| **I-01** | S-06 + S-09 + S-10 | Open EPUB → Flow mode → cross 3 sections → pause → click word → verify position |
| **I-02** | S-08 + S-11 + S-12 | Open EPUB → Narrate → change rate 3x → cross page boundary → pause → browse 5 pages → Return pill → resume |
| **I-03** | S-03 + S-04 | Open EPUB → read to page 50 → return to cover → close → prompt → "Save at page 0" → reopen → cover at 0% |
| **I-04** | S-06 + S-07 + S-08 | Open EPUB → Focus (centered) → Flow (cursor visible) → Narrate (highlight advances) → exit to Page |
| **I-05** | Non-EPUB regression | Open TXT file → Focus mode (word centered, advances at WPM) → Flow mode (cursor slides across lines) → Narrate (highlight advances, rate change immediate) → pause, browse pages (no snap-back, pill appears) → click word (correct word highlighted) → close at start (0% progress) |
| **I-06** | S-01 + S-13 | Settings flap → toggle Kokoro AI → change TTS rate in flap → enter Narrate → bottom bar shows same rate |

---

## Phase 4: Verification Matrix

| ID | Test | Pass Criteria |
|----|------|---------------|
| V-01 | Click Kokoro AI button in Speed Reading settings | Toggle activates, setting persists |
| V-02 | Trigger release workflow, inspect latest.yml | Both x64 and arm64 entries present |
| V-03 | Open new EPUB with cover image | Lands on cover/page 0 |
| V-04 | Open EPUB, don't engage (no mode start, word click, or page turn), close | 0% progress, no backtrack prompt (hasEngaged = false) |
| V-04b | Read to page 50, go back to page 2, close | Prompt appears with both options |
| V-05 | Click Narrate button | Button highlights, no audio. Space starts. |
| V-06 | EPUB Flow mode | Cursor slides across words, visible across sections |
| V-07 | EPUB Focus mode | Word centered vertically and horizontally |
| V-08 | EPUB Narrate mode | Highlight advances word-by-word, survives page turns |
| V-09 | Click word in EPUB paragraph | Correct word highlighted |
| V-10 | Navigate 3+ EPUB sections in any mode | No stale Range errors |
| V-11 | Pause narration, browse 5 pages | No snap-back, pill appears, Enter returns |
| V-12 | Change TTS rate mid-narration | Speed changes within 1-2 words, CONFIRMED shows |
| V-13 | Change TTS rate in flap, check bottom bar | Both sliders synced |
| V-14 | Time-to-complete in Narrate vs Focus | Mode-appropriate calculation |
| V-15 | Kokoro narration across page boundary | Continuous playback, no gap |

**Execution order:** `npm test` → `npm run build` → V-01 through V-15 → I-01 through I-06 → final `npm test`

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| `renderer-fixer` (sonnet) | S-01, S-04 (Part A progress calc), S-05, S-07, S-11, S-12, S-14 |
| `electron-fixer` (sonnet) | S-02, S-04 (Part B prompt UI) |
| `format-parser` (sonnet) | S-03, S-06, S-08, S-09, S-10 (all foliate/EPUB) |
| `test-runner` (haiku) | Phase 3 + Phase 4 verification |
| `code-reviewer` (sonnet) | Post-fix architecture compliance check |

---

## Design Decisions

1. **Range-based overlay (Option B) for EPUB Flow/Narrate** — avoids fighting foliate's DOM lifecycle. Overlay cursor reads `getBoundingClientRect()` from extracted Ranges rather than injecting attributes into foliate's shadow DOM.
2. **Page-based progress, not word-based** — page 0 = 0% regardless of word index. Eliminates false progress from word extraction skipping images.
3. **High-water mark prompt on backtrack** — only when closing >2 pages behind furthest + engagement detected. Default keeps furthest position (safe).
4. **Narrate click = select, Space = start** — consistent with Focus and Flow interaction model.
5. **S-10 (stale Ranges) fixed first in Track A** — all other foliate bugs depend on reliable word extraction.
6. **S-13 and S-15 not reimplemented** — already fixed, verified in Phase 4 matrix.
