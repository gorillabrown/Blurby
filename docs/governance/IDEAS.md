# Blurby — Ideas & Future Concepts

**Purpose:** A living document for ideas not yet roadmapped. Reviewed at sprint and phase pauses to decide what to include in the roadmap.

**Format:** Each idea has a title, brief description, potential impact (High/Medium/Low), and estimated effort (Small/Medium/Large).

**Last updated:** 2026-03-27

---

## Ideas

### [Category: Content & Formats]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 1 | Universal EPUB Pipeline | Convert all incoming formats (HTML, PDF, MOBI, DOCX, TXT, MD, RTF, FB2, KFX, PDB, DjVu) to EPUB on intake. Single rendering path via foliate-js. (BUG-079) | High | Large |
| 2 | Rich Content Preservation | Parse books to lightweight Markdown instead of plain text. Preserve lists, headers, bold/italic, tables, inline images. (BUG-033/034) | High | Large |
| 3 | Intake Pipeline + EPUB Normalization | Normalize all incoming formats to EPUB as internal canonical format. Preserves formatting, chapters, metadata, images. (BUG-075) | High | Large |
| 4 | Chapter Detection for Non-EPUB | Heuristic pattern matching for chapter headings in PDF, MOBI, TXT, HTML. Currently only EPUB NCX/nav TOC works. (BUG-035) | Medium | Medium |
| 5 | Auto-Generated TOC | Generate a TOC page at book start when no embedded TOC exists or when chapters are detected heuristically. (BUG-036) | Medium | Medium |
| 6 | OCR for Scanned PDFs | Use OCR (Tesseract or similar) to extract text from image-based/scanned PDFs that pdf-parse cannot read. | Medium | Large |
| 7 | RSS Library & Paywall Integration | Feed aggregation from authenticated sites, RSS Library UI, "Add to Blurby" import pipeline. (Sprint 25 roadmap) | High | Large |

### [Category: Reading Experience]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 8 | Space Bar Last-Used Mode | Space starts whichever reading mode the user last used (Focus, Flow, or Narration), persisted across sessions. (BUG-039) | Medium | Small |
| 9 | Arrow Key NM Speed Adjust | Up/Down arrows adjust TTS speech rate by 0.1 increments during Narration mode instead of WPM. (BUG-053) | Low | Small |
| 10 | Paragraph Jump Shortcuts | Shift+Left/Right jumps to paragraph boundaries in all reading modes. Requires paragraph detection in words array. (BUG-069) | Medium | Medium |
| 11 | Scroll Wheel Word Advance | Mouse scroll wheel advances/retreats one word at a time in reading modes instead of page scrolling. (BUG-070) | Low | Small |
| 12 | E-Ink as Independent Display Mode | Decouple e-ink from theme system. Users can use dark/light themes while keeping e-ink behavior (no animations, large touch targets, ghosting prevention). (BUG-037) | Medium | Medium |
| 13 | Voice Cloning for TTS | Allow users to clone their own voice or select from celebrity/author voices for a more personal narration experience. | Medium | Large |
| 14 | Reading Goal Tracking | Set daily/weekly/monthly reading goals (pages, minutes, books) with visual progress and notifications. | Medium | Medium |
| 15 | Daily Reading Streaks Gamification | Streak counters, badges, milestones, and gentle nudges to build a consistent reading habit. Integrate with existing stats. | Medium | Medium |
| 16 | Vocabulary Builder from Defined Words | Collect all words the user has looked up via "Define" into a vocabulary list with definitions, source context, and spaced repetition review. | Medium | Medium |
| 17 | Multi-Device Position Sync | Sync current reading position across devices in real-time via cloud sync so users can seamlessly switch between desktop and mobile. | High | Medium |

### [Category: Library & UX]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 18 | 3-Line Library Cards | Cards show Title, Author, and Book Data line (progress %, pages, time read/remaining). (BUG-050) | Medium | Small |
| 19 | "New" Dot Auto-Clear | New-item dot clears after card scrolls into viewport and user navigates away. IntersectionObserver + seenAt timestamp. (BUG-067) | Low | Small |
| 20 | Hotkey Coaching in Reader | Expand HotkeyCoach to show keyboard shortcut suggestions when users click reader buttons with the mouse. (BUG-038) | Low | Small |
| 21 | Metadata Wizard | Batch scan library to auto-derive Author, Title, Year from file metadata, filename parsing, and optional API enrichment. (BUG-077) | Medium | Medium |
| 22 | Reading Queue | Ordered reading list separate from library sort. Right-click "Add to Queue". (BUG-078) | Medium | Small |
| 23 | Author Name Normalization | Standardize all author names to "Last, First" format during import. Handle multi-word names, multiple authors. (BUG-074) | Low | Small |
| 24 | First-Run Library Folder Picker | Mandatory onboarding step where user selects library storage folder. Default suggestion, validation, migration for existing users. (BUG-076) | Medium | Small |
| 25 | Reading Speed Analytics Dashboard | Detailed charts showing WPM trends over time, reading speed by genre/format, session duration patterns, and improvement tracking. | Medium | Medium |
| 26 | Annotation Export to Notion/Obsidian | Export highlights, notes, and definitions to Notion, Obsidian, or other note-taking apps via their APIs or Markdown file format. | High | Medium |
| 27 | Reading Clubs / Social Features | Share reading lists, compare progress with friends, group discussions on chapters, social reading challenges. | Medium | Large |
| 28 | AI-Powered Book Recommendations | Suggest books based on reading history, genres, reading speed patterns, and content similarity using LLM or collaborative filtering. | Medium | Large |

### [Category: Settings & Command Palette]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 29 | Combine Settings into "Reading Layout" | Merge Text Size + Layout into single "Reading Layout" settings page. (BUG-055) | Low | Small |
| 30 | Library Layout Settings Page | Default sort, default view mode, card/list size (S/M/L), spacing (compact/cozy/roomy), list columns. (BUG-056/057) | Medium | Medium |
| 31 | Settings Pages in Ctrl+K | Add Library Layout and Reading Layout entries plus sub-entries to command palette. (BUG-058) | Low | Small |
| 32 | All Individual Settings in Ctrl+K | Every toggle, slider, dropdown across all settings pages searchable in command palette. (BUG-059) | Medium | Medium |

### [Category: Branding]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 33 | Remove "[Sample]" Prefix | Onboarding book title should be "Meditations" not "[Sample] Meditations — Marcus Aurelius". (BUG-060) | Low | Small |
| 34 | Blurby Icon Replaces Hamburger | Replace hamburger menu icon with Blurby brand icon (~24px, theme-aware). (BUG-061) | Low | Small |
| 35 | Blurby Brand Theme | New theme: white background, Highlight Blue (#CAE4FE) chrome, Accent Red (#E63946), Core Blue (#2E73FF) dividers. (BUG-062) | Low | Medium |

### [Category: Platform & Distribution]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 36 | Android App | React Native port with cloud sync. (Sprint 18C roadmap) | High | Large |
| 37 | Window Control Theme Matching | Minimize/maximize/close buttons adopt theme background color. Requires `titleBarStyle: "hidden"` or `titleBarOverlay` with color matching. (BUG-049) | Low | Small |
| 40 | Chromecast Integration | Cast narration audio and/or reading display to Chromecast devices. Play TTS through TV/speaker, show current text on screen. | Medium | Large |
| 41 | APK Wrapper | Package Blurby as an Android APK (e.g., via Capacitor, TWA, or WebView wrapper) for lightweight mobile distribution without a full React Native rewrite. | High | Medium |

### [Category: AI & Intelligence]

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| 38 | AI Summary Generation | Generate chapter or book summaries on demand using local or cloud LLM. | Medium | Large |
| 39 | Smart Reading Schedule | AI analyzes reading patterns and suggests optimal times and durations for reading sessions. | Low | Medium |
