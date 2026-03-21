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
- **All file I/O in main.js must be async** (fs.promises). No synchronous reads/writes.
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

## Current System State (Session 2 — Post-Sprint 15)

### Codebase (dev branch: `claude/review-blurby-roadmap-1lsoT`)

- **105 commits**, 80 files changed (+25,349 / -1,108 lines) vs main
- **PR #1** open: "Implement roadmap phases 0-2: architecture, data safety, and distribution"
- **main branch is stale** — 12 commits, essentially the Day 1 skeleton

### Tech Stack

- Electron 33 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 25 for packaging
- Dependencies: chokidar (folder watch), @mozilla/readability + jsdom (URL extraction), pdf-parse (PDF reading), pdfkit (PDF export), adm-zip (EPUB/MOBI), cheerio (HTML), electron-updater

### Architecture

- **Main process** (`main.js` orchestrator + `main/` modules): Modularized into 7 files — orchestrator + ipc-handlers, file-parsers, url-extractor, window-manager, migrations, folder-watcher. Atomic JSON writes, CSP via onHeadersReceived, image magic byte validation, LRU caches (epubChapterCache max 50), non-blocking folder sync with progress/cancellation
- **Preload** (`preload.js`, 4KB): Context bridge → `window.electronAPI`
- **Renderer** (`src/`): React 19 SPA
  - `App.tsx` (115 lines) — Slim router/coordinator
  - `ReaderContainer.tsx` — Reader state, playback, chapter nav, progress tracking
  - `LibraryContainer.tsx` — Library state, folder management, import/export
  - `SettingsContext` — Settings state provider (eliminates prop drilling)
  - `ToastContext` — Toast notification provider
  - `src/components/` — UI components including extracted PausedTextView, FlowText, VirtualScrollText + 7 settings sub-pages
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts, useNarration
  - `src/utils/` — text.ts (with countWords(), O(n) chaptersFromCharOffsets, focusChar multibyte fix), pdf.ts, rhythm.ts, queue.ts
  - `src/styles/global.css` — Design tokens (--radius-sm/md/lg/xl, --transition-fast/normal, --shadow-sm/md/lg), responsive breakpoints (@media 600px, 400px), theme-aware scrollbars, WCAG 2.1 AA contrast, prefers-reduced-motion support
- **Tests** (`tests/`): 15 test files (293 tests) — includes useReader, useLibrary, useKeyboardShortcuts, useNarration, chapters, stress (100k/500k words)
- **Data**: JSON files in user data dir (settings.json, library.json) with schema versioning + migration framework + atomic writes

### Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| RSVP Reader (ReaderView) | ✅ Built | ORP highlighting, WPM control, keyboard shortcuts |
| Scroll/Flow Reader (ScrollReaderView) | ✅ Built | Word-level highlighting, virtual windowing |
| Library Management | ✅ Built | Grid/list view, search, favorites, archives, import/export |
| Folder Watching | ✅ Built | Chokidar, on-demand content loading |
| URL Article Import | ✅ Built | Readability + authenticated fetching |
| Multi-Format Support | ✅ Built | TXT, MD, PDF, EPUB, MOBI/AZW3, HTML |
| Chapter Navigation | ✅ Built | NCX/nav TOC, dropdown jump-to-chapter |
| Settings System | ✅ Built | 7 sub-pages (theme, layout, speed, hotkeys, connectors, help, text size) |
| Menu Flap | ✅ Built | Collapsible sidebar with settings access |
| Reading Queue | ✅ Built | Queue management with progress tracking |
| Highlights & Definitions | ✅ Built | Quick-menu with save and dictionary define |
| TTS Narration | ✅ Built | E-ink theme + text-to-speech integration |
| Themes | ✅ Built | Dark, light, system, e-ink, custom accent colors |
| Windows Installer | ✅ Configured | NSIS with branding, shortcuts, directory selection |
| Schema Migrations | ✅ Built | Versioned settings.json + library.json with backup |
| Error Boundaries | ✅ Built | Wrapping Library and Reader views |
| TypeScript | ✅ Migrated | .tsx/.ts in renderer, types.ts for shared types |
| Unit Tests | ✅ 293 tests | Vitest — text, rhythm, highlights, migrations, WPM, PDF, hooks, chapters, stress |
| Security Hardening | ✅ Built | Image magic byte validation, atomic JSON writes, CSP, error logging |
| Memory Management | ✅ Built | LRU caches, O(1) index updates, non-blocking folder sync, PDF leak fix |
| Renderer Architecture | ✅ Refactored | App.tsx slim router, containers, contexts, extracted components |
| Code Dedup | ✅ Built | extractDocMetadata(), countWords(), named constants, multibyte fix |
| CSS Design Tokens | ✅ Built | 40+ colors→vars, radius/transition/shadow tokens, responsive breakpoints |
| Accessibility (WCAG 2.1 AA) | ✅ Built | ARIA labels/roles, aria-live, skip-to-content, sr-only, reduced motion, contrast |

### What's NOT Done (Roadmap Forward)

- **Code signing** — documented but not obtained (Windows SmartScreen trust)
- **Chrome extension** (Phase 9) — design only
- **Android app** (Phase 10) — design only

---

## Dependency Chain

Sprints 1-15 COMPLETE → **Phase 9** (Chrome extension) → **Phase 10** (Android)

---

## Brand

- **Primary Orange**: #D04716
- **Navy**: #050F32
- **Gray**: #6D6F6D
- **Off-white**: #F9F9F8
- **Fonts**: Suisse Works (serif) / Suisse Int'l (sans) → Georgia / Calibri as system equivalents
- **Style**: Bold section titles bottom-left, orange accent lines, clean white content areas
