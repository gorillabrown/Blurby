# NARRATE-PAUSE-CANCEL-1 — Pause cancels the queued prefetch (RodneySr, 2026-10-30)

**Outcome:** pressing Pause in Narrate cancels the engine's own not-yet-started generations in main, so no generation is posted after the press, and resume regenerates the cancelled chunk from its first word.

**Spec:** `docs/planning/specs/2026-10-30/NARRATE-PAUSE-CANCEL-1.md` on `origin/main` @ `84c0ad44`, with its Mid-Dispatch Amendment (D6 gate after BUG-237).

**Host:** RodneySr (x64; standing rule 53's temporary placement). Base and after share the machine, recipe, harness and arguments (LL-152).

**Commits on `eb/narrate-pause-cancel-1`** (cut from `origin/eb/narrate-quit-linger-1` @ `5de476ce`):
- `30216818`: red tests, committed alone.
- `53adf994`: the fix.
- `cf093ab7`: `origin/main` `4a1b7aa5` merged (clean; no code or dependency change).
- `c4b79abb`: census declares `NARRATE_CANCELLED_ERROR` for the Narrate root. **Fence amended by Brain ruling: census declaration** (standing rule 50; the `readerModeBoundaries` G1 test is red on `cf093ab7`, 1 failed / 6 passed, and green on `c4b79abb`, 7/7).
- Then this memo, BUG-207 and the governance memo, and a final `origin/main` merge.

**Live profile:** `%APPDATA%\blurby\blurby-data\library.json` `5917eefc…` and `settings.json` `ec99be2b…`, unchanged across every run below.

**Raw data:** `C:\Projects\Blurby-artifacts\narrate-pause-cancel-1\` (`S-base\`, `S-after\`, `d6-base\`, `d6-base-run1\`, `d6-after\`, `gaps-*.json`, `gaps-break\`, `rule53-x64-25s\`, `red.*`, `check-*.txt`).

## Red (standing rule 43)

`npx vitest run tests/narrate/narrate.pauseCancel.test.ts tests/narrate/narrate.cancelIpc.test.js tests/narrate/narrate.producerPool.test.js` on `30216818` exits 1 (`red.json`, `red.log`):

| Test | Result on the red commit | First failure line |
|---|---|---|
| (e1) pause asks the producer to cancel this engine's queued jobs | failed | expected "vi.fn()" to be called 1 times, but got 0 times |
| (e2) a cancelled prefetch rewinds, and the resume regenerates it | failed | expected [ { kind: 'F4', … } ] to deeply equal [] |
| (e3) a chunk that arrived while paused is kept (control) | passed | — |
| (e4) any other producer error is still F4 (control) | passed | — |
| (k1) the cancel error is one string in main and renderer | failed | expected undefined to be 'narrate generation cancelled' |
| (i1) narrate-cancel-queued forwards only a non-empty string prefix | failed | expected false to be true |
| (i2) a cancelled generation is returned as an error but not logged | failed | expected "error" to not be called at all, but actually been called 1 times |
| (i3) any other generate failure is still logged (control) | passed | — |
| (p1) cancelQueued removes only the queued jobs of the prefix | failed | expected 'undefined' to be 'function' |
| (p2) a request of a new group still supersedes a queued prefetch (control) | passed | — |

**One-fix change, (e3):** the run was extended from the spec's 0.5 s to `run(h, 3)` (3 s). At 200 ms a word, word 12 plays about 2.4 s in, so 0.5 s never reached it and the control failed on the tip for the run length alone. Blurby.Brain accepted it under the one-fix rule.

## (S) Staged pause, base against after

`quit-linger.mjs --only S --runs-staged 3`, checked by `check-s.cjs` (the R2 pass rule), byte-identical harness on both sides. Base: `5de476ce` x64 `--dir`. After: `cf093ab7` x64 `--dir` (code identical to `53adf994` and `c4b79abb`).

| Run | Side | pressToCancelMs | cancelRemoved | Posts after press (dtPressMs) | raceWindow | lingerS | Verdict |
|---|---|---|---|---|---|---|---|
| L-staged-1 | base | — (no cancel line) | — | 1 (+768 ms) | 0 | 3.06 | FAIL |
| L-staged-2 | base | — | — | 1 (+449 ms) | 0 | 2.53 | FAIL |
| L-staged-3 | base | — | — | 1 (+550 ms) | 0 | 1.73 | FAIL |
| L-staged-1 | after | 22 | 1 | 0 | 0 | 0.95 | pass |
| L-staged-2 | after | 13 | 1 | 0 | 0 | 1.17 | pass |
| L-staged-3 | after | 24 | 1 | 0 | 0 | 0.90 | pass |

Base: **3 of 3** runs post a queued prefetch after the press (`{"runs":3,"failRuns":3,"verdict":"FAIL"}`). After: **0 of 3** (`{"runs":3,"failRuns":0,"verdict":"PASS"}`). Every staged condition held (running 1, pending 2, queued 1), and every exit code was 0.

## D6 (amended gate) and T2-2

`run-d6.ps1` runs `p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0` on each tree, from the after memo's exact command. Foreign CPU stayed ≤ 25 % on every counting trial.

| Side | Rate | Trials | Worst resume (run, word) | Speed |
|---|---|---|---|---|
| base | 1.00 | 20 | 93 ms (warm-1.00, 5570) | 2142 ms |
| base | 2.00 | 22 | **2354 ms (warm-2.00-3, 8748): the excepted trial**; others ≤ 93 ms | 1525 ms |
| after | 1.00 | 22 | 92 ms (warm-1.00, 5611) | 1784 ms |
| after | 2.00 | 21 | 96 ms (warm-2.00-2, 8732) | 1494 ms |

- **Base** (`check-d6.cjs <base>`): PASS (exit 0). The excepted trial is warm-2.00-3, word 8748, 2354 ms; base run 1 (`d6-base-run1\`) gave 2348 ms on the same word, so it is deterministic.
- **After** (`p5-latency-e2e.mjs`): exit 0, `failures: []`.
- **Compare** (`check-d6.cjs <base> <after>`): literal exit **1**, verdict FAIL, because the after side has no warm-2.00-3 run (`"except":null`, countingPerRate 22 / 21). **Ruling (a), Blurby.Brain, 2026-10-30:** when the excepted run is absent on the after side, the compare passes, because every after resume counts and is under 2,000 ms, which is strictly stronger than base + 150 ms. **warm-2.00-3 not reached after: 21 counting resumes in two runs; after worst 96 ms (warm-2.00-2, word 8732).**
- **BUG-237 is the excepted trial's cause** (base `d6-base\traces\warm-2-00-3.trace.json`): the pause lands at ctx 2.7369 s, 34 ms before chunk 8730–8748 starts (startAt 2.7713). The resume requests word 8748, so words 8730–8747 are skipped, and the new chunk is scheduled at 6.0963 s, the stopped chunk's endAt: 2292.8 ms of silence. The fix is NARRATE-GAP-PAUSE-1. The D6 logs hold no producer lines (`NARRATE_PRODUCER_LOG` was unset; later D6 runs set it).
- **F-009 overs:** speed latencies are over budget on both sides (base 1.00: 2142 ms; others 1494–1784 ms). They are F-009's known speed path, not this item's, and are recorded only.
- **T2-2 (`--gaps`):** 0 gaps on both sides (base resumes 20 / 22, after 22 / 21; checker exits 0). The planted control (`gaps-break\traces\planted.trace.json`) is flagged: count 1, gapS 0.2.

## Gates

- `npm test` on `c4b79abb`: **183 files passed, 2,466 tests passed, 1 skipped, 0 failed** (`after-npm-test-2.log`). The first run on `cf093ab7` failed only G1, before the census line (`after-npm-test.log`).
- Collected set: `vitest-files-after.txt` against `vitest-files-base.txt` (181 → 183) adds exactly `tests/narrate/narrate.cancelIpc.test.js` and `tests/narrate/narrate.pauseCancel.test.ts`, and removes none.
- `npm run typecheck` 0; `npm run build` 0; x64 and arm64 `--dir` 0.
- Fence: `git diff --name-only 4a1b7aa5 c4b79abb` lists the 13 item paths' code and test subset, NARRATE-QUIT-LINGER-1's 6 paths and the census file. The forbidden list (`main.js`, `producer-worker.js`, `src/types.ts`, `ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, Page, Focus, Flow, `src/test-harness`) prints nothing. `git diff --quiet 5de476ce HEAD -- main/quit-sequence.js tests/quitSequence.test.js` exits 0.

## Package verification (standing rule 53, temporary placement)

- x64 and arm64 `--dir` from `cf093ab7` (`release\`): both `app.asar` SHA-256 `F961A79C62C8D1DC6B20318C2905DFEE637667A157C4A1A41DCF6DFD10DB975A`. Pair check: `0`.
- `c4b79abb` changes no packaged file (`git diff --name-only cf093ab7 c4b79abb -- main.js preload.js main dist assets/icon.ico assets/tray-icon.png src` is empty), so the package is unchanged.
- `BLURBY_USER_DATA_DIR` in the asar: `True`.
- The asar's `main\ipc\narrate.js`, `main\narrate\constants.js`, `main\narrate\producer.js` and `preload.js` are byte-identical to source; `dist\` has 0 differences.
- 25 s x64 scratch launch (`rule53-x64-25s\receipt.json`): proof `scratch: true`, pid matches, alive after the script, no `error.log` written, no crash dump, live hashes unchanged. Known noise: BUG-217's `Backup failed … ENOENT` line only.
- The arm64 launch is deferred to merge (R-2026-10-30-2): package-verified (x64, RodneySr); arm64 launch at merge.
- Blurby.Brain confirmed the package on 2026-10-30.

## Owner check

**(o1)**, for release gate (2)'s batched owner smoke list: "In Narrate, pause for about 5 s mid-paragraph, then resume. By ear, speech continues from the paused word with no repeat, skip or new silence."
