# Blurby — Product Roadmap v2

**Created:** 2026-03-30
**Baseline:** v1.4.7 — 860 tests, 43 files. Narration pipeline complete (NAR-1 through NAR-5). 9 open bugs.
**Governing principle:** Stabilize first. Every phase builds on a verified foundation.

---

## Phase Overview

| Phase | Name | Goal | Depends On | Est. Sprints |
|-------|------|------|------------|-------------|
| **1** | **Stabilization** | Every existing feature works correctly | — | 6 (1A–1F) |
| **2** | **EPUB Conversion Pipeline** | Single canonical format, single rendering path | Phase 1 | 2–3 |
| **3** | **Flow Mode Redesign** | Infinite scroll reader with reading zone + WPM timer cursor | Phase 2 | 2 |
| **4** | **Blurby Readings** | Library evolution — TTS cache opt-in, reading queue, EPUB intake | Phases 2, 3 | 2–3 |
| **5** | **Read Later + Blurby News** | Chrome extension clip-to-library, RSS feeds (~12 sources), Read Now / Read Later | Phase 4 | 3–4 |
| **6** | **Cloud Sync Hardening** | Cross-device sync for settings, progress, queue, RSS state | Phase 4 | 2 |
| **7** | **APK Wrapper** | React Native shell with cloud sync bridge | Phase 6 | 4–6 |

```
Phase 1: Stabilization
    │
    ▼
Phase 2: EPUB Pipeline ──────────── foundation for all downstream
    │
    ├────────────────┐
    ▼                ▼
Phase 3:         Phase 4:
Flow Mode        Blurby Readings
Redesign         (queue, cache, intake)
    │                │
    └───────┬────────┘
            ▼
    Phase 5: Read Later + News
            │
            ▼
    Phase 6: Cloud Sync Hardening
            │
            ▼
    Phase 7: APK Wrapper
```

---

## Phase 1 — Stabilization

**Goal:** Every function as it currently exists is stable. No new features until the audit is clean.

**Process:** Full codebase audit (4-step structured review) → bug collection → targeted fix sprints → re-audit until clean.

**Scope:**
- Full manual click-through of all 4 reading modes (Page, Focus, Flow, Narrate)
- All library operations (import, delete, favorite, archive, sort, filter, search)
- All settings pages (8 sub-pages)
- Keyboard shortcuts (30+ bindings)
- Cloud sync (OneDrive + Google Drive)
- Chrome extension pairing
- TTS pipeline (Kokoro + Web Speech, all speed/voice/pause combinations)
- Installer, auto-updater, CI/CD pipeline

**Known open bugs to resolve:**

| Bug | Severity | Area | Description |
|-----|----------|------|-------------|
| BUG-031 | High | Reader UI | Bottom bar not visible in Focus/Flow modes |
| BUG-040 | High | Reader UI | Focus mode bottom bar visible but unclickable (z-index) |
| BUG-032 | Medium | TTS | Kokoro "App Not Responding" flash on first use |
| BUG-033 | Medium | Import | Book formatting stripped too aggressively |
| BUG-034 | Medium | Import | Images in books stripped during import |
| BUG-039 | Medium | UX | Space bar should start last-used reading mode |
| BUG-053 | Medium | UX | Arrow keys should adjust NM speed by 0.1 increments |
| BUG-054 | Medium | UX | Small/misaligned click areas in menu flap |
| BUG-063–066 | Low | Theme | Accent colors hardcoded, not using CSS custom properties |

**Audit-surfaced findings (CRITICAL + MAJOR) to resolve:**

| Finding | Severity | Area | Sprint |
|---------|----------|------|--------|
| MAIN-01: Broken EPUB IPC handler (`ctx.library` vs `ctx.getLibrary()`) | CRITICAL | Main process | 1A |
| MAIN-04: Sync state lost on cancellation (data loss) | CRITICAL | Main process | 1A |
| MAIN-12/BUG-103: Sync queue enqueue errors silently swallowed (4 sites) | CRITICAL | Main process | 1A |
| MAIN-02: TTS worker handler leak on timeout | CRITICAL | Main process | 1B |
| MAIN-03: Cache manifest errors silently swallowed | CRITICAL | Main process | 1B |
| REND-01: Stale closure in EPUB word extraction | CRITICAL | Renderer | 1C |
| REND-02: Background cacher missing kokoroVoice dep | CRITICAL | Renderer | 1C |
| REND-03: AudioScheduler source.onended leak | CRITICAL | Renderer | 1B |
| REND-04: Foliate progress state/ref divergence | CRITICAL | Renderer | 1C |
| MAIN-05: Path traversal in saved articles | MAJOR | Security | 1D |
| MAIN-06: Missing OAuth state parameter (RFC 6749/9700) | MAJOR | Security | 1D |
| MAIN-07: Pairing token stored plaintext | MAJOR | Security | 1D |
| MAIN-08: No TTS worker retry on crash | MAJOR | Reliability | 1B |
| MAIN-10: Synchronous mkdirSync (standing-rules violation) | MAJOR | Governance | 1A |
| MAIN-11: Library schema not validated post-migration | MAJOR | Validation | 1A |
| MAIN-18: Heartbeat interval stacking | MODERATE | Resource | 1B |
| REND-05–08: Narration null check, wordsRef clearing, foliate errors | MAJOR | Renderer | 1C |
| REND-06: Unbounded word boundaries array | MAJOR | Performance | 1B |
| TEST-03–05, TEST-12: Flaky test, console.debug, CI hardening | MAJOR | CI/Test | 1E |
| 19 MODERATE findings (MAIN-09,13–17,19–21; REND-09–16; TEST-07–09) | MODERATE | Various | 1F |

**Sprint plan:** 6 sprints (AUDIT-FIX-1A through 1F). Full specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md` §D.

**Exit criteria:** Zero CRITICAL findings open. Zero MAJOR findings open or explicitly deferred with written rationale. All MODERATE findings addressed or deferred with rationale. Re-audit (Step 3) passes with no new CRITICAL or MAJOR findings. `npm test` passes with 0 failures. `npm run build` succeeds. Documentation drift register has zero unresolved items. Sprint queue depth ≥ 3 with Phase 2 sprints spec'd.

---

## Phase 1.5 — Test Coverage (parallel with early Phase 2)

**Goal:** Address the three large test coverage gaps that both audits identified. Runs in parallel with Phase 2 — does not block the Phase 1 exit gate.

**Scope:**
- TEST-01: UI component tests (40+ untested components, starting with highest-risk: ReaderContainer, LibraryContainer, FoliatePageView)
- TEST-02: Cloud sync tests (sync-engine.js, auth.js, cloud-onedrive.js, cloud-google.js — zero tests today)
- TEST-06: Accessibility tests (WCAG 2.1 AA claimed but no automated verification)

**Estimated effort:** 2–3 sprints. Can be interleaved with Phase 2 work since they touch different files.

---

## Phase 2 — EPUB Conversion Pipeline

**Goal:** All incoming formats (PDF, MOBI, TXT, HTML, Markdown, DOCX) convert to EPUB on intake. EPUB becomes the single canonical internal format.

**Why before Flow Mode:** Flow Mode only has to support one rendering path (foliate/EPUB). Narration only extracts words from one format. The library only stores one format. De-risks everything downstream.

**Architecture:**
- New `main/epub-converter.js` pipeline (or extend existing)
- Format-specific converters: PDF→EPUB, MOBI→EPUB, TXT→EPUB, HTML→EPUB, MD→EPUB, DOCX→EPUB
- Preserve: chapter structure, headings, bold/italic, lists, images, tables where possible
- Store converted EPUB in user data dir alongside library.json metadata
- Original file preserved, EPUB is the working copy

**Resolves:** BUG-033 (formatting stripped), BUG-034 (images stripped), BUG-075 (intake pipeline), BUG-079 (universal EPUB)

**Key risks:** PDF conversion fidelity (layout-based vs. text-based PDFs). MOBI DRM edge cases. Image extraction and re-embedding.

**Exit criteria:** Import any supported format → EPUB generated → opens in foliate with formatting intact → narration extracts words correctly → all 4 reading modes work.

---

## Phase 3 — Flow Mode Redesign

**Goal:** Flow mode becomes an infinite scroll reader with a reading zone and WPM-timed cursor.

**UX spec:**

1. **Infinite scroll.** Content renders as a continuous vertical document (no page breaks). User scrolls freely when paused.

2. **Reading zone.** A 5-line band (at current zoom and window size) is visually distinguished — slightly lighter or darker than the default background. This is the focal area. Content above and below is visible but de-emphasized.

3. **Flow cursor.** Two options (user preference in settings):
   - **Highlight bar** — background color behind the current word/phrase
   - **Underline bar** — colored line beneath the current word/phrase

4. **WPM timer.** Whichever cursor style is selected, the bar **depletes from left to right** based on WPM speed — acting as a countdown timer for the current line. When the bar completes (reaches the right edge), the next line arrives in the reading zone.

5. **Line transitions.** When the timer completes for a line, the reading zone smoothly scrolls to center the next line. The transition is effortless — no jarring jumps, no flash. CSS `scroll-behavior: smooth` or a requestAnimationFrame-driven animation.

**Technical approach:**
- Replace `ScrollReaderView` with new infinite scroll renderer
- Reading zone implemented as a CSS overlay or background gradient on the active line range
- `FlowCursorController` rewritten to support the timer depletion animation
- Only targets foliate/EPUB rendering (Phase 2 ensures all content is EPUB)
- Narration integration unchanged — word index tracking already works independently of visual mode

**Files affected:** `src/modes/FlowMode.ts`, `src/utils/FlowCursorController.ts`, `src/styles/global.css`, `src/components/ScrollReaderView.tsx` (or replacement)

**Exit criteria:** Flow mode renders infinite scroll → reading zone visible → cursor depletes left-to-right at WPM → line transitions are smooth → works with all EPUB content → narration can play simultaneously.

---

## Phase 4 — Blurby Readings (Library Evolution)

**Goal:** The main library becomes a richer reading management system.

**Three components:**

### 4A. Per-Document TTS Cache Opt-In
- User chooses which documents to pre-cache for TTS (instead of caching all "Reading Now" books)
- Settings UI: per-doc toggle or "Cache for offline" button on library card
- Cache management: show cache size per doc, total cache size, clear individual caches
- Marathon worker respects opt-in: only caches documents the user has selected

### 4B. Reading Queue
- Ordered reading list separate from library sort order
- "Add to Queue" from library card context menu (already stubbed)
- Queue view: drag-to-reorder, remove, "Read Next" button
- Queue can include any library item: books, articles, saved news items
- Queue position syncs across devices (Phase 6)

### 4C. Document Intake via EPUB Pipeline
- All imports flow through Phase 2's EPUB conversion
- Import sources: local file, drag-and-drop, URL extraction, Chrome extension, RSS "Read Later"
- Each imported item is a permanent library artifact with full lifecycle (favorite, archive, delete)
- Metadata extraction: title, author, word count, estimated reading time

**Exit criteria:** User can opt-in/out of TTS cache per document. Queue is functional with drag-reorder. All import paths produce EPUB library items.

---

## Phase 5 — Read Later + Blurby News

**Goal:** Two new content sources feed into Blurby Readings.

### 5A. Read Later (Chrome Extension Enhancement)
- Existing Chrome extension (Sprint 22, WebSocket at port 48924) gains "Read Later" action
- User clicks extension icon → current page URL sent to Blurby → Readability extraction → stored as permanent EPUB library item
- Existing URL extractor (`main/url-extractor.js`) already handles Readability + PDF export
- New: conversion to EPUB (via Phase 2 pipeline) instead of plain text

### 5B. Blurby News (RSS Feed)
- New top-level section alongside Readings (navigation in menu flap)
- RSS/Atom/JSON Feed parsing for ~12 major news sources
- **Initial sources:** CNN, NYT, WSJ, Reddit, The Atlantic, Washington Post, Fox News, BBC, Reuters, AP News, NPR, The Guardian
- Feed item display: title, source, date, excerpt, thumbnail
- **Two actions per item:**
  - **Read Now** — opens article in-app via Readability extraction (temporary, not saved)
  - **Read Later** — pushes to Blurby Readings as permanent EPUB library item
- **Paywall handling:** If source is behind a paywall, surface paywall state clearly. Offer "Open in Browser" fallback. If user has authenticated session cookies, attempt extraction.
- Feed management: add/remove feeds, refresh intervals, unread counts
- Keyboard navigation: `G N` (go to News), `J/K` (next/prev item), `R` (read now), `L` (read later), `O` (open in browser)

**Exit criteria:** Chrome extension "Read Later" produces library items. RSS feeds load and display. "Read Now" opens articles. "Read Later" saves to library. Paywall state is surfaced.

---

## Phase 6 — Cloud Sync Hardening (Path A)

**Goal:** Cross-device sync covers all state introduced in Phases 1–5, using existing OneDrive/Google Drive infrastructure.

**Approach:** Enhanced cloud storage sync (Path A — no server). Expand what syncs, improve conflict resolution.

**State to sync:**

| State | Current | Target |
|-------|---------|--------|
| Library metadata | ✅ Syncs | Maintain |
| Document content | ✅ Syncs | Maintain |
| Reading position | ✅ Syncs (CFI) | Add timestamp for last-write-wins |
| Settings | ❌ Local only | Sync (theme, WPM, TTS voice, reading mode prefs) |
| Reading queue order | ❌ N/A | Sync (ordered list, last-write-wins with timestamp) |
| TTS cache opt-in flags | ❌ N/A | Sync (per-doc boolean) |
| RSS feed list | ❌ N/A | Sync (set-union merge) |
| RSS read/unread state | ❌ N/A | Sync (latest-wins per item) |
| Favorites/archive state | ✅ Syncs | Maintain |

**Conflict resolution upgrade:**
- Current: last-write-wins per document
- Target: last-write-wins per field (settings, queue order, read state each have independent timestamps)
- Queue ordering: vector clock or lamport timestamp to handle concurrent reorders

**Future consideration (Path B):** If APK proves product-market fit, migrate to a thin backend (Supabase/Firebase) for canonical state ownership, push notifications, and social features. Path A is the shippable now; Path B is the scale play.

**Exit criteria:** Settings sync across two desktops. Queue order syncs. RSS state syncs. No data loss on concurrent edits from two devices.

---

## Phase 7 — APK Wrapper

> **Prerequisite — Modularization (3P audit finding):** The current implementation is deeply coupled to Electron main-process facilities. The Kokoro worker uses Node-specific module resolution hacks (`main/tts-worker.js` L5–L37). Auth depends on Electron's BrowserWindow (`main/auth.js` L294–L304). Sync is main-process-driven. Without an explicit modularization sub-phase to extract a platform-independent core, the "shared" column below is aspirational. **Estimate: +2 sprints for modularization before APK wrapper work begins.** This phase should be treated as a separate productization program, not "the next step after sync hardening."

**Goal:** Android app that shares core reading experience with desktop, bridged by cloud sync.

**Approach:** React Native shell consuming shared logic. Cloud sync (Phase 6) is the bridge between desktop and mobile libraries. Requires modularization sub-phase first (see prerequisite above).

**Shared vs. platform-specific:**

| Layer | Shared (after modularization) | Platform-Specific |
|-------|-------------------------------|-------------------|
| Reading modes logic | ✅ | Gesture handling (touch vs. keyboard) |
| TTS pipeline | ✅ (Kokoro ONNX runs on mobile) | Audio session management, model loading |
| Library data model | ✅ | Storage paths, file picker |
| EPUB rendering | ✅ (foliate-js is web-based) | WebView wrapper |
| Cloud sync engine | Partial (logic shared, transport abstracted) | OAuth native flows, network layer |
| UI components | ❌ | React Native equivalents |

**Key risks:** Kokoro ONNX model size (~80MB) on mobile storage. ONNX Runtime performance on ARM. Battery impact of background TTS caching. Touch gesture mapping for all 4 reading modes. Modularization scope may be larger than estimated — Electron coupling runs deep.

**Exit criteria:** APK installs on Android. Opens EPUB via foliate. All 4 reading modes functional. Cloud sync loads desktop library. TTS plays via Kokoro.

---

## Appendix: Backlog Items by Phase Alignment

| Backlog ID | Description | Phase |
|------------|-------------|-------|
| BUG-031, BUG-040 | Bottom bar visibility/clickability | Phase 1 |
| BUG-032 | Kokoro ANR flash | Phase 1 |
| BUG-033, BUG-034 | Formatting/images stripped | Phase 2 |
| BUG-039 | Space bar mode behavior | Phase 1 |
| BUG-053 | Arrow key speed increment | Phase 1 |
| BUG-054 | Menu flap click areas | Phase 1 |
| BUG-063–066 | Theme accent hardcoding | Phase 1 |
| BUG-075/079 | Universal EPUB pipeline | Phase 2 |
| BUG-055–059 | Settings/command palette UX | Phase 4 |
| BUG-050 | 3-line library cards | Phase 4 |
| BUG-067 | "New" dot auto-clear | Phase 4 |
| BUG-069 | Paragraph jump shortcuts | Phase 3 |
| BUG-074, BUG-077 | Author normalization, metadata wizard | Phase 4 |
| BUG-078 | Reading queue | Phase 4 |
| BUG-037 | E-ink as display mode | Backlog |
| BUG-060–062 | Branding (icon, theme, sample prefix) | Backlog |
