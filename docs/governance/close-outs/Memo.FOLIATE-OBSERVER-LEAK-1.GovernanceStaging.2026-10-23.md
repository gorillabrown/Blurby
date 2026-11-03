# Dispatch Close-Out Governance Staging — FOLIATE-OBSERVER-LEAK-1

Built during the Stage 8 code/lockfile freeze. It merges after the freeze lifts, on Blurby.Roadmap's go. Its steps that needed an app window waited for Roadmap's window hold to lift.
- **Branch:** `eb/foliate-observer-leak-1`, from `refs/remotes/origin/main` @ `48f473c5`.
- **Shared core:** none.
- **Fixes:** BUG-187.

## Evidence

- **Re-grep (rule 36)** against the installed foliate-js 1.0.1:
  - `View`: `#observer` at `:201`, `observe(doc.body)` at `:265`, `destroy()` at `:410-411`.
  - `Paginator`: `#observer` at `:422`, it observes `#container` at `:550`, `destroy()` at `:1157-1158`.
  - `this.#observer.disconnect()` appeared 0 times.
  - `package.json:17` is `postinstall: patch-package && …`, and `patch-package` ^8.0.1 is at `:90`. There was no `patches/` folder.
- **Done-when 1 (positive control):** `tests/foliateObserverPatch.test.js` was committed alone as `b92fcdc6`. It exited 1 with both tests failing on `expected 'destroy() {…' to contain 'this.#observer.disconnect()'`.
- **The change** (`cb7baaf7`): `patches/foliate-js+1.0.1.patch` adds 2 lines, made with `npx patch-package foliate-js` after editing the worktree's `node_modules`.
  - `View.destroy()` keeps its guarded unobserve and adds `this.#observer.disconnect()`.
  - `Paginator.destroy()` adds the same call before `this.#view.destroy()`.
  - Unchanged: our teardown order, `package.json` and the lockfile.
- **Done-when 2:**
  - A clean `npm ci` printed `Applying patches... foliate-js@1.0.1 ✔`, after which `disconnect()` appeared 2 times.
  - `npx patch-package` exited 0.
  - The test passed 2/2.
  - The built bundle's `paginator` chunk carries the change.
- **Done-when 3** (packaged `--dir` build, uninstrumented, scratch profile; `sourceFolder` null):
  - **Route:** the scripted route — open the first card, contents jump to INTRODUCTION, Focus paused 60 s, Flow playing 180 s, paused 60 s.
  - **Script:** `C:\Projects\Blurby-artifacts\reader-visual-diag-1\session.mjs`, sha256 `ffeac5f30f6a7154…`. The session JSON is `C:\Projects\Blurby-artifacts\foliate-observer-leak-1\s1-fix.json`.
  - **Result:** `error.log` gained **0** `ResizeObserver loop` lines, against **14,428** on the base over the same route (READER-VISUAL-DIAG-1, S1).
  - **Recorded, no pass mark:** 1 `Cannot destructure property 'style'` line at Focus entry. The base showed it too.
- **Done-when 4 (census):**
  - **Route:** Page → Focus 10 s → Flow 20 s, with `ro-wrap.js` (sha256 `cddd574d85552ae5…`) injected.
  - **Script:** `census.mjs`, a copy of READER-VISUAL-DIAG-1's `prod-loop.mjs` (sha256 `8a998807242b5476…`) with three harness fixes:
    1. the wrapper is evaluated in the running page instead of through `Page.reload`, which no longer re-injected on this build;
    2. it stringifies only the wrapper's counters;
    3. its geometry field is optional.
  - **Result:** 4 live observers remain — Flow ×2, the live Paginator, and the live View on a 720×10,448 body. **0** sit on a disconnected target or a 0×0 `body`, against 5 leaked on the base (S8). There were 0 loop-error events in the 20 s of Flow. The census is saved as `s8-census-fix.json`.
- **Done-when 5:**
  - `npm test` exited 0 on tree `cb7baaf7`: `Test Files 178 passed (178)`, `Tests 2432 passed | 1 skipped (2433)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0, and `npm run build` exited 0.
  - **Live:** the packaged app opened *Meditations* in Page, Focus, Flow and Narrate. Each showed its `rm-*-root` with a `foliate-view` and 5,293 stamped words. The record is `dw5-modes.json` plus four screenshots.
- **Done-when 6 (fence, `origin/main...HEAD`):** `M docs/governance/BUG_REPORT.md`, `A patches/foliate-js+1.0.1.patch` and `A tests/foliateObserverPatch.test.js`, plus this memo. No time log was kept.
  - BUG-187 reads `RESOLVED in source (FOLIATE-OBSERVER-LEAK-1)`.
  - `tests/perf-baseline-results.json` is not staged.
- **Review:** self-review, effort S. Each `destroy()` gains one line, and the guarded unobserve is kept. `disconnect()` makes a later `unobserve` a no-op, so the order is safe.

## Lessons

- **Applied:** standing rules 36, 41, 43, 44, 47, 48, 49 and 50; LL-142 (the installed file is read and the packaged app is run); LL-152 (same route, script and book as the base); LL-146 (the scripts stay in the artifacts folder).
- **Added:** none in the register.
  - CDP `Page.reload` no longer re-runs `addScriptToEvaluateOnNewDocument` scripts on this packaged build; injection now happens in the running page. This is recorded here for future live checks.
