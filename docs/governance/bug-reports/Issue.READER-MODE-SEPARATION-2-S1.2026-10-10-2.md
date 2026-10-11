# D6 full suite red at F1: three 10-second timeouts — READER-MODE-SEPARATION-2 (session S1m)

Date: 2026-10-10/11. F = `c9d73ddd`. Nothing committed; R6 applied in the working tree (Decision #32); `live-qa.json` written.

## 1. tl;dr

Every F1 row passes except D6's unedited `npm test`. In four full-suite runs tonight, three tests time out at the 10 s default. They pass alone. Tonight B0's own full suite also fails timing tests and runs three times slower than its recorded run.

## 2. Executive Summary

F1 on F:
- typecheck 0; D2 16/16; D3, D4 and D5 pass; build 0;
- `git diff --check I F` 0, and all 319 changed paths are inside `paths.json`;
- D7/D8 validator PASS (`--require-speed`); the declared speed tests pass 106/106;
- the B0 archive re-hashes 21/21 with 0 mismatches.

D6 requires an unedited `npm test` exit 0. Decision #25 counts any failure outside KF-1 and KF-2 as a real failure, so the executor may not relabel these timeouts. That ruling belongs to the owner.

## 3. Evidence of issue

Logs are in the session scratchpad `f1/` (paths are listed in state.md at F1).

| Run | Conditions | Result | Failing tests |
|---|---|---|---|
| 1 | on battery (15–24% earlier in the evening) | 2 failed / 3340 passed / 133 skipped, 52.7 s | `updateInstallGating` ×2 (timeout / "loading...") |
| 2 | sequential, after isolation runs | 2 / 3340 / 133, 58 s | the same two |
| 3 | AC; validator run concurrently by the executor | 3 / 3339 / 133, 57 s | the same two, plus `readerModeBoundaries` G1 "production mode graphs share only declared data and ports" (timeout) |
| 4 | AC, load 24%, nothing else from the executor | 3 / 3339 / 133, 38 s | the same three (all timeouts) |
| B0 tonight | `rms2-b0-checkout` @ 1e5485c6, same machine | 6 failed / 3052 passed, 60 s (recorded run: 0 failed, 19 s) | `updateInstallGating` ×2, perf p99, two tts7k/7l "instant start" timing tests, docx→epub |

- **In isolation:** `updateInstallGating` passed 5/5 on F and 5/5 on B0. G1 passed 16/16 in D2 (about 6.5 s of test time, against a 10 s limit).
- **Earlier on this machine:** S (`d0c58af4`) passed the full suite on 2026-10-09 (3290 passed), and so did the F′ dry run (3342 passed; Decision #29).
- **Untouched by the epic:** `tests/updateInstallGating.test.tsx` and `src/components/LibraryContainer.tsx` have no commits in I..F.
- **Power:** AC, Balanced scheme with the Best-performance overlay; the CPU reports its maximum clock.

## 4. Possible cause(s)

1. **Most likely:** machine-wide slowdown tonight (cause undiagnosed). B0's suite took 60 s against its recorded 19 s, and its timing tests fail too. All of F's failures are timeouts, none are assertions.
2. **Contributing:** G1, a test this epic introduced, needs about 6.5 s of a 10 s budget when run alone, so it has little headroom under load. That fragility is real and the epic's own.

## 5. Likely solution(s)

1. **Restore the machine and re-run, loosening nothing.** Reboot (or end the background load) and run unedited `npm test` once. The four failing runs stay on record. If it exits 0, D6 passes as chartered.
2. **Owner ruling, KF-3:** treat these three timeouts as environmental and record them like KF-1/KF-2. The supporting evidence is the B0 base red tonight, the isolation passes, and the earlier green full runs. This loosens D6, so only the owner can make it.
3. **Follow-up either way:** give G1's graph test an explicit timeout in a later item, or in a test-only F‴ under the Decision #29 precedent (production inputs unchanged). `updateInstallGating` is outside this epic.

## 6. Confidence in cause and solution identification (1–10)

7. The B0 comparison and the isolation passes point at the environment, but the slowdown's root cause is undiagnosed.

## Decision — 2026-10-11

- **Type:** 1b — Advance (owner ruling; loosens D6 by named exception)
- **Decided:** The owner ruled the three timeouts environmental: "Rule them environmental and finish the merge." KF-3 gets the KF-1/KF-2 treatment for exactly these node IDs:
  - `tests/updateInstallGating.test.tsx > update install gating > shows update-available as a passive library toast without install action`
  - `tests/updateInstallGating.test.tsx > update install gating > wires update-downloaded library banner to installUpdate`
  - `tests/readerModeBoundaries.test.ts > reader mode boundaries (G1) > production mode graphs share only declared data and ports`

  A KF-3 failure must be a 10 s timeout in a full-suite run, and the test must pass alone (G1 via D2, update gating standalone). Any other failing test, or a non-timeout failure in these, is a real failure. Every failing run is recorded. The rule applies to D6 at F1 and to F2 step 5.
- **Instruction:** Finish F1 (evidence, verified.md, commit V, push), then F2–F5 onto the current `origin/main`.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, fold-in 11 (registry row 8); packet `state.md` Decision #33
- **Lessons:** No new lesson. The KF pattern already exists (Decisions #11, #25); the G1 timeout headroom is a follow-up item.
