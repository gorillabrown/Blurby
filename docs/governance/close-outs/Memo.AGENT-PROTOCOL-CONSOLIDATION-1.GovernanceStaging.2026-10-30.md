# Dispatch Close-Out Governance Staging — AGENT-PROTOCOL-CONSOLIDATION-1

This file enumerates every governance change the dispatch would have made to main governance documents during
execution, but staged here per virtuoso's worktree-edit prohibition (skills/virtuoso/SKILL.md, Worktree Governance
Staging, Rules 1–3). `/dispatch-closeout` processes it as Wave 2 Step 0 (Rule 4): it applies every fold-in to canonical
`main` through the writer named per target, then deletes this file. Any fold-in whose **Old** text no longer occurs
exactly once on `main` is a reconciliation prompt (Rule 4 *Discrepancy handling*), never a silent overwrite.

- Specification: `docs/planning/specs/2026-10-30/AGENT-PROTOCOL-CONSOLIDATION-1.md` (origin/main `1e8bc0cb`).
- Branch: `eb/agent-protocol-consolidation-1`. Base: merge-base `1e8bc0cb`; `origin/main` tip `492db7f5` at review
  (three bug-report merges: ROADMAP.md +1 line, BUG_REPORT.md; no fold-in target text changed). D3 re-run against the tip.
- Format: every **Old** and **New** block is the exact text between its `~~~~text` line and its closing `~~~~` line,
  without the fences. **Old** blocks were cut from `origin/main` by anchor, never retyped (LL-068).
- Order: targets in the order below; fold-ins within a target in their numbered order. There are no Mid-Dispatch
  Amendment migrations.

## Target: .claude/WORKFLOW_REFERENCE.md

Writer: `dispatch-closeout` (Rule 4; no registry role covers this path).

### Fold-in M1 — Archive the local workflow reference (memo move)
Section: whole file
Action: Remove (preserving: Step 0 runs `git mv`; content stays byte-identical)
Source: `.claude/WORKFLOW_REFERENCE.md`
Destination: `docs/planning/.Archive/agent-protocols-2026-10-30/WORKFLOW_REFERENCE.md`

## Target: .claude/skills/virtuoso/SKILL.md

Writer: `dispatch-closeout` (Rule 4; no registry role covers this path).

### Fold-in M2 — Archive the forked virtuoso skill (memo move)
Section: whole file
Action: Remove (preserving: Step 0 runs `git mv`; content stays byte-identical)
Source: `.claude/skills/virtuoso/SKILL.md`
Destination: `docs/planning/.Archive/agent-protocols-2026-10-30/claude-skills-virtuoso-SKILL.md`

## Target: Virtuoso/overlays/skills/virtuoso/SKILL.md

Writer: the repository operator, outside any ceremony actor (registry-contract *Project overlays* rule 2: read-only, `allowedWriters: []`), saving the New block exactly.

### Fold-in O1 — Create the skills/virtuoso/SKILL.md overlay
Section: whole file (new)
Action: Append row (new file)
File bytes: the New block followed by one LF, UTF-8, no BOM.

**New:**
~~~~text
<!-- Virtuoso project overlay for skills/virtuoso/SKILL.md -->
<!-- Read on top of the plugin's own skills/virtuoso/SKILL.md. Additive, and it wins on conflict —
     except that it may not loosen a shared-contract safety rule:
     registry-resolution, read-only-preflight, write-permission, git-safety, provenance, issue-contract. -->

# SKILL — this project's additions

## Commands

- Suite commands are the registered `x-commands` in `Virtuoso/workspace-layout.json`: `test`, `typecheck`, `build`, `perf`.
- Packaged-build commands are ROADMAP.md standing rule 53's: `npx electron-builder --win --dir` with an explicit architecture flag (`--arm64` or `--x64`, as rule 53 and its temporary-placement note name them).

## Project gate

- No dispatch merges or closes until ROADMAP.md standing rule 53 passes and Blurby.Brain1 confirms in writing (CLAUDE.md rule 11).
- When nothing under `package.json` `build.files` changed, record "package unchanged" with the diff.
- The Stage 8 source freeze and the release gates stand as CLAUDE.md and ROADMAP.md state them.

## Fences

- The shared-core freeze set: CLAUDE.md *Shared-Core Freeze Set*.
- The Electron main process stays CommonJS; the renderer stays ESM/TypeScript (CLAUDE.md *Standing Rules*).
- Reading-mode isolation: CLAUDE.md *Reading-mode isolation*.

## Lessons

- A lesson cited by number (`LL-NNN`) is read in `docs/governance/LESSONS_LEARNED.md` before the first edit.

## Host

- Placement follows CLAUDE.md rule 6b and ROADMAP.md standing rule 53's temporary-placement note (RodneySr hosts builds and x64 checks).
- Registry helper calls follow CLAUDE.md rule 11a.

## Git

- Branches follow `policy.git.branchNameTemplate` `eb/{item-id}`, each in an isolated worktree.
- Push with an explicit refspec: `git push origin HEAD:refs/heads/eb/<name>`.
~~~~

## Target: Virtuoso/overlays/agents/Hippocrates.md

Writer: the repository operator, outside any ceremony actor (registry-contract *Project overlays* rule 2: read-only, `allowedWriters: []`), saving the New block exactly.

### Fold-in O2 — Create the agents/Hippocrates.md overlay
Section: whole file (new)
Action: Append row (new file)
File bytes: the New block followed by one LF, UTF-8, no BOM.

**New:**
~~~~text
<!-- Virtuoso project overlay for agents/Hippocrates.md -->
<!-- Read on top of the plugin's own agents/Hippocrates.md. Additive, and it wins on conflict —
     except that it may not loosen a shared-contract safety rule:
     registry-resolution, read-only-preflight, write-permission, git-safety, provenance, issue-contract. -->

# Hippocrates — this project's additions

## Suite

- The suite is Vitest, run through npm. Commands are the registered `x-commands` in `Virtuoso/workspace-layout.json`: `test` (`npm test`), `typecheck` (`npm run typecheck`), `build` (`npm run build`), `perf` (`npm run perf`).

## Gates

- `npm test`: 0 failed.
- `npm run typecheck`: exits 0.
- `npm run build`: exits 0 when the change touches UI, styling or packaging (ROADMAP.md standing rules 1 and 48).

## Expected count

- The expected count is the latest gate close-out's, as cited on CLAUDE.md's *Current System State* suite line.

## Host

- A gate defined on the owner's machine runs on that machine (ROADMAP.md standing rule 47).
~~~~

## Target: Virtuoso/overlays/agents/Plato.md

Writer: the repository operator, outside any ceremony actor (registry-contract *Project overlays* rule 2: read-only, `allowedWriters: []`), saving the New block exactly.

### Fold-in O3 — Create the agents/Plato.md overlay
Section: whole file (new)
Action: Append row (new file)
File bytes: the New block followed by one LF, UTF-8, no BOM.

**New:**
~~~~text
<!-- Virtuoso project overlay for agents/Plato.md -->
<!-- Read on top of the plugin's own agents/Plato.md. Additive, and it wins on conflict —
     except that it may not loosen a shared-contract safety rule:
     registry-resolution, read-only-preflight, write-permission, git-safety, provenance, issue-contract. -->

# Plato — this project's additions

## Architecture rules

Blurby's architecture rules fill the shipped `[CUSTOMIZE]` table. They are stated in:

- CLAUDE.md *Standing Rules*;
- CLAUDE.md *Reading-mode isolation*;
- CLAUDE.md *Shared-Core Freeze Set*;
- ROADMAP.md *Standing Rules All Skeletons Inherit*.
~~~~

## Target: Virtuoso/overlays/agents/MarcusAurelius.md

Writer: the repository operator, outside any ceremony actor (registry-contract *Project overlays* rule 2: read-only, `allowedWriters: []`), saving the New block exactly.

### Fold-in O4 — Create the agents/MarcusAurelius.md overlay
Section: whole file (new)
Action: Append row (new file)
File bytes: the New block followed by one LF, UTF-8, no BOM.

**New:**
~~~~text
<!-- Virtuoso project overlay for agents/MarcusAurelius.md -->
<!-- Read on top of the plugin's own agents/MarcusAurelius.md. Additive, and it wins on conflict —
     except that it may not loosen a shared-contract safety rule:
     registry-resolution, read-only-preflight, write-permission, git-safety, provenance, issue-contract. -->

# MarcusAurelius — this project's additions

## Acceptance naming

- Blurby specifications name acceptance *Done when*; older specifications say *SUCCESS CRITERIA*.

## Documents

- CLAUDE.md *Document Lifecycle* steps 1–6.
- `docs/governance/BUG_REPORT.md`.
- `docs/governance/TECHNICAL_REFERENCE.md`.

## ROADMAP.md

- Completed items carry inline `✅ COMPLETED` markers (CLAUDE.md rule 3).
- Completed specifications move to `docs/planning/.Archive/ROADMAP_legacy.md`.
- The Sprint Status table is kept current.

## Notion register text

- Register text is read as SQL plain text and written under `x-notion.textRules` (CLAUDE.md *Standing Rules*).
~~~~

## Target: Virtuoso/workspace-layout.json

Writer: the repository operator by hand for (a), (b), (c), (e); `roadmap-review` through `policy-set` for (d) and (f)
(Blurby.Brain1 condition 2). Every helper call runs through the CLAUDE.md rule 11a guarded wrapper `$W`.
Ledger: `policy-set` at (d)/(f) appends its `roadmap.workstreams` line to `docs/governance/Change.Ledger.jsonl`
(writer `roadmap-review`, changeLedger allowedWriters).

### Fold-in W1 — Manifest steps (a)–(g)
Section: `roles.overlays`, top-level `x-commands`, `policy.roadmap`
Action: Replace (ordered steps below)
Content:
**Steps:**
~~~~text
(a) Byte-copy the file to `<scratch>/workspace-layout.base.json` and record its SHA-256.
(b) Save the four overlays. Then hand-add `roles.overlays` = `{"path": "Virtuoso/overlays", "provider": "directory", "authority": "reference", "mutability": "read-only", "allowedWriters": [], "validation": "exists", "classification": "active", "origin": "authored"}`.
(c) Hand-add top-level `x-commands` with four entries. Each entry has `run`, `workingDirectory: "."`, `requires: ["node_modules from npm ci"]` and `produces`. The `run` values match `package.json` on `80dbe938`:
  - `test`: `npm test`
  - `typecheck`: `npm run typecheck`
  - `build`: `npm run build`
  - `perf`: `npm run perf`
(d) Write the seven workstreams: preview `pwsh -NoProfile -File $W virtuoso_registry --root $WC --actor roadmap-review policy-set roadmap.workstreams --value-json '<the six base lanes in order, then Blurby Business, as {id,name}>'`, then run it with `--apply`.
(e) Hand-delete only `policy.roadmap.lanes`.
(f) Re-run (d) with `--apply` and the same value. This validates and backs up the whole manifest.
(g) Run preflight. C1 must pass.
~~~~

The literal `--value-json` for (d) and (f):

**Value:**
~~~~text
[{"id": "UX polish", "name": "UX polish"}, {"id": "TTS / Narration Engine", "name": "TTS / Narration Engine"}, {"id": "Reader Engine", "name": "Reader Engine"}, {"id": "Chrome Extension", "name": "Chrome Extension"}, {"id": "Library & Content", "name": "Library & Content"}, {"id": "Platform & Maintenance", "name": "Platform & Maintenance"}, {"id": "Blurby Business", "name": "Blurby Business"}]
~~~~

On any refusal at (d) or (f), or a registry reason for C1 failing: restore `<scratch>/workspace-layout.base.json`
byte-for-byte, verify its SHA-256, stop and report to Blurby.Brain1; never hand-patch around a refusal. A ledger line
already appended stays (append-only) and is recorded in the close-out.

## Target: docs/governance/LESSONS_LEARNED.md

Writer: `roadmap-review` through the helper (lessons allowedWriters; `--actor virtuoso` is refused).

### Fold-in L1 — LL-091 retired by status record
Section: append-only status record for LL-091
Action: Append row (through the command below; compare LL-091's status with `lessons --open` first — standing rule 51)
**Command:**
~~~~text
pwsh -NoProfile -File $W virtuoso_registry --root $WC --actor roadmap-review lessons --record-status LL-091 --status "Retired — superseded by the Virtuoso plugin's wave sizing (skills/effort-levels: tool budget <=40, wall time <=60 minutes, mixed-effort split); AGENT-PROTOCOL-CONSOLIDATION-1" --item AGENT-PROTOCOL-CONSOLIDATION-1 --apply
~~~~

## Target: CLAUDE.md

Writer: roadmap-review (x-agentInstructions allowedWriters), at /dispatch-closeout Wave 2 Step 0.

### Fold-in E1 — Division of Labor item 6: findings file
Section: §Cowork (you) — Planning & Oversight, item 6
Action: Replace

**Old:**
~~~~text
6. **Triage findings** — Review AGENT_FINDINGS.md, group issues, set priorities.
~~~~

**New:**
~~~~text
6. **Triage findings** — Review `docs/governance/Findings.md` (registered findings role), group issues, set priorities.
~~~~

### Fold-in E2 — Product lanes: seven workstreams (F-006)
Section: §Product lanes (roadmap and Notion)
Action: Replace

**Old:**
~~~~text
The Notion Lane field uses the six product domains declared in registry policy.roadmap.lanes: UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance.
~~~~

**New:**
~~~~text
The Notion Lane field uses the seven product domains declared in registry `policy.roadmap.workstreams` (Findings F-006): UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance; Blurby Business.
~~~~

### Fold-in E3 — Session-start step 2: plugin Zeus protocol and overlays
Section: §Mandatory Session-Start Protocol, step 2
Action: Replace

**Old:**
~~~~text
2. **`.claude/agents/zeus.md`** — The orchestrator protocol. Defines the mandatory sprint execution sequence (READ → PLAN → IMPLEMENT → TEST → VERIFY → DOCUMENT → GIT → REPORT). Follow this sequence exactly. Zeus never writes code — all implementation is delegated to doer agents.
~~~~

**New:**
~~~~text
2. **The Virtuoso plugin's Zeus protocol** — the `virtuoso` skill and `skills/virtuoso/references/zeus.md` — followed as written, plus Blurby's facts in `Virtuoso/overlays/` (list them with the rule-11a-guarded `virtuoso_registry --root . overlays`). There is no local copy; never create one.
~~~~

### Fold-in E4 — Agent Definition Files: roster tables → plugin roster and overlays
Section: §Agent Definition Files
Action: Replace

**Old:**
~~~~text
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
~~~~

**New:**
~~~~text
Agents are the plugin's (`virtuoso:` roster), selected by its Zeus protocol.

Blurby overlays: `Virtuoso/overlays/skills/virtuoso/SKILL.md`, `Virtuoso/overlays/agents/Hippocrates.md`, `Virtuoso/overlays/agents/Plato.md`, `Virtuoso/overlays/agents/MarcusAurelius.md`.
~~~~

### Fold-in E5 — How Dispatches Work: routing tree → plugin zeus.md
Section: §How Dispatches Work (first paragraph kept)
Action: Replace

**Old:**
~~~~text
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
~~~~

**New:**
~~~~text
Zeus routes and orders work as the plugin's `skills/virtuoso/references/zeus.md` states.
~~~~

### Fold-in E6 — Agent Scope Labels: delete specialist and orchestration tables
Section: §Agent Scope Labels (Reference) (code-scope labels kept)
Action: Replace

**Old:**
~~~~text
**Specialist agents** (spawned by Zeus for verification and support):

| Agent | Scope | Files |
|-------|-------|-------|
| `Hippocrates` | Test execution and build verification | `tests/`, `package.json` scripts |
| `Solon` | Verify every SUCCESS CRITERIA item from the dispatch is met | Read-only, cross-references dispatch spec |
| `Plato` | Architecture compliance, known-trap detection, code quality | Read-only review pass |
| `MarcusAurelius` | Documentation updates (mandatory penultimate step in every sprint) | `CLAUDE.md`, `ROADMAP.md`, `docs/governance/` |
| `Aristotle` | Root-cause analysis when investigation is needed | Read-only diagnosis + fix spec |
| `Simonides` | Cross-agent memory, findings queue, continuity | `.claude/agents/memory.yaml` (created on first save) |

**Orchestration:**

| Agent | Scope | Files |
|-------|-------|-------|
| `Zeus` | Sprint orchestrator — task decomposition, agent dispatch, progress tracking | All (read), delegates all writes |

#### Post-Completion Checklist
~~~~

**New:**
~~~~text
#### Post-Completion Checklist
~~~~

### Fold-in E7 — Post-Completion Checklist: spec-compliance review
Section: §Post-Completion Checklist, first item
Action: Replace

**Old:**
~~~~text
- [ ] Every SUCCESS CRITERIA item from the dispatch is met (Solon pass)
~~~~

**New:**
~~~~text
- [ ] Every SUCCESS CRITERIA item from the dispatch is met (the plugin's spec-compliance review)
~~~~

### Fold-in E8 — Mandatory MarcusAurelius Pass and efficiency rule → one pointer line
Section: §Mandatory MarcusAurelius Pass (After Every Sprint) (heading kept)
Action: Replace

**Old:**
~~~~text
After EVERY sprint completion — hotfixes included, no exceptions — run the MarcusAurelius pass:

1. **ROADMAP.md** — Update header (version, date, state). Archive completed sprint spec to `docs/planning/.Archive/ROADMAP_legacy.md`. Update Sprint Status table.
2. **Notion work register** — Record completion date and evidence, clear the finished item's Seq, renumber the queue through the provider/connector flow, and verify queued depth ≥ 3.
3. **CLAUDE.md** — Update version, sprint list, dependency chain, test counts.
4. **LESSONS_LEARNED.md** — Add entry if any non-trivial discovery was made.
5. **BUG_REPORT.md** — Mark any bugs fixed by this sprint as resolved.
6. **TECHNICAL_REFERENCE.md** — Update if architecture changed.

**MarcusAurelius efficiency rule:** Zeus SHOULD pre-compose exact old_string/new_string edit diffs for doc updates and include them in the MarcusAurelius dispatch. This lets MarcusAurelius apply edits directly without re-reading each file to discover what changed. When provided, pre-composed diffs cut MarcusAurelius tool calls by ~50%. When not feasible (e.g., complex multi-section updates), MarcusAurelius falls back to standard read-then-edit.
~~~~

**New:**
~~~~text
Documentation runs as *Document Lifecycle* states, with Blurby's documentation facts in `Virtuoso/overlays/agents/MarcusAurelius.md`.
~~~~

### Fold-in E9 — Standing rule: spec-compliance before quality review
Section: §Standing Rules
Action: Replace

**Old:**
~~~~text
- **Spec-compliance review before quality review.** For multi-task sprints, each task gets a spec-compliance check (does it match the dispatch spec?) before a quality check (is it well-built?). `Solon` performs this step. Full-tier sprints then spawn `Plato`. Quick-tier sprints use Zeus self-review. **For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible in the execution sequence.** Both are read-only — sequential execution wastes time with zero benefit. (Promoted from SRL-012 after two validated occurrences: READER-4M-2 missed parallelization, QWEN-STREAM-2 executed parallel and saved ~65s.)
~~~~

**New:**
~~~~text
- **Spec-compliance review before quality review.** Every dispatch gets the plugin's spec-compliance review and then its quality review, by the agents and in the order `skills/virtuoso/references/zeus.md` names. No dispatch tier omits either review (SRL-012 amended 2026-10-30).
~~~~

### Fold-in E10 — Standing rule: dispatch sizing is the plugin's
Section: §Standing Rules
Action: Replace

**Old:**
~~~~text
- **Dispatch sizing: 40 tool-use ceiling per wave.** A single Zeus dispatch must stay under ~40 tool uses. **Sprints with 5+ implementation tasks MUST be pre-split into waves at dispatch time** (don't wait for a runtime ceiling hit). Standard wave split: Wave A = implement + test, Wave B = verify + docs + git. Each wave is a separate CLI dispatch. Estimate: 1 tool use per file read, 1-2 per file write, 3-5 per sub-agent spawn, 1 per bash command.
~~~~

**New:**
~~~~text
- **Dispatch sizing.** Waves are sized and split by the Virtuoso plugin's criteria (`skills/effort-levels/SKILL.md`, *This Is Additive*): tool budget ≤40, wall time ≤60 minutes, and a split when effort levels are significantly mixed. Each wave is a separate dispatch.
~~~~

### Fold-in E11 — Other References: Agent Definitions
Section: §Other References
Action: Replace

**Old:**
~~~~text
- **Agent Definitions**: `.claude/agents/` (Zeus, Hermes, Hercules, Athena, Aristotle, Hippocrates, Solon, Plato, MarcusAurelius, Simonides)
~~~~

**New:**
~~~~text
- **Agent Definitions**: the Virtuoso plugin's agents (`virtuoso:` roster) and its Zeus protocol (`skills/virtuoso/references/zeus.md`), plus Blurby's facts in `Virtuoso/overlays/`. The former local briefs are archived in `docs/planning/.Archive/agent-protocols-2026-10-30/`.
~~~~

## Target: AGENTS.md

Writer: roadmap-review (x-codexInstructions allowedWriters), at /dispatch-closeout Wave 2 Step 0.

### Fold-in E1 — Division of Labor item 6: findings file
Section: §Cowork (you) — Planning & Oversight, item 6
Action: Replace

**Old:**
~~~~text
6. **Triage findings** — Review AGENT_FINDINGS.md, group issues, set priorities.
~~~~

**New:**
~~~~text
6. **Triage findings** — Review `docs/governance/Findings.md` (registered findings role), group issues, set priorities.
~~~~

### Fold-in E2 — Product lanes: seven workstreams (F-006)
Section: §Product lanes (roadmap and Notion)
Action: Replace

**Old:**
~~~~text
The Notion Lane field uses the six product domains declared in registry policy.roadmap.lanes: UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance.
~~~~

**New:**
~~~~text
The Notion Lane field uses the seven product domains declared in registry `policy.roadmap.workstreams` (Findings F-006): UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance; Blurby Business.
~~~~

### Fold-in E3 — Session-start step 2: plugin Zeus protocol and overlays
Section: §Mandatory Session-Start Protocol, step 2
Action: Replace

**Old:**
~~~~text
2. **`.codex/agents/zeus.toml`** — The orchestrator protocol. Defines the mandatory sprint execution sequence (READ → PLAN → IMPLEMENT → TEST → VERIFY → DOCUMENT → GIT → REPORT). Follow this sequence exactly. Zeus never writes code — all implementation is delegated to doer agents.
~~~~

**New:**
~~~~text
2. **The Virtuoso plugin's Zeus protocol** — the `virtuoso` skill in the Codex plugin cache (`~/.codex/plugins/cache/virtuoso-marketplace/virtuoso/<version>/skills/virtuoso/`) and its `skills/virtuoso/references/zeus.md` — followed as written, plus Blurby's facts in `Virtuoso/overlays/` (list them with the rule-11a-guarded `virtuoso_registry --root . overlays`). There is no local copy; never create one.
~~~~

### Fold-in E4 — Agent Definition Files: roster tables → plugin roster and overlays
Section: §Agent Definition Files
Action: Replace

**Old:**
~~~~text
**Verified Codex availability (2026-10-26):** local configs are zeus.toml, hermes.toml, hercules.toml and athena.toml. Zeus is a behavioral protocol, not a spawned worker. Specialist names below are roles; there are no corresponding local Codex config files. Use an authorized generic worker with that role contract rather than a guessed missing path.

Agent `.toml` files in `.codex/agents/` define the scope, output contract, and strict rules for each agent role. Each file uses TOML keys and developer_instructions; the host determines which configurations are available.

**Orchestrator:**

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `zeus.toml` | Zeus | opus | Sprint orchestrator — decomposes tasks, dispatches doer agents, spawns specialists. **Never writes code.** |

**Doer agents** (implementation — Zeus selects cheapest tier that can handle each task):

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| `hermes.toml` | Hermes | haiku | Mechanical execution — prescribed diffs, config edits, version bumps, git ops |
| `hercules.toml` | Hercules | sonnet | Single-domain implementation — bounded judgment within one module |
| `athena.toml` | Athena | opus | Cross-system implementation — architectural judgment, multi-module changes |

**Specialist agents** (verification & support — take priority over doers when task matches):

| File | Agent | Model | Purpose |
|------|-------|-------|---------|
| role only (no local TOML) | Hippocrates | haiku | Test execution — run suites, categorize failures, report pass/fail |
| role only (no local TOML) | Solon | sonnet | Spec compliance — verify implementation matches every SUCCESS CRITERIA item |
| role only (no local TOML) | Plato | sonnet | Code quality — architecture compliance, known-trap detection |
| role only (no local TOML) | MarcusAurelius | sonnet | Documentation — update all governing docs after every sprint |
| role only (no local TOML) | Aristotle | opus | Root-cause diagnosis — read-only trace, produces fix specs |
| role only (no local TOML) | Simonides | sonnet | Memory guide — shared memory system, findings queue, cross-agent continuity |
~~~~

**New:**
~~~~text
Agents are the plugin's (`virtuoso:` roster), selected by its Zeus protocol; the host determines which agents are available.

Blurby overlays: `Virtuoso/overlays/skills/virtuoso/SKILL.md`, `Virtuoso/overlays/agents/Hippocrates.md`, `Virtuoso/overlays/agents/Plato.md`, `Virtuoso/overlays/agents/MarcusAurelius.md`.
~~~~

### Fold-in E5 — How Dispatches Work: routing tree → plugin zeus.md
Section: §How Dispatches Work (first paragraph kept)
Action: Replace

**Old:**
~~~~text
**Zeus never writes code.** It decomposes tasks, routes each one to the cheapest appropriate doer agent (Hermes → Hercules → Athena, escalating only as needed), then spawns specialist agents for verification and documentation.

**Task routing decision tree** (from zeus.toml):
1. Does a specialist match? (e.g., tests → Hippocrates, diagnosis → Aristotle) → assign specialist
2. Is the change fully prescribed (exact diff known)? → Hermes (haiku)
3. Does the task stay within one module? → Hercules (sonnet)
4. Does it cross module boundaries? → Athena (opus)
5. Fallback → Hercules (can self-escalate)

The dispatch's Task table tells Zeus:

- **Which doer tier** to use for each implementation task
- **Which specialists to spawn** for verification steps
- **What order** — sequential by default, parallel when explicitly marked
~~~~

**New:**
~~~~text
Zeus routes and orders work as the plugin's `skills/virtuoso/references/zeus.md` states.
~~~~

### Fold-in E6 — Agent Scope Labels: delete specialist and orchestration tables
Section: §Agent Scope Labels (Reference) (code-scope labels kept)
Action: Replace

**Old:**
~~~~text
**Specialist agents** (spawned by Zeus for verification and support):

| Agent | Scope | Files |
|-------|-------|-------|
| `Hippocrates` | Test execution and build verification | `tests/`, `package.json` scripts |
| `Solon` | Verify every SUCCESS CRITERIA item from the dispatch is met | Read-only, cross-references dispatch spec |
| `Plato` | Architecture compliance, known-trap detection, code quality | Read-only review pass |
| `MarcusAurelius` | Documentation updates (mandatory penultimate step in every sprint) | `AGENTS.md`, `ROADMAP.md`, `docs/governance/` |
| `Aristotle` | Root-cause analysis when investigation is needed | Read-only diagnosis + fix spec |
| `Simonides` | Cross-agent memory, findings queue, continuity | `.codex/agents/memory.yaml` (created on first save) |

**Orchestration:**

| Agent | Scope | Files |
|-------|-------|-------|
| `Zeus` | Sprint orchestrator — task decomposition, agent dispatch, progress tracking | All (read), delegates all writes |

#### Post-Completion Checklist
~~~~

**New:**
~~~~text
#### Post-Completion Checklist
~~~~

### Fold-in E7 — Post-Completion Checklist: spec-compliance review
Section: §Post-Completion Checklist, first item
Action: Replace

**Old:**
~~~~text
- [ ] Every SUCCESS CRITERIA item from the dispatch is met (Solon pass)
~~~~

**New:**
~~~~text
- [ ] Every SUCCESS CRITERIA item from the dispatch is met (the plugin's spec-compliance review)
~~~~

### Fold-in E8 — Mandatory MarcusAurelius Pass and efficiency rule → one pointer line
Section: §Mandatory MarcusAurelius Pass (After Every Sprint) (heading kept)
Action: Replace

**Old:**
~~~~text
After EVERY sprint completion — hotfixes included, no exceptions — run the MarcusAurelius pass:

1. **ROADMAP.md** — Update header (version, date, state). Archive completed sprint spec to `docs/planning/.Archive/ROADMAP_legacy.md`. Update Sprint Status table.
2. **Notion work register** — Record completion date and evidence, clear the finished item's Seq, renumber the queue through the provider/connector flow, and verify queued depth ≥ 3.
3. **AGENTS.md** — Update version, sprint list, dependency chain, test counts.
4. **LESSONS_LEARNED.md** — Add entry if any non-trivial discovery was made.
5. **BUG_REPORT.md** — Mark any bugs fixed by this sprint as resolved.
6. **TECHNICAL_REFERENCE.md** — Update if architecture changed.

**MarcusAurelius efficiency rule:** Zeus SHOULD pre-compose exact old_string/new_string edit diffs for doc updates and include them in the MarcusAurelius dispatch. This lets MarcusAurelius apply edits directly without re-reading each file to discover what changed. When provided, pre-composed diffs cut MarcusAurelius tool calls by ~50%. When not feasible (e.g., complex multi-section updates), MarcusAurelius falls back to standard read-then-edit.
~~~~

**New:**
~~~~text
Documentation runs as *Document Lifecycle* states, with Blurby's documentation facts in `Virtuoso/overlays/agents/MarcusAurelius.md`.
~~~~

### Fold-in E9 — Standing rule: spec-compliance before quality review
Section: §Standing Rules
Action: Replace

**Old:**
~~~~text
- **Spec-compliance review before quality review.** For multi-task sprints, each task gets a spec-compliance check (does it match the dispatch spec?) before a quality check (is it well-built?). `Solon` performs this step. Full-tier sprints then spawn `Plato`. Quick-tier sprints use Zeus self-review. **For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible in the execution sequence.** Both are read-only — sequential execution wastes time with zero benefit. (Promoted from SRL-012 after two validated occurrences: READER-4M-2 missed parallelization, QWEN-STREAM-2 executed parallel and saved ~65s.)
~~~~

**New:**
~~~~text
- **Spec-compliance review before quality review.** Every dispatch gets the plugin's spec-compliance review and then its quality review, by the agents and in the order `skills/virtuoso/references/zeus.md` names. No dispatch tier omits either review (SRL-012 amended 2026-10-30).
~~~~

### Fold-in E10 — Standing rule: dispatch sizing is the plugin's
Section: §Standing Rules
Action: Replace

**Old:**
~~~~text
- **Dispatch sizing: 40 tool-use ceiling per wave.** A single Zeus dispatch must stay under ~40 tool uses. **Sprints with 5+ implementation tasks MUST be pre-split into waves at dispatch time** (don't wait for a runtime ceiling hit). Standard wave split: Wave A = implement + test, Wave B = verify + docs + git. Each wave is a separate CLI dispatch. Estimate: 1 tool use per file read, 1-2 per file write, 3-5 per sub-agent spawn, 1 per bash command.
~~~~

**New:**
~~~~text
- **Dispatch sizing.** Waves are sized and split by the Virtuoso plugin's criteria (`skills/effort-levels/SKILL.md`, *This Is Additive*): tool budget ≤40, wall time ≤60 minutes, and a split when effort levels are significantly mixed. Each wave is a separate dispatch.
~~~~

### Fold-in E11 — Other References: Agent Definitions
Section: §Other References
Action: Replace

**Old:**
~~~~text
- **Agent Definitions**: `.codex/agents/` (Zeus, Hermes, Hercules, Athena, Aristotle, Hippocrates, Solon, Plato, MarcusAurelius, Simonides)
~~~~

**New:**
~~~~text
- **Agent Definitions**: the Virtuoso plugin's agents (`virtuoso:` roster) and its Zeus protocol (`skills/virtuoso/references/zeus.md`), plus Blurby's facts in `Virtuoso/overlays/`. The former local briefs are archived in `docs/planning/.Archive/agent-protocols-2026-10-30/`.
~~~~

## Target: ROADMAP.md

Writer: roadmap-review (roadmap allowedWriters), at /dispatch-closeout Wave 2 Step 0.

### Fold-in R1 — Work lanes intro: seven workstreams
Section: §Work lanes, first paragraph
Action: Replace

**Old:**
~~~~text
Registry policy.roadmap.lanes declares these six categories.
~~~~

**New:**
~~~~text
Registry `policy.roadmap.workstreams` declares these seven workstreams (the Notion Lane column).
~~~~

### Fold-in R2 — Standing rule 7 (SRL-012) amended
Section: §Standing Rules All Skeletons Inherit, rule 7
Action: Replace

**Old:**
~~~~text
7. **SRL-012:** For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible.
~~~~

**New:**
~~~~text
7. **SRL-012 (amended 2026-10-30):** reviews follow the Virtuoso plugin's order — spec compliance passes before the quality review.
~~~~

### Fold-in R3 — Standing rule 9 amended
Section: §Standing Rules All Skeletons Inherit, rule 9
Action: Replace

**Old:**
~~~~text
9. **Spec-compliance before quality:** Each task gets Solon check (does it match spec?) before Plato check (is it well-built?).
~~~~

**New:**
~~~~text
9. **Spec-compliance before quality:** each task's spec-compliance review passes before its quality review, as the plugin's Zeus protocol orders them.
~~~~

### Fold-in R4 — Standing rule 10 retired with its former text quoted
Section: §Standing Rules All Skeletons Inherit, rule 10
Action: Replace

**Old:**
~~~~text
10. **Dispatch sizing:** 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.
~~~~

**New:**
~~~~text
10. **Retired 2026-10-30 (AGENT-PROTOCOL-CONSOLIDATION-1):** dispatch sizing is the Virtuoso plugin's (`skills/effort-levels/SKILL.md`, *This Is Additive*: tool budget ≤40, wall time ≤60 minutes, mixed-effort split). Former text: "Dispatch sizing: 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves."
~~~~

### Note — Work lanes row already on main (no fold-in)
The specification's Work lanes fold-in (add a `| Blurby Business |` row after Platform & Maintenance) is not staged: `abdfe98e` ("absorb Blurby Business as BLURBY-BUSINESS-1") already added that row to `main`, so C8's `git grep -n -E "^\| Blurby Business \|" HEAD -- ROADMAP.md` exits 0 on the base. Staging it would duplicate the row. Blurby.Brain1 (2026-10-30): Blurby.Roadmap reconciles this at close-out.

## Dispatch receipts

### Package unchanged (D8, standing rule 53)
`package.json` `build.files` on the base: `["main.js","preload.js","main/**/*","dist/**/*","assets/icon.ico","assets/tray-icon.png"]`.
`git diff --name-only origin/main...HEAD -- main.js preload.js main dist assets/icon.ico assets/tray-icon.png` printed nothing (exit 0):
package unchanged. Blurby.Brain1's written confirmation is requested before the merge go.

### Pin (D5)
Before the first write and after the last: `zeus.toml` SHA-256 `3BDBE18856EBCE3672870FA5F242DF532FD3C4ADC7BFF63608BB1A180C38335B`;
`git -C C:/Projects/Blurby status --porcelain -- .codex .agents` printed exactly `?? .agents/` and `?? .codex/`.

### Helper side effects in the dispatch worktree (not committed)
The first guarded `timing` calls appended, in the worktree only: `CH-001` (`kind: plugin-version`, actor `virtuoso`,
`to: 1.16.1`) to `docs/governance/Change.Ledger.jsonl`, and one cost-backfill line to each of ten earlier
`docs/governance/close-outs/Timing.*.jsonl` logs. They are outside this dispatch's fence (D2, D9), so they stay
uncommitted in the worktree. `changeLedger` allowedWriters do not name `virtuoso`. Blurby.Brain1 (2026-10-30): leave
CH-001 uncommitted and list it here; `/dispatch-closeout` decides it.

## Rulings during dispatch

### R-C5a — Done-when C5a's `zeus` term amended (Blurby.Brain1, 2026-10-30)
- Problem: the specification's C5a term `zeus\.(md|toml)` also matches `skills/virtuoso/references/zeus.md`, which C6
  requires in CLAUDE.md and AGENTS.md and which the prescribed E3/E9 text contains; C5a and C6 could not both pass.
- Ruling: the `zeus` term becomes a lookbehind that exempts only the plugin path. C5a's zeus check is:
  `git grep -n -P '(?<!skills/virtuoso/references/)zeus\.(md|toml)' -- CLAUDE.md AGENTS.md`, expected **0 lines** on
  the post-change documents (base: 7 lines, CLAUDE.md 3 and AGENTS.md 4). C5a's other terms
  (`\.claude/agents|\.codex/agents|WORKFLOW_REFERENCE|memory\.yaml|policy\.roadmap\.lanes|sprint-queue`) stand; the
  D3 checker runs both this command and the full C5a pattern with the lookbehind term substituted.
- Reason: the proposed `(^|[^/])zeus\.(md|toml)` form misses slash-prefixed local paths such as
  `.claude/agents/zeus.md` and `.codex/agents/zeus.toml`.
- Positive control: the D3 checker must FAIL on a memo whose New text contains `.claude/agents/zeus.md`.
- Consequence for E5: the specification's New text names `references/zeus.md`, which the amended check flags. E5 New
  names the full plugin path `skills/virtuoso/references/zeus.md` (same pointer; memo fix per the failure table).

## Review verdicts

Plugin order (`skills/virtuoso/references/zeus.md`): spec compliance (MarcusAurelius), then quality (Plato), each a
fresh agent that neither wrote nor ran this item.

- Spec compliance: APPROVED
  - Reviewer: fresh `virtuoso:MarcusAurelius` agent, read-only, on `0294c198`, 2026-10-30.
  - Re-ran D1–D5: D1 `.claude/agents` empty, 11 `git diff --exit-code` = 0, 11 R100; D2 no output, `.claude` lists
    exactly the two memo-move files; D3 `folds=26 moves=2 overlays=4 CLAUDE.md=30369B AGENTS.md=30476B failures=0`,
    exit 0; D4 `1.16.2` exit 0, both cache loops no output exit 0; D5 `3BDBE188…335B`, `?? .agents/`, `?? .codex/`.
    D8 no output; D9 exactly 11 R100 + A memo.
  - Findings (all Low): empty verdict section (fixed: this entry); header base moved to `492db7f5` (fixed: header);
    E5 Old also removes the "Zeus never writes code" paragraph, which names retired agents (consistent with Z9 and C5b;
    no change); W1 did not name the ledger line (fixed: W1 writer note).
  - D3 positive control (R-C5a) was run by the dispatch: the checker exits 1 on a memo whose E5 New names
    `.claude/agents/zeus.md`.
