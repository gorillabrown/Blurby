# Wave 3 — Content Pipeline, Chapter System & Hotkey Coaching

## Overview

Three workstreams: (A) HotkeyCoach expansion to reader views, (B) content formatting preservation, (C) chapter detection + TOC system. Items 3, 5, 6, 7, 8, 9 from the bug findings.

---

## Item 3: Expand HotkeyCoach to Reader Views

### Current State
HotkeyCoach is **fully built and working** in the library view. It triggers on mouse clicks for archive/favorite/delete/search/queue/settings. Each hint shown once, stored in localStorage.

**Gap:** Not wired to ReaderContainer or any reader views. No coaching for reader actions (page turn, mode switch, WPM change, chapter nav, etc.).

### Spec

**New coaching hints to add:**

| Mouse Action | Hotkey | Message |
|-------------|--------|---------|
| Click Focus button in bottom bar | `Shift+Space` | "Next time, press Shift+Space to enter Focus mode" |
| Click Flow button in bottom bar | `Space` | "Next time, press Space to enter Flow mode" |
| Click play/pause button | `Space` | "Next time, press Space to play/pause" |
| Click page (left half for prev) | `←` | "Next time, press ← to go back a page" |
| Click page (right half for next) | `→` | "Next time, press → to go to the next page" |
| Click WPM slider | `↑ / ↓` | "Next time, press ↑↓ to adjust speed" |
| Click TTS button | `N` | "Next time, press N to toggle narration" |
| Click A+/A- font buttons | `Ctrl +/-` | "Next time, press Ctrl+/- to resize text" |
| Click chapter arrow buttons | `[ / ]` | "Next time, press [ or ] to change chapters" |
| Click hamburger/menu | `Tab` or `M` | "Next time, press Tab or M to toggle the menu" |

**Implementation:**
1. Import `triggerCoachHint` in `ReaderBottomBar.tsx`, `PageReaderView.tsx`
2. Add `triggerCoachHint()` calls inside existing `onClick` handlers
3. Extend `COACH_HINTS` map in HotkeyCoach.tsx with the new entries
4. Render `<HotkeyCoach />` inside ReaderContainer (currently only in LibraryContainer)

**Visual change per user request:** Position toast at bottom quarter of screen, light grey 80% opacity box. Currently it's a standard toast — adjust CSS for `.hotkey-coach` to use `bottom: 25vh`, `background: rgba(128,128,128,0.8)`.

### Files to Change
- `src/components/HotkeyCoach.tsx` — expand COACH_HINTS map
- `src/components/ReaderContainer.tsx` — render `<HotkeyCoach />`
- `src/components/ReaderBottomBar.tsx` — add `triggerCoachHint` calls
- `src/components/PageReaderView.tsx` — page click coaching
- `src/styles/global.css` — coach toast positioning

### Acceptance Criteria
1. Coach hints appear for all 10 reader mouse actions listed above
2. Each hint shown once per action (localStorage persistence)
3. Toast positioned at bottom 25% of screen in grey/80% opacity box
4. No hints when using keyboard (only on mouse click)
5. Hints don't interfere with reader operation

---

## Items 5 & 6: Content Formatting & Image Preservation

### Current State
**All formats are stripped to plain text.** The pipeline:
- EPUB: `cheerio.text()` strips all HTML → lists, headers, images, bold/italic all lost
- PDF: `pdf-parse.getText()` → text only, no structure
- MOBI: regex HTML strip → `<br>` to `\n`, `</p>` to `\n\n`, all else removed
- HTML: `cheerio.text()` → text only
- TXT: read as-is

**Images:** Completely stripped from all formats. Only cover image extracted separately.

### Design Decision: Markdown as Intermediate Format

Instead of plain text, parse all formats to **lightweight Markdown**. This preserves structure while keeping the content lightweight and renderable.

**What to preserve:**

| Element | Current | Target Markdown |
|---------|---------|----------------|
| Paragraphs | `\n\n` | `\n\n` (same) |
| Headers | Stripped | `# H1`, `## H2`, etc. |
| Bold | Stripped | `**bold**` |
| Italic | Stripped | `*italic*` |
| Unordered lists | Stripped | `- item` |
| Ordered lists | Stripped | `1. item` |
| Block quotes | Stripped | `> quote` |
| Horizontal rules | Stripped | `---` |
| Inline images | Stripped | `![alt](data:base64)` or `![alt](local-path)` |
| Tables | Stripped | Simple markdown table or skip |

**Image handling:**
- EPUB: Extract images from ZIP to `userData/images/<docId>/`, store as `![alt](blurby://images/<docId>/<filename>)`
- PDF: Skip (pdf-parse doesn't extract images easily; defer to future)
- MOBI: Extract embedded images if possible
- HTML: Download remote images to local cache, store paths
- Renderer: `<img>` tags rendered inline with max-width constraint

### Implementation Approach

**Option A (Recommended): Enhance EPUB/MOBI parsers to emit Markdown**
- Modify `file-parsers.js` to output Markdown instead of plain text
- Add a `contentFormat` field to `BlurbyDoc`: `"text" | "markdown"`
- Renderer detects format and renders accordingly (markdown → React elements)
- Existing plain text docs continue to work (backward compatible)

**Option B: Convert all formats to EPUB internally**
- Store original file, generate an internal `.epub` from any format
- Use EPUB as the canonical reading format
- Pros: Standardized chapter/TOC/image handling
- Cons: PDF→EPUB conversion is lossy and complex, adds significant dependency weight

**Recommendation:** Option A for now (markdown output), with EPUB standardization as a future consideration for formats that already support it natively.

### Migration
- Existing documents remain as plain text (`contentFormat: "text"` or undefined)
- New imports get `contentFormat: "markdown"`
- User can re-import to get enhanced formatting
- No bulk migration needed

### Renderer Changes
- `PageReaderView.tsx`: Detect `contentFormat === "markdown"` and render with a lightweight markdown-to-React library (e.g., `react-markdown` or custom parser for the subset we support)
- Word-level selection still works: each word gets a `<span>`, but now inside styled containers (headers, list items, etc.)
- Flow cursor operates on the same word array — formatting is visual only

### Files to Change
- `main/file-parsers.js` — EPUB/MOBI/HTML parsers emit Markdown
- `src/types.ts` — add `contentFormat?: "text" | "markdown"` to BlurbyDoc
- `src/components/PageReaderView.tsx` — render Markdown content
- `main/ipc-handlers.js` — pass `contentFormat` through

### Acceptance Criteria
1. EPUB imports preserve headers, lists, bold, italic, block quotes
2. EPUB inline images extracted to disk and rendered in page view
3. MOBI imports preserve headers, lists, paragraph structure
4. Existing plain text documents render identically (no regression)
5. `contentFormat` field added to BlurbyDoc schema
6. Images render inline with max-width: 100%, centered
7. Word selection, flow cursor, focus mode all work on markdown content

### Effort Estimate
- Parser changes: 2-3 hours (EPUB biggest, MOBI medium, HTML small)
- Renderer markdown: 2-3 hours (word-level spans inside markdown containers)
- Image extraction: 2-3 hours (EPUB ZIP handling, local storage, custom protocol)
- Testing: 1-2 hours
- **Total: ~8-10 hours (1-2 sprints)**

---

## Items 7, 8, 9: Chapter Detection, C-Key Jump, TOC Building

### Current State
- **EPUB:** Chapter detection works via NCX/nav TOC. Stored in LRU cache. Chapter dropdown in bottom bar.
- **PDF, MOBI, HTML, TXT:** No chapter detection. `get-doc-chapters` returns `[]`.

### Spec

#### Item 7: Smart Chapter Detection for Non-EPUB Formats

**Heuristic chapter detection** for formats without metadata TOC:

1. **Pattern matching** — scan content for lines matching:
   - `Chapter \d+` (with optional title after colon/dash)
   - `Part \d+` / `Part [IVX]+`
   - `CHAPTER` (all caps)
   - `Section \d+`
   - `Act \d+` / `Scene \d+`
   - Numbered patterns: `I.`, `II.`, `1.`, `2.` at line start with title text

2. **Structural detection** — in Markdown content:
   - `# heading` → chapter/part boundary
   - `## heading` → section boundary
   - `---` (horizontal rule) → potential section break

3. **Density heuristic** — if detected "chapters" are too frequent (< 500 words apart) or too rare (only 1 in 50k words), adjust sensitivity:
   - Too frequent: raise to next heading level
   - Too rare: lower detection threshold (try `##` headers, bold lines, etc.)

4. **Storage:** Same format as EPUB chapters: `Array<{ title: string; charOffset: number }>`

**Implementation:**
- New function `detectChapters(content: string, contentFormat: string)` in `main/file-parsers.js`
- Called by `get-doc-chapters` when no EPUB TOC available
- Results cached in a general chapter cache (not just EPUB)

#### Item 8: C-Key Chapter Jump

**Spec:** When in any reading mode, pressing `C` opens a chapter list overlay. User selects a chapter and jumps to it.

**Implementation:**
1. Add `C` key binding in `useKeyboardShortcuts.ts` → opens `"chapterList"` overlay
2. New `ChapterListOverlay.tsx` component:
   - Full-screen overlay (like command palette)
   - Lists all chapters with titles
   - Current chapter highlighted
   - Keyboard nav: J/K or arrow keys to move, Enter to select, Escape to close
   - Clicking a chapter jumps to its word offset
3. `ReaderContainer.tsx` renders the overlay when `activeOverlay === "chapterList"`
4. On select: converts `charOffset` to word index, calls `jumpToWord(wordIndex)` or `setHighlightedWordIndex`

**CSS:** Reuse command palette styling (`.command-palette-overlay` pattern)

#### Item 9: Auto-Generated Table of Contents

**Spec:** If no TOC exists at the start of the book, build one from detected chapters and prepend it to the content as clickable entries.

**Implementation:**
1. When content is loaded and chapters detected, check if the first 500 characters already contain a TOC (heuristic: multiple lines starting with `Chapter`, `Part`, or sequential numbers with no surrounding prose)
2. If no TOC found: generate one as Markdown at the top:
   ```markdown
   ## Table of Contents

   - [Chapter 1: Introduction](#ch-1)
   - [Chapter 2: The Beginning](#ch-2)
   ...
   ```
3. Each entry is clickable — clicking jumps to the chapter's word offset
4. If a TOC already exists in the content: detect it and make its entries clickable (scan for lines matching chapter titles, link them to detected charOffsets)

**Rendering:**
- TOC rendered as the first "page" in PageReaderView
- Each entry is a clickable `<a>` or `<button>` that triggers page jump
- TOC page doesn't count toward reading progress

### Files to Change
- `main/file-parsers.js` — `detectChapters()` function
- `main/ipc-handlers.js` — update `get-doc-chapters` to call `detectChapters` for non-EPUB
- `src/hooks/useKeyboardShortcuts.ts` — add C key binding
- `src/components/ChapterListOverlay.tsx` — new component
- `src/components/ReaderContainer.tsx` — render ChapterListOverlay, handle chapter jump
- `src/components/PageReaderView.tsx` — render TOC page if chapters detected
- `src/styles/global.css` — chapter list overlay styles

### Acceptance Criteria
1. PDF, MOBI, TXT, HTML formats detect chapters from content patterns
2. "Chapter N", "Part N", and heading-based detection works
3. Chapter cache works for all formats (not just EPUB)
4. `C` key opens chapter list overlay in all reading modes
5. J/K navigation in chapter list, Enter to jump, Escape to close
6. Current chapter highlighted in the list
7. Auto-generated TOC appears as first page when no TOC exists
8. Existing TOC entries become clickable jump targets
9. TOC page doesn't count toward reading progress percentage

### Effort Estimate
- Chapter detection: 3-4 hours
- C-key overlay: 2-3 hours
- TOC generation: 2-3 hours
- Testing across formats: 2 hours
- **Total: ~10-12 hours (2 sprints)**

---

## Execution Order

```
[A] HotkeyCoach expansion (item 3) — INDEPENDENT, can run in parallel
    ↓
[B] Content formatting (items 5-6) — MUST come before C
    ↓
[C] Chapter detection + TOC (items 7-9) — depends on B (uses markdown headers for detection)
```

**Recommended sprint breakdown:**
- **Sprint 25A:** Items 3 + 5-6 (HotkeyCoach + content pipeline) — parallel
- **Sprint 25B:** Items 7-9 (chapter system) — depends on 25A for markdown content
