# Issue — LARGE-FOLDER-SYNC-1 — 2026-10-14 — code-quality review: three in-scope warnings (W1, W2, W3)

**tl;dr:** C2 (`cde807e8`) passes every light gate, and the spec-compliance review approved it. The code-quality review returned MINOR_FIXES with three in-scope warnings in `main/folder-sync.js` and `main.js`. Under the load ruling's condition 4 the item stops for Blurby Brain.

**Executive Summary:** The traced races and the quit path are sound. The three warnings concern scale (W1), resilience (W2) and a folder-switch race (W3). W1's scans are what the specification prescribes (`hasBook`). W2 is a pre-existing failure mode carried into the new module. W3 is new to the per-file path. Each fix departs from the prescribed code, so the ruling is Brain's.

**Evidence of issue** (code-quality review, confirmed by reading the code):
- **W1, scale.**
  - `hasBook` (`main/folder-sync.js:19`, called from `addOne` `:77`) and `findByPath` (`:17`) scan the whole library on every per-file add. `findByPath` also runs for every extracted file inside the full sync (`:46`).
  - `removeUnder` filters the whole library, and `removeDocFromLibrary` (`main.js:122`) re-filters it once per removed document, so removing k books costs O(k·n).
  - At the owner's ~120k books, copying 1,000 files means about 1,000 synchronous 120k-entry scans on the main thread. The reviewer estimated tens to low hundreds of ms each; this is **not measured**.
  - The specification prescribes `hasBook`, so this is by design, but it is at odds with "no per-event full scan" and with LL-158.
- **W2, one bad file aborts a sync.** `extractNewFileDoc` (`main.js:307-319`) guards only `extractContent`'s falsy result; `extractDocMetadata` is unguarded. One rejection inside the batch's `Promise.all` (`main/folder-sync.js:41`) aborts the run, loses everything since the last 30 s save, and leaves the startup call (`main.js:590`, no `.catch`) with an unhandled rejection. The base had the same shape.
- **W3, folder switch.** `select-folder` and `switch-folder` (`main/ipc/state.js:71`, `:82`) await the whole sync before `startWatcher()`, so the old watcher keeps firing meanwhile. Its add events pass `addOne`'s stale check, because `folder` is read after the switch. The book is added, then pruned at the next sync. The new folder also has no watcher during its first sync.
- **N1, trivial:** `FOLDER_SYNC_BATCH_SIZE` is still imported and now unused (`main.js:34`). The specification does not name it for removal.
- Optional test gap: (e) does not prove throttling, because the fake `now` advances 30 s on every call.

**Possible cause(s):**
1. The specification sized the per-file path functionally, not against 120k documents (LL-158's pattern). (W1, confidence high.)
2. The extraction guard predates this item, and the batch's `Promise.all` makes one failure fatal. (W2, high.)
3. The per-file path does not check that the path is under the current folder. (W3, high.)

**Likely solution(s):**
- **A (recommended), one fix round with failing-first tests**, in `main/folder-sync.js` and `main.js` only:
  - W2: guard each batch element (try/catch, then the failed-file hook) so one file never aborts the run.
  - W3: `addOne` (and the unlink path) accept only `p === folder || p.startsWith(folder + path.sep)`.
  - N1: drop the unused import.
  - Optional: tighten test (e) (`now` advancing less than the interval → no save).
  - **W1: measure first (Pike rule 1).** Use a micro-benchmark over a synthetic 120k-document library: `hasBook` and `findByPath` per call, and `removeUnder` for k = 100. If any per-event call is over 16 ms (one frame), add a path index inside folder-sync (a `Map` of filepath to doc and a `Set` of book keys, maintained on add and remove) in the same round. Otherwise record the measurement and file W1 as a follow-up.
- **B:** merge as specified and file W1, W2 and W3 as follow-ups. The defects then ship in a sync that the owner's 120k-file folder will exercise.
- Follow-ups either way, not this round: N2 (cancel, then an immediate re-sync of the same folder returns the cancelled run's promise); N3 (per-file `saveLibrary` during a full sync weakens the batching); N4 (confirm `hasBook`'s case rule); and starting the watcher before the sync on a folder switch.

**Confidence in cause and solution identification (1–10):** 8. W2 and W3 are clear from the code and the fixes are small. W1's cost is estimated, not measured, which is why the recommendation measures before choosing.

## Decision

**Ruled by:** Blurby Brain (planner), 2026-10-14. Option A, CLAUDE.md Rule 11, tier 1.
- **W2:** guard each batch element (per-file try/catch or allSettled) so one bad file is skipped and recorded through the existing failed-extraction path, and the run continues. Test: one throwing file among good ones; the good ones land, and no unhandled rejection reaches the startup call.
- **W3:** per-file add and unlink accept only paths under the current `settings.sourceFolder`, using folder-sync's path comparison. Test: an event for a path under the old folder after a switch is ignored.
- **N1:** drop the unused import.
- **Test (e):** tightened so it fails if the throttle is removed.
- **W1, measure first:**
  - A micro-benchmark on a synthetic 120,000-document library with realistic Windows paths: the median and worst of 50 runs for one per-file add (`hasBook` plus `findByPath`), and for removing 1,000 books via `removeUnder`. Figures are upper bounds on a loaded machine.
  - If the per-event median is over 16 ms, or removing 1,000 books takes over 2 s, add a path index in this round: a `Map` keyed by normalized filepath, built on each sync and kept in step on every add and remove, with a test that index and library agree after a mixed sequence.
  - Otherwise record the figures and file W1 as a follow-up. The benchmark stays out of the default test run.
- **Then:** the Solon and Plato reviews on the fix round, then the heavy run under the load rule. The folderWatcher budget test is in scope for this item and is never environmental.
- **Follow-ups to the close-out:** N2, N3, N4 and watcher-before-sync on a folder switch. Blurby.Roadmap gathers them into stub LARGE-FOLDER-SYNC-2 at the head of the stubs, beside the open design half.

## Decision 2 (fix-round review, MINOR_FIXES)

**Ruled by:** Blurby Brain (planner), 2026-10-14, CLAUDE.md Rule 11, tier 1. One more fix round on `e6df78b8`.
- **F1:** keep the index in step on removal: delete from `byPath`, make `byBook` a count map, point `idx.lib` and `idx.len` at the new array. Add an alternating unlink/add phase to the benchmark and an index-agreement test after removals. Done when, at 120,000 books, the median unlink+add pair is under 16 ms and moving 1,000 files in alternating pairs takes under 20 s in total. Both figures are recorded.
- **F2:** `underFolder` via `path.relative`. Case-insensitive on win32 only (compare lowercased when `process.platform === 'win32'`), exact elsewhere. Tests: drive roots (`E:\` and `C:\`), mixed case on win32, and a sibling prefix (`C:\Books2` against root `C:\Books`) rejected.
- **F3:** `.catch(log)` on the startup call at `main.js:590`, with a test that a scan rejection does not escape.
- **F4:** the invariant comment on the index, and the perf script's unused `removeDoc` dep removed.
- **Index keys:** raw `===` is accepted as a recorded deviation. It matches the base and the rest of the library code. Normalizing every library path comparison goes to LARGE-FOLDER-SYNC-2, with F5 (`refresh()` scanning the library per event).
- **Then:** a quick re-review of the fix round, then the heavy run under the load rule.
