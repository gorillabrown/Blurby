# Governance Findings

Append-only findings; each disposition change is appended under its identifier. The registry declares authority and writers.

### F-001 — Held-state evidence reconciliation (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** medium

**Where:** docs/governance/Findings.md#f-001; live Notion In Flight records

**Finding:** Parent roadmap actor is applying64 source-backed Deliverable/Notes proposals. Seven unmerged branches retain explicit build/package evidence gaps; no branch presence proves a package verdict. Each needs the dated memo/test/package record or continued explicit unknown.

**Accountable role / next action:** planner / roadmap-review; apply verified metadata then resolve each evidence gap individually

**Disposition:** open

### F-002 — Lessons hygiene needs semantic review (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** medium

**Where:** docs/governance/LESSONS_LEARNED.md; artifact lessons-hygiene.json

**Finding:** Current helper proposes69 changes (2 duplicate groups,64 stale,2 incomplete,1 unrecorded). Same Applies-to text is not proof of duplicate content; age is not obsolescence. Existing2026-10-25/26 promotion decisions stand. No lesson original/status was modified.

**Accountable role / next action:** planner / roadmap-review; examine proposals individually with close-out use and false-positive controls

**Disposition:** open

### F-003 — Legacy close-out template links lack a verified replacement (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** low

**Where:** .claude/skills/phase-closeout/SKILL.md; .agents/skills/phase-closeout/SKILL.md

**Finding:** Both legacy copies are preserved. Their external template references cannot be replaced by guessing or by copying a similarly named template; obtain the canonical source and test links first.

**Accountable role / next action:** planner / owner; identify canonical template source or explicitly retain as historical

**Disposition:** open

### F-004 — Physical roadmap order differs from authoritative Seq (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** low

**Where:** ROADMAP.md active sections; board source coverage model

**Finding:** Source identity/terminal coverage is reconciled. The one remaining parser warning compares historical physical section/card order with live FIFO Seq. No live Seq was changed to satisfy a presentation parser. A format/parser migration must preserve grouping, anchors and actual priority.

**Accountable role / next action:** planner; separately scope parser/order representation migration and test on actual source

**Disposition:** open

### F-005 — Uncovered classifications and local infrastructure remain preservation items (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** low

**Where:** Virtuoso/workspace-layout.json; .agents/; .codex/; local runtime/recovery assets

**Finding:** Companion/readme roles and historical archive protection are now registered. Other unknown/orphan classifications were not automatically promoted, moved or deleted. Legacy skills, recovery backups, patches, runtime assets and unique worktrees remain untouched.

**Accountable role / next action:** planner / governance-sweep; classify remaining groups from inventory before proposing any move

**Disposition:** open

### F-006 — Structured workstream migration remains deferred (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** low

**Where:** Virtuoso/workspace-layout.json policy.roadmap.lanes

**Finding:** The six product lanes remain in the usable legacy key. Renaming to structured workstreams changes representation and requires its own reviewed migration; do not silently migrate under this cleanup.

**Accountable role / next action:** planner / roadmap-review; preview and approve a structured migration separately

**Disposition:** open

### F-007 — Verification exclusions for documented runtime commands and binaries (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** low

**Where:** docs/governance/TECHNICAL_REFERENCE.md; docs/governance/DEVELOPMENT_SYNC.md; sweep report

**Finding:** This documentation-only sweep verified source paths and tool invocations it actually ran. It did not run app tests/builds, execute every historical prose command, render external PDF/XLSX references, exercise cloud auth or validate a production package. No excluded adapter is reported passed.

**Accountable role / next action:** designated verifier; run the applicable adapter only in its admitted execution scope

**Disposition:** open

### F-008 — Footprint candidates require ownership rather than automatic deletion (governance-sweep, 2026-10-26)

**Source:** GOV-SWEEP-FOLLOWTHROUGH-1; approved16-action sweep, current source baseline d8a65cb4.

**Severity:** medium

**Where:** artifact footprint.json; .worktrees/rc-36ac7466; .tmp/footprint-extract

**Finding:** The footprint tool calls some checkout/output regenerable or redundant, but release-candidate evidence and unique/in-flight branches are preservation items. No footprint removal/extraction or backup retention deletion was performed.

**Accountable role / next action:** owner / repository operator; decide maintenance later after evidence custody and recoverability checks

**Disposition:** open

### F-001 — metadata application outcome (2026-10-26)

**Source:** Parent roadmap actor confirmed64 durable mutation plans after full live readback; snapshot 2026-10-26T20:43:19Z. Original Notes prefixes and all factual identities/dates/states were preserved; Notion inline Markdown presentation was normalized explicitly.

**Disposition:** open — all64 metadata descriptions applied without Status/Seq changes; the seven named build/package evidence gaps remain owned follow-ups rather than presumed completed delivery.

### F-001 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted — the seven build/package evidence gaps stay owned by each item's own standing rule 53 verification, now run on RodneySr (temporary placement, 2026-10-30), and are never presumed delivered. Recorded in docs/planning/roadmap-reviews/2026-10-30-assessment.md.

### F-002 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted, deferred — no semantic deduplication of lessons without a reviewed pass; revisit at the next review that has close-outs to read.

### F-003 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted — both legacy close-out copies stay preserved; no canonical template replacement is guessed.

### F-004 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted — the live register Seq is authoritative; physical roadmap card order is presentation only.

### F-005 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted — uncovered classifications and local infrastructure remain preservation items, never deleted automatically.

### F-006 — disposition (roadmap-review, 2026-10-30)

**Disposition:** fixed by a planned item — the reviewed policy.roadmap.lanes to workstreams rename is folded into AGENT-PROTOCOL-CONSOLIDATION-1's scope (owner-approved at the 2026-10-30 Phase B checkpoint).

### F-007 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted — the documentation-only sweep never claimed runtime verification.

### F-008 — disposition (roadmap-review, 2026-10-30)

**Disposition:** accepted — matches CLAUDE.md rule 10: no workspace or footprint deletion without an explicit request.

### F-009 — Narrate D6 exceeds its budgets on the x64 mainstream class (roadmap-review, 2026-10-30)

**Source:** Blurby.Brain1, 2026-10-30, from NARRATE-QUIT-LINGER-1 (b)'s D6 run on RodneySr (x64, i7-1185G7; foreign CPU 13.7–23.5 %, trials counted). Data: RodneySr C:\Projects\Blurby-artifacts\narrate-quit-linger-1\d6-after-x64\.

**Severity:** medium

**Where:** Narrate D6 latency budgets (Decision #22, NARRATE-REBUILD-1 charter; docs/planning/epics/2026-10-12-narrate-rebuild/)

**Finding:** D6 exits 1 on two figures: 1.0x click 2,051 ms and speed change 2,406 ms. Warm resume passes (94/93 ms). Not caused by quit-linger (b), which touches only main/quit-sequence.js. The budgets were set on the owner's ARM64 machine; whether they hold for the x64 mainstream class is unmeasured.

**Accountable role / next action:** planner with Blurby.Brain1 (technical authority) — decide whether the mainstream-class budgets need their own figures or whether this is a defect; NARRATE-CPU-PROFILE-1 (Seq 95) is the existing measurement item to carry it.

**Disposition:** open
