# NARRATE-REBUILD-1 P5, row 57: root cause of the D3/D5 drops (read-only)

Verdict: COMPLETE for the drop mechanism (engine) and for what lines up with the long frames (the reader view). NOT RESOLVED for what *triggers* the view's section reloads, and for why the launch-3 frame lasted 1.29 s. What would settle both is at the end.

Clock mapping used throughout: in each trace, renderer `performance.now()` plus a constant gives epoch ms (launch-3: +1791935824900.0, checked against the schedule `hops.requested` field; launch-2: +1791935604430). Each commit's `ts` is the main-process receipt time, so it can be compared with the epoch-stamped `[narrate-producer]` log lines.

## 1. Why one unit goes unpublished (common to both failures)

`src/reader/modes/narrate/engine/narrateEngine.ts`:
- `tick()` (lines 310-330) calls `this.position(now)` once. Then `word = c.entry.startWord + c.unitWord[pos.unit]`, and `this.publish(word)` is called once.
- `position()` (458-468) returns one unit: `lookupUnit(c.table.units, sample)` (`wordTable.ts:94-101`), which is the last unit whose `sampleStart <= sample`.
- `publish()` (500-505) compares the word only with `this.cursor`.

Nothing records which unit was published last, so nothing knows which units lie between it and the current one. When a single frame carries the playback sample over one or more whole units, the next tick publishes only the unit at the current sample. The units passed over never get `onCursor` and never get a `narrate-commit` record. The check counts those as drops (`p5-recorded-output-check.mjs` lines 120-132). The engine is behaving as written. The defect is that it has no catch-up for missed units.

Trace evidence:
- **A** (launch-2): 8735 is committed at t=7246.8. The next tick is at t=7437.5, with frameDt 190.7 equal to the gap. That tick lands in unit 7 (8737), 2.9 ms after its boundary. Unit 6 (8736) is 125 ms long and sat entirely inside the frame (2.397 to 2.522 s on the playback clock).
- **B** (T7): the same chain. The gap after 8735 is 246.9 ms and the commit is 8737, 60.5 ms late.
- **C** (launch-3): 8954 is committed at t=88726.4. One normal tick follows at about 88745.0. The next tick is at t=90037.1 (frameDt 1292.1) and lands in unit 20 (8957). Units 8955 (200 ms) and 8956 (150 ms) are never committed.

## 2. Failure 1: a 190-247 ms frame at word 8736, at 2.00x, in both runs

**Cause shown by data:** in every run, the long frames line up with a foliate section load in the reader view: a new section `<iframe>` is created and loaded, and its words are wrapped (`wrapWordsInSpans`). These loads happen during the first ~40 words of playback, and at roughly the same words in each run. At 2.00x one of them falls while word 8736 is playing. At 125 ms, 8736 is the only unit in that stretch shorter than the frame. At 1.00x the same loads cost 146-212 ms frames (8763, 8805, 8889 in C), but no unit there is shorter than the frame, so nothing is dropped.

**Evidence.** Each section load leaves a pair of console warnings in the log: `An iframe which has both allow-scripts and allow-same-origin ... (paginator-*.js:97)` and then `(blob:file:///...)`. The paginator creates a View, and so an iframe, only in `#display` with a new `src`, which happens only on `#goTo` to a different section index (`node_modules/foliate-js/paginator.js` 1006-1054). Each pair can be placed between the epoch-stamped producer lines around it (locator: scratchpad `drop/iframes.mjs`).

| Run | Section loads during play | Share of play time inside a load window | Long frames >100 ms inside a load window |
|---|---|---|---|
| A, launch-2, 2.00x | 4 (words 8725-29, **8729-39**, 8756-67, 9431+) | 4 % | 2 of 2 (191 ms ending at 8737; 117 ms ending at 8764) |
| B, T7, 2.00x | 4 (8725-29, **8729-42**, 8756-79, 9432+) | 3 % | 2 of 3 (247 ms ending at 8737; 160 ms ending at 8764; 117 ms at 9219 is outside any window) |
| C, launch-3, 1.00x | **14** (from 8725 to about 9000) | 31 % | 4 of 4 (178, 212, 146, **1292** ms) |

If the long frames fell at random times, the chance of A's 2 of 2 landing inside windows covering 4 % of the time is about 0.002, and of C's 4 of 4 inside 31 % about 0.009. Within each window the iframe line cannot be placed more precisely than its surrounding producer lines (1-8 s apart). So the data shows timing alignment. It does not observe the load's own cost on the main thread.

**The three leads in the dispatch:**
- **(a) Highlight, page or scroll motion.** With `allowMotion:false` the highlight never scrolls (`FoliateView.tsx` 579-628). The scroll-follow effect (`FoliateView.tsx` 1329-1385, throttled to 500 ms) calls `scrollToAnchor`, which fires `relocate`. That leads to `onRelocate` (`ModeRuntime.ts` 465) and a word-position-index rebuild 100 ms later.
  - Prediction: long frames follow scroll-follow fires.
  - Observed: A and B fire at 8735. C's 178 ms frame after 8762 is not a fire. Fires happen at about one commit in three, so this is not distinctive.
  - The motion that does line up is the section load: scroll-follow's `!state.found` branch calls `view.renderer.next()` (FoliateView.tsx ~1350), and when it reaches the end of a section, `next()` loads the next one.
- **(b) The next producer result arriving.** Prediction: a schedule `resultT` (or the IPC reply) inside or just before the long frame.
  - A: schedules at t=6444.4 and 8132.5; the frame runs 7246.8 to 7437.5.
  - B: schedules at t=8069.6 and 10317.4; the frame runs 8887.3 to 9134.2.
  - No request, result or schedule falls in either frame. **Refuted.** The trace bridge is also ruled out: `preload.js` 24-27 is asynchronous `ipcRenderer.send`.
- **(c) The tick path.** `useNarrateModeBindings` rAF calls `runtime.tick`, which calls `engine.tick`. That is `pump()` (one `findIndex` and a splice over 4 or fewer chunks), one binary search, and at most one `publish`. The `onCursor` that follows does one highlight pass and one `notify()`. Prediction for this cause: long frames on many commits. Observed: 2 to 7 frames over 50 ms out of 1,046 to 1,489 commits. **Not the cause.** The trace cannot separate the 8735 commit's own React render from the section load that runs in the same frame.

## 3. Failure 2: a 1,292 ms renderer frame at 1.00x (trace C)

**What the data shows:**
- The block runs from about t=88745 to 90037 (epoch 913645 to 914937). It starts one normal frame after the 8954 commit.
- The producer reply reached the main process at 913774 (`hops.mainReply`), 129 ms *after* the block began. The renderer handled it at 914962 (`resultT` 90062). So it was queued behind the block and did not cause it. Lead (b) is refuted.
- The block sits inside a section-load window: the iframe pair is logged between 912148 (`post 14`) and 913774 (`result 14`).
- Launch-3 reloaded sections **14 times** during play, up to word ~9000. Launch 1 (same build, rate and start word, a clean pass) and the T7 1.00x session each logged only **5 iframe pairs in the whole run**: 2 at startup and about 3 in the first seconds of play, then none. The launch-3 run therefore diverged in the *view*: it kept reloading sections. Its long frames are the run's reloads.
- **CPU:**
  - Foreign CPU (host minus app) was about 3.4 to 4.4 of 12 cores across 909-916 s. There is no spike at the block.
  - During the block the app used about 2.4 cores (913853 to 914353) and 1.3 cores (914353 to 914857). The producer worker was idle from 913774 until `post 14`, and the next post (15) came at 917424. So that app CPU was mostly the renderer and the GPU process.
  - This looks like CPU-bound work in the app, not the renderer being pushed off the CPU. Foreign load could still have stretched it, and the data cannot decide that.
- **Garbage collection is unlikely to be the cause:**
  - The engine keeps a chunk only until `endAt < now - 2` (`pump`, lines 292-297), on top of the 8 s prefetch (`NARRATE_PREFETCH_AHEAD_S`). That is at most about 10-15 s of mono Float32 at 24 kHz, roughly 1.5 MB, plus one AudioBuffer copy per chunk.
  - Each source is released on `onended`, `cancel` or `disconnect` (`playbackClock.ts` 85-93).
  - There is no renderer heap telemetry, so GC is unlikely but not excluded by measurement.
- The trace bridge is asynchronous: `ipcRenderer.send` in preload, with a plain push in main (`main.js` 259-266).

**What the trace cannot decide:**
- Why launch-3 kept reloading sections. Every caller that can load a section during play goes untraced except `syncSection`, which logged only the expected -1→3 transition. The untraced callers are:
  - `ModeRuntime.ts:644`, where `onEngineCursor` gets `highlight()` false and calls `surface.next()`.
  - `ModeRuntime.ts:515`, where `onWordsReextracted` retries `pendingResume` and calls `surface.next()`.
  - `FoliateView.tsx` ~1350, where scroll-follow hits `!state.found` and calls `view.renderer.next()`.
- Why this one load cost 1.29 s when the others cost 0.15-0.25 s.
- How much the four concurrent node/grep processes contributed.

**What would resolve it:**
- Trace each of those three `next()` calls, plus the view's section `load` event, with word and section index.
- Record a renderer performance profile (Chrome trace) during one session.
- Compare the iframe count per run as a cheap regression signal.

## 4. Fix spec (ONE item, Hercules, engine only)

**File:** `src/reader/modes/narrate/engine/narrateEngine.ts`

1. Add a field: `private lastPublished: { readonly chunk: Chunk; readonly unit: number } | null = null;`. `reset()` sets it to `null`, so it is cleared on play, click and stop. `pause()` and `resume()` leave it alone, because a resume keeps the same chunk objects.
2. Move the publish-and-commit-record block out of `tick()` into `private commitUnit(c: Chunk, u: number, now: number, t: number, frameDt: number | null): void`. It keeps the same fields, with `unit: u` and `boundaryCtx` taken from `c.table.units[u]`.
3. In `tick()`, after `if (!pos || pos.unit < 0) return;` and `const c = this.chunks[pos.index];`:
   ```ts
   // A long display frame can carry the sample past whole units: publish each unit this chunk sounded since the last publish, in order (D5).
   const from = this.lastPublished?.chunk === c ? this.lastPublished.unit + 1 : Math.max(0, lookupUnit(c.table.units, c.offset));
   for (let u = Math.min(from, pos.unit); u <= pos.unit; u++) this.commitUnit(c, u, now, t, frameDt);
   this.lastPublished = { chunk: c, unit: pos.unit };
   ```
   - The first unit published in a newly playing chunk is the unit at its sounding start (`c.offset`: the trim, or a resume's paused sample), so a click or speed-change chunk whose first frame runs long publishes from its first sounded word.
   - Units from an earlier epoch are never published.
   - `publish()` already skips a word equal to the cursor, so a resume never repeats the paused word.

**Behaviour:** a tick whose sample has passed one or more unpublished units of the playing chunk publishes each of them in order, then the current one. Each gets its own `onCursor` call and its own `narrate-commit` record at that tick: same `t`, `nowCtx` and `frameDt`, but its own `unit` and `boundaryCtx`. The view renders the last one. No change to `position`, `pump`, scheduling, chunking, prefetch or the producer.

**Failing-first test:** `tests/narrate/narrate.trace.test.ts`, which already has the engine harness with `FakeAudioOutput`, `cursor` and `onTrace`. Add two tests:
- **T1: "a long display frame that passes whole units publishes each one in order, each with its own commit record at that tick".**
  1. `play(0)`, `flush`, then `run(h, LEAD + WORD_S * 2 + 0.01)`. Assert the cursor is `[0, 1, 2]`.
  2. `h.output.advance(WORD_S * 3); h.engine.tick();`. This single frame passes units 3 and 4 and lands in 5.
  3. Assert the cursor is `[0, 1, 2, 3, 4, 5]`.
  4. Assert the last 3 commits have words `[3, 4, 5]` and units `[3, 4, 5]`, one shared `t` and `frameDt`, and strictly increasing `boundaryCtx`, each `<= nowCtx` and `> nowCtx - WORD_S * 3 - 1e-9`.
  5. Then `run(h, WORD_S * 2)` and assert the cursor equals `[...Array(8).keys()]`: no repeats.
- **T2: "a click whose first frame lands past the new chunk's first unit publishes from the clicked word, never a unit of the old epoch".**
  1. `play(0)`, `flush`, then run to the cursor `[0, 1, 2]`.
  2. `play(6, "click")`, `flush`, then `h.output.advance(LEAD + WORD_S * 2 + 0.01); h.engine.tick();`.
  3. Assert the tail of the cursor is `[6, 7, 8]` and that no published word is < 6 after the click.

**First seen failing:** before the engine edit, run `npx vitest run tests/narrate/narrate.trace.test.ts`. T1 should get `[0, 1, 2, 5]` and T2 should end `[..., 8]`.

**Gates after the change:**
- `npx vitest run tests/narrate/` passes, including the existing `narrate.engine.test.ts` cursor, R6, pause/resume, click and R7 tests and the `narrate.trace.test.ts` lateness test. Those tests use 1/60 s steps, so no catch-up happens in them.
- Typecheck passes.

**Effect on the measured failures:**
- **A and B (2.00x):** the drop goes away.
  - 8736 is committed at the 8737 tick, 128 ms late (A) or 185 ms late (B).
  - The check's limit for that commit is its own frame plus tolerance: 190.7 or 246.9 ms. So it is inside and D3 passes.
  - In general: a passed-over unit's boundary is after the previous tick's sample, so its lateness is less than the frame. That is always within the check's limit while the frame is under 1000 ms.
- **C:** the 2 drops go away, but D3 still fails.
  - 8955 and 8956 would be committed 1,114 ms and 914 ms late in a frame of 1000 ms or more. The check treats such a frame as no frame (17.7 ms limit), so C ends with **3 outside, 0 drops**.
  - Nothing in the engine can cure the 765 ms lateness of 8957, because the renderer cannot publish during a blocked frame. Only removing the long frame can.
  - **The long frames are a separate bug for the planner:** reader-view section reloads (foliate iframe load plus `wrapWordsInSpans`) block the renderer for 150-1,300 ms during playback. In launch-3 they recurred about 14 times. The trigger is unidentified (section 3).

**What the fix does NOT do:**
- No latency lever: no change to chunking, ramp, prefetch, threads, workers, generation or scheduling.
- No renderer or view performance work: the section reloads stay.
- It does not catch up units at the tail of the *previous* chunk when one long frame spans a chunk handoff. That case was not observed. The check would still count it as a drop, because the commit's `nowCtx` would lie after that chunk's interval. It stays as a known residual.

## 5. Risks

- **D3 (lateness within the frame):** the catch-up commits are late by less than their frame. This is shown above and asserted in T1. For a frame of 1000 ms or more, D3 fails exactly as it does today.
- **R6 (silence holds the last word):** unchanged. Catch-up runs only after the `!pos || pos.unit < 0` early return, so leading silence and gaps still hold.
- **R7 (speed change at the next word):** the stopped chunk keeps its identity until its unit ends, so catch-up within it is normal. The regenerated chunk is a new object and starts from its trim unit. Covered by the existing R7 test.
- **Pause and resume:** `lastPublished` survives the pause on the same chunk object. Resume continues from the paused unit. `publish` skips the equal word, so nothing repeats. The "nothing replayable" path bumps the epoch and creates new chunks, which start from their trim unit.
- **Click:** `reset()` clears `lastPublished`. Covered by T2.
- **Section crossings:** a chunk never crosses a break (`chunkBreaks`), so catch-up stays within one section. `syncSection` runs on the last word React renders.
- **View cost:** catch-up sends `onCursor` 2 or 3 times within one tick: highlight passes and `notify()` calls, which React batches. This happens only after a long frame, and is bounded by the units passed.

**Decision #19 fence:** yes. The change is publish logic inside `NarrateEngine.tick` only, with no new latency lever (chunking, prefetch, threads, workers and generation are all untouched).

## Files read
- scratchpad `drop-locate.mjs`
- `scripts/narrate-rebuild/p5-recorded-output-check.mjs` (analyze, 52-141)
- `src/reader/modes/narrate/engine/narrateEngine.ts` (full)
- `src/reader/modes/narrate/engine/wordTable.ts` (lookupUnit)
- `src/reader/modes/narrate/engine/playbackClock.ts` (grep)
- `src/reader/modes/narrate/useModeBindings.ts`
- `src/reader/modes/narrate/surface.ts`
- `src/reader/modes/narrate/ModeRuntime.ts` (460-480, 495-570, 595-665, 720-762)
- `src/reader/modes/narrate/FoliateView.tsx` (1-20, 440-700, 720-800, 905-920, 974-1020, 1083-1140, 1300-1442)
- `src/reader/modes/narrate/helpers/wordPositionIndex.ts`
- `src/reader/modes/narrate/helpers/foliateWordWrapping.ts` (grep)
- `node_modules/foliate-js/paginator.js` (540-560, 905-1112)
- `preload.js` 1-32, `main.js` 165-280, `main/narrate/trial.js` (226-312), `src/constants.ts` (grep)
- `tests/narrate/narrate.engine.test.ts` (1-40, 219-253), `tests/narrate/narrate.trace.test.ts` (1-75), `tests/narrate/harness/fakeAudioOutput.ts` (grep)
- Traces: A, B, C
- Logs: launch-1/2/3 and p5 `session-1-00`/`session-2-00` (.log)
- launch-3 `session-1-00.cpu.json`
- launch-3 profile `blurby-data/error.log` and `library.json`

## Commands run (all read-only)
- `pwd`; `git --no-optional-locks branch --show-current`; `mkdir -p` (scratch `drop/`)
- `node drop-locate.mjs` on A, B and C
- Scratch scripts (in `scratchpad/drop/`), run on the traces and logs: `kinds.mjs`, `sched.mjs`, `long.mjs`, `throttle.mjs`, `ts.mjs`, `iframes.mjs`, plus one inline `node -e` for hops and one for CPU
- `grep`, `sed`, `cat`, `ls`, `wc` over source, logs and artifacts
- No tests, no build, no app, no git writes.
