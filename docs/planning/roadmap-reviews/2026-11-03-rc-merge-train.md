# Desktop release-candidate merge train: inventory and trial integration (2026-11-03)

**Planning record. Nothing merged, built or admitted.** Prepared by Blurby.Roadmap (Claude) under the owner's 2026-11-03 goal, for Blurby.Brain1's technical rulings. The owner lifted the freeze for one integrated release candidate on 2026-11-02 ("Yes, include them all"; "Confirmed, lift it"), then paused all work; the 2026-11-03 goal resumes planning and coordination.

## Sources

- Live register: Notion SQL read 2026-11-03 (non-terminal rows), matching the guarded helper snapshot 2026-11-03T01:47:43Z (202 rows: 74 In Flight, 41 Queued).
- Repository: `origin/main` `b58b0117` (the docs-only worktree-placement merge on top of `ac19ea60`). The register's `branch` field gives each item's branch; tips read from `origin/eb/*`.
- Method: read-only `git merge-tree --write-tree` against `origin/main`, then a chained in-memory trial (dangling `commit-tree` objects only; no ref, index or working tree touched). Documentation-only conflicts were resolved `-X ours` for the trial only; real resolution follows N-Q3.

## Inventory of the 74 In Flight rows

| Group | Count | Items |
|---|---|---|
| Already in `origin/main` (branch fully merged), release-held | 27 | Seq 1–27 and 29 (PAGE-REOPEN-CFI-1 … FOLDER-NOTICE-1) |
| Held branch on origin, not merged | 43 | Seq 35–116 (list below) |
| No branch on origin | 2 | NARRATE-CPU-PROFILE-1 (commit `270bf721` local to RodneySr), GOV-SWEEP-FOLLOWTHROUGH-1 (`eb/governance-sweep-2026-10-26` not on origin) |
| No branch recorded (diagnosis/explanation items) | 2 | FOLDER-SWITCH-CONTENT-1, PROFILE-QUEUE-ISOLATION-1 |

The 27 merged items still need the same-candidate release gates (gate (1) and the owner's batched gate (2)) before close-out; their code is already on main.

## Stacks

Twenty-one of the 43 held branches are contained in a later tip, so merging 23 maximal tips carries all 43:

- LIBRARY-WRITE-RACE-2 ⊃ LIBRARY-WRITE-RACE-1 ⊃ WS-PAIR-LOG-1 ⊃ WS-TOKEN-REGEN-1
- ZIP-ASYNC-READ-1 ⊃ ZIP-READ-FOLLOWUPS-1
- FOLIATE-DISPLAY-LIFETIME-1 ⊃ FOLIATE-OBSERVER-LEAK-1, LIBRARY-COMPLETION-VISIBILITY-1
- NARRATE-SENTENCE-INITIALS-1 ⊃ NARRATE-SENTENCE-RESUME-1 ⊃ NARRATE-TOKEN-CAP-1
- NARRATE-GAP-PAUSE-1 ⊃ NARRATE-PAUSE-CANCEL-1 ⊃ NARRATE-QUIT-LINGER-1
- PLAY-FIRST-TEXT-1 ⊃ BAND-ALIGN-2 ⊃ FLOW-PARA-KEYS-1 ⊃ FLOW-KEYS-FIX-1 ⊃ FOCUS-KEYS-FIX-1; BAND-ALIGN-2 ⊃ BAND-ALIGN-1
- FLOW-PARA-PAUSE-INDEX-1 ⊃ BLOCK-TAG-CASE-1 ⊃ FLOW-PARA-KEYS-1
- READER-ARROW-GUARD-1 ⊃ FLOW-KEYS-FIX-1
- RESTAMP-RERUN-RACE-1 ⊃ JUMP-LANDING-SAVE-1 ⊃ PAGE-SAVE-RESTAMP-3 ⊃ PAGE-HELD-TURN-FAIL-1 ⊃ TOC-JUMP-SAVE-1
- CHAPTER-STEP-CFI-1 ⊃ the RESTAMP and FLOW-PARA-KEYS stacks (stopped item; excluded)

## Trial integration (order follows Brain1's 2026-11-02 RC ruling)

| # | Tip | Result on the running candidate |
|---|---|---|
| 1 | LIBRARY-WRITE-RACE-2 | clean |
| 2 | LARGE-FOLDER-SYNC-3 | clean |
| 3 | RENAME-TMP-RACE-1 | clean |
| 4 | ERROR-LOG-CAP-1 | **source conflict** `main/ipc/library.js`, `main/ipc/misc.js` (against LIBRARY-WRITE-RACE-2) |
| 5 | ZIP-ASYNC-READ-1 | clean |
| 6 | NARRATE-YEARS-1 | clean |
| 7 | NARRATE-TRACE-LABELS-1 | clean |
| 8 | NARRATE-KEY-REPEAT-1 | clean |
| 9 | WIN-TARGET-NSIS-1 | docs conflict `CLAUDE.md` |
| 10 | NARRATE-RECONCILE-RESIDUAL-1 | clean |
| 11 | OVERLAY-THEME-SWEEP-1 | docs conflict `BUG_REPORT.md` |
| 12 | BAND-ALIGN-2 | docs conflict `BUG_REPORT.md` |
| 13 | EINK-CONTROLS-1 | **source conflict** `main/migrations.js`, `tests/settingsMigrationV13.test.js`, `tests/settingsNarrateNormalization.test.js` (against BAND-ALIGN-2's migration; the ruled v15 renumber) |
| 14 | FOLIATE-DISPLAY-LIFETIME-1 | clean |
| 15 | NARRATE-SENTENCE-INITIALS-1 | **source conflict** `src/reader/modes/narrate/ModeRuntime.ts` (against main's NARRATE-START-STACK-1 logging) |
| 16 | NARRATE-GAP-PAUSE-1 | docs conflict `BUG_REPORT.md` |
| 17 | PLAY-FIRST-TEXT-1 | docs conflict `BUG_REPORT.md` |
| 18 | READER-ARROW-GUARD-1 | docs conflict `BUG_REPORT.md` |
| 19 | FLOW-PARA-PAUSE-INDEX-1 | clean |
| 20 | RESTAMP-RERUN-RACE-1 | clean |
| 21 | APP-TABS-1 | clean (shared-core `src/types.ts`; last, per ruling) |

Because the trial skipped the three source-conflict tips, items 16 and 17 were tested without NARRATE-SENTENCE-INITIALS-1 beneath them. Once that conflict is resolved, the Narrate stack (15 → 16 → 17) must be re-checked against it; it overlaps `ModeRuntime.ts` and `narrateEngine.ts`.

**Excluded from the candidate:** CHAPTER-STEP-CFI-1 (stopped), BLURBY-BUSINESS-1 (own charter gates), NARRATE-CPU-PROFILE-1 and NARRATE-HARNESS-COLDCLICK-1 (merge after release, R-2026-11-02-CPU-2), and the not-yet-built PAUSED-CLICK, FOCUS-WORD-ONLY and PAGE-ENTRY-KEYS.

## Questions for Brain1 (technical)

1. **Topology:** build one integration branch (`eb/rc-integration-20261103` from `origin/main`) merging the 21 tips in waves, gated by suite, typecheck and build per wave and one rule 53 package pair on the final tip, then one `--no-ff` merge to main. Or merge each tip separately with its own rule 53. Roadmap recommends the single integration branch: 21 separate package pairs on RodneySr duplicate the final candidate's gate (1) without qualifying anything it does not.
2. **ERROR-LOG-CAP-1 against LIBRARY-WRITE-RACE-2** in `main/ipc/library.js` and `misc.js`: resolution direction.
3. **NARRATE-SENTENCE-INITIALS-1 against main's start-stack logging** in `ModeRuntime.ts`: confirm "keep main's NARRATE-START-STACK-1 logging plus the branch's sentence logic", as the paused-click specification already states.
4. **EINK-CONTROLS-1:** confirm the v15 renumber on top of BAND-ALIGN-2's migration and the two test files.
5. **Docs conflicts:** N-Q3 applies (keep main's status lines plus branch-only entries) for `BUG_REPORT.md`; `CLAUDE.md` takes main's text plus the NSIS branch's intended line.

## Gates (unchanged)

Per wave: `npm test`, `npm run typecheck`, `npm run build` on RodneySr. Final tip: rule 53 x64/arm64 package pair, scratch-profile launches, asar check, Brain1's package confirmation, Roadmap's merge go, arm64 launch on Rodney at merge. Then gate (1) on the merged main and the owner's batched gate (2) on that same candidate. Every item, including the 27 already merged, closes out only after those.
