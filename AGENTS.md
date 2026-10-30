# Blurby — Codex Configuration

## Rules of Engagement

0. **Speak freely during brainstorming.** We collaborate to find the best path forward. Challenge assumptions, propose alternatives, flag risks early.
1. **Always update Blurby documentation** (AGENTS.md with architecture/feature changes, LESSONS_LEARNED.md on non-trivial discoveries).
2. **Always review AGENTS.md and LESSONS_LEARNED.md** before sessions that may change the codebase, architecture, or UX.
3. After completion of codebase work by Codex, tag each completed item with inline `✅ COMPLETED` markers in ROADMAP.md.
4. **Use plain language with codebase terms parenthetical** — e.g., focus reading (ReaderView), flow reading (ScrollReaderView), page reading (PageReaderView), bottom bar (ReaderBottomBar), word index (wordIndex), etc.
5. **Roadmap must spec out at least three sprints in advance** — current + two future sprints fully articulated with acceptance criteria.
5a. **Queue depth below 3 is a stop signal.** If the registered Notion work register has fewer than three queued sprints, pause implementation and backfill specifications before the next dispatch. Blocked items do not count as queued.
5b. **Successful CLI sprints auto-merge by default.** When a sprint passes verification, spec compliance, quality review, and docs closeout, the default CLI closeout path is: stage specific files, commit on the sprint branch, merge to `main` with `--no-ff`, and push. A sprint spec must explicitly say otherwise to skip auto-merge.
6. **Aggressively parallelize.** Look for work that Cowork and Codex CLI can do simultaneously. Independent tasks run in parallel. Dependent tasks are sequenced. **We cannot waste a second.**
6a. **CLI executes, it does not investigate.** Every sprint dispatched to Codex CLI must be fully investigated and spec'd beforehand. CLI receives exact directions — file paths, line numbers, what to change, why. All ambiguity is resolved by Cowork before dispatch. If a bug's root cause is unknown, Cowork investigates first (live debug, code tracing, hypothesis testing). If a feature's design is unresolved, Cowork specs it first. CLI never explores or diagnoses — it builds to spec. A sprint is not dispatch-ready until its investigation gate is cleared.
6b. **Long-running dispatches use the quiet machine (owner ruling 2026-10-28).** During dispatch development, place sustained implementation, builds, test matrices and other long-running execution on the quiet machine. Use the owner's everyday computer for coordination, reviews and brief checks. Each such specification and CLI handoff must name the execution host, required repository/artifact transfer and host prerequisites; verify that the quiet machine has the required inputs and access before launch. If its identity, availability or required capability is unresolved, resolve placement before launch rather than silently running the workload on the everyday computer. Any exception requires the owner's explicit direction. This rule governs future dispatch placement; it does not authorize moving an active run or changing its admissions, budgets or custody.
7. **AGENTS.md stays under ~35k chars.** When approaching threshold, archive completed sprint details to `docs/planning/CLAUDE_md_archive_sessionN.md`.
8. **Always print CLI-formatted sprint dispatches.** Dispatches are POINTERS not PAYLOADS: reference the Notion item by Sprint Code and URL, its Seq and baseline, branch, and full ROADMAP.md specification.
9. **Always provide a recommendation.** When presenting options, decisions, or status updates, lead with a clear recommendation and rationale. Don't leave decisions hanging — state what you'd do and why.
10. **Do not wipe the workspace.** In this repo, never use cleanup/reset/delete flows to remove local work as a convenience step. If something is uncommitted, we either ignore it, preserve it, or commit it. We do not delete it unless the user explicitly asks for deletion.
11. **Decision authority (owner ruling2026-10-26; authority moved to Blurby.Brain1 by owner direction 2026-10-30).** All technical questions go to Blurby.Brain1 (Claude session `local_3dfa75ff-41e8-4d54-872c-3a2c333ca582`), which has the owner's delegated authority to make technical decisions. Design and functionality questions remain the owner's to answer. Mixed questions separate the technical ruling from the design/functionality choice; technical delegation never substitutes for owner design approval. Existing package, source-freeze and release gates remain unless explicitly changed by an authorized ruling.
11a. **Registry helper guard (2026-10-27).** Installed Virtuoso1.16.1 truncates fractional Seq. Before registry, snapshot-import or board commands, follow the pinned-root/hash/import checks and process-local override in `docs/planning/roadmap-reviews/2026-10-27-registry-helper-repair.md` and its qualified-helper manifest. Use the retained managed fix or HOLD; never allow launcher fallback, round67.5/87.5 or change global install settings. This tooling correction grants no WORD/GROUP/native implementation or release authority.

---

## Division of Labor

### Cowork (you) — Planning & Oversight

You are the **architect and reviewer**. You do NOT write or change code unless the user directly asks you to. Your job:

1. **Brainstorm and design** — Collaborate with the user on features, architecture, UX, and priorities.
2. **Plan work for Codex** — Write fully articulated implementation specs with step-by-step directions, agent assignments, and acceptance criteria. Place these in `ROADMAP.md`.
3. **Review results** — After Codex agents run, verify every change against spec. Identify drift, gaps, regressions.
4. **Maintain documentation** — Keep AGENTS.md, ROADMAP.md, and LESSONS_LEARNED.md current (or direct MarcusAurelius to do it).
5. **Interpret test results** — Analyze test output, decide next steps for failures.
6. **Triage findings** — Review `docs/governance/Findings.md` (registered findings role), group issues, set priorities.

#### Planning Contract

This repo uses a strict two-layer planning system:

1. **`ROADMAP.md` holds the full spec** for every active sprint. Each sprint section must be execution-ready for Codex CLI and include:
   - Goal / problem / design decisions
   - Baseline
   - WHERE (read order)
   - Tasks
   - Execution Sequence
   - SUCCESS CRITERIA
2. **[Blurby Notion roadmap](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca) is the authoritative work register.** Sprint Code is stable identity, Seq is FIFO order, and Status is live state. ROADMAP.md holds full specifications. Virtuoso/workspace-layout.json declares the connector and column map; local timestamped snapshots are caches, never independent authority.
3. **Cowork's primary job is plan quality.** Pressure-test scope, sequencing, edge cases, cache/UX implications, spec clarity, and documentation drift so Codex can execute with minimal ambiguity.
4. **Execution is selective.** Cowork only performs direct coding or file edits when:
   - the user explicitly asks for implementation, or
   - the work is especially delicate/complex and the user wants Cowork to handle it directly.
5. **Default output for implementation planning work:** update ROADMAP.md, then the matching Notion item through mutation-plan → connector → mutation-confirm. Refresh and read back the board snapshot.
6. **Minimum queue depth is mandatory.** Keep at least three queued Notion items with full ROADMAP.md specs; below three, pause implementation and backfill.
7. **Parallel sprinting requires lane ownership + shared-core freeze.** We only run code-changing sprints in parallel when each sprint declares an owned lane and avoids the shared-core freeze set unless explicitly scheduled for an integration window.

#### Product lanes (roadmap and Notion)

The Notion Lane field uses the seven product domains declared in registry `policy.roadmap.workstreams` (Findings F-006): UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance; Blurby Business. Each item has one primary product lane. Record cross-lane dependencies in its specification; TTS cursor work requires Reader integration. ROADMAP.md's Work lanes table defines ownership and current disposition.

#### Reading-mode isolation (Narrate rebuilt 2026-10-15)

Page, Focus, Flow and Narrate are four independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11; Narrate removed by NARRATE-REMOVE-1, 2026-10-12, and rebuilt by NARRATE-REBUILD-1, completed 2026-10-15). Keep that isolation: no sibling-runtime imports, no shared mutable mode store.

Narrate's core requirement (owner ruling #31) stands: the cursor is the word at the current playback sample, from an exact word table, with no estimated timing (OutsideAudit.10; LL-142). Epic record: `docs/planning/epics/2026-10-12-narrate-rebuild/state.md`.

#### Parallel Sprint Policy (Execution Surface Ownership)

When proposing parallel execution, classify each sprint into one or more of the legacy A-E execution surfaces below. These are file-ownership fences, distinct from the product domains in Notion's Lane field:

- **Lane A: Runtime Core** — narration/flow state machine and synchronization behavior
- **Lane B: Evaluation Harness** — fixtures, trace schema, runners, scoring artifacts
- **Lane C: UI Surfaces** — controls, settings UI, display-only reader chrome
- **Lane D: Platform/Main Process** — `main/`, preload, IPC contracts, auth/cloud/import
- **Lane E: Governance/Planning** — roadmap, Notion work register, close-out/reporting docs

#### Shared-Core Freeze Set

Only one active sprint may edit this set at a time unless a planned integration window is explicitly declared in ROADMAP:

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

### Codex CLI — All Execution

**IMPORTANT: This section is read by Codex CLI as its system prompt. Follow these instructions directly.**

#### Mandatory Session-Start Protocol

Before writing ANY code, you MUST read these files in this order. No exceptions. No shortcuts.

1. **`AGENTS.md`** (this file) — You're already reading it. Note the Standing Rules below.
2. **The Virtuoso plugin's Zeus protocol** — the `virtuoso` skill in the Codex plugin cache (`~/.codex/plugins/cache/virtuoso-marketplace/virtuoso/<version>/skills/virtuoso/`) and its `skills/virtuoso/references/zeus.md` — followed as written, plus Blurby's facts in `Virtuoso/overlays/` (list them with the rule-11a-guarded `virtuoso_registry --root . overlays`). There is no local copy; never create one.
3. **`docs/governance/LESSONS_LEARNED.md`** — Scan for entries tagged with the areas you're about to touch. These are hard-won guardrails. Violating them causes regressions.
4. **`ROADMAP.md`** — Find the sprint/hotfix section for your current task. Read the full spec including WHERE, Tasks, and SUCCESS CRITERIA.
5. **Source files listed in the dispatch's WHERE section** — Read them in the listed order before making changes.

If your dispatch references a LESSONS_LEARNED entry by number (e.g., "LL-051"), you MUST read that specific entry and follow its guardrail.

#### Agent Definition Files

Agents are the plugin's (`virtuoso:` roster), selected by its Zeus protocol; the host determines which agents are available.

Blurby overlays: `Virtuoso/overlays/skills/virtuoso/SKILL.md`, `Virtuoso/overlays/agents/Hippocrates.md`, `Virtuoso/overlays/agents/Plato.md`, `Virtuoso/overlays/agents/MarcusAurelius.md`.

#### How Dispatches Work

Sprint dispatches go to `Zeus` (the orchestrator). Zeus reads the dispatch, loads the sprint spec from ROADMAP.md, and delegates all work.

Zeus routes and orders work as the plugin's `skills/virtuoso/references/zeus.md` states.

#### Agent Scope Labels (Reference)

**Code scope labels** (applied to doer agent tasks):

| Label | Scope | Files |
|-------|-------|-------|
| `electron-scope` | Main process — IPC handlers, file I/O, data persistence, Electron APIs | `main/`, `main/ipc/`, `preload.js` |
| `renderer-scope` | React — state, props, hooks, CSS, rendering | `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` |
| `format-scope` | File format integration — EPUB, MOBI, PDF, HTML parsing | `main/epub-converter.js`, `main/file-parsers.js`, `main/epub-word-extractor.js` |

#### Post-Completion Checklist

Before committing, verify ALL of these:

- [ ] Every SUCCESS CRITERIA item from the dispatch is met (the plugin's spec-compliance review)
- [ ] `npm test` passes (2,452+ tests, 0 failures; count as of 2026-10-23, release gate (1) run 4) and `npm run typecheck` exits 0
- [ ] `npm run build` succeeds (if UI changes were made)
- [ ] No files were accidentally truncated (check `git diff --stat` for unexpected size changes)
- [ ] LESSONS_LEARNED guardrails were not violated
- [ ] Changes are scoped to the files listed in the dispatch — no drive-by edits
- [ ] Spec-compliance self-review passed (code matches dispatch spec line-by-line)
- [ ] Quality self-review passed (architecture rules, known traps, code clarity)
- [ ] Package verified (standing rule 53, LL-167; owner directive 2026-10-23): `--dir --arm64` build of the final commit plus `origin/main`, a 25 s native-arm64 scratch-profile launch with no error or crash, asar contents checked, automatable Done-when re-run on the packaged exe, a "Package verification" section in the close-out, and Blurby.Brain's confirmation before the merge go. If nothing under `build.files` changed, record "package unchanged" with the diff.

#### Mandatory MarcusAurelius Pass (After Every Sprint)

Documentation runs as *Document Lifecycle* states, with Blurby's documentation facts in `Virtuoso/overlays/agents/MarcusAurelius.md`.

### Standing Rules

- **READ BEFORE YOU WRITE.** Every CLI session MUST read `docs/governance/LESSONS_LEARNED.md` and the relevant ROADMAP section BEFORE making any code changes. This is non-negotiable. Skipping this step causes regressions.
- **Do not clean away local work.** Never run destructive cleanup flows like `git reset --hard`, `git clean`, or equivalent workspace-wiping actions unless the user explicitly requests that exact outcome for this repo.
- **Branch-per-sprint.** Use the named branch in an isolated checkout; current task convention uses `eb/`. Never commit directly to main. Resolve registry policy.git before mutation: policy=push, networkOperations=allow. Per Rule 5b, a sprint that passes verification, spec compliance, quality review and docs close-out is committed on its branch, merged to `main` with `--no-ff`, and pushed, unless its spec says otherwise. Branch deletion and worktree pruning stay maintenance, never automatic.
- **Local-first development.** Working directory at `C:\Projects\Blurby`. Push to GitHub after every sprint. Pull before every session. See `docs/governance/DEVELOPMENT_SYNC.md` for full SOP.
- **Electron main process stays CommonJS.** Renderer stays ESM/TypeScript. Never cross the boundary.
- **All file I/O in main process modules must be async** (fs.promises). No synchronous reads/writes.
- **preload.js is the security boundary.** Keep it minimal. All system access goes through IPC.
- **LESSONS_LEARNED is a required engineering artifact.** Update immediately on non-trivial discovery.
- **After any engine change → run tests before proceeding.** `npm test` must pass.
- **After any UI change → build verification.** `npm run build` must succeed.
- **CSS custom properties for theming.** No inline styles. All styles in `src/styles/*.css` (entry `index.css`).
- **Never import Node.js modules in renderer code.** All system access through IPC via `window.electronAPI`.
- Folder-sourced docs don't store content in library.json — loaded on-demand via `load-doc-content` IPC.
- **Notion register text.** Anything the tooling reads from the Notion register comes from a SQL (plain-text) read, never rows mode or page fetch. When writing text to it, wrap every dotted name in backticks and backslash-escape markdown characters, or Notion links or drops them (`x-notion.textRules`).
- **Dispatch sizing.** Waves are sized and split by the Virtuoso plugin's criteria (`skills/effort-levels/SKILL.md`, *This Is Additive*): tool budget ≤40, wall time ≤60 minutes, and a split when effort levels are significantly mixed. Each wave is a separate dispatch.
- **Parallel-safe execution beats queue speed theater.** Do not dispatch two sprints in parallel if both touch the shared-core freeze set. Run them sequentially or split one sprint so only non-core scaffolding runs in parallel.
- **Verify file integrity after changes.** Run `git diff --stat` before committing. If any file shows an unexpected size decrease, check for truncation.
- **Verification gate is mandatory.** After completing any code-change task, verify: tests pass, behavior matches spec, no regressions, edge cases covered, documentation current. A task is NOT complete until verification evidence exists.
- **Spec-compliance review before quality review.** Every dispatch gets the plugin's spec-compliance review and then its quality review, by the agents and in the order `skills/virtuoso/references/zeus.md` names. No dispatch tier omits either review (SRL-012 amended 2026-10-30).

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
| 6 | **AGENTS.md** | `AGENTS.md` | Agent operational config — rules, agents, workflow |
| 7 | **Work register** | [Blurby Notion roadmap](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca) | Live item status and FIFO order; specifications remain in ROADMAP.md |

### Other References

- **Project Constitution**: `docs/planning/Blurby_Project_Constitution.md`
- **Agent Definitions**: the Virtuoso plugin's agents (`virtuoso:` roster) and its Zeus protocol (`skills/virtuoso/references/zeus.md`), plus Blurby's facts in `Virtuoso/overlays/`. The former local briefs are archived in `docs/planning/.Archive/agent-protocols-2026-10-30/`.
- **Roadmap Archive**: `docs/planning/.Archive/ROADMAP_legacy.md` (completed sprint full specs — reference only)
- **Development Sync SOP**: `docs/governance/DEVELOPMENT_SYNC.md` (local-first git workflow)

---

## Document Lifecycle

### Sprint Lifecycle in Docs

When a sprint **completes**:

1. **Notion work register** — Record completion date and evidence, clear the finished item's Seq, renumber the queue through the provider/connector flow, verify queued depth ≥ 3, then refresh the snapshot.
2. **ROADMAP.md** — Move the full spec section to `docs/planning/.Archive/ROADMAP_legacy.md`. Keep ROADMAP forward-looking only.
3. **ROADMAP.md** — Update Sprint Status table (remove or mark complete).
4. **ROADMAP.md** — Update Execution Order diagram.
5. **AGENTS.md** — Update "What's NOT Done" list, Dependency Chain, and test counts.
6. **Backfill** — If queue depth drops below 3, spec the next sprint from IDEAS.md or Someday Backlog.

### Where Things Live

| Content | File | Rule |
|---------|------|------|
| Forward-looking sprint specs (full CLI Evergreen) | `ROADMAP.md` | Only upcoming work. Archive on completion. |
| Sprint dispatch queue (summary pointers) | [Blurby Notion roadmap](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca) | Sprint Code + Seq + Status → ROADMAP spec; at least 3 queued entries |
| Completed sprint specs | `docs/planning/.Archive/ROADMAP_legacy.md` | Append-only. Reference, don't modify. |
| Completed Cowork plans/specs | `docs/planning/{plans,specs}/.Archive/` | Move on completion. |
| Completed governance sprint files | `docs/planning/.Archive/` | Move on completion. |
| Current system state + agent config | `AGENTS.md` | Keep under ~35k chars. Archive old sprint details. |
| Bugs (active) | `docs/governance/BUG_REPORT.md` | Remove when fixed + verified. |
| Bug reports (raw, unprocessed) | `docs/bug-reports/` (gitignored, local) | In-app submissions. Triage → file in BUG_REPORT.md → archive to `.Archive/`. |
| Bug reports (processed) | `docs/bug-reports/.Archive/` | Archived after triage. Reference only. |
| Feature requests (unroadmapped) | `docs/governance/IDEAS.md` | Reviewed at phase pauses. |
| Engineering discoveries | `docs/governance/LESSONS_LEARNED.md` | Append immediately on discovery. |
| Architecture + data model | `docs/governance/TECHNICAL_REFERENCE.md` | Update when architecture changes. |

### Cleanup Cadence

- **Every sprint completion**: Run steps 1-6 above.
- **Every 3rd sprint**: Review `docs/` for stale files. Archive anything from completed work.
- **ROADMAP.md ceiling**: 2,000 lines (`policy.roadmap.lengthCeilingLines`). When crossed, roadmap review moves specs to a dated snapshot in `docs/planning/.Archive/`.
- **AGENTS.md target**: <35k chars. Archive completed sprint details to `docs/planning/CLAUDE_md_archive_sessionN.md`.

---

## Workflow Integration

### Session Start Protocol

1. Read `AGENTS.md` (this file) — rules, agents, current system state
2. Read `docs/governance/LESSONS_LEARNED.md` (if session may change codebase)
3. Read `ROADMAP.md` (full active sprint specs)
4. Read `docs/governance/BUG_REPORT.md` (if session involves bug fixes)
5. Read the registered Notion provider; refresh its connector snapshot and check timestamp, Seq, Status, prerequisites and spec references; open its Phase link drift view and link any listed item to its phase page.

### Bug Report Triage Workflow

When `docs/bug-reports/` contains unprocessed `.json` + `.png` files:

1. **Read** all JSON reports and view all screenshots.
2. **Group** reports by root cause or feature area — deduplicate related reports.
3. **File** each unique bug in `docs/governance/BUG_REPORT.md` with next BUG-NNN number. Include: description, severity, location, probable cause, screenshots, fix approach.
4. **Group into hotfix sprints** — write HOTFIX-NN specifications in ROADMAP.md and register the matching Notion items through create-item mutation-plan/confirm.
5. **Archive** processed reports: move all `.json` + `.png` files to `docs/bug-reports/.Archive/`.
6. **Report** findings to user with grouped summary and proposed hotfix sprint structure.

### Constants Separation Rule

All tunable behavioral constants must be extracted into a dedicated constants file — not hardcoded in source. This includes default WPM, default word count per flow page, snooze intervals, toast durations, coaching limits, LRU cache sizes, sync intervals, tombstone TTL, reconciliation period, and similar values currently scattered across main process and renderer code. CSS custom properties for theming are exempt (they already live in `src/styles/`).

### External Audit Cadence

Run a structured codebase audit at regular intervals: after every 3rd sprint completion, or at any major phase boundary (e.g., before Chrome extension launch, before Android launch). Audit scope: code quality, architecture compliance, test coverage, known-trap regression, documentation alignment. See `docs/studies/audit/` for prior audit artifacts and procedure.

### External Audit Outcomes

| # | Date | Scope | Verdict | Key Outcome |
|---|------|-------|---------|-------------|
| 1–8 | 2026-05-15 | TTS Architecture roadmap (8 passes) | Approved for dispatch (9/10) | Spec language tightened, source files verified, architecture approved |
| 9 | 2026-05-17 | TTS post-implementation audit | Conditional approval (7/10) | Three code defects found → TTS-PARITY-1 sprint; re-audit planned as OutsideAudit.10 |
| 10 | 2026-10-11/12 | Targeted: Narrate removal + rebuild plan | D2 partially flawed (5.2/10; coordinated, not independent). Fresh reviews: D4 not authorized as packaged; D4b authorized (removal spec ready; Phase 0 and design with charter conditions) | The installed Kokoro export emits no durations, so every word table was an estimate labelled native (LL-142). Removal spec revision 4; Phase 0 made decidable; BUG-185; LL-142–145. Record: `docs/studies/audit/OutsideAudit.10.2026-10-11/AuditDecisions.10.2026-10-12.md` |

---

## Current System State (v1.75.1 — NARRATE-REBUILD-1 completed 2026-10-15)

### Codebase (branch: `main`)

**Completed sprint history archived to `docs/planning/CLAUDE_md_archive_session1.md`** (68 sprints, v1.29.0→v1.75.1).

**Active guardrails (from completed sprints):**
- **Diagnostics export guardrail** — Diagnostics exports are evidence artifacts, not user-content artifacts. Do not commit generated local user diagnostics unless an explicit test fixture creates them; raw text and audio-shaped fields must remain redacted/rejected in both producers and validators.
- **Qwen code deleted** — NARRATE-REMOVE-1 (2026-10-12) deleted every Qwen, MOSS-Nano and Pocket module, handler, preload method, test and packaging entry. The earlier "qwen-disabled" stub no longer exists; no engine other than Kokoro is in the tree.

**Current operational state:**
- **Engine posture:** Kokoro is the sole engine. The rebuilt Narrate (NARRATE-REBUILD-1, completed 2026-10-15) drives it through its own producer (`main/narrate/`, `main/ipc/narrate.js`), engine (`src/reader/modes/narrate/engine/`) and preload `narrate*` methods. The legacy Kokoro files (`main/tts-engine.js` and siblings) keep their `tts-*` handlers in `main/ipc/tts.js`, which `preload.js` does not expose. The reading modes are Page, Focus, Flow and Narrate.
- **Queue (2026-10-26):** Notion Blurby.Roadmap is live authority; snapshot 2026-10-26T20:33:32Z has 193 items (68 In Flight, 39 Queued). In Flight distinguishes merged/release-held, built/freeze-held, and partial/stopped execution; it is not proof of completion. Gate(1) passed on36ac7466; owner smoke gate(2) is RED/partial. GOV-SWEEP-FOLLOWTHROUGH-1 is the first governance deliverable. LIBRARY-COMPLETION-VISIBILITY-1 is the first application repair, with an exclusive source/test implementation/build-and-hold window. APP-TABS-1 stays held and integrates visibility later. Source code merges, package confirmation and release remain gated; use ROADMAP and the live register for the current order, never these timestamped counts as authority.
- **Open bugs:** docs/governance/BUG_REPORT.md is the single current list; the2026-10-26 smoke findings remain open until implementation and acceptance.
- **Deferred lanes:** Cloud Sync is absorbed by BLURBY-SERVER-1; Android and RSS/News are Stage 9 items; long-form audio export dissolved (KOKORO-EXPORT-1).
- **Most recent implementation:** NARRATE-REBUILD-1 completed 2026-10-15 (P6 with P6b, merge `f27c7def`; completion record `689edd46`): Narrate rebuilt on Kokoro as a fourth independent mode, the cursor is the word at the playing sample from an exact word table, epic checkers run under the app's Electron ICU (LL-160). Seven Stage 8 items merged the same day (ROADMAP.md Stage 8). Before it, QUIT-FLUSH-1 (merge `d21009b3`, 2026-10-14; `main/quit-sequence.js`; BUG-192 resolved). Earlier history: `docs/planning/CLAUDE_md_archive_session1.md`.
- Suite (2026-10-23, release gate (1) run 4 on `36ac7466`, quiet machine): 2,452 passed / 1 skipped / 0 failed in 181 files; `npm run typecheck` exits 0 (`docs/governance/close-outs/Gate1.STAGE8-RUN4.2026-10-23.md`).
- CI: GitHub Actions `ci.yml` runs tests only. Releases are built and published by hand per `docs/governance/RELEASE_RUNBOOK.md` (one full NSIS installer per architecture).
- Governance tooling: Virtuoso connector-backed register, timestamped snapshots, durable mutation recovery.
- Performance baseline: 21 automated benchmarks via `npm run perf`

### Tech Stack

- Electron 42 + React 19 + Vite 6 + TypeScript 5.9
- Vitest 4.1 for testing, electron-builder 26 for packaging
- foliate-js for EPUB rendering (primary reader for EPUBs)
- Kokoro TTS engine (28 voices, worker thread, q4 quantization) — the only engine in the tree, driven by the rebuilt Narrate. MOSS-Nano, Pocket TTS and Qwen were deleted by NARRATE-REMOVE-1 (2026-10-12).
- Dependencies: @azure/msal-node (Microsoft auth), googleapis (Google auth/Drive), @mozilla/readability + jsdom (URL extraction, lazy-loaded), pdf-parse (PDF reading, lazy-loaded), pdfkit (PDF export), adm-zip (EPUB/MOBI, lazy-loaded), cheerio (HTML, lazy-loaded), electron-updater, docx (.docx notes export), exceljs (.xlsx reading log), opusscript (Opus audio encoding/decoding), mammoth (DOCX→HTML, lazy-loaded)

### Architecture

See `docs/governance/TECHNICAL_REFERENCE.md` (main process: domain-split IPC under `main/ipc/`).
