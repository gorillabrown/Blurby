# Owner gate B1 blocks every open front — READER-MODE-SEPARATION-2 (session S1)

Date: 2026-10-09. Branch `eb/reader-mode-separation-2` @ `2759413f`.

## 1. tl;dr

The G0 owner half (heard audio on the immutable baseline B0) is unanswered. The pre-G0 rule "no `src/` change before G0 passes" therefore blocks every remaining front. The owner has now directed: "You make decisions … advance with recommendations. Iterate until the entire epic is complete."

## 2. Executive Summary

All automatable G0 evidence exists:
- isolated-launch PASS;
- Flow classification PASS;
- the full transition and same-mode matrix on the EPUB and the converted non-EPUB;
- census;
- G4 fixtures.

The only missing G0 item is the owner's listening observation against B0. The executor cannot produce it: charter D1 names an observer, and charter D7 requires the owner's heard-audio observation. The 2026-10-09 amendment item 4 forbids `src/` edits until G0 passes, so Waves B–E, the speed dialog and finalization are all idle.

## 3. Evidence of issue

- `state.md` B1: `Answer:` slot empty.
- `g0-owner-observations.json`: 0 of 11 items filled, observer blank.
- Front table F1–F17: every open front is BLOCKED on B1.
- B0 is archived, byte-identical to the 2026-09-23 build (`admission/baseline-build-rebuild.json`), immutable, and re-launchable on demand (`admission/owner-launch.ps1`).

## 4. Possible cause(s)

1. The pre-G0 rule assumed the owner would be present at admission. In an unattended run, the listening step serializes the whole epic behind one human action.
2. The rule protects a real risk: extracting before a baseline exists. Here that risk is already covered, because the baseline build is frozen and every non-audio baseline fact is recorded.

## 5. Likely solution(s)

1. Re-sequence. Start Wave B now with the automated G0 evidence as admission. Take the owner's B0 listening observation later, in one combined owner session with the G6 candidate listening check and the speed-dialog check, before final verification. D1 and D7 stay owner-required.
2. Keep waiting for the owner.

## 6. Confidence in cause and solution identification (1–10)

9. The facts are mechanical: the blocker, the frozen baseline, and the owner's direction.

## Decision — 2026-10-09

- **Type:** 3 — Pivot Advance (owner-directed)
- **Decided:** Start Waves B–E and the speed dialog now on the G0 automated evidence. Take the owner's B0 listening observation in one combined owner session (OS-1) with G6 and the speed-dialog check before F1. D1 and D7 stay owner-required; nothing publishes before them.
- **Instruction:** Lift the pre-G0 `src/` freeze, transition Monday to In Flight, and begin Wave B (contracts/ports, then Page, then Focus) per staging fold-ins 3 and 6.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, fold-in 6 (registry row 5)
- **Lessons:** No new lesson. The provisional fold-in 4 already covers spec-cutting; the owner-gate sequencing is project-specific.
