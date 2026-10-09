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
| Roadmap / specification store | `ROADMAP.md` | markdown | live | read-write | roadmap-review, next-pointer, mid-dispatch-decision, pointer-closeout | present |
| Blurby monday.com live work register | `monday:board/18432450217` | connector | live | read-write | roadmap-review, next-pointer, mid-dispatch-decision, pointer-closeout | external |
| Verified completion ledger | `docs/governance/terminal-ledger.jsonl` | jsonl | terminal | append-only | pointer-closeout, roadmap-review | present |
| Lessons / retrospective | `docs/governance/LESSONS_LEARNED.md` | markdown | reference | append-only | pointer-closeout, roadmap-review, mid-dispatch-decision | present |
| Close-outs (directory) | `docs/governance/close-outs` | directory | evidence | append-only | pointer-closeout | present |
| Issues (directory) | `docs/governance/bug-reports` | directory | reference | read-write | mid-dispatch-decision, next-pointer, pointer-closeout, roadmap-review | present |
| Roadmap reviews | `docs/planning/roadmap-reviews` | directory | report | read-write | roadmap-review, roadmap-status | present |
| Outside audits (directory) | `docs/studies/audit` | directory | evidence | append-only | 3rd-party-audit | present |
| Reference (directory) | `docs/governance` | directory | reference | read-write | — | present |
| Governance documents (directory) | `docs/governance` | directory | reference | read-write | — | present |
| Operational documents (directory) | `docs/governance` | directory | reference | read-write | — | present |
| Temp (directory) | `docs/planning` | directory | reference | read-write | — | present |
| Workflow reference | `docs/governance/TECHNICAL_REFERENCE.md` | markdown | reference | read-write | — | present |
| Retired XLSX migration source | `docs/governance/sprint-queue.xlsx` | xlsx | evidence | read-only | — | present |
| Timestamped monday.com connector snapshot | `Virtuoso/work-register.snapshot.json` | snapshot | mirror | read-write | roadmap-review, next-pointer, mid-dispatch-decision, pointer-closeout | present |
| Preserved XLSX provider snapshot | `docs/planning/roadmap-reviews/2026-09-23-migration-source.json` | json | evidence | read-only | — | present |
| Project agent instructions | `CLAUDE.md` | markdown | reference | read-write | roadmap-review | present |

<!-- virtuoso-governance-registry
# Generated view of Virtuoso/workspace-layout.json — the manifest is the authority.
roadmap: ROADMAP.md
workRegister: monday:board/18432450217
terminalLedger: docs/governance/terminal-ledger.jsonl
lessons: docs/governance/LESSONS_LEARNED.md
closeOuts: docs/governance/close-outs
issues: docs/governance/bug-reports
roadmapReviews: docs/planning/roadmap-reviews
outsideAudits: docs/studies/audit
reference: docs/governance
governance: docs/governance
operational: docs/governance
temp: docs/planning
workflowReference: docs/governance/TECHNICAL_REFERENCE.md
x-legacyWorkRegister: docs/governance/sprint-queue.xlsx
snapshot: Virtuoso/work-register.snapshot.json
x-migrationSource: docs/planning/roadmap-reviews/2026-09-23-migration-source.json
x-agentInstructions: CLAUDE.md
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
