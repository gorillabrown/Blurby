# Blurby — Claude Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (CLAUDE.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review CLAUDE.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Claude Code, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., focus reading (ReaderView), flow reading (ScrollReaderView), page reading (PageReaderView), bottom bar (ReaderBottomBar), word index (wordIndex), etc.
5. **Roadmap must spec out at least three sprints in advance** — current + two future sprints fully articulated with acceptance criteria.
5a. **Queue depth below 3 is a stop signal.** If `docs/governance/SPRINT_QUEUE.md` has fewer than three queued sprints, pause implementation work and switch to brainstorming/spec development until the queue is back to at least three.
6. **Aggressively parallelize.** Look for work that Cowork and Claude Code CLI can do simultaneously. Independent tasks run in parallel. Dependent tasks are sequenced. **We cannot waste a second.**
7. **CLAUDE.md stays under ~35k chars.** When approaching threshold, archive completed sprint details to `docs/project/CLAUDE_md_archive_sessionN.md`.
8. **Always print CLI-formatted sprint dispatches.** When dispatching work to Claude Code CLI, produce a compact, ready-to-paste prompt. Dispatches are POINTERS not PAYLOADS — reference the Sprint Queue (which points to ROADMAP.md for the full spec), don't duplicate it. Format: sprint ID, branch, baseline state, link to Sprint Queue.
9. **Always provide a recommendation.** When presenting options, decisions, or status updates, lead with a clear recommendation and rationale. Don't leave decisions hanging — state what you'd do and why.
10. **Do not wipe the workspace.** In this repo, never use cleanup/reset/delete flows to remove local work as a convenience step. If something is uncommitted, we either ignore it, preserve it, or commit it. We do not delete it unless the user explicitly asks for deletion.

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

#### Planning Contract

This repo uses a strict two-layer planning system:

1. **`ROADMAP.md` holds the full spec** for every active sprint. Each sprint section must be execution-ready for Claude Code CLI and include:
   - Goal / problem / design decisions
   - Baseline
   - WHERE (read order)
   - Tasks
   - Execution Sequence
   - SUCCESS CRITERIA
2. **`docs/governance/SPRINT_QUEUE.md` holds the abbreviated dispatch pointers** only. Queue entries are short FIFO summaries that point Claude Code CLI to the full spec in `ROADMAP.md`; they are not the full payload.
3. **Cowork's primary job is plan quality.** Pressure-test scope, sequencing, edge cases, cache/UX implications, spec clarity, and documentation drift so Claude Code can execute with minimal ambiguity.
4. **Execution is selective.** Cowork only performs direct coding or file edits when:
   - the user explicitly asks for implementation, or
   - the work is especially delicate/complex and the user wants Cowork to handle it directly.
5. **Default output for implementation planning work:** update the full `ROADMAP.md` spec first, then update the abbreviated `SPRINT_QUEUE.md` pointer second.
6. **Minimum queue depth is mandatory.** `docs/governance/SPRINT_QUEUE.md` must always keep at least three queued sprints so we can see what is immediately next and what follows after that. If the queue drops below three, stop building and backfill the roadmap/queue before resuming execution work.

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
| `spec-compliance-reviewer.md` | spec-compliance-reviewer | sonnet | Verify every SUCCESS CRITERIA item; produce APPROVED/REJECTED verdict |
| `doc-keeper.md` | doc-keeper | sonnet | Update all 6 governing docs after every sprint |
| `test-runner.md` | test-runner | haiku | Execute tests, categorize failures, report pass/fail |
| `quality-reviewer.md` | quality-reviewer | sonnet | Architecture compliance, known-trap detection, code quality |

#### How Dispatches Work

Sprint dispatches go to `blurby-lead` (the orchestrator). blurby-lead reads the dispatch, loads the sprint spec from ROADMAP.md, and executes the work.

**blurby-lead does all code work itself**, scoped by labels (`electron-fixer`, `renderer-fixer`, `format-parser`) that indicate which files to touch. It **spawns four subagents** for verification and documentation: `test-runner`, `spec-compliance-reviewer`, `quality-reviewer`, and `doc-keeper`.

The dispatch's Task table tells blurby-lead:

- **Which scope** to work in (e.g., `Primary CLI (renderer-fixer scope)`)
- **Which subagents to spawn** for verification steps (test-runner, spec-compliance-reviewer, etc.)
- **What order** — sequential by default, parallel when explicitly marked

#### Agent Scope Labels (Reference)

**Code agents** (make changes):

| Label | Scope | Files |
|-------|-------|-------|
| `electron-fixer` | Main process — IPC handlers, file I/O, data persistence, Electron APIs | `main/`, `main/ipc/`, `preload.js` |
| `renderer-fixer` | React — state, props, hooks, CSS, rendering | `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` |
| `format-parser` | File format integration — EPUB, MOBI, PDF, HTML parsing | `main/epub-converter.js`, `main/legacy-parsers.js`, `main/epub-word-extractor.js` |

**Verification subagents** (read-only review, spawned by blurby-lead):

| Subagent | Scope | Files |
|----------|-------|-------|
| `test-runner` | Test execution and build verification | `tests/`, `package.json` scripts |
| `quality-reviewer` | Architecture compliance, known-trap detection, code quality | Read-only review pass |
| `spec-compliance-reviewer` | Verify every SUCCESS CRITERIA item from the dispatch is met | Read-only, cross-references dispatch spec |

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

- [ ] Every SUCCESS CRITERIA item from the dispatch is met (spec-compliance-reviewer pass)
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
- **Do not clean away local work.** Never run destructive cleanup flows like `git reset --hard`, `git clean`, or equivalent workspace-wiping actions unless the user explicitly requests that exact outcome for this repo.
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
- **Spec-compliance review before quality review.** For multi-task sprints, each task gets a spec-compliance check (does it match the dispatch spec?) before a quality check (is it well-built?). The `spec-compliance-reviewer` subagent performs this step. Full-tier sprints then spawn `quality-reviewer`. Quick-tier sprints use blurby-lead self-review.

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
3. Read `ROADMAP.md` (full active sprint specs)
4. Read `docs/governance/BUG_REPORT.md` (if session involves bug fixes)
5. Read `docs/governance/SPRINT_QUEUE.md` (abbreviated dispatch pointers to ROADMAP specs)

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `global.css`).

### External Audit Cadence

Run a structured codebase audit at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment. See `docs/audit/` for prior audit artifacts and procedure.

---

## Current System State (v1.36.1 — TTS-7Q complete, EINK-6A next, queue YELLOW)

### Codebase (branch: `main`)

- TTS-7 stabilization lane COMPLETE: TTS-7A (v1.29.0) + TTS-7B (v1.30.0) + TTS-7C (v1.31.0) + TTS-7D (v1.32.0). All 15 TTS bugs (BUG-101–115) resolved and verified. Closeout doc in TECHNICAL_REFERENCE.md.
- **TTS-7F hotfix complete** — proactive entry cache coverage + cruise warm, plus clean launch ownership. BUG-116/118/119/120/121 resolved.
- **TTS-7G complete** — BUG-117 verified resolved (response path < 2ms). DEV instrumentation added.
- **TTS-7H complete** — BUG-122/123 resolved. Visible-word readiness, frozen launch index.
- **TTS-7I complete as a first pass** — BUG-124/125/126/127 addressed, but live testing still showed final Foliate integration issues.
- **TTS-7J complete** — BUG-128/129/130 resolved. Single narration section-sync owner, word-source dedupe, explicit user selection protection.
- **TTS-7K complete** — BUG-131/132/133 resolved. Full-book EPUB words promoted as narration source of truth, global index validation for start-word resolution, onWordsReextracted source protection, page-mode isolation from narration-only section navigation. 22 new tests. v1.33.6.
- **TTS-7L complete** — BUG-134 resolved. Exact Foliate text-selection mapping — selectionchange now resolves .page-word span with data-word-index, unified click/selection payload, first-match text fallback demoted. 15 new tests. v1.33.7.
- **TTS-7M complete** — BUG-135 resolved. Persistent resume-anchor — pause captures live cursor, reopen uses saved position, passive onLoad/onRelocate cannot downgrade. 17 new tests. v1.33.8.
- **TTS-7N complete** — BUG-136/137 resolved. Kokoro pause settings now drive word-weight scaling and sentence-boundary chunk snapping. Ctrl+K TTS links repaired to “tts” page. 19 new tests. v1.33.9.
- **TTS-7O complete** — BUG-138/139 resolved. Punctuation-safe pre-send chunk rounding (expanded outward search), real inter-chunk audible silence injection (classifyChunkBoundary → silence samples), 3-word narration window (page-word--narration-context CSS), smooth cursor via CSS transitions, periodic truth-sync every 12 words. 27 new tests. v1.34.0.
- **EXT-5C complete** — BUG-141/142 resolved. Rich article HTML formatting preserved (headings, figures, captions, lists, blockquotes), inline images downloaded and embedded into EPUB (no remote dependency), article-aware hero ranking (body presence > top article image > metadata fallback, rejects junk URLs), hero reliably promoted to coverPath for both URL and extension import paths. Shared downloadArticleImages helper + preDownloadedImages EPUB path unifies both import flows. 24 new tests. v1.35.0.
- **TTS-7P complete** — BUG-140 resolved. Rolling pause-boundary planner (`src/utils/narrationPlanner.ts`) builds local boundary plans for the active text window (next ~400 words). Planner is now the single authority for where chunks may legally end; `generationPipeline.ts` uses planner for chunk selection and silence injection; `kokoroStrategy.ts` passes `getParagraphBreaks`; `useNarration.ts` passes paragraph breaks ref. Dialogue detection included. Two new constants: `TTS_PLANNER_WINDOW_WORDS` (400), `TTS_PLANNER_MIN_CHUNK_WORDS` (10). 33 new tests. v1.36.0.
- **TTS-7Q complete** — BUG-143/144 resolved. Canonical `AudioProgressReport` type + `getAudioProgress()` added to scheduler; `onChunkHandoff` callback wired through `kokoroStrategy.ts` and exposed on `useNarration` hook return; RAF-based glide loop in `FoliatePageView.tsx` drives the 3-word narration band from audio-time progress instead of DOM target chasing; chunk handoff is continuity-safe (visual band can never become the canonical anchor). New `src/utils/narrateDiagnostics.ts` exports diagnostic event types and `getGlideDiagSummary()`. 25 new tests (`tests/audioGlide.test.ts`). v1.36.1.
- Active queue: EINK-6A → EINK-6B (depth 2 — YELLOW, backfill required).
- 1,504 tests across 84 test files
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
  - `main/url-extractor.js` — URL/article extraction, Readability, PDF export, collectArticleAssets, rankHeroImage, isJunkImageUrl
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
    - ~~`FlowScrollView.tsx`~~ — removed in FLOW-3B (dead code since EPUB-2B)
  - `src/modes/` — Mode verticals (TD-1): `PageMode.ts`, `FocusMode.ts`, `FlowMode.ts`, `NarrateMode.ts` + shared types and index
  - `src/components/settings/` — 8 sub-pages incl. `CloudSyncSettings.tsx` (Sprint 17), `ThemeSettings.tsx` (e-ink controls)
  - `src/contexts/` — SettingsContext.tsx, ToastContext.tsx
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts, useNarration, useReaderMode (TD-1), useProgressTracker (TD-1), useEinkController (TD-1)
  - `src/utils/` — text.ts, pdf.ts, rhythm.ts, queue.ts, segmentWords.ts, getOverlayPosition.ts, FlowScrollEngine.ts, constants.ts, authorNormalize.ts, narrationPlanner.ts (TTS-7P — rolling pause-boundary planner for the active text window), narrateDiagnostics.ts (TTS-7Q — glide diagnostic event types and `getGlideDiagSummary()`)
  - `src/types/` — types.ts (BlurbyDoc gains `queuePosition?: number`), foliate.ts (TD-1), narration.ts (TD-1)
  - `src/styles/global.css` — All styles with CSS custom properties, WCAG 2.1 AA compliant
  - Narration uses useReducer state machine with TTS strategy pattern (Web Speech + Kokoro). Kokoro uses 3 native-rate buckets (1.0x/1.2x/1.5x) — no scheduler pitch-shift.
  - Performance: useMemo/useCallback throughout, ref-based DOM updates in readers
- **Test Harness** (`src/test-harness/`): Browser-based E2E testing stub (Sprint CT-1)
    - `electron-api-stub.ts` — Complete `window.electronAPI` surface (73 methods + 10 event listeners) with in-memory state, Meditations seed data, console tracing
    - `mock-kokoro.ts` — Synthetic PCM audio generation (440Hz sine wave) matching Kokoro TTS response shape
    - `stub-loader.ts` — Dynamic import, dev-only injection when `window.electronAPI` is absent
    - `window.__blurbyStub.emit(event, data)` — Manual event triggering for test scripts
    - Auto-injected in `main.tsx` via `import.meta.env.DEV` guard, tree-shaken from production builds
  - **Tests** (`tests/`): 84 test files, 1,504 tests
- **CI/CD** (`.github/workflows/`): ci.yml (push/PR, win+linux matrix), release.yml (v* tags + workflow_dispatch, single-job x64+ARM64 NSIS, d
