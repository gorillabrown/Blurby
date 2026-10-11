# Owner stopped OS-1 and ruled Narrate be rebuilt — READER-MODE-SEPARATION-2 (session S1)

Date: 2026-10-10. Branch `eb/reader-mode-separation-2` @ `c9d73ddd` (F″ = F). Uncommitted per Decision #27.

## 1. tl;dr

Midway through the owner listening session (OS-1), the owner heard enough of the baseline's Narrate to rule that narration be removed and rebuilt from scratch (Decision #31). That makes the epic's remaining Narrate listening checks moot. The finish line (D1, D7, D8) and the evidence validator's heard-audio rule (R6) still demand them.

## 2. Executive Summary

OS-1 Part A ran on B0 through H6 (`g0-owner-observations.json`; live profile unchanged). Across two books the owner heard and saw:
- the highlight running ahead of the voice;
- a stuck highlight after an audio gap (Decision #28a);
- 15–35 s waits at speed changes and section starts;
- 1.4x distortion or overlap;
- a double highlight and a shifting bottom bar.

The owner stopped the session and ruled:
- rip out narration and rebuild it from the ground up, disconnected from the other modes, with the TTS engine in scope;
- land this epic first;
- go without narration in the interim.

The owner, through the planning session, then said GO on amending the finish line. The owner added: Narrate removal happens in the first sprint after merge, not on this branch, and the owner runs the trimmed F check (V1, S1, S2, S4) personally.

## 3. Evidence of issue

- `state.md` → OS-1 BLOCKER `Answer:` reads "STOPPED 2026-10-10 by owner ruling"; Decision #31.
- `g0-owner-observations.json` covers H1–H6. H7, H8 and V1–V3 were not run. `os1-owner-observations.json` Parts B–D are empty.
- Charter D7 requires "the owner's heard-audio observation" on every G6 audio case. `scripts/check_reader_mode_evidence.mjs` R6 rejects any Narrate case without `heardAudio.observer === "owner"` or a `captureRef`. D1 requires the B0 heard-audio observation with "zero pending rows". D8 requires the speed dialog's live observation, which included S3 (Narrate by ear).
- The charter states "Rows may be tightened by the user, never loosened by the executor." Loosening needs the owner, and the owner has ruled.
- The G6 harness counts all of `scripts/` as a production input (`PRODUCTION_PATHS` in `live/isolated-launch-g6.cjs` and `live/build-candidate.mjs`). An uncommitted validator edit therefore makes the candidate launcher refuse to start.

## 4. Possible cause(s)

1. The epic preserves Narrate's behaviour by design (parity, not repair). Decision #13 moved the owner's first listening to the end of the run, so the owner's verdict on Narrate's quality arrived after the parity work was done.

## 5. Likely solution(s)

1. Narrow the finish line by owner ruling.
   - Drop every Narrate listening and Narrate-only visual check: B0 H7–H8, V2, V3; F H1–H8, V2, V3, S3, C1–C3.
   - Record those checks as dropped, never as heard or passed.
   - Keep every automated Narrate case (positions, transitions, cursor counts, stale effects): they still prove isolation.
   - Amend R6 to accept an explicit owner-ruling marker.
   - Keep the trimmed owner check (V1, S1, S2, S4).
2. Keep the full listening session as chartered. The owner has rejected this.

## 6. Confidence in cause and solution identification (1–10)

9. The ruling is explicit, and the rule surfaces (charter rows, R6, the launcher's production paths) were read directly.

## Decision — 2026-10-10

- **Type:** 2 — Advance with Narrowing (owner ruling)
- **Decided:** Land the separation. Drop every Narrate listening and Narrate-only visual check, and record each as dropped, never as heard. Keep every automated Narrate case. R6 accepts `heardAudio.droppedBy === "owner-ruling-2026-10-10"`. The owner runs V1, S1, S2 and S4 on F personally. The R6 edit lands only after that launch closes, and is committed with V at F1.
- **Instruction:** Wait for the owner's V1/S1/S2/S4 entries in `os1-owner-observations.json`; then apply R6, assemble `live-qa.json`, validate, and run F1–F5 onto the current `origin/main`.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, fold-in 9 (registry row 7); packet `state.md` Decisions #31–#32
- **Lessons:** Provisional LL-<next> "Hear the baseline before automating parity for it", staged as fold-in 10
