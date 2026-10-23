# Close-out — UI-SWEEP-TRIAGE-1: Confirm or dismiss UI-SWEEP-1's NO-EFFECT and unreachable candidates (2026-10-23)

runtime: not measured (no time log kept)

**Goal:** re-test every UI-SWEEP-1 candidate (104 NO-EFFECT rows plus W1–W3) with a detector that reads state, and classify each as WORKS, BY-DESIGN or DEFECT.
**Result:**
- Report `docs/studies/investigations/UI-SWEEP-TRIAGE-1.2026-10-23.md` and `scripts/ui-sweep/triage.mjs` (plus `sweep.mjs` exports and the profile preflight), merged at `de453e64`. No product code.
- 107 rows: 42 WORKS, 39 BY-DESIGN plus W1, 23 DEFECT plus W2 and W3 (18 Medium, 5 Low; W2 and W3 Low).
- The DEFECTs fall into seven groups: Focus keys (#92–95) and Flow keys (#100–103), which became FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; EPUB chapter navigation (#73–77, #96–99), dead at v1.28.0 too, which belongs to JUMP-LANDING-SAVE-1 (B); and Shift+E restore, the library text-size keys, the skip link, and the two unreachable popovers.
- Filed at this close-out: BUG-210 (Focus keys), BUG-211 (Flow keys), BUG-212 (Shift+E), BUG-213 (library text-size keys), BUG-214 (skip link), BUG-215 (quick-settings popover unreachable), BUG-216 (note popover never shown).
- One incident: the chapter bisect's v1.28.0 build opened the owner's live profile and rewrote `settings.json`. Blurby.Roadmap assessed it, and the harness now refuses to run until it proves the profile.

**Learned:** LL-165 — A driver must prove which profile the app opened before its first action. LL-166 — A no-effect verdict needs a detector that reads state and a press made where the control should act.
**Recommend:** Dispatch FOCUS-KEYS-FIX-1, then FLOW-KEYS-FIX-1, after the Stage 8 release, as specified. BUG-212–BUG-216 wait for the next roadmap review to place them; BUG-213, BUG-215 and BUG-216 each carry an owner question.
**Bottom line:** of the sweep's 107 silent controls, 25 are real defects, now each tied to a bug or a fix item, and none blocks the release.

## Evidence (Done-when, verified 2026-10-23 on `eb/gov-roadmap-review-2026-10-23`)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Triage table, 107 rows, none unclassified | Report "Triage table": rows 1–104 plus W1–W3; Totals 42 + 39 + 1 + 23 + 2 = 107 | pass |
| 2 | Positive control before the run | Report: "dark theme" from light, `--bg` `#f5f3ef` → `#0f0f0f`, seen by the triage detector and missed by the sweep's digest; Library J seen via `library.focused` | pass |
| 3 | Every DEFECT row has a severity and two reproductions | Report "DEFECTs" and table. Caveats as the memo records: #5 has one run of its own (same control as #1, which has two); #75 and #77 have one triage run each, plus two bisect presses on each of two builds | pass, with the recorded caveats |
| 4 | W1–W3 by code read with `file:line` | Report "W1–W3": W1 BY-DESIGN (TextSizeSettings not routed), W2 and W3 DEFECT Low | pass |
| 5 | Fence; no product code; live profile hashes unchanged by the triage | `git diff --name-status de453e64^1 de453e64`: `A` memo, `A` report, `M scripts/ui-sweep/sweep.mjs`, `A scripts/ui-sweep/triage.mjs`; `node --check` on both scripts exits 0 (re-run at close-out). The triage runs left the hashes unchanged; the one live change came from the bisect (below). | pass |

**DEFECT dispositions (the spec's "the planner files the DEFECT rows as bugs at close-out"):** every DEFECT row now has a bug or a disposition.

| Rows | Severity | Disposition |
|---|---|---|
| 92–95 (Focus keys) | Medium | BUG-210; FOCUS-KEYS-FIX-1 (position 76) |
| 100–103 (Flow keys) | Medium | BUG-211; FLOW-KEYS-FIX-1 (position 77) |
| 73–77, 96–99 (chapter navigation on EPUBs) | Medium | JUMP-LANDING-SAVE-1 (B) (position 63), pre-existing at v1.28.0; no separate bug |
| 89 (Shift+E restore) | Medium | BUG-212, filed here; unscheduled |
| 79, 80, 87 (library text-size keys) | Low | BUG-213, filed here; unscheduled (owner question: label or binding) |
| 1, 5 (Skip to content) | Low | BUG-214, filed here; unscheduled |
| W2 (QuickSettingsPopover unreachable) | Low | BUG-215, filed here; related to BUG-200's owner question |
| W3 (NotePopover never shown) | Low | BUG-216, filed here; unscheduled (owner question) |

Rows 89, 79/80/87, 1/5, W2 and W3 had no bug or disposition before this close-out; they were filed per the spec. No row was release-blocking: Blurby.Brain ruled on the Focus/Flow keys (post-release), and the chapter bisect put chapter navigation outside the release gates.

## Mid-Dispatch Decisions

- **Release-blocking candidate to Blurby.Brain (2026-10-23):** the Focus and Flow navigation keys. They regressed in READER-MODE-SEPARATION-2's cutover (`3dd4b504`), and f0's v1.28.0 check found them broken there too. Ruled: after the Stage 8 release (FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1).
- **Chapter bisect priority slot (Blurby.Roadmap):** chapter Previous/Next and `]` are dead at v1.28.0 and at `97527896`. `249f12ae` was not measured, and Roadmap ruled no retry was needed. The verdict was pre-existing, not a gate, and the rows went to JUMP-LANDING-SAVE-1 (B).
- **Live-profile incident:** the bisect's v1.28.0 build ignored `BLURBY_USER_DATA_DIR` and rewrote the owner's `settings.json` (hash `1a4a40c6…` → `2e1d5245…`, reading modes set to "flow") and `sync-queue.json`. Blurby.Roadmap assessed it; the owner's app rewrites settings on its next save. The harness's `Session.profilePreflight` now exits 4 unless it proves the scratch profile (LL-165).

No issue file was opened for this item.

## Governance staging

`Memo.UI-SWEEP-TRIAGE-1.GovernanceStaging.2026-10-23.md` asks the planner to record three lesson candidates. Candidate 1 is LL-165. Candidates 2 and 3 are one lesson, LL-166. The bugs are filed above. The memo stays as the run's record.

## Lessons

- **Added:** LL-165 — A driver must prove which profile the app opened before its first action. LL-166 — A no-effect verdict needs a detector that reads state and a press made where the control should act.
- **Applied and held:** standing rule 43 (LL-138: the positive control ran first, and every null was checked against a control); LL-142 (every class from a measurement or a code read); standing rule 46 (LL-153: nothing written to the register by the run).
- LL-151 recurred in a new form: a detector that proved it could see errors (UI-SWEEP-1's control), but not effects. LL-166 records this, and the next roadmap review decides on promotion. LL-164 was checked: no lesson-status line was appended.

## Time

runtime: not measured (no time log). Cost: not computable (no dispatch binding for UI-SWEEP-TRIAGE-1).

## Files Created

- The report, the triage script and memo, and the `sweep.mjs` change: committed with merge `de453e64`.
- This close-out, BUG-210–BUG-216 in `BUG_REPORT.md`, LL-165 and LL-166, the terminal record and the archived specification: committed on `eb/gov-roadmap-review-2026-10-23`.
