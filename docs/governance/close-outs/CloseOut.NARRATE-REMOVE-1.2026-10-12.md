---
sprint: NARRATE-REMOVE-1
date: 2026-10-12
runtime: 58m measured working time (estimate 11h15m); wall clock about 3h20m, 2h09m of it waiting on the owner
tokens: not measured
status: all-pass (Done-when 16(f) on an owner-approved evidence basis; one owner-approved fence exception)
---

# Remove Narrate, keeping Kokoro dormant Close-Out  *(NARRATE-REMOVE-1)*

**Goal:** Delete the Narrate reading mode and every narration path, plus the dormant MOSS-Nano, Pocket and Qwen engines, while keeping Kokoro installed but unreachable and leaving Page, Focus and Flow exactly as they were.
**Result:**
- **Removed:** the Narrate mode and its view, hooks and six strategies; the audio scheduler and pipeline utilities; the TTS settings screens; the Narrate button, shortcut and palette entries; the MOSS-Nano, Pocket and Qwen engines with their IPC, sidecars and scripts; the TTS evaluation scripts and the CI quality gate; the legacy dead cluster; 139 test files and two fixture directories.
- **Kept dormant:** Kokoro's five main-process files are byte-identical to the base, their handlers are registered but unreachable, and nothing starts Kokoro at launch.
- **Normalized:** a v13 settings migration and three ingestion points (`loadSettingsData`, `applyCloudSettings`, the `save-settings` handler) turn a saved `narrate` mode into `flow`.
- **Unchanged:** the Page, Focus and Flow baselines are byte-identical.
- **Diff and merge:** against the base, 247 deleted, 66 modified, 3 added in code, plus the memo and time log; merge `386651fc` (`--no-ff`), pushed.

**Learned:** LL-150 — A deleted stylesheet can hold rules a kept feature uses: a deletion spec needs a selector census. Also LL-151 (prove a gate recorder can record a failure), LL-152 (A/B a blocked live gate on the base) and LL-153 (settle at dispatch what the executing session may write).
**Recommend:** Run `/roadmap-review` to refill the queue (no full specification is queued), then `/epic NARRATE-REBUILD-1`, which is now unblocked.
**Bottom line:** Narrate is gone cleanly; the one defect, a stylesheet the import census could not see, was caught in review and fixed before the merge.

- **Item:** NARRATE-REMOVE-1 (monday item 13261071931, Seq 8)
- **Branch / commits:** `eb/narrate-remove-1` from base `612d03f5` (C1's `NARRATE-REMOVE-1-Base:` trailer). C1 `238e12e6` (positive controls), C2 `0c89dd79` (Wave A, renderer), C3 `0d411010` (Wave B, main process), C4 `31793182` (tests; amended from `75095813` by the Reading Goals correction), C5 `bfbe5dba` (staging memo and time log). Merge `386651fc` onto `612d03f5`, pushed; its tree equals C5's.
- **Specification:** ROADMAP.md § NARRATE-REMOVE-1, Full Spec revision 4 (OutsideAudit.10 D4b), dispatched by `/next-pointer` on 2026-10-12. This close-out archives it, with its staging memo, to `docs/planning/.Archive/ROADMAP_legacy.md`.
- **runtime:** 58m measured working time against an 11h15m estimate (the time log, 13 rows, complete).

## Findings

Re-verified by the planner on the published tree (`origin/main` = `386651fc`) where a check reads the tree; suite, build and smoke rows come from the run's recorded evidence on C4 `31793182`, whose tree the published tree contains unchanged apart from the memo and the time log (`git diff --name-only 31793182 bfbe5dba`).

| # | Done when | Result | Evidence |
|---|---|---|---|
| 1 | Deleted paths absent | PASS | `git ls-tree` on `386651fc` lists none of the eleven paths |
| 2–4 | Three-mode registry, bottom bar, shortcuts | PASS (run record) | Gate on amended C4: DW2 27, DW3 15, DW4 42 tests passed |
| 5 | Settings and palette | PASS | `git grep` on `386651fc` exits 1, no output; DW5 suite 5 tests |
| 6 | Migration v13 (positive control) | PASS | Failed on the base in C1 (15/15 failing with DW7); 6 tests pass after |
| 7 | Normalization at the three seams | PASS | 9 tests; the four wiring counts print `:1` on `386651fc`; the three omission controls each failed, then were restored hash-identical (staging memo) |
| 8 | User data untouched | PASS | No launch scheduling in `main.js` (exit 1); the five Kokoro files show no diff against the base |
| 9 | Kokoro dormant and unreachable | PASS | Both searches exit 1; engine tests 21 passed |
| 10 | Dormant engines gone | PASS | No `moss`, `pocket`, `qwen` or `sidecar` file under `main/`; no handler registration |
| 11 | CI and scripts | PASS | `git grep` exits 1 |
| 12 | Page, Focus and Flow unchanged | PASS | Baselines identical to the base; only the three `ModeRuntime.ts` files changed; 73 tests |
| 13 | No dangling references | PASS | Typecheck 0 errors on C4; closure check on the merge tree: `dangling relative imports: 0` |
| 14 | Suite, build, whitespace | PASS (run record) | `npm test` exit 0 (134 files; 1,955 passed, 1 skipped, 0 failed); build exit 0; `git diff --check` exit 0 |
| 15 | Diff fence | PASS with an owner-approved exception | D 247, M 66, A 3 in code; the third A is `src/styles/reading-goals.css`, named on an `Exception:` line by owner decision (amendment 1) |
| 16(a)–(e) | Owner smoke | PASS | Live on C4 `31793182` |
| 16(f) | Shift+Space cycle | PASS on an owner-approved basis | Static verification of the `useReaderKeys` slot order three ways, with consistent live observations (amendment 2) |

**Accepted population:** 1,955 tests passed and 1 skipped (134 files) on the sprint tree; the base had 3,410 passed and 133 skipped (235 files). The difference is the 139 deleted narration-only test files, not exclusions. **Failed:** none in the accepted run. One earlier full run failed only `tests/wordPositionIndex.test.ts` on its 200 ms budget (218 ms) under load; it passed alone and on the rerun (BUG-186).

## Interpretation

The removal did what it set out to do, and the evidence chain is complete: positive controls failed on the base, omission controls proved each normalization seam, and every search gate was shown to find hits on the base before it was trusted clean. The import-graph census made a 250-file deletion safe for code, with zero import fix rounds. Its one blind spot was CSS: `src/styles/tts-settings.css` also styled the retained Reading Goals page, which no import shows. The spec-compliance review caught it, and the block was restored verbatim into `reading-goals.css` before the merge.

Dev mode on this machine was too slow to drive the Shift+Space check reliably, and an A/B on the base showed the same slowness, so the slowness is pre-existing. The owner accepted a static record for 16(f). The four new bugs are observations from the smoke, each reproduced on the base or not attributable to the removal.

Effort: the estimate (11h15m) was about 11.6 times the measured working time (58m). Parallel workers on an edit set partitioned by the import census needed no fix rounds; the owner's wait (2h09m) dominated the wall clock.

## Proposed Dispositions

| # | Finding | Disposition (confirmed by the owner 2026-10-12) |
|---|---|---|
| 1 | Done-when 1–16 pass, with two owner amendments | Close the item |
| 2 | The Reading Goals styles lived in a deleted stylesheet | Fixed before merge (amendment 1); LL-150 |
| 3 | 16(f) could not be judged live in slow dev mode | Owner-approved static record (amendment 2); LL-152 |
| 4 | `wordPositionIndex` budget flake | BUG-186, Low |
| 5 | ResizeObserver warning flood in dev | BUG-187, Low, needs a read-only diagnosis |
| 6 | Focus/Flow horizontal cursor band apart from the word cursor (owner screenshot; same on the base) | BUG-188, Low; screenshot archived at `C:\Projects\Blurby-artifacts\narrate-remove-1\owner-screenshot-2026-10-12-focus.png` (kept outside the repository: `docs/governance/bug-reports/.gitignore` excludes screenshots) |
| 7 | Whole-app slowness in dev mode (same on the base) | BUG-189, Low |
| 8 | BUG-185's rename race seen live at startup | Dated note on BUG-185 |
| 9 | The first gate-script run recorded nothing (its recorder name was shadowed by an alias) | Caught by a 0/0 summary and rerun; LL-151 |
| 10 | The executing session could write neither the board nor close-outs | Resolved at dispatch by owner decision; LL-153 |
| 11 | Spec typo: a `git log` range placed after `--` | Recorded on LL-143's status line; no rerun needed |

## Mid-Dispatch Decisions

Two owner decisions during the run, migrated verbatim from the staging memo (fold-ins 1 and 2), with the run's C4 record:

##### Mid-Dispatch Amendment — 2026-10-12 — Reading Goals styles restored
Decision Type: scope widening by one excepted path (C4 correction)
Context: the spec-compliance review of C1–C4 found that the Delete-list file src/styles/tts-settings.css also carried the Reading Goals settings styles (.reading-goals-create, .reading-goal-row, .reading-goal-unit, .reading-goal-progress, .reading-goal-streak, .reading-goals-empty, .reading-goal-delete and the inputs inside them), used by the retained ReadingGoalsSettings.tsx and defined nowhere else. The spec-compliant deletion would leave Settings → Reading Goals unstyled.
Decision: restore that block verbatim into a new src/styles/reading-goals.css and import it from src/styles/index.css (an edit site); record it as an Exception: path; amend C4; rerun Done-when 1–15 and both reviews; the owner confirms the page in smoke 16(c).
Rationale: smallest diff that keeps the retained page styled; no TTS or Narrate rule travels with it; the spec anticipates review findings folded into C4 by amend with Exception lines.

C4 correction: 75095813985d7e07dcd48ee23f7ebef245e83aa5 — spec-compliance review finding 1 (MEDIUM): the deleted src/styles/tts-settings.css also held the Reading Goals settings styles (nine classes used by the retained src/components/settings/ReadingGoalsSettings.tsx; no surviving stylesheet defines them). Owner decision 2026-10-12: restore the block verbatim into a new src/styles/reading-goals.css, imported from src/styles/index.css; amend C4; re-run Done-when 1-15 and both reviews.
Exception: src/styles/reading-goals.css — new retained stylesheet holding, verbatim, the Reading Goals block of the deleted src/styles/tts-settings.css (its lines 12 to the end of the .reading-goal-delete rule on origin/main), so the retained Reading Goals settings page keeps its styling. Added as an A outside the Done-when 15 fence by owner decision 2026-10-12 (spec-compliance review finding 1).
C4 amended: 317931826ce13d0b948c9a0434659005cf335eed — the Reading Goals correction is folded in (src/styles/reading-goals.css added, src/styles/index.css imports it); the correction on 75095813985d7e07dcd48ee23f7ebef245e83aa5 is finished.

##### Mid-Dispatch Amendment — 2026-10-12 — Done-when 16(f) recorded from static verification
Decision Type: acceptance-evidence substitution (owner)
Context: the owner reported the dev-mode app too slow to drive the Shift+Space sequence reliably; an A/B on the base build (main @ 612d03f5) was equally slow, so the slowness is pre-existing. The owner observed that Shift+Space in Page opened no mode and that from Flow it switched modes, but could not confirm the outline movement.
Decision: record 16(f) as pass on the basis of the two reviewers' and the orchestrator's static verification of the useReaderKeys slot alignment (D8/D15), with the live observations noted. The owner made this decision explicitly when asked.
Rationale: the fail condition the spec names for (f) (a mode opening from Page) was observed not to occur; the slot alignment that (f) guards is verified three ways; repeating the live check requires a faster build (a production build, or the pre-existing slowness fixed first).

**Smoke record (Done-when 16), as the run wrote it:**

Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(a) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(b) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(c) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(d) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(e) pass
Smoke: 317931826ce13d0b948c9a0434659005cf335eed 16(f) pass

## Lessons

- **New:**
  - LL-150 — A deleted stylesheet can hold rules a kept feature uses: a deletion spec needs a selector census.
  - LL-151 — A gate recorder must be proven able to record a failure before its PASS is trusted.
  - LL-152 — When a live owner gate is blocked by environment slowness, A/B the same actions on the base build before attributing it.
  - LL-153 — Settle at dispatch what the executing session may write: board status moves stay with the ceremonies.
- **Applied** (status records appended for those marked *):
  - LL-138* — held: positive controls failed on the base and omission controls failed as designed. Now held four times; promotion candidate.
  - LL-139* — held with a gap: zero import fix rounds, but CSS is outside an import census (LL-150).
  - LL-143* — held: every gate named its shell and exit code. One spec typo noted.
  - LL-144* — held: the base came from C1's trailer.
  - LL-146* — held: the closure check stayed outside the repository.
  - LL-147* — held: a local session ran every owner-machine gate.
  - LL-148* — held: no committed file names its merge sha; the memo recorded it after the merge.
  - LL-068* — held: `git diff --stat` shrinkage checked per commit.
  - Standing rule 41 (LL-136) — held: the time log was kept and exempted from the fence. No status record, because LL-136 is promoted.
  - LL-131, LL-128, LL-117, LL-106, LL-104, LL-121, LL-091, LL-135, LL-141, LL-142, LL-006, LL-149 — held: the spec's gates, kept list, IPC three-way removal, Flow guard, ingress normalization, wave split, recipe carry-over, owner smoke, the inert-patch statement, the atomic writer and the typecheck row all behaved as written.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Base measured; migration and normalization positive-control tests committed and failing | positive-control | claude-sonnet-5-5 | low | 40 min (estimated) | 6 min | — | — | — | C1 238e12e62c617fb598759f56d3b30810d8c74d57 (trailer and parent = base 612d03f5); gate re-run by Zeus: exit 1, 2 files / 15 tests failed; cached stat 2 files +320 |
| 2 | Renderer and legacy cluster free of Narrate (Wave A): deletions done; router, ports, container, diagnostics store, bottom bar, speed dialog, shortcuts and palette updated; typecheck clean outside tests | renderer-removal | claude-opus-5-5 | high | 210 min (estimated) | 8 min | — | — | — | C2 0c89dd79b8fe15ea00cba05519dd76f7c0761ca1 - 83 D + 24 M; typecheck 0 errors outside tests/; closure 0 outside tests/; DW5 and DW9b exit 1 |
| 3 | Main process, preload, packaging, CI and census cleaned; Kokoro dormant; v13 migration and ingestion normalization green | main-process-removal | claude-sonnet-5-5 | medium | 105 min (estimated) | 6 min | — | — | — | C3 0d4110100aaa358ef70832ec3dd2110ec02d1506 - 25 D + 10 M; two positive controls 15/15; wiring 7/7 exact; DW8-11 pass; omission controls fail (a)/(b)(c)/(e) and restored |
| 4 | Tests reconciled: 103 narration-only tests deleted, mixed tests edited, G1–G4 green with baselines byte-identical | test-reconciliation | claude-sonnet-5-5 | high | 180 min (estimated) | 13 min | — | — | — | C4 75095813985d7e07dcd48ee23f7ebef245e83aa5 - 139 D + 32 M; Done-when 1-15 gate script 34/34 PASS on the working tree (npm test 1955 passed/1 skipped/0 failed, build 0, typecheck 0, closure 0, baselines identical) |
| 5 | Full gate and closure check green (typecheck, test, build, dangling imports, diff fence) | verify-gate | claude-fable-5-1 | low | 45 min (estimated) | 2 min | — | — | — | Done-when 1-15 gate 34/34 PASS on committed C4 75095813 (tree 76d0e633): npm test 1955/1 skipped/0 failed, build 0, typecheck 0, closure 0, fence D247 M66 A2 |
| 6 | Spec compliance and code quality reviewed | review | claude-sonnet-5-5 | medium | 40 min (estimated) | 6 min | — | — | — | Plato READY (8 deferrable nits, 0 blockers); Solon/MarcusAurelius APPROVED_WITH_CONCERNS: 1 MEDIUM (Reading Goals styles lost with tts-settings.css), 1 LOW (foliate-bridge over-removal), 1 INFO (spec typo); both status proofs clean |
| 7 | Owner smoke on the rebuilt app recorded | owner-smoke | owner | low | 15 min (estimated) | 0 min | 2h 08m | — | — | Smoke on C4 31793182: 16(a)-(e) pass live; 16(f) pass by owner-accepted static verification with consistent live observations; memo Smoke: lines written; A/B vs base: slowness and Flow cursor pre-existing |
| 8 | Staging fold-ins written; merged to main and pushed | merge-and-docs | claude-sonnet-5-5 | low | 40 min (estimated) | 10 min | — | — | — | fold-ins 43 (memo 736+ lines); C5 bfbe5dba; merge 386651fc (--no-ff, parents 612d03f5 + bfbe5dba, tree check exit 0); push exit 0; ancestor check exit 0 |
| +9 | Load spec, build plan, assign owners, conflict check | — | claude-fable-5-1 | high | 25 min (estimated) | 0 min | — | yes | — | spec read in full (ROADMAP.md 194-764), zeus.md, LL-131..149; step 2 passed; conflict check clean; plan and roster printed; owner confirmed 2026-10-12 dispatch |
| +10 | Reconciliation (A): fetch, branch, worktree, npm ci; staging memo and time log opened | — | claude-fable-5-1 | low | 15 min (estimated) | 1 min | — | yes | — | Part 2 script: Reconciled (A) eb/narrate-remove-1 at base 612d03f5bdadf861a875d76c6260fd8d3a7520aa; npm ci exit 0; memo and Timing.NARRATE-REMOVE-1.jsonl created in the worktree |
| +11 | Base measurement on the untouched base: typecheck, test, build exit codes; closure check; eight gate positive controls; memo line | — | claude-fable-5-1 | medium | 30 min (estimated) | 2 min | — | yes | — | base green: typecheck 0, test 0 (3410/133 skipped), build 0; closure 0; 8 positive controls 35/9/11/51/68/9/18/12; memo Base measurement line written |
| +12 | Fix round: review and Done-when findings folded into C4 by amend; gates rerun | fix-round | claude-fable-5-1 | medium | 30 min (estimated) | 4 min | 1 min | yes | — | C4 amended to 31793182 (reading-goals.css restored verbatim, Exception line); gate 34/34 on tree 0c9c29fe; re-reviews APPROVED (Solon role) and READY (Plato), 0 new findings |
| +13 | Deliverables verified on origin/main (memo, time log); staging sweep; close-out block | — | claude-fable-5-1 | low | 15 min (estimated) | 1 min | — | yes | — | artifacts-exist 2/2 on origin/main; unpushed 0; manual staging sweep: 1 resident memo (this sprint's, open obligation for /pointer-closeout); merge tree == C5 tree; 1 merge since base; close-out block printed |

Estimate 11h15m (the first listing, sequential rows) · Actual 58m (measured working time, sequential rows)

## Files Created

- **Committed by the run:** the code diff, both new tests, `src/styles/reading-goals.css`, the staging memo and the time log.
- **Staging memo:** archived verbatim, with its post-C5 lines, under the specification in `docs/planning/.Archive/ROADMAP_legacy.md`, then removed from `docs/governance/close-outs/` once every fold-in landed.
- **Time log:** kept, updated with its three post-C5 lines.
- **Run worktree leftovers (owner-approved):** the uncommitted memo and time-log lines are now on `main` through this close-out, so the worktree copies are reverted; `tests/perf-baseline-results.json`, regenerated by `npm test` and never staged, is reverted.
- **Guard:** `created-files --base 612d03f5` in the run worktree exits 0 after the reverts.

## Governance Updates

- ROADMAP: the specification archived with a completion stub; header, Stage 3 note, rebuild prerequisite and five charter inputs, the two stubs unblocked, work lanes, buffer fields, notes on standing rules 8 and 22–32.
- CLAUDE.md: state heading, guardrail, engine posture, queue, bugs, suite, tech stack, checklist, owner priority; the two deleted files dropped from the shared-core freeze set; the 2026-10-10 notes archived to keep the file under 35k characters.
- TECHNICAL_REFERENCE: Kokoro dormant, three modes, settings schema 13 and its ingestion points, the Narrate section marked historical, the TTS landscape, Reading Goals styles, the suite size.
- BUG_REPORT: BUG-186 to BUG-189; notes on BUG-185 and BUG-184.
- LESSONS_LEARNED: LL-150 to LL-153 and eight status records.

## Roadmap & Queue Movement

- **Retired:** NARRATE-REMOVE-1, Completed in the register and recorded in the terminal ledger as TR-065.
- **Elevated:** NARRATE-REBUILD-1 (Seq 9, Path: epic) heads the queue and routes to `/epic`. CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11) move from Blocked to Queued as stubs awaiting re-authoring.

## Gates

- **Queue depth:** no full specification is queued; the epic is excluded from the buffer. Owner ruling R1's waiver ends with this close-out, so CLAUDE.md Rule 5a and standing rule 8 apply again: `/roadmap-review` backfills before the next dispatch.
- **Promotion candidates for that review:** LL-138 (held four times) and LL-143.
- **Rebuild charter:** the five charter inputs in the rebuild's roadmap entry (fixture recovery, cache initialization, nothing starting Kokoro at launch, leftover literals, runtime normalization).

## Git Hand-Off

- [x] Committed on `eb/closeout-narrate-remove-1`, merged `--no-ff` to `main` and pushed.
