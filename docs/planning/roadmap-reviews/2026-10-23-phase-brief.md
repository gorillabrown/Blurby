# Roadmap Review 2026-10-23 — Phase Brief

**Provenance:** work register `notion:database/3f87c96cc31e800580cfe019c89a56ca`, read fresh at 2026-10-23T17:12:10Z. This review then made 54 confirmed writes: 13 field fixes, 3 statuses and spec states, 1 creation, 29 Seq renumbers, 3 close-outs (by `/dispatch-closeout`) and 5 spec links and prerequisites. The snapshot was re-imported after them. Also: ROADMAP.md on `eb/gov-roadmap-review-2026-10-23`; terminal ledger to TR-083.

## Goal

**Ship the Stage 8 release (the finish line), then run the merge train.** Until the release:

- nothing new merges to `main` except docs and the release fix;
- new work can be built and held, but it cannot land.

## Where the work stands

| State | Count | Items |
|---|---|---|
| **Release fix**, merged, held for gate (1) and the smoke re-check | 6 | PAGE-REOPEN-CFI-1 (1), BOOK-TEXT-COLOUR-1 (2), FOLDER-SWITCH-HEADER-1 (3), NARRATE-START-STACK-1 (4), BOOK-TYPE-SCALE-1 (5), KEEP-FURTHEST-FIX-1 (6) |
| Merged earlier, gate-held | 21 | the 17 Stage 8 items, RELEASE-RUNBOOK-1, ELECTRON-42-UPGRADE-1, PDF-IMPORT-DIAG-1, PAGE-POSITION-SAVE-2 |
| Built, freeze-held | 19 | see the post-freeze merge train in the [plan](2026-10-23-plan.md) |
| Queued, dispatch-ready | 5 | the buffer below |
| Queued stubs | 18 | 11 post-release stubs (85–95) and 7 Stage 9 (96–102) |

**Next on the critical path (not dispatches):**

1. Gate (1) on `36ac7466` on the quiet machine (Blurby.Brain).
2. The owner's smoke re-check on the rebuilt installers (built 09:08 today).
3. Publish, then close the 27 merged items out.

## Dispatch buffer (5 of 5 dispatch-ready; all post-release)

1. **Rare page-save edge cases after the restamp guard, and "Keep at furthest"** (PAGE-SAVE-RESTAMP-3, Seq 80). Reading-position data safety. No unmerged prerequisite, so it may be built during the freeze and held.
2. **Other jumps in Page mode save the page they land on** (JUMP-LANDING-SAVE-1, Seq 81). The chapter buttons and `]`, dead since v1.28.0. It merges after TOC-JUMP-SAVE-1 (same file).
3. **Read EPUB archives asynchronously** (ZIP-ASYNC-READ-1, Seq 82). Stacked on ZIP-READ-FOLLOWUPS-1's built tip `29b3e7e5`.
4. **The cursor word's line sits in the fixed band** (BAND-ALIGN-2, Seq 83). The owner's "keep band fixed" decision. Stacked on BAND-ALIGN-1 and the keys fixes.
5. **Flow's paragraph keys step over whole-book paragraph starts** (FLOW-PARA-KEYS-1, Seq 84). Check-then-fix, stacked on FLOW-KEYS-FIX-1. The live check now running on FLOW-KEYS-FIX-1 measures Flow's Shift+→ and may settle the check first.

## Rubric (five findings, per item)

| Item | Specification | Prerequisite | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| PAGE-SAVE-RESTAMP-3 | pass (U9 pass) | none | new branch from `origin/main`; hold for the freeze | Seq 80, Queued, Full Spec | owner's machine (rule 47) |
| JUMP-LANDING-SAVE-1 | pass | TOC-JUMP-SAVE-1 merges first (built, held) | new branch; re-grep after TOC-JUMP-SAVE-1 lands | Seq 81, Queued, Full Spec | owner's machine; scratch-profile live check |
| ZIP-ASYNC-READ-1 | pass after this review added its Lessons applied | ZIP-READ-FOLLOWUPS-1 (built, held) | branch from `origin/eb/zip-read-followups-1` | Seq 82, Queued, Full Spec | owner's machine; no live check |
| BAND-ALIGN-2 | pass | BAND-ALIGN-1, FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 (all built, held) | stacked base `28ba822d` + `105a07c1`, as its spec says | Seq 83, Queued, Full Spec (fixed this review) | owner-observed route (rule 45) |
| FLOW-PARA-KEYS-1 | pass after this review moved its lessons into the U9 section | FLOW-KEYS-FIX-1 (built, held) | branch from `origin/eb/flow-keys-fix-1` | Seq 84, Queued, Full Spec (created this review) | owner's machine; scratch-profile live check |

## Lessons applied

- Two promotions: LL-164 becomes standing rule 51, and LL-146 becomes standing rule 52.
- Two new live lessons from today's close-outs: LL-165 (prove the profile before the first action) and LL-166 (a no-effect verdict needs a state-reading detector). Both bear on every live check in the buffer.
- See [lessons-applied](2026-10-23-lessons-applied.md).

## Exit criteria and duration

- **Exit:** the release published; the 27 gate-held items closed; the 19 freeze-held branches merged in train order; the buffer built.
- **Duration:** the gate chain needs the quiet machine and the owner, so it is not computable from here. After that:
  - the merge train is about a working day, one branch at a time with re-greps;
  - the buffer is about a day: five S items, three of them stacked on held tips.

## Risks

1. **The merge train.** 19 branches with interleaved shared files (`main/ws-server.js`, `chunkPlan.ts`, Flow's runtime, `ModeRuntime.ts`). One wrong merge order means re-work. The plan lists the chains; each merge takes `origin/main` in and re-runs its gates.
2. **Stacked buffer items.** Three of the five buffer items sit on unmerged tips. If a base branch changes in its merge, the stacked item re-greps (standing rule 36) before it merges.

## Buffer gaps

None. Two items failed U9 on entry and were enriched in place (ZIP-ASYNC-READ-1, FLOW-PARA-KEYS-1). All five pass `lessons --check ROADMAP.md --item <ID>`.

**KPI note:** `kpis` reports `dispatch-buffer-ready` 1 of 5. Its buffer is the first five non-terminal items by Seq, which are the merged release-fix items 1–5 (In Flight). Their specifications predate the U9 section format; only BOOK-TYPE-SCALE-1 passes. They are already built and merged, so this is not a gap in the queued buffer, Seq 80–84, which passes 5 of 5.

## Owner decisions open

- BAND-ALIGN-1 Part A (tier 2): the band grows toward 5 lines. Recommendation: do it. This gates BAND-ALIGN-1's merge.
- EINK-CONTROLS-1.
- LARGE-FOLDER-SYNC-1's design half.
- Stage 9's design questions.
