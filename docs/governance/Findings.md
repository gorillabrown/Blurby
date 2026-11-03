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

### F-006 — disposition (dispatch-closeout, 2026-10-30)

**Disposition:** fixed — AGENT-PROTOCOL-CONSOLIDATION-1's close-out Step 0 wrote the seven workstreams with `policy-set` as roadmap-review (Change.Ledger CH-002), deleted `policy.roadmap.lanes`, and the preflight reads `ready` with no lanes warning. Evidence: docs/governance/close-outs/CloseOut.AGENT-PROTOCOL-CONSOLIDATION-1.2026-10-30.md.

### F-010 — Five quality-review wording items on the Step 0 text left unapplied (AGENT-PROTOCOL-CONSOLIDATION-1, 2026-10-30)

**Source:** AGENT-PROTOCOL-CONSOLIDATION-1 quality review (verdict READY), recorded in the staging memo's Review verdicts and carried by the close-out.

**Severity:** low

**Where:** CLAUDE.md and AGENTS.md (*Mandatory MarcusAurelius Pass* pointer line; *Agent Scope Labels* caption); Virtuoso/overlays/agents/MarcusAurelius.md (*Documents*); Virtuoso/overlays/skills/virtuoso/SKILL.md (*Commands*, *Git*)

**Finding:** The quality reviewer's not-applied items, all on spec-prescribed text: (1) the one-line MarcusAurelius pointer drops "after every sprint, hotfixes included, no exceptions", and *Document Lifecycle* has no LESSONS_LEARNED, BUG_REPORT or TECHNICAL_REFERENCE step; (2) the MarcusAurelius overlay's *Documents* line reads as if BUG_REPORT and TECHNICAL_REFERENCE were among the *Document Lifecycle* steps; (3) the SKILL overlay's *Commands* line should make `--arm64` primary, with `--x64` on RodneySr under standing rule 53's temporary-placement note; (4) its *Git* refspec `HEAD:refs/heads/eb/<name>` has no repository citation; (5) "Code scope labels (applied to doer agent tasks)" survives with "doer" undefined. The reviewer's suggested wording is in the merged staging memo (`git show 4a1b7aa5:docs/governance/close-outs/Memo.AGENT-PROTOCOL-CONSOLIDATION-1.GovernanceStaging.2026-10-30.md`, *Review verdicts*). Applying them at Step 0 would have moved the overlays off their memo blocks (Done-when C2), and a close-out never amends acceptance, so they were left as written.

**Accountable role / next action:** planner / roadmap-review; decide each item and apply the chosen wording as an ordinary governance edit

**Disposition:** open

### F-011 — Registry helper `timing` writes outside a dispatch's exact-path fence (AGENT-PROTOCOL-CONSOLIDATION-1, 2026-10-30)

**Source:** AGENT-PROTOCOL-CONSOLIDATION-1 dispatch and close-out worktrees, qualified helper root fcfa9295 (plugin version 1.16.1 code).

**Severity:** low

**Where:** docs/governance/close-outs/Timing.*.jsonl (other dispatches' closed logs); docs/governance/Change.Ledger.jsonl

**Finding:** `timing` calls in a worktree appended cost-backfill lines to other dispatches' closed time logs (24 logs in the dispatch worktree, 10 in the close-out worktree), and the first one a `plugin-version` Change.Ledger record under the calling actor. In the dispatch worktree that actor was `virtuoso`, which changeLedger's allowedWriters do not name; in the close-out worktree it was `dispatch-closeout`, which they do, so that record (CH-001) was committed with the close-out. Both are outside the dispatch's exact-path fence (D9) and the close-out's (C14). LL-172.

**Accountable role / next action:** planner / roadmap-review with Blurby.Brain1 (technical) — decide whether the backfill lines are committed in one maintenance change, and whether the helper should refuse the ledger write under a non-writer actor; the dispatch worktree's lines stay uncommitted until then

**Disposition:** open

### F-010 — partial disposition (roadmap-review, 2026-11-02)

Applied the permitted AGENTS.md/CLAUDE.md subset: mandatory documentation pass explicitly covers every sprint including hotfixes and the lessons/bug/technical-reference duties; scope caption now says implementation tasks. The three overlay wording changes remain open because the registered overlays role is read-only with no allowed writers. No ownership permission is inferred or registry policy changed. Planner owns the separately previewed ownership path; technical content goes to Blurby.Brain1. Evidence: `docs/planning/roadmap-reviews/2026-11-02-phase-brief.md`. This is partial resolution, not closure of F-010.

### F-011 — retained open (roadmap-review, 2026-11-02)

No timing command or historical-backfill mutation was performed. Preserve the 24/10 owning-worktree logs and uncommitted records. Planner with Blurby.Brain1 owns the bounded helper exact-path/actor-permission repair and the separate history disposition; mechanical U10 remains unperformed pending qualification. This review's LL-143 status append generated CH-005 under the permitted roadmap-review actor and is explicitly in its path fence; it is not a historical time-log backfill. See the readiness report and dispatch-buffer issue. F-009 likewise remains open with the existing CPU-profiling item; no budget was relaxed.

### F-009 — disposition (roadmap-review, 2026-11-03)

**Disposition:** fixed by a planned item. NARRATE-CPU-PROFILE-1 (Seq 95) carries it in block 2 of the 2026-11-03 plan. Under Blurby.Brain1's R-2026-11-02-CPU-1, its remaining Wave A (A3 + A4, one wave of 60 minutes or less on RodneySr) measures the x64 mainstream-class figures. No budget is relaxed before that evidence. Evidence: `docs/planning/roadmap-reviews/2026-11-03-plan.md`.

### F-010 — disposition (roadmap-review, 2026-11-03)

**Disposition:** accepted. The three remaining items are overlay wording. The registered overlays role is read-only with no allowed writers, and this review changes no registry permission. The substance already governs through CLAUDE.md's standing rules:
- the worktree-placement rule cites the `HEAD:refs/heads/eb/<name>` refspec with LL-181;
- rule 53 names arm64 as primary, with RodneySr x64 placement;
- the scope caption was fixed on 2026-11-02.

Overlays add facts only and never override the plugin. Evidence: `docs/planning/roadmap-reviews/2026-11-03-assessment.md`.

### F-011 — disposition (roadmap-review, 2026-11-03)

**Disposition:** accepted, as a lesson. LL-172 governs: no `timing` run inside a dispatch worktree, and no historical backfill committed. The 24 and 10 uncommitted backfill lines stay preserved in their owning worktrees. The helper's path-fence and actor-permission repair belongs upstream in the Virtuoso plugin. Blurby keeps no local patched copy (owner: follow the plugin to the letter). Evidence: `docs/planning/roadmap-reviews/2026-11-03-assessment.md`.


### F-012 — Windows arm64 package ships no native `@napi-rs/canvas` binary (RC merge, 2026-11-03)

**Source:** Blurby.Brain1 asar comparison during rule-53 package verification of the RC integration merge (`origin/main` `c5bb507f`, 2026-11-03).

**Severity:** medium (PDF reading on the arm64 install may run on the polyfill path; impact not yet measured)

**Where:** `package-lock.json` (`@napi-rs/canvas` platform packages: only `@napi-rs/canvas-win32-x64-msvc` 0.1.80 is locked); `main/pdf-text.js` (fallback that logs "@napi-rs/canvas not available, using polyfills")

**Finding:** The arm64 package carries no native `@napi-rs/canvas` binary, so PDF text extraction in the arm64 build falls back to polyfills. The gap predates the RC; the RC did not introduce it. Lane: Platform & Maintenance, against the Windows arm64 installer.

**Accountable role / next action:** planner with Blurby.Brain1 (technical) — read-only diagnosis before any fix spec: (a) whether a `win32-arm64` build of `@napi-rs/canvas` exists for the locked version line; (b) whether the polyfill path degrades extraction, tested with a synthetic PDF only. Until then, release gate (2) carries "PDF opens and reads on the arm64 install" (`docs/governance/SMOKE_CHECKLIST_STAGE8.md`, RC integration window additions).

**Disposition:** open

### F-013 — Flow, Focus and Narrate re-stamps don't check that their document is still current (BLOCK-TEXT-ORDER-1 TQ-B3, 2026-11-03)

**Source:** Blurby.Brain1 ruling TQ-B3 on BLOCK-TEXT-ORDER-1's contracts (`Brain1.held-items-TQ.2026-11-03.md`), confirmed by the planner on `origin/main` `c5bb507f`.

**Severity:** medium (a source-only race; no user report yet)

**Where:** `src/reader/modes/{flow,focus,narrate}/FoliateView.tsx`, the `restampVisibleSections` effect. Page's (`src/reader/modes/page/FoliateView.tsx:1104-1138`) has the three guards the others lack.

**Finding:** the other three modes' re-stamps don't wait for a section's in-progress wrap, don't register their own wrap, and check `cancelled` only after the loop. A word-list arrival during a yielding wrap can unwrap a section halfway through. Brain1 named Flow and Narrate. Focus's re-stamp has the same gaps, so the planner registered it too, pending Brain1's confirmation. The defect predates BLOCK-TEXT-ORDER-1 and is outside its fence.

**Accountable role / next action:** planner. Registered as FLOW-RESTAMP-CURRENT-1 (Seq 111), FOCUS-RESTAMP-CURRENT-1 (Seq 111.5) and NARRATE-RESTAMP-CURRENT-1 (Seq 112): reproduce first, then fix or close as not reachable. Specs are in `docs/planning/specs/2026-11-03/`.

**Disposition:** open; scheduled

### F-014 — Word re-extraction timing adds no paragraph pause today; moving it is a design change (BLOCK-TEXT-ORDER-1 TQ-D1, 2026-11-03)

**Source:** Blurby.Brain1 ruling TQ-D1 on BLOCK-TEXT-ORDER-1's contracts (`Brain1.held-items-TQ.2026-11-03.md`); owner answer OQ5 ("No pause"), 2026-11-03.

**Severity:** low

**Where:** each mode's `onWordsReextracted` handler; contracts §G-D (`docs/planning/roadmap-reviews/2026-11-03-block-text-order-contracts.md`)

**Finding:** BLOCK-TEXT-ORDER-1 leaves `onWordsReextracted` timing unchanged. Moving it would add paragraph pauses the owner would notice, so any change is a design question for the owner (OQ5b), not a technical fix.

**Accountable role / next action:** planner; raise with the owner only if a later item needs the timing to change.

**Disposition:** open; no item
