# Dispatch Close-Out Governance Staging — READER-ARROW-GUARD-1 (built and held; merge waits for the owner's tier-2 OK)

**Run setup:**
- **Branch:** `eb/reader-arrow-guard-1`, cut from FLOW-KEYS-FIX-1's held tip `1d2ee3a4`, with `refs/remotes/origin/main` (`d2a70ff1`) merged in. `git merge-tree --write-tree origin/main 1d2ee3a4` was re-run first: clean (exit 0). The merge commit **`<base>` = `5bc18a6c`**.
- **Worktree:** `C:\Projects\Blurby\.claude\worktrees\competent-germain-51658b`, its own `npm ci`.
- **Artifacts:** `C:\Projects\Blurby-artifacts\reader-arrow-guard-1\` (this item's own folder, per the dispatch, so parallel builders don't share one; the spec named `keys-fix\`). The probe is `arrow-guard-probe.mjs` there, outside the repository (standing rule 52). Debug port 9471 (inspector 10471), checked free first.
- **Timing:** Stage 8 freeze, build-and-hold. Seq 91.
- **Register:** nothing was written (standing rule 46).
- **Shared core:** none touched.
- **Bug:** BUG-218 (the next free number on `<base>`, highest BUG-217). Other held branches may also pick 218; renumber at the merge if one lands first.
- **Re-grep (standing rule 36):** on `<base>` the listener sites are where the spec says (Narrate `:932`, `:1426`, `:1430`, `:1440`; Page `:784`, `:1179`, `:1182`, `:1188`).

## The change

- `src/reader/modes/narrate/helpers/narrateBrowseKey.ts` (new): `isNarrateBrowseKey(e)`. With Shift, Ctrl, Alt or Meta it is true only for PageUp/PageDown; otherwise true for ←, →, PageUp and PageDown.
- `src/reader/modes/page/helpers/pageTurnKey.ts` (new): `isPageTurnKey(e)`, the same condition.
- `src/reader/modes/narrate/FoliateView.tsx`: the `// Keyboard (NARR-FIX-1)` effect's condition is `isNarrateBrowseKey(e)`; the import follows `./helpers/logStartError`; the comment gains one sentence (modified arrows belong to `useReaderKeys`).
- `src/reader/modes/page/FoliateView.tsx`: `if (!isPageTurnKey(e)) return;` after the renderer check; the import follows `./helpers/foliateWordWrapping`.
- No sibling import, no module state; `boundary-policy.json` unchanged.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | k0, base live probe | Done, defect shown in both modes | x64 `--dir` package of `5bc18a6c` (`git archive` + own `npm ci`, `eb-out-5bc18a6c-x64`); scratch profile from `keys-fix\profile-pristine`; preflight passed (userData = the scratch profile); live hashes unchanged. `arrow-guard-5bc18a6-k0-{page,narrate}.json`. |
| 2 | Red first (c1 `78a69834`, alone) | Done | `npx vitest run` both files: exit 1, **20 failed / 34 passed (54)**, every failure `AssertionError: expected true to be false` (a1 and a5, 10 per file). `arrow-guard-red.log`. |
| 3 | The change (c2 `59cffaa7`) | Done | The same run: exit 0, 54 of 54 (`arrow-guard-green.log`). Wiring gates below. |
| 4 | Suite, typecheck, build on `59cffaa7` | Done | `npm test` exit 0: 188 files, **2,557 passed / 2 skipped / 0 failed**; `npm run typecheck` exit 0; `npm run build` exit 0 (`arrow-guard-{test,typecheck,build}.log`). `readerModeBoundaries`, `readerModeOwnership` and `narrate.structural` pass unedited. |
| 5 | k2, fix live probe | Done, both modes pass | x64 `--dir` package of `59cffaa7` by the same recipe (`eb-out-59cffaa7-x64`), same profile source, preflight, route and probe. Live hashes unchanged. `arrow-guard-59cffaa-k2-{page,narrate}.json`, plus `arrow-guard-59cffaa-k2-retry-narrate.json`. |
| 6 | Owner by-ear check | Added to release gate (2)'s batched list | In Narrate, Shift+→ and Ctrl+→ while narration plays: the voice does not stop or skip. |
| 7 | Fence | Done | See below. |

**Wiring gates** (pwsh-equivalent `git grep`, dry-run on `<base>` then on the edit):

| Gate | `<base>` | Edit |
|---|---|---|
| `isNarrateBrowseKey(e)` in Narrate's view | exit 1 | one line (`:1428`), exit 0 |
| `isPageTurnKey(e)` in Page's view | exit 1 | one line (`:1180`), exit 0 |
| the old three-key condition in Narrate's view | one hit (`:1426`), exit 0 | exit 1 |
| sibling-mode import in either helper | — | exit 1 (both) |

### k0 (base `5bc18a6c`)

Page, paused (location = `renderer.start`/`renderer.page`; `lastLocation.cfi` changed on every row):

| Key | Location | Highlight |
|---|---|---|
| Shift+→ | 720/1 → 1440/2 | 187 → 416 |
| Shift+← | 1440/2 → 720/1 | 416 → 187 |
| Ctrl+→ / Ctrl+← | turn forward / back | follows the page |
| Alt+→ / Alt+← | turn forward / back | follows the page |
| → / PageDown / ← (controls) | 720 → 1440 → 2160 → 1440 | follows the page |

Narrate, playing (the engine word advancing before each press):

| Key | Location | `isBrowsedAway` | `playing` | Engine word over 1.5 s |
|---|---|---|---|---|
| Shift+→ | 88/0 → 716.8/1 | false → **true** | true → true | 189–192 |
| Shift+←, Ctrl+→, Ctrl+←, Alt+→, Alt+← | every row turns back or forward a page | stays true | true | advancing every row |
| → / PageDown (controls) | page turn each | true | true | advancing |

- **The defect is shown in both modes.** Every modified arrow turned a page; in Narrate it also set browse-away.
- **Narrate did not pause.** `playing` stayed true and the engine word kept advancing in every row. The stub's "pauses narration" is not borne out live: what a modified arrow did was browse away and turn the page under the voice.

### k2 (fix `59cffaa7`)

Page, paused:

| Key | Location | Highlight |
|---|---|---|
| Shift+→ | 720/1 unchanged, cfi unchanged | 187 → −1 |
| Shift+← | unchanged | −1 → 0 |
| Ctrl+→, Ctrl+←, Alt+→, Alt+← | unchanged | 0, unchanged |
| → (control) | 720/1 → 1440/2 | 0 → 416 |
| PageDown (control) | 1440/2 → 2160/3 | 416 → 696 |
| ← (control) | 2160/3 → 1440/2 | 696 → 416 |

Narrate, playing:

| Key | `renderer.page` | `isBrowsedAway` | `playing` | Engine word over 1.5 s |
|---|---|---|---|---|
| Shift+→, Shift+←, Ctrl+→, Ctrl+←, Alt+→, Alt+← | 0 every row | false every row | true every row | advancing every row (189–192 … 222–226) |
| → (control) | 0 → 1 | false → **true** | true | 228–233 |
| PageDown (control) | 1 → 2 | true | true | 238–241 |

- **`renderer.start` moved about 27 px in two modified rows** (Ctrl+→ 88 → 114.4, Alt+→ 114.4 → 142.4), against about 630 px for a page turn. Under failure handling, re-run once after a fresh launch with no-key windows between the presses (`k2-retry`): the same 26–28 px steps appear in the **no-key** windows at the same narration points (words 201–204 and 216–219), and in the modified rows only when the voice reaches the next line (here Ctrl+← and Shift+←; Ctrl+→ and Alt+→ did not move this time). So the step is Narrate's line follow-scroll as the voice moves down the page, not the key. No modified row changed the page, set browse-away or stopped playback.
- No row was read throttled or hidden: `document.visibilityState` was `visible` before and after every press (standing rule 45).

**Finding (outside this fence, for Blurby.Brain):** in Page, Shift+→ from highlight 187 gave −1, and Shift+← then gave 0. On the base this was hidden because the page turn reset the highlight. It is Page's `paragraph` command (`PageModeRuntime.handleCommand`), not the listener: possibly the same slice-index paragraph step Focus fixed with ruling A (untraced). Not touched here; a candidate stub.

## Tier-2 question for the merge go (CLAUDE.md Rule 11)

After this item, Ctrl+←/→ and Alt+←/→ in **Page** do nothing (Page has no word seek, so the page turn they gave goes away). Shift+←/→ in Page move only the highlight, by paragraph. In **Narrate** a modified arrow does nothing visible (no browse-away, no page turn). **Recommendation: accept.** It matches Focus and Flow, where modifiers move the word and not the page, and plain ←/→ and PageUp/PageDown still turn pages. The merge waits for the owner's OK; the build did not.

## Fence

`git diff --name-status 5bc18a6c` on the tip:

- `A src/reader/modes/narrate/helpers/narrateBrowseKey.ts`
- `M src/reader/modes/narrate/FoliateView.tsx`
- `A src/reader/modes/page/helpers/pageTurnKey.ts`
- `M src/reader/modes/page/FoliateView.tsx`
- `A tests/readerModes/narrateBrowseKey.test.ts`
- `A tests/readerModes/pageTurnKey.test.ts`
- `M docs/governance/BUG_REPORT.md` (BUG-218)
- `A` this memo and `A docs/governance/close-outs/Timing.READER-ARROW-GUARD-1.jsonl`

Nothing in `src/hooks/`, the Flow or Focus mode directories, `main/`, `preload.js` or the shared-core freeze set. `tests/perf-baseline-results.json`, rewritten by `npm test`, is left unstaged.

## Package verification (standing rule 53)

Built from the code commit `59cffaa7`, with `origin/main` `d2a70ff1` merged in at `<base>`. The record commit after it changes only `docs/`, which is outside `package.json` `build.files` (`main.js`, `preload.js`, `main/**`, `dist/**`, two assets), so the package is the tip's.

- **(a) Build:** `npm run build`, then `npx electron-builder --win --dir --arm64` in this worktree: exit 0. Output `release\win-arm64-unpacked\Blurby.exe` (PE32+ ARM64). Log `rule53-build-arm64-59cffaa7.log`.
- **(b) Launch:** the built `main.js` has `BLURBY_USER_DATA_DIR` (2 hits). 25 s on a fresh, empty scratch profile (`rule53-launch-profile`, `--user-data-dir` and `BLURBY_USER_DATA_DIR`), native arm64: alive at 25 s; no `error.log`; 0 crash dumps; stdout empty. stderr holds only known noise: `Backup failed for …library.json: ENOENT` (BUG-217) and `EADDRINUSE 127.0.0.1:48924`, whose listener is pid 16120, `AppData\Local\Programs\blurby\Blurby.exe` (the owner's installed Blurby). Live profile hashes unchanged. Logs `rule53-launch-{stdout,stderr}.log`.
- **(c) asar:** `asar extract` into the artifacts folder. `dist/`, `main/`, `main.js` and `preload.js` are byte-identical to the worktree (`diff -rq`, `cmp`). No `main/` file changed in this item (`git diff --name-only 5bc18a6c` lists none); the changed files ship inside the renderer bundle in `dist/`. Listing `rule53-asar-list.txt`.
- **(d) Done-when on the packaged exe:** k2 re-run on the arm64 exe with the same probe, profile source and route (`arrow-guard-59cffaa-arm64-k2-{page,narrate}.json`): identical to the x64 k2. Page: no modified arrow moves the location; Shift moves the highlight; →, PageDown and ← turn pages. Narrate: every modified row keeps `playing` true, browse-away false, page 0, the engine word advancing; → and PageDown browse away and turn. Live hashes unchanged.
- **(e)** This section; the package path, commit and logs go to Blurby.Brain. The merge go waits for Brain's confirmation and the owner's tier-2 OK.

## Lessons

- **Applied:**
  - LL-142: probed the base live before any code; the change is judged by state reads.
  - LL-151 / LL-166: k0 is the probe's positive control; every "nothing moved" row has a control press that moves it; verdicts read location, browse-away, `playing`, the engine word and the highlight.
  - LL-152: k0 and k2 use the same package recipe, profile source, route and probe.
  - LL-165: `--user-data-dir` and `BLURBY_USER_DATA_DIR` on every launch, preflight before the first key, live hashes before and after.
  - Standing rule 43: red alone first, failing by assertion with controls passing.
  - Standing rule 44: every gate dry-run on the base.
  - Standing rule 45: visibility read on every row; the by-ear check is batched.
- **Candidate:** in Narrate, `renderer.start` moves by a line as the voice follows down the page, so "location unchanged" over a playing window needs `renderer.page` (or a no-key control window), not the raw scroll offset.
