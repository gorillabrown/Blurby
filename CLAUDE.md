# Blurby — Claude Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (CLAUDE.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review CLAUDE.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Claude Code, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., focus reading (ReaderView), flow reading (ScrollReaderView), page reading (PageReaderView), bottom bar (ReaderBottomBar), word index (wordIndex), etc.
5. **Roadmap must spec out at least three sprints in advance** — current + two future sprints fully articulated with acceptance criteria.
6. **Aggressively parallelize.** Look for work that Cowork and Claude Code CLI can do simultaneously. Independent tasks run in parallel. Dependent tasks are sequenced. **We cannot waste a second.**
7. **CLAUDE.md stays under ~35k chars.** When approaching threshold, archive completed sprint details to `docs/project/CLAUDE_md_archive_sessionN.md`.
8. **Always print CLI-formatted sprint dispatches.** When dispatching work to Claude Code CLI, produce a compact, ready-to-paste prompt. Dispatches are POINTERS not PAYLOADS — reference the Sprint Queue (which points to ROADMAP.md for the full spec), don't duplicate it. Format: sprint ID, branch, baseline state, link to Sprint Queue.
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

**IMPORTANT: This section is read by Claude Code CLI as its system prompt. Follow these instructions directly.**

#### Mandatory Session-Start Protocol

Before writing ANY code, you MUST read these files in this order. No exceptions. No shortcuts.

1. **`CLAUDE.md`** (this file) — You're already reading it. Note the Standing Rules below.
2. **`.claude/agents/blurby-lead.md`** — The orchestrator protocol. Defines the mandatory sprint execution sequence (READ → IMPLEMENT → TEST → VERIFY → DOCUMENT → GIT → REPORT). Follow this sequence exactly.
3. **`docs/governance/LESSONS_LEARNED.md`** — Scan for entries tagged with the areas you're about to touch. These are hard-won guardrails. Violating them causes regressions.
4. **`ROADMAP.md`** — Find the sprint/hotfix section for your current task. Read the full spec including WHERE, Tasks, and SUCCESS CRITERIA.
5. **Source files listed in the dispatch's WHERE section** — Read them in the listed order before making changes.

If your dispatch references a LESSONS_LEARNED entry by number (e.g., "LL-051"), you MUST read that specific entry and follow its guardrail.

#### Agent Definition Files

Agent `.md` files in `.claude/agents/` define the scope, output contract, and strict rules for each agent role. Each file has YAML frontmatter that Claude Code uses for auto-discovery, model assignment, and tool permissions.

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `blurby-lead.md` | Orchestrator | opus | Sprint sequencing, spawns sub-agents, enforces mandatory phases |
| `spec-compliance-reviewer.md` | spec-reviewer | sonnet | Verify every SUCCESS CRITERIA item; produce APPROVED/REJECTED verdict |
| `doc-keeper.md` | doc-keeper | sonnet | Update all 6 governing docs after every sprint |
| `test-runner.md` | test-runner | haiku | Execute tests, categorize failures, report pass/fail |
| `quality-reviewer.md` | quality-reviewer | sonnet | Architecture compliance, known-trap detection, code quality |

#### How Dispatches Work

Sprint dispatches go to `blurby-lead` (the orchestrator). blurby-lead reads the dispatch, loads the sprint spec from ROADMAP.md, and **spawns sub-agents** per the task table using the Agent tool. Each sub-agent runs in its own context with the tools and model defined in its `.md` file.

The dispatch's Task table tells blurby-lead:

- **Which agent to spawn** for each step (format-parser, test-runner, spec-compliance-reviewer, etc.)
- **What model tier** — opus for cross-system reasoning, sonnet for focused work, haiku for lightweight execution
- **What order** — sequential by default, parallel when explicitly marked

Code agents (electron-fixer, renderer-fixer, format-parser) are **scope labels** — blurby-lead does the code work itself using those labels to stay in scope. Verification and documentation agents (spec-compliance-reviewer, doc-keeper, test-runner, quality-reviewer) are **spawned as sub-agents** with their own tool permissions and output contracts.

#### Agent Scope Labels (Reference)

**Code agents** (make changes):

| Label | Scope | Files |
|-------|-------|-------|
| `electron-fixer` | Main process — IPC handlers, file I/O, data persistence, Electron APIs | `main/`, `main/ipc/`, `preload.js` |
| `renderer-fixer` | React — state, props, hooks, CSS, rendering | `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` |
| `format-parser` | File format integration — EPUB, MOBI, PDF, HTML parsing | `main/epub-converter.js`, `main/legacy-parsers.js`, `main/epub-word-extractor.js` |

**Verification agents** (read-only review):

| Label | Scope | Files |
|-------|-------|-------|
| `test-runner` | Test execution and build verification | `tests/`, `package.json` scripts |
| `code-reviewer` | Architecture compliance, known-trap detection, code quality | Read-only review pass |
| `spec-reviewer` | Verify every SUCCESS CRITERIA item from the dispatch is met | Read-only, cross-references dispatch spec |

**Documentation agents:**

| Label | Scope | Files |
|-------|-------|-------|
| `doc-keeper` | Documentation updates (mandatory penultimate step in every sprint) | `CLAUDE.md`, `ROADMAP.md`, `docs/governance/` |

**Orchestration:**

| Label | Scope | Files |
|-------|-------|-------|
| `blurby-lead` | Sprint orchestrator — sequencing, git operations, summary output | All (read), git commands |

#### Post-Completion Checklist

Before committing, verify ALL of these:

- [ ] Every SUCCESS CRITERIA item from the dispatch is met (spec-reviewer pass)
- [ ] `npm test` passes (860+ tests, 0 failures)
- [ ] `npm run build` succeeds (if UI changes were made)
- [ ] No files were accidentally truncated (check `git diff --stat` for unexpected size changes)
- [ ] LESSONS_LEARNED guardrails were not violated
- [ ] Changes are scoped to the files listed in the dispatch — no drive-by edits
- [ ] Spec-compliance self-review passed (code matches dispatch spec line-by-line)
- [ ] Quality self-review passed (architecture rules, known traps, code clarity)

#### Mandatory Doc-Keeper Pass (After Every Sprint)

After EVERY sprint completion — hotfixes included, no exceptions — run the doc-keeper pass:

1. **ROADMAP.md** — Update header (version, date, state). Archive completed sprint spec to `docs/project/ROADMAP_ARCHIVE.md`. Update Sprint Status table.
2. **SPRINT_QUEUE.md** — Remove completed sprint from queue. Add to "Completed Sprints" table. Verify queue depth ≥ 3.
3. **CLAUDE.md** — Update version, sprint list, dependency chain, test counts.
4. **LESSONS_LEARNED.md** — Add entry if any non-trivial discovery was made.
5. **BUG_REPORT.md** — Mark any bugs fixed by this sprint as resolved.
6. **TECHNICAL_REFERENCE.md** — Update if architecture changed.

### Standing Rules

- **READ BEFORE YOU WRITE.** Every CLI session MUST read `docs/governance/LESSONS_LEARNED.md` and the relevant ROADMAP section BEFORE making any code changes. This is non-negotiable. Skipping this step causes regressions.
- **Branch-per-sprint.** One branch per sprint dispatch (`sprint/<N>-<name>`). Never commit directly to main. Merge with `--no-ff` after tests pass. Delete branch after merge.
- **Local-first development.** Working directory at `C:\Users\estra\Projects\Blurby`. Push to GitHub after every sprint. Pull before every session. See `docs/governance/DEVELOPMENT_SYNC.md` for full SOP.
- **Electron main process stays CommonJS.** Renderer stays ESM/TypeScript. Never cross the boundary.
- **All file I/O in main process modules must be async** (fs.promises). No synchronous reads/writes.
- **preload.js is the security boundary.** Keep it minimal. All system access goes through IPC.
- **LESSONS_LEARNED is a required engineering artifact.** Update immediately on non-trivial discovery.
- **After any engine change → run tests before proceeding.** `npm test` must pass.
- **After any UI change → build verification.** `npm run build` must succeed.
- **CSS custom properties for theming.** No inline styles. All styles in `src/styles/global.css`.
- **Never import Node.js modules in renderer code.** All system access through IPC via `window.electronAPI`.
- Folder-sourced docs don't store content in library.json — loaded on-demand via `load-doc-content` IPC.
- **Dispatch sizing: 40 tool-use ceiling.** A single blurby-lead dispatch must stay under ~40 tool uses. Sprints exceeding this must be split into waves (e.g., Wave A = implement + test, Wave B = verify + docs + git). Each wave is a separate CLI dispatch. Estimate: 1 tool use per file read, 1-2 per file write, 3-5 per sub-agent spawn, 1 per bash command.
- **Verify file integrity after changes.** Run `git diff --stat` before committing. If any file shows an unexpected size decrease, check for truncation.
- **Verification gate is mandatory.** After completing any code-change task, verify: tests pass, behavior matches spec, no regressions, edge cases covered, documentation current. A task is NOT complete until verification evidence exists.
- **Spec-compliance review before quality review.** For multi-task sprints, each task gets a spec-compliance check (does it match the dispatch spec?) before a quality check (is it well-built?). The spec-reviewer agent scope label marks this step in every sprint. In single-CLI mode, self-review against both checklists sequentially.

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
- **Agent Definitions**: `.claude/agents/` (blurby-lead, spec-compliance-reviewer, doc-keeper, test-runner, quality-reviewer)
- **Roadmap Archive**: `docs/project/ROADMAP_ARCHIVE.md` (completed sprint full specs — reference only)
- **Development Sync SOP**: `docs/governance/DEVELOPMENT_SYNC.md` (local-first git workflow)

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
- **CLAUDE.md target**: <35k chars. Archive completed sprint details to `docs/project/CLAUDE_md_archive_sessionN.md`.

---

## Workflow Integration

### Session Start Protocol

1. Read `CLAUDE.md` (this file) — rules, agents, current system state
2. Read `docs/governance/LESSONS_LEARNED.md` (if session may change codebase)
3. Read `ROADMAP.md` (if session involves planned work)
4. Read `docs/governance/BUG_REPORT.md` (if session involves bug fixes)
5. Read `docs/governance/SPRINT_QUEUE.md` (if dispatching work to CLI)

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `global.css`).

### External Audit Cadence

Run a structured codebase audit at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment. See `docs/audit/` for prior audit artifacts and procedure.

---

## Current System State (v1.6.0 — Post-FLOW-3A)

### Codebase (branch: `main`)

- All sprints through FLOW-3A complete (1-23 + 18A + 18B + 25S + TD-1 + TD-2 + HOTFIX-2B + Mode Hardening + Mode Verticals + CT-1 + TH-1 + CT-2 + CT-3 + 24 + 24R + KB-1 + TTS-1 + TTS-2 + NAR-1 + PKG-1 + HOTFIX-3 + UX-1 + HOTFIX-4 + HOTFIX-4B + BUG-BTN + NAR-2 + NAR-3 + NAR-4 + HOTFIX-5 + HOTFIX-6 + HOTFIX-7 + HOTFIX-8 + HOTFIX-9 + HOTFIX-10 + NAR-5 + HOTFIX-11 + AUDIT-FIX-1A through 1F + EPUB-2A + EPUB-2B + FLOW-3A)
- 932 tests passing across 47 test files
- CI/CD active via GitHub Actions (split x64+ARM64 builds, --publish never + explicit gh upload, nsis-web stub installer)
- Performance baseline: 21 automated benchmarks via `npm run perf`

### Tech Stack

- Electron 41 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 26 for packaging
- foliate-js for EPUB rendering (primary reader for EPUBs)
- Kokoro TTS engine (28 voices, worker thread, q4 quantization)
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), chokidar (folder watch, lazy-loaded), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater, docx (.docx notes export), exceljs (.xlsx reading log), opusscript (Opus audio encoding/decoding), mammoth (DOCX→HTML, lazy-loaded)

### Architecture

- **Main process** — modularized with domain-split IPC:
  - `main.js` — orchestrator, app lifecycle, context object
  - `main/ipc/` — 8 domain-specific IPC handler files (replaces monolithic ipc-handlers.js)
  - `main/epub-converter.js` — universal EPUB pipeline (all formats convert to EPUB on import, preserves formatting + images). URL articles and Chrome extension articles also convert to EPUB.
  - `main/legacy-parsers.js` — deprecated text extraction (word count only, not used for rendering)
  - `main/sync-engine.js` — offline-first sync: revision counters, operation log, two-phase staging, tombstones, document content sync, checksum verification, conditional writes, full reconciliation
  - `main/sync-queue.js` — offline operation queue with compaction and idempotent replay
  - `main/auth.js` — OAuth2 (Microsoft MSAL + Google), PKCE, token encryption via safeStorage
  - `main/url-extractor.js` — URL/article extraction, Readability, PDF export
  - `main/cloud-google.js` — Google Drive appDataFolder, resumable uploads, retry
  - `main/window-manager.js` — BrowserWindow, tray, menu, auto-updater
  - `main/cloud-onedrive.js` — OneDrive App Folder via Microsoft Graph, chunked uploads
  - `main/migrations.js` — schema migrations with backup
  - `main/ws-server.js` — localhost WebSocket server for Chrome extension (port 48924, pairing token auth)
  - `main/epub-word-extractor.js` — main-process EPUB word extraction (AdmZip + cheerio + Intl.Segmenter, bypasses foliate)
  - `main/folder-watcher.js` — chokidar folder watching
  - `main/cloud-storage.js` — provider factory (OneDrive/Google)
  - Context object pattern shares state (mainWindow, library, settings, paths) across modules
- **Preload** (`preload.js`): Context bridge -> `window.electronAPI` (incl. cloud sync APIs)
- **Renderer** (`src/`): React 19 SPA
  - `App.tsx` — Thin orchestrator (Sprint 11 refactor)
  - `src/components/` — UI components + 8 settings sub-pages
    - `ReaderContainer.tsx` — decomposed into hooks: useReaderMode, useProgressTracker, useEinkController
    - `ReaderBottomBar.tsx` — unified controls across all 4 reading modes
    - `FlowScrollView.tsx` — non-EPUB fallback continuous scroll view for Flow Mode (EPUB uses foliate scrolled mode)
  - `src/modes/` — Mode verticals (TD-1): `PageMode.ts`, `FocusMode.ts`, `FlowMode.ts`, `NarrateMode.ts` + shared types and index
  - `src/components/settings/` — 8 sub-pages incl. `CloudSyncSettings.tsx` (Sprint 17), `ThemeSettings.tsx` (e-ink controls)
  - `src/contexts/` — SettingsContext.tsx, ToastContext.tsx
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts, useNarration, useReaderMode (TD-1), useProgressTracker (TD-1), useEinkController (TD-1)
  - `src/utils/` — text.ts, pdf.ts, rhythm.ts, queue.ts, segmentWords.ts, getOverlayPosition.ts, FlowScrollEngine.ts (replaces FlowCursorController.ts — imperative infinite-scroll engine for Flow Mode), constants.ts
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
  - **Tests** (`tests/`): 47 test files, 932 tests (incl. `tests/flow-scroll-engine.test.js`)
- **CI/CD** (`.github/workflows/`): ci.yml (push/PR, win+linux matrix), release.yml (v* tags + workflow_dispatch, single-job x64+ARM64 NSIS, draft releases, delta updates)
- **Data**: JSON files in user data dir (settings.json, library.json, history.json) with schema versioning + migration framework + cloud sync

### Feature Status

Full feature inventory: `docs/governance/TECHNICAL_REFERENCE.md`. Summary: all core features built — 4-mode reader (Page/Focus/Flow/Narrate), foliate-js EPUB, Kokoro TTS (28 voices, rolling audio queue, smart pause heuristics, epoch-guarded gapless playback), universal EPUB pipeline (all formats + URL articles + Chrome extension articles → EPUB, single rendering path via FoliatePageView), Flow Mode infinite scroll (FlowScrollEngine, shrinking underline cursor, reading zone at 25% viewport, foliate scrolled mode), library management, cloud sync (OneDrive/GDrive), Chrome extension, keyboard-first UX (30+ shortcuts), WCAG 2.1 AA accessibility, Windows installer (x64+ARM64), CI/CD, 932 tests across 47 files.

### What's Next

- **Phase 3: Flow Mode Polish** — narration sync in scroll view, scroll performance optimization, edge cases (FLOW-3B)
- **Phase 4: Blurby Readings** — reading queue, library cards, metadata (READINGS-4A)
- **Code signing** — not doing (explicit decision)
- **Multi-window support** — someday backlog

---

## Dependency Chain

All sprints through FLOW-3A complete (v1.6.0). Full history: `docs/project/ROADMAP_ARCHIVE.md`.

Recent chain:
✅ AUDIT-FIX-1A–1F (stabilization) → ✅ EPUB-2A (content fidelity) → ✅ EPUB-2B (pipeline completion) → ✅ FLOW-3A (infinite scroll)

**Next:** FLOW-3B (Flow Mode polish) → Phase 4 (