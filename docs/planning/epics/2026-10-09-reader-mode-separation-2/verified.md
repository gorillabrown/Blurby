# READER-MODE-SEPARATION-2 — verified (F1)

Date: 2026-10-11 (session S1m). Every charter DoD row was re-run fresh on F. Full outputs: `state.md` → Evidence → "F1 — 2026-10-11".

| Identity | Commit / artifact |
|---|---|
| B0 | `1e5485c66e547392e7752240df71700267e8ede7`, archive `C:\Projects\Blurby-artifacts\rms2-baseline-build` (re-hash 21/21) |
| I | `92dda255bfad4395600a4371f0406f0f55c92899` |
| S | `d0c58af41fa1e73cc77928106dbcb9d93b2591a3` |
| F | `c9d73dddc57a3ff19532d14baf76ae84e3c5f4b5`, archive `C:\Projects\Blurby-artifacts\rms2-candidate-c9d73dddc57a` (dist manifest `fbe3ff98…`) |

| Row | Result | Evidence |
|---|---|---|
| D1 G0 admission vs B0 | PASS (amended, #32) | `baseline.json` admission PASS, observer Evan; `g0-owner-observations.json` (H1–H6; H7, H8, V2, V3 dropped by owner ruling) |
| D2 G1 boundaries | PASS | 16/16 |
| D3 G2 contracts (4 modes) | PASS | exit 0 |
| D4 G3 routing/concurrency | PASS | exit 0 |
| D5 G4 behaviour baselines | PASS | exit 0; baselines unchanged since c61bca67 |
| D6 G5 build and regression | PASS with KF-3 (#33) | typecheck 0, build 0, diff-check 0, 319/319 paths registered. `npm test`: only the three KF-3 timeouts, in 4 recorded runs |
| D7 G6 live UI and audio | PASS (amended, #32) | validator PASS; `live-qa.json` 54/54; the 26 Narrate audio cases are dropped by owner ruling, never heard |
| D8 speed dialog | PASS (amended, #32) | validator `--require-speed` PASS; speed tests 106/106; owner S1, S2; S4 is automated proof, owner-accepted |
| D9 identities and evidence | PASS | `verification.json` B0/I/S/F; B0 re-hash clean |

## Caveats

- **Narrate audio was never heard on F.** The owner ruled Narrate be removed and rebuilt (Decision #31). Its listening checks were dropped, not passed (#32). Narrate removal is the first sprint after this merge.
- **D6 rests on owner ruling KF-3 (#33).** The three tests that time out in full-suite runs pass alone, and B0 failed the same class of tests the same night. Follow-ups:
  - give the G1 graph test an explicit timeout;
  - fix the `updateInstallGating` timeout;
  - diagnose the machine-wide slowdown.
- **V1 has no B0 baseline;** on F it works (owner).
- **The owner saw Flow's band lag once;** it did not reproduce on a re-check. It is logged as intermittent, for triage.
- **Known defects carried forward:**
  - KD-CURSOR-LEAD and KD-RATE-1.4-OVERLAP (moot under the Narrate rebuild).
  - The #28a underrun fix is a deliberate improvement over B0.
