# Roadmap review 2026-10-30 — Phase D brief

**Provenance:** live register `notion:database/3f87c96cc31e800580cfe019c89a56ca`, final snapshot 2026-10-30T18:45:00Z, 199 rows (Queued 44, In Flight 69, Completed 71, Dissolved 9, Superseded 6, Blocked 0). Every register write was planned, executed, read back and confirmed through the qualified helper (14 changes, recovery empty); see `2026-10-30-register-mutations.json`. Lessons figures are from `docs/governance/LESSONS_LEARNED.md` as of 2026-10-30.

## Authority this review records

- **Owner mandate (2026-10-30):** "RSr is all yours to direct without interference to complete the Blurby roadmap. Advance to completion."
  - The owner confirmed in chat that Blurby.Brain1 holds rule 11's technical authority, superseding thread `01a179e8` where they differ.
  - CLAUDE.md rule 11 still names `01a179e8`. Changing that pointer needs the owner's separate OK.
- **Rulings applied:**
  - **R-2026-10-30-1** parks NATIVE-PATH-ATTESTATION-1 and unblocks FOLIATE-DISPLAY-LIFETIME-1.
  - **R-2026-10-30-2** moves the arm64 launch to merge time.
  - Brain1's Phase C rulings 1–4.
  - T1 and T2 define the rule 53 pair check and the merge-in.
- **Owner design rulings recorded:**
  - BAND-ALIGN-2 R7 ("Add space, band fixed", with sub-rulings Q1–Q5);
  - LIBRARY-CONTENT-DEDUP-1: mark duplicates, choose which to keep, Recycle Bin only after a confirmed path;
  - EINK-MODE-AVAILABILITY-1: E-ink on while in Focus opens Page.
- **For the owner to check:** Brain1 ruled that the owner's 2026-10-28 condition on AGENT-PROTOCOL-CONSOLIDATION-1 ("after the NATIVE dispatch closes out") is met by parking NATIVE. The owner can reverse that reading.

## The buffer, in sequence (RodneySr's serial queue, set by Brain1)

| Job | Item | State | Rubric (5 findings) |
|---|---|---|---|
| 1 | Relaunch during the quit linger reopens Blurby (NARRATE-QUIT-LINGER-1 (b)) | Built and held at `5de476ce`; package-verified x64; arm64 at merge | Done; awaits the post-release train |
| 2 | Display-lifetime native routes (FOLIATE-DISPLAY-LIFETIME-1) | Unblocked, In Flight; queued after job 1 | Existing admitted spec on its held branch; prerequisite met (FOLIATE-OBSERVER-LEAK-1 built); execution environment = the RodneySr substitute |
| 3 | Combined visibility + observer + display-lifetime candidate (LIBRARY-COMPLETION-VISIBILITY-1) | In Flight; after job 2 | Existing spec; full rule 53; consumes job 2's candidate |
| 4 | Band reaches the top and bottom lines (BAND-ALIGN-2 R7) | **Dispatch-ready this review** | Specification PASS (U9 PASS, 12 cited; open items none). Prerequisite: none outstanding. Repository: origin/main merged into tip `85e32777` first (T2). External register: Notes recorded. Execution environment: RodneySr x64, rule 53 pair per T1. |
| 5 | Pausing Narrate cancels queued Kokoro jobs (NARRATE-PAUSE-CANCEL-1, Seq 86.5) | **Dispatch-ready this review**; register Full Spec | Specification PASS (U9 PASS, 18 cited; U10 PASS). Prerequisite: NARRATE-QUIT-LINGER-1, stacked on `5de476ce`. Repository: `eb/narrate-pause-cancel-1`. External register: created and spec-linked. Execution environment: RodneySr x64; rule 44 dry run due at dispatch. |

Specs live at `docs/planning/specs/2026-10-30/`, with pointer cards in ROADMAP.md. They reach RodneySr from origin once this review's commit is pushed.

**Implementation-detail highlights:**
- **R7:**
  - Each mode gets a new leading inset from `computeLeadingInsetPx` (the anchor's offset, replacing today's fixed 15 %) and a trailing inset from `computeTrailingInsetPx`.
  - `computeBandEdges` extends the band at both section ends.
  - Edits stay in Flow's own `src/reader/modes/flow/helpers/FlowScrollEngine.ts`, not the frozen `src/utils/FlowScrollEngine.ts`.
  - Red tests (a)–(c) plus (a3), (w4) and (w5); live rows L1–L5.
- **Pause cancel:**
  - One `narrate-cancel-queued` IPC; the preload method checks `typeof prefix === "string"` only.
  - The producer writes a `cancel` log line.
  - Brain1's R2 checker gives 0 FAILs in 3 of 3 staged runs, with a 50 ms race window recorded rather than failed.
  - T2-2 checks gaps over D6 warm-resume traces.

## Buffer gaps

| Item | Gap |
|---|---|
| AGENT-PROTOCOL-CONSOLIDATION-1 (Seq 67.75) | Now the first queued item, with no prerequisite. Still a Stub with no detailed migration specification (rubric U1–U10 not met); it needs `/write-plan` or the next review. Owner directive 2026-10-28; F-006's rename is folded in. |
| Other Full-Spec queued items | U9 PASS on all eight re-checked, but each waits on In Flight prerequisites held by the Stage 8 freeze: NARRATE-CPU-PROFILE-1, PAGE-ENTRY-KEYS-1, NARRATE-ARROW-PAUSE-1, PAGE-PAGES-READ-1, LIBRARY-WRITE-RACE-3, NARRATE-PAUSED-CLICK-1, FOCUS-WORD-ONLY-1, POSITION-PROMPT-COPY-1. PAGE-ENTRY-KEYS-1 and NARRATE-CPU-PROFILE-1 have no unmet prerequisite. |

**Buffer status:** 2 new dispatch-ready of the policy target of 5. RodneySr is fully loaded with jobs 2–5; the buffer is gate-bound, not specification-bound.

## Prerequisites into and out of the buffer

- **Into the buffer:** FOLIATE-OBSERVER-LEAK-1 (built, frozen as job 3's input); NARRATE-QUIT-LINGER-1 → NARRATE-PAUSE-CANCEL-1; BAND-ALIGN-1 → BAND-ALIGN-2.
- **Out of the buffer:**
  - BAND-ALIGN-2 → FOCUS-WORD-ONLY-1, which then removes Focus's band and its leading space (owner: none);
  - BAND-ALIGN-2 → NARRATE-BAND-SPACE-1 (new Stub, Seq 141);
  - jobs 2–3 → the visibility package, and so the release.

## Exit criteria and duration

**Exit:**
- jobs 2–5 built and held with x64 package confirmation from Brain1;
- then the Stage 8 freeze lifts and the post-release merge train runs, with a fresh rule 53 check per branch and one arm64 launch at merge;
- then gate (1) and the owner's gate (2) smoke, with R7's owner-observed row added to gate (2)'s list.

**Duration:** not computable from the register (no deadline; effort missing for 24 items). Wall-clock estimates are about 5 h for job 5, against the helper's 27 m of agent time. Jobs 2–4 have none recorded.

## Top risks

1. **Single host:** every long run is serialized on RodneySr while GoG holds Rodney. One failed job delays everything behind it.
2. **Unconfirmed authority:** R-2026-10-30-1 replaces an independently reviewed native-observation design with the RodneySr substitute. It rests on the owner's mandate and on RodneySr holding no owner data. Any run that would read the owner's library needs the owner's explicit OK.

## Also recorded

- **New items:** NARRATE-PAUSE-CANCEL-1 (86.5, Full Spec) and NARRATE-BAND-SPACE-1 (141, Stub).
- **Parked:** NATIVE-PATH-ATTESTATION-1 (→ 140).
- **Prerequisites removed:** from FOLIATE-DISPLAY-LIFETIME-1, WORD-INDEX-UNIFY-1, BLOCK-TEXT-ORDER-1 and AGENT-PROTOCOL-CONSOLIDATION-1.
- **Findings:** F-001 to F-008 dispositioned; F-009 opened (Narrate D6 on the x64 mainstream class).
- **Follow-ups (LOW):** relaunch drops a file argument; declare `narrateCancelQueued` in `src/types.ts` after the freeze.
- **Holding bay:** `2026-10-30-blurby-business-tier1` stays open as owner-directed development work, to be absorbed later as its own "Blurby Business" lane. No entry absorbed or withdrawn.
- **Roadmap:** under its ceiling. NATIVE's full spec moved to `.Archive/ROADMAP_snapshot_2026-10-30.md`.
