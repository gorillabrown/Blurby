# EINK-FLOW-VIEWPORT-1 — specification

**Shape: (a) design settled; full specification.** Drafted 2026-11-03 against the release-candidate tip `70d64237` (`C:\Projects\Blurby\.worktrees\rc-read`), which already carries BAND-ALIGN-2. Every file:line below is from that tree. Rule 36: re-grep at dispatch.

#### EINK-FLOW-VIEWPORT-1 — Flow advances a screen at a time on E-ink

- **What:** In E-ink, Flow's page holds still while the cursor moves down it. When the cursor reaches the first line that is not fully on screen, the page jumps once, and that line becomes the top line of the new screen. Today a page also jumps after a fixed 20 lines, even when more lines fit on screen, and a page never jumps when the cursor line is above the visible area. After this item the screen's own edges are the only trigger.
- **Why:** Smoke R7 (owner): "In E-ink mode, Flow and Narrate retain a stationary page viewport while their reading position progresses. Advance the viewport at the bottom boundary rather than continuously following by scrolling." The stub asks for a comparison with the held BAND-ALIGN-2 stepping before residual work is prescribed. **The comparison** (Flow's own engine, `src/reader/modes/flow/helpers/FlowScrollEngine.ts`):
  - BAND-ALIGN-2 already holds the E-ink page still and moves only the band and cursor bar. `syncToWord` (`:402-431`) calls `reportBand` (`:423`) without scrolling while the line stays on the page. On a page step it calls `advanceZone` (`:421`), whose E-ink branch puts the line at the top of the view (`:897-898`, clamped to the scroll range).
  - **Residual 1: the step trigger is partly a line count.** `:419` steps when `lineIdx >= this.einkPageStart + EINK_LINES_PER_PAGE` (20, `src/constants.ts:114`) **or** `isLineBelowView(line)` (`:489-492`). On a screen taller than 20 lines, the page jumps before the cursor reaches the bottom.
  - **Residual 2: no step when the cursor line is above the view.** `:419`'s `lineIdx < this.einkPageStart` compares line indexes, not geometry. After a scroll that fires no wheel event (dragging the scrollbar; `handleWheel`, `:1021-1034`, listens only to `wheel` and `touchmove`), the cursor can sit above the screen and the page will not follow it until 20 lines later.
  - Already correct, and pinned as controls: start and section hand-off place the line at the top (`start`, `:236-238`, `forceReset`); Jump back, line keys and paragraph keys place a fresh page (`jumpToWord`, `:343-360`; `jumpToLine`, `:494-513`; `jumpToParagraph`, `:515-540`); clamping at a section's end (`:897-898`); a wheel or touch browse-away pauses following, exactly as in regular mode (`:416`, `:1021-1034`); regular mode uses the anchor rule (`:899-908`).
- **Scope in:** the E-ink step rule in Flow's own engine; tests.
- **Scope out:**
  - Narrate (EINK-NARRATE-VIEWPORT-1).
  - E-ink refresh flashes, including Flow's per-word `reportEinkContentChange` (`src/reader/modes/flow/ModeRuntime.ts:1373-1376`), which EINK-VIEW-REFRESH-1 replaces.
  - The legacy `src/utils/FlowScrollEngine.ts` (a shared-core file no Flow runtime imports; `tests/einkErgonomics.test.ts:5` tests that copy).
  - The non-word-clock E-ink chunk animation (`animateEinkChunk`, `:820-872`; Flow always starts with `wordClock` true, `flow/ModeRuntime.ts:1240`).
  - Band visuals.
- **Outcome (one sentence):** With E-ink on, Flow's page scrolls only when the cursor line leaves the screen (below its bottom edge or above its top edge), and each such step puts that line at the top, once.
- **Prerequisites:** BAND-ALIGN-2 and EINK-CONTROLS-1, both carried by the RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`, tips 14 and 15). **Encoded wait:** dispatch after the RC merge is on `origin/main` (`git merge-base --is-ancestor 70d64237 origin/main` exits 0). No Narrate dependency.
- **Done when:**
  1. **Red first (standing rule 43):** commit `tests/readerModes/einkFlowViewport.test.tsx` alone. On the base, (v1) and (v2) fail by assertion; (v3) and (v4) pass. The failing output goes in the staging memo.
  2. After the change, PowerShell: `npx vitest run tests/readerModes/einkFlowViewport.test.tsx tests/readerModes/bandAlign2.test.tsx tests/readerModes/bandAlign2Forward.test.tsx tests/flowZoneAuto.test.ts tests/flow-scroll-engine.test.js tests/einkErgonomics.test.ts` exits 0.
  3. PowerShell: `npm test` (0 failed; passed ≥ base + 4), `npm run typecheck` and `npm run build` each exit 0 (standing rule 48).
  4. PowerShell: `git grep -n "einkPageStart" -- src/reader/modes/flow` prints nothing and exits 1. The dead index is removed.
  5. **Fence:** `git diff --name-status <base>..HEAD -- . ':!docs'` lists exactly:
     - `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`;
     - `A tests/readerModes/einkFlowViewport.test.tsx`.

     The time log is exempt (standing rule 41). `src/utils/FlowScrollEngine.ts`, `src/types.ts` and `ReaderContainer.tsx` are untouched.
  6. **Package (standing rule 53):** (a)–(e) in the close-out. The live checks run on the packaged exe with a scratch profile (LL-165 proof first), E-ink on and an EPUB open in Flow at default text size, after resizing the window to at least 30 lines tall. The check samples the scroll container's `scrollTop` and the cursor's line index over the inspector (LL-166) for 60 s of play:
     - `scrollTop` changes only on the word where the cursor line's bottom first passes the view's bottom;
     - after each change, the cursor line's top equals the view's top within 1 px, or the scroll is at its maximum;
     - with E-ink off, the same 60 s show regular anchor following (control).
  7. **Owner (gate (2) list, batched; standing rule 45):** on the E-ink device in Flow, the page stays still while the cursor walks down, and turns once when the cursor reaches the bottom.
- **Effort:** S.
- **Owners:** implementation agent (bounded, Flow-only renderer scope); spec-compliance review, then quality review; Blurby.Brain1 for package confirmation; Blurby.Roadmap for the merge go; the owner at gate (2).
- **Source:** `docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:46`, `:174-182` (R7); ROADMAP.md `#eink-flow-viewport-1`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites** (`src/reader/modes/flow/helpers/FlowScrollEngine.ts`, rc-read @ 70d64237):
  - `:416-424`: replace the E-ink branch. Current:
    `} else if (lineIdx < this.einkPageStart || lineIdx >= this.einkPageStart + EINK_LINES_PER_PAGE || this.isLineBelowView(line)) {`
    `this.einkPageStart = lineIdx;`
    `this.advanceZone(lineIdx);`
    Intended:
    `} else if (this.isLineOutsideView(line)) {`
    `this.advanceZone(lineIdx); // EINK-FLOW-VIEWPORT-1: the screen's edges are the only page-step trigger`
    The `else { this.reportBand(lineIdx); }` arm (`:422-424`) is unchanged.
  - `:488-492`: replace `isLineBelowView` with
    `private isLineOutsideView(line: LineInfo): boolean { if (!this.container) return false; const top = line.y - this.getScrollTop(); return top < 0 || line.bottom - this.getScrollTop() > this.getViewportHeight(); }`
    Its doc comment becomes "Whether a line is not wholly on screen: above the view's top or below its bottom (an E-ink page steps then, and only then)." It has no other caller: `isLineBelowView` is used only at `:419`.
  - Remove the dead index `einkPageStart`: the field (`:133`) and its writes at `:212`, `:237`, `:353`, `:420`, `:506`, `:534`. Nothing reads it after the change; Done-when 4 checks.
  - Keep the `EINK_LINES_PER_PAGE` import (`:26`): `animateEinkChunk` still uses it (`:829`).
  - No change in `flow/ModeRuntime.ts`. It already passes `isEink` (`:1236`), `stableWindowScroll` true (`:1239`) and `wordClock` true (`:1240`), so no callback is widened (LL-174 does not apply).
- **Tests:** new `tests/readerModes/einkFlowViewport.test.tsx`, jsdom. It uses `bandAlign2.test.tsx`'s `layout()` and scroll-position-provider pattern (`:45-64`, `:179-194`) with `VIEW_PX = 600`, `LINE_PX = 20`, `GLYPH_PX = 16`, five words a line, 500 words (100 lines) and `contentHeight: () => 2000`, so the scroll range is 1,400 px. Writes are recorded through `FLOW_SCROLL_POSITION_PROVIDER_KEY`. The engine is started as `engine.start(container, cursor, 0, 300, new Set(), true, 5, () => {}, true, true)` (E-ink, stable window, word clock). Describe block: "EINK-FLOW-VIEWPORT-1 Flow's E-ink page steps at the screen's edges".
  - (v1) Calling `syncToWord(w)` for w = 0…499 leaves the provider's writes exactly `[600, 1200, 1400]`. Each step comes at lines 30, 60 and 90, the first lines whose bottom (y + 16) passes the 600 px view; the last step clamps. Base gives `[400, 800, 1200, 1400]` (the 20-line cap) → red.
  - (v2) Calling `syncToWord(w)` for w = 0…150 (one step, to 600), then assigning the backing `scroll.top = 1200` directly (not through the provider's `set`, so it is not counted as a write, and no wheel event fires), then `syncToWord(160)` (line 32, above the view): the last write is `640`. On the base the cursor line stays off screen, and the last write is `400` → red.
  - (v3) Control, regular mode unchanged: the same engine started with `isEink` false; `syncToWord(100)` writes `toBeCloseTo(20 * 20 + 16 / 2 - 600 / 3, 6)` (the anchor rule, Top third). Passes on base.
  - (v4) Control, fresh pages: an E-ink start at word 250 writes `1000` (line 50 at the top); then `jumpToWord(400)` writes `1400` (line 80, clamped). Passes on base.
- **Constants:** none new. `EINK_LINES_PER_PAGE` stays for the legacy chunk animation and `tests/einkErgonomics.test.ts:67`.
- **Branch:** `eb/eink-flow-viewport-1` from `origin/main` after the RC integration merge.
- **Staging plan:** red commit: `tests/readerModes/einkFlowViewport.test.tsx` only. Change commit: `src/reader/modes/flow/helpers/FlowScrollEngine.ts`. Explicit paths; check `git status --porcelain` before each commit (LL-172). `tests/perf-baseline-results.json` stays unstaged.
- **Failure handling:**
  - If (v3) or `bandAlign2*.test.tsx` fails after the change, regular mode was disturbed: revert the edit and stop; do not tune the anchor rule.
  - If the live check shows a step one line early on Foliate sections (a fractional `line.bottom` landing within 1 px of the edge), stop and return the measured geometry to Blurby.Brain1. Do not add a tolerance constant without a ruling.
  - If the cursor line is taller than the view (huge text), the rule steps on every word, by geometry. Record it in the memo as a known limit; do not special-case it.
  - Two repair passes maximum, then an issue file.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `C:\Users\estra\Projects\Blurby\.worktrees\eink-flow-viewport-1`, created with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/eink-flow-viewport-1 .worktrees/eink-flow-viewport-1 origin/main`. Prerequisites: `npm ci` at the base; an EPUB in a scratch library for the live row. Push with `git push origin HEAD:refs/heads/eb/eink-flow-viewport-1`.
- **Package verification:** standing rule 53. Build the `--dir` package on RodneySr from the final commit plus `origin/main`, and run the arm64 25 s launch on Rodney before the merge go. The live rows are Done-when 6.
- **Lane ownership:** Lane A (Runtime Core: Flow's own pacer). Product lane: Reader Engine.
- **Forbidden during parallel run:** `src/utils/FlowScrollEngine.ts`, `src/reader/modes/flow/ModeRuntime.ts`, other modes' folders, `src/types.ts`, `ReaderContainer.tsx`, and every settings or theme file.
- **Shared-core touches:** none (the Flow-owned helper is not the freeze-set `src/utils/FlowScrollEngine.ts`).
- **Merge order:** independent of EINK-DEVICE-SETTINGS-1 and EINK-MODE-AVAILABILITY-1, which may run beside it. It merges before EINK-VIEW-REFRESH-1, which adds a page-step callback to this same engine.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red viewport tests (v1, v2) fail on the base by assertion; controls (v3, v4) pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | E-ink Flow steps only at the screen's edges; dead index removed | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Named suites, full suite, typecheck and build green; fence exact | calculable | verify | mechanical | low | 12m | — | — |
| 4 | Rule 53 package; live scroll-sampling rows with the E-ink-off control | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 33m · sum 33m; 3 of 4 estimated tasks calibrated (priced by kind from the medians printed for `ROADMAP.md:1866-1868` on 2026-11-03; row 3 is one suite of about 3m plus typecheck and build of about 2m, ×2 for the repair ceiling). Re-price at launch with `timing --rows-from-spec`.

##### Lessons applied

- **Standing rule 43 (LL-138):** red (v1, v2) before the change, with controls (v3, v4).
- **Standing rule 44 (LL-143):** gates name PowerShell and exact exits. **Owed before dispatch:** base, prescribed and wrong-variant receipts for Done-when 2 and 4 (wrong variant: keep the 20-line cap and add only the above-view test, which must still fail v1).
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **LL-120 / standing rule 23 (SRL-061):** the change stays inside Flow's own pacer; Narrate mirrors the contract in its own item.
- **Standing rules 17 and 20 (SRL-055, SRL-058):** a live Foliate gate for real layout movement in Flow (Done-when 6).
- **Standing rule 45 (LL-141):** the owner checks perceptual stillness on the E-ink device; the unattended sampling run keeps the window visible and records any throttling.
- **Standing rule 55 (LL-166):** the live verdict reads `scrollTop` and line geometry, not screenshots, with an E-ink-off control that must show movement.
- **Standing rule 53 (LL-167) and LL-165:** package and profile proof.
- **LL-174:** considered: no callback is widened (the runtime already passes `isEink`).
- **LL-172, LL-181:** exact-path staging; worktree placement and refspec push.
- **Standing rule 51 (LL-164):** no lesson-status line appended.
- **Considered, not applicable:** LL-142/LL-173 (no audio), LL-157/LL-159 (no quit path), LL-170 (no word identity change), LL-156 (no waiver moves). Run the U9 check at dispatch under rule 11a.
