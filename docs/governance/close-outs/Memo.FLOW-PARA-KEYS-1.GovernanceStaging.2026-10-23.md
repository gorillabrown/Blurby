# Dispatch Close-Out Governance Staging — FLOW-PARA-KEYS-1 (built and held under the Stage 8 freeze)

**Run setup:**
- **Branch:** `eb/flow-para-keys-1` from `refs/remotes/origin/eb/flow-keys-fix-1` (`60b86aff`), then `--no-ff` merges of `refs/remotes/origin/eb/focus-keys-fix-1` (`3bfb016e`; merge `5613cc56`) and `refs/remotes/origin/main` (`756d9fff`; merge `de9263a7`).
  - The only conflict was `docs/governance/BUG_REPORT.md`. It kept both branches' entries: BUG-216 to BUG-212 from Focus's branch, and BUG-211 from Flow's branch. Focus's branch carried an older OPEN copy of BUG-211, which Flow's RESOLVED one supersedes.
- **Worktree:** `C:\Projects\Blurby\.claude\worktrees\sweet-jemison-965819`. It has no `node_modules` of its own, so the gates of record ran in a clean `git archive` copy with real `node_modules`: `C:\Projects\Blurby-artifacts\keys-fix\src-5fb00ab5`.
- **Register:** nothing was written (standing rule 46). The register already shows the item In Flight.
- **Shared core:** none touched.
- **Bug:** BUG-217.

## The change

- **`src/reader/modes/flow/ModeRuntime.ts`:** the `paragraph` case calls a new `paragraphTarget(direction)`, and does nothing on `null`.
  - Tokenized: `document.paragraphBreaks`.
  - Foliate without full-book words: `surface.getParagraphBreaks()`.
  - Full-book words: `findBookParagraphStart(surface.getParagraphStarts(), sectionStarts, current, direction, lastIndex)`.
- **`src/reader/modes/flow/helpers/foliateParagraphStarts.ts` (new):** Flow's copy of Focus's amended collector (`568acc60`), with `isParagraphBlock` = `BLOCK_TAGS.has(el.localName.toUpperCase())`. There is no sibling import.
- **`src/reader/modes/flow/FoliateView.tsx`:** `bookStampedDocsRef` (a `WeakSet<Document>`) tracks the documents wrapped against the book's sections, at all three wrap sites:
  - the incremental section wrap (stamped when `bookSection` exists);
  - the first-load wrap (stamped when `liveSections()` has the section);
  - the re-stamp effect.
  `getParagraphStartWordIndexes()` runs the collector over `renderer.getContents()`.
- **`src/reader/modes/flow/surface.ts`:** `getParagraphStarts()` passes it through.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Red first, committed alone | Done, red | `16d2114f`, `tests/readerModes/flowParagraphStarts.test.ts`. On `de9263a7`, 5 of 7 tests fail, all `AssertionError`. Shift+→ from 105 gave 199, not 112: the book's last word, as live. Shift+← from 115 gave 100, not 112. The three collector cases (fr2) got `[]`. The two controls pass: the selected word, and Flow's `getBlockParent` on the text/html fixture. |
| 2 | The fix | Done | `5fb00ab5`. `flowParagraphStarts`, `flowKeys` and `focusParagraphStarts`: 3 files, 21 tests, all passed. |
| 3 | Live | Done for targets; one pre-existing finding | Below. |
| 4 | `npm test`, typecheck, build | Done | In `src-5fb00ab5`: `npm test` 186 files, 2,486 passed, 1 skipped, 0 failed; `npm run typecheck` exit 0; `npm run build` exit 0; `electron-builder --win dir --x64` exit 0. Logs: `flowpara-5fb00ab5-test.log`, `-typecheck.log`, `build-5fb00ab5.log`. In the worktree the suite failed only `tests/onnxruntime-patch.test.js` and `tests/narrate/narrate.reconcile.test.js`. Both read `<root>/node_modules/...` by path, which a worktree without `node_modules` lacks. |
| 5 | Fence | Done | `A tests/readerModes/flowParagraphStarts.test.ts`, `M src/reader/modes/flow/ModeRuntime.ts`, `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/flow/surface.ts`, `A src/reader/modes/flow/helpers/foliateParagraphStarts.ts`, `M docs/governance/BUG_REPORT.md` (BUG-217), this memo and the time log. |

### Live (Done-when 3)

The build is the x64 `--dir` package of `5fb00ab5` (`eb-out-5fb00ab5\win-unpacked\Blurby.exe`). Each run used a fresh copy of `profile-pristine` with `Session.profilePreflight`. Every run opened *Meditations*, jumped by TOC to INTRODUCTION and switched to Flow at word 187. `liveUnchanged: true` on all five runs (the live profile is hashed only). All evidence is in `C:\Projects\Blurby-artifacts\keys-fix\`.

- **Paused, `word-probe.mjs` `PARA=amend` (`flow-5fb00ab5-para.*`):**
  - Shift+→: 187 → 188 → 572 → 610.
  - Shift+←: 610 → 572 → 188 → 187.
  - All six presses equal the probe's DOM block list. These are the same values as Focus's `568acc60` run.
  - The probe's single playing row read `playing: false` at the press, so it measured a paused press (189 → 572).
- **`PARA=play`, `PARA_N=3` (`flow-5fb00ab5-play.*`):** paused 187 → 188 → 572 → 610. The three "playing" presses were 610 → 1076 → 1290 → 1354. Each equals `nextBlockStart`, but those were paused presses too.
- **Playing, scratch `flow-play-para-probe.mjs.txt` (`flow-5fb00ab5-playing.*`):** it waits until the word timer is seen advancing (219 ms) before the first press.
  - Shift+→ playing 191 → 572 (word timer and line pacer both 572; the DOM's next block start).
  - Playback then stops (`playing: false`). The later presses move as paused: 572 → 610 → 1076, then Shift+← → 610. Each is the DOM's next or previous block start.
- **A/B on the base build `60b86aff`, the same probe (`flow-60b86aff-playing.*`):** Shift+→ playing 191 → 5290, and playback stops; then 80492.
- **Control on `5fb00ab5`, Ctrl+→ while playing (`flow-5fb00ab5-ctrlright.*`):** 191 → 192, and playback stops.

No press landed on 5290, 80492, 0 or −1, or jumped thousands of words.

## Follow-up: the amended FLOW-KEYS-FIX-1 taken in (2026-10-23)

- **Merges:** in the worktree `C:\Projects\Blurby\.claude\worktrees\admiring-khorana-8019ef` (a local branch tracking `origin/eb/flow-para-keys-1`, because `sweet-jemison-965819` still has the branch checked out).
  - `--no-ff` merge of `refs/remotes/origin/eb/flow-keys-fix-1` (`1d2ee3a4`): merge `b7992f54`.
  - Then `refs/remotes/origin/main` (`1d055c8a`): merge `f78a3b28`, with no conflict.
- **Conflicts:**
  - `docs/governance/BUG_REPORT.md`: every entry kept. BUG-217 (resolved) comes from this branch. BUG-211 (resolved) takes the amendment's live-finding bullet, its browse-away bullet and its two test files.
  - `src/reader/modes/flow/FoliateView.tsx`: only the import lines conflicted. Both imports are kept: `collectParagraphStartWordIndexes` and `isFlowBrowseKey`. The keydown listener is the amendment's (`isFlowBrowseKey`, unmodified PageUp/PageDown only). The stamped-doc tracking (`bookStampedDocsRef`, at its three wrap sites and its re-wrap delete) is unchanged.
- **Gates**, in a clean `git archive` copy of `f78a3b28` with its own `npm ci` (`C:\Projects\Blurby-artifacts\keys-fix\src-f78a3b28`):
  - `npm test`: 187 files, 2,511 passed, 1 skipped, 0 failed.
  - `npm run typecheck` and `npm run build`: exit 0.
  - `electron-builder --win dir --x64`: exit 0 (`eb-out-f78a3b28`).
  - Logs: `flowpara-f78a3b28-test.log`, `-typecheck.log`, `build-f78a3b28.log`.
- **Live** on `eb-out-f78a3b28\win-unpacked\Blurby.exe`. Each run used a fresh copy of `profile-pristine`, and the preflight passed. Route: *Meditations*, TOC jump to INTRODUCTION, Flow at word 187. `liveUnchanged: true` on both runs.
  - **Paused, `word-probe.mjs` `PARA=amend` (`flow-f78a3b28-para.*`):** Shift+→ 187 → 188 → 572 → 610, then Shift+← 610 → 572 → 188 → 187.
  - **Playing, the same run:** Shift+→ 196 → 572 (word timer, line pacer and cursor all 572). It kept playing: 573, 574, 575, 576, 577.
  - **Playing, `flow-k2-probe.mjs` (`flow-f78a3b28-k2.*`; keys `Shift+Right,Ctrl+Right,Shift+Left,Ctrl+Left,Right,Left,PageDown`, 2 s after each):**

| Key, playing | Before → at | After (word timer) | Still playing | Speed change | Browsed away |
|---|---|---|---|---|---|
| Shift+→ | 191 → 572 | 572 … 579 | yes | 0 | no |
| Ctrl+→ | 584 → 585 | 585 … 591 | yes | 0 | no |
| Shift+← | 596 → 572 | 572 … 579 | yes | 0 | no |
| Ctrl+← | 584 → 583 | 583 … 589 | yes | 0 | no |
| → | 594 (no move) | 594 … 601 | yes | +25 | no |
| ← | 606 (no move) | 606 … 612 | yes | −25 | no |
| PageDown | 614 → 615 | 615 | no (paused, by design) | 0 | yes |

  The playback stop found below is gone on this tip. Only unmodified PageDown pauses and browses away, as the amendment says.

## Finding for Blurby.Roadmap (resolved by the FLOW-KEYS-FIX-1 amendment `1d2ee3a4`; see the follow-up above)

Any Flow navigation key pressed while playing stops playback live. This holds for Shift+→ and Ctrl+→, on the base `60b86aff` and on this branch. FLOW-KEYS-FIX-1's unit tests say playing keys move both pacers and continue (`flowKeys.test.tsx`), so the live app disagrees with them. That item's live check was held for f0's installer build. The likely place is the keyboard path above the runtime, but this run did not investigate it. Suggested home: FLOW-KEYS-FIX-1's live re-run, or a new item.

## Merge-train note

BAND-ALIGN-1 (`refs/remotes/origin/eb/band-align-1`, `695c658d`) also edits `src/reader/modes/flow/FoliateView.tsx`. Its edits are in other parts of the file, so expect a textual merge only.

## Lessons

- **Applied:**
  - Standing rule 43 (LL-138): the red test was committed alone and failed by assertion, with controls.
  - LL-142: measured live, and A/B'd the playback stop on the base build before attributing it.
  - LL-152: the same build recipe, book, start word and probe as Focus's `568acc60` run.
  - Standing rule 52 (LL-146): the new test is in `tests/readerModes/`, and the scratch probe's evidence copy is `.txt`.
  - Reading-mode separation: Flow's own collector copy.
- **Added:** none. No lesson-status line (standing rule 51).
