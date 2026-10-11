# READER-MODE-SEPARATION-2 — done

Completed 2026-10-11. Page, Focus, Flow and Narrate run as independent runtimes behind a thin router, with matching contracts, value-snapshot handoffs and stale-owner rejection. The old shared reader behaviour is unreachable, and each mode's baseline is preserved. The approved speed dialog is added.

| | |
|---|---|
| F (final candidate) | `c9d73dddc57a3ff19532d14baf76ae84e3c5f4b5` |
| V (F1 checkpoint) | `6891fbfdec3439975a60d6590246b4807fa8f75b` |
| Merge onto `origin/main` 41ef49de | `d96d2f3fcd1956591b2717e04ddb529d4d5c2dd8` |
| M (this commit) | the commit that adds this file |

## DoD evidence (from `verified.md`)

| Row | Result | Pointer |
|---|---|---|
| D1 | PASS, amended by #32 | `roadmap-reviews/reader-mode-separation-2/baseline.json` (admission PASS, observer Evan), `g0-owner-observations.json` |
| D2–D5 | PASS | `state.md` → Evidence → F1 (G1 16/16; contracts, routing and behaviour exit 0; baselines unchanged since c61bca67) |
| D6 | PASS with KF-3, by owner ruling #33 | `state.md` → Evidence → F1 (four recorded full runs; `Issue.READER-MODE-SEPARATION-2-S1.2026-10-10-2.md`) |
| D7 | PASS, amended by #32 | `live-qa.json`; `scripts/check_reader_mode_evidence.mjs --require-speed` PASS |
| D8 | PASS, amended by #32 | `live-qa.json → speedDialog`; declared speed tests 106/106; `os1-owner-observations.json` |
| D9 | PASS | `verification.json` (B0, I, S, F); B0 re-hash 21/21 |

F2 step 5 (`npm ci`, typecheck, test and build on the combined tree) runs after this commit. Its result is recorded in the untracked `finalization-log.md` and carried into the journal at F4, per `launch.md`.

## Known defects handed on

- **KD-CURSOR-LEAD** (Narrate cursor runs ahead of the voice) → NARRATE-HEARD-CURSOR-1. That item is now superseded in practice by the owner's Narrate rebuild ruling (#31).
- **KD-RATE-1.4-OVERLAP** (1.4x rate-change overlap or distortion) → NARRATE-APPLYRATECHANGE-COLLAPSE-1, with the same note.

## Follow-ups

1. **Narrate removal:** the first sprint after this merge (owner ruling #31). The narration rebuild is being storyboarded separately; first answer: "core done right".
2. **For `/roadmap-review`:** retire or replace NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1 and KOKORO-EXPORT-1. UX-POLISH-1 needs a fallback for a saved `narrate` mode. CLEANUP-MODE-BARREL-1 is unblocked.
3. **Test timeouts (KF-3, #33):** give the G1 graph test an explicit timeout; address the `updateInstallGating` timeout; diagnose the machine-wide suite slowdown of 2026-10-10.
4. **KF-2:** a Windows-safe rename retry in `main/sync-queue.js` (lane D, Decision #25).
5. **Intermittent Flow observation:** the band did not follow the word cursor once (owner, 2026-10-10). It did not reproduce. Triage it as a bug report.
6. **Registry:** allow `virtuoso` to write the time log in `closeOuts` (the time log was refused this session).
7. **`/pointer-closeout READER-MODE-SEPARATION-2`:** the Monday completion, the terminal record, staging fold-ins 1–11 and the lessons (including fold-in 10 and the GUI-automation candidate).
