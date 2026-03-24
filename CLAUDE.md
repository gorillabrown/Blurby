# Blurby — Claude Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (CLAUDE.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review CLAUDE.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Claude Code, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., focus reading (ReaderView), flow reading (ScrollReaderView), page reading (PageReaderView), bottom bar (ReaderBottomBar), word index (wordIndex), etc.
5. **Roadmap must spec out at least three sprints in advance** — current + two future sprints fully articulated with acceptance criteria.
6. **Aggressively parallelize.** Look for work that Cowork and Claude Code CLI can do simultaneously. Independent tasks run in parallel. Dependent tasks are sequenced. **We cannot waste a second.**
7. **CLAUDE.md stays under ~20k chars.** When approaching threshold, archive completed sprint details to `docs/project/CLAUDE_md_archive_sessionN.md`.
8. **Always print CLI-formatted sprint dispatches.** When dispatching work to Claude Code CLI, produce a compact, ready-to-paste prompt using the **Sprint Dispatch Template** in `.claude/agents/blurby-lead.md`. Dispatches are POINTERS not PAYLOADS — reference the Roadmap section for full spec, don't duplicate it.

---

## Division of Labor

### Cowork (you) — Planning & Oversight

You are the **architect and reviewer**. You do NOT write or change code unless the user directly asks you to. Your job:

1. **Brainstorm and design** — Collaborate with the user on features, architecture, UX, and priorities.
2. **Plan work for Claude Code** — Write fully articulated implementation specs with step-by-step directions, agent assignments, and acceptance criteria. Place these in `ROADMAP.md`.
3. **Review results** — After Claude Code agents run, verify every change against spec. Identify drift, gaps, regressions.
4. **Maintain documentation** — Keep CLAUDE.md, ROADMAP.md, and LESSONS_LEARNED.md current (or direct doc-keeper to do it).
5. **Interpret test results** — Analyze test output, decide next steps for failures.
6. **Triage findings** — Review AGENT_FINDINGS.md, group issues, set priorities.

### Claude Code CLI — All Execution

| Agent | Model | Role |
|-------|-------|------|
| `blurby-lead` | opus | Orchestrates multi-agent sprints, reads roadmap, dispatches sub-agents |
| `ui-investigator` | opus | Deep root-cause analysis of rendering bugs, state issues, cross-component problems. Read-only. |
| `electron-fixer` | sonnet | Main process fixes — IPC handlers, file I/O, data persistence, Electron APIs |
| `renderer-fixer` | sonnet | React component fixes — state, props, hooks, CSS, rendering |
| `perf-auditor` | sonnet | Performance profiling, React re-render analysis, bundle size, startup time |
| `test-runner` | haiku | Vitest execution, regression detection, build verification |
| `format-parser` | sonnet | File format integration — EPUB, MOBI, PDF, HTML parsing and extraction |
| `ux-reviewer` | opus | Comprehensive UX audit on app screenshots/flows. Read-only. |
| `code-reviewer` | sonnet | Architecture compliance, known-trap detection, code quality |
| `spec-reviewer` | sonnet | Spec-compliance verification — does implementation match ROADMAP acceptance criteria exactly? |
| `doc-keeper` | sonnet | Updates all documentation files |

### Standing Rules

- **Branch-per-sprint.** One branch per sprint dispatch (`sprint/<N>-<name>`). Never commit directly to main. Merge with `--no-ff` after tests pass. Delete branch after merge.
- **OneDrive-first development.** Working directory on OneDrive for cross-machine access. Push to GitHub when sprints complete.
- **Electron main process stays CommonJS.** Renderer stays ESM/TypeScript. Never cross the boundary.
- **All file I/O in main process modules must be async** (fs.promises). No synchronous reads/writes.
- **preload.js is the security boundary.** Keep it minimal. All system access goes through IPC.
- **LESSONS_LEARNED is a required engineering artifact.** Update immediately on non-trivial discovery.
- **After any engine change → test-runner before proceeding.** `npm test` must pass.
- **After any UI change → build verification.** `npm run build` must succeed.
- **Haiku for lightweight, Sonnet for focused, Opus only for cross-system reasoning.**
- **Parallelize independent work. Sequence dependent work.**
- **CSS custom properties for theming.** No inline styles. All styles in `src/styles/global.css`.
- **Never import Node.js modules in renderer code.** All system access through IPC via `window.electronAPI`.
- Folder-sourced docs don't store content in library.json — loaded on-demand via `load-doc-content` IPC.

### Pike's 5 Rules of Programming (Engineering Axioms)

1. **Don't guess where the bottleneck is.** Measure first.
2. **Don't tune for speed until measured.**
3. **Fancy algorithms are slow when n is small.** Keep it simple.
4. **Simple algorithms, simple data structures.**
5. **Data dominates.** Right data structures → self-evident algorithms.

### Test & Build Policy (Tiered)

| Tier | Run | Use When |
|------|-----|----------|
| **Full** | `npm test` + `npm run build` + manual smoke test | New features, architecture changes, format parsers |
| **Quick** | `npm test` only | Targeted bug fix, single-component change |
| **None** | Skip | Docs-only, CSS-only cosmetic, roadmap/planning |

---

## Key References

- **Project Constitution**: `docs/project/Blurby_Project_Constitution.md`
- **Lessons Learned**: `docs/project/LESSONS_LEARNED.md`
- **Sprint Dispatch Template**: `.workflow/docs/sprint-dispatch-template.md` (CLI Evergreen format)
- **Sprint Queue**: `docs/project/sprint-queue.md` (ready-to-dispatch sprints, FIFO)
- **Roadmap**: `ROADMAP.md`
- **Agent Findings**: `docs/project/AGENT_FINDINGS.md`
- **Performance Sprint Plan**: `SPRINT-PERF.md`
- **Workflow System**: `.workflow/WORKFLOW_ORIENTATION.md` (process discipline, session bootstrap)
- **Session Bootstrap**: `.workflow/session-bootstrap.md` (Skill Gate Rule, anti-rationalization, priorities)
- **Skill Library**: `.workflow/skills/` (brainstorming, planning, execution, verification, debugging, parallel-agents, etc.)
- **Feedback Log**: `.claude/agents/feedback.log` (sprint outcome memory — what worked, what didn't)

---

## Workflow Integration

### Skill Gate Rule

Before any task that involves work, check `.workflow/skills/` for an applicable process skill. Even a 30% match → read the skill and follow its process. Priority order: brainstorming → planning → execution → verification → debugging → documentation.

### Session Start Protocol

1. Read `CLAUDE.md` (this file)
2. Read `.workflow/session-bootstrap.md` (Skill Gate Rule, anti-rationalization tables)
3. Read `docs/project/LESSONS_LEARNED.md` (if session may change codebase)
4. Read `ROADMAP.md` (if session involves planned work)

### Workflow Customization Values

These replace `[CUSTOMIZE]` markers in `.workflow/` files (Option A — values stored here, workflow files stay clean):

| Marker | Value |
|--------|-------|
| `[PROJECT_CONFIG]` | `CLAUDE.md` (project root) |
| `[PROJECT_CONSTITUTION]` | `docs/project/Blurby_Project_Constitution.md` |
| `[LESSONS_LEARNED]` | `docs/project/LESSONS_LEARNED.md` |
| `[PROJECT_TEST_FAST_COMMAND]` | `npm test` |
| `[PROJECT_TEST_FULL_COMMAND]` | `npm test && npm run build` |
| `[BRANCH_NAMING_CONVENTION]` | `sprint/<N>-<name>` (e.g., `sprint/22-chrome-ext`) |

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `global.css`).

### External Audit Cadence

Run `.workflow/skills/external-audit/SKILL.md` at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment.

---

## Current System State (Post-Sprint 18B — Chrome Extension Complete)

### Codebase (branch: `main`, all merged and pushed)

- All sprints (1-21 + 18A + 18B) complete — security, performance, accessibility, cloud sync, production installer, sync hardening, keyboard-first UX, UX polish, Chrome extension
- 512 tests passing across 22 test files
- CI/CD active via GitHub Actions (x64 + ARM64 release matrix)

### Tech Stack

- Electron 41 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 26 for packaging
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), chokidar (folder watch, lazy-loaded), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater, docx (.docx notes export), exceljs (.xlsx reading log)

### Architecture

- **Main process** — modularized into 11 files:
  - `main.js` (1063 lines) — orchestrator, app lifecycle, context object
  - `main/ipc-handlers.js` (918 lines) — all IPC registrations (incl. cloud sync channels)
  - `main/file-parsers.js` (694 lines) — EPUB, MOBI, PDF, HTML, TXT format parsers
  - `main/sync-engine.js` (~950 lines) — offline-first sync: revision counters, operation log, two-phase staging, tombstones, document content sync, checksum verification, conditional writes, full reconciliation
  - `main/sync-queue.js` (229 lines) — offline operation queue with compaction and idempotent replay
  - `main/auth.js` (421 lines) — OAuth2 (Microsoft MSAL + Google), PKCE, token encryption via safeStorage
  - `main/url-extractor.js` (392 lines) — URL/article extraction, Readability, PDF export
  - `main/cloud-google.js` (316 lines) — Google Drive appDataFolder, resumable uploads, retry
  - `main/window-manager.js` (216 lines) — BrowserWindow, tray, menu, auto-updater
  - `main/cloud-onedrive.js` (201 lines) — OneDrive App Folder via Microsoft Graph, chunked uploads
  - `main/migrations.js` (137 lines) — schema migrations with backup
  - `main/ws-server.js` (402 lines) — localhost WebSocket server for Chrome extension (port 48924, pairing token auth)
  - `main/folder-watcher.js` (110 lines) — chokidar folder watching
  - `main/cloud-storage.js` (18 lines) — provider factory (OneDrive/Google)
  - Context object pattern shares state (mainWindow, library, settings, paths) across modules
- **Preload** (`preload.js`): Context bridge -> `window.electronAPI` (incl. cloud sync APIs)
- **Renderer** (`src/`): React 19 SPA
  - `App.tsx` — Thin orchestrator (Sprint 11 refactor)
  - `src/components/` — 37 UI components + 8 settings sub-pages
    - Sprint 20 additions: `PageReaderView.tsx` (default paginated reader), `ReaderBottomBar.tsx` (unified controls), `CommandPalette.tsx`, `ShortcutsOverlay.tsx`, `GoToIndicator.tsx`, `SnoozePickerOverlay.tsx`, `TagPickerOverlay.tsx`, `HighlightsOverlay.tsx`, `QuickSettingsPopover.tsx`, `NotePopover.tsx`
    - Sprint 21 addition: `HotkeyCoach.tsx` (mouse-click coaching toasts)
  - `src/components/settings/` — 8 sub-pages incl. `CloudSyncSettings.tsx` (Sprint 17), `ThemeSettings.tsx` (e-ink controls)
  - `src/contexts/` — SettingsContext.tsx, ToastContext.tsx
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts, useNarration
  - `src/utils/` — text.ts, pdf.ts, rhythm.ts, queue.ts
  - `src/styles/global.css` — All styles with CSS custom properties, WCAG 2.1 AA compliant
  - Performance: useMemo/useCallback throughout, ref-based DOM updates in readers
- **Tests** (`tests/`): 21 test files, 425+ tests (Sprint 13 base + Sprint 19/20/21 additions)
- **CI/CD** (`.github/workflows/`): ci.yml (push/PR, win+linux matrix), release.yml (v* tags + workflow_dispatch, x64+ARM64 NSIS, draft releases, delta updates)
- **Data**: JSON files in user data dir (settings.json, library.json, history.json) with schema versioning + migration framework + cloud sync

### Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Page View (PageReaderView) | ✅ Built | DEFAULT reading view — paginated, word selection, note/define, launches Focus/Flow (Sprint 20U) |
| Focus Mode (ReaderView) | ✅ Built | RSVP word-at-a-time, ORP highlighting, WPM control — sub-mode of Page (Sprint 20U) |
| Flow Mode (ScrollReaderView) | ✅ Built | Scrolling text with word-level highlighting — sub-mode of Page (Sprint 20U) |
| Unified Bottom Bar (ReaderBottomBar) | ✅ Built | Shared controls across Page/Focus/Flow — WPM, font, mode buttons, chapters (Sprint 20U) |
| Notes System | ✅ Built | Inline notes from Page view, exported to .docx with APA citations (Sprint 20V) |
| Reading Log | ✅ Built | Session logging to .xlsx with dashboard KPIs (Sprint 20W) |
| Library Management | ✅ Built | Grid/list view, search, favorites, archives, memoized computed state |
| Folder Watching | ✅ Built | Chokidar (lazy-loaded), on-demand content loading, stale folder cleanup |
| URL Article Import | ✅ Built | Readability + authenticated fetching (lazy-loaded) |
| Multi-Format Support | ✅ Built | TXT, MD, PDF, EPUB, MOBI/AZW3, HTML |
| Chapter Navigation | ✅ Built | NCX/nav TOC, dropdown jump-to-chapter |
| Settings System | ✅ Built | 8 sub-pages (theme, layout, speed, hotkeys, connectors, help, text size, cloud sync) |
| Menu Flap | ✅ Built | Collapsible sidebar with settings access |
| Reading Queue | ✅ Built | Queue management with progress tracking |
| Highlights & Definitions | ✅ Built | Quick-menu with save and dictionary define |
| TTS Narration | ✅ Built | E-ink theme + text-to-speech integration |
| Themes | ✅ Built | Dark, light, system, e-ink, custom accent colors |
| Windows Installer | ✅ Configured | NSIS with branding, shortcuts, directory selection |
| Schema Migrations | ✅ Built | Versioned settings.json + library.json with backup |
| Error Boundaries | ✅ Built | Wrapping Library and Reader views |
| TypeScript | ✅ Migrated | .tsx/.ts in renderer, types.ts for shared types |
| Unit Tests | ✅ 293 tests | Vitest — 14 test files incl. hooks, stress, chapters (Sprint 13) |
| Auto-Updater | ✅ Built | check-for-updates IPC, Settings > Help UI (Sprint 6) |
| Drag-and-Drop | ✅ Polished | Client-side extension filtering, rejection toasts, format hints (Sprint 6) |
| Reader Exit Confirmation | ✅ Built | Double-Escape pattern in ScrollReaderView (Sprint 6) |
| Recent Folders | ✅ Built | Stale folder cleanup on startup (Sprint 6) |
| Reading Statistics | ✅ Built | history.json, StatsPanel, streaks, actual reading time, reset (Sprint 7/7b) |
| CI/CD | ✅ Built | GitHub Actions: CI on push/PR, release on v* tags + workflow_dispatch (Sprint 8 + 18A) |
| Security Hardening | ✅ Built | Image validation, atomic writes, CSP, error logging, pessimistic updates (Sprint 9) |
| Memory & Scalability | ✅ Built | LRU caches, incremental index, PDF cleanup, login dedup (Sprint 10) |
| Renderer Architecture | ✅ Built | App.tsx split into containers, component extraction, typed API (Sprint 11) |
| Code Deduplication | ✅ Built | Shared metadata, countWords utility, named constants (Sprint 12) |
| CSS & Theming | ✅ Built | Cross-theme consistency, CSS custom properties, responsive (Sprint 14) |
| Accessibility | ✅ Built | WCAG 2.1 AA — ARIA, keyboard nav, screen reader, reduced motion (Sprint 15) |
| E-Ink Display Optimization | ✅ Built | WPM ceiling, phrase grouping, paginated scroll, ghosting prevention, touch targets (Sprint 16) |
| Cloud Sync — Auth | ✅ Built | OAuth2 Microsoft (MSAL/PKCE) + Google, encrypted token storage (Sprint 17) |
| Cloud Sync — Engine | ✅ Built | Offline-first, hash-based change detection, field/doc/history merge (Sprint 17) |
| Cloud Sync — UI | ✅ Built | CloudSyncSettings page, CloudSyncIndicator, first-time merge dialog (Sprint 17) |
| Windows Installer | ✅ Production | Branded NSIS (x64+ARM64), delta updates, auto-updater, draft releases (Sprint 18A) |
| Sync Hardening | ✅ Built | Revision counters, operation log, two-phase staging, tombstones, document content sync, checksum verification, conditional writes, full reconciliation (Sprint 19) |
| Article Provenance | ✅ Built | Author, source domain, pub date extraction from URLs; APA-format PDF headers; lead image cascade with magic-byte validation (Sprint 19) |
| Keyboard-First UX | ✅ Built | Command palette, J/K nav, G-sequences, 30+ shortcuts, undo, snooze, tags, collections, filter shortcuts (Sprint 20) |
| Three-Mode Reader | ✅ Built | Page (default) → Focus (RSVP) → Flow (scroll); unified ReaderBottomBar; position mapping (Sprint 20U) |
| Notes System | ✅ Built | NotePopover → .docx with APA citations and TOC (Sprint 20V) |
| Reading Log | ✅ Built | Session data → .xlsx with ReadLog table + Dashboard KPIs (Sprint 20W) |
| UX Polish | ✅ Built | Sticky headers, magnifying glass search, file badges, thumbnails, coaching toasts, drag-drop anywhere (Sprint 21) |
| Reading Intelligence | ✅ Built | Active-only session timer, AVG WPM fix, time-to-end displays (Sprint 21) |
| Flow Highlight Animation | ✅ Built | GPU-accelerated translate3d() cursor glide, line-wrap snap, disabled >500 WPM, reduced motion (Sprint 22) |
| Focus Word Transition | ✅ Built | CSS fade/slide on word advance, duration ≤15% of interval, disabled >500 WPM (Sprint 22) |
| TTS Sync | ✅ Built | Cursor-driven TTS — 4-word chunk buffering, WPM-derived rate, word-boundary sync, auto-chain (Sprint 22) |
| TTS Toggle + WPM Cap | ✅ Built | Narration button in bottom bar (Page view only), WPM capped at 400, N shortcut (Sprint 22) |

### What's NOT Done (Roadmap Forward)

- ~~Sprint 18B: Chrome extension~~ — ✅ COMPLETED (merged to main)
- ~~Sprint 22: Reading Animation + TTS Sync~~ — ✅ COMPLETED (merged to main)
- **Sprint 23: V1 Hardening** — First-run onboarding, error recovery UX, constants extraction (AF-001), a11y audit on Sprint 20/21 components, performance baselines, auto-update E2E test
- **Sprint 24: External Audit** — Full 6-step quality gate before v1.0.0 release
- **Sprint 25: RSS Library + Paywall Integration** — Feed aggregation from authenticated sites, RSS Library UI, "Add to Blurby" import pipeline (post-v1)
- **Sprint 18C: Android app** — React Native port with cloud sync (post-v1)
- **Code signing** — not doing (explicit decision)
- **Symlink protection** — not implemented
- **Multi-window support** — someday backlog

---

## Dependency Chain

✅ Sprints 1-8 (core) -> ✅ Sprint 9 (security) -> ✅ Sprint 10 (memory) -> ✅ Sprints 11+12 (refactor) -> ✅ Sprint 13 (tests) -> ✅ Sprint 14 (CSS) -> ✅ Sprint 15 (a11y) -> ✅ Sprint 17 (cloud sync) -> ✅ Sprint 18A (.exe production)
✅ Sprint 16 (e-ink optimization) — independent track, completed
✅ Sprint 19 (sync hardening + provenance) — completed
✅ Sprint 20 (keyboard-first UX + three-mode reader) — completed
✅ Sprint 21 (UX polish + reading intelligence) — completed
✅ Sprint 18B (Chrome extension) — completed
✅ Sprint 22 (reading animation + TTS sync) — completed
**Sprint 23** (v1 hardening) → **Sprint 24** (external audit) → **v1.0.0 RELEASE**
**Sprint 25** (RSS Library) || **Sprint 18C** (Android) — post-v1

---

## Brand

- **Primary Orange**: #D04716
- **Navy**: #050F32
- **Gray**: #6D6F6D
- **Off-white**: #F9F9F8
- **Fonts**: Suisse Works (serif) / Suisse Int'l (sans) → Georgia / Calibri as system equivalents
- **Style**: Bold section titles bottom-left, orange accent lines, clean white content areas
