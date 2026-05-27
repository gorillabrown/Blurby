# Governance Sweep Spec — Blurby — 2026-05-21

> Produced by the read-only `governance-sweep` skill (Cowork). Cowork made **no**
> file changes. This spec is the single artifact. **CLI executes it.**
>
> **Path convention:** Project root = `C:\Users\estra\Projects\Blurby`. All paths
> below are relative to that root unless shown absolute. Match strings for content
> edits are verbatim and unique within the target file (validated in Phase 6).

## Summary
- Directories scanned: 80+ (docs/ tree, .claude/ infra, root governance docs)
- Findings: 13
- Actions queued for CLI: 25 (1 relocate, 7 archive, 6 readme creates, 11 content repairs)
- Files affected: 17
- Estimated execution time: medium
- Human-review items deferred: 6
- Optional modules activated: **Agent roster checks**, **Sprint artifact checks**
  (no parity targets — `.claude/worktrees/` are gitignored working copies, out of scope)

### Scope note — what was excluded
The following are **gitignored scratch/working directories** and are intentionally
local-only; they are NOT part of the governance document tree and were excluded:
`.tmp/`, `tmp/`, `tmp_brandcheck*/`, `artifacts/`, `.worktrees/`,
`.claude/worktrees/`, `docs/bug-reports/`, `node_modules/`, `dist/`, `release/`.

---

## Pre-flight (CLI runs first)
1. Confirm working directory is the project root: `C:\Users\estra\Projects\Blurby`.
2. Create a timestamped backup directory: `.governance-sweep-backup/2026-05-21/`.
   (Note: `.Backup/` is gitignored; place the backup dir under it or add an ignore
   entry so the backup is not accidentally committed.)
3. Copy every file listed in the **Backup Manifest** (bottom of this spec) into the
   backup directory, preserving relative paths, **before** any mutation.
4. Do NOT run any git operation as part of this spec. Version control is handled
   separately (see `git-handoff`) after the sweep is reviewed.

---

## Action Group A — Junk Removal
**None.** No temp files, OS artifacts (`.DS_Store`/`Thumbs.db`), swap files, or empty
files were found in the tracked document tree. (All such artifacts live in the
gitignored scratch dirs listed above and are out of scope.)

---

## Action Group B — Misplaced Content Relocation

### B1 — Move misplaced investigation memo `[user-confirmed]`
- **Source:** `docs/governance/2026-04-04-kokoro-native-rate-buckets.md`
- **Target:** `docs/studies/investigations/2026-04-04-kokoro-native-rate-buckets.md`
- **Rationale:** Dated investigation memo. Investigation memos live under
  `docs/studies/investigations/` (peers: `HOTFIX-14-investigation.md`,
  `SELECTION-1-investigation.md`). Confirmed by Evan.
- **Verify:** source no longer exists; target exists.

---

## Action Group C — Archival

> Target archive for completed dispatches: `docs/planning/.Archive/` (existing home
> for `HOTFIX-2-REMEDIATION.md`, `HOTFIX-2B-IMPLEMENTATION.md`, etc.).

### C1 — Archive HOTFIX-1 dispatch `[user-confirmed]`
- **Source:** `docs/governance/HOTFIX-1-DISPATCH.md`
- **Target:** `docs/planning/.Archive/HOTFIX-1-DISPATCH.md`
- **Rationale:** Completed hotfix dispatch (dated 2026-03-31); project is now at v1.75.1.

### C2 — Archive HOTFIX-2-KOKORO dispatch `[user-confirmed]`
- **Source:** `docs/governance/HOTFIX-2-KOKORO-DISPATCH.md`
- **Target:** `docs/planning/.Archive/HOTFIX-2-KOKORO-DISPATCH.md`
- **Rationale:** Completed hotfix dispatch.

### C3 — Archive HOTFIX-4 dispatch `[user-confirmed]`
- **Source:** `docs/governance/HOTFIX-4-DISPATCH.md`
- **Target:** `docs/planning/.Archive/HOTFIX-4-DISPATCH.md`
- **Rationale:** Completed hotfix dispatch (dated 2026-03-31).

### C4 — Archive HOTFIX-10 dispatch `[user-confirmed]`
- **Source:** `docs/planning/HOTFIX-10-dispatch.md`
- **Target:** `docs/planning/.Archive/HOTFIX-10-dispatch.md`
- **Rationale:** Completed hotfix dispatch.

### C5 — Archive HOTFIX-10 investigation `[user-confirmed]`
- **Source:** `docs/planning/HOTFIX-10-investigation.md`
- **Target:** `docs/planning/.Archive/HOTFIX-10-investigation.md`
- **Rationale:** Investigation supporting the completed HOTFIX-10; archive with its dispatch.

### C6 — Archive SK-HYG-2 dispatch `[user-confirmed]`
- **Source:** `docs/planning/SK-HYG-2-DISPATCH.md`
- **Target:** `docs/planning/.Archive/SK-HYG-2-DISPATCH.md`
- **Rationale:** Completed sprint dispatch (SK-HYG-2 close-out exists at
  `docs/governance/close-outs/CloseOut.SK-HYG-2.2026-05-16.md`).

### C7 — Archive superseded markdown sprint queue `[user-confirmed]`
- **Source:** `.claude/sprint-queue.md`
- **Target:** `docs/planning/.Archive/sprint-queue.legacy.2026-04-24.md`
- **Rationale:** Superseded by the authoritative `docs/governance/sprint-queue.xlsx`.
  CLAUDE.md and ROADMAP.md both declare the `.xlsx` the *only* sprint-queue source of
  truth. Renamed on archive to avoid confusion with the live workbook. Confirmed by Evan.
- **Note:** Reference fixes for this file are handled in Action Group F (F6–F8).

---

## Action Group D — Orphan Absorption
**None.** No orphan files were classified for merge-into-parent.

---

## Action Group E — readme.md Synchronization

> Strategy chosen by Evan: **top-level hubs only.** Create `readme.md` for the six
> primary documentation hubs. CLAUDE.md's "Where Things Live" table remains the broad
> structural authority. These readmes must reflect the **post-move** state (run after
> Groups B and C). Sub-sub directories that already have a `README.md`
> (`docs/studies/audit/2026-05-02-moss-nano-productization-third-party-audit/`,
> `docs/studies/research/third-party-audit/2026-04-18-qwen-kokoro-readiness/`,
> `docs/studies/research/tts-engine-scan/`) are left untouched.

### E1 — Create `docs/readme.md`
```markdown
# docs/ — Documentation Hub

Top-level home for all Blurby documentation. The authoritative map of where content
belongs is CLAUDE.md → "Where Things Live"; this readme summarizes the directory.

## Files
| File | Type | Purpose |
|------|------|---------|
| `code-signing.md` | markdown | Code-signing procedure/notes for releases |
| `Superhuman_Keyboard_Shortcuts.pdf` | pdf | External reference (keyboard-shortcut design inspiration) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `brand/` | Brand standards (PDF) |
| `bug-reports/` | Raw in-app bug captures (gitignored, local-only) |
| `evidence/` | Curated, tracked evidence artifacts promoted from local runs |
| `governance/` | Governing source-of-truth docs (see its readme) |
| `planning/` | Roadmap reviews, plans, specs, archives (see its readme) |
| `studies/` | Audits, investigations, research, reviews (see its readme) |
| `testing/` | Test checklists, runbooks, eval baselines (see its readme) |

## What does NOT belong here
Source code, build output, and runtime binaries. Raw local captures stay in the
gitignored `bug-reports/`.
```

### E2 — Create `docs/governance/readme.md`
```markdown
# docs/governance/ — Governing Documents

Source-of-truth operational and governance documents. Several of these are the
"7 Governing Documents" referenced in CLAUDE.md.

## Files
| File | Type | Purpose |
|------|------|---------|
| `TECHNICAL_REFERENCE.md` | markdown | Architecture, data model, every feature |
| `BUG_REPORT.md` | markdown | Active bugs — severity, location, resolution |
| `LESSONS_LEARNED.md` | markdown | Engineering discoveries, standing rules, anti-patterns |
| `IDEAS.md` | markdown | Unroadmapped concepts, reviewed at phase pauses |
| `DEVELOPMENT_SYNC.md` | markdown | Local-first git workflow SOP |
| `sprint-queue.xlsx` | binary/xlsx | **Authoritative** FIFO sprint queue (Catalog + Dashboard tabs) |
| `TTS_ARCHITECTURE_DECISIONS.md` | markdown | Canonical TTS architecture decisions |
| `TTS-AUDIT-2026-03-28.md` | markdown | TTS audit record |
| `TTS-AUDIT-ORIENTATION.md` | markdown | TTS audit orientation |
| `TTS-AUDIT-REVIEW.md` | markdown | TTS audit review |
| `TTS_EVAL_RUNBOOK.md` | markdown | TTS eval runbook |
| `TTS_EVAL_REVIEW_TEMPLATE.md` | markdown | TTS eval review template |
| `QWEN_SUPPORTED_HOST_POLICY.md` | markdown | Qwen supported-host policy |
| `blurby-tts-audit-package.zip` | binary/zip | Bundled TTS audit package (historical) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `close-outs/` | Per-sprint close-out reports (`CloseOut.<ID>.<YYYY-MM-DD>.md`) and SpecRetro |
| `bug-reports/` | In-app bug-report intake (with `.Archive/` for processed reports) |

## Naming conventions
- Close-outs: `CloseOut.<SPRINT-ID>.<YYYY-MM-DD>.md`
- Memos: `Memo.<ID>.<context>.<YYYY-MM-DD>.md`

## What does NOT belong here
Completed sprint/hotfix **dispatches** (archive to `docs/planning/.Archive/`) and
one-off investigation memos (file under `docs/studies/investigations/`).
```

### E3 — Create `docs/planning/readme.md`
```markdown
# docs/planning/ — Planning & Roadmap Workspace

Forward-looking and historical planning artifacts: roadmap reviews, plans, specs,
release checklists, and the planning archive.

## Files
| File | Type | Purpose |
|------|------|---------|
| `Blurby_Project_Constitution.md` | markdown | Project constitution |
| `AGENT_FINDINGS.md` | markdown | Triage queue of agent-reported findings |
| `CLAUDE_md_archive_session1.md` | markdown | Archived CLAUDE.md sprint history (session 1) |
| `hotkey-reference.md` | markdown | Hotkey reference |
| `postv2-narr-1-debt-map.md` | markdown | Post-v2 narration tech-debt map |
| `desktop-v2.0-release-checklist.md` | markdown | Desktop v2.0 release checklist |
| `desktop-v2.0-release-notes.md` | markdown | Desktop v2.0 release notes |
| `Reading_Log_Blurby_Template.xlsx` | binary/xlsx | Reading-log template |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `plans/` | Dated implementation plans (+ `.Archive/`) |
| `specs/` | Dated design specs (+ `.Archive/`) |
| `roadmap-reviews/` | Roadmap-review ceremony artifacts (+ `checkins/`) |
| `.Archive/` | Completed dispatches, archived ROADMAP snapshots, legacy queue |

## What does NOT belong here
Active governing docs (those live in `docs/governance/`). Completed dispatches are
archived into `.Archive/`.
```

### E4 — Create `docs/studies/readme.md`
```markdown
# docs/studies/ — Research, Audits & Investigations

Deeper analytical work products: external/internal audits, engine research,
investigations, and codebase/literature reviews.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `audit/` | Structured codebase & third-party audits (`OutsideAudit.N.<date>/`, `AUDIT 1/`, audit packages, orientation/process docs) |
| `investigations/` | One-off investigation memos (`*-investigation.md`, dated memos) |
| `research/` | TTS engine scans and third-party readiness research (some subdirs carry their own README.md) |
| `reviews/` | Literature/codebase reviews |

## Naming conventions
- Outside audits: `OutsideAudit.<N>.<YYYY-MM-DD>/`
- Investigations: `<ID>-investigation.md` or `<YYYY-MM-DD>-<topic>.md`

## What does NOT belong here
Governing decision records (those are in `docs/governance/`).
```

### E5 — Create `docs/testing/readme.md`
```markdown
# docs/testing/ — Test Plans, Runbooks & Eval Artifacts

Manual test checklists, evaluation runbooks/policies, decision logs, listening-review
records, and machine-readable eval baselines/quality gates.

## Files (by category)
| Category | Files |
|----------|-------|
| Checklists | `TTS_ADVERSARIAL_REVIEW_CHECKLIST.md`, `TTS_EVAL_RELEASE_CHECKLIST.md`, `TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md`, `TTS_LIVE_BUG_SWEEP_CHECKLIST.md`, `tts-browser-test-checklist.md`, `tts-electron-test-checklist.md`, `tts-manual-test-checklist.md`, `chrome-clickthrough-checklist.md` |
| Runbooks / protocols | `TTS_EVAL_MATRIX_RUNBOOK.md`, `perf-manual.md`, `chrome-test-runner-protocol.md`, `auto-update-e2e.md` |
| Policies / decisions | `TTS_EVAL_BASELINE_POLICY.md`, `MOSS_DECISION_LOG.md`, `QWEN_STREAMING_DECISION.md`, `KOKORO_RETIREMENT_SCORECARD.md` |
| Setup / feasibility | `MOSS_RUNTIME_SETUP.md`, `MOSS_RUNTIME_SHAPE_COMPARISON.md`, `MOSS_FLAGSHIP_FEASIBILITY.md`, `QWEN_RUNTIME_SETUP.md` |
| Listening reviews / SOWs | `moss-vs-kokoro-listening-review.md`, `qwen-vs-kokoro-listening-review.md`, `kokoro-voice-mixing-evidence.md`, `flow-narrate-live-iterative-sow.md`, `flow-narrate-sow-closeout-2026-05-20.md` |
| Test-run records | `test-run-2026-03-28.md`, `test-run-CT3-2026-03-28.md`, `test-run-2026-04-16-tts-live-sweep.md`, `bug-sweep-2026-05-20.md` |
| Eval data (json) | `tts_eval_baseline_v1.json`, `tts_eval_baseline_v2.json`, `tts_quality_gates.v1.json`, `tts_quality_gates.v2.json` |
| Diagnostics | `tts-diagnostics-bundle.md` |

## What does NOT belong here
Automated test source (those live in `tests/`).
```

### E6 — Create `.claude/agents/readme.md`
```markdown
# .claude/agents/ — Agent Definitions

Agent role definitions used by the CLI orchestration system. Each `.md` carries YAML
frontmatter (name, model, tools) for Claude Code auto-discovery. The orchestrator
protocol is `zeus.md`; the canonical roster is mirrored in CLAUDE.md.

## Active roster
| File | Agent | Model | Role |
|------|-------|-------|------|
| `zeus.md` | Zeus | opus | Orchestrator protocol (read by CLI, never spawned) |
| `hermes.md` | Hermes | haiku | Mechanical execution |
| `Hercules.md` | Hercules | sonnet | Single-domain implementation |
| `athena.md` | Athena | opus | Cross-system implementation |
| `aristotle.md` | Aristotle | opus | Root-cause diagnosis |
| `hippocrates.md` | Hippocrates | haiku | Test execution |
| `solon.md` | Solon | sonnet | Spec compliance |
| `plato.md` | Plato | sonnet | Code quality |
| `herodotus.md` | Herodotus | sonnet | Documentation |
| `simonides.md` | Simonides | sonnet | Memory / continuity |

## Pending / flagged
| File | Status |
|------|--------|
| `MarcusAurelius.md` | Stub — frontmatter `name: MarcusAurelius` but body is an uncustomized Herodotus template. Retained per owner decision; needs proper authoring or removal (see deferred-review). |

## Naming convention
Agent filenames are lowercase (`hermes.md`, `athena.md`, …). `Hercules.md` and
`MarcusAurelius.md` are TitleCase outliers (see deferred-review).
```

---

## Action Group F — Content Repairs

> Each repair is an in-place find/replace. The **Find** block is verbatim and unique
> within the target file (validated in Phase 6). Apply exactly once unless noted.
> UTF-8 em-dash `—` and arrow `→` are part of the literal text — preserve them.

### F1 — CLAUDE.md: ghost agent (doer table) → Hercules `[recommended]`
File: `CLAUDE.md`

Find:
```
| `hephaestus.md` | Hephaestus | sonnet | Single-domain implementation — bounded judgment within one module |
```
Replace:
```
| `Hercules.md` | Hercules | sonnet | Single-domain implementation — bounded judgment within one module |
```
Authority: live file is `.claude/agents/Hercules.md` (`name: Hercules`, sonnet,
"single-domain implementation"); `.claude/agents/hephaestus.md` does not exist;
`zeus.md` (the protocol CLI loads) routes to Hercules.

### F2 — CLAUDE.md: routing prose → Hercules `[recommended]`
File: `CLAUDE.md`

Find:
```
routes each one to the cheapest appropriate doer agent (Hermes → Hephaestus → Athena, escalating only as needed)
```
Replace:
```
routes each one to the cheapest appropriate doer agent (Hermes → Hercules → Athena, escalating only as needed)
```

### F3 — CLAUDE.md: decision tree → Hercules `[recommended]`
File: `CLAUDE.md`

Find:
```
3. Does the task stay within one module? → Hephaestus (sonnet)
```
Replace:
```
3. Does the task stay within one module? → Hercules (sonnet)
```

### F4 — CLAUDE.md: fallback line → Hercules `[recommended]`
File: `CLAUDE.md`

Find:
```
5. Fallback → Hephaestus (can self-escalate)
```
Replace:
```
5. Fallback → Hercules (can self-escalate)
```

### F5 — CLAUDE.md: agent-definitions list → Hercules `[recommended]`
File: `CLAUDE.md`

Find:
```
- **Agent Definitions**: `.claude/agents/` (Zeus, Hermes, Hephaestus, Athena, Aristotle, Hippocrates, Solon, Plato, Herodotus, Simonides)
```
Replace:
```
- **Agent Definitions**: `.claude/agents/` (Zeus, Hermes, Hercules, Athena, Aristotle, Hippocrates, Solon, Plato, Herodotus, Simonides)
```

### F6 — CLAUDE.md: version in state header → v1.75.1 `[user-confirmed]`
File: `CLAUDE.md`

Find:
```
## Current System State (v1.76.0 — queue RED depth 2, 1 open bug)
```
Replace:
```
## Current System State (v1.75.1 — queue RED depth 2, 1 open bug)
```
Authority: `package.json` = `1.75.1` (ground truth); ROADMAP.md = `v1.75.1 stable`.
Confirmed by Evan: correct CLAUDE.md down; do not bump package.json/ROADMAP.

### F7 — CLAUDE.md: archived-history version span → v1.75.1 `[user-confirmed]`
File: `CLAUDE.md`

Find:
```
(68 sprints, v1.29.0→v1.76.0)
```
Replace:
```
(68 sprints, v1.29.0→v1.75.1)
```

### F8 — CLAUDE.md: most-recent-sprint version → v1.75.1 `[user-confirmed]`
File: `CLAUDE.md`

Find:
```
- **Most recent sprint:** FLOW-ZONE-AUTO (v1.76.0) — descending auto-advancing reading zone.
```
Replace:
```
- **Most recent sprint:** FLOW-ZONE-AUTO (v1.75.1) — descending auto-advancing reading zone.
```

### F9 — CLAUDE.md: harmonize size-cap contradiction → ~35k `[recommended]`
File: `CLAUDE.md`

Find:
```
| Current system state + agent config | `CLAUDE.md` | Keep under ~20k chars. Archive old sprint details. |
```
Replace:
```
| Current system state + agent config | `CLAUDE.md` | Keep under ~35k chars. Archive old sprint details. |
```
Authority: Rule 7 ("CLAUDE.md stays under ~35k chars") and the Cleanup Cadence
("CLAUDE.md target: <35k chars") both say 35k; this table row's "20k" is the lone
outlier. (Current file is ~28k chars.)

### F10 — herodotus.md: repoint stale queue reference → xlsx `[user-confirmed]`
File: `.claude/agents/herodotus.md`

Find:
```
| .governance/sprint-queue.md | Sprint completed and verified |
```
Replace:
```
| docs/governance/sprint-queue.xlsx | Sprint completed and verified |
```
Rationale: the markdown queue is being archived (C7); the authoritative queue is the xlsx.

### F11 — WORKFLOW_REFERENCE.md: repoint stale queue references → xlsx `[user-confirmed]`
File: `.claude/WORKFLOW_REFERENCE.md`

This file references the superseded markdown queue **twice** (a table row and a prose
line). Replace **both** occurrences of the token below.

Find (all occurrences of this token):
```
.governance/sprint-queue.md
```
Replace with:
```
docs/governance/sprint-queue.xlsx
```
Expected: 2 replacements (table row "7" and the "must contain at least 3
un-dispatched sprints" prose line). After replacing, `grep -c "sprint-queue.md"
.claude/WORKFLOW_REFERENCE.md` → 0.

---

## Action Group G — Parity Sync
**Not applicable.** No canonical→deployment parity targets in scope. (`.claude/worktrees/`
contains gitignored working copies of the repo and is not a deployment target.)

---

## Verification (CLI runs after all action groups)
1. **Moves/archives:** confirm each Group B/C source path no longer exists and each
   target path exists. Specifically:
   - `docs/governance/2026-04-04-kokoro-native-rate-buckets.md` → gone; present under `docs/studies/investigations/`.
   - `docs/governance/HOTFIX-1-DISPATCH.md`, `HOTFIX-2-KOKORO-DISPATCH.md`, `HOTFIX-4-DISPATCH.md` → gone; present under `docs/planning/.Archive/`.
   - `docs/planning/HOTFIX-10-dispatch.md`, `HOTFIX-10-investigation.md`, `SK-HYG-2-DISPATCH.md` → gone; present under `docs/planning/.Archive/`.
   - `.claude/sprint-queue.md` → gone; present as `docs/planning/.Archive/sprint-queue.legacy.2026-04-24.md`.
2. **Readmes:** the six new `readme.md` files exist and every file/subdir they list is
   present on disk (post-move state).
3. **Content repairs:** `grep -rn "Hephaestus" CLAUDE.md` → **zero hits**.
   `grep -n "v1.76.0" CLAUDE.md` → **zero hits**.
   `grep -rn "sprint-queue.md" .claude/agents/herodotus.md .claude/WORKFLOW_REFERENCE.md`
   → **zero hits** (the `.md` queue reference is gone; xlsx reference present).
   `grep -n "~20k chars" CLAUDE.md` → **zero hits**.
4. **Ghost-agent sweep (tracked, non-archive):** `grep -rln "Hephaestus" CLAUDE.md ROADMAP.md ROADMAP_SPECS.md`
   → **zero hits**. (Archived ROADMAP snapshots and historical roadmap-review files
   under `docs/planning/.Archive/` and `docs/planning/roadmap-reviews/` retain the old
   name as historical record and are intentionally NOT edited.)
5. Print a completion report: actions per group, files changed, and any anomalies.

---

## Human-Review Items Deferred
1. **`.claude/agents/MarcusAurelius.md` (stub).** Retained per owner decision. Body is
   an uncustomized "# Herodotus Agent" template with `[CUSTOMIZE: …]` placeholders, and
   it references the now-archived `.governance/sprint-queue.md`. Next step: either author
   a real MarcusAurelius role or delete the file. Until then it remains a non-functional
   roster entry.
2. **ROADMAP.md stale header date.** "Last updated: 2026-05-17" predates the listed last
   sprint "FLOW-ZONE-AUTO (2026-05-19)". The correct last-updated value is unknown; left
   for manual correction.
3. **ROADMAP_SPECS.md not referenced in CLAUDE.md.** ROADMAP_SPECS.md is an active
   companion to ROADMAP.md (referenced by ROADMAP.md and several governance docs) but
   CLAUDE.md's planning contract / Key References never mention it. Consider adding it to
   CLAUDE.md "Other References". (Not auto-applied — placement is an editorial call.)
4. **ROADMAP_SPECS.md Architecture-Decisions duplication.** ROADMAP_SPECS.md self-notes
   its Architecture Decisions are now canonical in
   `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`. Possible future consolidation to
   remove the duplicated AD section from ROADMAP_SPECS.md.
5. **Close-out volume.** `docs/governance/close-outs/` holds 34 files (above the advisory
   rotation threshold of 20). Most are recent (May 2026) and actively referenced by
   ROADMAP.md, so no rotation is recommended now. Re-evaluate at the next phase boundary.
6. **Naming-convention outliers.** Agent files `Hercules.md` / `MarcusAurelius.md` are
   TitleCase among lowercase peers; `docs/studies/` has space-bearing directory names
   (`AUDIT 1/`, `investigations/TTS Model Research/`, `…/3rd Party/`). Renaming would
   touch cross-references and git history — left for a deliberate, separately planned pass.

---

## Backup Manifest
Back up these files into `.governance-sweep-backup/2026-05-21/` (preserving relative
paths) before any mutation:

- `CLAUDE.md`
- `.claude/agents/herodotus.md`
- `.claude/WORKFLOW_REFERENCE.md`
- `.claude/sprint-queue.md`
- `docs/governance/2026-04-04-kokoro-native-rate-buckets.md`
- `docs/governance/HOTFIX-1-DISPATCH.md`
- `docs/governance/HOTFIX-2-KOKORO-DISPATCH.md`
- `docs/governance/HOTFIX-4-DISPATCH.md`
- `docs/planning/HOTFIX-10-dispatch.md`
- `docs/planning/HOTFIX-10-investigation.md`
- `docs/planning/SK-HYG-2-DISPATCH.md`

(readme.md creates in Group E are new files — no backup needed.)
```
