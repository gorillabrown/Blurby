# Blurby — Development Roadmap

**Last updated**: 2026-03-30 — Post-NAR-5. 860 tests, 43 files. v1.4.7.
**Current branch**: `main`
**Current state**: All sprints through NAR-5 complete. 860 tests, 43 files. Version: v1.4.7.

> **Navigation:** Forward-looking sprints below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`.

---

## Sprint Status

| Sprint | Version | Status | Summary |
|--------|---------|--------|---------|
| **TH-1: Narration Test Hardening** | — | ✅ DONE | 88 new tests (6 files + modes.test.ts expansion). 776 tests / 38 files total. |
| **CT-2: Test Harness Hardening** | — | ✅ DONE | Fixed 33 SKIPs + 5 FAILs. Rich seed data, sessionStorage, 5 bug fixes. |
| **Click-through re-run** | — | ✅ DONE | 121-item test: 101 PASS / 6 FAIL / 14 SKIP. Report: `docs/testing/test-run-CT3-2026-03-28.md` |
| **CT-3: Click-through Repair** | — | ✅ DONE | KB checklist aligned (124 items), Ctrl+, documented as browser limitation, Focus stability (opacity-only animation, no forced reflow), deleteDoc stub. |
| **Sprint 24: External Audit** | — | ✅ DONE | 58 findings (3C/24H/21M/10L). Findings: `docs/project/AGENT_FINDINGS.md`. |
| **Sprint 24R: CRIT Remediation** | v0.9.1 | ✅ DONE | CRIT-1 fixed (path validation on read-file-buffer). CRIT-2/3 dismissed. |
| **Sprint KB-1: Keyboard Navigation Remap** | v0.10.0 | ✅ DONE | Ctrl=word/sentence, Shift=paragraph/chapter. 15 new tests. 791 total. |
| **Sprint TTS-1: Narration Correctness** | v1.0.9 | ✅ DONE | 15 TTS fixes: dual-write rule, worker recovery, audioPlayer guards. 796 tests. |
| **v1.0.0 RELEASE** | v1.0.0 | ✅ DONE | Tagged + shipped. CI release pipeline active. |
| **Sprint TTS-2: TTS Documentation** | — | ✅ DONE | Privacy data-flow, SSML stance, safety posture, TTS glossary. ~560 words in TECHNICAL_REFERENCE.md. |
| **Sprint NAR-1: Narration Pipeline Overhaul** | — | ✅ DONE | Rolling audio queue, smart pause heuristics, 841 tests / 41 files. |
| **Sprint PKG-1: Installer & Update Overhaul** | v1.1.0 | ✅ DONE | ~999KB stub installer (nsis-web), silent updates, split CI (x64+arm64). |
| **Sprint HOTFIX-3: Reader Geometry & TOC** | v1.1.1 | ✅ DONE | ResizeObserver reflow, TOC depth flattening, proportional chapter time. |
| **Sprint UX-1: Theme, Layout & TTS Settings** | v1.2.0 | ✅ DONE | Blurby theme default (pure white), column layout, TTS settings page, pause sliders, doc time fix. |
| **Sprint NAR-2: TTS Pipeline Redesign** | v1.2.0 | ✅ DONE | Phase 1: Geometric ramp-up, pre-scheduled playback, crossfade, word timer, PCM disk cache, hybrid speed (1.5x cap). 860 tests / 43 files. |
| **Sprint NAR-3: Foliate Inversion** | v1.3.0 | ✅ DONE | Phase 2: Full-book word extraction, narration-drives-foliate page advancement, seamless chapter-boundary transitions. |
| **Sprint NAR-4: Library-Wide Caching** | v1.4.0 | ✅ DONE | Phase 3: Opus compression (opusscript), background caching all Reading Now books, cache indicators, settings toggle, LRU eviction. |
| **HOTFIX-5: Word Timer Race** | v1.4.1 | ✅ DONE | playbackStartTime gate, single-boundary-per-tick, goToSection throttle. |
| **HOTFIX-6: EPUB Word Extraction** | v1.4.2 | ✅ DONE | Move word extraction to main process (AdmZip + cheerio + Intl.Segmenter). Fix NAR-3 page flipping. |
| **HOTFIX-7: Stale onended Race** | v1.4.3 | ✅ DONE | Epoch counter in audioScheduler, guard section-end callback. Addressed stale events but loop persists. |
| **HOTFIX-8: Pipeline-Aware onEnd** | v1.4.4 | ✅ DONE | Add pipelineDone flag to scheduler. Restore dual-condition onEnd (no sources + pipeline done). |
| **HOTFIX-9: Native Speed Generation** | v1.4.5 | ✅ DONE | Generate at actual speed (no playbackRate pitch distortion), fix cursor desync, fix updateWords audio overlap. |
| **HOTFIX-10: Global Index Alignment** | v1.4.6 | ✅ DONE | Fix global vs local word index mismatch between narration pipeline and foliate DOM after HOTFIX-6 extraction. |
| **NAR-5: Eager Pre-Generation & Ramp-Up Fix** | v1.4.7 | ✅ DONE | Dual-worker architecture, background caching on book open, cache alignment fix, doubling ramp-up. |
| **Sprint 25: RSS Library** | v1.5.0 | 📋 POST-V1 | Feed aggregation from authenticated sites, RSS Library UI, cloud sync. |
| **Sprint 18C: Android APK** | — | 📋 POST-V1 | React Native port with cloud sync. |

**Legend:** 🔶 = fully spec'd, ready for dispatch | 📋 = spec'd, needs agent assignments | ⬜ = gate/milestone

---

> **Archived sprints (NAR-2 through NAR-5):** Full specs moved to `docs/project/ROADMAP_ARCHIVE.md`.

---

## Feature Backlog

Items migrated from BUG_REPORT.md — feature requests, enhancements, and architecture changes (not bugs). Grouped by sprint/theme.

### Content Pipeline & Format (Sprints 27, 29)

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-035 | Chapter detection for non-EPUB | 29 | Heuristic pattern matching for chapter headings in PDF, MOBI, TXT, HTML. Currently only EPUB NCX/nav TOC works. |
| BUG-036 | Auto-generated TOC | 29 | Generate a TOC page at book start when no embedded TOC exists or when chapters are detected heuristically. |
| BUG-033/034 | Rich content preservation | 27 | Related: formatting and images stripped during import. EPUB pipeline would preserve structure. |
| BUG-075 | Intake pipeline + EPUB normalization | 27 | Normalize all incoming formats to EPUB as internal canonical format. Preserves formatting, chapters, metadata, images. |
| BUG-079 | Universal EPUB Pipeline | 27 | Convert HTML/PDF/MOBI/DOCX/TXT/MD/RTF/FB2/KFX/PDB/DjVu to EPUB on intake. Single rendering path via foliate-js. |

### Metadata & Library (Sprint 29)

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-074 | Author name normalization | 29 | Standardize all author names to "Last, First" format during import. Handle multi-word names, multiple authors. |
| BUG-077 | Metadata Wizard | 29 | Batch scan library to auto-derive Author, Title, Year from file metadata, filename parsing, and optional API enrichment. |
| BUG-078 | Reading Queue | 29 | Ordered reading list separate from library sort. Right-click "Add to Queue". Already stubbed in context menu. |
| BUG-076 | First-run library folder picker | 29 | Mandatory onboarding step where user selects library storage folder. Default suggestion, validation, migration for existing users. |

### Settings & Command Palette UX

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-055 | Combine settings into "Reading Layout" | Backlog | Merge Text Size + Layout into single "Reading Layout" settings page. |
| BUG-056 | New "Library Layout" settings page | Backlog | Default sort, default view mode, card/list size (S/M/L), spacing (compact/cozy/roomy), list columns. |
| BUG-057 | Library Layout CSS implementation | Backlog | CSS grid rules for card sizes, spacing values, default sort/layout application on load. |
| BUG-058 | Settings pages in Ctrl+K | Backlog | Add Library Layout and Reading Layout entries plus sub-entries to command palette. |
| BUG-059 | All individual settings in Ctrl+K | Backlog | Every toggle, slider, dropdown across all settings pages searchable in command palette. |

### Library & Reader UX

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-050 | 3-line library cards | Backlog | Cards show Title, Author, and Book Data line (progress %, pages, time read/remaining). |
| BUG-067 | "New" dot auto-clear | Backlog | New-item dot clears after card scrolls into viewport and user navigates away. IntersectionObserver + seenAt timestamp. |
| BUG-038 | Hotkey coaching in reader | Backlog | Expand HotkeyCoach to show keyboard shortcut suggestions when users click reader buttons with the mouse. |
| BUG-069 | Paragraph jump shortcuts | Backlog | Shift+Left/Right jumps to paragraph boundaries in all reading modes. Requires paragraph detection in words array. |
| BUG-070 | Scroll wheel word advance | Backlog | Mouse scroll wheel advances/retreats one word at a time in reading modes instead of page scrolling. |

### E-Ink (Sprint 30)

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-037 | E-ink as display mode | 30 | Decouple e-ink from theme system. Users can use dark/light themes while keeping e-ink behavior (no animations, large touch targets, ghosting prevention). |

### Branding

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-060 | Remove "[Sample]" prefix | Backlog | Onboarding book title should be "Meditations" not "[Sample] Meditations — Marcus Aurelius". |
| BUG-061 | Blurby icon replaces hamburger | Backlog | Replace hamburger menu icon with Blurby brand icon (~24px, theme-aware). |
| BUG-062 | Blurby brand theme | Backlog | New theme: white background, Highlight Blue (#CAE4FE) chrome, Accent Red (#E63946), Core Blue (#2E73FF) dividers. |

---

## Sprint 25: RSS Library + Paywall Site Integration

**Goal:** Post-v1 feature. Feed aggregation from authenticated paywall sites, RSS Library UI, "Add to Blurby" import pipeline.

**Prerequisite:** v1.0.0 released (Sprint 24 audit passed).

**Branch:** `sprint/25-rss-library` | **Tier:** Full (new feature)

### Spec

**25A. Feed discovery and management** — Data model (`Feed` object), auto-discover from URL imports, manual add, auto-detect RSS from site URLs, `feeds.json` persistence, CRUD operations. New `main/feed-manager.js` + IPC channels.

**25B. Feed item fetching and caching** — RSS 2.0/Atom 1.0/JSON Feed parsing, authenticated fetch via stored cookies, dedup by URL, 200-item retention cap, `feed-items.json` cache. New `main/feed-parser.js`.

**25C. RSS Library UI** — "Feeds" nav in menu flap, left sidebar with feed list + unread counts, feed item cards (title, author, date, excerpt, thumbnail), "Add to Blurby" (→ Readability import), "Open in Browser", "Mark Read". Keyboard: `G F`, `J/K`, `A`, `O`, `M`.

**25D. Cloud sync for feeds** — Feed list syncs (set-union merge), read/imported states sync (latest-wins), items re-fetched per device.

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Feed engine (25A) | `electron-fixer` | — |
| 2 | Feed parser (25B) | `format-parser` | Step 1 |
| 3 | RSS Library UI (25C) | `renderer-fixer` | Step 2 |
| 4 | Feed cloud sync (25D) | `electron-fixer` | Steps 1-2 |
| 5 | Spec compliance review | `spec-reviewer` | Steps 1-4 |
| 6 | Test suite + build | `test-runner` | Step 5 |

### Acceptance Criteria
- Feeds addable by URL (manual) and auto-discovered from site URLs
- RSS 2.0, Atom 1.0, JSON Feed parse correctly
- Authenticated feeds use stored cookies
- Items deduped by URL, max 200/feed
- "Feeds" nav in menu flap, full keyboard support
- "Add to Blurby" imports via Readability pipeline
- Feed list syncs across devices (set-union), read states sync (latest-wins)
- `npm test` passes, `npm run build` succeeds

---

## Execution Order

```
Sprints 1-23 + 25S + TD-1/2 + CT-1 + TH-1 ── COMPLETED
    │
    │   776 tests, 38 files. Core app complete.
    │
    ▼
Sprint CT-2:                               ◄── NEXT
Test Harness Hardening
(rich seed data, persistence, 5 bug fixes)
    │
    ▼
Click-through re-run ────────────── GATE (manual)
    │
    ├──────────────────────────────────┐
    ▼                                  ▼
Sprint CT-3:                       Sprint 24:
Click-through Repair               External Audit
(fix all FAILs)                    (read-only quality gate)
    │                                  │
    └──────────────┬───────────────────┘
                   ▼
         v1.0.0 RELEASE ────────── GATE
                   │
    ├──────────────┴──────────────────┐
    ▼                                  ▼
Sprint 25:                         Sprint 18C:
RSS Library +                      Android APK
Paywall Integration                (React Native)
(POST-V1)                          (POST-V1)
```

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support (multiple reader windows simultaneously)
- Import/export (backup library, stats to CSV)
- Symlink path traversal protection in folder scanner
- requestAnimationFrame migration for all remaining setInterval timers
- Streaming ZIP parsing for large EPUBs (replace AdmZip full-memory load)
- Time-window stats archival (keep last year, archive older sessions)
- Toast queue system (replace setTimeout-based toast dismissal)
- Reading queue sort by remaining words (prioritize closest to completion)
- Version-pin critical dependencies (pdf-parse, adm-zip, readability)
- Unload lazy-loaded modules after use if memory pressure detected
- iOS app (port Track C to iOS via React Native — same codebase)
- Firefox extension (port Track B to Firefox Manifest V3)
- Safari extension (port Track B via Safari Web Extensions API)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
