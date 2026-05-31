# Blurby — Claude Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (CLAUDE.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review CLAUDE.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Claude Code, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., focus reading (ReaderView), flow reading (ScrollReaderView), page reading (PageReaderView), bottom bar (ReaderBottomBar), word index (wordIndex), etc.
5. **Roadmap must spec out at least three sprints in advance** — current + two future sprints fully articulated with acceptance criteria.
5a. **Queue depth below 3 is a stop signal.** If `docs/governance/sprint-queue.xlsx` has fewer than three queued sprints in the Catalog tab, pause implementation work and switch to brainstorming/spec development until the queue is back to at least three.
5b. **Successful CLI sprints auto-merge by default.** When a sprint passes verification, spec compliance, quality review, and docs closeout, the default CLI closeout path is: stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, and push. A sprint spec must explicitly say otherwise to skip auto-merge.
6. **Aggressively parallelize.** Look for work that Cowork and Claude Code CLI can do simultaneously. Independent tasks run in parallel. Dependent tasks are sequenced. **We cannot waste a second.**
6a. **CLI executes, it does not investigate.** Every sprint dispatched to Claude Code CLI must be fully investigated and spec'd beforehand. CLI receives exact directions — file paths, line numbers, what to change, why. All ambiguity is resolved by Cowork before dispatch. If a bug's root cause is unknown, Cowork investigates first (live debug, code tracing, hypothesis testing). If a feature's design is unresolved, Cowork specs it first. CLI never explores or diagnoses — it builds to spec. A sprint is not dispatch-ready until its investigation gate is cleared.
7. **CLAUDE.md stays under ~35k chars.** When approaching threshold, archive completed sprint details to `docs/planning/CLAUDE_md_archive_sessionN.md`.
8. **Always print CLI-formatted sprint dispatches.** When dispatching work to Claude Code CLI, produce a compact, ready-to-paste prompt. Dispatches are POINTERS not PAYLOADS — reference `docs/governance/sprint-queue.xlsx` (which points to ROADMAP.md for the full spec), don't duplicate it. Format: sprint ID, branch, baseline state, queue row, and ROADMAP spec pointer.
9. **Always provide a recommendation.** When presenting options, decisions, or status updates, lead with a clear recommendation and rationale. Don't leave decisions hanging — state what you'd do and why.
10. **Do not wipe the workspace.** In this repo, never use cleanup/reset/delete flows to remove local work as a convenience step. If something is uncommitted, we either ignore it, preserve it, or commit it. We do not delete it unless the user explicitly asks for deletion.

---

## Division of Labor

### Cowork (you) — Planning & Oversight

You are the **architect and reviewer**. You do NOT write or change code unless the user directly asks you to. Your job:

1. **Brainstorm and design** — Collaborate with the user on features, architecture, UX, and priorities.
2. **Plan work for Claude Code** — Write fully articulated implementation specs with step-by-step directions, agent assignments, and acceptance criteria. Place these in `ROADMAP.md`.
3. **Review results** — After Claude Code agents run, verify every change against spec. Identify drift, gaps, regressions.
4. **Maintain documentation** — Keep CLAUDE.md, ROADMAP.md, and LESSONS_LEARNED.md current (or direct MarcusAurelius to do it).
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
2. **`docs/governance/sprint-queue.xlsx` is the authoritative sprint queue.** The Catalog tab holds abbreviated FIFO dispatch pointers that point Claude Code CLI to the full spec in `ROADMAP.md`; the Dashboard tab summarizes queue health. This workbook is the only sprint queue source of truth.
3. **Cowork's primary job is plan quality.** Pressure-test scope, sequencing, edge cases, cache/UX implications, spec clarity, and documentation drift so Claude Code can execute with minimal ambiguity.
4. **Execution is selective.** Cowork only performs direct coding or file edits when:
   - the user explicitly asks for implementation, or
   - the work is especially delicate/complex and the user wants Cowork to handle it directly.
5. **Default output for implementation planning work:** update the full `ROADMAP.md` spec first, then update the matching `docs/governance/sprint-queue.xlsx` Catalog pointer second.
6. **Minimum queue depth is mandatory.** `docs/governance/sprint-queue.xlsx` must always keep at least three queued sprints in the Catalog tab so we can see what is immediately next and what follows after that. If the queue drops below three, stop building and backfill the roadmap/workbook queue before resuming execution work.
7. **Parallel sprinting requires lane ownership + shared-core freeze.** We only run code-changing sprints in parallel when each sprint declares an owned lane and avoids the shared-core freeze set unless explicitly scheduled for an integration window.

#### Parallel Sprint Policy (Lane Ownership)

When proposing parallel execution, classify each sprint into one or more lanes:

- **Lane A: Runtime Core** — narration/flow state machine and synchronization behavior
- **Lane B: Evaluation Harness** — fixtures, trace schema, runners, scoring artifacts
- **Lane C: UI Surfaces** — controls, settings UI, display-only reader chrome
- **Lane D: Platform/Main Process** — `main/`, preload, IPC contracts, auth/cloud/import
- **Lane E: Governance/Planning** — roadmap, `sprint-queue.xlsx`, close-out/reporting docs

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
| `hercules.md` | Hercules | sonnet | Single-domain implementation — bounded judgment within one module |
| `athena.md` | Athena | opus | Cross-system implementation — architectural judgment, multi-module changes |

**Specialist agents** (verification & support — take priority over doers when task matches):

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `hippocrates.md` | Hippocrates | haiku | Test execution — run suites, categorize failures, report pass/fail |
| `solon.md` | Solon | sonnet | Spec compliance — verify implementation matches every SUCCESS CRITERIA item |
| `plato.md` | Plato | sonnet | Code quality — architecture compliance, known-trap detection |
| `marcusaurelius.md` | MarcusAurelius | sonnet | Documentation — update all governing docs after every sprint |
| `aristotle.md` | Aristotle | opus | Root-cause diagnosis — read-only trace, produces fix specs |
| `simonides.md` | Simonides | sonnet | Memory guide — shared memory system, findings queue, cross-agent continuity |

#### How Dispatches Work

Sprint dispatches go to `Zeus` (the orchestrator). Zeus reads the dispatch, loads the sprint spec from ROADMAP.md, and delegates all work.

**Zeus never writes code.** It decomposes tasks, routes each one to the cheapest appropriate doer agent (Hermes → Hercules → Athena, escalating only as needed), then spawns specialist agents for verification and documentation.

**Task routing decision tree** (from zeus.md):
1. Does a specialist match? (e.g., tests → Hippocrates, diagnosis → Aristotle) → assign specialist
2. Is the change fully prescribed (exact diff known)? → Hermes (haiku)
3. Does the task stay within one module? → Hercules (sonnet)
4. Does it cross module boundaries? → Athena (opus)
5. Fallback → Hercules (can self-escalate)

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
| `MarcusAurelius` | Documentation updates (mandatory penultimate step in every sprint) | `CLAUDE.md`, `ROADMAP.md`, `docs/governance/` |
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

#### Mandatory MarcusAurelius Pass (After Every Sprint)

After EVERY sprint completion — hotfixes included, no exceptions — run the MarcusAurelius pass:

1. **ROADMAP.md** — Update header (version, date, state). Archive completed sprint spec to `docs/planning/.Archive/ROADMAP_legacy.md`. Update Sprint Status table.
2. **sprint-queue.xlsx** — In `docs/governance/sprint-queue.xlsx`, mark the completed sprint complete, clear its active `Seq`, renumber queued rows, and verify queue depth ≥ 3.
3. **CLAUDE.md** — Update version, sprint list, dependency chain, test counts.
4. **LESSONS_LEARNED.md** — Add entry if any non-trivial discovery was made.
5. **BUG_REPORT.md** — Mark any bugs fixed by this sprint as resolved.
6. **TECHNICAL_REFERENCE.md** — Update if architecture changed.

**MarcusAurelius efficiency rule:** Zeus SHOULD pre-compose exact old_string/new_string edit diffs for doc updates and include them in the MarcusAurelius dispatch. This lets MarcusAurelius apply edits directly without re-reading each file to discover what changed. When provided, pre-composed diffs cut MarcusAurelius tool calls by ~50%. When not feasible (e.g., complex multi-section updates), MarcusAurelius falls back to standard read-then-edit.

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
- **Spec-compliance review before quality review.** For multi-task sprints, each task gets a spec-compliance check (does it match the dispatch spec?) before a quality check (is it well-built?). `Solon` performs this step. Full-tier sprints then spawn `Plato`. Quick-tier sprints use Zeus self-review. **For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible in the execution sequence.** Both are read-only — sequential execution wastes time with zero benefit. (Promoted from SRL-012 after two validated occurrences: READER-4M-2 missed parallelization, QWEN-STREAM-2 executed parallel and saved ~65s.)

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
| 7 | **Sprint Queue Workbook** | `docs/governance/sprint-queue.xlsx` | Authoritative upcoming sprint dispatch queue (Catalog FIFO pointers to ROADMAP specs; Dashboard queue health) |

### Other References

- **Project Constitution**: `docs/planning/Blurby_Project_Constitution.md`
- **Agent Definitions**: `.claude/agents/` (Zeus, Hermes, Hercules, Athena, Aristotle, Hippocrates, Solon, Plato, MarcusAurelius, Simonides)
- **Roadmap Archive**: `docs/planning/.Archive/ROADMAP_legacy.md` (completed sprint full specs — reference only)
- **Development Sync SOP**: `docs/governance/DEVELOPMENT_SYNC.md` (local-first git workflow)

---

## Document Lifecycle

### Sprint Lifecycle in Docs

When a sprint **completes**:

1. **sprint-queue.xlsx** — Mark the sprint complete in the Catalog tab, clear its active `Seq`, and update queue depth.
2. **sprint-queue.xlsx** — Renumber the remaining queued rows so the next dispatch is `Seq = 1`; keep the Dashboard accurate.
3. **ROADMAP.md** — Move the full spec section to `docs/planning/.Archive/ROADMAP_legacy.md`. Keep ROADMAP forward-looking only.
4. **ROADMAP.md** — Update Sprint Status table (remove or mark complete).
5. **ROADMAP.md** — Update Execution Order diagram.
6. **CLAUDE.md** — Update "What's NOT Done" list, Dependency Chain, and test counts.
7. **Backfill** — If queue depth drops below 3, spec the next sprint from IDEAS.md or Someday Backlog.

### Where Things Live

| Content | File | Rule |
|---------|------|------|
| Forward-looking sprint specs (full CLI Evergreen) | `ROADMAP.md` | Only upcoming work. Archive on completion. |
| Sprint dispatch queue (summary pointers) | `docs/governance/sprint-queue.xlsx` | Catalog FIFO table → ROADMAP for full spec; Dashboard shows health. ≥3 queued entries. |
| Completed sprint specs | `docs/planning/.Archive/ROADMAP_legacy.md` | Append-only. Reference, don't modify. |
| Completed Cowork plans/specs | `docs/planning/{plans,specs}/.Archive/` | Move on completion. |
| Completed governance sprint files | `docs/planning/.Archive/` | Move on completion. |
| Current system state + agent config | `CLAUDE.md` | Keep under ~35k chars. Archive old sprint details. |
| Bugs (active) | `docs/governance/BUG_REPORT.md` | Remove when fixed + verified. |
| Bug reports (raw, unprocessed) | `docs/governance/bug-reports/` | In-app submissions. Triage → file in BUG_REPORT.md → archive to `.Archive/`. |
| Bug reports (processed) | `docs/governance/bug-reports/.Archive/` | Archived after triage. Reference only. |
| Feature requests (unroadmapped) | `docs/governance/IDEAS.md` | Reviewed at phase pauses. |
| Engineering discoveries | `docs/governance/LESSONS_LEARNED.md` | Append immediately on discovery. |
| Architecture + data model | `docs/governance/TECHNICAL_REFERENCE.md` | Update when architecture changes. |

### Cleanup Cadence

- **Every sprint completion**: Run steps 1-7 above.
- **Every 3rd sprint**: Review `docs/` for stale files. Archive anything from completed work.
- **ROADMAP.md target**: <500 lines. If approaching, check for completed specs that weren't archived.
- **CLAUDE.md target**: <35k chars. Archive completed sprint details to `docs/planning/CLAUDE_md_archive_sessionN.md`.

---

## Workflow Integration

### Session Start Protocol

1. Read `CLAUDE.md` (this file) — rules, agents, current system state
2. Read `docs/governance/LESSONS_LEARNED.md` (if session may change codebase)
3. Read `ROADMAP.md` (full active sprint specs)
4. Read `docs/governance/BUG_REPORT.md` (if session involves bug fixes)
5. Read `docs/governance/sprint-queue.xlsx` (Catalog FIFO dispatch pointers and Dashboard queue health)

### Bug Report Triage Workflow

When `docs/governance/bug-reports/` contains unprocessed `.json` + `.png` files:

1. **Read** all JSON reports and view all screenshots.
2. **Group** reports by root cause or feature area — deduplicate related reports.
3. **File** each unique bug in `docs/governance/BUG_REPORT.md` with next BUG-NNN number. Include: description, severity, location, probable cause, screenshots, fix approach.
4. **Group into hotfix sprints** — batch related bugs into HOTFIX-NN entries in ROADMAP.md. Add matching rows to `docs/governance/sprint-queue.xlsx`.
5. **Archive** processed reports: move all `.json` + `.png` files to `docs/governance/bug-reports/.Archive/`.
6. **Report** findings to user with grouped summary and proposed hotfix sprint structure.

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `global.css`).

### External Audit Cadence

Run a structured codebase audit at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment. See `docs/studies/audit/` for prior audit artifacts and procedure.

### External Audit Outcomes

| # | Date | Scope | Verdict | Key Outcome |
|---|------|-------|---------|-------------|
| 1–8 | 2026-05-15 | TTS Architecture roadmap (8 passes) | Approved for dispatch (9/10) | Spec language tightened, source files verified, architecture approved |
| 9 | 2026-05-17 | TTS post-implementation audit | Conditional approval (7/10) | Three code defects found → TTS-PARITY-1 sprint; re-audit planned as OutsideAudit.10 |

---

## Current System State (v1.75.1 — queue GREEN depth 6, 2 open bugs)

### Codebase (branch: `main`)

**Completed sprint history archived to `docs/planning/CLAUDE_md_archive_session1.md`** (68 sprints, v1.29.0→v1.75.1).

**Active guardrails (from completed sprints):**
- **Diagnostics export guardrail** — Diagnostics exports are evidence artifacts, not user-content artifacts. Do not commit generated local user diagnostics unless an explicit test fixture creates them; raw text and audio-shaped fields must remain redacted/rejected in both producers and validators.
- **Qwen disabled** — Qwen status/generate/stream calls return unavailable with `reason: “qwen-disabled”` and must not start a Qwen runtime for Desktop v2.

**Current operational state:**
- **Engine posture:** Kokoro is the sole active engine; MOSS-Nano and Pocket TTS are dormant/disabled; Qwen is retired/disabled. Desktop v2.0 shipped. KOKORO-EXPORT-1 remains deferred.
- **Queue:** GREEN depth 6 (DIAG-1 + INTENT-CURSOR-1 done; 3 full specs queued: PAUSE-RESUME-UNIFY-1 Seq1, A5-RATE-RESEED-1 Seq2, APPLYRATECHANGE-COLLAPSE-1 Seq3; 1 gated: SUBSCRIBER-CURSOR-1 Seq4; 2 stubs: UX-POLISH-1 Seq5, HYG-XLSX-DASHBOARD-RESTORE Seq6). Next: NARRATE-PAUSE-RESUME-UNIFY-1 — cold-start resume seed must prefer heardFloor/resumeTarget over stale anchor (completes A4 fix). All narration unification sprints are shared-core and must run sequentially.
- **Open bugs:** 2 — BUG-154 (parked, likely not a bug, needs live verification), BUG-184 (einkMode ON strips Settings panel background; filed 2026-05-29, XS CSS fix).
- **Deferred lanes:** MOSS-Nano (dormant), Pocket TTS (dormant), Qwen Streaming (ITERATE), Android APK, Cloud Sync, RSS/News — all beyond TTS Architecture Complete finish line.
- **Most recent sprint:** NARRATE-INTENT-CURSOR-1 — resume-anchor consume lifecycle (PARTIAL: A1 PASS, A4 FAIL 0-of-3 — reactive not preventive; PAUSE-RESUME-UNIFY-1 completes). Prior: NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30), THEME-SYNC-1 (2026-05-29).
- 3,044 tests across 213 test files
- CI/CD active via GitHub Actions (split x64+ARM64 builds, --publish never + explicit gh upload, nsis-web stub installer). Quality gate: `npm run test:quality` runs in CI (`quality-gate` job, ubuntu-only, paths-filtered for TTS surfaces)
- Governance tooling: `scripts/recalc.py` refreshes xlsx formula caches after openpyxl edits (`python scripts/recalc.py [--dry-run] <path>`)
- Performance baseline: 21 automated benchmarks via `npm run perf`

### Tech Stack

- Electron 41 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 26 for packaging
- foliate-js for EPUB rendering (primary reader for EPUBs)
- Kokoro TTS engine (28 voices, worker thread, q4 quantization) — sole active engine. MOSS-Nano dormant/disabled; Pocket TTS dormant/disabled; Qwen retired/disabled.
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), chokidar (folder watch, lazy-loaded), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater, docx (.docx notes export), exceljs (.xlsx reading log), opusscript (Opus audio encoding/decoding), mammoth (DOCX→HTML, lazy-loaded)

### Architecture

- **Main process** — modularized with domain-split IPC:
