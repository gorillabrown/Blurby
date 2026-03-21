# Blurby — Claude Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (CLAUDE.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review CLAUDE.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Claude Code, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., speed reading view (ReaderView), scroll reading view (ScrollReaderView), word index (wordIndex), etc.
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
| `doc-keeper` | sonnet | Updates all documentation files |

### Standing Rules

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
- **Sprint Dispatch Template**: `.claude/agents/blurby-lead.md` §Sprint Dispatch Template
- **Roadmap**: `ROADMAP.md`
- **Agent Findings**: `docs/project/AGENT_FINDINGS.md`
- **Performance Sprint Plan**: `SPRINT-PERF.md`

---

## Current System State (Post-Sprint 17 — Cloud Sync Complete)

### Codebase (branch: `main`)

- **36 commits** on main (PR #1 squash-merged as commit 91718e3, then Sprints 2-17 layered on top)
- All sprints (1-17) complete — security, performance, accessibility, cloud sync done
- CI/CD active via GitHub Actions

### Tech Stack

- Electron 33 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 25 for packaging
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), chokidar (folder watch, lazy-loaded), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater

### Architecture

- **Main process** — modularized into 11 files:
  - `main.js` (1063 lines) — orchestrator, app lifecycle, context object
  - `main/ipc-handlers.js` (918 lines) — all IPC registrations (incl. cloud sync channels)
  - `main/file-parsers.js` (694 lines) — EPUB, MOBI, PDF, HTML, TXT format parsers
  - `main/sync-engine.js` (487 lines) — offline-first sync with hash-based change detection, field/doc/history merge
  - `main/auth.js` (421 lines) — OAuth2 (Microsoft MSAL + Google), PKCE, token encryption via safeStorage
  - `main/url-extractor.js` (392 lines) — URL/article extraction, Readability, PDF export
  - `main/cloud-google.js` (316 lines) — Google Drive appDataFolder, resumable uploads, retry
  - `main/window-manager.js` (216 lines) — BrowserWindow, tray, menu, auto-updater
  - `main/cloud-onedrive.js` (201 lines) — OneDrive App Folder via Microsoft Graph, chunked uploads
  - `main/migrations.js` (137 lines) — schema migrations with backup
  - `main/folder-watcher.js` (110 lines) — chokidar folder watching
  - `main/cloud-storage.js` (18 lines) — provider factory (OneDrive/Google)
  - Context object pattern shares state (mainWindow, library, settings, paths) across modules
- **Preload** (`preload.js`): Context bridge -> `window.electronAPI` (incl. cloud sync APIs)
- **Renderer** (`src/`): React 19 SPA
  - `App.tsx` — Thin orchestrator (Sprint 11 refactor)
  - `src/components/` — 29 UI components + 8 settings sub-pages
    - Key additions: `ReaderContainer.tsx`, `LibraryContainer.tsx` (Sprint 11), `CloudSyncIndicator.tsx` (Sprint 17), `EinkRefreshOverlay.tsx` (Sprint 16), `VirtualScrollText.tsx`
  - `src/components/settings/` — 8 sub-pages incl. `CloudSyncSettings.tsx` (Sprint 17), `ThemeSettings.tsx` (e-ink controls)
  - `src/contexts/` — SettingsContext.tsx, ToastContext.tsx
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts, useNarration
  - `src/utils/` — text.ts, pdf.ts, rhythm.ts, queue.ts
  - `src/styles/global.css` — All styles with CSS custom properties, WCAG 2.1 AA compliant
  - Performance: useMemo/useCallback throughout, ref-based DOM updates in readers
- **Tests** (`tests/`): 14 test files, 293 tests (Sprint 13 expansion)
- **CI/CD** (`.github/workflows/`): ci.yml (push/PR, win+linux matrix), release.yml (v* tags, NSIS installer)
- **Data**: JSON files in user data dir (settings.json, library.json, history.json) with schema versioning + migration framework + cloud sync

### Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| RSVP Reader (ReaderView) | ✅ Built | ORP highlighting, WPM control, ref-based playback (Sprint 5) |
| Scroll/Flow Reader (ScrollReaderView) | ✅ Built | Word-level highlighting, ref-based flow mode, double-Escape exit |
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
| CI/CD | ✅ Built | GitHub Actions: CI on push/PR, release on v* tags (Sprint 8) |
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

### What's NOT Done (Roadmap Forward)

- **Sprint 18A: Windows .exe production** — code signing, auto-update e2e, installer polish, ARM64
- **Sprint 18B: Chrome extension** — "Send to Blurby" with WebSocket + cloud fallback
- **Sprint 18C: Android app** — React Native port with cloud sync
- **Cloud sync hardening** — deferred from Sprint 17: operation log, tombstones, staging directory, revision counters, document content sync, checksum verification, full reconciliation
- **Code signing** — researched (docs/code-signing.md), Azure Trusted Signing recommended, not obtained
- **Symlink protection** — not implemented
- **Multi-window support** — someday backlog

---

## Dependency Chain

✅ Sprints 1-8 (core) -> ✅ Sprint 9 (security) -> ✅ Sprint 10 (memory) -> ✅ Sprints 11+12 (refactor) -> ✅ Sprint 13 (tests) -> ✅ Sprint 14 (CSS) -> ✅ Sprint 15 (a11y) -> ✅ Sprint 17 (cloud sync) -> **Sprint 18** (platform expansion)
✅ Sprint 16 (e-ink optimization) — independent track, completed
Sprint 18A (.exe) || Sprint 18B (Chrome ext) || Sprint 18C (Android) — all parallelizable after Sprint 17

---

## Brand

- **Primary Orange**: #D04716
- **Navy**: #050F32
- **Gray**: #6D6F6D
- **Off-white**: #F9F9F8
- **Fonts**: Suisse Works (serif) / Suisse Int'l (sans) → Georgia / Calibri as system equivalents
- **Style**: Bold section titles bottom-left, orange accent lines, clean white content areas
