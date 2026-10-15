---
sprint: NARRATE-REBUILD-1
date: 2026-10-15
runtime: not measured (no time log for the epic as a whole; phase S1 kept Timing.NARRATE-REBUILD-1-S1.jsonl)
tokens: not measured
status: has-discoveries
---

# Pointer Close-Out: NARRATE-REBUILD-1

## Sprint Brief

**Goal:** Rebuild Narrate from scratch so the cursor is the word at the current playback sample, from an exact word table, with no estimated timing (owner ruling #31).
**Result:**
- Narrate is rebuilt on Kokoro: a second producer (`main/narrate/`, `main/ipc/narrate.js`), an engine (`src/reader/modes/narrate/engine/`) and a fourth independent reading mode.
- It landed in six phases, P1–P5 (`7bbf6b20`, `d81aeb4b`, `ef245815`, `331f8313`, `05a5480a`) and P6 with its P6b amendment (`f27c7def`). The completion record merged as `689edd46`.
- P6b fixed a reconciliation tokenization bug. A stray closing quote became a soundless segment, so narration stopped at Meditations word 3217 and at 112 places in the book. The fix also closed the unchecked split-word units that let wrong tables pass. The epic's checkers now run under the app's own Electron ICU.
- All fifteen DoD rows pass (done.md). The G2 owner sign-off is verbatim. D6 holds under Decision #22's two hardware rows. D2 and D3/D5 were re-run on the P6b build on the quiet machine.
**Learned:**
- LL-160: word segmentation depends on the runtime's ICU, so tooling that numbers words must run under the app's runtime.
- LL-161: a correctness row about a word is checked by the word's text, not its index.
- LL-162: sweep the whole corpus offline before trusting sampled sessions, and validate every unit class the mapper accepts.
**Recommend:**
- The release gate now waits on PAGE-SAVE-RESTAMP-2, then the final-main quiet suite with D3/D6, then the batched owner smoke.
- The nine Narrate follow-ups held behind the epic are unblocked.
**Bottom line:** Narration rebuilt. The cursor follows the playing word exactly, it no longer stops on Meditations, and every remaining stop on the owner's books fails safe.

**By the numbers:**
- Meditations' fail-closed chunks: 112 before P6b, 0 after (the gate corpus is 3,683 chunks).
- The owner library: 21 of 11,030, all token-cap or the one ruled residual.
- D3: 802 and 1,513 commits, none outside one frame.
- The combined tree on main: 2,391 tests passed, 0 failed.

## Findings

| # | Finding | Severity | Disposition |
|---|---|---|---|
| F1 | The D2 log half failed at word 3217: a stray `'` became a 0-phoneme segment (class A), and a mid-chunk `'` broke the word count (class B) | High | Fixed in P6b (F1, F2); D2 re-run PASS on the P6b build |
| F2 | `wordmap.js` never cost-checked split-word units, so 85 units in 37 Meditations chunks passed with wrong sounds | High | Fixed in P6b (F3); 36 changed tables, each replacing a wrong split unit |
| F3 | Classes C and D (numbers over 3 groups, Greek, en-us linking r, spelled-out all-caps) | Medium | Fixed in P6b (F3–F5) |
| F4 | Plain-Node tooling numbered words with ICU 78.2; the app uses Electron's ICU 77.1 (Meditations 80,426 vs 80,493). S5's "first word is ancient" pass was false | High (for evidence) | Fixed in P6b: the checkers run under `app-node.ps1` and refuse plain Node; WORD-INDEX-UNIFY-1 for the product |
| F5 | The chunk planner treated "B.", "i." and "www." as sentence ends | Low | Fixed in P6b (an abbreviation- and title-aware table) |
| F6 | Class E: 18 owner chunks exceed the 400-id token cap and fail closed | Low | NARRATE-TOKEN-CAP-1 |
| F7 | One owner chunk fails closed on a name espeak voices differently alone | Low | Ruled residual; NARRATE-RECONCILE-RESIDUAL-1 |
| F8 | `p3-producer-check.mjs` exits 0x40000015 at shutdown under Electron | Low (pending the owner smoke) | Accepted for P6b; NARRATE-EXIT-CRASH-1, plus an owner-smoke quit check that becomes a release gate if the real app crashes |
| F9 | The launcher accepted a NaN `--rates` value and reported PASS; traces carry legacy MOSS-Nano labels | Low | NARRATE-TRACE-LABELS-1 |
| F10 | The Narrate FoliateView key forwarder drops `repeat` (`src/reader/modes/narrate/FoliateView.tsx:931-936`) | Low | NARRATE-KEY-REPEAT-1 (filed with this close-out) |
| F11 | Cold click is unmeasured on mainstream hardware | Low | NARRATE-HARNESS-COLDCLICK-1 |
| F12 | Blurby saturates a 4-core CPU during warm requests | Low | NARRATE-CPU-PROFILE-1 |

## Interpretation

**Populations:**
- **Passed:** all fifteen charter DoD rows. These cover the gate-corpus sweep (0 fail-closed chunks of 3,683), the D2 crossing by text, D3/D5 at 1.00x and 2.00x, the full suite on the combined tree on main (2,391 passed, 1 skipped, 0 failed, 174 files), and typecheck.
- **Failed:** none in the accepted population.
- **Excluded under authority:**
  - D6 on mainstream hardware is judged against Decision #22's mainstream row, and cold click on mainstream is unmeasured.
  - The owner library's 21 fail-closed chunks: 18 class E and 3 copies of the ruled residual.
  - `p3-producer-check`'s shutdown exit code (F8).
- **Unchanged:** Page, Focus and Flow baselines (D8, `git diff --exit-code 05a5480a` exit 0).
- **Published:** `main` at `689edd46`, pushed.
- **Open:** the release-gate re-run of D3/D6 on final main, the batched owner smoke, and the follow-ups below.

**Identity:**
- The tested combined tree is `c9ff8f06`: P6 `4b12668c` merged with main at `bd6af475`.
- The P6 merge on main, `f27c7def`, is code-identical to it: `git diff c9ff8f06 f27c7def` touches only `ROADMAP.md`.
- The completion record `689edd46` touches only the packet directory. `git diff --name-only 689edd46^1 689edd46 -- . ":(exclude)docs/planning/epics/2026-10-12-narrate-rebuild"` prints nothing.

## Proposed Dispositions

Every finding above has an owner item, and nothing is waived silently. NARRATE-REBUILD-1 is retired as completed. Its nine follow-ups gated on it (`Prerequisites: NARRATE-REBUILD-1`) move from Blocked to Queued.

## Mid-Dispatch Decisions

The epic's planner staging memo (`Memo.NARRATE-REBUILD-1.GovernanceStaging.2026-10-13.md`) is migrated here verbatim, per its two fold-ins (Action: Migrate; Destination: this section), and removed. The epic's own Decision log (#1–#24) is in its `state.md`. The P6b rulings of 2026-10-15 (Blurby.Brain) are recorded in the packet's `journal.md` and `plan.md` P6b.

##### Mid-Dispatch Decisions Registry — NARRATE-REBUILD-1

| # | Date | Pause point | Decision type | Disposition |
|---|------|-------------|---------------|-------------|
| 1 | 2026-10-13 | P5: warm latency (D6) over the 2 s budget after the charter's one repair attempt | Type 1b — Advance (Cowork-originated) | Resolved — owner authorized one second repair round, hard stop after it; ≈ 300 MB more memory for a third producer worker approved |
| 2 | 2026-10-13 | P5: D6 T7 FAIL after the second (final) repair round; executor offered only (c) or (d) | Type 1b — Advance (Cowork-originated) | Resolved — (c) with a mechanical load ceiling (foreign CPU ≤ 25 %), the producer-worker freeze fixed as a D7 silent-hang defect, a resume with nothing to replay starts like Play; T7 once more; no bake-off |

##### Target: ROADMAP.md

##### Fold-in 1 — Mid-Dispatch Amendment (second D6 repair round)
Section: §NARRATE-REBUILD-1 (Core acceptance, Latency budget; charter escalation trigger "one repair attempt")
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:

##### Mid-Dispatch Amendment — 2026-10-13

**Pause point:** After Decision #17's repair, the P5 in-app warm trial at 1.00x failed D6 (worst resume 4,286 ms, click 2,860, speed change 9,228 against 2,000; host 88 % busy). Cold trials all passed (worst 1,524 ms against 8,000). Measured causes: requests wait behind stale generations that onnxruntime cannot abort (`worker.terminate()` does not stop a native run); resumes landing in a prefetch gap after short heading chunks; host load.
**Decision:** Type 1b — Advance (Cowork-originated). The owner answered BLOCKER(USER) option (a): a second repair round, **one round only**. Memory for one more model session (≈ 300 MB) is approved.
**Rationale:** The failure is scheduling, not engine speed. With a free worker, the engine answers in ≈ 1.3–1.5 s (warm Play median 1,337 ms, cold worst 1,524 ms). A quiet machine (b) would not remove self-queueing, a looser budget (c) would accept a 9 s stall on a speed change, and a faster engine (d) shortens the wait but does not remove it.
**Scope change:** The charter's escalation trigger allows one repair; this grants exactly one more and no further. Levers are applied cheapest first: prefetch by seconds of audio ahead; a steady-state chunk cap (≈ 24–30 words); requests never queue behind an older epoch's generation, by reserving an idle worker, and a third warm worker only if the two-worker levers miss on a smoke. Harness: fix the cold-click driver (it clicked before the section's word spans existed) and record narration's own CPU share apart from the host total in every trial. The budget, the trial counts and the 2 s request cadence are unchanged. Decision #13 stands: D6 is judged on the owner's ordinary desktop.
**Follow-up items:** If any T7 trial is at or above its budget after this round, there is no third round. A new BLOCKER(USER) presents only (c) a budget or trial amendment and (d) the bake-off, with the new figures. Because the repair changes scheduling and chunking, the P5 gate re-runs D3 and D5 as already planned. Lesson SRL-093.

##### Fold-in 2 — Mid-Dispatch Amendment (D6 after the final repair round)
Section: §NARRATE-REBUILD-1 (Core acceptance, Latency budget); charter D6 row
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:

##### Mid-Dispatch Amendment — 2026-10-13 (2)

**Pause point:** T7 after Decision #18's round failed D6 with 7 of 160 warm trials ≥ 2 s (`phase5/latency-e2e.t7-1.json`, `bea78d19`); cold all < 8 s (worst 1,300 ms). Causes measured: 2 a once-per-process producer-worker freeze (both workers stop 6–35 s ≈ 30 s after the voice loads, when each releases ≈ 291 MiB external memory; Electron only); 4 CPU contention at ≈ 49 % foreign load (2.2–2.45 s); 1 a resume with nothing to replay that generated a 19-word chunk (3,434 ms). Executor offered only (c) and (d) per the pre-committed stop.
**Decision:** Type 1b — Advance (Cowork-originated). Owner chose (c), shaped so nothing is waived: (1) D6 keeps 2 s / 8 s, every counting trial, worst case; a trial counts only when foreign CPU (host minus Blurby's process tree) averages ≤ 25 % over the trial, over-ceiling trials are reported and replaced (Decision #13's "ordinary desktop" replaced by this definition; SRL-093); (2) the freeze is fixed as a D7 "never silent hang" defect — not a latency lever, not excluded from D6; (3) a resume with no replayable audio starts like a Play (the ramp's short first chunk), completing Decision #18 lever 1's stated guarantee. Then T7 once more in the owner's quiet window.
**Rationale:** Only contention is about engine speed, and medians (600–1,260 ms) and cold worst (1,300 ms) show Kokoro meets budget on a quiet host; the freeze silences narration for up to ≈ 27 s once per launch and neither (c) nor (d) as framed removes it; a bake-off costs weeks and G1 already judged it unlikely to buy accuracy.
**Scope change:** Charter D6 row amended by the owner (text in Decision #19). Freeze diagnosis (Aristotle, read-only) and one fix attempt; resume-as-Play; cold-click harness fix. Pre-committed stops: the freeze fix not holding → BLOCKER(USER) (out-of-process producer or bake-off); any counting T7 trial ≥ budget after this → BLOCKER(USER) (bake-off, or the owner changes the budget number itself). No further levers.
**Follow-up items:** The P5 gate re-runs D3 and D5 (the 2.00x drop seen in T7 is a D5 defect if it recurs, never a pass). SRL-094. The freeze is filed as a BUG at close-out with its root cause.

## Lessons

- **New:** LL-160 — Word segmentation depends on the runtime's ICU, so tooling that numbers words runs under the app's runtime.
- **New:** LL-161 — A correctness row about a word is checked by the word's text, not its index.
- **New:** LL-162 — Sweep the whole corpus offline before trusting sampled sessions, and validate every unit class the mapper accepts.
- **Applied:**
  - **LL-142 (the epic's founding lesson):** held. Every word table comes from Kokoro's own durations, with no estimate. A chunk the mapper cannot reconcile fails closed (F4) rather than being guessed, which is why 3217 stopped instead of drifting.
  - **LL-136 / PR-31 (one word-counting rule):** recurred. The main extractor and the renderer disagree under Electron's ICU (F4). LL-160 records it, and WORD-INDEX-UNIFY-1 owns the product fix.
  - **LL-143 and LL-151 (gates that can fail; instrument controls):** held. Every P6b gate has a `--control` or `--break` that exits 1, and the D2 checker fails the S5 trace.
  - **LL-153 (standing rule 46):** held. The run wrote nothing to the register. Status moves were made by the ceremonies.
  - **LL-141 (standing rule 45):** held. D12, D2's owner half and D7 F5 came from the owner at G2. Every live probe was in a visible window.
  - **Standing rules 47 and 48:** held. Full suites, typecheck and builds ran on the owner's machine, and wave B ran on the quiet machine by the owner's direction for rows that are not hardware-tiered.

## Files Created

- **Removed (temporary):** none.
- **Committed:** the epic's code, tests, fixtures, scripts and evidence on `eb/narrate-rebuild-1-p6`, and done.md plus charter.md on `eb/narrate-rebuild-1-done`. This close-out commits this report, LL-160–LL-162, the terminal record, and the removal of the planner staging memo, whose content is migrated above.
- **Left for a decision:** `tests/perf-baseline-results.json`, which `npm test` rewrites. It stays uncommitted in the `narrate-rebuild-1-p6` worktree (Rule 10). The scratch branch `eb/p6-main-check` (the combined-tree test, `c9ff8f06`) is local only and kept; pruning is maintenance.
- The epic's worktrees and evidence branches are kept.

## Governance Updates

- **ROADMAP.md:** NARRATE-REBUILD-1 is marked ✅ COMPLETED. The release-gate note is unchanged.
- **CLAUDE.md:** the most recent implementation is now NARRATE-REBUILD-1.
- **Register:** NARRATE-REBUILD-1 is Completed with its date and evidence, and its Seq is cleared. NARRATE-HARNESS-COLDCLICK-1, NARRATE-CPU-PROFILE-1, NARRATE-YEARS-1, NARRATE-SENTENCE-RESUME-1, NARRATE-TOKEN-CAP-1, NARRATE-RECONCILE-RESIDUAL-1, NARRATE-EXIT-CRASH-1, NARRATE-TRACE-LABELS-1 and WORD-INDEX-UNIFY-1 move from Blocked to Queued. NARRATE-KEY-REPEAT-1 is created.

## Roadmap & Queue Movement

NARRATE-REBUILD-1 (Seq 9) leaves the belt, and READER-VISUAL-DIAG-1 (Seq 10) becomes the head. It is parked for the owner. The next dispatchable release-gate work is PAGE-SAVE-RESTAMP-2, which is In Flight.

## Gates

- `artifacts-exist --ref refs/remotes/origin/main docs/planning/epics/2026-10-12-narrate-rebuild/done.md`: 1/1 present.
- The record merge's scope check printed nothing.
- `lessons --check` on this report is run in Step 6.
