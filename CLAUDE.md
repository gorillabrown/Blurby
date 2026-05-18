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

1. **ROADMAP.md** — Update header (version, date, state). Archive completed sprint spec to `docs/planning/.Archive/ROADMAP_legacy.md`. Update Sprint Status table.
2. **sprint-queue.xlsx** — In `docs/governance/sprint-queue.xlsx`, mark the completed sprint complete, clear its active `Seq`, renumber queued rows, and verify queue depth ≥ 3.
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
- **Agent Definitions**: `.claude/agents/` (Zeus, Hermes, Hephaestus, Athena, Aristotle, Hippocrates, Solon, Plato, Herodotus, Simonides)
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
| Current system state + agent config | `CLAUDE.md` | Keep under ~20k chars. Archive old sprint details. |
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

| # | Date | Scope | Auditor | Verdict | Key Outcome |
|---|------|-------|---------|---------|-------------|
| 1 | 2026-05-15 | Full TTS Architecture roadmap | 3rd-party (deep research) | Conditional approval (5/10) | Spec language tightened in 4 sprints; segment identity Phase 0 hard gate added; effort increased on 2 sprints; no new sprints added; governance framing corrected |
| 2–7 | 2026-05-15 | Targeted re-audits (remediation passes) | 3rd-party (deep research) | Progressive improvement (6→7→8→8→8→8) | Line citations fixed, future constructs labeled, ROADMAP split to SPECS companion, source files added incrementally |
| 8 | 2026-05-15 | Targeted re-audit (final cited files) | 3rd-party (deep research) | **Approved for dispatch (9/10)** | useNarration.ts + FoliatePageView.tsx added; all cited source files verified present; architecture approved as dispatch-ready |
| 9 | 2026-05-17 | Full TTS post-implementation audit | 3rd-party (deep research) | Conditional approval (7/10) | Three code defects found (cache silence parity, trusted progress lag, resume backpressure); TTS-PARITY-1 sprint added; NARR-SPOKEN-1 moved earlier; two packaging gaps fixed; re-audit planned as OutsideAudit.10 |

---

## Current System State (v1.75.1 — queue GREEN depth 6, Kokoro-only TTS Architecture Completion + research-driven enrichment, 1 open bug)

### Codebase (branch: `main`)

- **TTS-REGISTRY-1 complete** — Provider capability truth now lives in `src/types/ttsProvider.ts` and `src/utils/ttsProviderRegistry.ts` for Web Speech, Kokoro, disabled Qwen, MOSS-Nano, and Pocket TTS. Settings/status surfaces read scoped provider labels, posture, and readiness hints from the registry. Kokoro remains default/available, Qwen remains disabled/unselectable, and runtime playback behavior is unchanged. Verification passed: focused 6 files / 32 tests, broader TTS/settings/narration 9 files / 52 tests, full `npm test` 183 files / 2629 tests, `npm run typecheck`, `npm run build`, and `git diff --check`.
- **TTS-NORMALIZE-1 complete** — `src/utils/segmentNormalizer.ts` adds pure English-first spoken-text normalization with original/normalized text, locale, ordered transforms, `TTS_NORMALIZER_VERSION`, stable hashes, and pronunciation override hash. Golden fixtures cover prose, dialogue, headings/Roman numerals, line breaks, currency, dates/times, abbreviations, ordinals/cardinals, and safe footnote markers. Kokoro receives normalized spoken text while scheduler/display words remain original; cache identity includes normalizer version plus source/normalized hash pair with no destructive migration. Verification passed: focused 4 files / 38 tests, broader TTS/provider/settings 8 files / 56 tests, serialized full `npm test -- --maxWorkers=1` 184 files / 2634 tests, `npm run typecheck`, `npm run build`, and `git diff --check`. Default parallel `npm test` reruns were resource-sensitive in pre-existing MOSS Nano performance-threshold tests, which passed isolated.
- **TTS-CACHE-TIMING-1 complete** — `main/tts-cache.js` now supports schema-versioned v2 structured cache identities and atomic `.timing.json` sidecars while preserving legacy v1 cache reads. V2 identity records provider, voice, rate bucket, model/version, source/normalized hashes, normalizer version, pronunciation override hash, document locator, chunk ID, sample rate, and timing truth; disk paths use safe hashes under `tts-cache/v2/`. Word timestamps are returned from cache only when sidecar timing is trusted. No default-engine change, Qwen reactivation, Kokoro retirement, destructive cache wipe, or export work shipped. Verification passed for focused cache/timing/Kokoro/background suite 8 files / 75 tests, `npm run typecheck`, `npm run build`, and `git diff --check`; full serialized `npm test -- --maxWorkers=1` only failed the pre-existing MOSS Nano performance probe.
- **TTS-SYNC-1 landed on main** — `src/utils/timingMetadataStore.ts` and `src/utils/highlightSyncController.ts` centralize narration highlight sync policy from source branch `sprint/tts-sync-1-highlight-controller` (`142dc24`), now landed via ordered integration merge `82aa76d`. Trusted word-native timing can drive word-synced decisions; heuristic/missing timing downgrades to chunk/segment decisions with no invented active word. Scheduler/Kokoro/useNarration publish and store timing metadata, and `ReaderContainer` consumes controller decisions without changing Flow's WPM clock, Narrate's spoken-timing clock, autoplay behavior, Qwen/provider defaults, or `lastConfirmedAudioWordRef` ownership.
- **TTS-DIAG-1 landed on main** — `src/utils/narrateDiagnostics.ts`, `useNarration`, `TTSSettings`, and `scripts/tts_eval_runner.mjs` add the redacted provider-neutral `tts-diagnostics-v1` bundle from source branch `sprint/tts-diag-1-diagnostics-bundle` (`c97e446`), now landed via ordered integration merge `04c033a`. The bundle captures provider, engine/voice/rate, segment/hash, cache key, timing sidecar, scheduler, highlight decision, and relevant error metadata without audio payloads or raw book text by default; validators strip/reject raw text and audio-shaped fields.
- **Diagnostics export guardrail** — Diagnostics exports are evidence artifacts, not user-content artifacts. Do not commit generated local user diagnostics unless an explicit test fixture creates them; raw text and audio-shaped fields must remain redacted/rejected in both producers and validators.
- **TTS-INTEGRATE-1 complete** — Clean integration branch `sprint/tts-integrate-1-sync-diag-main` merged `origin/sprint/tts-sync-1-highlight-controller` first (`82aa76d`) and `origin/sprint/tts-diag-1-diagnostics-bundle` second (`04c033a`). Verification passed: focused sync slice 4 files / 37 tests, focused diagnostics slice 4 files / 18 tests, `npm run typecheck`, `npm run build`, full `npm test` (183 files passed, 1 skipped; 2463 passed, 132 skipped), and `git diff --check`.
- **NARR-MEDIA-1 complete** — MediaSession integration shipped: `src/utils/mediaSessionBridge.ts`, `useNarration.ts`, `useNarrationSync.ts`. OS media controls (lock screen, Bluetooth headphones, media keyboards) now control narration play/pause/next/previous. Sentence-level track navigation via narrationPlanner. 52 tests across 5 files. v1.75.1.
- **NARR-PAUSE-1 complete** — Named-pause state machine shipped: 7 pause reasons (`user-stop`, `rate-change`, `voice-change`, `forward-seek`, `backward-seek`, `mode-switch`, `book-end`) with auto-resume for rate/voice changes, seek-to-position resume, MediaSession awareness. Touched `narration.ts`, `useNarration.ts`, `mediaSessionBridge.ts`, `useReaderMode.ts`, `useFlowScrollSync.ts`. New `namedPause.test.ts`.
- **TTS-PARITY-1 complete** — Cache write/read now persists post-silence audio with `silenceMs` metadata round-trip, `getAudioProgress()` bypasses artificial lag for trusted word-native timing, and `pipelineResume()` caps its initial flush and drains remainder on demand via `acknowledgeChunk()` — 6 files changed, 123 focused tests passing. Three OutsideAudit.9 defects resolved. SRL-043 (backpressure drain). Merged at 67c6898.
- **NARR-SPOKEN-1 complete** — New `spokenWordFilter.ts` separates spoken words from display words so Kokoro only receives pronounceable tokens. `kokoroStrategy.ts` sends filtered spoken words to Kokoro and remaps timestamps back to display indices via `spokenToDisplayMap`. Eliminates the most common source of zero-duration timestamp heuristic fallback. 72 focused tests across 4 files. Merged at bb3c69a.
- **Queue pointer** — `docs/governance/sprint-queue.xlsx` is the authoritative queue source. Next approved sprint is NARR-CURSOR-2, dispatch-ready on `main`. Queue depth is 4 (2 full specs + 2 stubs): NARR-CURSOR-2 → TTS-EVAL-3 → UX-POLISH-1 → TTS-QUAL-CI-1. NARR-SPOKEN-1 is complete and landed.
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
- **READER-4M-2 complete** — Standalone Narrate mode + four-button bottom-bar controls. N key is now universal Narrate entry from any mode. T narration toggle removed. Pause/resume verified in-mode. 14 new tests. v1.69.0.
- **READER-4M-3 complete** — Canonical global word anchor + spoken-truth Narrate continuity shipped at v1.72.0. Page/focus/flow/narrate now resolve through one mode-aware anchor contract, Flow↔Narrate preserve the same shared-surface position, progress/backtrack save against the canonical anchor, and Foliate Narrate highlighting follows `narration.cursorWordIndex` instead of visual drift. 16 new tests plus expanded continuity coverage.
- **QWEN-STREAM-1 complete** — Streaming Qwen sidecar foundation. Binary-framed PCM protocol (`scripts/qwen_streaming_sidecar.py`), JS engine manager (`main/qwen-streaming-engine.js`), IPC handlers, preload bridge, streaming types. 18 new tests. v1.71.0.
- **QWEN-STREAM-2 complete** — StreamAccumulator + streaming Qwen strategy + live playback wired. PCM frames buffer to sentence boundaries via StreamAccumulator, streaming strategy instantiated when engine is "qwen" and streaming engine ready, fallback to non-streaming preserved. Plato suggestion: async IIFE listener leak window in qwenStreamingStrategy.ts (low-risk, flagged for QWEN-STREAM-3 hardening). 21 new tests (tests/qwenStreamingStrategy.test.ts). v1.73.0.
- **QWEN-STREAM-3 complete** — Streaming hardening: stall detection (TTS_STREAM_STALL_TIMEOUT_MS=8000ms), crash recovery (2s poll), warmup gate, cancellation guards (LL-109 fix). Stream-finished IPC wire added (tts-qwen-stream-finished: engine→ipc→preload→renderer→acc.flush()→onEnd). 5 streaming eval scenarios, gate thresholds, eval runner --streaming mode, QWEN_STREAMING_DECISION.md template. 16 new tests. v1.74.0.
- **QWEN-STREAM-4 complete** — Streaming eval harness executed (5 scenarios, pending_live_data), Kokoro baseline captured (9/9 pass, first-audio p50=465ms/p95=507.6ms), decision gate document populated with ITERATE recommendation. Live CUDA validation required before promotion. eval runner fix: streaming scenarios filtered from --matrix path. v1.75.0.
- **TTS-EVAL-1 complete** — quality harness baseline shipped: trace schema/types, fixture corpus, opt-in trace sink instrumentation, first-audio timing, runner + metrics summaries, lifecycle/handoff tests, reviewer template/runbook, and baseline artifacts. v1.53.0.
- **TTS-EVAL-2 complete** — matrix + soak harness expansion shipped: scenario manifest, soak profiles, deterministic artifact model, matrix/soak runner modes, p50/p95 startup + drift aggregate summaries, and runner validation suite. v1.54.0.
- **Roadmap review (2026-05-02):** Full 4-phase ceremony completed. Verdict: AT RISK (strong velocity, 44% sideways scope from MOSS). Finish line established: Desktop v2.0 Shipping. ROADMAP.md reduced from 5,347→754 lines. 60 completed sprint specs archived to `docs/planning/.Archive/ROADMAP_2026-05-02.md`. 4 review artifacts in `docs/planning/roadmap-reviews/`.
- **SK-HYG-1 complete** — Roadmap hygiene & queue recovery. Archive-forward discipline enforced, queue restructured from RED depth 1 to GREEN depth 3, Standing Rules section added (10 rules), Desktop v2.0 conveyor belt established.
- **BRAND-HYG-1 shelved/no-op** — Expected dirty brand/theme edits were not present in this checkout after governance hygiene; remaining dirty tracked files were local noise only. Not completed as implementation.
- **EINK-6A complete** — E-ink display behavior is now independent from theme via `einkMode`; settings schema v9/defaults/migrations added; `[data-eink="true"]` carries runtime behavior while `[data-theme="eink"]` remains optional greyscale palette. Verification passed: focused EINK/NARR slice 36 tests, full `npm test` 150 files / 2397 tests, `npm run build`, `npm audit --audit-level=high`, and `git diff --check`.
- **EINK-6B complete** — E-ink reading ergonomics landed: Flow uses instant stepped chunks, Focus supports 2-3 word e-ink phrase bursts, and adaptive ghosting refresh uses content-change load with manual interval fallback. Verification passed: focused EINK/Flow slice 5 files / 93 tests, full `npm test` 151 files / 2407 tests, `npm run build`, `npm audit --audit-level=high`, and `git diff --check`.
- **GOALS-6B complete** — Reading Goal Tracking landed on `sprint/goals-6b-reading-goals`: optional local-first daily pages, daily minutes, and weekly books goals; settings create/edit/delete; library widget; progress from page/word advance, active reading minutes, and book completion; local daily/weekly resets; streak display. Review hardening covered latest-goals overwrite protection, idle/visibility-gated page-mode minutes, high-water page deltas, DST-safe local weekly reset math, and aligned Electron API stub defaults. Verification passed: full `npm test` 156 files / 2429 tests, `npm audit --audit-level=high` with only existing moderate `uuid` advisories, `git diff --check`, and `npm run build` with existing circular chunk warning (`settings -> tts -> settings`). Solon final spec spot-check APPROVED; Plato quality re-review READY.
- **MOSS-NANO-13B complete** — Real MOSS Nano app audio bridge landed on `sprint/moss-nano-13b-real-app-audio-bridge`: the app-sidecar path now validates the local Nano repo/model/tokenizer/runtime, starts the real ONNX runtime, and returns real WAV/PCM metadata through `tts-nano-*` IPC with `syntheticAudio:false`. Synthetic tone output is mock-only and rejected in real mode. Test Voice can use real Nano audio when `nanoStatus` is ready; selected Nano narration remains segment-following only with `wordTimestamps:null`. No Qwen reactivation, no Nano default, no Kokoro retirement, and no silent fallback.
- **POCKET-TTS-1 complete** — Pocket TTS is now an isolated third opt-in engine path (`pocket-tts`) with sidecar/engine wrapper, `tts-pocket-*` IPC, preload bridge, renderer strategy, settings status/preview/selectable-engine wiring, and 30 focused tests. Product posture is unchanged around the other engines: Kokoro remains default/available, MOSS-Nano remains recommended opt-in from 13e, Qwen remains disabled, no comparative gate ran, and no public voice-cloning UX ships in v2.0.
- **POSTV2-ENGINE-1 update** — Qwen is disabled at the selectable settings/profile boundary and at IPC runtime entry points. Historical/preload compatibility methods may remain, but Qwen status/generate/stream calls return unavailable with `reason: "qwen-disabled"` and must not start a Qwen runtime for Desktop v2.
- Active queue: GREEN depth 7 (5 full specs, 2 stubs) in `docs/governance/sprint-queue.xlsx`. Finish line: **TTS Quality Confidence + Reading Experience v2** — narration UX polish + quality regression gates. Conveyor: NARR-PAUSE-1 → TTS-PARITY-1 → NARR-SPOKEN-1 → NARR-CURSOR-2 → TTS-EVAL-3 → UX-POLISH-1 → TTS-QUAL-CI-1. TTS Architecture Complete phase landed: all 10 sprints complete on canonical `main`. Dissolved (2026-05-15 Kokoro-only pivot): TEST-HARNESS-1, TTS-CANARY-1, TTS-REGISTRY-DISPATCH-1. Engine posture: Kokoro is the sole active engine; MOSS-Nano and Pocket TTS are dormant/disabled; Qwen is retired/disabled. Desktop v2.0 shipped. KOKORO-EXPORT-1 remains deferred.
- 1 open bug: BUG-154 (parked — likely not a bug, needs live verification). Deferred lanes: MOSS-Nano (dormant), Pocket TTS (dormant), Qwen Streaming (ITERATE), Android APK, Cloud Sync, RSS/News — all beyond TTS Architecture Complete finish line.
- ROADMAP_V2.md archived (2026-04-06). Single source of truth: ROADMAP.md.
- IDEAS.md reorganized into 11 themed groups (A through K) with roadmap alignment.
- 2,397 tests across 150 test files
- CI/CD active via GitHub Actions (split x64+ARM64 builds, --publish never + explicit gh upload, nsis-web stub installer)
- Performance baseline: 21 automated benchmarks via `npm run perf`

### Tech Stack

- Electron 41 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 26 for packaging
- foliate-js for EPUB rendering (primary reader for EPUBs)
- Kokoro TTS engine (28 voices, worker thread, q4 quantization) — sole active engine. MOSS-Nano dormant/disabled; Pocket TTS dormant/disabled; Qwen retired/disabled.
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), chokidar (folder watch, lazy-loaded), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater, docx (.docx notes export), exceljs (.xlsx reading log), opusscript (Opus audio encoding/decoding), mammoth (DOCX→HTML, lazy-loaded)

### Architecture

- **Main process** — modularized with domain-split IPC:
