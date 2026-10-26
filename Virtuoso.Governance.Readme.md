# Virtuoso Governance Registry

`Virtuoso/workspace-layout.json` is the **authority** for this project's governance
configuration. This document is a synchronized, human-readable view of it.

Everything outside the generated region below is yours: prose, extra tables, notes,
project-specific rules. The plugin never rewrites it. Inside the generated region the
plugin renders the registered roles; edit the manifest (or run the registry repair
preview) to change them.

## Registered roles

<!-- virtuoso:begin-generated -->
| Role | Target | Provider | Authority | Mutability | Writers | State |
|------|--------|----------|-----------|------------|---------|-------|
| Holding bay (ad hoc storyboards and plans awaiting roadmap review) | `docs/planning/holding` | directory | reference | read-write | storyboard, write-plan, virtuoso, dispatch-closeout, roadmap-review | present |
| Governance documents (directory) | `docs/governance` | directory | reference | read-write | governance-sweep | present |
| Operational documents (directory) | `docs/governance` | directory | reference | read-write | governance-sweep | present |
| Temp (directory) | `.tmp` | directory | reference | read-write | — | present |
| Outside audits (directory) | `docs/studies/audit` | directory | evidence | append-only | 3rd-party-audit | present |
| Reference (directory) | `docs/governance` | directory | reference | read-write | governance-sweep | present |
| Roadmap / specification store | `ROADMAP.md` | markdown | live | read-write | roadmap-review, next-dispatch, mid-dispatch-decision, dispatch-closeout, governance-sweep | present |
| Lessons / retrospective | `docs/governance/LESSONS_LEARNED.md` | markdown | reference | append-only | dispatch-closeout, roadmap-review, mid-dispatch-decision | present |
| Workflow reference | `docs/governance/TECHNICAL_REFERENCE.md` | markdown | reference | read-write | governance-sweep | present |
| Close-outs (directory) | `docs/governance/close-outs` | directory | evidence | append-only | dispatch-closeout, virtuoso | present |
| Issues (directory) | `docs/governance/bug-reports` | directory | reference | read-write | mid-dispatch-decision, next-dispatch, dispatch-closeout, roadmap-review, governance-sweep | present |
| Roadmap reviews | `docs/planning/roadmap-reviews` | directory | report | read-write | roadmap-review, roadmap-status | present |
| Epics (directory) | `docs/planning/epics` | directory | reference | read-write | epic | present |
| Blurby Notion roadmap database (Blurby.Roadmap), live work register | `notion:database/3f87c96cc31e800580cfe019c89a56ca` | connector | live | read-write | roadmap-review, next-dispatch, mid-dispatch-decision, dispatch-closeout | external |
| Verified completion ledger | `docs/governance/terminal-ledger.jsonl` | jsonl | terminal | append-only | dispatch-closeout, roadmap-review | present |
| Retired XLSX migration source | `docs/governance/sprint-queue.xlsx` | xlsx | evidence | read-only | — | present |
| Timestamped Notion connector snapshot | `Virtuoso/work-register.snapshot.json` | snapshot | mirror | read-write | roadmap-review, next-dispatch, mid-dispatch-decision, dispatch-closeout | present |
| Preserved XLSX provider snapshot | `docs/planning/roadmap-reviews/2026-09-23-migration-source.json` | json | evidence | read-only | — | present |
| Project agent instructions | `CLAUDE.md` | markdown | reference | read-write | roadmap-review, governance-sweep | present |
| Roadmap board (generated page) | `roadmap-board.html` | none | report | generated | roadmap-review, dispatch-closeout, next-dispatch, governance-sweep | present |
| Roadmap board comments | `roadmap-board.comments.json` | json | reference | read-write | roadmap-review | registered, not present |
| Codex project instructions (companion) | `AGENTS.md` | markdown | reference | read-write | governance-sweep, roadmap-review | present |
| Documentation hub readme | `docs/readme.md` | markdown | reference | read-write | governance-sweep, roadmap-review | present |
| Planning hub readme | `docs/planning/readme.md` | markdown | reference | read-write | governance-sweep, roadmap-review | present |
| Findings (append-only) | `docs/governance/Findings.md` | markdown | reference | append-only | governance-sweep, adversarial-review, virtuoso, dispatch-closeout, roadmap-review, 3rd-party-audit | present |
| Change ledger — when each change took effect (append-only) | `docs/governance/Change.Ledger.jsonl` | jsonl | evidence | append-only | roadmap-review, dispatch-closeout, project-profile | present |
| Protected historical planningArchive | `docs/planning/.Archive` | directory | archive | append-only | dispatch-closeout, roadmap-review | present |
| Protected historical planArchive | `docs/planning/plans/.Archive` | directory | archive | append-only | dispatch-closeout, roadmap-review | present |
| Protected historical specArchive | `docs/planning/specs/.Archive` | directory | archive | append-only | dispatch-closeout, roadmap-review | present |
| Protected historical processedIssues | `docs/governance/bug-reports/.Archive` | directory | archive | append-only | dispatch-closeout, roadmap-review | present |

<!-- virtuoso-governance-registry
# Generated view of Virtuoso/workspace-layout.json — the manifest is the authority.
holdingBay: docs/planning/holding
governance: docs/governance
operational: docs/governance
temp: .tmp
outsideAudits: docs/studies/audit
reference: docs/governance
roadmap: ROADMAP.md
lessons: docs/governance/LESSONS_LEARNED.md
workflowReference: docs/governance/TECHNICAL_REFERENCE.md
closeOuts: docs/governance/close-outs
issues: docs/governance/bug-reports
roadmapReviews: docs/planning/roadmap-reviews
epics: docs/planning/epics
workRegister: notion:database/3f87c96cc31e800580cfe019c89a56ca
terminalLedger: docs/governance/terminal-ledger.jsonl
x-legacyWorkRegister: docs/governance/sprint-queue.xlsx
snapshot: Virtuoso/work-register.snapshot.json
x-migrationSource: docs/planning/roadmap-reviews/2026-09-23-migration-source.json
x-agentInstructions: CLAUDE.md
board: roadmap-board.html
boardComments: roadmap-board.comments.json
x-codexInstructions: AGENTS.md
x-docsReadme: docs/readme.md
x-planningReadme: docs/planning/readme.md
findings: docs/governance/Findings.md
changeLedger: docs/governance/Change.Ledger.jsonl
x-planningArchive: docs/planning/.Archive
x-planArchive: docs/planning/plans/.Archive
x-specArchive: docs/planning/specs/.Archive
x-processedIssues: docs/governance/bug-reports/.Archive
-->
<!-- virtuoso:end-generated -->

## Rules for skills

1. **Resolve every governance document through this registry** before reading or writing.
2. **Never create a new document for a role already registered** — open the registered
   target in place.
3. A registered target that is absent is *reported*, never replaced by a similarly named
   file the plugin went looking for.
4. **Authority is declared, not inferred.** A role is authoritative only when its
   `authority` says so.
5. Write only to a role whose `allowedWriters` names you, and never to an `archive`,
   `immutable`, `read-only`, or `unknown` role.
6. Project-defined roles and metadata live under the `x-` prefix and are preserved
   verbatim across plugin upgrades.

## Project extensions

<!-- Add your own roles, notes, and tables here. This section is never regenerated. -->
