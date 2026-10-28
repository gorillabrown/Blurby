# Blurby — Ideas & Future Concepts

**Purpose:** A living document for ideas not yet roadmapped. Reviewed at sprint and phase pauses to decide what to include in the roadmap. Ideas grouped by theme — each group maps to a potential future phase or sprint cluster.

**Last updated:** 2026-04-06

---

## Completed Ideas

| # | Idea | Completed In |
|---|------|-------------|
| ~~1~~ | ~~Universal EPUB Pipeline~~ | EPUB-2A + EPUB-2B (v1.5.1) |
| ~~2~~ | ~~Rich Content Preservation~~ | EPUB-2A (v1.5.0) |
| ~~3~~ | ~~Intake Pipeline + EPUB Normalization~~ | EPUB-2B (v1.5.1) |

---

## Active Ideas (Grouped by Theme)

### Theme A: Infinite Reader (Flow Mode Evolution)

> **Roadmap alignment:** New priority track — see ROADMAP.md "FLOW-INF" sprints.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| A1 | Reading Zone Enhancement | Visually distinct 5-line reading zone (lighter/darker band) with de-emphasized content above/below. Timer-bar cursor depletes left-to-right per line at WPM. | High | Medium |
| A2 | Cross-Book Continuous Reading | Finishing a book auto-loads next from reading queue — seamless transition, no return to library. | High | Medium |
| A3 | Paragraph Jump Shortcuts | Shift+Left/Right jumps to paragraph boundaries in all reading modes. Requires paragraph detection in words array. (BUG-069) | Medium | Medium |
| A4 | Scroll Wheel Word Advance | Mouse scroll wheel advances/retreats one word at a time in reading modes instead of page scrolling. (BUG-070) | Low | Small |

### Theme B: Chrome Extension & Web Capture

> **Roadmap alignment:** New priority track — see ROADMAP.md "EXT-ENR" sprints.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| B1 | Auto-Discovery Connection | Extension auto-discovers running Blurby app — no manual pairing code entry. App senses incoming connection attempt and surfaces pairing UI in library. | High | Medium |
| B2 | Resilient Connection | Connection survives sleep/wake, network changes, app restarts. Auto-reconnect with backoff. Health indicator in extension popup. | High | Medium |
| B3 | In-Browser RSVP Reader | Standalone speed-reader popup in Chrome extension (400x500px) with play/pause, WPM slider, reading queue. (Phase 9 spec §9.3) | Medium | Medium |
| B4 | RSS Library & Paywall Integration | Feed aggregation, RSS Library UI, "Add to Blurby" import pipeline. (Sprint 25 roadmap) | High | Large |

### Theme C: Android & Mobile

> **Roadmap alignment:** New priority track — see ROADMAP.md "APK" sprints.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| C1 | APK Wrapper (Sideload) | Package Blurby for Android sideloading — WebView/Capacitor approach, all reading modes, local library. | High | Medium |
| C2 | Bidirectional Position Sync | Current reading position syncs between desktop and mobile in real-time via cloud. (Idea #17) | High | Medium |
| C3 | Mobile Reading Addition | Add new readings from mobile — share sheet, file picker, in-app URL import. | High | Medium |
| C4 | Play Store Distribution | Full Play Store listing with AAB, auto-update, privacy policy. | Medium | Medium |
| C5 | Chromecast Integration | Cast narration audio and/or reading display to Chromecast devices. | Medium | Large |

### Theme D: Reading Intelligence & Goals

> **Roadmap alignment:** Parked — GOALS-6B spec'd in ROADMAP.md. Other items backlog.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| D1 | Reading Goal Tracking | Set daily/weekly/monthly reading goals (pages, minutes, books) with visual progress. (GOALS-6B — fully spec'd) | Medium | Medium |
| D2 | Daily Reading Streaks Gamification | Streak counters, badges, milestones, gentle nudges to build consistent habit. | Medium | Medium |
| D3 | Reading Speed Analytics Dashboard | WPM trends over time, reading speed by genre/format, session duration patterns. | Medium | Medium |
| D4 | AI-Powered Book Recommendations | Suggest books based on reading history, genres, speed patterns using LLM or collaborative filtering. | Medium | Large |
| D5 | Smart Reading Schedule | AI analyzes reading patterns and suggests optimal times/durations for sessions. | Low | Medium |

### Theme E: Content & Formats

> **Roadmap alignment:** Backlog — potential Phase 10+ work.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| E1 | Chapter Detection for Non-EPUB | Heuristic pattern matching for chapter headings in PDF, MOBI, TXT, HTML. (BUG-035) | Medium | Medium |
| E2 | Auto-Generated TOC | Generate TOC page at book start when no embedded TOC exists. (BUG-036) | Medium | Medium |
| E3 | OCR for Scanned PDFs | Tesseract or similar for image-based/scanned PDFs that pdf-parse cannot read. | Medium | Large |

### Theme F: Library & UX Polish

> **Roadmap alignment:** Backlog — incremental improvements, can be folded into any sprint.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| F1 | 3-Line Library Cards | Title, Author, Book Data line (progress %, pages, time). (BUG-050) | Medium | Small |
| F2 | "New" Dot Auto-Clear | Dot clears after card scrolls into viewport. IntersectionObserver + seenAt. (BUG-067) | Low | Small |
| F3 | Hotkey Coaching in Reader | HotkeyCoach shows shortcut suggestions on mouse clicks. (BUG-038) | Low | Small |
| F4 | Library Layout Settings Page | Default sort, view mode, card/list size, spacing, columns. (BUG-056/057) | Medium | Medium |
| F5 | Vocabulary Builder from Defined Words | Collect looked-up words into vocabulary list with definitions, context, spaced repetition. | Medium | Medium |
| F6 | Annotation Export to Notion/Obsidian | Export highlights, notes, definitions to external note-taking apps. | High | Medium |

### Theme G: Settings & Command Palette

> **Roadmap alignment:** Backlog — small incremental wins.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| G1 | Combine into "Reading Layout" | Merge Text Size + Layout into single settings page. (BUG-055) | Low | Small |
| G2 | Library Layout Settings Page | Default sort, view mode, size, spacing. (BUG-056/057) | Medium | Medium |
| G3 | Settings Pages in Ctrl+K | Add Library Layout and Reading Layout entries to command palette. (BUG-058) | Low | Small |
| G4 | All Individual Settings in Ctrl+K | Every toggle, slider, dropdown searchable in command palette. (BUG-059) | Medium | Medium |

### Theme H: Reading Experience Tweaks

> **Roadmap alignment:** Backlog — small improvements, can be bundled.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| H1 | Space Bar Last-Used Mode | Space starts whichever reading mode user last used, persisted across sessions. (BUG-039) | Medium | Small |
| H2 | Arrow Key NM Speed Adjust | Up/Down arrows adjust TTS rate by 0.1 increments during narration. (BUG-053) | Low | Small |
| H3 | Voice Cloning for TTS | Clone user's voice or select celebrity/author voices for personalized narration. | Medium | Large |
| H4 | AI Summary Generation | Generate chapter or book summaries on demand using local or cloud LLM. | Medium | Large |
| H5 | Spoken/Display Word Separation | Separate `spokenWords` from `displayWords` in the narration pipeline. Exclude punctuation-only display tokens from phoneme alignment input entirely; reconstruct cursor positions from a mapping layer. Cleaner than teaching the Kokoro alignment layer about zero-length display tokens. Revisit if NARR-TIMING sees frequent heuristic fallback from punctuation-heavy text. (Audit finding #5 from NARR-TIMING review.) | Medium | Medium |
| H6 | Silence-Aware Cursor Hold | Use `endTime` from NARR-TIMING word timestamps to detect inter-word pauses. Hold cursor visually still during silence gaps (between `word[i].endTime` and `word[i+1].startTime`) instead of interpolating through silence. Requires NARR-TIMING to ship first. Builds on the `endTime` contract defined in NARR-TIMING §5.3. (Audit finding #6 — scoped as future enhancement.) | High | Medium |

### Theme I: Branding & Visual Identity

> **Roadmap alignment:** Backlog — cosmetic, can ship anytime.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| I1 | Remove "[Sample]" Prefix | Onboarding book should be "Meditations" not "[Sample] Meditations". (BUG-060) | Low | Small |
| I2 | Blurby Icon Replaces Hamburger | Replace hamburger with Blurby brand icon (~24px, theme-aware). (BUG-061) | Low | Small |
| I3 | Blurby Brand Theme | White bg, Highlight Blue (#CAE4FE) chrome, Accent Red (#E63946). (BUG-062) | Low | Medium |
| I4 | Window Control Theme Matching | Min/max/close buttons adopt theme background color. (BUG-049) | Low | Small |

### Theme J: Social & Collaboration

> **Roadmap alignment:** Someday — requires server infrastructure.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| J1 | Reading Clubs / Social Features | Share reading lists, compare progress, group discussions, social challenges. | Medium | Large |

### Theme K: E-Ink Support

> **Roadmap alignment:** Parked — EINK-6A/6B fully spec'd in ROADMAP.md.

| # | Idea | Description | Impact | Effort |
|---|------|-------------|--------|--------|
| K1 | E-Ink as Independent Display Mode | Decouple e-ink from theme system. (EINK-6A — fully spec'd) | Medium | Medium |
| K2 | E-Ink Reading Ergonomics | Stepped flow, burst focus, adaptive refresh. (EINK-6B — fully spec'd) | Medium | Medium |
