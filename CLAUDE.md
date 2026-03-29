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
9. **Always provide a recommendation.** When presenting options, decisions, or status updates, lead with a clear recommendation and rationale. Don't leave decisions hanging — state what you'd do and why.

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

### 7 Governing Documents

Every session starts with awareness of these 7 documents. They are the single source of truth for all project decisions.

| # | Document | Path | Lane |
|---|----------|------|------|
| 1 | **Technical Reference** | `docs/governance/TECHNICAL_REFERENCE.md` | What Blurby IS — architecture, data model, every feature |
| 2 | **Roadmap** | `ROADMAP.md` | What we're building next — sprints, acceptance criteria |
| 3 | **Bug Report** | `docs/governance/BUG_REPORT.md` | What's broken — severity, location, resolution |
| 4 | **Lessons Learned** | `docs/governance/LESSONS_LEARNED.md` | Engineering discoveries, persistent rules, anti-patterns |
| 5 | **Ideas** | `docs/governance/IDEAS.md` | Unroadmapped concepts — reviewed at phase pauses |
| 6 | **CLAUDE.md** | `CLAUDE.md` | Agent operational config — rules, agents, workflow |
| 7 | **Sprint Queue** | `docs/governance/SPRINT_QUEUE.md` | Upcoming sprint dispatch queue (FIFO pointers to ROADMAP specs) |

### Other References

- **Project Constitution**: `docs/project/Blurby_Project_Constitution.md`
- **Sprint Dispatch Template**: `.workflow/docs/sprint-dispatch-template.md` (CLI Evergreen format)
- **Workflow System**: `.workflow/WORKFLOW_ORIENTATION.md` (process discipline, session bootstrap)
- **Session Bootstrap**: `.workflow/session-bootstrap.md` (Skill Gate Rule, anti-rationalization, priorities)
- **Skill Library**: `.workflow/skills/` (brainstorming, planning, execution, verification, debugging, parallel-agents, etc.)
- **Feedback Log**: `.claude/agents/feedback.log` (sprint outcome memory — what worked, what didn't)
- **Roadmap Archive**: `docs/project/ROADMAP_ARCHIVE.md` (completed sprint full specs — reference only)

---

## Document Lifecycle

### Sprint Lifecycle in Docs

When a sprint **completes**:

1. **SPRINT_QUEUE.md** — Remove the sprint's entry row. Update queue depth.
2. **SPRINT_QUEUE.md** — Add to "Completed Sprints (Recent)" table at top.
3. **ROADMAP.md** — Move the full spec section to `docs/project/ROADMAP_ARCHIVE.md`. Keep ROADMAP forward-looking only.
4. **ROADMAP.md** — Update Sprint Status table (remove or mark complete).
5. **ROADMAP.md** — Update Execution Order diagram.
6. **CLAUDE.md** — Update "What's NOT Done" list, Dependency Chain, and test counts.
7. **Backfill** — If queue depth drops below 3, spec the next sprint from IDEAS.md or Someday Backlog.

### Where Things Live

| Content | File | Rule |
|---------|------|------|
| Forward-looking sprint specs (full CLI Evergreen) | `ROADMAP.md` | Only upcoming work. Archive on completion. |
| Sprint dispatch queue (summary pointers) | `docs/governance/SPRINT_QUEUE.md` | FIFO table → ROADMAP for full spec. ≥3 entries. |
| Completed sprint specs | `docs/project/ROADMAP_ARCHIVE.md` | Append-only. Reference, don't modify. |
| Completed Cowork plans/specs | `docs/superpowers/{plans,specs}/.Archive/` | Move on completion. |
| Completed governance sprint files | `docs/project/.Archive/` | Move on completion. |
| Current system state + agent config | `CLAUDE.md` | Keep under ~20k chars. Archive old sprint details. |
| Bugs (active) | `docs/governance/BUG_REPORT.md` | Remove when fixed + verified. |
| Feature requests (unroadmapped) | `docs/governance/IDEAS.md` | Reviewed at phase pauses. |
| Engineering discoveries | `docs/governance/LESSONS_LEARNED.md` | Append immediately on discovery. |
| Architecture + data model | `docs/governance/TECHNICAL_REFERENCE.md` | Update when architecture changes. |

### Cleanup Cadence

- **Every sprint completion**: Run steps 1-7 above.
- **Every 3rd sprint**: Review `docs/` for stale files. Archive anything from completed work.
- **ROADMAP.md target**: <500 lines. If approaching, check for completed specs that weren't archived.
- **CLAUDE.md target**: <20k chars. Archive completed sprint details to `docs/project/CLAUDE_md_archive_sessionN.md`.

---

## Workflow Integration

### Skill Gate Rule

Before any task that involves work, check `.workflow/skills/` for an applicable process skill. Even a 30% match → read the skill and follow its process. Priority order: brainstorming → planning → execution → verification → debugging → documentation.

### Session Start Protocol

1. Read `CLAUDE.md` (this file) — rules, agents, current system state
2. Read `.workflow/session-bootstrap.md` (Skill Gate Rule, anti-rationalization tables)
3. Read `docs/governance/LESSONS_LEARNED.md` (if session may change codebase)
4. Read `ROADMAP.md` (if session involves planned work)
5. Read `docs/governance/BUG_REPORT.md` (if session involves bug fixes)
6. Read `docs/governance/SPRINT_QUEUE.md` (if dispatching work to CLI)

### Workflow Customization Values

These replace `[CUSTOMIZE]` markers in `.workflow/` files (Option A — values stored here, workflow files stay clean):

| Marker | Value |
|--------|-------|
| `[PROJECT_CONFIG]` | `CLAUDE.md` (project root) |
| `[PROJECT_CONSTITUTION]` | `docs/project/Blurby_Project_Constitution.md` |
| `[LESSONS_LEARNED]` | `docs/governance/LESSONS_LEARNED.md` |
| `[PROJECT_TEST_FAST_COMMAND]` | `npm test` |
| `[PROJECT_TEST_FULL_COMMAND]` | `npm test && npm run build` |
| `[BRANCH_NAMING_CONVENTION]` | `sprint/<N>-<name>` (e.g., `sprint/22-chrome-ext`) |

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `global.css`).

### External Audit Cadence

Run `.workflow/skills/external-audit/SKILL.md` at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment.

---

## Current System State (v1.0.0+ — Post-TTS-1)

### Codebase (branch: `main`)

- All sprints (1-23 + 18A + 18B + 25S + TD-1 + TD-2 + HOTFIX-2B + Mode Hardening + Mode Verticals + CT-1 + TH-1 + CT-2 + CT-3 + 24 + 24R + KB-1 + TTS-1) complete
- 796 tests passing across 39 test files
- CI/CD active via GitHub Actions (single-job x64+ARM64 release build)
- Performance baseline: 21 automated benchmarks via `npm run perf`

### Tech Stack

- Electron 41 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 26 for packaging
- foliate-js for EPUB rendering (primary reader for EPUBs)
- Kokoro TTS engine (28 voices, worker thread, q4 quantization)
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), chokidar (folder watch, lazy-loaded), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater, docx (.docx notes export), exceljs (.xlsx reading log)

### Architecture

- **Main process** — modularized with domain-split IPC:
  - `main.js` — orchestrator, app lifecycle, context object
  - `main/ipc/` — 8 domain-specific IPC handler files (replaces monolithic ipc-handlers.js)
  - `main/epub-converter.js` — universal EPUB pipeline (all formats convert to EPUB on import)
  - `main/legacy-parsers.js` — retained parsers for non-EPUB formats (PDF, TXT, MD, HTML)
  - `main/sync-engine.js` — offline-first sync: revision counters, operation log, two-phase staging, tombstones, document content sync, checksum verification, conditional writes, full reconciliation
  - `main/sync-queue.js` — offline operation queue with compaction and idempotent replay
  - `main/auth.js` — OAuth2 (Microsoft MSAL + Google), PKCE, token encryption via safeStorage
  - `main/url-extractor.js` — URL/article extraction, Readability, PDF export
  - `main/cloud-google.js` — Google Drive appDataFolder, resumable uploads, retry
  - `main/window-manager.js` — BrowserWindow, tray, menu, auto-updater
  - `main/cloud-onedrive.js` — OneDrive App Folder via Microsoft Graph, chunked uploads
  - `main/migrations.js` — schema migrations with backup
  - `main/ws-server.js` — localhost WebSocket server for Chrome extension (port 48924, pairing token auth)
  - `main/folder-watcher.js` — chokidar folder watching
  - `main/cloud-storage.js` — provider factory (OneDrive/Google)
  - Context object pattern shares state (mainWindow, library, settings, paths) across modules
- **Preload** (`preload.js`): Context bridge -> `window.electronAPI` (incl. cloud sync APIs)
- **Renderer** (`src/`): React 19 SPA
  - `App.tsx` — Thin orchestrator (Sprint 11 refactor)
  - `src/components/` — UI components + 8 settings sub-pages
    - `ReaderContainer.tsx` — decomposed into hooks: useReaderMode, useProgressTracker, useEinkController
    - `ReaderBottomBar.tsx` — unified controls across all 4 reading modes
  - `src/modes/` — Mode verticals (TD-1): `PageMode.ts`, `FocusMode.ts`, `FlowMode.ts`, `NarrateMode.ts` + shared types and index
  - `src/components/settings/` — 8 sub-pages incl. `CloudSyncSettings.tsx` (Sprint 17), `ThemeSettings.tsx` (e-ink controls)
  - `src/contexts/` — SettingsContext.tsx, ToastContext.tsx
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts, useNarration, useReaderMode (TD-1), useProgressTracker (TD-1), useEinkController (TD-1)
  - `src/utils/` — text.ts, pdf.ts, rhythm.ts, queue.ts, segmentWords.ts, getOverlayPosition.ts, FlowCursorController.ts, constants.ts
  - `src/types/` — types.ts, foliate.ts (TD-1), narration.ts (TD-1)
  - `src/styles/global.css` — All styles with CSS custom properties, WCAG 2.1 AA compliant
  - Narration uses useReducer state machine with TTS strategy pattern (Web Speech + Kokoro)
  - Performance: useMemo/useCallback throughout, ref-based DOM updates in readers
- **Test Harness** (`src/test-harness/`): Browser-based E2E testing stub (Sprint CT-1)
    - `electron-api-stub.ts` — Complete `window.electronAPI` surface (73 methods + 10 event listeners) with in-memory state, Meditations seed data, console tracing
    - `mock-kokoro.ts` — Synthetic PCM audio generation (440Hz sine wave) matching Kokoro TTS response shape
    - `stub-loader.ts` — Dynamic import, dev-only injection when `window.electronAPI` is absent
    - `window.__blurbyStub.emit(event, data)` — Manual event triggering for test scripts
    - Auto-injected in `main.tsx` via `import.meta.env.DEV` guard, tree-shaken from production builds
  - **Tests** (`tests/`): 38 test files, 776 tests (Sprint 13 base + subsequent sprints + TD-1 additions)
- **CI/CD** (`.github/workflows/`): ci.yml (push/PR, win+linux matrix), release.yml (v* tags + workflow_dispatch, single-job x64+ARM64 NSIS, draft releases, delta updates)
- **Data**: JSON files in user data dir (settings.json, library.json, history.json) with schema versioning + migration framework + cloud sync

### Feature Status

Full feature inventory: `docs/governance/TECHNICAL_REFERENCE.md`. Summary: all core features built — 4-mode reader (Page/Focus/Flow/Narrate), foliate-js EPUB, Kokoro TTS (28 voices), universal EPUB pipeline, library management, cloud sync (OneDrive/GDrive), Chrome extension, keyboard-first UX (30+ shortcuts), WCAG 2.1 AA accessibility, Windows installer (x64+ARM64), CI/CD, 796 tests across 39 files.

### What's Next

- **Sprint 25: RSS Library + Paywall Integration** — post-v1
- **Sprint 18C: Android app** — post-v1
- **Code signing** — not doing (explicit decision)
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
✅ Sprint 25S (stabilization — 13 bug fixes, EPUB overlays, engagement-gated progress) — completed
✅ TD-1 (technical debt — foliate-js, Kokoro TTS, universal EPUB pipeline, mode verticals, IPC split) — completed
✅ Sprint 23 (v1 hardening — onboarding, error recovery, constants, a11y, perf baselines, auto-update E2E) — completed
✅ Mode Hardening + Mode Verticals (688 tests, legacy effect removal, Shift+Space cycling, Focus off-by-one) — completed
✅ Sprint CT-1 (Chrome test harness — electronAPI stub, mock Kokoro, 121-item checklist) — completed
✅ Sprint TH-1 (narration test hardening — 88 new tests, 776 total) — completed
✅ Sprint CT-2 (test harness hardening — rich seed data, sessionStorage, 5 bug fixes) — completed
✅ Sprint CT-3 (click-through repair — KB checklist alignment, Focus stability, stub improvements) — completed
✅ Sprint 24 (external audit — 58 findings, 3C/24H/21M/10L) — completed
✅ Sprint 24R (CRIT remediation — path validation) — completed
✅ Sprint KB-1 (keyboard navigation remap — 791 tests) — completed
✅ Sprint TTS-1 (narration correctness — 15 code fixes from TTS audit, 796 tests) — completed
✅ v1.0.0 RELEASE — tagged + shipped
✅ Sprint TTS-2 (TTS docs — privacy, SSML, safety, glossary, 12-term glossary) — completed
**Sprint 25** (RSS Library) || **Sprint 18C** (Android) — post-v1

---

## Brand

- **Primary Orange**: #D04716
- **Navy**: #050F32
- **Gray**: #6D6F6D
- **Off-white**: #F9F9F8
- **Fonts**: Suisse Works (serif) / Suisse Int'l (sans) → Georgia / Calibri as system equivalents
- **Style**: Bold section titles bottom-left, orange accent lines, clean white content areas
