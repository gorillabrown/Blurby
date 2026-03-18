# Menu Flap, Settings Redesign & URL-to-PDF Export — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent overlay menu flap with reading queue and reorganized settings, plus automatic PDF generation for URL-imported articles.

**Architecture:** New `MenuFlap.tsx` component renders as a right-side overlay drawer with backdrop, accessible from both reader and library views via hamburger icon or Tab key. Settings are decomposed into individual sub-page components. PDF export uses pdfkit in the main process, triggered during URL import.

**Tech Stack:** React 19, TypeScript, Electron IPC, pdfkit (new dependency), CSS custom properties, Vitest

**Spec:** `docs/superpowers/specs/2026-03-18-menu-flap-settings-pdf-export-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/MenuFlap.tsx` | Overlay shell: backdrop, slide animation, navigation stack, header with compact toggle |
| `src/components/ReadingQueue.tsx` | Default flap view: in-progress + unread doc lists, bubble progress bars |
| `src/components/SettingsMenu.tsx` | Settings category list with drill-down routing |
| `src/components/settings/ThemeSettings.tsx` | Accent color, font family, dark/light/eink/system theme |
| `src/components/settings/ConnectorsSettings.tsx` | Site login/logout management |
| `src/components/settings/HelpSettings.tsx` | Help content (migrated from HelpPanel) |
| `src/components/settings/HotkeyMapSettings.tsx` | Read-only hotkey reference with planned/implemented status |
| `src/components/settings/TextSizeSettings.tsx` | Focus text size slider (partial), flow placeholder |
| `src/components/settings/SpeedReadingSettings.tsx` | Mode toggle + placeholder controls |
| `src/components/settings/LayoutSettings.tsx` | Spacing sliders (placeholder) |
| `src/utils/queue.ts` | Pure functions: `sortReadingQueue()`, `bubbleCount()` |
| `src/utils/pdf.ts` | Pure functions: `sanitizeFilename()`, `buildPdfMetadata()` (renderer-side only) |
| `tests/menu-flap.test.js` | Queue sorting, bubble count tests |
| `tests/pdf-export.test.js` | Filename sanitization, doc transition, PDF round-trip |

### Modified Files

| File | Changes |
|------|---------|
| `src/types.ts` | Add `lastReadAt` to BlurbyDoc, new settings fields to BlurbySettings, rename `fontSize` → `focusTextSize` |
| `src/App.tsx` | Add flap state, hamburger icon, pass flap props, rename fontSize → focusTextSize, derive readerMode from settings.readingMode, add handleOpenDocById |
| `src/components/LibraryView.tsx` | Remove appearance panel + site logins, add hamburger icon to header |
| `src/components/ReaderView.tsx` | Add hamburger icon to top bar, rename fontSize → focusTextSize |
| `src/components/ScrollReaderView.tsx` | Rename fontSize → focusTextSize |
| `src/hooks/useKeyboardShortcuts.ts` | Add Tab handler for flap toggle, rename adjustFontSize → adjustFocusTextSize |
| `src/utils/text.ts` | Rename DEFAULT_FONT_SIZE/MIN_FONT_SIZE/MAX_FONT_SIZE/FONT_SIZE_STEP constants to focus-prefixed versions |
| `src/styles/global.css` | Add menu-flap, reading-queue, settings-menu, bubble-progress CSS classes |
| `main.js` | Settings v3→v4 migration, library v1→v2 migration, pdfkit PDF generation in add-doc-from-url, Saved Articles exclusion in watcher/scanner/sync, lastReadAt update on doc open |
| `preload.js` | No changes needed — existing IPC channels sufficient |
| `package.json` | Add pdfkit dependency |
| `tests/migrations.test.js` | Add v3→v4 settings and v1→v2 library migration tests |
| `ROADMAP.md` | Add Phase 5, check off Phase 1.5 rAF item |
| `CLAUDE.md` | Update TypeScript note to reflect current reality |

### Deleted Files

| File | Reason |
|------|--------|
| `src/components/HelpPanel.tsx` | Content migrated to `settings/HelpSettings.tsx` |

---

## Task 1: Schema Migrations & Type Updates

**Files:**
- Modify: `src/types.ts`
- Modify: `main.js:12-13` (schema constants), `main.js:39-76` (migration arrays)
- Test: `tests/migrations.test.js`

- [ ] **Step 1: Write failing test for settings v3→v4 migration**

In `tests/migrations.test.js`, add:

```javascript
describe("settings v3 → v4", () => {
  it("adds new fields with defaults and renames fontSize to focusTextSize", () => {
    const v3 = {
      schemaVersion: 3,
      wpm: 300,
      sourceFolder: "/test",
      folderName: "Test",
      recentFolders: [],
      theme: "dark",
      launchAtLogin: false,
      fontSize: 120,
      accentColor: "#c4a882",
      fontFamily: "system",
    };
    const result = settingsMigrations[3](v3);
    expect(result.schemaVersion).toBe(4);
    expect(result.focusTextSize).toBe(120);
    expect(result.fontSize).toBeUndefined();
    expect(result.compactMode).toBe(false);
    expect(result.readingMode).toBe("focus");
    expect(result.focusMarks).toBe(true);
    expect(result.readingRuler).toBe(false);
    expect(result.focusSpan).toBe(0.4);
    expect(result.rhythmPauses).toEqual({
      commas: true,
      sentences: true,
      paragraphs: true,
      numbers: false,
      longerWords: false,
    });
    expect(result.layoutSpacing).toEqual({
      line: 1.5,
      character: 0,
      word: 0,
    });
    expect(result.flowTextSize).toBe(100);
    // preserved fields
    expect(result.wpm).toBe(300);
    expect(result.accentColor).toBe("#c4a882");
  });
});
```

- [ ] **Step 2: Write failing test for library v1→v2 migration**

In `tests/migrations.test.js`, add:

```javascript
describe("library v1 → v2", () => {
  it("adds lastReadAt to all docs, backfills from modified for in-progress docs", () => {
    const v1 = {
      schemaVersion: 1,
      docs: [
        { id: "1", title: "Reading", position: 50, modified: 1710000000000, source: "folder" },
        { id: "2", title: "Unread", position: 0, source: "manual" },
      ],
    };
    const result = libraryMigrations[1](v1);
    expect(result.schemaVersion).toBe(2);
    expect(result.docs[0].lastReadAt).toBe(1710000000000);
    expect(result.docs[1].lastReadAt).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- tests/migrations.test.js`
Expected: FAIL — `settingsMigrations[3]` is undefined, `libraryMigrations[1]` is undefined

- [ ] **Step 4: Implement settings v3→v4 migration in main.js**

In `main.js`:
1. Change `CURRENT_SETTINGS_SCHEMA` from `3` to `4` (line 12)
2. Update the default `settings` object (line 99) to include new fields and use `focusTextSize` instead of `fontSize`
3. Add to `settingsMigrations` array (after the v2→v3 entry around line 59):

```javascript
// v3 → v4: Add menu flap settings, rename fontSize to focusTextSize, add placeholder fields
(settings) => {
  settings.schemaVersion = 4;
  settings.focusTextSize = settings.fontSize || 100;
  delete settings.fontSize;
  settings.flowTextSize = 100;
  settings.compactMode = false;
  settings.readingMode = "focus";
  settings.focusMarks = true;
  settings.readingRuler = false;
  settings.focusSpan = 0.4;
  settings.rhythmPauses = {
    commas: true,
    sentences: true,
    paragraphs: true,
    numbers: false,
    longerWords: false,
  };
  settings.layoutSpacing = { line: 1.5, character: 0, word: 0 };
  return settings;
},
```

- [ ] **Step 5: Implement library v1→v2 migration in main.js**

Change `CURRENT_LIBRARY_SCHEMA` from `1` to `2` (line 13), then add to `libraryMigrations` array (after the v0→v1 entry around line 75):

```javascript
// v1 → v2: Add lastReadAt field for reading queue sorting
(library) => {
  library.schemaVersion = 2;
  if (Array.isArray(library.docs)) {
    library.docs = library.docs.map((doc) => ({
      ...doc,
      lastReadAt: doc.position > 0 && doc.modified ? doc.modified : null,
    }));
  }
  return library;
},
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- tests/migrations.test.js`
Expected: PASS

- [ ] **Step 7: Update src/types.ts**

Add `lastReadAt` to `BlurbyDoc` interface (after `archivedAt` around line 18):

```typescript
lastReadAt?: number | null;
```

Update `BlurbySettings` interface — replace `fontSize: number` with new fields:

```typescript
focusTextSize: number;
flowTextSize: number;
compactMode: boolean;
readingMode: "focus" | "flow";
focusMarks: boolean;
readingRuler: boolean;
focusSpan: number;
rhythmPauses: {
  commas: boolean;
  sentences: boolean;
  paragraphs: boolean;
  numbers: boolean;
  longerWords: boolean;
};
layoutSpacing: {
  line: number;
  character: number;
  word: number;
};
```

- [ ] **Step 8: Rename fontSize → focusTextSize across renderer**

In `src/utils/text.ts`:
- Line 7: `DEFAULT_FONT_SIZE` → `DEFAULT_FOCUS_TEXT_SIZE`
- Line 8: `MIN_FONT_SIZE` → `MIN_FOCUS_TEXT_SIZE`
- Line 9: `MAX_FONT_SIZE` → `MAX_FOCUS_TEXT_SIZE`
- Line 10: `FONT_SIZE_STEP` → `FOCUS_TEXT_SIZE_STEP`

In `src/App.tsx`:
- Line 2: Update imports from text.ts to use new constant names
- Line 122: `const [fontSize, setFontSize]` → `const [focusTextSize, setFocusTextSize]`
- Lines 85-87: `adjustFontSize` → `adjustFocusTextSize`, reference `focusTextSize` and new constant names
- Lines 145, 157: Change `fontSize` to `focusTextSize` in settings persistence
- Lines 270, 287: Change `fontSize` prop to `focusTextSize`
- Lines 33, 46, 102 (StandaloneReader): Rename `fontSize`/`setFontSize` to `focusTextSize`/`setFocusTextSize`
- Line 119: Remove `readerMode` state — derive it from settings instead:
  ```typescript
  const readerMode = settings.readingMode === "flow" ? "scroll" : "speed";
  ```
  Remove `setReaderMode` calls and replace with `onSettingsChange({ readingMode: ... })` where applicable.

In `src/components/ReaderView.tsx`:
- Line 12: Rename `fontSize` prop to `focusTextSize` in interface
- Line 44: `const scale = (focusTextSize || 100) / 100;`

In `src/components/ScrollReaderView.tsx`:
- Rename `fontSize` prop to `focusTextSize` in interface and usage

In `src/hooks/useKeyboardShortcuts.ts`:
- Rename `adjustFontSize` callback reference to `adjustFocusTextSize`

- [ ] **Step 9: Run full test suite**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 10: Commit**

```bash
git add src/types.ts main.js tests/migrations.test.js src/App.tsx src/components/ReaderView.tsx src/components/ScrollReaderView.tsx src/hooks/useKeyboardShortcuts.ts
git commit -m "feat: add settings v3→v4 and library v1→v2 migrations, rename fontSize to focusTextSize"
```

---

## Task 2: Pure Utility Functions (Queue Sorting & PDF Helpers)

**Files:**
- Create: `src/utils/queue.ts`
- Create: `src/utils/pdf.ts`
- Test: `tests/menu-flap.test.js`
- Test: `tests/pdf-export.test.js`

- [ ] **Step 1: Write failing tests for queue utilities**

Create `tests/menu-flap.test.js`:

```javascript
import { describe, it, expect } from "vitest";
import { sortReadingQueue, bubbleCount } from "../src/utils/queue.ts";

describe("bubbleCount", () => {
  it("returns 0 for 0% progress", () => {
    expect(bubbleCount(0)).toBe(0);
  });
  it("returns 7 for 70% progress", () => {
    expect(bubbleCount(70)).toBe(7);
  });
  it("returns 10 for 100% progress", () => {
    expect(bubbleCount(100)).toBe(10);
  });
  it("floors partial percentages", () => {
    expect(bubbleCount(15)).toBe(1);
    expect(bubbleCount(99)).toBe(9);
  });
});

describe("sortReadingQueue", () => {
  const docs = [
    { id: "1", title: "Unread New", position: 0, wordCount: 100, lastReadAt: null, created: 1710003000 },
    { id: "2", title: "In Progress Recent", position: 50, wordCount: 200, lastReadAt: 1710002000, created: 1710000000 },
    { id: "3", title: "In Progress Old", position: 30, wordCount: 100, lastReadAt: 1710001000, created: 1710000000 },
    { id: "4", title: "Unread Old", position: 0, wordCount: 100, lastReadAt: null, created: 1710001000 },
    { id: "5", title: "Completed", position: 100, wordCount: 100, lastReadAt: 1710003000, created: 1710000000 },
  ];

  it("excludes completed docs (progress >= 100%)", () => {
    const result = sortReadingQueue(docs);
    expect(result.find((d) => d.id === "5")).toBeUndefined();
  });

  it("puts in-progress docs before unread docs", () => {
    const result = sortReadingQueue(docs);
    const ids = result.map((d) => d.id);
    expect(ids).toEqual(["2", "3", "1", "4"]);
  });

  it("sorts in-progress by lastReadAt descending", () => {
    const result = sortReadingQueue(docs);
    expect(result[0].id).toBe("2"); // lastReadAt: 1710002000
    expect(result[1].id).toBe("3"); // lastReadAt: 1710001000
  });

  it("sorts unread by created descending", () => {
    const result = sortReadingQueue(docs);
    expect(result[2].id).toBe("1"); // created: 1710003000
    expect(result[3].id).toBe("4"); // created: 1710001000
  });

  it("returns empty array for empty input", () => {
    expect(sortReadingQueue([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/menu-flap.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Implement queue utilities**

Create `src/utils/queue.ts`:

```typescript
interface QueueDoc {
  id: string;
  position: number;
  wordCount: number;
  lastReadAt: number | null;
  created: number;
  [key: string]: unknown;
}

export function bubbleCount(progressPercent: number): number {
  return Math.floor(progressPercent / 10);
}

export function sortReadingQueue<T extends QueueDoc>(docs: T[]): T[] {
  const inProgress: T[] = [];
  const unread: T[] = [];

  for (const doc of docs) {
    const progress = doc.wordCount > 0 ? (doc.position / doc.wordCount) * 100 : 0;
    if (progress >= 100) continue;
    if (doc.position > 0) {
      inProgress.push(doc);
    } else {
      unread.push(doc);
    }
  }

  inProgress.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
  unread.sort((a, b) => b.created - a.created);

  return [...inProgress, ...unread];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/menu-flap.test.js`
Expected: PASS

- [ ] **Step 5: Write failing tests for PDF utilities**

Create `tests/pdf-export.test.js`:

```javascript
import { describe, it, expect } from "vitest";
import { sanitizeFilename, buildPdfMetadata } from "../src/utils/pdf.ts";

describe("sanitizeFilename", () => {
  it("replaces illegal characters with hyphens", () => {
    expect(sanitizeFilename('Hello: World? "Test"')).toBe("Hello-World-Test");
  });
  it("collapses multiple hyphens", () => {
    expect(sanitizeFilename("a///b///c")).toBe("a-b-c");
  });
  it("trims hyphens from edges", () => {
    expect(sanitizeFilename("--hello--")).toBe("hello");
  });
  it("truncates to 100 characters", () => {
    const long = "a".repeat(150);
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(100);
  });
  it("returns 'untitled' for empty input", () => {
    expect(sanitizeFilename("")).toBe("untitled");
  });
});

describe("buildPdfMetadata", () => {
  it("builds metadata object from article info", () => {
    const meta = buildPdfMetadata({
      title: "Test Article",
      author: "Jane Doe",
      sourceUrl: "https://example.com/article",
      fetchDate: new Date("2026-03-18"),
    });
    expect(meta.Title).toBe("Test Article");
    expect(meta.Author).toBe("Jane Doe");
    expect(meta.Keywords).toContain("https://example.com/article");
    expect(meta.CreationDate).toBeInstanceOf(Date);
  });
  it("handles missing author", () => {
    const meta = buildPdfMetadata({
      title: "Test",
      sourceUrl: "https://example.com",
      fetchDate: new Date(),
    });
    expect(meta.Author).toBe("Unknown");
  });
});
```

- [ ] **Step 6: Implement PDF utilities**

Create `src/utils/pdf.ts`:

```typescript
export function sanitizeFilename(name: string): string {
  let sanitized = name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return sanitized || "untitled";
}

interface ArticleInfo {
  title: string;
  author?: string;
  sourceUrl: string;
  fetchDate: Date;
}

interface PdfMetadata {
  Title: string;
  Author: string;
  Keywords: string;
  CreationDate: Date;
}

export function buildPdfMetadata(info: ArticleInfo): PdfMetadata {
  return {
    Title: info.title,
    Author: info.author || "Unknown",
    Keywords: `source:${info.sourceUrl}`,
    CreationDate: info.fetchDate,
  };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- tests/pdf-export.test.js`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/utils/queue.ts src/utils/pdf.ts tests/menu-flap.test.js tests/pdf-export.test.js
git commit -m "feat: add queue sorting and PDF utility functions with tests"
```

---

## Task 3: CSS Foundation

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add menu flap CSS classes**

Add to `src/styles/global.css` (after the existing `.appearance-panel` styles around line 1198):

```css
/* ===== Menu Flap ===== */

.menu-flap-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}

.menu-flap-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

.menu-flap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background: var(--bg-raised, #12122a);
  border-left: 1px solid var(--accent-faded, rgba(196, 168, 130, 0.13));
  z-index: 901;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 200ms ease;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
}

.menu-flap.open {
  transform: translateX(0);
}

.menu-flap-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--accent-faded, rgba(196, 168, 130, 0.13));
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
}

.menu-flap-header-title {
  flex: 1;
  color: var(--accent);
  font-weight: 600;
  font-size: 12px;
}

.menu-flap-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menu-flap-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.menu-flap-footer {
  border-top: 1px solid var(--accent-faded, rgba(196, 168, 130, 0.13));
  padding: 8px;
}

/* Reading Queue */

.queue-section-label {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 12px 4px;
}

.queue-item {
  padding: 10px 12px;
  background: var(--bg);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 150ms ease;
}

.queue-item:hover {
  background: var(--bg-hover, rgba(196, 168, 130, 0.08));
}

.queue-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.queue-item-title {
  color: var(--text);
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.queue-item-date {
  color: var(--text-muted, #666);
  font-size: 9px;
}

.queue-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Bubble progress bar */

.bubble-progress {
  display: flex;
  gap: 3px;
  align-items: center;
}

.bubble-progress.compact {
  gap: 2px;
}

.bubble-progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-faded, rgba(196, 168, 130, 0.2));
}

.bubble-progress-dot.filled {
  background: var(--accent);
}

.bubble-progress.compact .bubble-progress-dot {
  width: 6px;
  height: 6px;
}

.bubble-progress-label {
  color: var(--text-muted, #888);
  font-size: 9px;
  margin-left: 4px;
}

/* Settings menu */

.settings-menu-item {
  padding: 10px 12px;
  color: var(--text);
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 150ms ease;
}

.settings-menu-item:hover {
  background: var(--bg);
}

.settings-menu-item-icon {
  margin-right: 8px;
}

.settings-menu-item-chevron {
  color: var(--text-muted, #666);
  font-size: 10px;
}

.settings-menu-divider {
  height: 1px;
  background: var(--accent-faded, rgba(196, 168, 130, 0.08));
  margin: 8px 0;
}

/* Settings sub-pages */

.settings-section-label {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.settings-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.settings-toggle-label {
  color: var(--text);
  font-size: 12px;
}

.settings-toggle {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--bg-muted, #333);
  position: relative;
  cursor: pointer;
  transition: background 150ms ease;
}

.settings-toggle.active {
  background: var(--accent);
}

.settings-toggle-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 150ms ease;
}

.settings-toggle.active .settings-toggle-thumb {
  left: 18px;
}

.settings-toggle.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.settings-slider {
  width: 100%;
  margin: 8px 0 16px;
}

.settings-mode-toggle {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.settings-mode-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  text-align: center;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid var(--bg-muted, #333);
  background: var(--bg);
  color: var(--text-muted, #888);
  transition: all 150ms ease;
}

.settings-mode-btn.active {
  border-color: var(--accent);
  background: var(--accent-faded, rgba(196, 168, 130, 0.13));
  color: var(--accent);
  font-weight: 600;
}

/* Hotkey map */

.hotkey-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
  font-size: 11px;
}

.hotkey-action {
  color: var(--text);
}

.hotkey-action.planned {
  color: var(--text-muted, #666);
}

.hotkey-key {
  color: var(--accent);
  font-family: var(--mono);
  text-align: right;
}

.hotkey-key.planned {
  color: var(--text-muted, #666);
}

.hotkey-planned-badge {
  font-size: 8px;
  color: var(--text-muted, #666);
  margin-left: 4px;
}

/* Hamburger button */

.hamburger-btn {
  background: none;
  border: none;
  color: var(--text-muted, #888);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 150ms ease;
}

.hamburger-btn:hover {
  color: var(--accent);
}

/* Reduced motion */

@media (prefers-reduced-motion: reduce) {
  .menu-flap,
  .menu-flap-backdrop {
    transition: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add CSS classes for menu flap, reading queue, settings, and bubble progress"
```

---

## Task 4: MenuFlap Shell Component

**Files:**
- Create: `src/components/MenuFlap.tsx`
- Modify: `src/App.tsx`
- Modify: `src/hooks/useKeyboardShortcuts.ts`

- [ ] **Step 1: Create MenuFlap.tsx**

Create `src/components/MenuFlap.tsx`:

```tsx
import React, { useState, useCallback, useEffect } from "react";
import type { BlurbyDoc, BlurbySettings } from "../types";
import { ReadingQueue } from "./ReadingQueue";
import { SettingsMenu } from "./SettingsMenu";

type FlapView = "queue" | "settings" | string; // string for settings sub-pages like "theme", "connectors", etc.

interface MenuFlapProps {
  open: boolean;
  onClose: () => void;
  docs: BlurbyDoc[];
  settings: BlurbySettings;
  onOpenDoc: (docId: string) => void;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
}

export function MenuFlap({
  open,
  onClose,
  docs,
  settings,
  onOpenDoc,
  onSettingsChange,
  siteLogins,
  onSiteLogin,
  onSiteLogout,
}: MenuFlapProps) {
  const [view, setView] = useState<FlapView>("queue");

  // Reset to queue when re-opening
  useEffect(() => {
    if (open) setView("queue");
  }, [open]);

  const handleBack = useCallback(() => {
    if (view === "settings") {
      setView("queue");
    } else if (view !== "queue") {
      setView("settings");
    }
  }, [view]);

  const handleDocClick = useCallback(
    (docId: string) => {
      onClose();
      onOpenDoc(docId);
    },
    [onClose, onOpenDoc]
  );

  const toggleCompact = useCallback(() => {
    onSettingsChange({ compactMode: !settings.compactMode });
  }, [settings.compactMode, onSettingsChange]);

  const title =
    view === "queue"
      ? "Reading Queue"
      : view === "settings"
        ? "Settings"
        : view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <>
      <div
        className={`menu-flap-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`menu-flap ${open ? "open" : ""}`}
        role="dialog"
        aria-label="Menu"
        aria-hidden={!open}
      >
        <div className="menu-flap-header">
          {view !== "queue" && (
            <button
              className="hamburger-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              ←
            </button>
          )}
          <span className="menu-flap-header-title">{title}</span>
          <div className="menu-flap-header-actions">
            {view === "queue" && (
              <button
                className="hamburger-btn"
                onClick={toggleCompact}
                aria-label={settings.compactMode ? "Relaxed view" : "Compact view"}
                title={settings.compactMode ? "Relaxed view" : "Compact view"}
              >
                {settings.compactMode ? "⊞" : "⊟"}
              </button>
            )}
            <button
              className="hamburger-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="menu-flap-body">
          {view === "queue" && (
            <ReadingQueue
              docs={docs}
              compact={settings.compactMode}
              onDocClick={handleDocClick}
            />
          )}
          {view === "settings" && (
            <SettingsMenu
              settings={settings}
              onNavigate={setView}
              onSettingsChange={onSettingsChange}
              siteLogins={siteLogins}
              onSiteLogin={onSiteLogin}
              onSiteLogout={onSiteLogout}
            />
          )}
          {/* Settings sub-pages rendered by SettingsMenu when view is a category name */}
        </div>

        {view === "queue" && (
          <div className="menu-flap-footer">
            <div
              className="settings-menu-item"
              onClick={() => setView("settings")}
              role="button"
              tabIndex={0}
            >
              <span>⚙️ Settings</span>
              <span className="settings-menu-item-chevron">▸</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
```

Note: The `SettingsMenu` component will handle rendering sub-pages when `view` matches a category name. This is refined in Task 6.

- [ ] **Step 2: Add flap state and hamburger to App.tsx**

In `src/App.tsx`, add state (near other state declarations around line 118):

```typescript
const [menuFlapOpen, setMenuFlapOpen] = useState(false);
const toggleMenuFlap = useCallback(() => setMenuFlapOpen((prev) => !prev), []);
```

Import MenuFlap and render it after the view conditionals (before the closing `</div>` of the app container):

```tsx
import { MenuFlap } from "./components/MenuFlap";

// In the JSX, after ReaderView/LibraryView:
<MenuFlap
  open={menuFlapOpen}
  onClose={() => setMenuFlapOpen(false)}
  docs={library}
  settings={settings}
  onOpenDoc={handleOpenDocById}
  onSettingsChange={handleSettingsChange}
  siteLogins={siteLogins}
  onSiteLogin={handleSiteLogin}
  onSiteLogout={handleSiteLogout}
/>
```

Add `handleOpenDocById` — looks up doc by ID, loads content, and opens reader:

```typescript
const handleOpenDocById = useCallback(async (docId: string) => {
  const doc = library.find((d) => d.id === docId);
  if (!doc) return;
  // Update lastReadAt
  const updated = { ...doc, lastReadAt: Date.now() };
  await window.electronAPI.updateDoc(updated);
  setLibrary((prev) => prev.map((d) => d.id === docId ? updated : d));
  // Load content and open reader (reuse existing openDoc logic)
  openDoc(updated);
}, [library, openDoc]);
```

Note: `handleSettingsChange`, `siteLogins`, `handleSiteLogin`, `handleSiteLogout` — site login handlers are in LibraryView currently and will need to be lifted to App.tsx in Task 7.

- [ ] **Step 3: Add Tab shortcut to useKeyboardShortcuts.ts**

In `src/hooks/useKeyboardShortcuts.ts`, add a `toggleFlap` callback parameter to `useReaderKeys` and handle Tab:

```typescript
// Add to the keydown handler in useReaderKeys:
if (e.key === "Tab") {
  e.preventDefault();
  toggleFlap();
  return;
}
```

Also add a `useGlobalKeys` hook for when the user is in library view:

```typescript
export function useGlobalKeys({ toggleFlap }: { toggleFlap: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !e.target?.closest?.("input, textarea, select")) {
        e.preventDefault();
        toggleFlap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFlap]);
}
```

Wire `useGlobalKeys` in App.tsx.

- [ ] **Step 4: Add hamburger icons to LibraryView and ReaderView headers**

In `src/components/LibraryView.tsx` header (around line 254), add before the existing buttons:

```tsx
<button className="hamburger-btn" onClick={onToggleFlap} aria-label="Open menu" title="Menu (Tab)">
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
</button>
```

Add `onToggleFlap` to the component's props interface.

In `src/components/ReaderView.tsx` top bar (around line 83), add to the right side:

```tsx
<button className="hamburger-btn" onClick={onToggleFlap} aria-label="Open menu" title="Menu (Tab)">
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
</button>
```

Add `onToggleFlap` to the component's props interface.

- [ ] **Step 5: Commit**

```bash
git add src/components/MenuFlap.tsx src/App.tsx src/hooks/useKeyboardShortcuts.ts src/components/LibraryView.tsx src/components/ReaderView.tsx
git commit -m "feat: add MenuFlap shell with overlay, hamburger icons, and Tab shortcut"
```

---

## Task 5: Reading Queue Component

**Files:**
- Create: `src/components/ReadingQueue.tsx`

- [ ] **Step 1: Create ReadingQueue.tsx**

```tsx
import React from "react";
import type { BlurbyDoc } from "../types";
import { sortReadingQueue, bubbleCount } from "../utils/queue";

interface ReadingQueueProps {
  docs: BlurbyDoc[];
  compact: boolean;
  onDocClick: (docId: string) => void;
}

function BubbleProgress({ progress, compact }: { progress: number; compact: boolean }) {
  const filled = bubbleCount(progress);
  return (
    <div className={`bubble-progress ${compact ? "compact" : ""}`}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`bubble-progress-dot ${i < filled ? "filled" : ""}`}
        />
      ))}
      <span className="bubble-progress-label">{Math.round(progress)}%</span>
    </div>
  );
}

function sourceBadge(source: string) {
  return (
    <span className="badge" style={{ fontSize: "8px" }}>
      {source}
    </span>
  );
}

export function ReadingQueue({ docs, compact, onDocClick }: ReadingQueueProps) {
  const sorted = sortReadingQueue(
    docs.map((d) => ({
      ...d,
      position: d.position || 0,
      wordCount: d.wordCount || 0,
      lastReadAt: d.lastReadAt || null,
      created: d.created || 0,
    }))
  );

  const inProgress = sorted.filter((d) => d.position > 0);
  const unread = sorted.filter((d) => d.position === 0);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
        No unread materials
      </div>
    );
  }

  const formatDate = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const renderItem = (doc: BlurbyDoc) => {
    const progress = doc.wordCount ? (doc.position / doc.wordCount) * 100 : 0;
    return (
      <div
        key={doc.id}
        className="queue-item"
        onClick={() => onDocClick(doc.id)}
        role="button"
        tabIndex={0}
        aria-label={`Open ${doc.title}`}
      >
        <div className="queue-item-header">
          <span className="queue-item-title">{doc.title}</span>
          {!compact && sourceBadge(doc.source)}
        </div>
        <div className="queue-item-meta">
          <span className="queue-item-date">
            {compact ? "" : `Added ${formatDate(doc.created)}`}
          </span>
          {compact ? sourceBadge(doc.source) : null}
        </div>
        <BubbleProgress progress={progress} compact={compact} />
      </div>
    );
  };

  return (
    <>
      {inProgress.length > 0 && (
        <>
          <div className="queue-section-label">Continue Reading</div>
          {inProgress.map(renderItem)}
        </>
      )}
      {unread.length > 0 && (
        <>
          <div className="queue-section-label">Unread</div>
          {unread.map(renderItem)}
        </>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify MenuFlap renders ReadingQueue (manual test)**

Run: `npm run dev`
Open app, press Tab — flap should open with reading queue showing.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReadingQueue.tsx
git commit -m "feat: add ReadingQueue component with bubble progress bars"
```

---

## Task 6: Settings Menu & Sub-page Components

**Files:**
- Create: `src/components/SettingsMenu.tsx`
- Create: `src/components/settings/ThemeSettings.tsx`
- Create: `src/components/settings/ConnectorsSettings.tsx`
- Create: `src/components/settings/HelpSettings.tsx`
- Create: `src/components/settings/HotkeyMapSettings.tsx`
- Create: `src/components/settings/TextSizeSettings.tsx`
- Create: `src/components/settings/SpeedReadingSettings.tsx`
- Create: `src/components/settings/LayoutSettings.tsx`

This is the largest task. Each sub-page is a small, focused component.

- [ ] **Step 1: Create the settings directory**

Run: `mkdir -p src/components/settings` (may already exist via file creation)

- [ ] **Step 2: Create SettingsMenu.tsx (router + category list)**

Create `src/components/SettingsMenu.tsx`:

```tsx
import React from "react";
import type { BlurbySettings } from "../types";
import { ThemeSettings } from "./settings/ThemeSettings";
import { ConnectorsSettings } from "./settings/ConnectorsSettings";
import { HelpSettings } from "./settings/HelpSettings";
import { HotkeyMapSettings } from "./settings/HotkeyMapSettings";
import { TextSizeSettings } from "./settings/TextSizeSettings";
import { SpeedReadingSettings } from "./settings/SpeedReadingSettings";
import { LayoutSettings } from "./settings/LayoutSettings";

interface SettingsMenuProps {
  settings: BlurbySettings;
  onNavigate: (view: string) => void;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
  activeSubPage?: string;
}

const CATEGORIES = [
  { id: "text-size", label: "Text Size", icon: "🔤" },
  { id: "speed-reading", label: "Speed Reading", icon: "⚡" },
  { id: "theme", label: "Theme", icon: "🎨" },
  { id: "layout", label: "Layout", icon: "📐" },
  { id: "connectors", label: "Connectors", icon: "🔌" },
];

const SUPPORT = [
  { id: "help", label: "Help", icon: "❓" },
  { id: "hotkeys", label: "Hotkey Map", icon: "⌨️" },
];

export function SettingsMenu({
  settings,
  onNavigate,
  onSettingsChange,
  siteLogins,
  onSiteLogin,
  onSiteLogout,
  activeSubPage,
}: SettingsMenuProps) {
  // If a sub-page is active, render it
  if (activeSubPage) {
    const subPageMap: Record<string, React.ReactNode> = {
      "text-size": <TextSizeSettings settings={settings} onChange={onSettingsChange} />,
      "speed-reading": <SpeedReadingSettings settings={settings} onChange={onSettingsChange} />,
      theme: <ThemeSettings settings={settings} onChange={onSettingsChange} />,
      layout: <LayoutSettings settings={settings} onChange={onSettingsChange} />,
      connectors: (
        <ConnectorsSettings
          siteLogins={siteLogins}
          onSiteLogin={onSiteLogin}
          onSiteLogout={onSiteLogout}
        />
      ),
      help: <HelpSettings />,
      hotkeys: <HotkeyMapSettings />,
    };
    return <>{subPageMap[activeSubPage]}</>;
  }

  // Category list
  const renderItem = (item: { id: string; label: string; icon: string }) => (
    <div
      key={item.id}
      className="settings-menu-item"
      onClick={() => onNavigate(item.id)}
      role="button"
      tabIndex={0}
    >
      <span>
        <span className="settings-menu-item-icon">{item.icon}</span>
        {item.label}
      </span>
      <span className="settings-menu-item-chevron">▸</span>
    </div>
  );

  return (
    <>
      {CATEGORIES.map(renderItem)}
      <div className="settings-menu-divider" />
      {SUPPORT.map(renderItem)}
    </>
  );
}
```

- [ ] **Step 3: Update MenuFlap.tsx to route settings sub-pages**

Update the `MenuFlap.tsx` to treat the `view` state as the settings sub-page ID when it's not "queue" or "settings". Pass `activeSubPage` to SettingsMenu when the view is a category ID.

In the body rendering section, replace the settings conditional:

```tsx
{(view === "settings" || (view !== "queue")) && view !== "queue" && (
  <SettingsMenu
    settings={settings}
    onNavigate={setView}
    onSettingsChange={onSettingsChange}
    siteLogins={siteLogins}
    onSiteLogin={onSiteLogin}
    onSiteLogout={onSiteLogout}
    activeSubPage={view !== "settings" && view !== "queue" ? view : undefined}
  />
)}
```

Update `handleBack` to navigate from sub-page → settings → queue.

Update `title` derivation to map category IDs to display names.

- [ ] **Step 4: Create ThemeSettings.tsx (migrates existing appearance logic)**

Create `src/components/settings/ThemeSettings.tsx`:

```tsx
import React from "react";
import type { BlurbySettings } from "../../types";

// Must match existing values in LibraryView.tsx lines 13-20 exactly
const ACCENT_PRESETS = [
  { label: "gold", value: "#c4a882" },
  { label: "blue", value: "#5b8fb9" },
  { label: "green", value: "#6b9f6b" },
  { label: "rose", value: "#c47882" },
  { label: "purple", value: "#9b82c4" },
  { label: "teal", value: "#5ba8a0" },
];

// Must match existing values in LibraryView.tsx lines 22-29 — value is the CSS font stack, not the label
const FONT_PRESETS: { label: string; value: string | null }[] = [
  { label: "system", value: null },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Mono", value: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" },
  { label: "Literata", value: "'Literata', Georgia, serif" },
  { label: "OpenDyslexic", value: "'OpenDyslexic', sans-serif" },
];

const THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "eink", label: "E-Ink" },
  { id: "system", label: "System" },
];

interface ThemeSettingsProps {
  settings: BlurbySettings;
  onChange: (updates: Partial<BlurbySettings>) => void;
}

export function ThemeSettings({ settings, onChange }: ThemeSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">THEME</div>
      <div className="settings-mode-toggle">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`settings-mode-btn ${settings.theme === t.id ? "active" : ""}`}
            onClick={() => onChange({ theme: t.id as BlurbySettings["theme"] })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="settings-section-label">ACCENT COLOR</div>
      <div className="appearance-row" style={{ marginBottom: 16 }}>
        {ACCENT_PRESETS.map((p) => (
          <div
            key={p.value}
            className={`accent-swatch ${settings.accentColor === p.value ? "active" : ""}`}
            style={{ background: p.value }}
            onClick={() => onChange({ accentColor: p.value })}
            title={p.label}
            role="button"
            tabIndex={0}
          />
        ))}
        <input
          type="color"
          value={settings.accentColor}
          onChange={(e) => onChange({ accentColor: e.target.value })}
          title="Custom color"
          style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer" }}
        />
      </div>

      <div className="settings-section-label">READER FONT</div>
      <div className="appearance-row">
        {FONT_PRESETS.map((f) => (
          <button
            key={f.label}
            className={`font-preset ${settings.fontFamily === f.value ? "active" : ""}`}
            onClick={() => onChange({ fontFamily: f.value })}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create ConnectorsSettings.tsx (migrates existing site logins logic)**

Create `src/components/settings/ConnectorsSettings.tsx`:

```tsx
import React, { useState } from "react";

interface ConnectorsSettingsProps {
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
}

export function ConnectorsSettings({ siteLogins, onSiteLogin, onSiteLogout }: ConnectorsSettingsProps) {
  const [loginUrl, setLoginUrl] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!loginUrl.trim()) return;
    setLoggingIn(true);
    try {
      await onSiteLogin(loginUrl.trim());
      setLoginUrl("");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div>
      <div className="settings-section-label">LOGGED-IN SITES</div>
      {siteLogins.length > 0 ? (
        <div className="site-logins-list">
          {siteLogins.map((s) => (
            <div key={s.domain} className="site-login-item">
              <span>{s.domain} ({s.cookieCount} cookies)</span>
              <button className="btn btn-sm" onClick={() => onSiteLogout(s.domain)}>
                Log out
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 12 }}>
          No sites logged in.
        </p>
      )}

      <div className="settings-section-label" style={{ marginTop: 16 }}>ADD SITE</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="mock-input"
          type="text"
          placeholder="Enter site URL (e.g. nytimes.com)"
          value={loginUrl}
          onChange={(e) => setLoginUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ flex: 1, fontSize: 11 }}
        />
        <button className="btn btn-fill" onClick={handleLogin} disabled={loggingIn || !loginUrl.trim()}>
          {loggingIn ? "..." : "Log in"}
        </button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 9, marginTop: 6 }}>
        Log in to paywalled sites to access full articles
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Create HelpSettings.tsx**

Create `src/components/settings/HelpSettings.tsx` — migrate content from `HelpPanel.tsx`. Read the existing `HelpPanel.tsx` to extract its exact content and replicate it here.

- [ ] **Step 7: Create HotkeyMapSettings.tsx**

Create `src/components/settings/HotkeyMapSettings.tsx`:

```tsx
import React from "react";

const HOTKEYS = [
  { action: "Jump back", key: "Left Arrow", status: "implemented" },
  { action: "Jump forward", key: "Right Arrow", status: "implemented" },
  { action: "Speed up", key: "Up Arrow", status: "implemented" },
  { action: "Slow down", key: "Down Arrow", status: "implemented" },
  { action: "Speed up (coarse)", key: "Shift + Up", status: "planned" },
  { action: "Slow down (coarse)", key: "Shift + Down", status: "planned" },
  { action: "Play / pause", key: "Space", status: "implemented" },
  { action: "Reader view", key: "Ctrl/Cmd + 1", status: "planned" },
  { action: "Source view", key: "Ctrl/Cmd + 2", status: "planned" },
  { action: "Reader settings", key: "Ctrl/Cmd + ,", status: "planned" },
  { action: "Reading speed", key: "Shift + S", status: "planned" },
  { action: "Narration settings", key: "Shift + T", status: "planned" },
  { action: "Speed reading mode", key: "Shift + F", status: "planned" },
  { action: "Navigation modal", key: "N", status: "planned" },
  { action: "Toggle favorite", key: "B", status: "planned" },
  { action: "Toggle narration", key: "T", status: "planned" },
  { action: "Toggle side menu", key: "Tab", status: "implemented" },
];

export function HotkeyMapSettings() {
  return (
    <div className="hotkey-grid">
      {HOTKEYS.map((h) => (
        <React.Fragment key={h.action}>
          <span className={`hotkey-action ${h.status === "planned" ? "planned" : ""}`}>
            {h.action}
            {h.status === "planned" && <span className="hotkey-planned-badge">(planned)</span>}
          </span>
          <span className={`hotkey-key ${h.status === "planned" ? "planned" : ""}`}>
            {h.key}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Create TextSizeSettings.tsx (partial)**

Create `src/components/settings/TextSizeSettings.tsx`:

```tsx
import React from "react";
import type { BlurbySettings } from "../../types";

interface TextSizeSettingsProps {
  settings: BlurbySettings;
  onChange: (updates: Partial<BlurbySettings>) => void;
}

export function TextSizeSettings({ settings, onChange }: TextSizeSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">FOCUS READER</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ color: "var(--text)", fontSize: 11 }}>A-</span>
        <input
          type="range"
          className="settings-slider"
          min={60}
          max={200}
          step={10}
          value={settings.focusTextSize}
          onChange={(e) => onChange({ focusTextSize: Number(e.target.value) })}
        />
        <span style={{ color: "var(--text)", fontSize: 11 }}>A+</span>
        <span style={{ color: "var(--text-muted)", fontSize: 10, minWidth: 32 }}>
          {settings.focusTextSize}%
        </span>
      </div>

      <div className="settings-section-label">FLOW READER</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.4 }}>
        <span style={{ color: "var(--text)", fontSize: 11 }}>A-</span>
        <input
          type="range"
          className="settings-slider"
          min={60}
          max={200}
          step={10}
          value={settings.flowTextSize}
          disabled
        />
        <span style={{ color: "var(--text)", fontSize: 11 }}>A+</span>
        <span style={{ color: "var(--text-muted)", fontSize: 10, minWidth: 32 }}>
          {settings.flowTextSize}%
        </span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 9 }}>Coming soon</p>
    </div>
  );
}
```

- [ ] **Step 9: Create SpeedReadingSettings.tsx (placeholder)**

Create `src/components/settings/SpeedReadingSettings.tsx`:

```tsx
import React from "react";
import type { BlurbySettings } from "../../types";

interface SpeedReadingSettingsProps {
  settings: BlurbySettings;
  onChange: (updates: Partial<BlurbySettings>) => void;
}

export function SpeedReadingSettings({ settings, onChange }: SpeedReadingSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">MODE</div>
      <div className="settings-mode-toggle">
        <button
          className={`settings-mode-btn ${settings.readingMode === "focus" ? "active" : ""}`}
          onClick={() => onChange({ readingMode: "focus" })}
        >
          Focus
        </button>
        <button
          className={`settings-mode-btn ${settings.readingMode === "flow" ? "active" : ""}`}
          onClick={() => onChange({ readingMode: "flow" })}
        >
          Flow
        </button>
      </div>

      <div className="settings-section-label">FOCUS MODE</div>
      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Marks</span>
        <div className="settings-toggle disabled" title="Coming soon">
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-section-label" style={{ marginTop: 16 }}>GENERAL READER</div>
      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Reading Ruler</span>
        <div className="settings-toggle disabled" title="Coming soon">
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-section-label" style={{ marginTop: 16 }}>FOCUS SPAN</div>
      <input type="range" className="settings-slider" min={0} max={1} step={0.1} disabled style={{ opacity: 0.4 }} />
      <p style={{ color: "var(--text-muted)", fontSize: 9 }}>Coming soon</p>

      <div className="settings-section-label" style={{ marginTop: 16 }}>RHYTHM PAUSES</div>
      {["Commas, colons, etc.", "Between sentences", "Between paragraphs", "Numbers", "Longer words"].map((label) => (
        <div key={label} className="settings-toggle-row">
          <span className="settings-toggle-label">{label}</span>
          <div className="settings-toggle disabled" title="Coming soon">
            <div className="settings-toggle-thumb" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 10: Create LayoutSettings.tsx (placeholder)**

Create `src/components/settings/LayoutSettings.tsx`:

```tsx
import React from "react";
import type { BlurbySettings } from "../../types";

interface LayoutSettingsProps {
  settings: BlurbySettings;
  onChange: (updates: Partial<BlurbySettings>) => void;
}

export function LayoutSettings({ settings, onChange }: LayoutSettingsProps) {
  return (
    <div style={{ opacity: 0.4 }}>
      <div className="settings-section-label">LINE SPACING</div>
      <input type="range" className="settings-slider" min={1} max={3} step={0.25} disabled />

      <div className="settings-section-label">CHARACTER SPACING</div>
      <input type="range" className="settings-slider" min={-1} max={5} step={0.5} disabled />

      <div className="settings-section-label">WORD SPACING</div>
      <input type="range" className="settings-slider" min={0} max={10} step={1} disabled />

      <p style={{ color: "var(--text-muted)", fontSize: 9 }}>Coming soon</p>
    </div>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add src/components/SettingsMenu.tsx src/components/settings/
git commit -m "feat: add SettingsMenu with all sub-page components (theme, connectors, help, hotkeys, placeholders)"
```

---

## Task 7: Remove Legacy Appearance Panel & Lift State

**Files:**
- Modify: `src/components/LibraryView.tsx`
- Delete: `src/components/HelpPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Lift site login state from LibraryView to App.tsx**

Move the following from LibraryView.tsx to App.tsx:
- `siteLogins` state, `loginUrl` state, `loggingIn` state
- `refreshSiteLogins()` effect
- `handleSiteLogin` and `handleSiteLogout` handlers

Pass them as props to MenuFlap instead.

- [ ] **Step 2: Remove appearance panel from LibraryView.tsx**

Delete the `showAppearance` state (line 75), the toggle button in the header (around line 257-261), and the entire `{showAppearance && (...)}` block (lines 321-396).

Remove the theme cycle button (lines 254-256) — theme is now in settings flap.

Remove the help button (line 267) — help is now in settings flap.

- [ ] **Step 3: Delete HelpPanel.tsx**

```bash
git rm src/components/HelpPanel.tsx
```

Remove any imports of HelpPanel from other files.

- [ ] **Step 4: Verify app still works**

Run: `npm run dev`
Verify: Library view renders without appearance panel. MenuFlap opens with Tab. Settings → Theme shows accent/font options. Settings → Connectors shows login UI.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy appearance panel, lift site login state to App, delete HelpPanel"
```

---

## Task 8: URL-to-PDF Export

**Files:**
- Modify: `package.json` (add pdfkit)
- Modify: `main.js` (PDF generation, watcher exclusion, sync protection, lastReadAt update)

- [ ] **Step 1: Install pdfkit**

Run: `npm install pdfkit`

- [ ] **Step 2: Add PDF generation function to main.js**

Add near the top of main.js (after existing requires):

```javascript
const PDFDocument = require("pdfkit");
```

Add a new function (note: main.js is CommonJS, cannot import TS modules — utility logic is inlined here and separately tested via the TS version in tests):

```javascript
function sanitizeFilenameForPdf(name) {
  return (name || "")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

async function generateArticlePdf({ title, author, content, sourceUrl, fetchDate, outputDir }) {
  const safeName = sanitizeFilenameForPdf(title);

  const savedArticlesDir = path.join(outputDir, "Saved Articles");
  await fs.promises.mkdir(savedArticlesDir, { recursive: true });

  const pdfPath = path.join(savedArticlesDir, `${safeName}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      info: {
        Title: title,
        Author: author || "Unknown",
        Keywords: `source:${sourceUrl}`,
        CreationDate: fetchDate,
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        await fs.promises.writeFile(pdfPath, Buffer.concat(chunks));
        resolve(pdfPath);
      } catch (err) {
        reject(err);
      }
    });
    doc.on("error", reject);

    // Header
    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown(0.5);
    if (author) {
      doc.fontSize(11).fillColor("#666").text(`by ${author}`, { align: "center" });
      doc.moveDown(0.3);
    }
    doc.fontSize(9).fillColor("#999").text(sourceUrl, { align: "center", link: sourceUrl });
    doc.text(`Fetched: ${fetchDate.toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1.5);

    // Body
    doc.fontSize(11).fillColor("#333");
    const paragraphs = content.split(/\n\n+/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed) {
        doc.text(trimmed, { align: "left", lineGap: 4 });
        doc.moveDown(0.8);
      }
    }

    doc.end();
  });
}
```

- [ ] **Step 3: Integrate PDF generation into add-doc-from-url handler**

In the `add-doc-from-url` handler (around line 957-965), after the doc is created and added to the library, add:

```javascript
// Generate PDF if source folder is set (uses module-level `settings` and `getLibrary()`/`setLibrary()`/`saveLibrary()`)
if (settings.sourceFolder) {
  try {
    const pdfPath = await generateArticlePdf({
      title: newDoc.title,
      author: article.author || null,
      content: article.content,
      sourceUrl: url,
      fetchDate: new Date(),
      outputDir: settings.sourceFolder,
    });

    // Transition doc from url to folder source
    newDoc.source = "folder";
    newDoc.filepath = pdfPath;
    newDoc.filename = path.basename(pdfPath);
    newDoc.ext = ".pdf";
    delete newDoc.content;

    // Update in library
    const docs = getLibrary();
    setLibrary(docs.map((d) => (d.id === newDoc.id ? newDoc : d)));
    saveLibrary();
  } catch (err) {
    console.error("PDF generation failed, keeping URL-sourced doc:", err);
    logToFile(`PDF generation error: ${err.message}`);
  }
}
```

- [ ] **Step 4: Gate URL import on source folder**

In the `add-doc-from-url` handler, add at the start:

```javascript
if (!settings.sourceFolder) {
  return { error: "A source folder must be selected before importing from URLs." };
}
```

In `src/components/LibraryView.tsx`, disable the URL add button when no sourceFolder. Find the URL import button (around line 285-291) and add:

```tsx
<button
  className="btn"
  onClick={handleUrlAdd}
  disabled={!settings.sourceFolder}
  title={settings.sourceFolder ? "Import from URL" : "Select a source folder first"}
>
  {/* existing URL icon SVG */}
</button>
```

Also grey out the URL text input and show a tooltip when disabled.

- [ ] **Step 5: Add sync protection for Saved Articles docs**

Note: The Chokidar watcher uses `depth: 0` and `scanFolderAsync` does a flat `readdir` — both already ignore subdirectories like `Saved Articles/`. No watcher/scanner changes needed. The only required change is in `syncLibraryWithFolder` to prevent discarding transitioned docs.

In `syncLibraryWithFolder` (around line 264-266), replace the existing non-folder doc preservation:

```javascript
// BEFORE (line 264-266):
for (const doc of docs) {
  if (doc.source !== "folder") synced.push(doc);
}

// AFTER:
const savedArticlesPath = settings.sourceFolder
  ? path.join(path.resolve(settings.sourceFolder), "Saved Articles")
  : null;
for (const doc of docs) {
  if (doc.source !== "folder") {
    synced.push(doc);
  } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
    // Preserve folder-sourced docs in Saved Articles (transitioned from URL)
    synced.push(doc);
  }
}
```

- [ ] **Step 7: Add lastReadAt update when opening a doc**

This is handled in the renderer via `handleOpenDocById` (added in Task 4, Step 2). The `updateDoc` IPC call persists the `lastReadAt` timestamp to library.json via the main process. No additional main.js changes needed for this — the existing `update-doc` handler already saves arbitrary doc field updates.

- [ ] **Step 8: Run full test suite**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json main.js src/components/LibraryView.tsx src/App.tsx
git commit -m "feat: add URL-to-PDF export with pdfkit, Saved Articles exclusion, and lastReadAt tracking"
```

---

## Task 9: PDF Round-Trip Test

**Files:**
- Modify: `tests/pdf-export.test.js`

- [ ] **Step 1: Add round-trip test**

This test verifies that text written by pdfkit can be read back by pdf-parse. Add to `tests/pdf-export.test.js`:

```javascript
// pdfkit is added in Task 8; pdf-parse is already a project dependency
import PDFDocument from "pdfkit";
import pdfParse from "pdf-parse";

describe("PDF round-trip", () => {
  it("preserves text through pdfkit write → pdf-parse read", async () => {
    const testText = "This is paragraph one.\n\nThis is paragraph two with special chars: é, ñ, ü.";

    // Generate PDF in memory
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfReady = new Promise((resolve) => doc.on("end", resolve));

    doc.fontSize(11).text(testText);
    doc.end();
    await pdfReady;

    const pdfBuffer = Buffer.concat(chunks);

    // Read it back
    const parsed = await pdfParse(pdfBuffer);
    expect(parsed.text).toContain("This is paragraph one.");
    expect(parsed.text).toContain("This is paragraph two");
    expect(parsed.text).toContain("é");
    expect(parsed.text).toContain("ñ");
  });
});
```

- [ ] **Step 2: Run test**

Run: `npm test -- tests/pdf-export.test.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/pdf-export.test.js
git commit -m "test: add PDF round-trip test verifying pdfkit → pdf-parse text fidelity"
```

---

## Task 10: Update Roadmap & CLAUDE.md

**Files:**
- Modify: `ROADMAP.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add Phase 5 to ROADMAP.md**

Add the Phase 5 section from the spec to the end of ROADMAP.md (before "Execution Notes"). Also check off the Phase 1.5 rAF item.

- [ ] **Step 2: Update CLAUDE.md TypeScript note**

Replace "No TypeScript (yet) — plain JSX/JS" with:

```
TypeScript — .tsx/.ts files in renderer, CommonJS .js in main process
```

Update the component count from 13 to reflect the new total.

- [ ] **Step 3: Run full test suite one final time**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add ROADMAP.md CLAUDE.md
git commit -m "docs: add Phase 5 to roadmap, update CLAUDE.md for TypeScript reality"
```

---

## Task Summary

| # | Task | Estimated Steps | Dependencies |
|---|------|----------------|--------------|
| 1 | Schema Migrations & Type Updates | 10 | None |
| 2 | Pure Utility Functions | 8 | None |
| 3 | CSS Foundation | 2 | None |
| 4 | MenuFlap Shell Component | 5 | Tasks 1, 3 |
| 5 | Reading Queue Component | 3 | Tasks 2, 4 |
| 6 | Settings Menu & Sub-pages | 11 | Task 4 |
| 7 | Remove Legacy Appearance Panel | 6 | Task 6 |
| 8 | URL-to-PDF Export | 9 | Task 1 |
| 9 | PDF Round-Trip Test | 3 | Task 8 |
| 10 | Update Roadmap & CLAUDE.md | 4 | All |

**Parallelizable:** Tasks 1, 2, 3 can run concurrently. Tasks 4+5+6+7 are sequential. Task 8 can run in parallel with Tasks 4-7 (only depends on Task 1).
