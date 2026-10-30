<a id="narrate-gap-pause-1"></a>

#### NARRATE-GAP-PAUSE-1 — A pause in the gap before a chunk resumes on that chunk's first word, without a silence *(Seq 86.6; Queued; Full Spec; authored 2026-10-30)*

- **What:** Fix BUG-237 in the Narrate engine (`src/reader/modes/narrate/engine/narrateEngine.ts`) with two changes:
  - **The anchor.** When a pause lands in the silence before a scheduled chunk, the engine anchors the pause at that chunk. It finds the chunk with the same clock it uses for the heard position, so the resume starts on that chunk's first word.
  - **The timing.** A chunk that the pause stopped never serves as the previous chunk when the next chunk is timed, so the first chunk scheduled after a resume starts at `now + lead`.
- **Outcome (one sentence):** a pause 34 ms before a scheduled chunk, then a resume, plays that chunk's first word next, at the normal resume latency. In D6 on RodneySr, no resume skips a word, and `warm-2.00-3`'s resume is back in the normal class (≤ 150 ms; the base's other resumes span 80–93 ms).
- **Out of scope:**
  - the producer, IPC and preload: NARRATE-PAUSE-CANCEL-1's cancel path stays as built;
  - chunk planning (`chunkPlan.ts`);
  - the leading trim (`leadingTrim`);
  - the speed-change path (`setSpeed`, R7);
  - `ModeRuntime.ts` and every sibling mode;
  - pauses that land inside a chunk (they already resume at the paused sample; control (c1));
  - the output latency itself, and the cursor's display path (`tick`, `commitUnit`).
- **Why:**
  - **BUG-237**, HIGH: `docs/governance/BUG_REPORT.md` on `origin/main` @ `0238e3da`, "BUG-237 — A Narrate pause in the gap before a scheduled chunk skips that chunk's words and resumes after ~2.3 s of silence". Filed by Blurby.Brain1 on 2026-10-30 from NARRATE-PAUSE-CANCEL-1's base D6 on RodneySr (`5de476ce`, x64); deterministic in two runs.
  - **What was heard:** in D6 run `warm-2.00-3` (*Meditations*, ~word 8730, 2.00x), the pause landed 34 ms before chunk 8730 was due. The resume restarted at the next chunk (8748), so words 8730–8747 were never heard; it started after ~2.3 s of silence, at `startAt` 6.0963, the stopped chunk's `endAt`.
  - **Evidence (RodneySr):** `C:\Projects\Blurby-artifacts\narrate-pause-cancel-1\d6-base\traces\warm-2-00-3.trace.json` and `…\d6-base-run1\`.
  - **Cause** (Blurby.Brain1 at `5de476ce`, confirmed at `53adf994`, the pause-cancel fix commit):
    - **(a) Two clocks.** `pause()` (`:212-214` at `53adf994`; `:209-211` at `5de476ce`) resolves the pause with `position(this.output.playbackPosition())`. In a gap that is `null`, so it falls back to `nextScheduledPause()` (`:500-504` at `53adf994`; `:488` at `5de476ce`).
      - That function compares `c.startAt` with `this.output.now()`, the scheduling head. The real output's `playbackPosition()` lags `now()` by the output latency (`playbackClock.ts:66-75`).
      - So a chunk due 34 ms after the heard sample already reads as "started". The test `c.startAt >= now || c.source === null` fails for it, the function returns `null`, and `pausedAt` is `null`.
      - The test fake hides this: its `playbackPosition()` equals `now()` (`tests/narrate/harness/fakeAudioOutput.ts:20-22`).
    - **(b) The skip.** `resume()` (`:224-246` at `53adf994`) gets `at = null`. It cannot use `firstUnscheduled()` either, because the gap chunk has an `endAt`.
      - At `:235` it abandons the in-flight prefetch (`epoch += 1`), and at `:236` it requests from `this.nextWord`: 8748, the word after the scheduled-but-unheard chunk 8730.
    - **(c) The silence.** `onResult` (`:397-403` at `53adf994`) times the new chunk with `startAt = prev ? prev.endAt : now + lead` (`:400`). Here `prev = this.chunks.at(-2)` (`:398`) is the chunk the pause stopped, so its future `endAt` becomes the start.
      - The clamp at `:402` corrects only a `startAt` in the past, never a stale future slot.
- **Decision tiers (Rule 11):**
  - **Fix direction, binding** (Blurby.Brain1, 2026-10-30, the BUG-237 entry's "Next"):
    - one clock for the pause position and the scheduled-chunk test;
    - a pause-stopped chunk is never `prev`, so the first chunk after a resume is timed at `now + lead`;
    - red tests reproduce the trace, with controls for a pause mid-chunk and a pause with no scheduled chunk;
    - D6 on RodneySr x64 with `NARRATE_PRODUCER_LOG=1`, with `warm-2.00-3`'s resume in the normal class and no regression on the other rows;
    - the rule 53 pair under its temporary note;
    - stacked on `eb/narrate-pause-cancel-1`;
    - RodneySr as host.
  - **Blurby.Brain1's rulings on the drafting questions (2026-10-30, binding):**
    - **Q1, the bars.** The normal class for `warm-2.00-3` after the fix is **≤ 150 ms** (the base's other resumes span 80–93 ms). No regression means each type and rate's worst counting latency is ≤ the base's + 150 ms, where the base's resume reference excludes its `warm-2.00-3` trials.
    - **Q2, an unexercised scenario.** If the 34 ms gap pause does not recur in the after D6 and the one allowed 2.00x re-run, the evidence is (g1)–(g3) plus `check-skip` flagging the base trace, with a note in the memo. This is not a stop.
    - **Q3, D6 on the built renderer.** D6 runs on the built renderer (`BLURBY_USE_DIST=1`), not the packaged exe. This is accepted for rule 53(d), with the `dist\` parity check recorded beside it.
    - **Q4, base D6 reuse.** NARRATE-PAUSE-CANCEL-1's after D6 is reused as the base only if it was measured on this item's exact base commit; otherwise a fresh base is run.
    - **Owner:** the wording of owner check (o1) is approved as written (2026-10-30).
  - **Tier 1, decided here and grounded in code:**
    - **"Stopped by the pause" is read as `c.source === null`** for a chunk still in the list. At the pause-cancel tip, `source` becomes `null` only at creation (`:395`) and in `stopSource` for a pause or a drop (`:463`). Dropped chunks are spliced out (`dropFrom`, `:506-509`), and a speed change keeps its source (`stop(at)`). Every chunk rescheduled by `resume()` gets a new source (`scheduleChunk`).
    - **The latency fake is local to the new test file.** It subclasses `FakeAudioOutput`, so the shared harness and the existing tests are unedited.
- **Prerequisites:**
  - **NARRATE-PAUSE-CANCEL-1** (Seq 86.5). It is in flight, not terminal: its fix commit `53adf994` is on `origin/eb/narrate-pause-cancel-1`, and its after measurements, rule 53 and memo (Wave B) are pending. This item encodes the wait:
    - it is cut from that branch's **final pushed tip**, the one its rule 53 verification names, and not before;
    - its line numbers are cited at `53adf994` and are **re-grepped at that final tip**;
    - it merges only after NARRATE-PAUSE-CANCEL-1 has merged.
  - NARRATE-PAUSE-CANCEL-1's D6 gate is amended for BUG-237 (Mid-Dispatch Amendment 2026-10-30, "D6 gate after BUG-237"), so that branch carries the defect unchanged into this item's base.
  - **NARRATE-QUIT-LINGER-1** (`5de476ce`), under NARRATE-PAUSE-CANCEL-1 in the stack. It merges first.
  - **Inputs on RodneySr:**
    - `C:\Projects\bq-main`;
    - Node 22.12 or later and `pwsh`;
    - the D6 models default `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models`;
    - the BUG-237 evidence above;
    - NARRATE-PAUSE-CANCEL-1's D6 artifacts under `C:\Projects\Blurby-artifacts\narrate-pause-cancel-1\`.
- **Done when** (every command runs in `pwsh` 7 from the worktree root `C:\Projects\wt-narrate-gap-pause-1` on RodneySr; each passes only on the exact exit code stated, standing rule 44. `$G` = `C:\Projects\Blurby-artifacts\narrate-gap-pause-1`, `$PC` = `C:\Projects\Blurby-artifacts\narrate-pause-cancel-1`, and `$BASE` = the final tip of `origin/eb/narrate-pause-cancel-1`.)
  1. **Worktree on the base.**
     - `git -C C:\Projects\bq-main fetch origin` exits 0.
     - `$BASE = git -C C:\Projects\bq-main rev-parse origin/eb/narrate-pause-cancel-1` prints the tip that NARRATE-PAUSE-CANCEL-1's rule 53 section names. If it differs, stop.
     - `git -C C:\Projects\bq-main worktree add -b eb/narrate-gap-pause-1 C:\Projects\wt-narrate-gap-pause-1 $BASE` exits 0.
     - `npm ci` and `npm run build` exit 0.
     - `npx vitest list --filesOnly > $G\vitest-files-base.txt` exits 0.
     - `bq-main`'s detached `36ac7466`, its `stash@{0}` and the RUN 4 evidence are untouched: `git -C C:\Projects\bq-main stash list` is the same before and after, and that checkout's `git rev-parse HEAD` prints `36ac7466…`.
  2. **Save the skip checker and give it its opposite verdict (standing rule 55).**
     - Save the checker in Implementation detail, verbatim, as `$G\check-skip.cjs`.
     - `node $G\check-skip.cjs $PC\d6-base\traces` exits **1**, and its output lists `warm-2-00-3.trace.json` with `expectedWord` 8730 and `requestWord` 8748. This is BUG-237 on the base evidence.
     - **Control:** a resume after a pause inside a chunk is not flagged. Its `resumes[]` show at least one entry with `skippedWords` ≤ 0.
  3. **Base D6 (the no-regression reference; LL-152).**
     - If NARRATE-PAUSE-CANCEL-1's after D6 report `$PC\d6-after-latency-e2e.json` was measured on `$BASE` (its memo names the commit), copy it to `$G\d6-base-latency-e2e.json`, and copy its traces folder to `$G\d6-base\traces`.
     - Otherwise run, on `$BASE` after `npm run build`:
       - `$env:NARRATE_PRODUCER_LOG='1'; pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --out $G\d6-base`, which exits 0 or 1;
       - then `Move-Item docs\studies\narrate-rebuild-1\phase5\latency-e2e.json $G\d6-base-latency-e2e.json`, which exits 0.
     - The memo records which branch was taken.
  4. **Red first (standing rule 43), committed alone.**
     - `git show --name-only --format= HEAD` lists only `tests/narrate/narrate.gapPause.test.ts`.
     - `npx vitest run tests/narrate/narrate.gapPause.test.ts --reporter=json --outputFile=$G\red.json` exits 1.
     - This check exits 0: exactly (g1), (g2) and (g3) fail, by assertion and not by a load error.

       ```
       node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const f=r.testResults.flatMap(t=>t.assertionResults.filter(a=>a.status==='failed').map(a=>a.title.slice(0,4)));const want=['(g1)','(g2)','(g3)'];console.log(f);const loadErr=r.testResults.some(t=>t.status==='failed'&&t.assertionResults.length===0);process.exit(!loadErr&&f.length===3&&want.every(x=>f.includes(x))?0:1)" $G\red.json
       ```
     - The controls (c1)–(c4) pass.
     - `npm run typecheck` exits 0 at the red commit.
     - The failing output is recorded in the memo.
  5. **The change**, at the edit sites below.
     - `npx vitest run tests/narrate` exits 0. It includes the new file and every existing `tests/narrate` file unedited, among them `narrate.engine.test.ts`, `narrate.pauseCancel.test.ts` and `narrate.structural.test.ts`.
     - `npx vitest run tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts` exits 0.
  6. **After D6 on the final commit** (after `npm run build`):
     - `$env:NARRATE_PRODUCER_LOG='1'; pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --out $G\d6-after` exits 0. The full D6 warm budget holds again.
     - `Move-Item docs\studies\narrate-rebuild-1\phase5\latency-e2e.json $G\d6-after-latency-e2e.json` exits 0.
     - **No skipped words:** `node $G\check-skip.cjs $G\d6-after\traces` exits 0 (0 resumes flagged), and its final line reports `gapPauses`. If `gapPauses` is 0, D6 is re-run once at 2.00x only (`--rates 2.0`, `--out $G\d6-after-rerun`), and `check-skip` must also exit 0 on that run. If both runs show `gapPauses` 0, the memo records the note "the 34 ms gap pause did not recur live; evidence is (g1)–(g3) and check-skip flagging the base trace" (ruling Q2). This is not a stop.
     - **`warm-2.00-3` and no regression:** `node $G\check-d6-gap.cjs $G\d6-base-latency-e2e.json $G\d6-after-latency-e2e.json` (saved verbatim from Implementation detail) exits 0. It checks three things:
       - every resume trial of run `warm-2.00-3` in the after report has `latencyMs ≤ 150`, the normal class (ruling Q1);
       - every counting warm trial of every type (play, resume, click, speed) at both rates is under 2,000 ms;
       - for each type and rate, the after worst counting `latencyMs` is not more than **150 ms** above the base worst.
  7. **Gates** (if `origin/main` moved, merge it first with `git merge --no-edit origin/main`, without conflict):
     - `npm test`, `npm run typecheck` and `npm run build` each exit 0.
     - `npx vitest list --filesOnly > $G\vitest-files-after.txt` exits 0, and `Compare-Object (Get-Content $G\vitest-files-base.txt) (Get-Content $G\vitest-files-after.txt)` shows exactly one `=>` line, ending in `narrate.gapPause.test.ts` (standing rule 52).
  8. **Package verification (standing rule 53 with its temporary placement note), on RodneySr, final commit:**
     - (a) `npx electron-builder --win --dir --x64` and `--arm64` each exit 0, and `(Get-FileHash release\win-unpacked\resources\app.asar).Hash -eq (Get-FileHash release\win-arm64-unpacked\resources\app.asar).Hash` prints `True`.
     - (b) The packaged `app.asar` contains `BLURBY_USER_DATA_DIR`. A 25 s x64 launch on a fresh, proved scratch profile (LL-165) stays alive, with no error, unhandled-rejection or crash line and no crash dump, and the live `library.json` and `settings.json` hashes are unchanged. Rule 53's known noise is recorded, not failed.
     - (c) The asar's `dist\`, extracted in the scratchpad, equals the built `dist\` that Done-when 6's D6 ran on (`BLURBY_USE_DIST=1`). No `main/` or `preload.js` file changed.
     - (d) Done-when 6 ran on that same `dist`. Ruling Q3 accepts D6 on the built renderer, so the memo records the (c) parity result (the hashes of both `dist\` trees) beside the D6 results.
     - (e) A "Package verification" section in the memo; Blurby.Brain is sent the paths, commit and logs. **The arm64 launch is at merge time** (R-2026-10-30-2), on Rodney.
  9. **Fence (standing rule 41).**
     - `git diff --name-only $BASE HEAD` (before any `origin/main` merge, or on the item's own commits) lists exactly:
       - `src/reader/modes/narrate/engine/narrateEngine.ts`;
       - `tests/narrate/narrate.gapPause.test.ts`;
       - `docs/studies/investigations/NARRATE-GAP-PAUSE-1.2026-MM-DD.md`;
       - `docs/governance/BUG_REPORT.md`;
       - `docs/governance/close-outs/Memo.NARRATE-GAP-PAUSE-1.GovernanceStaging.2026-MM-DD.md`;
       - and the time log `docs/governance/close-outs/Timing.NARRATE-GAP-PAUSE-1.jsonl`.
     - `git diff --name-only $BASE HEAD -- main preload.js main.js src/types.ts src/components/ReaderContainer.tsx src/utils/FlowScrollEngine.ts src/reader/modes/narrate/ModeRuntime.ts src/reader/modes/narrate/engine/chunkPlan.ts tests/narrate/harness tests/narrate/narrate.engine.test.ts scripts` prints nothing.
  10. **BUG-237 and the owner check.**
      - BUG-237's status line begins `RESOLVED in source (NARRATE-GAP-PAUSE-1)` and gives the base and after `check-skip` results and the `warm-2.00-3` latency (standing rule 49). `Select-String -Path docs\governance\BUG_REPORT.md -SimpleMatch "RESOLVED in source (NARRATE-GAP-PAUSE-1)" -Quiet` prints `True`.
      - The memo lists owner check **(o1)** for release gate (2)'s batched list (standing rule 45): "In Narrate at 2.00x, pause and resume about 15 times in quick succession, including right as a new sentence is about to start. By ear, no phrase is lost and no resume waits more than a moment." `Select-String -Path docs\governance\close-outs\Memo.NARRATE-GAP-PAUSE-1.GovernanceStaging.*.md -SimpleMatch "(o1)" -Quiet` prints `True`.
      - `git push origin HEAD:refs/heads/eb/narrate-gap-pause-1` exits 0, and `git ls-remote origin refs/heads/eb/narrate-gap-pause-1` prints the local `HEAD`.
- **Effort:** S.
- **Owners:**
  - implementation agent on RodneySr;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Brain: package confirmation, and any stop that reaches it;
  - Blurby.Roadmap: the merge go;
  - the owner: (o1) at release gate (2).
- **Source:**
  - BUG-237 (`origin/main` @ `0238e3da`);
  - Blurby.Brain1's cause and fix direction, 2026-10-30;
  - the evidence traces on RodneySr;
  - `narrateEngine.ts` at `53adf994` (and `5de476ce`);
  - `playbackClock.ts:66-75`;
  - `fakeAudioOutput.ts:20-22`;
  - NARRATE-PAUSE-CANCEL-1's specification and its Mid-Dispatch Amendment 2026-10-30.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites** (`src/reader/modes/narrate/engine/narrateEngine.ts`, cited at `53adf994`; **re-grep at the pause-cancel final tip**, standing rule 36):
  - **`pause()` `:210-221`:** pass the heard position already computed at `:212` (`const now = this.output.playbackPosition();`) into the gap fallback at `:214`: `… : this.nextScheduledPause(now);`. Nothing else in `pause()` changes; the `cancelQueued` call at `:219` stays.
  - **`nextScheduledPause()` `:500-504`:** change the signature to `private nextScheduledPause(now: number)`, and delete its own `const now = this.output.now();` (`:501`). The predicate `c.startAt >= now || c.source === null` (`:502`) and the return value `{ index: i, sample: this.chunks[i].trim }` (`:503`) stay unchanged, so both the position and the test now read the heard clock. Move the stray doc line at `:493` ("Paused in a gap: resume from the first chunk not yet started, at its trim.") onto this function, and add "on the heard clock (BUG-237)".
  - **`onResult()` `:397-403`:** at `:398`, `prev` serves as the timing predecessor only while it is live: `const last = this.chunks.at(-2); const prev = last && last.source !== null ? last : undefined;`. With that, `:400`'s `startAt = prev ? prev.endAt : now + this.lead` times the first chunk after a resume, whose predecessor the pause cancelled, at `now + lead`. The `narrate:gap` diagnostic at `:402` then fires only after a live predecessor. Add a one-line comment naming BUG-237.
  - **`resume()` `:224-246`:** not edited. With `pausedAt` set by the fixed fallback, it takes the `at` path (`:238-245`). That path reschedules the gap chunk from its trim at `now + lead`, keeps the in-flight prefetch, and requests from the chunk's first word (`:236`).
  - **Re-grep at dispatch:**

    ```
    git grep -n -E "^  pause\(\): void|this.nextScheduledPause\(|private nextScheduledPause|const prev = this.chunks.at\(-2\)|let startAt = prev \? prev.endAt|Paused in a gap" -- src/reader/modes/narrate/engine/narrateEngine.ts
    ```

    After the change, `git grep -n "this.output.now()" -- src/reader/modes/narrate/engine/narrateEngine.ts` no longer lists a line inside `nextScheduledPause`, and `git grep -n "nextScheduledPause(now)"` prints exactly 1 line.
- **Tests: `tests/narrate/narrate.gapPause.test.ts`** (new; `narrate.engine.test.ts` and `tests/narrate/harness/*` unedited):
  - **Setup:**
    - Copy `WORDS`, `FRAMES`, `WORD_S`, `harness()`, `flush` and `run` from `tests/narrate/narrate.engine.test.ts:10-39`.
    - The output is `class LatentOutput extends FakeAudioOutput { constructor(readonly latency: number) { super(); } playbackPosition(): number { return this.now() - this.latency; } }`, with `LATENCY = 0.1`, like a real output whose heard sample lags the scheduling head.
    - The harness takes the output as a parameter; the port is as in `narrate.engine.test.ts:25`.
  - **The BUG-237 scenario** (`hold: true`, `prefetch: 1`):
    1. `play(0)`, flush, then `requests[0].release()` and flush: chunk A (words 0–11) is scheduled.
    2. `run(h, A's duration + 0.3)`, so A has played out and the next chunk is still held. Then `requests[1].release()` and flush: chunk B (from word 12, "Of my mother") is scheduled at `now + lead` after a gap. Call its source `srcB = h.output.sources.at(-1)`.
    3. Advance the clock with `output.advance` (no tick) until `playbackPosition() = srcB.startAt − 0.034`. The pause lands 34 ms before B on the heard clock, while `now()` is already past `srcB.startAt`.
    4. `engine.pause()`, then `tResume = output.now()`, `engine.resume()`, flush.
    5. Release every still-held request in order, and flush after each. `run(h, 0.5)`.
  - **(g1) `(g1) a pause 34 ms before a scheduled chunk resumes on that chunk`:** the first source scheduled after `tResume` has `pcm === srcB.pcm` (the same chunk, by identity) and `offset === srcB.offset` (its trim). It fails on the base: the next source is the following chunk's PCM.
  - **(g2) `(g2) the first chunk after the resume starts at now + lead, not at the stopped chunk's end`:** that source's `startAt − tResume ≤ 0.03 + 1e-9`. It fails on the base, where `startAt` equals B's stopped `endAt`, more than 2 s later.
  - **(g3) `(g3) no word of the chunk is skipped (by text, LL-161)`:**
    - the cursor values published after the resume begin with 12, and `WORDS[12] === "Of"`;
    - they then run 12, 13, … in order through the end of B with no gap;
    - `output.overlaps()` is `[]`.

    It fails on the base, whose first value is B's end word or later.
  - **Controls** (pass on the base and after):
    - **(c1) `(c1) a pause mid-chunk resumes at the paused unit`:** pause 0.5 s into A, then resume. The first source after the resume has A's PCM, and its `offset` equals the paused sample. There is no repeated or skipped cursor value.
    - **(c2) `(c2) a pause with no chunk scheduled restarts like a Play`:** A has played out and B is still held at the pause (nothing scheduled ahead). On resume a new request is made from word 12; release it. Its source starts at `≤ tResume + 0.03` and the cursor continues at 12.
    - **(c3) `(c3) zero latency: the existing gap behaviour is unchanged`:** step 3 of the scenario, run with `LatentOutput(0)`, resumes on B at `now + lead` (as on the base).
    - **(c4) `(c4) contiguous chunks without a pause still abut`:** B is released while A is still sounding, and `srcB.startAt` equals A's `endAt` exactly (a live `prev`).
  - **Red commit typechecks:** `LatentOutput` overrides a public method of the harness class, and no excess-property literal is used.
- **The skip checker** `$G\check-skip.cjs` (saved verbatim; never in the tree):

  ```js
  // NARRATE-GAP-PAUSE-1: for every resume in a folder of D6 *.trace.json files, the requested word must not be
  // past the first unit not yet heard at the pause (BUG-237). Also counts gap pauses: a pause whose heard sample (the first
  // pause stop's `at`) lies in no scheduled chunk of its epoch while a later chunk is still to start.
  const fs = require("fs"), path = require("path");
  const dir = process.argv[2];
  const recs = (f) => { const raw = JSON.parse(fs.readFileSync(f, "utf8")); const list = Array.isArray(raw) ? raw : raw.events || raw.records || raw.trace || [];
    return list.map((e) => (e.payload && e.payload.kind ? { ...e.payload, t: e.payload.t ?? e.t } : e)).filter((e) => e && e.kind); };
  let flagged = 0, gapPauses = 0, resumesTotal = 0;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".trace.json")).sort()) {
    const ev = recs(path.join(dir, f)); const out = [];
    let lastCommit = null, snap = null; const sched = [];
    for (const e of ev) {
      if (e.kind === "narrate-commit") lastCommit = e;
      else if (e.kind === "narrate-schedule") sched.push(e);
      else if (e.kind === "narrate-stop" && e.reason === "pause" && !snap && lastCommit) {
        const starts = sched.filter((s) => s.epoch === lastCommit.epoch).flatMap((s) => s.unitStarts || []).filter((w) => w > lastCommit.word);
        const latest = new Map(); for (const s of sched.filter((s) => s.epoch === e.epoch)) latest.set(s.chunkStart, s);
        const live = [...latest.values()];
        const gap = !live.some((s) => s.startAt <= e.at && e.at < s.endAt) && live.some((s) => s.startAt > e.at);
        if (gap) gapPauses += 1;
        snap = { lastCommitWord: lastCommit.word, expectedWord: starts.length ? Math.min(...starts) : null, gap };
      } else if (e.kind === "narrate-request" && e.cause === "resume" && snap) {
        resumesTotal += 1;
        const skippedWords = snap.expectedWord === null ? null : e.word - snap.expectedWord;
        if (skippedWords !== null && skippedWords > 0) flagged += 1;
        out.push({ ...snap, requestWord: e.word, skippedWords });
        snap = null;
      } else if (e.kind === "narrate-request") snap = null;
    }
    if (out.length) console.log(JSON.stringify({ file: f, resumes: out }));
  }
  console.log(JSON.stringify({ resumesTotal, flagged, gapPauses, verdict: flagged === 0 ? "PASS" : "FAIL" }));
  process.exit(flagged === 0 ? 0 : 1);
  ```

  - **Fields printed:** per file, `resumes[]` (`lastCommitWord`, `expectedWord`, `gap`, `requestWord`, `skippedWords`); final line `resumesTotal`, `flagged`, `gapPauses` and `verdict`.
  - **Trace fields read:** the engine emits `narrate-commit.word/epoch`, `narrate-schedule.epoch/chunkStart/startAt/unitStarts`, `narrate-stop.reason/at/chunkStart/epoch` and `narrate-request.cause/word` (`narrateEngine.ts:335-339`, `:418-424`, `:452`, `:444` at `5de476ce`). The normalization copies `traceRecords` in `scripts/narrate-quit-linger/quit-linger.mjs` (`:75-79` at `5de476ce`).
- **The D6 checker** `$G\check-d6-gap.cjs` (saved verbatim; never in the tree):

  ```js
  // NARRATE-GAP-PAUSE-1 Done-when 6: warm-2.00-3 resumes back in the normal class (<= 150 ms, ruling Q1); full D6 warm budget; no
  // per-type regression over the base. Reads report.warm[rate][type].trials (run, cause, latencyMs, cpu.foreignPct).
  const fs = require("fs");
  const RUN = "warm-2.00-3", CLASS_MS = 150, BUDGET_MS = 2000, TOL_MS = 150, CEIL = 25;
  const counts = (x) => x.latencyMs !== null && x.cpu !== null && x.cpu.foreignPct <= CEIL;
  const load = (f) => JSON.parse(fs.readFileSync(f, "utf8")).warm || {};
  const base = load(process.argv[2]), after = load(process.argv[3]);
  let ok = Object.keys(after).length === 2;
  const target = Object.values(after).flatMap((r) => (r.resume?.trials || []).filter((x) => x.run === RUN));
  const targetOk = target.length > 0 && target.every((x) => x.latencyMs !== null && x.latencyMs <= CLASS_MS);
  console.log(JSON.stringify({ run: RUN, trials: target.map((x) => ({ word: x.word, latencyMs: x.latencyMs })), targetOk }));
  ok = ok && targetOk;
  for (const rate of Object.keys(after)) for (const type of ["play", "resume", "click", "speed"]) {
    const a = (after[rate][type]?.trials || []).filter(counts), b = (base[rate]?.[type]?.trials || []).filter(counts);
    const aw = a.length ? Math.max(...a.map((x) => x.latencyMs)) : null, bw = b.length ? Math.max(...b.map((x) => x.latencyMs)) : null;
    // The base's resume row carries BUG-237's slow trial; its no-regression reference excludes the base's warm-2.00-3 resumes.
    const bRef = type === "resume" ? b.filter((x) => x.run !== RUN) : b;
    const bwRef = bRef.length ? Math.max(...bRef.map((x) => x.latencyMs)) : null;
    const row = { rate, type, afterWorstMs: aw, baseWorstMs: bw, baseRefMs: bwRef, overBudget: a.filter((x) => x.latencyMs >= BUDGET_MS).length };
    row.ok = aw !== null && bwRef !== null && row.overBudget === 0 && aw <= bwRef + TOL_MS;
    console.log(JSON.stringify(row)); ok = ok && row.ok;
  }
  console.log(JSON.stringify({ verdict: ok ? "PASS" : "FAIL" }));
  process.exit(ok ? 0 : 1);
  ```

  - **Fields printed:** a line for `warm-2.00-3` (`trials[]` with `word` and `latencyMs`, and `targetOk`); per rate and type, `afterWorstMs`, `baseWorstMs`, `baseRefMs`, `overBudget` and `ok`; last, `verdict`. The trial fields `run`, `cause`, `word`, `latencyMs` and `cpu` are the ones `p5-latency-e2e.mjs` writes (`:124-145`, `:165`, `:186-205` at `5de476ce`).
- **Constants:** none new. `this.lead` (`leadSeconds`, default 0.03) is the existing resume lead.
- **Branch:** `eb/narrate-gap-pause-1`, cut from the **final tip of `origin/eb/narrate-pause-cancel-1`** (Done-when 1) in a new worktree `C:\Projects\wt-narrate-gap-pause-1` from `C:\Projects\bq-main` on RodneySr. Never touch `bq-main`'s detached `36ac7466`, its `stash@{0}` or the RUN 4 evidence. **Build and hold:** push with `git push origin HEAD:refs/heads/eb/narrate-gap-pause-1`, and never merge here. The dispatch carries the filled reconciliation recipe (standing rule 42).
- **Execution host (CLAUDE.md rule 6b; standing rule 53's temporary placement):** RodneySr, for now: builds, D6, the suite and the x64 package checks. Rodney runs only the arm64 launch, at merge (R-2026-10-30-2). **Preflight:**
  - `hostname` prints `RODNEYSR`;
  - `Test-Path` is true for `$PC\d6-base\traces\warm-2-00-3.trace.json` and the D6 models root;
  - no Blurby or worktree electron process is running.

  If any check fails, resolve placement with Blurby.Brain first.
- **Waves** (7 tasks, so the dispatch is pre-split):
  - **Wave A:** tasks 1–3 (base, checkers, red, fix, targeted suites), ending with a push.
  - **Wave B:** tasks 4–7 (after D6, gates, rule 53, memo, BUG-237, push, report).
- **Staging plan:**
  - Stage explicit paths only: Done-when 9's list. Never `git add -A`.
  - `release\`, `tests/perf-baseline-results.json`, `docs/studies/narrate-rebuild-1/phase5/latency-e2e.json` (moved out after each run) and everything under `$G` stay unstaged.
  - Commits, in order: red (alone); the fix; the memos and BUG-237; then any `origin/main` merge.
- **Register writes (standing rule 46):** none. Seq 86.6 is fractional, so the register ceremony uses rule 11a's guarded helper.
- **Lane Ownership:** TTS / Narration Engine; execution surface A (engine only: `narrateEngine.ts`) plus its new test file.
- **Forbidden During Parallel Run:**
  - `main/`, `preload.js`, `main.js`;
  - `src/reader/modes/narrate/ModeRuntime.ts` and `engine/chunkPlan.ts`;
  - `tests/narrate/harness/` and `tests/narrate/narrate.engine.test.ts`;
  - `scripts/`;
  - `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`;
  - the page, focus and flow mode folders;
  - any register field.

  No other sprint may edit `narrateEngine.ts` while this runs.
- **Shared-Core Touches:** none.
- **Merge Order:**
  1. NARRATE-QUIT-LINGER-1.
  2. NARRATE-PAUSE-CANCEL-1.
  3. This item, with `origin/main` merged in and rule 53 re-run on the merge candidate, including the arm64 launch.
  4. At dispatch and at merge, `git merge-tree --write-tree HEAD <tip>` must show no conflict with `origin/eb/narrate-sentence-resume-1` @ `35716c5f` and `origin/eb/narrate-sentence-initials-1` @ `c93f7c09` (both edit `narrateEngine.ts`, `resume()` included). A conflict goes to Blurby.Roadmap for train order and is never resolved here.
- **Failure handling:**
  - **Done-when 1:** the pause-cancel tip is not final, or not rule-53-verified: wait and do not cut.
  - **Done-when 2:** `check-skip` does not flag the base `warm-2-00-3` trace: stop. The checker or the trace reading is wrong. Report it to Blurby.Brain with the output, and do not tune the checker to the answer.
  - **Done-when 4:** a red case passes on the base, or a control fails: one test fix, then stop. Never weaken an assertion.
  - **Done-when 5:** any existing narrate test fails, especially the pause/resume, gap or stale-result cases in `narrate.engine.test.ts`: stop and report. The `source === null` reading or the clock change touched a path this item does not own.
  - **Done-when 6, `check-skip` exits 1:** stop with the flagged resumes.
  - **Done-when 6, `gapPauses` is 0** (the live scenario did not occur; it is timing-dependent): re-run D6 at 2.00x once. If it is still 0, record the ruling-Q2 note in the memo and continue. This is not a stop.
  - **Done-when 6, `check-d6-gap` exits 1:** stop and give the printed rows to Blurby.Brain. Do not re-run to chase a pass.
  - **Any D6 exit 3, 4 or 5:** fix the environment once (`npm ci`, `node node_modules/electron/install.js`), then stop.
  - **A census or ownership test fails** (rule 50): stop, and never edit the census here.
  - **A preflight exits 4, or the live hashes move:** stop (LL-165).
  - **A quit-crash exit code** (0x80000003 or 0xC0000409): stop.
  - **Retry ceiling:** one fix attempt per failing gate.
  - **Rollback:** before merge, nothing (held). After merge, `git revert -m 1 <merge>`; there is no data migration. A revert brings BUG-237 back, not data loss.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Worktree on the pause-cancel final tip; base D6 reference in place; the skip checker flags BUG-237 on the base trace | calculable | setup | bounded | medium | 50m | — | — |
| 2 | Red cases (g1–g3) reproduce the 34 ms gap pause with a latent output; controls (c1–c4) pass; committed alone | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 3 | A gap pause anchors on the first unheard chunk on the heard clock, and a pause-stopped chunk never times the next one; narrate suites green | calculable | renderer-fix | bounded | medium | 40m | — | — |
| 4 | After D6 on RodneySr: no resume skips a word, `warm-2.00-3` resumes ≤ 150 ms, no row regresses | calculable | measurement | bounded | medium | 1h | — | — |
| 5 | Full suite, typecheck, build, collected set and fence pass | repeat | verify-gate | bounded | low | 0m (median of 4 runs) | — | — |
| 6 | Rule 53 package verification on RodneySr sent to Blurby.Brain; arm64 launch noted for merge | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
| 7 | Investigation memo, BUG-237 status, owner check (o1), memo and time log; pushed and held | calculable | governance-closeout | mechanical | low | 20m | — | — |

**Total:** chain 23m · sum 23m; 7 of 7 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

**Wall-clock note:** the live work (one or two 2-rate D6 runs, two package builds, the full suite) takes about 3–4 h on RodneySr. The calibrated medians measure agent working time, so a "done by" forecast uses the wall-clock figure.

##### Lessons applied

- **LL-142:** the cause is proved on the base by executing it: `check-skip` flags the recorded `warm-2-00-3` trace (Done-when 2), and the red tests reproduce the 34 ms gap before any change.
- **LL-152:** base and after D6 use the same script, arguments, host and `NARRATE_PRODUCER_LOG=1`. The base is reused only if it was measured on this exact base commit.
- **LL-031:** the epoch guards are untouched. The fix removes an epoch bump (the prefetch abandonment) only by taking the `at` path, so stale results are still dropped on arrival.
- **LL-109:** the pause/resume race keeps NARRATE-PAUSE-CANCEL-1's rewind. The gap chunk is rescheduled synchronously in `resume()`, so no async step sits between the anchor and its use.
- **LL-169:** operation currentness (the epoch) and resource liveness (`source`) are kept separate. A chunk's liveness alone decides whether it may time the next chunk.
- **LL-173 (Audio fakes must model a lagging heard position):** the stock `FakeAudioOutput` sets the heard position equal to the scheduling head, which hid BUG-237. The g-tests (g1)–(g3) use `LatentOutput`, whose heard position lags the head by 0.1 s, and every zero-lag test is labelled a control: (c3) and the unedited `narrate.engine.test.ts`.
- **LL-124:** the bug is a clock-domain error (scheduling head against output reality). The red tests model a lagging heard clock instead of the fake's identical clocks.
- **LL-161:** (g3) checks the first word heard by its text ("Of"), and `check-skip` compares words, not chunk indices.
- **LL-160:** D6 runs under the app's Electron through `app-node.ps1`.
- **LL-165:** the rule 53 launch proves its scratch profile and compares the live hashes.
- **LL-143:** every gate names `pwsh`, an exact exit code, and a checker whose fields are named and grounded in the emitting code.
- **Standing rule 43:** red first, with controls (c1)–(c4).
- **Standing rule 55:** `check-skip` gives its opposite verdict on the base evidence before its PASS counts, and the D6 checker's base row carries the slow trial it must exclude.
- **Standing rules 36, 41, 42, 44 to 53:** sites are re-grepped at the pause-cancel tip; the fence exempts the time log; the dispatch carries the recipe; gates have exact exit codes; (o1) goes to gate (2); no register writes; the suite runs on the dispatch host; typecheck and build are in Done-when 7; BUG-237's line names the item; the census is not edited; no lesson status is appended; the collected set is checked; rule 53 runs under its temporary placement.
- Considered and judged not to apply: LL-021, LL-034 and LL-122 (chunk planning is unchanged); LL-157 and LL-159 (quit is unchanged); LL-106 and LL-007 (no IPC or preload change).
