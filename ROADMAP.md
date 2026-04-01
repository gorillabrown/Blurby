# Blurby — Development Roadmap

**Last updated**: 2026-04-01 — Post-EPUB-2A. 881 tests, 45 files. v1.5.0.
**Current branch**: `main`
**Current state**: Phase 2 in progress. EPUB-2A complete (content fidelity). EPUB-2B next (pipeline completion).
**Governing roadmap**: `docs/project/ROADMAP_V2.md` (7-phase product roadmap)

> **Navigation:** Forward-looking sprint specs below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`. Phase 1 fix specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md`.

---

## Execution Order

```
Phase 1: Stabilization (AUDIT-FIX 1A–1F) ── COMPLETE (v1.4.14)
    │
    ▼
Phase 1 Exit Gate (Step 3 re-audit) ── PASS (2026-04-01)
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 2:                  Phase 1.5:
EPUB Content Fidelity     Test Coverage
(✅ EPUB-2A → EPUB-2B)   (parallel, non-blocking)
    │
    ▼
Phase 3: Flow Mode Redesign
    │
    ▼
Phase 4: Blurby Readings
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 5:                  Phase 6:
Read Later + News         Cloud Sync Hardening
    │                        │
    └────────────┬───────────┘
                 ▼
Phase 7: APK Wrapper (+2 modularization sprints)
```

---

## Phase 2 — EPUB Content Fidelity

**Goal:** The existing EPUB converter preserves formatting, images, and structure from all source formats. EPUB becomes the true single canonical internal format with no legacy text fallback.

**Baseline:** `main/epub-converter.js` (769 lines) already converts TXT, MD, HTML, PDF, MOBI/AZW → EPUB. The import pipeline (`main/ipc/library.js`) routes all non-EPUB files through `convertToEpub()`. Foliate renders EPUBs. Legacy text fallback path (`main/legacy-parsers.js`) remains as dead-end for failed conversions.

**Gaps addressed:**
- BUG-033: Book formatting stripped too aggressively (bold, italic, lists, headings lost)
- BUG-034: Images in books stripped during import (not extracted or embedded)
- BUG-075/079: EPUB pipeline completion (DOCX support, URL→EPUB, single rendering path)

---

### Sprint EPUB-2A: Content Fidelity ✅ COMPLETED (v1.5.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-033/034 resolved. 18 new tests. APPROVED_WITH_CONCERNS (PDF bold/italic and image extraction limited by pdf-parse).

---

### Sprint EPUB-2B: Pipeline Completion — URL→EPUB, Legacy Removal

**Version:** v1.5.1 | **Branch:** `sprint/epub-2b-pipeline` | **Tier:** Full (architecture change)

**Goal:** URL-imported articles produce EPUB (not PDF). Legacy text renderer eliminated. Every document in the library renders through foliate-js via EPUB. Single canonical format, single rendering path.

**Findings addressed:** BUG-075 (intake pipeline completion), BUG-079 (universal EPUB)

#### Tasks

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | **URL→EPUB conversion** — Modify `main/url-extractor.js` to pipe extracted article HTML through `htmlToEpub()` instead of generating PDF via pdfkit. Article metadata (title, author, date, source URL) goes into EPUB OPF metadata. Cover image (og:image) embedded if available. | electron-fixer | sonnet |
| 2 | **Chrome extension articles → EPUB** — Articles sent via WebSocket from Chrome extension now produce EPUB library items. Update `main/ws-server.js` article save handler to use `convertToEpub()` instead of writing `.txt`. | electron-fixer | sonnet |
| 3 | **Legacy migration** — Add one-time migration in `main/migrations.js`: for each library doc with `legacyRenderer: true` or missing `convertedEpubPath` (and not a native EPUB), attempt re-conversion via `convertToEpub()`. Log failures but don't block. Clear `legacyRenderer` flag on success. | electron-fixer | opus |
| 4 | **Deprecate legacy-parsers.js text path** — Update `load-doc-content` IPC handler: if doc has no EPUB path and no `convertedEpubPath`, attempt conversion on-demand (lazy migration). Remove the `extractContent()` text extraction path for rendering (keep only for word count calculation during import if needed). | electron-fixer | sonnet |
| 5 | **Remove legacy text renderer fallback** — In `ReaderContainer.tsx`, remove the FlowText/plain-text rendering path. All documents go through `FoliatePageView`. If a document has no EPUB, show an error toast ("This document needs to be re-imported") instead of falling back to text rendering. | renderer-fixer | sonnet |
| 6 | **Update URL import document record** — `source: "url"` documents get `ext: ".epub"`, `convertedEpubPath`, and `originalFilepath` (pointing to the source URL metadata). Remove `content` field (in-memory text) from URL imports. | electron-fixer | sonnet |
| 7 | **Tests** — ≥10 new tests: URL article → EPUB conversion, Chrome extension article → EPUB, legacy migration, on-demand lazy conversion, FoliatePageView-only rendering verification. | test-runner | sonnet |
| 8 | **Run `npm test` + `npm run build`** | test-runner | haiku |
| 9 | **Spec-compliance review** — Verify every SUCCESS CRITERIA item below is met. Cross-reference dispatch spec line-by-line. Flag any drift, missing items, or partial implementations before proceeding. | spec-reviewer | sonnet |
| 10 | **Doc-keeper pass** — Update CLAUDE.md (version→v1.5.1, test count, sprint history, remove legacy-parsers from architecture section, update feature status). Update SPRINT_QUEUE.md (mark 2B complete, update queue status, backfill ≥3 with Phase 3 specs). Update ROADMAP.md (mark 2B done, verify Phase 2 exit gate). Update LESSONS_LEARNED.md if non-trivial discovery. Update BUG_REPORT.md (mark BUG-075/079 resolved). Update TECHNICAL_REFERENCE.md (remove legacy text renderer from architecture). | doc-keeper | sonnet |
| 11 | **Git: branch, commit, merge, push** | blurby-lead | — |

#### WHERE (Read in This Order)

1. `CLAUDE.md` — standing rules
2. `docs/governance/LESSONS_LEARNED.md`
3. `main/url-extractor.js` — full file (703 lines). Focus on `generateArticlePdf()`, `extractArticleFromHtml()`
4. `main/ws-server.js` — article save handler (~lines 264-270)
5. `main/ipc/documents.js` — `load-doc-content` handler
6. `main/legacy-parsers.js` — understand what gets removed
7. `main/migrations.js` — migration framework, existing patterns
8. `src/components/ReaderContainer.tsx` — text rendering fallback path
9. `main/epub-converter.js` — `htmlToEpub()` (reused for URL articles)

#### SUCCESS CRITERIA

- [ ] URL articles imported as EPUB (not PDF) — `doc.ext === ".epub"`, `doc.convertedEpubPath` set
- [ ] Chrome extension "Send to Blurby" produces EPUB library items
- [ ] Article metadata (title, author, date, source URL) in EPUB OPF
- [ ] One-time migration converts legacy docs to EPUB where possible
- [ ] `load-doc-content` no longer returns plain text for rendering — EPUB path or error
- [ ] `ReaderContainer.tsx` has no FlowText/plain-text rendering path
- [ ] All documents render through FoliatePageView
- [ ] ≥10 new tests, all passing
- [ ] `npm test` passes (888+ tests), `npm run build` succeeds
- [ ] Branch `sprint/epub-2b-pipeline` merged to main

---

## Phase 2 Exit Gate

Phase 2 is complete when:
1. Import any supported format → EPUB generated → opens in foliate with formatting intact
2. URL articles → EPUB (not PDF)
3. Narration extracts words correctly from converted EPUBs
4. All 4 reading modes work on converted content
5. No legacy text rendering path remains
6. `npm test` passes, `npm run build` succeeds
7. Sprint Queue depth ≥3 with Phase 3 spec'd

---

## Sprint Status

| Sprint | Version | Status | Summary |
|--------|---------|--------|---------|
| Phase 1 (AUDIT-FIX 1A-1F) | v1.4.9–v1.4.14 | ✅ DONE | 42 audit findings addressed. 7 CRITICAL, 8+ MAJOR, 6 MODERATE fixed. 9 MODERATE deferred. |
| HOTFIX-11 | v1.4.8 | ✅ DONE | ONNX worker thread crash patch. 863 tests / 44 files. |
| NAR-5 + prior | v1.4.7 | ✅ DONE | Narration pipeline complete. See `docs/project/ROADMAP_ARCHIVE.md`. |

**Full sprint history:** `docs/project/ROADMAP_ARCHIVE.md`

---

## Feature Backlog

Items migrated from BUG_REPORT.md — feature requests, enhancements, and architecture changes (not bugs). Grouped by phase alignment per ROADMAP_V2.

### Phase 3: Flow Mode Redesign
| ID | Feature | Description |
|----|---------|-------------|
| BUG-069 | Paragraph jump shortcuts | Shift+Left/Right jumps to paragraph boundaries |

### Phase 4: Blurby Readings
| ID | Feature | Description |
|----|---------|-------------|
| BUG-078 | Reading Queue | Ordered reading list, drag-to-reorder |
| BUG-050 | 3-line library cards | Title, Author, Book Data (progress %, pages, time) |
| BUG-067 | "New" dot auto-clear | IntersectionObserver + seenAt timestamp |
| BUG-074 | Author name normalization | Standardize to "Last, First" format |
| BUG-077 | Metadata Wizard | Batch metadata enrichment |
| BUG-076 | First-run library folder picker | Mandatory onboarding step |

### Phase 5: Read Later + Blurby News
| ID | Feature | Description |
|----|---------|-------------|
| BUG-055–059 | Settings/command palette UX | Combined settings pages, Ctrl+K searchable settings |

### Backlog (Unphased)
| ID | Feature | Description |
|----|---------|-------------|
| BUG-037 | E-ink as display mode | Decouple from theme system |
| BUG-060–062 | Branding | Icon, theme, sample prefix |
| BUG-070 | Scroll wheel word advance | Mouse wheel = word advance in reading modes |
| BUG-038 | Hotkey coaching in reader | Keyboard shortcut suggestions on mouse click |

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support
- Import/export (backup library, stats to CSV)
- Streaming ZIP parsing for large EPUBs
- Time-window stats archival
- Toast queue system
- Version-pin critical dependencies
- iOS app, Firefox extension, Safari extension
