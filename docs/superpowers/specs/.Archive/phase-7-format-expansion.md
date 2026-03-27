# Phase 7 — Format Expansion & Chapter Navigation

## 7.1 MOBI Format Support

### Goal
Enable Blurby to read `.mobi` files from Calibre libraries and other sources.

### Technical Design

**Parser**: MOBI files use PalmDOC compression with a MOBI header. The structure is:
- PDB header (78 bytes) → record list → MOBI header → text records (PalmDOC compressed)
- Metadata in EXTH header (title, author, cover offset)

**Implementation Strategy**: Use the `mobi` npm package or implement a lightweight parser:
1. Read PDB header to get record offsets
2. Read MOBI header for encoding, text length, EXTH flag
3. Decompress PalmDOC LZ77 text records
4. Strip HTML tags from the decompressed content (MOBI stores content as HTML)
5. Extract EXTH metadata (title=503, author=100, cover_offset=201)

**Files to Modify:**
- `main.js` — Add `.mobi` to `SUPPORTED_EXT`, add `extractMobiContent()` in `extractContent()`, add `extractMobiMetadata()`, add `extractMobiCover()`
- `package.json` — Add `mobi` or `palm-db` dependency (or implement custom parser)

**Calibre Library Support:**
- Calibre stores books as `Author Name/Book Title (ID)/Book Title - Author Name.mobi` with a `metadata.opf` alongside
- When scanning folders, detect `metadata.opf` and parse it for richer metadata (title, author, description, cover reference) via cheerio XML parsing
- Prefer OPF metadata over MOBI EXTH metadata when available
- Extract cover from `cover.jpg` in same directory if OPF references it

**Content Extraction Pipeline:**
```
.mobi file → PDB records → PalmDOC decompress → HTML string → cheerio strip tags → plain text
```

**Edge Cases:**
- DRM-protected MOBI: Detect via MOBI header encryption field (byte offset 12). If encrypted, return error "DRM-protected file, cannot import"
- KF8 dual-format MOBI: Some .mobi files contain both MOBI6 and KF8 sections. Prefer KF8 (better formatting). Detect via MOBI header exthFlag
- Encoding: MOBI can be CP1252 or UTF-8. Read encoding from MOBI header (offset 28)

**Tests:**
- `tests/mobi.test.js` — Unit tests for PalmDOC decompression, EXTH parsing, metadata extraction
- Create a minimal test `.mobi` file or mock the binary structure

### Acceptance Criteria
- [ ] `.mobi` files appear in library when scanned from folder
- [ ] Title, author, and cover extracted correctly
- [ ] Content readable in both focus and scroll modes
- [ ] DRM-protected files show clear error message
- [ ] Calibre `metadata.opf` enriches metadata when present

---

## 7.2 Chapter-Aware EPUB Extraction

### Goal
Preserve chapter boundaries from EPUB spine items so chapter navigation and per-chapter progress work.

### Technical Design

**Current State:** `extractContent()` joins all EPUB spine XHTML text with `\n\n` — chapter boundaries are lost.

**New Approach:** Return structured content with chapter markers:

```typescript
interface ExtractedContent {
  text: string;              // Full text (backward compatible)
  chapters?: ChapterMeta[];  // Optional chapter boundaries
}

interface ChapterMeta {
  title: string;
  charOffset: number;  // Character offset in the full text string
}
```

**Implementation:**
1. In EPUB extraction, after parsing each spine item's text, record the chapter title (from OPF spine/manifest/TOC) and the current character offset
2. Parse the EPUB NCX (EPUB 2) or nav.xhtml (EPUB 3) table of contents for chapter titles
3. Map TOC entries to spine item IDs to get correct titles
4. Fallback: Use `<h1>`/`<h2>` tags from the XHTML content as chapter titles
5. Store `chapters` array in the document metadata (not in library.json — computed on content load)

**IPC Changes:**
- `loadDocContent` IPC handler returns `{ content: string, chapters?: ChapterMeta[] }` instead of just `string`
- Backward compatible: existing callers that expect string still work

**Files to Modify:**
- `main.js` — Modify EPUB extraction in `extractContent()` to return chapters, parse NCX/nav for titles
- `preload.js` — Update `loadDocContent` return type
- `src/types.ts` — Add `ChapterMeta` interface, update `ElectronAPI.loadDocContent` return type

**Chapter-to-Word Mapping:**
- On the renderer side, convert `charOffset` to `wordIndex` by counting words up to that character position in the content string
- This replaces the regex-based `detectChapters()` for EPUB documents (which remains as fallback for plain text)

### Acceptance Criteria
- [ ] EPUB chapters detected from NCX/nav TOC
- [ ] Fallback to H1/H2 heading detection when no TOC
- [ ] Chapter boundaries correctly mapped to word indices
- [ ] Chapter info displays in ReaderView bottom bar

---

## 7.3 Chapter Navigation UI

### Goal
Allow users to jump between chapters and see a chapter list during reading.

### Technical Design

**Chapter List Panel** (in MenuFlap):
- New view in MenuFlap: "chapters" alongside "queue" and "settings"
- Lists all detected chapters with title, word count, and progress percentage
- Current chapter highlighted
- Click chapter to jump reader to that position

**Reader Controls:**
- Previous/Next chapter buttons in ReaderView bottom bar (when chapters detected)
- Keyboard shortcuts: `[` (previous chapter), `]` (next chapter)
- Chapter title displayed in top bar alongside document title

**Per-Chapter Progress:**
- Save per-chapter completion status alongside overall document progress
- When a chapter boundary is crossed, mark previous chapter as read
- Display chapter completion bubbles in the chapter list

**Files to Create/Modify:**
- Create `src/components/ChapterList.tsx` — Chapter list panel
- Modify `src/components/MenuFlap.tsx` — Add "chapters" view option
- Modify `src/components/ReaderView.tsx` — Add prev/next chapter buttons, chapter title in top bar
- Modify `src/components/ScrollReaderView.tsx` — Same chapter navigation
- Modify `src/hooks/useKeyboardShortcuts.ts` — Add `[` and `]` shortcuts
- Modify `src/hooks/useReader.ts` — Add `jumpToChapter(index)` method

### Acceptance Criteria
- [ ] Chapter list accessible from menu flap during reading
- [ ] Click chapter to jump to its starting position
- [ ] `[` / `]` keyboard shortcuts navigate chapters
- [ ] Current chapter title shown in reader top bar
- [ ] Per-chapter progress indicators in chapter list

---

## 7.4 Performance — Virtual Windowing

### Goal
Prevent DOM performance issues when rendering large documents (>50k words) in flow mode.

### Technical Design

**Problem:** Flow mode renders every word as an individual `<span>`. A 100k-word book creates 100k DOM nodes, causing rendering jank and high memory usage.

**Solution:** Virtual window that only renders ~3000 words around the current position:

```typescript
const WINDOW_SIZE = 3000; // words to render
const BUFFER = 500;       // extra words outside viewport

const windowStart = Math.max(0, flowWordIndex - WINDOW_SIZE / 2 - BUFFER);
const windowEnd = Math.min(words.length, flowWordIndex + WINDOW_SIZE / 2 + BUFFER);
const visibleWords = words.slice(windowStart, windowEnd);
```

**Scroll Position Management:**
- Use a spacer div above the virtual window to maintain correct scroll height
- Spacer height = estimated character height × words before window
- Recalculate on window shift

**Implementation:**
- Only applies when `words.length > 10000` (threshold for activating virtual window)
- Below threshold, render all words normally (current behavior)
- Passive scroll mode continues using paragraph-based rendering (no virtual windowing needed)

**Files to Modify:**
- `src/components/ScrollReaderView.tsx` — Add virtual window logic around flow mode word rendering

### Acceptance Criteria
- [ ] Documents under 10k words render normally
- [ ] Documents over 10k words use virtual windowing in flow mode
- [ ] Smooth scrolling maintained during flow playback
- [ ] Click-to-jump still works within the visible window
- [ ] Progress tracking accurate despite virtual rendering
