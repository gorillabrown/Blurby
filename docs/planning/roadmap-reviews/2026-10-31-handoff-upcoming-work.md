# Handoff — upcoming work (stopped 2026-10-31 at the owner's instruction)

Owner, 2026-10-31: "stop all work. Document any need upcoming work". Everything below is paused. Nothing is half-merged.

## State at stop

- **main:** `1a2fb775` or later. All governance and spec work from 2026-10-30 is committed and pushed.
- **Register:** Notion, snapshot 2026-10-30T23:12:24Z, 202 rows (Queued 43, In Flight 72). No outstanding recovery records.
- **Authority:**
  - Technical: Blurby.Brain1 (CLAUDE.md rule 11).
  - Builds: RodneySr, a temporary placement while GoG occupies Rodney (rule 53 note).
  - Register, ROADMAP, merge gos and governance: Blurby.Roadmap.
- **RodneySr:** asked to pause at a safe point, push what is built and start nothing new. In flight at stop: NARRATE-PAUSED-CLICK-1, PAGE-ENTRY-KEYS-1, FOCUS-WORD-ONLY-1, reproduction R2.

## 1. Release-candidate merge train — owner-approved, NOT STARTED

- **Owner decision:** "Yes, include them all" (relayed by Brain1, confirmed to Blurby.Roadmap 2026-10-31). The RC takes every held fix plus the remaining smoke fixes, which lifts the Stage 8 freeze.
- **Not done:** the merge-train plan (an inventory of the ~72 In Flight items, a dependency DAG, merge-tree conflicts and waves) was stopped before it produced output. No branch has been merged under the lift.
- **To do:** plan the waves, then merge branch by branch. Each branch needs:
  - origin/main merged in;
  - a fresh rule 53 check on RodneySr;
  - Brain1's package confirmation;
  - the Blurby.Roadmap merge go;
  - an arm64 launch on Rodney at merge.
- **Known stacks and orders,** recorded on the ROADMAP.md cards:
  - Library: FOLIATE-OBSERVER-LEAK-1 → LIBRARY-COMPLETION-VISIBILITY-1 → FOLIATE-DISPLAY-LIFETIME-1 (`4ac4ff76`), then APP-TABS-1.
  - Band: JUMP-LANDING-SAVE-1 → BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 / FLOW-PARA-KEYS-1 → BAND-ALIGN-2 (`e8e6de06`, R7a and R8) → PLAY-FIRST-TEXT-1 (`ebea7311`) → FOCUS-WORD-ONLY-1.
  - Narrate: SENTENCE-RESUME-1 → SENTENCE-INITIALS-1 → QUIT-LINGER-1 → PAUSE-CANCEL-1 → GAP-PAUSE-1 (`e3498f60`) → PAUSED-CLICK-1.
  - Page: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → JUMP-LANDING-SAVE-1 → RESTAMP-RERUN-RACE-1 → PAGE-ENTRY-KEYS-1. READER-ARROW-GUARD-1 is independent.
  - Write-race: WS-TOKEN-REGEN-1 → WS-PAIR-LOG-1 → LIBRARY-WRITE-RACE-1 → -2 → -3.
  - Settings migration: R8 v13→14 first; EINK-CONTROLS-1 renumbers after it.
  - Shared core (ReaderContainer.tsx, src/utils/FlowScrollEngine.ts, src/types.ts): one branch at a time.
- **Standing conflict rule (Brain1 N-Q3):** in docs-only BUG_REPORT.md conflicts, keep main's status lines plus any branch-only new entries or resolution lines.
- **Excluded:** CHAPTER-STEP-CFI-1 is stopped mid-run and is not RC-ready.
- **After the train:** gate (1) on the integrated candidate, then the owner's gate (2) smoke with the batched owner checks (R7/R8 band, Top shift for Lines 3/7, BUG-237 pause listening, play-first-text, and so on).

## 2. Dispatched on RodneySr, paused mid-run

Specs are on main in `docs/planning/specs/2026-10-30/`.

| Item | Spec | Base | Notes |
|---|---|---|---|
| NARRATE-PAUSED-CLICK-1 | card plus `NARRATE-PAUSED-CLICK-1.amendment.md` | main + `c93f7c09` + `e3498f60` (tree `40f74988`) | Clears the stale anchor in pause(); ns10 |
| PAGE-ENTRY-KEYS-1 | card plus amendment | `79e1d9d0` + main | ek0 and ek6 added |
| FOCUS-WORD-ONLY-1 | card plus amendment | `ebea7311` + main | Owner: no Focus insets; shared band position; clamp at top |

Resume: ask RodneySr (via Brain1) what was pushed for each, then continue or restart from the recorded step.

## 3. Built and held today, awaiting the merge train

Each is package-verified on x64; the arm64 launch happens at merge.

- NARRATE-QUIT-LINGER-1 (`5de476ce`)
- NARRATE-PAUSE-CANCEL-1 (`e1d0da2b`)
- NARRATE-GAP-PAUSE-1 (`e3498f60`, BUG-237)
- BAND-ALIGN-2 R7a and R8 (`e8e6de06`, BUG-235)
- PLAY-FIRST-TEXT-1 (`ebea7311`, BUG-236)
- FOLIATE-DISPLAY-LIFETIME-1, LIBRARY-COMPLETION-VISIBILITY-1 and FOLIATE-OBSERVER-LEAK-1 (one stack, `4ac4ff76`)

## 4. RodneySr reproduction results, not yet recorded in the register

- **R1, FOCUS-PAUSED-HANDOFF-1 (118):** not reproduced. Hold it. The owner is to give exact steps (asked 2026-10-31, not yet answered).
- **R3, NARRATE-SELECTION-START-1 (124):** cause found. A host height change at play start (629.8 → 608.2 px) makes onExpand re-anchor the view.
  - Brain1 ruling: (a) keep the host height stable across play and pause; (b) as a backstop, re-centre after onExpand settles.
  - Spec it alongside NARRATE-BAND-SPACE-1.
- **R4, EINK-FLOW-VIEWPORT-1 (128):** fixed by the held BAND-ALIGN stack (`e8e6de06`). Close it when that stack merges.
- **R5, FOLDER-SWITCH-CONTENT-1 (120):**
  - 400 files show cards in 542 ms; about 200 ms sits between sync and broadcast.
  - The 93 s case isn't explained. The owner is to name the folder (asked, not yet answered).
  - Brain1 T-120: latest request id wins; split the item into presentation and latency.
- **R6, PROFILE-QUEUE-ISOLATION-1 (121):** close as explained. The isolated instance made 0 live writes; an unisolated launch migrates and enqueues settings by design.
- **R7, EINK-VIEW-REFRESH-1 (130):** baseline recorded.
  - Page: 3 flashes per 45 turns.
  - Flow: one flash every 3.8 s.
  - Menus and idle: 0.
  - Spec flash-on-view-change from this.
- **R2, BOOK-TYPE-SCALE-2 (122):** waits for a CSS-copy fixture EPUB (owner: never open the owner's book).

## 5. Open owner decisions

1. FOCUS-PAUSED-HANDOFF-1: exact steps.
2. FOLDER-SWITCH-CONTENT-1: which folder (types, size, local or Drive).
3. EINK-APPEARANCE-2: the contrast control (levels or slider); does pure-black Dark survive?
4. LIBRARY-UI-TEXT-SIZE-1: the target size; fixed or a setting?
5. READER-PAGE-COUNTER-1: the page unit (250-word or foliate screen pages); the total to show.
6. BOOK-TYPE-SCALE-2: keep the publisher's justified text?
7. EINK-DEVICE-SETTINGS-1: scope (E-ink settings only, or other settings too).
8. BUG-234 and BUG-233 (Focus): reproduce on main first. No owner input needed.

## 6. Items ready to specify (from the 2026-10-30 triage)

- DROPDOWN-DISMISS-1 (133). Serialize with the LibraryView owner.
- TRAY-ICON-SIZE-1 (137): a multi-size `.ico`.
- EINK-MODE-AVAILABILITY-1 (127): owner design is Page; Brain1 T-127 puts the switch in the mode router or settings handler.
- LIBRARY-CONTENT-DEDUP-1 (138): owner design and Brain1 rulings are complete. Waits for IPC-PATH-TRUST-1 and the LibraryView owner.
- FOLDER-RETRY-FEEDBACK-1 (131): waits for FOLDER-NOTICE-1.
- LIBRARY-FOOTER-REMOVE-1 (136): owner ruled to move start-at-login, backup and restore into Settings.
- POSITION-PROMPT-COPY-1 (134): Full Spec. Needs the common readiness fixes (host, package wording).

## 7. Other queued work

- **BLURBY-BUSINESS-1** (Seq 100.5, Path: epic): chartered at `docs/planning/epics/2026-10-30-blurby-business/`. NOT launched. Waits for LIBRARY-COMPLETION-VISIBILITY-1's window to close and for an owner decision on who hosts it on RodneySr.
- **NARRATE-BAND-SPACE-1** (141, Stub): Narrate adopts R8's paragraph band. It also removes the deprecated `flowZoneLines?` from src/types.ts.
- **NATIVE-PATH-ATTESTATION-1** (140): parked by R-2026-10-30-1. Preserve its worktree edits and pins.
- **LOW follow-ups** in ROADMAP's Non-Blocking queue:
  - relaunch drops a file argument;
  - `narrateCancelQueued` type declaration;
  - Flow hand-off hold timeout (3 s);
  - unused Focus helpers cleanup.
- **Findings:** F-009 open (Narrate D6 budgets on the x64 mainstream class).
- **Lessons recorded today:** LL-172, LL-173, LL-174.

## Resume checklist

1. `git fetch`; read this file and the ROADMAP cards named above.
2. Refresh the register snapshot through the rule 11a guarded helper before any write.
3. Ask Brain1 for RodneySr's state at the pause.
4. Record R1–R7 outcomes in the register (section 4).
5. Plan the RC merge train (section 1) and get the waves ruled by Brain1 before any merge.
