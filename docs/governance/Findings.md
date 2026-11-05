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

### F-015 — A Narrate click before the section map arrives is clamped to an earlier word (NARRATE-ARRIVAL-SYNC-1 sp6, 2026-11-03)

**Source:** Blurby.Brain1, NARRATE-ARRIVAL-SYNC-1 amendment 2 (`Brain1.NARRATE-ARRIVAL-SYNC-1.2026-11-03.md`), from RodneySr's row sp6.

**Severity:** low (a unit-row observation; not yet seen in a packaged run)

**Where:** `src/reader/modes/narrate/ModeRuntime.ts`, the click path while `bookWords` has no section map yet

**Finding:** in sp6 (arrival with the map pending, then Play, then a click before the map arrives), the clicked word 15 was clamped to 9. The start still honours the clicked anchor's sentence as ruled, but the clamp means a pre-map click can resolve to a different word than the one clicked.

**Accountable role / next action:** planner. Read NARRATE-ARRIVAL-SYNC-1's memo for the clamp's source line once it is pushed. Then either specify a Reader Engine item or close the finding as the intended sentence-start rule.

**Disposition:** open

### F-016 — Flow and Narrate save nothing while the cursor stays on one page during playback (CFI-POSITION-CONSISTENCY-1 investigation, 2026-11-03)

**Source:** CFI-POSITION-CONSISTENCY-1 specification investigation at `origin/main` `c5bb507f`, on Blurby.Brain1's request (O4, Focus "save as you go").

**Severity:** low to medium (a quit or crash mid-page loses the words read on that page)

**Where:** Flow's relocate-driven save (`src/reader/modes/flow/ModeRuntime.ts:1078`, 2 s debounce; word advances commit without saving at `:1316`; save guards `:1054-1069`); Narrate's (`src/reader/modes/narrate/ModeRuntime.ts:528`; advances `:709`; guards `:519-520`)

**Finding:** both modes persist progress during playback only when the page moves (a relocate), and then only past their resume-anchor, engagement and browsing checks. Focus had the same gap; the owner ruled "Save as you go" (O4) for Focus only, which CFI-POSITION-CONSISTENCY-1 Wave C restores. Flow and Narrate were deliberately left out of that item.

**Accountable role / next action:** planner. The owner ruled O5 (2026-11-03): Flow and Narrate also save as they go. Registered as FLOW-SAVE-AS-YOU-GO-1 (Seq 97.6) and NARRATE-SAVE-AS-YOU-GO-1 (Seq 97.7), one mode-local item per mode after CFI-POSITION-CONSISTENCY-1.

**Disposition:** open; scheduled

### F-017 — The Focus word-delta save constant has no user (CFI-POSITION-CONSISTENCY-1 investigation, 2026-11-03)

**Source:** CFI-POSITION-CONSISTENCY-1 question B14, at `origin/main` `c5bb507f`.

**Severity:** low (dead configuration)

**Where:** `src/constants.ts:170`, `RSVP_PROGRESS_SAVE_WORD_DELTA = 50`

**Finding:** nothing reads the constant since `3dd4b504` dropped Focus's periodic save. CFI-POSITION-CONSISTENCY-1 Wave C restores a time-only save (`RSVP_PROGRESS_SAVE_INTERVAL_MS`), so the word delta stays unused. It is left in place there rather than removed as a drive-by edit.

**Accountable role / next action:** planner. Remove it in the next item that edits the Progress Tracking block of `src/constants.ts`, after CFI-POSITION-CONSISTENCY-1 merges.

**Disposition:** open; no item

### F-018 — Each progress save rewrites the whole sync queue (CFI-POSITION-CONSISTENCY-1 investigation, 2026-11-03)

**Source:** CFI-POSITION-CONSISTENCY-1 question B18, at `origin/main` `c5bb507f`.

**Severity:** low today (sync is off); medium once sync is on

**Where:** `main/sync-queue.js:53-56` (`saveQueue`) and `:169-182` (enqueue)

**Finding:** every save that carries a position enqueues `update-progress`, and `saveQueue` rewrites all of `sync-queue.json` with no debounce. Focus's restored 5 s save makes that 12 rewrites a minute while Focus plays, and the queue keeps every entry rather than the newest per document.

**Accountable role / next action:** planner. BLURBY-SERVER-1's specification coalesces `update-progress` per document (newest wins) before sync is on for anyone.

**Disposition:** open; input to BLURBY-SERVER-1

### F-019 — A mode switch during the open hold carries a stale stored cfi into Focus or Flow (CFI-POSITION-CONSISTENCY-1 B11, 2026-11-03)

**Source:** Blurby.Brain1 ruling B11 on CFI-POSITION-CONSISTENCY-1 (2026-11-03).

**Severity:** low (affects only position pairs stored before CFI-POSITION-CONSISTENCY-1 Wave A)

**Where:** the Page-only open hold (CFI-POSITION-CONSISTENCY-1 Wave B); Focus and Flow mode handover

**Finding:** a mode switch during the open hold ends the hold with today's fallback. The receiving mode's handover can carry a stored cfi from the wrong section. Narrate's arrival sync corrects the section; Focus and Flow do not. After Wave A no new stale pairs are written.

**Accountable role / next action:** planner. Re-check after CFI-POSITION-CONSISTENCY-1 merges; open an item only if an owner smoke or bug report shows a stale pair surviving.

**Disposition:** open; no item

### F-020 — The standalone reader window saves a position with no cfi from its own numbering (CFI-POSITION-CONSISTENCY-1 B6, 2026-11-03)

**Source:** CFI-POSITION-CONSISTENCY-1 question B6, adopted by Blurby.Brain1 (2026-11-03).

**Severity:** low to medium

**Where:** `src/App.tsx:76`, `src/hooks/useReader.ts:180` (at `c5bb507f`)

**Finding:** the standalone reader window saves a word position from tokenized text whose numbering may not match the EPUB's word numbering, and it sends no cfi. It is outside CFI-POSITION-CONSISTENCY-1.

**Accountable role / next action:** planner. Input to WORD-INDEX-UNIFY-1, which owns one word numbering in every runtime.

**Disposition:** open; input to WORD-INDEX-UNIFY-1

### F-021 — Narrate Play without the word map starts at the first visible word, not the sentence start (CFI-POSITION-CONSISTENCY-1 B13, 2026-11-03)

**Source:** CFI-POSITION-CONSISTENCY-1 question B13, adopted by Blurby.Brain1 (2026-11-03); owner ruling O3.

**Severity:** low

**Where:** `src/reader/modes/narrate/ModeRuntime.ts:316-320` (at `c5bb507f`)

**Finding:** after an open hold that failed or timed out, or a mode switch during the hold, Narrate's Play has no word map and starts at the first visible word instead of the saved word's sentence start (O3). A BUG-239 book has no sentence data at all.

**Accountable role / next action:** planner. Input to WORD-INDEX-UNIFY-1, which owns how a missing map is handled.

**Disposition:** open; input to WORD-INDEX-UNIFY-1

### F-022 — Focus's relocate save can land after a newer pause save (CFI-POSITION-CONSISTENCY-1 C1–C3 fold-in, 2026-11-03)

**Source:** Blurby.Brain1 ruling Q2 for Flow and Narrate (2026-11-03); the planner checked Focus while folding it into CFI-POSITION-CONSISTENCY-1.

**Severity:** low

**Where:** `src/reader/modes/focus/ModeRuntime.ts:903` (relocate save, at `14ce3d24`)

**Finding:** Focus also schedules a relocate save, delayed 2 s by the shell. A pending one could overwrite a newer pause save, the race Q2 fixes for Flow and Narrate. Focus's view does not move while it plays, so the exposure is narrow, and CFI-POSITION-CONSISTENCY-1 leaves Focus unchanged here.

**Accountable role / next action:** planner. Re-check after CFI-POSITION-CONSISTENCY-1 merges; specify a Q2-style re-save for Focus only if a probe shows the overwrite.

**Disposition:** open; no item

### F-023 — Escape from Focus, Flow or Narrate hands Page the entry word, so the close saves where you started (CFI-POSITION-CONSISTENCY-1 STOP-CLOSE, 2026-11-03)

**Source:** STOP-CLOSE, found while specifying the save-as-you-go items. Blurby.Brain1 ruled option (A); owner ruling O6, "Where I stopped" (2026-11-03).

**Severity:** medium. The reader's place is lost on every Escape exit after reading in a playback mode.

**Where:** at `14ce3d24`:
- playback commits with `publishState: false` (`focus/ModeRuntime.ts:1053-1058`, `flow/ModeRuntime.ts:1316-1321`, `narrate/ModeRuntime.ts:732`);
- `exitToPage` with capture "persistent" (`src/reader/useReaderModeOrchestrator.ts:354-357`);
- `exportHandoff("persistent")` (`focus/ModeRuntime.ts:663-680`);
- the close save (`src/hooks/useProgressTracker.ts:243-259`).

**Finding:** playback never moves `publishedWordIndex`. The Escape exit hands Page that entry word, and the second Escape's close writes it back over anything saved during play. Space (pause-to-page) already hands over the playback word, so the two exits disagree.

**Accountable role / next action:** planner. CFI-POSITION-CONSISTENCY-1 Wave C fixes it: each mode's `exportHandoff("persistent")` reports its committed playback word, one mode-local commit per runtime. FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1 build on it. Owner smoke for gate (2): read in Focus, press Escape twice, reopen, and check it opens at the last word read.

**Disposition:** open; scheduled (CFI-POSITION-CONSISTENCY-1 Wave C)

### F-024 — A Narrate passage that fails while the window is hidden hands over a stale word (NARRATE-SAVE-AS-YOU-GO-1 fold-in, 2026-11-03)

**Source:** planner, folding Blurby.Brain1's STOP-CLOSE ruling into NARRATE-SAVE-AS-YOU-GO-1 (2026-11-03).

**Severity:** low

**Where:** `src/reader/modes/narrate/ModeRuntime.ts` (`onEngineState` failure path; the persistent export at `:422`, at `14ce3d24`)

**Finding:** while hidden, the cursor is published only on animation frames, which a hidden window doesn't get. The timed saves read the sample, but the committed cursor word lags. If a passage fails while hidden, the hand-off and the close carry that last painted word, behind the timed saves.

**Accountable role / next action:** planner. Re-check after NARRATE-SAVE-AS-YOU-GO-1 merges; specify a fix only if a probe shows the close landing behind the last timed save.

**Disposition:** open; no item

### F-025 — Flow and Focus paragraph starts in an unverified section come from span indices (UNCERTIFIED-ANCHOR-HOLD-1 Q3, 2026-11-03)

**Source:** UNCERTIFIED-ANCHOR-HOLD-1 question Q3, ruled a finding by Blurby.Brain1 (2026-11-03).

**Severity:** low (rare sections; nothing worse than today)

**Where:** at `14ce3d24`:
- Flow `FoliateView.tsx:1225` and Focus `FoliateView.tsx:1115` (paragraph starts);
- `flow/ModeRuntime.ts:1012-1035` (paragraph keys);
- Flow `:1003` and Focus `:824` (paragraph pauses).

**Finding:** paragraph starts are read from book-stamped documents' spans. Under BLOCK-TEXT-ORDER-1, a held (uncertified) document stays book-stamped, so span-derived indices can drive the paragraph keys and pauses there. Excluding held documents would remove that section's paragraph pauses, which the owner would notice.

**Root cause (rule 6c):** the two independent word numberings, which BLOCK-TEXT-ORDER-1, WORD-INDEX-UNIFY-1 and XHTML-PARSE-MEASURE-1 address.

**Accountable role / next action:** planner. Input to WORD-INDEX-UNIFY-1. Re-check after XHTML-PARSE-MEASURE-1 reports how often sections stay uncertified.

**Disposition:** open; input to WORD-INDEX-UNIFY-1

### F-026 — Page paints the handed-over highlight by span index in an unverified section (CFI-POSITION-CONSISTENCY-1 STOP-LAND-focus condition, 2026-11-04)

**Source:** Blurby.Brain1's reply on CPC-1 Wave C's landing gate (`Brain1.ESCAPE-LANDS-AT-PLAYBACK-1.2026-11-03.md`, "Planner applications", 2026-11-04), ruled pre-existing and out of Wave C's scope.

**Severity:** low (rare sections; the same as today)

**Where:** `paintArrivalCursor` (`page/ModeRuntime.ts:547-552` at `14ce3d24`) calls the view's `highlightWordByIndex`, which finds the span by its `data-word-index` (`applyVisualHighlightByIndex` and `resolveWordState`, `page/FoliateView.tsx`). BLOCK-TEXT-ORDER-1 (tip `d3184d0b`) holds an uncertified document's clicks and turns (`uncertifiedDocsRef`, `page/FoliateView.tsx:320`), but not this paint.

**Finding:** arriving in Page from another mode, in a section held as uncertified, the highlight can be painted on whichever span carries the handed-over index, which may be a different word. CPC-1 Wave C step 7 holds its new landing jump there (Brain1's condition), so the view stays on the handed cfi's page; the paint itself is unchanged.

**Root cause (rule 6c):** the two independent word numberings (main's extractor vs the renderer's spans), which BLOCK-TEXT-ORDER-1, WORD-INDEX-UNIFY-1 and XHTML-PARSE-MEASURE-1 address.

**Accountable role / next action:** planner. Input to UNCERTIFIED-ANCHOR-HOLD-1, alongside F-025.

**Disposition:** open; input to UNCERTIFIED-ANCHOR-HOLD-1

### F-027 — `main/library-write.js` has its own uncapped error-log writer that bypasses the 10 MB cap (ERROR-LOG-CAP-1 close-out check, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (group 1, against `origin/main` `14ce3d24`), ERROR-LOG-CAP-1 Done-when 4.

**Severity:** high (in-scope regression of the integrated tree; narrow and rare in practice, but it defeats the item's stated purpose, "error.log stops growing without bound")

**Where:** `main/library-write.js:8-13` (a private `logToFile` whose line 12 is `await fsPromises.appendFile(errorLogPath, ...)`). `git grep -n "appendFile(errorLogPath" -- main` prints `main/error-log.js:18` and `main/library-write.js:12`, where ERROR-LOG-CAP-1's Done-when 4 requires only `main/error-log.js`.

**Finding:** LIBRARY-WRITE-RACE-1 added `main/library-write.js` with its own appender. ERROR-LOG-CAP-1 was built before that file existed, so its branch-local Done-when 4 was green. The RC window's ruling R2 and its single-copy check (`git grep -n "async function logToFile" -- main/ipc`) searched only `main/ipc`, so the integration did not catch it. Effect: the log lines from `library-write.js` (a failed unlink of an orphaned converted file) skip the 10 MB cap and rotation. No other appender writes `error.log` (`main/sync-engine.js:463` writes the reconcile log, `main/ipc/reader.js:64` writes highlights).

**Root cause (rule 6c):** the single-copy check was scoped to the directory that held the known copies, not to `main`, so a copy added by a later-merged branch was outside it.

**Accountable role / next action:** Blurby.Brain1 rules; RodneySr builds. Fix: in `main/library-write.js` replace the local `logToFile` with `const { logToFile } = require("./error-log");` (the helper keeps the two-argument signature), then re-run Done-when 4 over all of `main` and add a standing grep for any later appender. Needs a build, so it waits for the halt to lift.

**Disposition:** resolved 2026-11-05. The fix and its guard test merged as `c630f9a4`, and ERROR-LOG-CAP-1 re-verified on that commit and closed (`CloseOut.ERROR-LOG-CAP-1.2026-11-05.md`).

### F-028 — PAGE-SAVE-RESTAMP-3 Wave B was never built (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (group 6, against `origin/main` `14ce3d24`).

**Severity:** low (a rare edge case: a link that never lands still drops the held page turn; not a release gate)

**Where:** `src/reader/modes/page/FoliateView.tsx:810-816`: `goToLanding` starts with `pendingTurnRef.current = null; // PAGE-SAVE-RESTAMP-2: a jump cancels a held turn`, and the `link` listener calls it at once. `git grep 'lc1\|lc2' origin/main -- tests` finds no `(lc1)` or `(lc2)` test.

**Finding:** the branch `eb/page-save-restamp-3` (`c3510303`) carries Wave A only. After the 2026-10-25 re-scope the item ends at Wave B (B1: remove the `link` listener's cancel so a jump that never lands leaves the held turn; tests lc1, lc2; a rule 50 update of the (y) "internal link" row). JUMP-LANDING-SAVE-1 moved the cancel from the `link` event into `goToLanding` but did not remove it; its memo says Wave B "follows this item". No ruling was found that drops, splits or closes Wave B. The item stays open.

**Accountable role / next action:** planner with Blurby.Brain1: build Wave B, split it into its own register item, or drop it with a ruling. A-6's owner smoke is also absent from the gate (2) list (added in `SMOKE_CHECKLIST_STAGE8.md` at this close-out).

**Disposition:** resolved 2026-11-05 (`Brain1.post-halt-rulings.2026-11-05.md` 1b). Split: PAGE-SAVE-RESTAMP-3 closes on Wave A once its A-6 owner smoke passes at gate (2); Wave B is PAGE-LINK-HELD-TURN-1, with a corrected design.

### F-029 — BLOCK-TAG-CASE-1 Done-when 7 has no performance evidence (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (group 5), BLOCK-TAG-CASE-1 Done-when 7.

**Severity:** low (paperwork and an unevidenced row; no code defect found)

**Where:** `docs/governance/close-outs/Memo.BLOCK-TAG-CASE-1.GovernanceStaging.2026-10-23.md`; the Wave B `npm run perf` row.

**Finding:** the row asks that no `npm run perf` benchmark is worse than the baseline by more than 10%. No perf output exists in the BLOCK-TAG-CASE-1 or FLOW-PARA-PAUSE-INDEX-1 memos or in the artifact folders, and gate (1) run 6's record is not in the repo (see F-035). Done-when 8's bug entry was missing and is now BUG-241 (status: fixed in source, close-out pending this row). The item stays open.

**Accountable role / next action:** Blurby.Brain1: an `npm run perf` run on RodneySr or a written waiver. The item's close-out then moves BUG-241 to resolved.

**Disposition:** resolved 2026-11-05 (the performance row only; the item stays open, see F-037). Ruled the same day (`Brain1.post-halt-rulings.2026-11-05.md` 1d): no waiver, and RodneySr ran a same-host A/B on `f4becc3c^1` and `f4becc3c`, three runs each. Blurby.Brain1 ruled it passed (`Brain1.rodneysr-dispatch-status.2026-11-05.md`): no benchmark in B is more than 10% worse than A in either order. The worst reverse-order row is `tokenizeWithMeta_50k` at +8.3%, inside its spread. The rows covering changed code favour B in both orders, and that is not a claimed speed-up. **Limit:** the runs are about 5 s with sub-millisecond timings, so the suite can't resolve 10% on most rows, and no benchmark covers the tag-case check. The row means no regression was seen, not a measured cost. Evidence: RodneySr `C:\Projects\Blurby-artifacts\perf-block-tag-case-1\` and `rev\`. Done-when 8 is BUG-241.

### F-030 — Issue files for LIBRARY-COMPLETION-VISIBILITY-1 and RELEASE-RUNBOOK-1 have no `## Decision` block (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (groups 5 and 7).

**Severity:** low (paperwork; the close-out process stops on an open issue without a Decision)

**Where:** `docs/governance/bug-reports/Issue.LIBRARY-COMPLETION-VISIBILITY-1.2026-10-26.md` (has "Decision history", "Combined verification update" and "BUG-222 technical disposition - 2026-10-26", and no entry for the 2026-10-30 pass; says it stays open "until its named gates pass and Brain confirms") and `docs/governance/bug-reports/Issue.RELEASE-RUNBOOK-1.2026-10-22.md` (ends with a bolded "Acceptance" paragraph; Brain's reply "had not arrived when this record was committed").

**Finding:** both items' code and mechanical rows pass, but neither issue file records a decision. They cannot close until Blurby.Brain1 appends one.

**Accountable role / next action:** Blurby.Brain1 (decision blocks); then planner closes the items. RELEASE-RUNBOOK-1 also waits for gate (2) and one run of the runbook on the final build.

**Disposition:** resolved 2026-11-05 (`Brain1.post-halt-rulings.2026-11-05.md` 1e). Both issue files carry Blurby.Brain1's `## Decision` block. LIBRARY-COMPLETION-VISIBILITY-1 waits on gate (2) row (iii); RELEASE-RUNBOOK-1 waits on gate (2) and one runbook run.

### F-031 — PAGE-SAVE-RESTAMP-2 and PAGE-SAVE-RESTAMP-GUARD-1 count gates were changed by later authorized work (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (group 9), against `origin/main` `14ce3d24`.

**Severity:** low (no behaviour test fails; the gates fail as written)

**Where:** `src/reader/modes/page/FoliateView.tsx`. PAGE-SAVE-RESTAMP-2: DW3 `a jump cancels a held turn` prints 5, spec 6 (dropped by JUMP-LANDING-SAVE-1 `d031cc89`); DW6a `rendererNumberedDocsRef` prints 10, amended 8 (PAGE-SAVE-RESTAMP-3 A1, `5755124b`); DW6b `"page-turn-lost"` prints 4, spec 1 (`c33692da`, then `5755124b`). PAGE-SAVE-RESTAMP-GUARD-1: `rendererNumberedDocsRef` prints 10, spec 5; `reason=book-words` prints 3, spec 1.

**Finding:** each later change was authorized, so these are superseded counts, not regressions. A count amendment cannot be made during a close-out. It goes through the owner and an independent review. Two further needs: a trace that the jump-cancel dropped at `d031cc89` is still done (PAGE-SAVE-RESTAMP-2's D6 says every jump cancels a held turn; F-028 is related), and Blurby.Brain1's recorded acceptance of GUARD-1's fix-round Deviation 3 (`5b0713fe`; the memo says merging needs it and no acceptance is recorded). Both items' owner checks (#8, #9) are on the gate (2) list.

**Accountable role / next action:** planner with the owner and an independent reviewer: amendment restating these gates against a named sha; Blurby.Brain1: the trace and the Deviation 3 acceptance. Re-grep both counts after CFI-POSITION-CONSISTENCY-1.

**Disposition:** open; the two Brain1 needs are answered (`Brain1.post-halt-rulings.2026-11-05.md`): the trace holds on `14ce3d24` and GUARD-1's deviation 3 is accepted. The count amendment stays with the planner, the owner and an independent reviewer.

### F-032 — DEPS-AUDIT-1 Done-when 4 and 5 fail if re-run today (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (group 7): a scratch `npm audit` over the `origin/main` lockfile.

**Severity:** medium (one production advisory is fixable; the Done-when rows are point-in-time by nature)

**Where:** `package-lock.json`; `docs/governance/DEPENDENCY_ADVISORIES.md`; the DEPS-AUDIT-1 memo (merge-time result: `fixable=0`, five names).

**Finding:** `npm audit --omit=dev` now exits 1 with `fixable=1` (a new `undici` advisory, 7.30.0 under cheerio; the package is an accepted row in the advisories document, so the advisory text changed after it). The all-dependency audit reports critical 0, high 8, moderate 13, `fixable=3`, adding `follow-redirects` (already bumped to 1.16.1 by CI-AUDIT-ALLOWLIST-1) and `joi`. The cause is advisory-database drift after the merge, not a change in the item. The advisories document still lists Electron 41.10.7 and dates its audit 2026-10-14. The item's Q3 ruling also needs the D3 and D6 re-run on final main, which gate (1) run 6 did not judge. The item stays open.

**Accountable role / next action:** Blurby.Brain1 rules whether Done-when 4 and 5 are merge-time (point-in-time) checks; planner files a dependency-refresh item for `undici`, `follow-redirects` and `joi` or Brain runs the non-major fix; the advisories document is re-dated at that refresh.

**Disposition:** resolved 2026-11-05 (`Brain1.post-halt-rulings.2026-11-05.md` 1c). Done-when 4 and 5 are merge-time checks. The drift moves to DEPS-REFRESH-1 (scoped update) and BUILD-CHAIN-REFRESH-1 (after the release); DEPS-AUDIT-1 stays open for its Q3.

### F-033 — The 4.25:1 light-theme link accent is tracked nowhere, and BOOK-TEXT-COLOUR-1's contrast script is outside the repo (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (group 10), BOOK-TEXT-COLOUR-1's memo finding for Blurby.Roadmap.

**Severity:** low (a design call at tier 3; BUG-208's fix itself passes 8 of 8)

**Where:** the light-theme link accent `#8B6F47` on `rgb(245,243,239)` measures 4.25:1, below 4.5:1, on both the base and the fix (`C:\Projects\Blurby-artifacts\book-text-colour-1\contrast.mjs`, `contrast-base3.json`, `contrast-fix2.json`).

**Finding:** the finding appears only in the memo (a search of `ROADMAP.md`, `docs/governance`, the roadmap reviews, the specs and the register snapshot finds nothing else). The contrast script, which is the item's Done-when 1 instrument, lives only in the artifacts folder on this machine, and no time log was kept. The item stays open: the owner's BUG-208 re-check is also owed.

**Accountable role / next action:** planner and owner: decide whether to change the light-theme accent; move the contrast script into the repo (or archive a copy); add the time log. Owner BUG-208 re-check is on the gate (2) list.

**Disposition:** open

### F-034 — RESTAMP-RERUN-RACE-1's fold-in 2 (FIXED-LAYOUT-RESTAMP-1) is filed nowhere (close-out review, 2026-11-04)

**Source:** `docs/governance/close-outs/Memo.RESTAMP-RERUN-RACE-1.GovernanceStaging.2026-10-23.md`, Fold-in 2; the evidence check for the 2026-11-04 close-out review (group 6).

**Severity:** low (unmeasured; not a release gate)

**Where:** foliate's fixed-layout renderer returns every iframe from `getContents()` with no `index` (`fixed-layout.js:308-312`); Page's re-stamp and the load then take the loaded-slice start for `undefined`, which is 0.

**Finding:** the memo's proposed stub, FIXED-LAYOUT-RESTAMP-1, "Page re-stamp numbers every fixed-layout page from 0" (Reader Engine lane), was never added to ROADMAP, Findings or IDEAS. For a pre-paginated book, both pages of a spread could carry overlapping `data-word-index` values. Unmeasured: measure first with a pre-paginated fixture (LL-142). RESTAMP-RERUN-RACE-1 closed without it, so this entry is the only record.

**Accountable role / next action:** planner: route to the next roadmap review, which decides whether to register FIXED-LAYOUT-RESTAMP-1 as a stub.

**Disposition:** open

### F-035 — The RC window's "Package verification" record and gate (1) run 6's record are not in the repo (close-out review, 2026-11-04)

**Source:** the evidence check for the 2026-11-04 close-out review (groups 1, 4, 5 and 6).

**Severity:** medium (custody: several closing items cite this evidence as their package or suite proof)

**Where:** `docs/governance/close-outs/` holds only `Gate1.STAGE8-RUN4.2026-10-23.md`. The RC window's "Package verification" record (the arm64 and x64 pair for the merge `c5bb507f`) and gate (1) run 6's record (3,048 passed, 0 failed, typecheck 0; PARTIAL: D6 cold, D3 2.00x, Q3 session 2 and D6 warm 2.00x play not judged) are in Blurby.Brain1's messages and on RodneySr. On Rodney, `C:\Projects\Blurby-artifacts\rc-merge-20261103\` (`launch25-arm64.json`, `asar-list-arm64.txt`) corroborates the arm64 launch. *Corrected 2026-11-05: this note first said the folder was built from a later tree. It was built from `c5bb507f`, tree `761c315a`, the same tree as `70d64237`: the worktree's reflog, the files' dates (12:15 to 12:17) and the asar list all show it.*

**Finding:** the close-outs cite Brain1's written verdict for run 6 and per-item memos for package evidence, because the RC pair's own record was not found in the repo. Several raw evidence folders (for example FOLIATE-DISPLAY-LIFETIME-1's, PLAY-FIRST-TEXT-1's, BAND-ALIGN-2 R8's) are on RodneySr only.

**Accountable role / next action:** Blurby.Brain1: commit both records (run 6's table and the RC "Package verification" section) to `docs/governance/close-outs/`, or name their exact location for the close-outs to cite.

**Disposition:** resolved 2026-11-05. Both records are on `main` at merge `7eaec14b` (`Gate1.STAGE8-RUN6.2026-11-03.md`, verdict PARTIAL, and `PackageVerification.RC-WINDOW.2026-11-03.md`, both halves passing), reviewed by Blurby.Roadmap. Ruled the same day (`Brain1.post-halt-rulings.2026-11-05.md`): Blurby.Brain1 owned it and RodneySr drafted both on `eb/gov-rc-evidence-records`. The raw evidence folders stay on their hosts, uncommitted.

### F-036 — Long frames in recorded Narrate sessions, which the D5 check cannot see (BTO D3 read-out, 2026-11-05)

**Source:** Blurby.Brain1's read of RodneySr's BLOCK-TEXT-ORDER-1 D3 1.00x sessions on `d3184d0b` (`C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.rodneysr-dispatch-status.2026-11-05.md`). The figures are Brain1's. The planner checked the code sites below on `origin/main` `14ce3d24`.

**Severity:** medium: a measurement-validity defect in our gates, not a product defect (cause named 2026-11-05, below)

**Where:** `scripts/narrate-rebuild/p5-recorded-output-check.mjs:84-100`: `limit = Math.max(baseLimit, frame + FRAME_TOLERANCE_MS)` gives a long frame its own lateness limit. `main/narrate/trial.js:154`, added by NARRATE-ARRIVAL-SYNC-1 (`48ac770d`), sets `BLURBY_DUAL_SOURCE_DIAG` in the trial's scratch profile. That flag switches on `src/utils/dualSourceDiag.ts:62` and its `console.debug` at `:86`, and `trial.js:148` forwards those lines to the main process log.

**Finding:** many commit frames run 300 to 515 ms. Commits over 100 ms number 136, 68 and 145 per session on `d3184d0b`, 130 on `14ce3d24` without BLOCK-TEXT-ORDER-1, and 1 on gate (1) run 5. So BLOCK-TEXT-ORDER-1 is not the source, and the D3 1.00x pass in gate (1) run 6 has the same blind spot. The cause is open (rule 6c). Candidates are the diagnostic flag at `trial.js:154`, which lands between runs 5 and 6, and host state. `windowsHide` is ruled out because it predates run 5. If the flag is the cause, the long frames come from the trial, not the product, because nothing outside `trial.js` sets it on `origin/main`.

**Accountable role / next action:** Blurby.Brain1: RodneySr's three-arm A/B (Job 2b) on `c5bb507f`, `14ce3d24`, and `14ce3d24` without `trial.js:154`. If the frames are real, a long-frame row goes into the D5 check before gate (1), and the planner writes that change as a specification. If the flag is the cause, the fix belongs in `trial.js`, because a diagnostic left on in a measuring harness distorts the measurement.

**Disposition:** open; 2026-11-05 Job 1c: the long gaps (947 ms and 460 ms) hold no task of 50 ms or more, so they are neither BLOCK-TEXT-ORDER-1's stamp nor console work. That weakens the diagnostic flag as a candidate and points to window or host throttling, so Job 2b gains an arm with occlusion throttling off. BLOCK-TEXT-ORDER-1's own long task is a separate cause, handled by its amendment 1. 2026-11-05 Job 2b: all four arms show the frames (19.7 to 24.8 commits over 100 ms per minute, p90 338 to 357 ms, maximum 492 to 504 ms), including `c5bb507f`, the code that gave 1 long commit in gate (1) run 5. So NARRATE-ARRIVAL-SYNC-1, the diagnostic flag, BLOCK-TEXT-ORDER-1 and occlusion throttling are cleared, and the change lies on RodneySr, not in the code. The cause stays open: foreign CPU was not captured. A blank Electron window on Rodney (arm64) ran 3,601 frames in 60 s with a maximum of 17.7 ms, and the same probe with host facts runs on RodneySr before Job 2c. The D5 ruling follows it.

**Root cause, 2026-11-05 (Blurby.Brain1, `Brain1.F-036.D5-ruling.2026-11-05.md`; evidence `C:\Projects\Blurby-artifacts\f036-probe\` on RodneySr):** RodneySr's display was off. It entered Modern Standby at 10:12 on 2026-11-05 and had not left it, with an earlier entry at 18:39 on 2026-11-04, so sessions ran with no vsync on a timer fallback. A blank Electron window there got 1 animation frame in 65 s, `visibilityState` "hidden", no GPU context, foreign CPU 2.3%. The same probe on Rodney, same Electron 42.11.18, ran 3,599 frames with a maximum of 50.2 ms under about 46% CPU. No app code is involved. Run 5 most likely had the panel on. Run 6's panel state is inferred, not read.

**Consequences:** gate (1) run 6's D3 1.00x PASS is withdrawn as evidence, and any frame column with it. So are the three BLOCK-TEXT-ORDER-1 D3 boundary sessions and the frame columns of Jobs 1c to 2b. Tests, typecheck, B5, rule 53 launches, asar checks, CPU attribution and Q1 stand. The gate (1) rerun list gains D3 1.00x, and D6 warm is rerun with the display on.

**Fix:** NARRATE-FRAME-GATE-1 (`docs/planning/specs/2026-11-05/NARRATE-FRAME-GATE-1.md`): a display precondition around every frame-sensitive session, and a long-frame row in the D5 check. This finding resolves when it merges.

### F-037 — BLOCK-TAG-CASE-1 Done-when 6 has no live evidence, and its Narrate check has nothing to observe (close-out review, 2026-11-05)

**Source:** the close-out check after F-029 resolved, reading the specification's rows 5 to 8 (`docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md`).

**Severity:** low (an unevidenced row; no code defect found)

**Where:** `docs/governance/close-outs/Memo.BLOCK-TAG-CASE-1.GovernanceStaging.2026-10-23.md`, rows 5 to 7 ("Not run", Wave B) and finding 2.

**Finding:** Wave B's live checks were never recorded, on two counts:

- **Shift+Right on both books, in Focus and Flow, with the anchor word's index before and after.** FLOW-PARA-KEYS-1's live run on `5fb00ab5` predates the block fix, and FLOW-PARA-PAUSE-INDEX-1's measurement covers pauses, not keys. That pause measurement does cover "Flow pauses at paragraph ends": 0 of 216 off a paragraph end, in both books and both modes. It did not cover the pause's length at the rhythm setting. Gate (2) row (j) covers Meditations INTRODUCTION only.
- **Narrate starts each paragraph after its pause, by ear.** The memo's finding 2 says Narrate's plan breaks only at section ends, so these books have no paragraph pause to observe. The row can't be met as written, and close-out does not amend acceptance criteria.

**Accountable role / next action:** placed 2026-11-05 (`Brain1.F-037.placement.2026-11-05.md`): the Shift+Right and pause-length checks run in the gate (1) rerun, on the packaged final tip, with books and tolerance named in ROADMAP.md's rerun list. The Narrate row goes to gate (2) as the check it is, row (w). Whether it stands, or is amended through the planner, the owner and an independent reviewer, follows that sitting.

**Disposition:** open. BLOCK-TAG-CASE-1 stays In Flight, and BUG-241 stays Incomplete, until the row is settled.
