# Blurby — Claude Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (CLAUDE.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review CLAUDE.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Claude Code, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., focus reading (ReaderView), flow reading (ScrollReaderView), page reading (PageReaderView), bottom bar (ReaderBottomBar), word index (wordIndex), etc.
5. **Roadmap must spec out at least three sprints in advance** — current + two future sprints fully articulated with acceptance criteria.
5a. **Queue depth below 3 is a stop signal.** If `docs/governance/SPRINT_QUEUE.md` has fewer than three queued sprints, pause implementation work and switch to brainstorming/spec development until the queue is back to at least three.
5b. **Successful CLI sprints auto-merge by default.** When a sprint passes verification, spec compliance, quality review, and docs closeout, the default CLI closeout path is: stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, and push. A sprint spec must explicitly say otherwise to skip auto-merge.
6. **Aggressively parallelize.** Look for work that Cowork and Claude Code CLI can do simultaneously. Independent tasks run in parallel. Dependent tasks are sequenced. **We cannot waste a second.**
6a. **CLI executes, it does not investigate.** Every sprint dispatched to Claude Code CLI must be fully investigated and spec'd beforehand. CLI receives exact directions — file paths, line numbers, what to change, why. All ambiguity is resolved by Cowork before dispatch. If a bug's root cause is unknown, Cowork investigates first (live debug, code tracing, hypothesis testing). If a feature's design is unresolved, Cowork specs it first. CLI never explores or diagnoses — it builds to spec. A sprint is not dispatch-ready until its investigation gate is cleared.
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
4. **Maintain documentation** — Keep CLAUDE.md, ROADMAP.md, and LESSONS_LEARNED.md current (or direct Herodotus to do it).
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
7. **Parallel sprinting requires lane ownership + shared-core freeze.** We only run code-changing sprints in parallel when each sprint declares an owned lane and avoids the shared-core freeze set unless explicitly scheduled for an integration window.

#### Parallel Sprint Policy (Lane Ownership)

When proposing parallel execution, classify each sprint into one or more lanes:

- **Lane A: Runtime Core** — narration/flow state machine and synchronization behavior
- **Lane B: Evaluation Harness** — fixtures, trace schema, runners, scoring artifacts
- **Lane C: UI Surfaces** — controls, settings UI, display-only reader chrome
- **Lane D: Platform/Main Process** — `main/`, preload, IPC contracts, auth/cloud/import
- **Lane E: Governance/Planning** — roadmap, sprint queue, close-out/reporting docs

#### Shared-Core Freeze Set

Only one active sprint may edit this set at a time unless a planned integration window is explicitly declared in ROADMAP:

- `src/hooks/useNarration.ts`
- `src/hooks/useFlowScrollSync.ts`
- `src/components/ReaderContainer.tsx`
- `src/utils/FlowScrollEngine.ts`
- `src/types.ts`

#### Dispatch Requirements for Parallel Sprints

Every parallel-ready sprint spec in `ROADMAP.md` must include:

1. `Lane Ownership` section (which lanes it owns)
2. `Forbidden During Parallel Run` section (files/areas it must not touch)
3. `Shared-Core Touches` section (empty or explicitly scheduled integration window)
4. `Merge Order` section (which sprint lands first if both are active)

If any of these are missing, the sprint is NOT parallel-dispatch-ready.

### Claude Code CLI — All Execution

**IMPORTANT: This section is read by Claude Code CLI as its system prompt. Follow these instructions directly.**

#### Mandatory Session-Start Protocol

Before writing ANY code, you MUST read these files in this order. No exceptions. No shortcuts.

1. **`CLAUDE.md`** (this file) — You're already reading it. Note the Standing Rules below.
2. **`.claude/agents/zeus.md`** — The orchestrator protocol. Defines the mandatory sprint execution sequence (READ → PLAN → IMPLEMENT → TEST → VERIFY → DOCUMENT → GIT → REPORT). Follow this sequence exactly. Zeus never writes code — all implementation is delegated to doer agents.
3. **`docs/governance/LESSONS_LEARNED.md`** — Scan for entries tagged with the areas you're about to touch. These are hard-won guardrails. Violating them causes regressions.
4. **`ROADMAP.md`** — Find the sprint/hotfix section for your current task. Read the full spec including WHERE, Tasks, and SUCCESS CRITERIA.
5. **Source files listed in the dispatch's WHERE section** — Read them in the listed order before making changes.

If your dispatch references a LESSONS_LEARNED entry by number (e.g., "LL-051"), you MUST read that specific entry and follow its guardrail.

#### Agent Definition Files

Agent `.md` files in `.claude/agents/` define the scope, output contract, and strict rules for each agent role. Each file has YAML frontmatter that Claude Code uses for auto-discovery, model assignment, and tool permissions.

**Orchestrator:**

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `zeus.md` | Zeus | opus | Sprint orchestrator — decomposes tasks, dispatches doer agents, spawns specialists. **Never writes code.** |

**Doer agents** (implementation — Zeus selects cheapest tier that can handle each task):

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `hermes.md` | Hermes | haiku | Mechanical execution — prescribed diffs, config edits, version bumps, git ops |
| `hephaestus.md` | Hephaestus | sonnet | Single-domain implementation — bounded judgment within one module |
| `athena.md` | Athena | opus | Cross-system implementation — architectural judgment, multi-module changes |

**Specialist agents** (verification & support — take priority over doers when task matches):

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `hippocrates.md` | Hippocrates | haiku | Test execution — run suites, categorize failures, report pass/fail |
| `solon.md` | Solon | sonnet | Spec compliance — verify implementation matches every SUCCESS CRITERIA item |
| `plato.md` | Plato | sonnet | Code quality — architecture compliance, known-trap detection |
| `herodotus.md` | Herodotus | sonnet | Documentation — update all governing docs after every sprint |
| `aristotle.md` | Aristotle | opus | Root-cause diagnosis — read-only trace, produces fix specs |
| `simonides.md` | Simonides | sonnet | Memory guide — shared memory system, findings queue, cross-agent continuity |

#### How Dispatches Work

Sprint dispatches go to `Zeus` (the orchestrator). Zeus reads the dispatch, loads the sprint spec from ROADMAP.md, and delegates all work.

**Zeus never writes code.** It decomposes tasks, routes each one to the cheapest appropriate doer agent (Hermes → Hephaestus → Athena, escalating only as needed), then spawns specialist agents for verification and documentation.

**Task routing decision tree** (from zeus.md):
1. Does a specialist match? (e.g., tests → Hippocrates, diagnosis → Aristotle) → assign specialist
2. Is the change fully prescribed (exact diff known)? → Hermes (haiku)
3. Does the task stay within one module? → Hephaestus (sonnet)
4. Does it cross module boundaries? → Athena (opus)
5. Fallback → Hephaestus (can self-escalate)

The dispatch's Task table tells Zeus:

- **Which doer tier** to use for each implementation task
- **Which specialists to spawn** for verification steps
- **What order** — sequential by default, parallel when explicitly marked

#### Agent Scope Labels (Reference)

**Code scope labels** (applied to doer agent tasks):

| Label | Scope | Files |
|-------|-------|-------|
| `electron-scope` | Main process — IPC handlers, file I/O, data persistence, Electron APIs | `main/`, `main/ipc/`, `preload.js` |
| `renderer-scope` | React — state, props, hooks, CSS, rendering | `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` |
| `format-scope` | File format integration — EPUB, MOBI, PDF, HTML parsing | `main/epub-converter.js`, `main/legacy-parsers.js`, `main/epub-word-extractor.js` |

**Specialist agents** (spawned by Zeus for verification and support):

| Agent | Scope | Files |
|-------|-------|-------|
| `Hippocrates` | Test execution and build verification | `tests/`, `package.json` scripts |
| `Solon` | Verify every SUCCESS CRITERIA item from the dispatch is met | Read-only, cross-references dispatch spec |
| `Plato` | Architecture compliance, known-trap detection, code quality | Read-only review pass |
| `Herodotus` | Documentation updates (mandatory penultimate step in every sprint) | `CLAUDE.md`, `ROADMAP.md`, `docs/governance/` |
| `Aristotle` | Root-cause analysis when investigation is needed | Read-only diagnosis + fix spec |
| `Simonides` | Cross-agent memory, findings queue, continuity | `.claude/agents/memory/` |

**Orchestration:**

| Agent | Scope | Files |
|-------|-------|-------|
| `Zeus` | Sprint orchestrator — task decomposition, agent dispatch, progress tracking | All (read), delegates all writes |

#### Post-Completion Checklist

Before committing, verify ALL of these:

- [ ] Every SUCCESS CRITERIA item from the dispatch is met (Solon pass)
- [ ] `npm test` passes (1,575+ tests, 0 failures)
- [ ] `npm run build` succeeds (if UI changes were made)
- [ ] No files were accidentally truncated (check `git diff --stat` for unexpected size changes)
- [ ] LESSONS_LEARNED guardrails were not violated
- [ ] Changes are scoped to the files listed in the dispatch — no drive-by edits
- [ ] Spec-compliance self-review passed (code matches dispatch spec line-by-line)
- [ ] Quality self-review passed (architecture rules, known traps, code clarity)

#### Mandatory Herodotus Pass (After Every Sprint)

After EVERY sprint completion — hotfixes included, no exceptions — run the Herodotus pass:

1. **ROADMAP.md** — Update header (version, date, state). Archive completed sprint spec to `docs/project/ROADMAP_ARCHIVE.md`. Update Sprint Status table.
2. **SPRINT_QUEUE.md** — Remove completed sprint from queue. Add to "Completed Sprints" table. Verify queue depth ≥ 3.
3. **CLAUDE.md** — Update version, sprint list, dependency chain, test counts.
4. **LESSONS_LEARNED.md** — Add entry if any non-trivial discovery was made.
5. **BUG_REPORT.md** — Mark any bugs fixed by this sprint as resolved.
6. **TECHNICAL_REFERENCE.md** — Update if architecture changed.

**Herodotus efficiency rule:** Zeus SHOULD pre-compose exact old_string/new_string edit diffs for doc updates and include them in the Herodotus dispatch. This lets Herodotus apply edits directly without re-reading each file to discover what changed. When provided, pre-composed diffs cut Herodotus tool calls by ~50%. When not feasible (e.g., complex multi-section updates), Herodotus falls back to standard read-then-edit.

### Standing Rules

- **READ BEFORE YOU WRITE.** Every CLI session MUST read `docs/governance/LESSONS_LEARNED.md` and the relevant ROADMAP section BEFORE making any code changes. This is non-negotiable. Skipping this step causes regressions.
- **Do not clean away local work.** Never run destructive cleanup flows like `git reset --hard`, `git clean`, or equivalent workspace-wiping actions unless the user explicitly requests that exact outcome for this repo.
- **Branch-per-sprint.** One branch per sprint dispatch (`sprint/<N>-<name>`). Never commit directly to main. After a successful sprint, merge to `main` with `--no-ff` and push unless the sprint spec explicitly says not to. Delete branch after merge.
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
- **Dispatch sizing: 40 tool-use ceiling per wave.** A single Zeus dispatch must stay under ~40 tool uses. **Sprints with 5+ implementation tasks MUST be pre-split into waves at dispatch time** (don't wait for a runtime ceiling hit). Standard wave split: Wave A = implement + test, Wave B = verify + docs + git. Each wave is a separate CLI dispatch. Estimate: 1 tool use per file read, 1-2 per file write, 3-5 per sub-agent spawn, 1 per bash command.
- **Parallel-safe execution beats queue speed theater.** Do not dispatch two sprints in parallel if both touch the shared-core freeze set. Run them sequentially or split one sprint so only non-core scaffolding runs in parallel.
- **Verify file integrity after changes.** Run `git diff --stat` before committing. If any file shows an unexpected size decrease, check for truncation.
- **Verification gate is mandatory.** After completing any code-change task, verify: tests pass, behavior matches spec, no regressions, edge cases covered, documentation current. A task is NOT complete until verification evidence exists.
- **Spec-compliance review before quality review.** For multi-task sprints, each task gets a spec-compliance check (does it match the dispatch spec?) before a quality check (is it well-built?). `Solon` performs this step. Full-tier sprints then spawn `Plato`. Quick-tier sprints use Zeus self-review.

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
- **Agent Definitions**: `.claude/agents/` (Zeus, Hermes, Hephaestus, Athena, Aristotle, Hippocrates, Solon, Plato, Herodotus, Simonides)
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
| Bug reports (raw, unprocessed) | `docs/bug-reports/` | In-app submissions. Triage → file in BUG_REPORT.md → archive to `.Archive/`. |
| Bug reports (processed) | `docs/bug-reports/.Archive/` | Archived after triage. Reference only. |
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

### Bug Report Triage Workflow

When `docs/bug-reports/` contains unprocessed `.json` + `.png` files:

1. **Read** all JSON reports and view all screenshots.
2. **Group** reports by root cause or feature area — deduplicate related reports.
3. **File** each unique bug in `docs/governance/BUG_REPORT.md` with next BUG-NNN number. Include: description, severity, location, probable cause, screenshots, fix approach.
4. **Group into hotfix sprints** — batch related bugs into HOTFIX-NN entries in ROADMAP.md. Add to SPRINT_QUEUE.md.
5. **Archive** processed reports: move all `.json` + `.png` files to `docs/bug-reports/.Archive/`.
6. **Report** findings to user with grouped summary and proposed hotfix sprint structure.

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `global.css`).

### External Audit Cadence

Run a structured codebase audit at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment. See `docs/audit/` for prior audit artifacts and procedure.

---

## Current System State (v1.50.0 — queue YELLOW depth 2, 3 priority tracks roadmapped, 1 open bug)

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
- **TTS-7Q shipped** — BUG-143/144 resolved. Canonical `AudioProgressReport` type + `getAudioProgress()` added to scheduler; `onChunkHandoff` callback wired through `kokoroStrategy.ts` and exposed on `useNarration` hook return; RAF-based glide loop in `FoliatePageView.tsx` drives the 3-word narration band from audio-time progress instead of DOM target chasing; chunk handoff is continuity-safe (visual band can never become the canonical anchor). New `src/utils/narrateDiagnostics.ts` exports diagnostic event types and `getGlideDiagSummary()`. 25 new tests (`tests/audioGlide.test.ts`). v1.36.1.
- **TTS-7R complete** — BUG-145a/b/c resolved. Separated canonical audio cursor from visual cursor (`lastConfirmedAudioWordRef`), enabled audio-progress glide (removed `SIMPLE_NARRATION_GLIDE`), fixed-size overlay band (measure-once line-height), truth-sync visual-only pathway, removed per-word context CSS. 25 new tests (`tests/calmNarrationBand.test.ts`). v1.37.0.
- **HOTFIX-12 complete** — BUG-146/147/148/149/150 resolved. Chapter dropdown tracks narration cursor, floating return-to-narration button, position restore toast, chunked EPUB extraction (setImmediate yield), keyboard guard refined (Escape-only for inputs) + Ctrl+Enter submit in bug reporter. 17 new tests. v1.37.1.
- **SELECTION-1 complete** — Word anchor contract: soft/hard selection tiers, mode start resolution chain, BUG-151/152/153 resolved. 17 new tests. v1.38.0.
- **HOTFIX-14 partial complete** — BUG-157 (disconnect button) + BUG-158 (library flap) shipped v1.38.1. BUG-155/156 investigation complete, fix specs CLI-ready.
- **HOTFIX-14 complete** — URL extraction fetchWithBrowser fallback (BUG-155), authenticated-only client count + 5s status polling + 15s heartbeat (BUG-156). 12 new tests (1,575 total across 88 files). v1.38.2.
- **EXT-ENR-A complete** — Resilient extension connection: exponential backoff with jitter (1s→30s cap), pending article persistence in chrome.storage.local, article-ack delivery confirmation, EADDRINUSE retry cap (10 attempts), server-side auth timeout (5s), three-state connection indicator (connected/connecting/disconnected), service worker lifecycle hooks (onStartup/onInstalled). 18 new tests. v1.39.0.
- **NARR-CURSOR-1 complete** — Collapsing narration cursor: overlay right-edge anchored to `<p>` ancestor, left edge advances rightward with narration, width derived per tick as `colRight - leftEdge`. CSS simplified (2-stop gradient, no transform transition). NARRATION_BAND_PAD_PX removed. 16 new tests. v1.40.0.
- **FLOW-INF-A complete** — CSS mask-image reading zone with configurable position/size. FlowScrollEngine computes dynamic zone position from `--flow-zone-top` / `--flow-zone-size` CSS custom properties. ReaderBottomBar exposes zone controls (position slider, size slider) in flow mode. ResizeObserver triggers zone recomputation on container resize. 27 new tests. v1.41.0.
- **FLOW-INF-B complete** — Timer bar cursor (5px/6px e-ink, accent glow, line-completion flash). FlowProgress computation with chapter/book percentage + estimated time remaining. ReaderBottomBar progress display. 18 new tests. v1.42.0.
- **EXT-ENR-B complete** — Push event system for Chrome extension auto-discovery. Server emits `ws-connection-attempt` and `ws-pairing-success` push events. `PairingBanner` component appears in library screen when extension tries to connect — shows pairing code with countdown, auto-dismisses on success, suppresses when already connected, 60s cooldown on dismiss. `ConnectorsSettings` polling reduced from 5s to 15s. 29 new tests (`tests/autoDiscoveryPairing.test.ts`). v1.43.0.
- **HOTFIX-15 complete** — BUG-159/160/161 resolved. colRight ancestor tightened to `p, blockquote, li, figcaption` + width guard (95% container cap) + null guard. Proportional band height (`lineHeight * 1.08`) + dynamic re-measurement on word change (>2px threshold). Truth-sync interval halved from 12→6 words. 16 new tests (`tests/narrationCursorPolish.test.ts`, 2 updated). v1.43.1.
- **NARR-TIMING complete** — Real word-level timestamps from Kokoro TTS. kokoro-js fork surfaces duration tensor via patch-package. 4-layer validation: token-count check, fail-closed token walk, waveform drift (split accumulator), scheduler acceptance (monotonicity, bounds, scaled tolerance). `computeWordBoundaries` prefers real timestamps, falls back to `computeWordWeights` heuristic. Full IPC chain wired (types.ts, preload.js, ipc/tts.js, tts-engine.js, tts-worker.js, kokoroStrategy.ts, generationPipeline.ts, audioScheduler.ts). BUG-161 fully resolved. 18 new tests (`tests/narrTiming.test.ts`). v1.44.0.
- **STAB-1A complete** — BUG-162/163/164/165 resolved. `.foliate-loading` CSS (pulsing backdrop), async `wrapWordsInSpans` (batched setTimeout yields), TTS preload verified wired on book open, sentence-snap tolerance ±15→±25, FlowScrollEngine `buildLineMap()` retry (5×100ms) + instant initial scroll. 19 new tests (`tests/startupStabilization.test.ts`). v1.45.0.
- **FLOW-INF-C complete** — Cross-book continuous reading. Finishing a book in flow mode with a non-empty queue shows transition overlay (2.5s countdown), then auto-opens next book and resumes flow. `getNextQueuedBook()` utility, `finishReadingWithoutExit()` for seamless book switching without unmounting ReaderContainer, Escape/click-to-cancel. 21 new tests (`tests/crossBookFlow.test.ts`). v1.46.0.
- **PERF-1 complete** — Full performance audit & remediation. Startup parallelized (`loadState`→`createWindow`→`Promise.all([initAuth,initSyncEngine])`→deferred folder sync), folder watcher starts before sync, `getComputedStyle` cached in `injectStyles` (3→1 call), settings saves debounced (500ms), WPM persistence debounced (300ms), EPUB chapter cache LRU eviction (50-cap), snoozed doc check indexed via Set, voice sync effect deps reduced (7→2), Vite code splitting (vendor/tts/settings chunks, 16 JS chunks), `rebuildLibraryIndex` debounced (100ms). 32 new tests (`tests/perfAudit.test.ts`). v1.47.0.
- **REFACTOR-1A complete** — ReaderContainer decomposition: 33 useEffects extracted into 5 custom hooks (useNarrationSync, useNarrationCaching, useFlowScrollSync, useFoliateSync, useDocumentLifecycle). fileHashes cleanup on document delete. main.js constants extracted to main/constants.js. 74 new tests. v1.48.0.
- **REFACTOR-1B complete** — FoliatePageView helpers extracted to `src/utils/foliateHelpers.ts` + `foliateStyles.ts` (1,947→1,724 lines), TTSSettings split into 3 sub-components (874→583 lines), 179→27 inline styles, global.css (5,406 lines) split into 8 domain files + `src/styles/index.css`, new `src/styles/tts-settings.css` (418 lines), 6 empty catch blocks annotated. 32 new tests (`tests/componentStyleCleanup.test.ts`). v1.49.0.
- **TEST-COV-1 complete** — critical path coverage + security hardening landed: URL scheme validation shared across `addDocFromUrl`, `site-login`, and `open-url-in-browser`; Google and Microsoft 401 retries now force token refresh instead of replaying cached tokens. 75 new tests. v1.50.0.
- **NARR-LAYER-1A complete** — narration-as-flow foundation shipped (`isNarrating`, follower mode, flow+narration handoff). v1.51.0.
- **NARR-LAYER-1B complete** — narration mode removed from core contracts, settings migration to flow-layer narration, overlay removal and consolidation. v1.52.0.
- **READER-4M-1 complete** — explicit four-mode reader foundation shipped at v1.63.0. `FoliatePageView` now exposes rendered-word roots directly to `FlowScrollEngine`, Flow boot/rebuild waits on `waitForSectionReady()` plus `foliateRenderVersion`, shared `ReaderMode` / persisted last-mode fields now include `narrate`, keyboard compatibility is localized, and the Foliate `onLoad` path now treats `narrate` as a flow-surface mode. Verification passed with focused reader/foundation suites, full `npm test` (`125` files, `2021` tests), and `npm run build`; existing circular-chunk warning unchanged.
- **TTS-EVAL-1 complete** — quality harness baseline shipped: trace schema/types, fixture corpus, opt-in trace sink instrumentation, first-audio timing, runner + metrics summaries, lifecycle/handoff tests, reviewer template/runbook, and baseline artifacts. v1.53.0.
- **TTS-EVAL-2 complete** — matrix + soak harness expansion shipped: scenario manifest, soak profiles, deterministic artifact model, matrix/soak runner modes, p50/p95 startup + drift aggregate summaries, and runner validation suite. v1.54.0.
- Active queue: depth 3 — GREEN. Next: READER-4M-2; READER-4M-3 remains queued behind it, and `EINK-6A` stays parked as the fallback third pointer.
- 1 open bug: BUG-154 (parked — likely not a bug, needs live verification). EINK/GOALS parked. Three priority tracks roadmapped: Flow Infinite Reader, Chrome Extension Enrichment, Android APK.
- ROADMAP_V2.md archived (2026-04-06). Single source of truth: ROADMAP.md.
- IDEAS.md reorganized into 11 themed groups (A through K) with roadmap alignment.
- 1,972 tests across 113 test files
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
  - `main/aut
