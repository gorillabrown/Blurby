# Done — Rebuild Narrate with the cursor attached to the playing word (NARRATE-REBUILD-1)

**Completed:** 2026-10-15
**Code tip:** `eb/narrate-rebuild-1-p6` @ `4b12668c` (P6 base `05a5480a`, the P5 merge). This record is carried separately on `eb/narrate-rebuild-1-done`, cut from that tip, as the docs-only completion merge (launch.md → Completion protocol, step 4).
**Machines:**
- Reference run: the owner's Snapdragon X Elite, 12 cores, reference class. Blurby.Brain ran it on `0a6d9f8b`, 2026-10-15 04:50–05:23Z.
- P6b wave A: S6, the owner's machine, at `f8ceb098`.
- P6b wave B: Blurby.Brain, on the quiet machine (i7-1185G7, 4C/8T), at `f8ceb098`.
- Final-tree light checks: S7, at `4b12668c`.

## Where each row was last proven fresh

The completion protocol asks for every row to be run again in one session. After P6b, the rows were proven fresh on the P6b tree as follows. The only commits after `f8ceb098` are wave B's evidence merge (`8f56eab5`, two JSON records) and the epic documents (`4b12668c`). No code, configuration or test file changed.

- **D11, D14, D15:** wave A (`f8ceb098`). This includes the full suite, which contains the D4, D5, D7, D8 and D9 suites.
- **D2, D3, D5 in the app:** wave B (`f8ceb098`).
- **D6:** the Snapdragon reference run (`0a6d9f8b`). It is not re-run in P6b, by Brain's ruling. The final-main D3/D6 run before release covers it.
- **Light gates:** re-run by S7 on `4b12668c` (typecheck, D8 baselines, D10, the D15 grep, D13, and the D2 checker on the committed trace).

## Definition of Done

| # | Result | Evidence |
|---|--------|----------|
| D1 | PASS | `docs/studies/narrate-rebuild-1/phase0/VERDICT.md` holds parts (i)–(iii), P0-5 and the precision addendum. The G1 decisions are Decision #8–#14 (state.md Decision log). `p0-summary.mjs` exited 0 and `--break` exited 1, both on the reference run, and `p0-summary.mjs` exited 0 again in wave A |
| D2 | PASS: owner half at G2; trace half from wave B, checked by text | Owner pass: state.md → Evidence → "G2 — owner sign-off" (verbatim below). Trace: `docs/studies/narrate-rebuild-1/phase6/d2-ancient-crossing.p6b.json`. Launcher exit 0. `d2-crossing-check.cjs <trace> 2970 ancient 5480 HIS` exit 0, and `--break` exit 1 (wave B; re-checked by S7 on `4b12668c`). Brain's three checks: (1) the first voiced word is 2970 "ancient", 862 ms after Play. (2) Across 5480 "HIS FIRST BOOK", commits 5476–5484 follow the text order with nothing skipped, repeated or out of order, and no stop or hang at the boundary. The session continues 354 s past it, through 3,344 commits over 161 chunks (words 2970–6429). The only narrate-stop is "pause" at t ≈ 1,263 s, the 21-minute session end. (3) Timing is recorded for information only. The S5 failure at word 3217 (`phase5/d2-ancient-crossing.json`) is fixed by P6b, and that trace is now the checker's numbering control (exit 1) |
| D3 | PASS, on the P6b build | `docs/studies/narrate-rebuild-1/phase5/recorded-output.p6b-1.json` (wave B). Launcher 0, check 0, `--break` 1. At 1.00x: 5.04 min, 802 commits, 0 outside one frame, mapping 0.64 ms. At 2.00x: 5.03 min, 1,513 commits, 0 outside, 0.65 ms |
| D4 | PASS | `npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts` exit 0 (wave A G13). The structural and negative-control suites hold their positive controls (P3 gate) |
| D5 | PASS | The same suites exit 0 (R6/R7, coalescing, the stale bound). The D3 log of the P6b sessions shows 0 overlaps, 0 drops and 0 repeats at both rates |
| D6 | PASS, by Brain's ruling under Decision #22 | Reference row, from `phase5/latency-e2e.completion-2-reference.json`. Warm worst at 1.00x: play 1,116, resume 93, click 997, speed 1,226 ms. At 2.00x: 714, 97, 577, 686 ms. All < 2,000. Cold at 1.00x: 711, 226, 1,556, 687 ms. At 2.00x: 436, 96, 678, 441 ms. All < 8,000. Cold click counted 5 of 5 at each rate. Mainstream row, from `phase5/latency-e2e.completion-1.json` (`512a0b19`). Warm worst: play 1,184, resume 2,334, click 2,065, speed 2,215 ms. All < 2,500. Cold at 1.00x: play 1,780, resume 1,307, speed 1,608 ms. Cold click on mainstream is unmeasured (NARRATE-HARNESS-COLDCLICK-1). D6 is re-run with D3 on final main before release |
| D7 | PASS | The P4 suites, plus `tests/narrate/narrate.mode.test.ts` "an F4 pause mid-session shows F4's notice, not Voice loading": it passes, and fails with `ModeRuntime.ts`'s failure branch of `getNotice` removed (wave A). Owner-observed F5 at G2 |
| D8 | PASS | Wave A: the D8 suites pass inside the full suite. S7 on `4b12668c`: `git diff --exit-code 05a5480a -- <page, focus, flow baselines>` exit 0. The reference run: suites 0, baselines 0 |
| D9 | PASS | `tests/settingsNarrateNormalization.test.js` and `tests/settingsMigrationV13.test.js` pass. They ran in wave A's full suite and alone in S5 (2 files, 15 tests). The rewrite is named in the P4 close-out |
| D10 | PASS | S7 on `4b12668c`: `git grep -n -l -P '_alignWordsToTimestamps\|computeWordTimestamps' -- src main scripts patches ':!scripts/narrate-rebuild/epic-window.ps1'` exit 1, empty output |
| D11 | PASS | Wave A on `f8ceb098`: `npm test` exit 0 (172 files, 2,356 passed / 1 skipped / 0 failed), `npm run typecheck` 0, `npm run build` 0. Wave B: `npm ci` 0, build 0. S7 on `4b12668c`: `npm run typecheck` 0 |
| D12 | PASS | G2 owner sign-off, 2026-10-14 (verbatim below) |
| D13 | PASS for P1–P5. P6 lands through its one `--no-ff` merge of `4b12668c`; this record follows as the docs-only merge | `git log --merges --first-parent origin/main` lists exactly 5 epic merges: `7bbf6b20`, `d81aeb4b`, `ef245815`, `331f8313`, `05a5480a`. Each phase trailer equals its first commit's parent. P6's base is verified by parent equality: `a06e05ba^` = `05a5480a`. The register is closed only by `/pointer-closeout` |
| D14 | PASS | Wave A through `app-node.ps1`, with records in `docs/studies/narrate-rebuild-1/phase6/reconcile-*.txt`. `--check-tokenizer` 0. `--gate` 0, with 0 failing closed of 3,683 chunks. `--gate --control` 1, with 127 failing closed. `--gate --from 2970 --to 6700` 0, with 0 of 172. `--changed` 0: 36 changed tables, each replacing a wrong split unit over the 0.5 limit. `--changed --break` 1. `--owner` 0 over 8 copies: 21 of 11,030 chunks, which are 18 token-cap chunks (class E, NARRATE-TOKEN-CAP-1) and 3 copies of the one residual Brain ruled on (NARRATE-RECONCILE-RESIDUAL-1). The reconcile, chunk-plan and fixtures suites exit 0, and each case was first seen failing on `2b78f1ca` |
| D15 | PASS | `npx vitest run tests/narrate/narrate.appIcu.test.js` exit 0. The four checkers refuse plain Node (exit 3, `refused: plain Node`) (wave A). S7 on `4b12668c`: `git grep -L -e app-icu-guard -e assertAppIcu -- <epic scripts>` exit 1, empty output. The `p5-latency-e2e.mjs` position comment names THE SECOND BOOK as app word 9431 |

### G2 authority (owner, 2026-10-14, verbatim)

"All approved:
- D12: you listen to the narration and sign off that it sounds right.
- D2: you watch narration on Meditations (check F2) and confirm it works.
- D7 F5: a second check you watch yourself."

### Decision #22, the two D6 rows

- **Reference class** (the owner's 12-core Snapdragon, or 8+ physical cores): ≤ 2 s warm and ≤ 8 s cold.
- **Mainstream class** (4 physical cores / 8 threads, such as the quiet machine's i7-1185G7): ≤ 2.5 s warm and ≤ 8 s cold. Cold click on mainstream hardware stays unmeasured until NARRATE-HARNESS-COLDCLICK-1; until then, cold click is judged on the reference run only.

The owner, verbatim: "Agreed. Also fine relaxing the speed, as many computers will be like the quiet computer that runs the app."

### Blurby.Brain's D6 ruling (verbatim)

"The launcher exited 1, and that is NOT a D6 failure. Its only listed failure is "cold click 1.00 trial 2: the first voiced sample answered play, not the click". That trial was not counted and was replaced by trial 6, which counted. This is the known attribution defect filed as NARRATE-HARNESS-COLDCLICK-1. The charter's launcher pass conditions (every counting warm under 2,000 ms, every cold under 8,000 ms, every session PASS) all hold. I rule D6 met on this evidence; record that ruling in done.md with this paragraph."

### P6b wave B (Blurby.Brain, 2026-10-15)

- **Machine and evidence.** The quiet machine (i7-1185G7, 4C/8T) ran on `f8ceb098`, with `npm ci` 0 and build 0. The evidence branch `eb/narrate-rebuild-1-p6b-quiet-evidence` @ `19222f48` (parent `f8ceb098`) adds only `phase5/recorded-output.p6b-1.json` and `phase6/d2-ancient-crossing.p6b.json`; it is merged into P6 as `8f56eab5`. Logs are in `G:\My Drive\Blurby-transfer\p6b-waveB\` (`exits.txt`). A run with a NaN rate was discarded; it is kept only there, labelled.
- **B0 smoke:** exit 0, accepted. An Electron-started app produced 156 commits plus the page-to-Narrate handoff. plan.md's B0 expected exit is corrected to "0 or 1; the requirement is an Electron-started app with commits", because `p5-latency-e2e.mjs:153` passes minMinutes = `--minutes`.
- **B1, D3/D5:** launcher 0, check 0, `--break` 1.
  - 1.00x PASS: 5.04 min, 802 commits, 0 outside one frame, mapping 0.64 ms, 0 overlaps, drops or repeats.
  - 2.00x PASS: 5.03 min, 1,513 commits, 0 outside, 0.65 ms, 0 overlaps, drops or repeats.
- **B2, D2:** launcher 0, `d2-crossing-check` 0, `--break` 1, with ICU 77.1 and bookWords 80,493.
  - The first voiced word is index 2970 "ancient", 862 ms after Play.
  - The crossing at 5480 "HIS FIRST BOOK" commits 5476–5484 in order and continues 354 s past it.
  - The session made 3,344 commits over 161 chunks, words 2970–6429. Its only narrate-stop is "pause" at t ≈ 1,263 s, the 21-minute session end, not a stall.
- **Foreign CPU** was 6.1–14.3 % per run.
- **Why that machine is valid.** Wave B ran there at the owner's direction. D2 (a correctness check by text) and D3/D5 (within one frame, plus overlaps and drops) are not hardware-tiered. D6 stands on the 2026-10-15 Snapdragon reference run under Decision #22, and is re-run with D3 on final main before release.
- **Ruling.** D2 is met by text and by trace, beside the G2 owner pass, and D3/D5 hold on the P6b tables.

## Caveats and loose ends

- **Both latency files say `verdict: FAIL`, and both are superseded.**
  - `phase5/latency-e2e.completion-2-reference.json` (Snapdragon): its only failure is the cold-click trial 2 attribution, which is not counted. Brain's D6 ruling above covers it.
  - `phase5/latency-e2e.completion-1.json` (quiet laptop): it was judged against the single 2,000 ms warm bar that applied before Decision #22, and it lists 40 of 40 unattributed cold-click trials. Under Decision #22's mainstream row, its warm worst (2,334 ms) is under 2,500 ms, and cold click is judged on the reference run only.
- **`p3-producer-check.mjs`, accepted with a note.** Under the app's Electron it prints `pass:true`, with every required check true, but the process exits 0x40000015 (1073741845) at shutdown. This happened twice in wave A, while the base script under plain Node exits 0, and `--break` exits 1. It is a native abort at process exit, not a check failure. The fence allowed only the guard line in that script, so it is accepted and filed as NARRATE-EXIT-CRASH-1.
- **P0-3** is a recorded FAIL where it was conclusive: an engine property, and the owner continued on Kokoro (Decision #12). D1 records the verdict; it does not claim acoustic accuracy.
- **origin/main at completion** (`bd6af475`) carries FOLDER-NOTICE-1 product code that is not merged into the P6 tip. It shares no file with P6's diff, and `git merge-tree` reports no conflict. The P6 merge on main is the first tree that holds both, and the final-main D3/D6 run before release covers it.
- **Owner-library residual.** 21 of 11,030 chunks across the owner's 8 copies still fail closed: 18 token-cap chunks and 3 copies of the one ruled residual. Each pauses on the last exactly-timed word (F4), never guesses.

## Recommended follow-ups

- **NARRATE-HARNESS-COLDCLICK-1:** the cold-click trial's first voiced sample can answer Play instead of the click.
- **NARRATE-CPU-PROFILE-1:** Blurby's CPU share during narration on mainstream hardware.
- **NARRATE-YEARS-1:** years are read as cardinals (BUG-191).
- **NARRATE-SENTENCE-RESUME-1.**
- **NARRATE-TOKEN-CAP-1:** chunks over the token cap fail closed (class E; 18 of 11,030 on the owner's library).
- **NARRATE-RECONCILE-RESIDUAL-1:** the one reconciliation residual Brain ruled on (`4e7915ce2410e10e`).
- **NARRATE-EXIT-CRASH-1:** the 0x40000015 abort at process exit under Electron-as-Node (`p3-producer-check.mjs`), plus the owner smoke for quitting with Narrate playing and paused.
- **NARRATE-TRACE-LABELS-1:** legacy trace labels, and the harness reporting a NaN rate as PASS (`--rates` validation).
- **WORD-INDEX-UNIFY-1:** one word numbering. The app's numbering differs from the offline extractor's, for example "ancient" is 2970 in the app and 2963 offline.
- **The FoliateView key forwarder drops `repeat`:** `src/reader/modes/narrate/FoliateView.tsx:931-936` builds the forwarded `KeyboardEvent` without `repeat: ke.repeat`, so held keys arrive as fresh presses.
