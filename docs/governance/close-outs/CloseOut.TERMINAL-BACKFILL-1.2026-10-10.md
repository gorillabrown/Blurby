# Record the 51 historical terminal items in the ledger Close-Out  *(TERMINAL-BACKFILL-1)*

**Goal:** Record the 51 items that finished or were retired before the ledger existed, so pace and calibration read real history instead of one day.
**Result:** `docs/governance/terminal-ledger.jsonl` went from 3 to 54 records (TR-004..TR-054: 44 completed, 6 dissolved, 1 superseded), merged as `6e898edf` and pushed. TR-001..TR-003 are byte-identical; every record matches its reviewed manifest row.
**Learned:** LL-135 — a dispatch prompt must carry its reconciliation recipe, not cite a chat message. LL-136 — an exact-path diff fence silently forbids the timing log. LL-137 — read governance JSON as explicit UTF-8 on Windows.
**Recommend:** Close out the engine-sharing item (TTS-ENGINE-SHARED-1), which merged as `8cedd0cc` and awaits its report.
**Bottom line:** The ledger now covers all 54 terminal items; pace reads real history, but effort calibration still has no estimate/actual pairs.
**Yes, but:** No time was measured for this run either, so its own record (TR-055) carries no estimate or actual.

- **Item:** TERMINAL-BACKFILL-1 (monday item 13256739205, Seq 7)
- **Branch / merge:** `eb/terminal-backfill-1` from `57a4c803`; commit `f72e3795`; merge `6e898edf` (pushed to `origin/main`)
- **Specification:** ROADMAP.md § TERMINAL-BACKFILL-1 at `57a4c803` (archived to `docs/planning/.Archive/ROADMAP_legacy.md` by this close-out)
- **runtime:** not measured (no time log)

## Findings

Verified by the planner from `origin/main`, not from the executor's summary.

| # | Done when | Result | Evidence |
|---|---|---|---|
| 1 | Ledger has 54 lines | PASS | `git show origin/main:docs/governance/terminal-ledger.jsonl` → 54 records |
| 2 | `git diff --numstat` reads `51 0` | PASS | `git diff --numstat 57a4c803 origin/main -- docs/governance/terminal-ledger.jsonl` → `51 0`; first 3 lines byte-identical to `57a4c803` |
| 3 | Ledger = register terminal set; records = manifest rows; `note` prefix | PASS | 0 field mismatches across itemId, completed, result, evidence; 0 duplicate itemIds; every `note` starts `historical-backfill`; the 51 manifest items equal the live register's terminal set minus TR-001..TR-003 (live board read 2026-10-10T22:55Z) |
| 4 | Re-run appends 0 | PASS (executor-reported) | Executor ran it: 0 appended, 51 `skip`. Not re-run here; the absence of duplicates is consistent |
| 5 | Diff lists only the ledger | PASS | `git show --stat 6e898edf` → 1 file, +51 |

Other checks:
- **Encoding:** the raw blob holds 5 UTF-8 em dashes (`e2 80 94`), no `U+FFFD`, no carriage returns. The five `(—)` evidence strings copy the ROADMAP Completed Work Summary rows' empty evidence cell faithfully (for example `| KOKORO-DEEPEN-1 | 2026-05-11 | … | — |`).
- **Register:** TERMINAL-BACKFILL-1 stayed Queued, Seq 7, unchanged since 2026-10-10T20:05:47Z; no register writes during the run. No recovery records outstanding.
- **Created files:** `sprint_guards created-files --base 57a4c803` in the sprint worktree → clean (0 temporary, 0 untracked, 0 uncommitted).

## Deviations and dispositions

| Deviation | Disposition |
|---|---|
| No saved reconciliation recipe; the executor ran equivalent checks (baseline `57a4c803`, no branch/worktree collision, no other branch touching the ledger) | Accepted. Planner fault: the dispatch cited a recipe that existed only in chat (LL-135). |
| No timing log | Accepted. Done-when 5 forbade any file but the ledger, and the log lives in `closeOuts` (LL-136). TR-055 records no estimate or actual. |
| Merge made on a detached `origin/main` inside the sprint worktree, then pushed | Accepted: the worktree was clean, which is all the spec required. The primary checkout's local `main` was fast-forwarded at this close-out. |
| Executor briefly suspected the manifest was corrupted | Not a defect: a default-codepage read garbled correct UTF-8. The planner hit the same false alarm through a `cmd` redirect (LL-137). |

## Lessons

New: LL-135, LL-136, LL-137 (appended to `docs/governance/LESSONS_LEARNED.md`).

Lessons the specification applied:
- **LL-129** (census variants before a bulk transform): held. The manifest resolved every variant; nothing was parsed at run time.
- **LL-130** (mutation-plan opens a recovery record): held. No `mutation-plan`, no register write.
- **Standing rule 36** (verify state at the moment of consequence): held. The executor re-checked the manifest against a fresh snapshot before appending; the live read at close-out confirms nothing moved.

## Retrospective

- **Effort calibration:** sized S, estimated 35m chain; actual not measured.
- **Dispatch precision:** high for the data work (zero mismatches). Two gaps were the planner's: the chat-only recipe and the fence that excluded the timing log.
- **Discovery yield:** three process lessons, no product findings.

## Files Created

- `docs/governance/terminal-ledger.jsonl` (modified, committed in `f72e3795`).
- Sprint worktree `.worktrees/terminal-backfill-1` and branch `eb/terminal-backfill-1`: kept; removal is maintenance under `policy.git`.
- Append and verification scripts: in the executor's session scratchpad, outside the repository.
