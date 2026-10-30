# Dispatch Close-Out Governance Staging — BAND-ALIGN-2

Built and held during the Stage 8 release freeze; merges after the release on Blurby.Roadmap's go, in an integration window for `src/components/ReaderContainer.tsx`.

- **Branch:** `eb/band-align-2`, a stacked build approved by the owner through /next-dispatch on 2026-10-23:
  - from `refs/remotes/origin/eb/flow-para-keys-1` @ `100b41dd` (carries FLOW-KEYS-FIX-1 `1d2ee3a4` and FOCUS-KEYS-FIX-1 `3bfb016e`);
  - `git merge --no-ff refs/remotes/origin/eb/band-align-1` (`105a07c1`): clean, `b8ded60c`;
  - `git merge refs/remotes/origin/main` (`7c4a7a88`): clean, `f96552bd`. **`f96552bd` is the base** for every figure and fence below.
- **Merge order after the release:** BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 (and FLOW-PARA-KEYS-1) → this item.
- **Shared core:** `src/components/ReaderContainer.tsx`, two props (`flowZonePosition`, `onSetFlowZonePosition`). At dispatch, `git diff --name-only origin/main...<branch> -- src/components/ReaderContainer.tsx` printed nothing for all 24 held `origin/eb/*` branches not merged into `origin/main`. Positive control: the same command over `0cbcb04b~1...0cbcb04b` (the last main commit touching it) prints the file.
- **Shared-core guard:** `git grep -n "from \"[./]*utils/FlowScrollEngine\"" -- src | grep -v "import type"` printed nothing; `src/utils/FlowScrollEngine.ts` is not edited.
- **Conflict check:** upstream held by the owner-approved stacking · in flight: only the four stacked ancestors touch the edit sites · roadmap order ✓ · downstream: FLOW-PAUSED-LINE-1 cites `advanceZone` (its stable-window branch now places by R3) · drift ✓.

## Re-grep (standing rule 36), on `f96552bd`

- `flow/helpers/FlowScrollEngine.ts`: every cited site matches (`start` :130, the eight scheduling sites :180-182, :204-206, :273, :278-281, :300-302, :316-318, :368-370, :392-394, `followWord` :321, `rebuildLineMap` :428, `advanceZone` :738, stable branch :747-755). One drift: `start` has 9 parameters on this base, so `wordClock` is the **10th**, not the 11th.
- `flow/ModeRuntime.ts`: FLOW-PARA-KEYS-1 moved the anchors by about 17 lines; content matches: `startScrollEngine` :1156 (start call :1164), `onEngineWordAdvance` :1235 (highlight :1258), `createScrollEngine` :1278, `onScrollEngineComplete` :1313, `flow-line` :920, `moveReadingWord` :975, playing click :869.
- `focus/FoliateView.tsx`: `resolveFoliateScrollContainer` :425, `getFlowViewportHeightPx` :455, `applyVisualHighlightByIndex` :567 (motion :591), `centerResolvedTokenInReadingWindow` :607, arrival :1065-1071, zone effect :1187. `flow/FoliateView.tsx`: highlight :579, click scroll :619, arrival :1144-1150, zone effect :1267.
- `ReaderBottomBar.tsx` zone controls :344-362; `ReaderContainer.tsx` :815-816; `constants.ts` :252; `types.ts` :169-170; stub :72; `flowReadingZone.test.ts` :73-74, :99-100, :204-206.

## Base re-measure (before the change), `f96552bd`

Same recipe for base and tip (LL-152): an x64 `--dir` package from a clean `git archive` copy with its own `npm ci`, a fresh scratch profile per run, and the profile preflight (LL-165: `app.getPath('userData')` read over the main-process inspector equals the scratch profile before any input; the live `settings.json` and `library.json` hashes are unchanged after every run). Driver `C:\Projects\Blurby-artifacts\band-align-2\band-live.mjs`, probe `band-probe-2.js` (a superset of READER-VISUAL-DIAG-1's `band-probe.js`: the same band and cursor fields, plus line boxes, edge distances, the cursor's place in the band, the anchor offset). *Meditations*, READER-VISUAL-DIAG-1's route: Page TOC jump to INTRODUCTION → Focus (i) → click a word about 20 lines down (the lowest visible line when 20 are not on screen) (ii) → TOC jump to the next entry (iii) → TOC INTRODUCTION → Flow → Play, 180 s, one probe a second. Records `base-100.json`, `base-120.json`.

| Base `f96552bd` | 100% | 120% |
|---|---|---|
| Focus (i) TOC → Focus | out (cursor 120.7 px above the band) | out |
| Focus (ii) click | in (4th of 4 full lines) | in (4th of 5) |
| Focus (iii) TOC next | no cursor in the loaded section | no cursor in the loaded section |
| Flow, underline outside the band | **99 / 178** | **128 / 178** |
| Flow, a band edge inside a glyph | 175 / 178 | 176 / 178 |
| Flow, cursor not the band's 3rd line (mid-section) | 157 / 172 | 160 / 172 |

## Red first (standing rule 43)

`tests/readerModes/bandAlign2.test.tsx` committed alone as `368dcc15`. On the base `npx vitest run tests/readerModes/bandAlign2.test.tsx` exited 1: 21 of 22 failed by assertion, and (c1) passed.

- (f1) `176 ticks drifted`; (f3) `expected { line: 4, word: 20 } to deeply equal { line: 0, word: 0 }`; (f4) `the word timer's crossing hands off at once: expected [] to deeply equal [ 1 ]`.
- (m1), (r1)–(r4), (r6) helpers, in each of Focus and Flow: `helpers/foliateLayout.ts has no <helper>`.
- (r5), (r6) bottom bar, in Focus and Flow: `the three anchor buttons: expected [ false, false, false ]`, `the four Lines buttons: expected [ false, false, false, false ]`.
- (m2): `the arrival centred the word with scrollIntoView: … called 1 times`; (r6) view: `expected '15%' to be ''`.
- f4 was first written with a 1,401 ms window and passed on the base, because the old pacer's own clock completes the last line at 1,050 ms; it was tightened to assert at 1,001 ms, when the word timer reaches 100, before the red commit.

A second pair, (p1) and (p2), was added after the first live run (below) and committed alone as `5e654145`: on `d6d6373e`'s tree both failed by assertion (`no write reached the provider: expected undefined`, `the arrival wrote no containerPosition: expected 0 to be greater than 0`), and both pass on the tip.

## The change

- **`860ad3ca` Flow's one clock.** `FlowScrollEngine.start` takes `wordClock` (10th parameter). Under it the pacer schedules none of its own lines (all eight sites gated) and follows the word timer through `syncToWord`. On a line change it places the line by the band rule, in e-ink only at a page step. It moves the cursor bar, and past the last line it hands off once (latch reset in `start`, `rebuildLineMap` and the seeks). `ModeRuntime.startScrollEngine` passes `true` and the band settings (`setBandLayout`). `onEngineWordAdvance` syncs after every found word and returns early when Flow paused to turn the page. `applySettings` re-places the band on an anchor or Lines change.
  - **Section hand-off:** `onScrollEngineComplete` now takes the first section starting at or after the published word (`>=`). Under one clock that word is already the next section's first word, where the old line clock handed off on the last rendered word.
- **`8686b0a9` R1–R5.**
  - **Helpers** (identical copies in `focus/` and `flow/helpers/foliateLayout.ts`): `normalizeBandLines`, `normalizeBandAnchor`, `computeBandScrollTop` and `isLineInBand` (m1), `bandAnchorY`, `computeAnchorScrollTop`, `computeBandEdges`, `collectLineBoxesAround`.
  - **Views:** `alignSpanToBand` scrolls the cursor line's centre to the anchor (clamped), then places the band from the line boxes. It runs at arrival (instead of `scrollIntoView({ block: "center" })`), on every highlight with motion (a move without motion places the band only), and on click and selection (instead of `scrollToAnchor` minus the follow offset). The zone effect sets the insets, then places the band around the cursor (scrolling only when the anchor or Lines changed), or at the anchor before a cursor exists. Off adds `rm-<mode>-view--band-off`, which drops the mask in `mode.css`.
  - **Flow bindings:** while playing, the line pacer reports the band's edges and `useModeBindings` writes them (or removes the properties for Off).
  - **Bottom bar:** **Top · Top third · Center** and **3 · 5 · 7 · Off** button groups with `aria-pressed`, in Focus and Flow, replacing the 3–8 slider. `ReaderContainer.tsx` passes `flowZonePosition` and `onSetFlowZonePosition`.
  - **Constants:** `FLOW_READING_ZONE_POSITION` = 1/3; `FLOW_BAND_ANCHOR_TOP/_TOP_THIRD/_CENTER`, `FLOW_ZONE_LINES_OPTIONS`, `FLOW_ZONE_LINES_OFF`. `FLOW_ZONE_INITIAL_TOP` still sets the leading and trailing insets and Narrate's band.
- **`31ebe974` scroll through Foliate's renderer (live finding) and review fixes.** See "Live finding" below.

## Pinned tests (standing rule 50)

- `tests/flowReadingZone.test.ts` (named in the spec): `:73-74` `expect(FLOW_READING_ZONE_POSITION).toBe(0.25)` → `toBe(1 / 3)`; `:204-206` options `[0.15, 0.25, 0.35, 0.55]` → anchor options `[0, 1 / 3, 0.5]`. `:99-100` compares the default with the constant and passes unchanged.
- `src/test-harness/electron-api-stub.ts:72` (named): `flowZonePosition: 0.25` → `1 / 3`.
- `tests/readerModes/zoneLineStep.test.ts` (b1d, **not** named in the spec): edited under Blurby.Roadmap's tier-1 ruling of 2026-10-23 (no Blurby Brain session was reachable).
  - Old: `expect(bottom).toBeCloseTo((FLOW_ZONE_INITIAL_TOP + (FLOW_ZONE_LINES_DEFAULT * 27) / VIEW_H) * 100, 2)` (36.43%).
  - New: `expect(bottom - top).toBeCloseTo(((FLOW_ZONE_LINES_DEFAULT * 27) / VIEW_H) * 100, 2)` (21.43%), and `expect(top).toBeCloseTo(((VIEW_H / 3 - (FLOW_ZONE_LINES_DEFAULT * 27) / 2) / VIEW_H) * 100, 2)` (22.62%, the Top-third anchor).
  - Rule 43: on the base tree it fails (`zone top 15%`, expected 22.62%); with the fixture at a 24 px step it fails (`zone height 19.05%`); on the tip it passes.
- `tests/useReadingModeInstance.test.ts` pins the source text `const found = this.surface.highlight(idx, "flow", { allowMotion: false });`. The first restructure broke it; `fb1745d1` restored the exact text. Not edited.

## Gates (owner's machine, standing rules 47 and 48)

- Tip `31ebe974`: `npm test` exit 0, `Test Files 189 passed (189)`, `Tests 2542 passed | 1 skipped (2543)`; `npm run typecheck` 0; `npm run build` 0.
- Done-when 2: `npx vitest run tests/readerModes tests/flow-scroll-engine.test.js tests/flowReadingZone.test.ts tests/flowZoneAuto.test.ts` passes. `tests/flow-scroll-engine.test.js`, `flowKeys.test.tsx` and `focusKeys.test.tsx` are unedited. None asserted the line pacer's own clock. The engine test mocks `src/constants.ts` wholesale, so the engine normalises the band settings lazily, inside the stable branch only.
- First full run (`d6d6373e`): 2 failed. One was the `useReadingModeInstance` source pin above. The other was G1 (`readerModeBoundaries.test.ts`): the new constants were not declared in `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`. They were added there, as FOCUS-KEYS-FIX-1 did for its constants.

## Live finding: the line pacer's scroll never landed (pre-existing)

The first tip run (`fb1745d1`, records `fb1745d1-tip-*.json`) had Flow's underline outside the band in 81 / 178 samples. The samples show that while Flow played, the cursor walked down the view (top 74 → 452 px) with the band following it, so the text never scrolled. The base shows the same walk (74 → 317 px, then oscillating).

- **Cause:** Foliate's scrolled paginator scrolls `#container` inside a **closed** shadow root (`node_modules/foliate-js/paginator.js`, `attachShadow({ mode: 'closed' })`). `resolveFoliateScrollContainer` cannot reach it. A document-wide dump during play found nothing with `scrollHeight > clientHeight`, so every `scrollTop` write on the resolved container moved nothing. The renderer exposes the real position: `containerPosition` (get/set), `size`, `viewSize`.
- **Fix (`31ebe974`):** the line pacer reads and writes the scroll through a provider on its container (`FLOW_SCROLL_POSITION_PROVIDER_KEY`, the same pattern as `FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY`), which Flow's view backs with the renderer. Both views' `alignSpanToBand` scroll the same way. Without a renderer the element's own `scrollTop` is used, as before. Red rows (p1) and (p2) above.
- **Lesson candidate (provisional label; number at fold-in):** a scroll that "works" in jsdom can be a no-op live when the real scroller is in a closed shadow root. Prove a scroll landed by reading the scroll position back through the component's own API (here `renderer.containerPosition`), not by the absence of errors. It is the LL-166 pattern for scroll writes.

## Review (reviewers in parallel)

- **Spec compliance:** no gaps. All Done-when, red rows and R1–R5 met. Each known deviation was judged justified: the 10th parameter, the m1 helpers kept, the r3 reading, `>=`, the three out-of-fence files, and the e-ink early step.
- **Quality:** MINOR_FIXES, 5 warnings, all applied in `31ebe974`. (1) The insets are set before the band is placed. (2) A resize or section load re-places the band without scrolling; only an anchor or Lines change scrolls. (3) A word between line ranges keeps its line (it fell to line 0). (4) `collectLineBoxesAround` cost (one `querySelectorAll` of the section per call): not changed. It was not measured (Pike rule 1); the 180 s Flow runs kept the cursor in the band in every sample at 300 wpm. Measure it before optimising. (5) Two band writers while playing: the line pacer now reports the band on every line change, e-ink included, from one `reportBand`, so both writers compute from the same lines. Notes: (6) seeks reset the hand-off latch (applied). (7) `>=` could re-enter the current section on the old clock; Flow's runtime always runs `wordClock`, so it was left. (8) The band holds still while the reader browses away, as specified.

## Live, tip `31ebe974` (same recipe as the base)

Records: `tip-100.json`, `tip-120.json`, `tip-100-extras.json`, `tip-120-extras.json`, `tip-eink.json` (and the superseded `fb1745d1-*` runs). Every run: preflight equal, not under the live profile; live hashes unchanged; the window closed at the end of the run.

| Row | 100% | 120% | Base 100% / 120% |
|---|---|---|---|
| Focus (i) TOC INTRODUCTION → Focus | **in** (cursor centre 200.1 px, anchor 198.2) | **in** | out / out |
| Focus (ii) click about 20 lines down | **in**, the band's 3rd line | **in**, 3rd | in / in |
| Focus (iii) TOC next entry | no cursor in the loaded section (see Open) | same | same |
| Flow, underline outside the band (180 samples) | **0 / 178** | **0 / 178** | 99 / 128 |
| Flow, cursor not the band's 3rd line (mid-section) | **0 / 171** | **0 / 172** | 157 / 160 |
| Flow, a band edge inside a glyph | 14 / 178 | 13 / 178 | 175 / 176 |

- **Edges:** mid-section, each edge sits 3.1 px (100%) or 4.1 px (120%) from the nearest glyph box, the midpoint of the line gap; 12–15 px at a paragraph gap. Of the 14 zero-distance samples at 100%, 12 are on the section's first lines, where R1 makes the edge the line's own box edge. 2 are mid-section (words 554 and 570), where the bottom edge touches the next line: about 1% of samples.
- **Top of a section:** in Focus (i) and Flow's paused arrival, word 187 (INTRODUCTION's first line) is inside the band. The scroll put its centre at the anchor (200.1 px against 198.2). Per R2 the band takes the lines that exist: the cursor line plus two below (3 full lines). So the band's centre is on line 2, not on the cursor line. This follows R2's text; Blurby.Roadmap was told.
- **Anchor**, at a mid-section word (cursor line centre minus anchor y; half a line is 13.5 / 16.5 px):

  | | Top | Top third | Center |
  |---|---|---|---|
  | Focus 100% | −0.3 | +0.2 | +0.3 |
  | Flow 100% | −0.4 | +0.1 | +0.2 |
  | Focus 120% | 0.0 | +0.3 | −0.4 |
  | Flow 120% | +0.3 | −0.2 | −0.1 |

- **Lines:** at 3, 5 and 7, in Focus and Flow at both sizes, the band covers exactly 3, 5 and 7 full lines, none cut, with the cursor 2nd, 3rd and 4th. At Off, the computed `mask-image` is `none` (no dimming anywhere) and the cursor word is still marked. `aria-pressed` is true on the pressed button each time, and the settings read back as `flowZoneLines` 5 and `flowZonePosition` 1/3 after the reset.
- **E-ink** (100%, 150 s, `tip-eink.json`): 445 words, lines 0–31, cursor on screen in 1,361 / 1,361 samples (10 Hz).
  - The scroll changed 4 times: twice at the start (204 → 180 px, the arrival and the pacer's start), a page step at **line 18** (713.6 px), and a 3.2 px adjustment at line 22.
  - There is no per-line scroll.
  - **Deviation:** the page step came at line 18, not at the page start + 20. `syncToWord` also steps when the next line's bottom would fall below the view. At 100% with paragraph spacing, 20 lines did not fit in the 594 px view, so the early step kept the underlined word on screen (the row's third condition). Without it the cursor would have left the view before line 20.

## Open (for Blurby.Roadmap)

- **Focus (iii) cannot be measured:** after a contents jump in Focus no cursor is painted in the new section (base and tip alike). `handleCommand`'s `go-to-href` only calls `surface.goTo(href)`, and the relocate publishes an approximate index that no span shows. Which word becomes the reading word after a contents jump is a behaviour question, outside this item.
- **FLOW-PAUSED-LINE-1** cites `advanceZone`, whose stable-window branch now places the line by R3.
- **The timing helper** appended cost backfill events to 19 other dispatches' `Timing.*.jsonl` logs when this item's log opened. They are outside the fence, left uncommitted, and need no action.

## Lessons

- **Applied:** standing rule 43 / LL-138 (red first with the c1 control; the b1d edit and p1/p2 shown red then green). LL-142 (H3's two clocks proven by f1 and the live count). LL-152 (base and tip on one recipe). Rule 36 (re-grep). Rules 41, 46–51 (fence named; nothing written to the register; gates on this machine; no sha in BUG-188; pinned tests named; no lesson-status line). LL-156 (pinned tests named). LL-165 (profile preflight on every launch). LL-166 (state read through the probe, and the no-scroll verdict read from scroll positions).
- **Added (candidate):** the closed-shadow-root scroll, above.

## Done-when 7 (owner, next smoke batch)

In Focus and Flow: the band's edges sit between lines; the cursor line is the band's middle line; at the top of a section the band is on the cursor; each of the three anchor buttons moves the text to that spot; Lines 3, 5 and 7 change the band's height, and Off removes it.

## Wave 2 — owner amendment R6 (2026-10-23): no band on the cover

- **Branch:** built on `origin/eb/band-align-2` @ `4ab25f8b` (one time-log commit after `508be445`), with `origin/main` merged in (`cfc44269`). Pushed to `refs/heads/eb/band-align-2`. Not merged.
- **Measured first (no code change), packaged `--dir` build of `cfc44269`** (clean `git archive` copy with its own `npm ci`). Fresh scratch profile per run; the profile preflight passed (LL-165); the live hashes were unchanged on every run. Probe `C:\Projects\Blurby-artifacts\band-align-2-r6\cover-probe.mjs` (pattern: `keys-fix/word-probe.mjs`). It reads the zone host's `--flow-zone-*`, its class and its computed `mask-image` (LL-166).
  - **The cover is image-only:** section 0 has 0 stamped words, 1 image and no text. No ruling on title pages is needed.
  - **Base:** in both Focus and Flow the cover set `--flow-zone-top` 23.8% and `--flow-zone-bottom` 42.9%, and the mask dimmed the page. There was no cursor. The cause was the zone effect's `placeBandAtAnchor` when no cursor span exists.
- **Red first (rule 43), `2f44528f`:** `tests/readerModes/bandAlign2Cover.test.tsx`. On the unchanged code, (c6) "no stamped words, no band" and (c7) "a highlight that finds no word removes the band" fail by assertion in both modes. The (c8) control, "a text section keeps its band", passes.
- **Fix:** `eabd0c07`, `bba582e5`, `df80e5dc`.
  - Each mode's view has its own `hideBand()`: it clears the `--flow-zone-*` properties and adds the band-off class, as Lines Off does. It replaces `placeBandAtAnchor` when no cursor is painted. It also runs when a highlight finds no word (except while browsing away) and when the cursor span has no line boxes.
  - Placing a band removes the class. That covers the view and both band paths of the line pacer in `flow/useModeBindings.ts`. Live runs found each of those pacer paths in turn.
  - There are no imports between modes.
- **Pinned test (rule 50), edited under Blurby.Roadmap's tier-1 ruling of 2026-10-23:** `tests/readerModes/zoneLineStep.test.ts` (b1d), commit `89862a91`.
  - **Old:** with no word painted, some element carries `--flow-zone-bottom`, the band is 21.43% tall, and its top is at the Top-third anchor (22.62%).
  - **New:** no `--flow-zone-*` before any word is painted. Then, with word 17 painted, the zone host's `--zone-line-step-px` is 27, the band is 5 × 27 / 630 = 21.43% tall, and it contains the cursor line.
  - **Red:** fails on the pre-R6 Focus view (band at 22.62% with no cursor), and with a 24 px pitch (step 24, not 27). **Green** on the tip.
  - No other pinned test was touched.
- **Live, packaged build of `df80e5dc`** (same recipe and probe):

  | Check | Focus | Flow |
  |---|---|---|
  | Cover | no `--flow-zone-*`, band-off, mask `none` | no `--flow-zone-*`, band-off, mask `none` |
  | First text section | arrival on section 1 (3 PageDown in Page): band 34–434 px, cursor "MEDITATIONS" 194–228 px inside it, dimmed | Play from the cover: band 113–215 px, cursor 115–145 px inside it, dimmed; paused again: band 115–223 px, cursor inside |

  On `eabd0c07` the pacer set the band while Flow played, but the class stayed and nothing dimmed. `bba582e5` and `df80e5dc` fix its two band paths.
- **Recorded, unchanged (Blurby.Roadmap: no change):** after PageDown Flow is browsing away. A paused Ctrl+Right then repaints the cursor, but the band does not move ("the band never moves while browsing"). The base does the same. Play brings the band back.
- **Gates on `df80e5dc`:** `npm test` exit 0, 190 files, 2,547 passed / 2 skipped. `npm run typecheck` 0. `npm run build` 0.
- **Fence (Wave 2):** `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/focus/FoliateView.tsx`, `A tests/readerModes/bandAlign2Cover.test.tsx`, plus this memo and the time log. Outside the fence: `M src/reader/modes/flow/useModeBindings.ts`, accepted for BAND-ALIGN-2 earlier, and `M tests/readerModes/zoneLineStep.test.ts` (b1d, under the ruling). `src/utils`, `ReaderContainer.tsx`, `src/types.ts`, Page, Narrate, `main/` and the `mode.css` files are untouched.

### Package verification (standing rule 53 / LL-167), `df80e5dc`

- **Package:** `C:\Projects\Blurby-artifacts\band-align-2-r6\eb-out-df80e5dc\win-unpacked\Blurby.exe`, from `npx electron-builder --win --dir --x64` on a clean archive of `df80e5dc`, which contains `origin/main`. It has its own output directory; nothing was built over another build. Log: `build-df80e5dc.log`.
- **`BLURBY_USER_DATA_DIR`:** 2 hits in the packaged `main.js`.
- **25 s launch on a fresh scratch profile:** alive at 25 s; no crash dump; stdout empty.
  - stderr holds 20 `[ws-server]` lines: `listen EADDRINUSE 127.0.0.1:48924`, 10 retries, then "giving up" (corrected by Blurby.Brain; first reported as 6). The port belongs to the installed Blurby, `C:\Users\estra\AppData\Local\Programs\blurby\Blurby.exe`, pid 16120, which was running. That is environmental: this branch changes no `main/` file.
  - **Pre-existing, not clean:** stderr's first-launch line `Backup failed for …\profile\blurby-data\library.json: ENOENT … copyfile`. It is benign on a fresh profile, and it predates this branch (no `main/` file changed).
  - No other error, unhandled-rejection or crash line.
  - Logs: `pkgcheck-df80e5dc/`.
- **`asar list`:** no `main/` file changed in this wave. The renderer bundle in `app.asar` (`dist/`) is identical to the build's `dist/` (`diff -rq` clean).
- **Done-when re-run on the packaged exe:** the cover and text-section rows above.
- **Blurby.Brain confirmed, 2026-10-23.**
  - The extracted `main.js`, `preload.js` and `main/` match `git archive df80e5dc` byte for byte, and `dist/` matches the build's.
  - `main` has since moved to `a87153be` with docs and governance commits only. Nothing under `build.files` changed, so the package is equivalent; `merge-tree` is clean.
  - Superseded outputs deleted on Brain's word: `eb-out-89862a91`, `bba582e5`, `cfc44269` and `eabd0c07`. `eb-out-df80e5dc` stays until the merge lands.

## R7 (2026-10-30) — add space, band fixed. Superseded by the owner's paragraph-band ruling, 2026-10-30; the leading-space work carries forward

- **Status:** R7 is superseded by the owner's paragraph-band ruling of 2026-10-30, relayed by Blurby.Brain1: the band covers the paragraph that holds the selected word; a page with no word has no band; the 3/5/7 line count and its control go away. Blurby.Roadmap is writing R8. The band extent was not changed here. Branch `eb/band-align-2-r7-work`, pushed with `HEAD:refs/heads/eb/band-align-2-r7-work`. Not merged.
- **Owner's answers (Q1–Q5) and Brain's rulings (T1, T2):** as in `docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md`. Q1: the band is fixed at both ends. Q2: zero-word sections get no leading space. Q3: ≤ 6 px on the title row. Q4: Flow and Focus only. Q5: belongs to FOCUS-WORD-ONLY-1. T1: the pair check covers `dist/`, `main/`, `main.js`, `preload.js` and `package.json`, and both asar SHA-256 values are recorded. T2: `origin/main` is merged into the base first.
- **M = `70e739ea`:** `origin/main` `80dbe938` merged into `85e32777`. Only `docs/governance/BUG_REPORT.md` conflicted. It was resolved as main's file whole, with BUG-188's Status line replaced by the branch's line. Main's replaced line reads "**Status:** OPEN — measured by READER-VISUAL-DIAG-1 (2026-10-23, …)". The re-applied line reads "**Status:** band height and band placement RESOLVED in source (BAND-ALIGN-1, BAND-ALIGN-2). …". The branch's hunks for BUG-217 (main had also changed it), BUG-211 and BUG-210 were dropped in favour of main's text. Records: `C:\Projects\fdl1-job\r7-replaced-main-line.txt`, `r7-reapplied-line.txt` and `r7-dropped-hunks.txt`.
- **Red first (rule 43), C1 = `3aeca116`:** `tests/readerModes/bandAlign2R7.test.tsx`, plus the in-scope edits to the pinned r2/r3 in `tests/readerModes/bandAlign2.test.tsx` (BandHelpers gains `stepPx?`). On M: 26 failures, all by assertion, across a1–a4, b1, b2, w1–w5, r2 and r3 in both modes. The controls c1 and c2 pass (4 passed).
- **Change, C2 = `a5273704`:**
  - Each mode's own `helpers/foliateLayout.ts` gains `computeLeadingInsetPx` and `computeTrailingInsetPx` (the anchor's offset and its mirror). The two copies are still byte-identical, and neither imports the other.
  - `computeBandEdges` gains `stepPx` and extends the band by the line step at a section's ends.
  - Both `FoliateView.tsx` files: the inset getters read the zone line step. The leading inset is written only to documents with stamped words, and `0px` to the rest (Q2). `applyZoneProperties` writes the insets, and `applyZoneRef` runs after stamping and after section load.
  - Flow's `helpers/FlowScrollEngine.ts` `reportBand` passes the zone step.
  - `flow/useModeBindings.ts` effect 5 adds `settings.settings.flowZonePosition` and `settings.settings.flowZoneLines` to its deps. This is the W3 correction, using `settings.settings.*` after TS2339; Brain accepted it.
  - (b2) was amended under Brain's ruling A. It gates on step 20, the heading centred on the anchor and the heading inside the band, and records the exact edge deltas −6.5 and +9.
- **Gates on `a5273704`:** the Done-when 2 set passed 399/399. `npm test` exit 0: 191 files, 2,574 passed / 1 skipped / 0 failed. `npm run typecheck` 0, `npm run build` 0. The Done-when 5 import grep is clean.
- **Probe:** `C:\Projects\Blurby-artifacts\band-align-2-r7\tools\r7-probe.mjs`. It adapts `cover-probe.mjs` (`bbdbf949`, `band-align-2-r6/`) and runs through the job-2 `run.mjs` launcher, which records the LL-165 scratch-profile proof and the live hashes. The changes from the original:
  - `Session`/`enter` are replaced by direct CDP steps.
  - The reads add the cursor section's line boxes, a uniform/boundary classification (equal gaps within 1 px over the band window plus one line either side), anchorY, the leading and trailing insets, `bodyTop` and the band-off class.
  - New rows: L1, L1T (the title row against a mid-section reference), L2 (with `L2START=text`), L3 and L5.
- **Live, packaged x64 build of `a5273704`.** Every run used a fresh scratch profile and passed its proof, and the live `library.json`/`settings.json` hashes were unchanged.
  - **Deviation:** section 1's first stamped word is "The"#0 (Gutenberg front matter), not "MEDITATIONS". The title row is "MEDITATIONS"#135/#136. Section 1 has no evenly spaced window anywhere, with gaps of 20.8–199.4 px.
  - **L1 — held, then superseded.** The title row exceeds 6 px at every anchor and Lines value. The cursor line's centre sits on the anchor within 0.4 px, and the cursor is inside the band in every sample. Each edge is exactly halfway into the gap past the n-th real line, so R1 works as written and the front matter's spacing stretches it. Δ is a band edge relative to the cursor line's centre, title row minus a uniform reference in INTRODUCTION (27 px pitch):

    | Mode | Anchor / Lines | Title band (px) | Reference band (px) | Δtop | Δbottom |
    |---|---|---|---|---|---|
    | Focus | Top / 5 | 0–278.3 | 0–134.9 | +13.8 | +157.2 |
    | Focus | Top third / 5 | 34.2–434.3 | 130.9–265.9 | −107.9 | +157.2 |
    | Focus | Center / 5 | 139.2–539.3 | 229.9–364.9 | −107.9 | +157.2 |
    | Focus | Top third / 3 | 82.0–310.7 | 157.9–238.9 | −87.1 | +60.6 |
    | Focus | Top third / 7 | 0–560.6 | 103.9–292.9 | −115.1 | +256.5 |
    | Flow | Top / 5 | 0–276.7 | 0–133.3 | +13.8 | +157.2 |
    | Flow | Top third / 5 | 32.6–432.7 | 129.3–264.3 | −107.9 | +157.2 |
    | Flow | Center / 5 | 137.6–537.7 | 228.3–363.3 | −107.9 | +157.2 |
    | Flow | Top third / 3 | 80.4–309.1 | 156.3–237.3 | −87.1 | +60.6 |
    | Flow | Top third / 7 | 0–559.0 | 102.3–291.3 | −113.5 | +256.5 |

    Brain ruled (c), an owner question. The owner answered with the paragraph band (above). L1e and the 120 % rows were not run.
  - **L3, cover — PASS** in Focus and Flow. `--flow-zone-*` is empty, the band-off class is present, mask `none`, 0 stamped words, and the cover's leading inset is `0px` (the base M has `95px`). The cover frame sits at 24 px, which equals the renderer's own `margin="24px"`, at scroll 0. The base is the same.
  - **L4, Page — PASS.** In Page, section 1's leading and trailing insets are `0px`.
  - **L2, Flow playing — not measurable as specified; pre-existing.** Play from the cover never leaves the cover in 60 s, on M and on the candidate alike. Started on section 1 (`L2START=text`, after R6's arrival):
    - The cursor plays #136 → NOTES#185. Then, at the end of section 1, the band switches off, the cursor disappears, and play never enters section 2. Samples 13–30 have no cursor, on M and on the candidate alike.
    - With a cursor: the candidate's centre is about −10 px from the anchor (M about −4), within half a step (10.8). The cursor is outside the band in 2 of 12 samples on the candidate (MARCUS#140, NOTES#185) and in 1 of 12 on M (NOTES#185).
    - When Play starts, both builds put the cursor at 24 px (−169 px from the anchor) for one sample.
  - **L5 — not measurable:** after the section-end stall there is no cursor while playing, on both builds. The candidate's leading inset changes 198 → 298 px on Top third → Center.
  - **Recorded for Blurby.Roadmap via Brain:** in Focus, "Next chapter" does not leave section 1 (3 clicks, no move). A synthetic click on a word scrolled out of view past BOOKS moves the view to section 2 with no cursor and the band switched off. The candidate logs 540–730 ResizeObserver-loop lines per run because it does not carry `51759276`.

### Package verification (standing rule 53, Temporary placement), `a5273704`

- **(a) Packages:** `C:\Projects\Blurby-artifacts\band-align-2-r7\out-x64\win-unpacked` and `out-arm64\win-arm64-unpacked`, built from `a5273704` (which descends from M) with `--dir`. Log: `C:\Projects\fdl1-job\r7-pkg.log`.
  - `app.asar` SHA-256: x64 `01d932638cbf3f149fe108880e18ca3c1a57db83d06bc4d6d2057bd82ca7f399`, arm64 `01d932638cbf3f149fe108880e18ca3c1a57db83d06bc4d6d2057bd82ca7f399` (identical).
  - Pair check over `dist/`, `main/`, `main.js`, `preload.js` and `package.json`: **0**. Extracted to `asar-x64` and `asar-arm64`.
- **(b)** `BLURBY_USER_DATA_DIR` appears at `main.js:27` and `:29`. **25 s x64 launch** on a fresh scratch profile (`live/rule53-x64-25s`): proof passed, alive at 25 s, no error log written, no flagged stdio lines, no crash dump.
- **(c)** `asar list` shows `\dist\index.html`. Against the base M package (`out-base-x64`, asar `62bdbfef…`): `main/`, `main.js`, `preload.js` and `package.json` are identical, and 6 renderer chunks differ (App, epub, index, settings, tts, view).
- **(d)** The live rows above ran on the x64 package.
- **arm64 launch:** at merge time (R-2026-10-30-2).

### Gate (2) owner row

Withdrawn with R7: the paragraph-band ruling replaces the band-at-fixed-height wording. R8 will carry its own row.

## R7a (2026-10-30, BUG-235)

**Spec:** `docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7a.md`. Host: RodneySr (job 7). Branch `eb/band-align-2-r7a-work`, to be pushed to the held `eb/band-align-2` as a fast-forward. Not merged.

### Bisect and diagnosis

- **Bisect (RodneySr job 6, `C:\Projects\Blurby-artifacts\bug-235-bisect\`):** `860ad3ca` ("Flow runs on one clock") is the first bad commit. Its last cursor is NOTES#185, it never crosses, and 20 samples have no cursor. `b8ded60c` and `f96552bd` are good: both cross at L2 15 (AURELIUS#189). `368dcc15` adds only a test.
- **Diagnosis (Blurby.Brain1):** under `wordClock`, the section hand-off fires only in `FlowScrollEngine.syncToWord`, and `onEngineWordAdvance` reached `syncToWord` only after a successful highlight. A word past the last rendered line cannot be highlighted, so it took the pause-and-`surface.next()` path, and the hand-off was unreachable.

### Base M7a

`4f464b7a`: a `--no-ff` merge of `origin/main` `db43bd3c` into `f3f254f3`. **Conflicting files: none.** `HEAD^1` is `f3f254f3`; `origin/main` is an ancestor. `package.json` and `package-lock.json` are unchanged, and no code differs from `f3f254f3`.

### Red (C1 `81281523`, standing rule 43)

`npx vitest run tests/readerModes/flowSectionHandoff.test.tsx` exits 1: 4 failed, 3 passed. Log: `C:\Projects\Blurby-artifacts\band-align-2-r7a\r7a-red.log`.

| Row | On the tip | Failure |
|---|---|---|
| (h1) | failed | the pacer's hand-off, and no page turn for a past-end word: expected `{ goToSection: [], next: 1 }` to deeply equal `{ goToSection: [ [ 1 ] ], next: 0 }` |
| (h2) | failed | `handoffHold`: expected undefined to be null |
| (h3) control | passed | — |
| (h4a) control | passed | — |
| (h4b) control | passed | — |
| (h5) | failed | the hold begins with the hand-off: expected [] to deeply equal [ [ 1 ] ] |
| (h6) | failed | the sequence stops at 99, 100 (miss), with no found 100 and no 101–104 |

(h1)'s failure is the diagnosis confirmed: on the tip, word 100 is not found, `surface.next` is called once, and `goToSection(1)` never is.

**F-red, one test-only round:** the first run (`r7a-red-try.log`) recorded 95 twice in (h6), because `start()` highlights its start word with `allowMotion: true` and that is not a word advance. The sequence now records only word-advance and resume highlights. (h1)'s hand-off and page-turn checks were joined into one assertion so the red output shows both counts.

### The change (C2 `20b3d5f8`, Done-when 2–3)

- E1–E5 as specified, in `FlowScrollEngine.isPastRenderedEnd`, `FlowModeState.handoffHold`, `onEngineWordAdvance`, `onWordsReextracted`, `pausePlayback` and `stop`. BUG-235's status reads RESOLVED in source (BAND-ALIGN-2 R7a).
- `flowSectionHandoff.test.tsx`: 7/7.
- `tests/readerModes`, `flow-scroll-engine`, `flowZoneAuto`, `readerModeIsolation` and `readerModeOwnership`: 27 files, 306 tests, exit 0. No existing file was edited.
- `npm test`: **192 files passed; 2,581 passed, 1 skipped, 0 failed.** `npm run typecheck` 0; `npm run build` 0.
- Fence: `git diff --name-only 4f464b7a HEAD -- src/utils src/components src/types.ts src/constants.ts main src/reader/modes/focus src/reader/modes/page src/reader/modes/narrate` prints nothing.

### Live L2 on the x64 package (Done-when 5)

R7's probe, copied unchanged (`r7-probe.mjs` SHA-256 `bbbffbb7…`), on R7's route: `L2START=text` (Flow from MEDITATIONS#136), Top third, 5 lines, 100 %, one sample a second for 30 s. Each run used a fresh scratch profile with the proof passed; live `library.json` `5917eefc…` and `settings.json` `ec99be2b…` were unchanged.

| Run | Crossing (L2a) | Samples with no cursor (L2c) | Index rise, samples 16–30 | Monotone from crossing | Band on with the cursor in it | `playing` | Last cursor |
|---|---|---|---|---|---|---|---|
| **R7a run 1** `r7a-L2text-Flow` | **13, AURELIUS#189 (section 2)** | **0** | 45 | yes | 18 of 18 | true throughout | Annius#242 |
| R7a run 2 `r7a-L2text-Flow-2` | 13, MARCUS#188 (section 2's first word; #193 at 14) | 0 | 43 | yes | 18 of 18 | true throughout | kings.#239 |
| Release `rel36-L2-text` | 15, AURELIUS#189 | 2 (13, 14) | 43 | yes | — | true | of#237 |
| Bad `cand-L2text-L5-Flow` | never | 18 (13–30) | — | — | — | true | none |

- L2a, L2b and L2c pass. The crossing comes two samples earlier than the release's, because the release lost two samples at the boundary.
- Run 1's `error.log` held 2,400 ResizeObserver-loop lines at 60 per second. They began at 21:37:08, eight seconds before Play (21:37:16), during the probe's setup. There was also one startup `paginator` "Cannot destructure property 'style'" line at 21:36:50. Neither reproduced: run 2 logged 3 ResizeObserver lines, as the release and bad runs did. This is recorded, not failed.

### Package verification (standing rule 53, Temporary placement), `20b3d5f8`

- **(a) Packages:** `C:\Projects\Blurby-artifacts\band-align-2-r7a\out-x64\win-unpacked` and `out-arm64\win-arm64-unpacked`, `--dir` from `20b3d5f8` (descends from M7a; C3 is documents only).
  - `app.asar` SHA-256: x64 `e4a5405d8499bdaa2246630c1c7c65c3c37bf97d52e8c9b04d07034e31ec1e9c`, arm64 `e4a5405d8499bdaa2246630c1c7c65c3c37bf97d52e8c9b04d07034e31ec1e9c` (identical).
  - Pair check: **0**. Extracted to `asar-x64` and `asar-arm64`.
- **(b)** `BLURBY_USER_DATA_DIR`: `True`. **25 s x64 launch** (`rule53-x64-25s`): proof passed, alive at 25 s, no `error.log` written, no flagged stdio line, no crash dump, live hashes unchanged. Known noise: BUG-217's `Backup failed … ENOENT` only; no `EADDRINUSE`.
- **(c)** Package unchanged for `main/`: `git diff --name-only 4f464b7a HEAD -- main main.js preload.js package.json` is empty. The extracted x64 `dist\` equals the worktree's `dist\` by SHA-256 (0 of 21 files differ).
- **(d)** The live rows ran on this x64 package.
- **arm64 launch:** at merge time (R-2026-10-30-2). The item reads "package-verified (x64, RodneySr); arm64 launch at merge".
- **(e)** Package path, commit and logs go to Blurby.Brain1. Blurby.Roadmap gives no merge go before Brain confirms.

### Gate (2) owner row (for Blurby.Roadmap to add)

> On *Meditations* in Flow, play from the start of the text through the end of the first section: the reading carries on into the next section (AURELIUS…) without stopping, the cursor never disappears, and the band stays on.

## R8 (2026-10-30) — paragraph band and the Band switch (owner ruling)

**State:** built on `eb/band-align-2-r8-work`, then fast-forwarded to `eb/band-align-2`. Not merged; that waits for Blurby.Roadmap's go.

### Rulings (Brain, 2026-10-30)

- **B1:** the anchor geometry keeps `FLOW_ZONE_LINES_DEFAULT` as its line count. `flowZoneLines` is deprecated. Settings migration v13→v14 replaces it with `flowBandEnabled` (on unless false).
- **Rule 50, ruling (a), C2b `d644255d`:** EINK-CONTROLS-1's schema-13 pins in `tests/settingsMigrationV13.test.js` and `tests/settingsNarrateNormalization.test.js` follow the v14 bump, under R8's name.
- **L3 and L8 were accepted as probes.** L3's `coversBlock=false` was a probe artifact: a line straddling the host edge. L8's 28/30 led to the amendment below.
- **Amendment (tier 1, inside the fence):** the pacer's band box must reach the view at every hop.

### Red

- **C1 `5d06e888`:** exit 1. Every named row fails by assertion. The controls z1, k1 and t4c pass.
- **Amendment red `3a24629e`:** `tests/readerModes/bandAlign2Forward.test.tsx` f1 fails on `d644255d` by assertion (placeBandAtCursor called 0 times).

### The change

- **C2 `2801fdc2`:** each mode's helpers gain `computeParagraphBandEdges` and `collectParagraphAround`. Both views place the band over the cursor's paragraph. Flow's view API gains `placeBandAtCursor`. The bottom bar gets one Band switch (`aria-label="Band"`, `aria-pressed`). Settings move to schema 14.
- **Amendment fix `2e019ee4`:**
  - `FlowModeRuntime.startScrollEngine`'s callback type is widened to `(topFrac, band?: FlowBandEdges)`.
  - `useModeBindings` now forwards `band`.
  - Focus has no pacer callback (its band is placed from the highlight), so it had no such drop.

### Root cause of the L8 stale band

- FlowScrollEngine reported `onZoneTopChange(topFrac, band)`, but the `useModeBindings` wrapper `(topFrac) => …` dropped `band`. Every stable-window report therefore took the no-band fallback and painted 5 × line height (135 px) over the paragraph band.
- The highlight only repainted the paragraph band on its next write, so the 1 s samples caught it at some line advances (#203, #219, #252, in all 3 capture runs) and missed it at others (#281 was repainted 0.21 s later).
- The capture (CDP logpoints plus a host `style.setProperty` hook) named the writer.
- Lesson candidate: a widened callback must be widened at every hop. A type that only lists the old arity makes TypeScript accept a wrapper that silently drops the new argument.

### Gates (tip `2e019ee4`)

- `npm test`: 195 files, 2,599 passed, 1 skipped, 0 failed.
- `npm run typecheck`: 0.
- `npm run build`: 0.
- Collected addition: `bandAlign2Forward.test.tsx`. On `d644255d` it was 194 files, 2,598 passed.

### Live L1–L8 (x64 package, scratch profiles)

- **L1–L7 (on `d644255d`):** pass, with edges 0/0 throughout. L5 (Band off) has no band or mask. L6 relaunches and L7 (v13 seeds lines 0/7) migrate.
- **L8 before the amendment:** 28/30 and 27/30. Stale samples at the line advances, as described above.
- **L8 after the amendment (`2e019ee4`), runs L8fix-5/6/7:** 30/30 cursor in band and 30/30 edges in every run, max edge error 0 px. All 18 report writes per run went through `placeBandAtCursor`, and there was no fallback write.

### Package verification (standing rule 53, Temporary placement), `2e019ee4`

- `--dir` x64 and arm64 both exit 0. `app.asar` is `A45CDEE56D4A9E19E1F838943FA79CB1A43D55509E9B1C04E884F66F7372195A` on both, so they are equal.
- `BLURBY_USER_DATA_DIR` is present.
- The asar's `dist\` equals the worktree build: 21 files, 0 differences (list hash `442c8132…cf9e`).
- 25 s x64 launch on a scratch profile: error.log none written, 0 flagged stdio lines, no crash dump, exit 0.
- The live `library.json` and `settings.json` were unchanged across all launches.
- The arm64 launch happens at merge time, on Rodney.

### Gate (2) owner row (for Blurby.Roadmap to add)

> In Flow and Focus, play a few paragraphs with the Band switch on: the band covers exactly the paragraph being read and moves with it, with no flicker to a short band at line changes. Turn Band off: no band and no dimming. Turn it back on: the band returns.

### Hand-off (s7)

GAP-PAUSE and R8 are independent of each other. Job 9 (PLAY-FIRST-TEXT-1) is next on this host.
