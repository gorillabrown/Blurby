# NARRATE-GAP-PAUSE-1 — A pause in the gap before a scheduled chunk resumes on that chunk (RodneySr, 2026-10-30)

**Outcome:** pausing Narrate in the silence just before a scheduled chunk no longer skips that chunk. Resume starts on the chunk's first word, at now + lead, instead of jumping to the next chunk after about 2.3 s of silence (BUG-237).

**Spec:** NARRATE-GAP-PAUSE-1 (Blurby.Brain1, 2026-10-30), from BUG-237's "Next" and rulings Q1–Q4.

**Host:** RodneySr (x64; standing rule 53's temporary placement). Base and after share the machine, recipe, harness and arguments (LL-152).

**Base (Brain ruling (a)):** `e1d0da2b`, the tip of `eb/narrate-pause-cancel-1`. It ships the bytes verified for `cf093ab7`/`c4b79abb` (F961A79C…B975A). `82eb47a7`, `a4679bd4` and `e1d0da2b` change nothing under `build.files`, `src`, `tests`, `scripts` or the harness: `git diff --name-only c4b79abb e1d0da2b -- <build.files> src tests scripts` prints nothing.

**Commits on `eb/narrate-gap-pause-1`:**
- `473c8716`: the red tests, committed alone.
- `5d51d111`: the fix (`narrateEngine.ts` only).
- `5f09224a`: `origin/main` `8d2db00b` merged. It is docs only: `ROADMAP.md`, `BUG_REPORT.md`, the work-register snapshot, two recovery files and the register-mutations file. The merge was clean. It came before this record, not after it as the spec's commit order says, because main moved while the gates were due.
- Then this memo, BUG-237's line, the governance memo and the time log.

**Raw data:** `C:\Projects\Blurby-artifacts\narrate-gap-pause-1\`: `check-skip.cjs` and `check-d6-gap.cjs` (saved verbatim from the spec), `check-skip-base.txt`, `check-skip-after.txt`, `check-d6-gap.txt`, `d6-base\`, `d6-base-latency-e2e.json`, `d6-after\`, `d6-after-latency-e2e.json`, `d6-after.log`, `d6-after.meta.txt`, `red.*`, `npm-test-after.log`, `typecheck-after.log`, `build-final.log`, `vitest-files-*.txt`, and the rule 53 folders.

## Cause (BUG-237, read at the base)

- `pause()` resolved a gap pause through `nextScheduledPause()`. It compared `c.startAt` with `output.now()`, the scheduling head. The heard position lags that head by the output latency, so a pause the listener hears 34 ms before a chunk is already past the chunk's start on the head. The test failed, `pausedAt` was null, and resume requested from `nextWord`, skipping the scheduled chunk.
- `onResult()` timed the next chunk from `prev.endAt`, even when `prev` was the chunk the pause had stopped. That left the first chunk after a resume waiting in a stale future slot.

## Fix (`5d51d111`, `src/reader/modes/narrate/engine/narrateEngine.ts`)

- `pause()` passes the heard `now` to `nextScheduledPause(now)`. The function no longer reads its own `output.now()`, so the position and the scheduled-chunk test use one clock. Its doc line, moved from above `firstUnscheduled`, reads "Paused in a gap: resume from the first chunk not yet started, at its trim, on the heard clock (BUG-237)."
- `onResult()` takes `prev` as the timing predecessor only while its source is live: `const last = this.chunks.at(-2); const prev = last && last.source !== null ? last : undefined;`. The first chunk after a resume therefore starts at now + lead.

## Red (standing rule 43)

`npx vitest run tests/narrate/narrate.gapPause.test.ts` on `473c8716` exits 1 (`red.json`, `red.log`, `red-try.log`); `npm run typecheck` exits 0 (`typecheck-red.log`).

| Test | Result on the red commit | First failure line |
|---|---|---|
| (g1) a pause 34 ms before a scheduled chunk resumes on that chunk | failed | a source is scheduled after the resume: expected undefined to be defined |
| (g2) the first chunk after the resume starts at now + lead, not at the stopped chunk's end | failed | a source is scheduled after the resume: expected undefined to be defined |
| (g3) no word of the chunk is skipped (by text, LL-161) | failed | expected undefined to be 12 |
| (c1) a pause mid-chunk resumes at the paused unit (control) | passed | — |
| (c2) a pause with no chunk scheduled restarts like a Play (control) | passed | — |
| (c3) zero latency: the existing gap behaviour is unchanged (control) | passed | — |
| (c4) contiguous chunks without a pause still abut (control) | passed | — |

**One test-only repair (F-red round 1, accepted by Brain):** (g2)'s first run on the base failed by a TypeError, not an assertion. Chunk B (words 12–41) is the fixture's last chunk. On the base, resume requests past the end, skips B and completes, so no source is ever scheduled and `next.startAt` threw. (g1) and (g2) now assert `next` is defined first, so the base fails by assertion. No expectation changed.

The heard-clock lag is modelled by `LatentOutput`, whose `playbackPosition()` is `now() − 0.1 s`. The stock fake sets heard equal to head, which hides BUG-237 (LL-173). (c3) is the zero-lag control.

After the fix, `tests/narrate` passes, 24 files and 144 tests, and the ownership and isolation suites pass (`narrate-suites.log`, `ownership.log`).

## D6 (Done-when 6)

**Base (ruling Q4):** NARRATE-PAUSE-CANCEL-1's after D6 was measured on the same bytes as `$BASE`, so it is reused as the base: `d6-base-latency-e2e.json` and `d6-base\traces`. No fresh base D6 was run.

`check-skip` on the base evidence (`narrate-pause-cancel-1\d6-base\traces`, `5de476ce`) exits 1. It flags warm-2-00-3: lastCommitWord 8729, expectedWord 8730, requestWord 8748, skippedWords 18, gap true. That is BUG-237 (`check-skip-base.txt`).

**After:** `app-node.ps1 p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0` on `5d51d111` with `NARRATE_PRODUCER_LOG=1` exits 0, and the report's verdict is PASS. Its runs were warm-1.00 (20 cycles), warm-1.00-2 (4), warm-1.00-3 (1), warm-2.00 (20) and warm-2.00-2 (2).

- **No skipped words:** `check-skip` on `d6-after\traces` exits 0: resumesTotal 47, flagged 0, gapPauses 1, PASS. The gap pause recurred naturally: warm-2.00, lastCommitWord 5567, expectedWord 5568, gap true, requestWord 5568, skippedWords 0. No re-run was needed (ruling Q2 not invoked).
- **The target row, ruling (a) by Blurby.Brain1:** `check-d6-gap` exits **1** literally. Its first row is `{"run":"warm-2.00-3","trials":[],"targetOk":false}`. "warm-2.00-3" is the harness's top-up run label, not a property of the defect, and no after run carried it. Brain ruled that the live gap pause is the target: warm-2.00, word 5568, a 86 ms resume, inside the ≤ 150 ms normal class (ruling Q1). On the base, the same case skipped 18 words and resumed after about 2.3 s of silence.
- **No regression:** every per-type row is ok, 0 trials over the 2,000 ms budget, and every after worst is within base + 150 ms (worst latencies, after / base reference, ms):

| Rate | play | resume | click | speed |
|---|---|---|---|---|
| 1.00x | 1224 / 1142 | 92 / 92 | 1767 / 1780 | 1902 / 1784 |
| 2.00x | 626 / 631 | 91 / 96 | 1129 / 1300 | 1375 / 1494 |

Every resume at both rates took 82–92 ms.

## Gates (Done-when 7)

See the governance memo for the gate results, the collected-set check and package verification.
