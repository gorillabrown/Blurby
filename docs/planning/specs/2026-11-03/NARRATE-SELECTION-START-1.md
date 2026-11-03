#### NARRATE-SELECTION-START-1 — Pressing Play in Narrate no longer throws the word to the top, and a visible word holds still until the voice catches up *(Seq 124; Full Spec 2026-11-03 (measure, then fix), cited against RC tip `70d64237`; TTS / Narration Engine; P1 residual F7/F8; BUG-227; owner answer #24 and Blurby.Brain1 ruling C, 2026-11-03)*

- **What:** one dispatch in two waves.
  - **Wave A, measure (standing rule 43).** On the packaged RC build, the gate row G0 first measures whether the "Voice loading…" notice moves the paused cursor on screen. If the shift is under 1 px, the item stops and returns to Blurby.Brain1 before any fix. When G0 shows a shift, the trace rows record every write to Narrate's scroll position, the view height, the notice and the cursor/band geometry around paused arrival, a paused click and Play, with a control. They fill the decision table that selects the fix rows.
  - **Wave B, fix (the rows the table selects).** The expected rows follow RodneySr reproduction R3 (2026-10-31).
    - **F8-a:** the notice stops changing the view's height (ruling (a)).
    - **F8-b:** a backstop restores the cursor line's screen position after Foliate re-anchors on a real resize (ruling (b) as ruled in C).
    - **F8-d, when D5 shows the follow moving a visible word at Play:** the view holds while the voice reads down the screen, then catches up smoothly (owner #24).
- **Out of scope:**
  - F9 (a paused click ignored on Play): NARRATE-PAUSED-CLICK-1 (Seq 117), `ModeRuntime.ts` only.
  - F7's band geometry itself. NARRATE-BAND-SPACE-1 (Seq 141) puts the paragraph band on the paused cursor. This item records F7's measured offset and certifies F7 closed only through that item's row (D4).
  - E-ink screen-at-a-time behaviour (EINK-NARRATE-VIEWPORT-1, Seq 130.5).
  - Flow, Focus and Page.
  - Audio, timing and the word table. The cursor stays the word at the playing sample (LL-142).
- **Why (investigation at `70d64237`):**
  - **The notice sits in the layout flow.** `src/reader/modes/narrate/ModeView.tsx:14-21` renders `.rm-narrate-notice` as a flex child of `.rm-narrate-root` (`mode.css:12-17`, `flex-direction: column`), after the Foliate view (`.rm-narrate-view`, `flex: 1`, `mode.css:20-25`).
    - `.rm-narrate-notice` has no rule anywhere in `src` (only `ModeView.tsx:17` names it), so it renders as one line of default 16 px text.
    - `ModeRuntime.ts:226-230` returns the "Voice loading…" notice while `s.loading`. `start()` sets `loading` at `:329`, and the click path at `:463`. It clears when the first word is scheduled (`:378`, `:707`, `:726-727`, `:734`, `:743`).
    - So Play shrinks the view by one text line, and the first word grows it back. R3 measured 629.8 → 608.2 px (21.6 px).
  - **A height change re-anchors Foliate at the top.** The paginator `View`'s `ResizeObserver` calls `expand()` → `onExpand` → `#scrollToAnchor(#anchor)` (`patches/foliate-js+1.0.1.patch:11`, `:92-102`, `:165-175`). That scrolls the last public anchor's range to the top of the view.
    - Narrate subtracts its zone offset only after its own `scrollToAnchor` calls (`FoliateView.tsx:669-679`, `:1411-1419`), never after Foliate's internal one.
    - That is F8, "Play jumps the underlined word to the top".
  - **The paused band is fixed; the paused cursor is not placed.** The band is a fixed mask from `FLOW_ZONE_INITIAL_TOP` (0.15) for five lines (`FoliateView.tsx:1302-1346`). Paused arrival paints the cursor with no motion (`ModeRuntime.ts:545-548`, `allowMotion: false`). While playing, the follow puts the cursor at the zone offset (`FoliateView.tsx:1372-1426`). That is F7.
  - **A third candidate writer at Play.** `start()` calls `surface.highlight(startWord, "narrate", { allowMotion: true })` (`ModeRuntime.ts:325`). When the span reports not visible, that scrolls it to the top with no zone offset (`FoliateView.tsx:641-648`). The trace tells it apart (D3).
  - **A false browse-away is possible.** The follow treats a displacement over 0.3 × view height as the reader scrolling away (`FoliateView.tsx:1384-1391`, `NARRATE_DISPLACEMENT_VIEWPORT_FRACTION` `:68`). An onExpand jump of ≈ 160 px against a ≈ 182 px threshold comes within a few px of hiding the follow. The trace records the jump-back button after Play.
  - **Narrate's own container `ResizeObserver`** (`FoliateView.tsx:1348-1363`, observer at `:1352`, on `containerRef` `:330`) already runs on every view-size change and sets the renderer's size attributes. It is the backstop's trigger (ruling C).
- **Design:**
  - **Settled by the owner (#24):** when Play is pressed with the word visible but off the reading line, the view holds, then catches up smoothly (hold-then-catch). The 2026-10-26 policy reads the same way: "preserve the viewport when the selected word is already visible … follow only when it would leave the reading area".
  - **Settled by Blurby.Brain1 (ruling C):**
    - **Measure first (standing rule 43).** The packaged probe records the Narrate cursor's on-screen top before and after the loading notice appears (G0). A shift under 1 px is a STOP and a return to Blurby.Brain1.
    - **Trigger.** The backstop is triggered by the `ResizeObserver` on Narrate's view container, not by counting frames.
    - **Timing.** The restore runs inside the next `requestAnimationFrame` after the observer callback, never inside the callback.
    - **No loop errors.** Lines matching `ResizeObserver loop` in the renderer console must stay at 0 in every packaged row.
  - **Engineering choices:**
    - **"Restore" means the cursor line's screen y before the resize.** That y equals the reading line whenever the follow placed the cursor there. A paused word the reader left elsewhere is therefore never moved.
    - **The notice becomes an overlay (F8-a), not a reserved slot.** A reserved slot would shrink every reading view permanently. It sits bottom-centre, under the jump-back button's z-index (450), in the already-dimmed area below the band.
    - **Hold-then-catch (F8-d)** gates the follow with a hold flag. Play sets it when the start word's line is fully inside the view. While it is set, the follow does not scroll. It clears when the heard line's top reaches the reading line (`getFlowFollowOffsetPx()`), or its bottom would pass the view's bottom minus one line step. From then on the follow runs as today, with its existing smooth `scrollToAnchor` and zone offset. Jump back and a browse-away clear it.
- **Prerequisites:**
  - The RC integration window merged to `origin/main`; cut from that merge and re-grep (standing rule 36).
  - NARRATE-ARROW-PAUSE-1 (Seq 99) and NARRATE-PAUSED-CLICK-1 (Seq 117) merged first. Both edit `ModeRuntime.ts`, which this item reads but does not edit (Blurby.Brain1 serialization).
  - This item merges before NARRATE-BAND-SPACE-1 (Seq 141) and EINK-NARRATE-VIEWPORT-1 (Seq 130.5), which edit the same `FoliateView.tsx`.
  - No open owner or technical question remains.
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr unless named; each command passes only on exit 0 unless stated):
  1. **G0, the measurement gate.** `C:\Projects\Blurby-artifacts\narrate-selection-start-1\` holds `probe.mjs` and `base-G0.json`. `base-G0.json` records the cursor line's top (px from the view's top) at three moments: in the last frame before the notice element appears, in the first frame it is present, and in the first frame after it is removed. It also records `shiftPx = max(|after-appear − before|, |after-remove − before|)`.
     - **Control G0c (standing rule 55):** the same row with a known 40 px offset injected (`renderer.containerPosition += 40` while the notice is present, by the probe) records `shiftPx` 40 ± 2. That proves the measurement can see a shift.
     - **G0n (a second control):** with `.rm-narrate-notice { display: none !important }` injected, the row records `shiftPx < 1`.
     - **If `base-G0.json` records `shiftPx < 1`:** stop here. Write `decision.md` with G0, G0c and G0n and return to Blurby.Brain1. No Wave B.
  2. **Trace evidence.** The same folder holds `base-<row>.json` for rows P1–P4, `control-P2c.json` and `decision.md` with the filled decision table. `node -e "for (const f of ['base-G0','base-P1','base-P2','control-P2c','base-P3','base-P4']) JSON.parse(require('fs').readFileSync('C:/Projects/Blurby-artifacts/narrate-selection-start-1/'+f+'.json','utf8'))"` exits 0.
  3. **The probe can give the opposite verdict (standing rule 55).** P2c (the notice hidden) records `heightChanges: 0`, and P2 at the base records `heightChanges ≥ 1`. If both record the same, the probe is not trusted and the item stops (Failure handling).
  4. **Red first.** Commit C1 adds only `tests/narrate/narrate.selectionStart.test.tsx`. `npx vitest run tests/narrate/narrate.selectionStart.test.tsx` exits 1 on C1: (ss1), (ss3) and (ss5) fail by assertion (and (ss6) when F8-d is selected), while the controls (ss2) and (ss4) pass.
  5. **Fix.** On the fix commit the same command exits 0, and so does `npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts`. No existing test is edited (standing rule 50).
  6. `npm test` (record the counts: passed ≥ the base's count + the new rows), `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  7. **Fence (standing rule 41).** `git diff --name-only <base> HEAD` prints only these, plus the memo and `Timing.NARRATE-SELECTION-START-1.jsonl`: `src/reader/modes/narrate/mode.css`, `src/reader/modes/narrate/FoliateView.tsx`, `tests/narrate/narrate.selectionStart.test.tsx`, `docs/governance/BUG_REPORT.md`. `git diff --name-only <base> HEAD -- src/reader/modes/flow src/reader/modes/focus src/reader/modes/page src/reader/modes/narrate/ModeRuntime.ts src/components src/types.ts src/utils` prints nothing.
  8. **Packaged re-run (standing rule 53).** The probe runs on the x64 package of the fix tip and records the following.
     - **G0:** `shiftPx < 1`.
     - **P2 (Play with the start word on screen, off the reading line):**
       - `heightChanges: 0`.
       - Between Play and the first heard word plus 1 s, no `containerPosition` write lacks a matching public `scrollToAnchor` or setter call.
       - The cursor line's top stays within 2 px of its pre-Play y until the heard line reaches the reading line. After that the heard line sits within 2 px of the reading line (#24).
       - The jump-back button is absent at 3 s.
     - **P2r (the window resized by −40 px while playing):** the cursor line is back within 2 px of its pre-resize y in the second frame after the container observer fires, and no write is logged inside the observer callback itself.
     - **Every row:** renderer console lines matching `/ResizeObserver loop/` = 0, read from the CDP console log of the whole run. A base run of P2r records the same console count as the detector control.
  9. Package verification (below) and Blurby.Brain1's confirmation recorded in the close-out.
- **Effort:** M. Measurement and trace frontier ≤2 h; fix S.
- **Owners:** Blurby.Roadmap (spec, merge go); Blurby.Brain1 (G0 stop decision, package confirmation, scheduling); RodneySr implementation session (measure, trace, fix, package); the owner's release gate (2) check, "Play on a visible word does not jump; the view catches up when the voice reaches the reading line".
- **Source:** SMOKE-F7 and SMOKE-F8 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:42-43`); BUG-227; owner policy `docs/planning/roadmap-reviews/2026-10-26-plan.md:30`; R3 and Blurby.Brain1 rulings (a)/(b) (`docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md:63-65`); `docs/governance/bug-reports/Issue.SMOKE8-SPEC-GAPS.2026-10-26.md:49-51`; owner answer #24 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`); Blurby.Brain1 ruling C (2026-11-03).
- **Path:** dispatch (two waves: A measure and trace, B fix and package).

##### Implementation detail

- **The probe (Wave A), `C:\Projects\Blurby-artifacts\narrate-selection-start-1\probe.mjs`:**
  - It extends `scripts/ui-sweep/sweep.mjs`'s session (CDP over `--remote-debugging-port`), with `Session.profilePreflight` passing before the first input (LL-165).
  - Each row gets a fresh scratch profile, launched with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR`. Live-profile hashes are taken before and after.
  - Book: the bundled sample *Meditations* only. Regular display (E-ink off), 100 % text size, window 1280 × 800.
  - It subscribes to `Runtime.consoleAPICalled` and `Log.entryAdded` from launch and counts `/ResizeObserver loop/` lines.
  - **Instrumentation,** injected by `Runtime.evaluate` before the row's action. The app's code is never edited for the trace.
    - Take `const r = document.querySelector('foliate-view').renderer`. Wrap `r.scrollToAnchor` to log `{t, kind:'public-anchor'}`. Redefine `containerPosition` on the instance (a getter/setter delegating to the prototype descriptor) to log every set as `{t, from, to, stackTop}`. A position change the per-frame sampler sees with no logged set is `kind:'internal'`: Foliate's private `#scrollToAnchor`, that is, onExpand.
    - A `ResizeObserver` on `.rm-narrate-view` logs `{t, height}`. A `MutationObserver` on `.rm-narrate-root` logs `.rm-narrate-notice` additions and removals, with its `getBoundingClientRect().height`.
    - A `requestAnimationFrame` sampler runs for 3 s after the action. Each frame it records `containerPosition`, the `.rm-narrate-view` `clientHeight`, and the cursor span's rect plus its iframe's top. The cursor span is `.page-word--narrate-cursor, .page-word--flow-cursor, .page-word--highlighted` inside the section iframe. It also records the view's `--flow-zone-top` and `--flow-zone-bottom` resolved to px, and whether the jump-back button `.rm-narrate-recenter-btn` is present.
  - **Rows:**
    - **G0 notice shift:** open the book in Page, switch to Narrate paused, press Play (bottom bar, a real CDP mouse press), and record the cursor top at the three notice moments. **G0c** injects the 40 px control offset. **G0n** hides the notice.
    - **P1 paused arrival:** record the cursor line centre y, the band's top and bottom in px, and the reading-line y (`band top + 2.5 × line step`).
    - **P2 Play, start word visible:** from P1, press Play and record the 3 s window.
    - **P2c control:** as P2, with `.rm-narrate-notice { display: none !important }` injected first.
    - **P3 paused click, then Play:** click a visible word 6 lines below the reading line, wait 500 ms, press Play.
    - **P4 Play, start word off screen:** scroll the view three screens away (wheel), press Play.
    - **P2r (packaged re-run only):** while playing, resize the window height by −40 px through CDP `Browser.setWindowBounds`.
- **Decision table (`decision.md`; each row names its evidence and the fix it triggers):**

| Row | Evidence (from the JSON) | Verdict | Fix triggered |
|---|---|---|---|
| G0 | `base-G0.shiftPx < 1` (G0c shows 40 ± 2, G0n < 1) | The notice does not move the cursor | **STOP** before Wave B; return to Blurby.Brain1 with G0, G0c and G0n |
| D1 | In P2, `heightChanges ≥ 1` with Δheight equal to the notice's rect height ± 1 px, then an `internal` position write within 3 frames moving the cursor ≥ 50 px up. P2c shows neither | R3 confirmed: the notice resizes the view and Foliate re-anchors | F8-a and F8-b |
| D2 | A height change at Play whose size does not match the notice, or one that P2c still shows | Another element resizes the view | STOP: record the element and return to Blurby.Roadmap for an amendment. F8-b may proceed alone only on Blurby.Brain1's word |
| D3 | No height change, but a `public-anchor` write at Play from `highlight(…, allowMotion: true)` puts the cursor at y ≈ 0 | The start highlight scrolls with no zone offset | F8-c |
| D4 | P1's cursor line centre lies outside `[band top, band bottom]` | F7 reproduced: a fixed band and an unplaced paused cursor | None here. NARRATE-BAND-SPACE-1's paused-cursor band row closes it; record the offset in px in BUG-227 |
| D5 | After F8-a, P2's first follow write moves a visible cursor by more than 2 px before the heard line reaches the reading line | The follow re-places a visible word at Play | F8-d (owner #24, hold-then-catch) |
| D6 | P4's cursor ends at y ≈ 0 rather than on the reading line | An off-screen start lands at the top | F8-c |

- **Edit sites (Wave B; line numbers on `70d64237`, re-grep at the cut):**
  - **F8-a (keep the height stable):** `src/reader/modes/narrate/mode.css`.
    - `:12-17` `.rm-narrate-root`: add `position: relative;`.
    - New rule at the end of the file (after `:100`): `.rm-narrate-root .rm-narrate-notice { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 440; max-width: calc(100% - 200px); padding: 6px 14px; border-radius: var(--radius-pill); background: var(--bg-secondary); color: var(--text); font-size: 12px; box-shadow: var(--shadow-sm); pointer-events: none; }`. It sits under the jump-back button (`:77-90`, z-index 450, `right: 18px`) and never covers it. CSS custom properties only.
  - **F8-b (the backstop, ruling C):** `src/reader/modes/narrate/FoliateView.tsx`.
    - **New refs** near `:330`: `cursorScreenYRef = useRef<number | null>(null)` (the cursor line's top, in px from the view's top, after Narrate's last placement) and `realignFrameRef = useRef<number | null>(null)`.
    - **New helper** `recordCursorScreenY(span: Element)`: `span.getBoundingClientRect().top + iframeTop − containerRef.current.getBoundingClientRect().top`.
    - **Call it after each Narrate placement settles:** in `centerResolvedTokenInReadingWindow` after `:678`; in the follow effect after `:1421`; and in `applyVisualHighlightByIndex` after the highlight is painted (`:636-639`) when no motion was requested, so a paused cursor left where it is keeps its y.
    - **In the container `ResizeObserver` callback** (`:1352-1361`), after the existing `setAttribute` calls, schedule the realign and do no position write inside the callback:
      - If `realignFrameRef.current != null`, cancel that frame. A newer resize cancels a pending realign.
      - `const view = viewRef.current; realignFrameRef.current = requestAnimationFrame(() => { realignFrameRef.current = null; realignAfterExpand(view); });`
    - **`realignAfterExpand(view)`** returns without writing when `view !== viewRef.current` (LL-169), when `userBrowsingRef.current` is set, when no cursor span is painted, or when `cursorScreenYRef.current == null`. Otherwise:
      - It computes `delta = currentY − cursorScreenYRef.current`.
      - If `|delta| > 1`, it sets `renderer.containerPosition = Math.max(0, renderer.containerPosition + delta)`.
      - It sets `lastScrollFollowPosRef.current` (`:389`) to the new position, so the follow's displacement check (`:1384-1391`) does not read the restore as a browse-away.
    - **The effect's cleanup** cancels a pending frame.
    - **No constant:** the frame count is not a tunable. There is exactly one frame, by ruling.
  - **F8-c (only if D3 or D6):** `FoliateView.tsx:641-648`. After `view.renderer.scrollToAnchor?.(range)`, await it and subtract `getFlowFollowOffsetPx()` (`:530-536`) from `containerPosition`, as `centerResolvedTokenInReadingWindow` does (`:671-677`), then call `recordCursorScreenY`. Only the not-visible / forced-motion branch changes; a visible word still gets no motion.
  - **F8-d (only if D5; owner #24):** in the follow effect, `FoliateView.tsx:1372-1426`.
    - A new `holdFollowRef` is set true when the first heard word of a play run arrives and its line is fully inside the view: top ≥ 0 and bottom ≤ view height.
    - While the flag is true, the effect records the heard line's geometry and returns before `scrollToAnchor`. It clears when the heard line's top ≥ `getFlowFollowOffsetPx()` (the reading line), or when its bottom > view height − one line step. That run then follows as today: the smooth `scrollToAnchor` plus the zone offset.
    - The jump-back handler and `markUserBrowsingAway` clear it.
    - The flag is a ref, read only by this view (no mode store, LL-120).
- **Tests (new `tests/narrate/narrate.selectionStart.test.tsx`):** Narrate's own harness, copied from `tests/narrate/narrate.sectionNav.test.ts` and `tests/readerModes/bandAlign2Cover.test.tsx:17-117`, not imported (standing rule 52). The global `ResizeObserver` and `requestAnimationFrame` are stubbed so the test fires the callback and steps frames by hand.
  - **(ss1)** Loads `src/reader/modes/narrate/mode.css` as text. The `.rm-narrate-root .rm-narrate-notice` rule has `position: absolute`, and `.rm-narrate-root` has `position: relative`. *Base: no rule.*
  - **(ss2) control:** renders `NarrateModeView` with a fake runtime whose `getNotice()` returns the loading notice. The notice exists with the text "Voice loading…" and `role="status"` (behaviour kept).
  - **(ss3)** Renders `NarrateFoliateView` with a fake renderer exposing `containerPosition`. It paints a cursor at a known y via `viewApiRef.current.highlightWordByIndex(7, "flow", { allowMotion: false })`, then simulates Foliate's re-anchor (`containerPosition += 160` with no Narrate call) and fires the container observer's callback. Inside the callback no `containerPosition` set is logged. After one stepped frame, `renderer.containerPosition` is within 1 of the original. *Base: no realign.*
  - **(ss4) control:** as (ss3), with a wheel event first (`userBrowsingRef` set). `containerPosition` stays at the re-anchored value after the frame.
  - **(ss5)** Two observer callbacks before the frame: one realign write only, after the single frame. *Base: none.*
  - **(ss6) (only with F8-d):** a heard word at a visible line 6 lines below the reading line → no `scrollToAnchor` call. Heard words advance until the line's top reaches the reading line → one `scrollToAnchor` call, then the zone offset. *Base: a call at the first word.*
  - **F8-c, if triggered,** adds (ss7) of the same shape, red first, in the same C1.
- **Constants:** none. The single-frame timing is fixed by ruling C, and `NARRATE_EXPAND_SETTLE_FRAMES` is not introduced. No setting, schema or type change.
- **Branch:** `eb/narrate-selection-start-1` from `origin/main` after the RC merge and Seq 99/117's merges. Push with `git push origin HEAD:refs/heads/eb/narrate-selection-start-1` (LL-181).
- **Staging plan:**
  - C1: `tests/narrate/narrate.selectionStart.test.tsx` (red).
  - C2: `src/reader/modes/narrate/mode.css` and `src/reader/modes/narrate/FoliateView.tsx`.
  - C3: `docs/governance/BUG_REPORT.md` (the BUG-227 F7/F8 lines only), the memo and the time log.
  - Explicit paths only; never `git add -A`. The probe and its JSON stay in `C:\Projects\Blurby-artifacts\` (standing rule 52: not collected by the runner).
  - Merge `--no-ff` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b).
- **Failure handling:**
  - **G0 under 1 px:** stop, as in Done-when 1.
  - **The probe control fails** (P2 and P2c alike, or G0c not 40 ± 2): fix the probe once. A second failure stops Wave A and reports the raw logs.
  - **D2:** stop before Wave B; Blurby.Brain1 decides whether F8-b ships alone.
  - **Foliate's internal re-anchor lands after the realign frame** (the P2r log shows an `internal` write after the restore): stop and return to Blurby.Brain1 with the frame-by-frame log. Do not add frames.
  - **A `ResizeObserver loop` line appears:** a write moved into the callback. Move it back into the frame; no other change.
  - **The cursor or heard word changes** (any narrate test on `heardWord` or the word index fails): revert the `FoliateView.tsx` change, keep F8-a, report.
  - **Repair limit:** two repair passes per wave. A third failure stops the item, In Flight.
  - **Rollback after merge:** `git revert -m 1 <merge>`; never reset or force-push.
- **Execution host:** RodneySr (rule 6b), clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\narrate-selection-start-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/narrate-selection-start-1 .worktrees/narrate-selection-start-1 origin/main`).
  - Host prerequisites: `npm ci` at the base. Node and the CDP harness (`scripts/ui-sweep/sweep.mjs`) are in the tree. Artifacts go under `C:\Projects\Blurby-artifacts\narrate-selection-start-1\`.
  - The arm64 25 s launch runs on Rodney at merge.
- **Package verification (standing rule 53, RodneySr placement):**
  - `npx electron-builder --win --dir --x64` and `--arm64` of the fix tip with `origin/main` merged.
  - A 25 s x64 scratch-profile launch with the LL-165 proof and no error or crash line.
  - `app.asar` holds the new `mode.css` rule and the renderer bundle matches `dist/`. Extract from the scratchpad, never a worktree root.
  - Done-when 8 re-run on the packaged x64 exe.
  - A "Package verification" section in the close-out, and Blurby.Brain1's confirmation before the merge go.
- **Lane ownership:** TTS / Narration Engine. Execution surfaces: A (the Narrate view's follow) and C (its notice chrome).
- **Forbidden during parallel run:** `src/reader/modes/narrate/ModeRuntime.ts` (PAUSED-CLICK, ARROW-PAUSE); every sibling mode; `ReaderBottomBar.tsx`; `src/constants.ts`; `patches/`; the live profile; register writes.
- **Shared-core touches:** none.
- **Merge order:** after the RC merge, NARRATE-ARROW-PAUSE-1 and NARRATE-PAUSED-CLICK-1. Before EINK-NARRATE-VIEWPORT-1 and NARRATE-BAND-SPACE-1, which re-grep `FoliateView.tsx` after it.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | G0 measured with both controls; stop if under 1 px; otherwise rows P1–P4 recorded and the decision table filled | frontier | diagnosis | cross-cutting | high | — | ≤2h — stop and report the logs so far | A |
| 2 | Red rows fail on the base for the stated reason; controls pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | B |
| 3 | Notice overlay; observer-triggered next-frame realign; selected conditional rows (hold-then-catch, start highlight) | repeat | ui-fix | bounded | medium | 6m (median of 3 runs) | — | B |
| 4 | Local gates, both reviews, rule 53 pair and the packaged probe re-run with the console count | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | B |

**Total:** chain 22m · sum 22m + 1 timeboxed ≤2h; 3 of 3 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; `timing` not run, LL-172)

##### Lessons applied

- **Standing rule 43 (LL-138):** G0 measures the effect before any fix and stops below 1 px; red first in Wave B.
- **LL-142:** no edit touches the word table, the clock or the heard-word lookup. Done-when 5 runs the full `tests/narrate` set, and the failure rule reverts any change that moves the heard word.
- **LL-165:** the probe proves the scratch profile before its first input; live hashes before and after.
- **Standing rule 55 (LL-151/LL-166):** G0c (a known 40 px shift) and P2c (the notice hidden) are controls that must show the opposite verdict; the console count has a base run.
- **LL-169:** the realign checks the captured view is still current and cancels a pending frame on a newer resize.
- **LL-120:** Narrate owns its notice, backstop and hold flag in its own files; no sibling import (Done-when 7).
- **LL-173:** not applicable to the new tests (no audio fake); the existing gap-pause tests run unchanged in Done-when 5.
- **LL-174:** no callback is widened.
- **LL-181:** worktree under the canonical clone; explicit `eb/` refspec.
- **Standing rules 36, 41, 48, 50, 52, 53:** as written above.
- **Considered, not applicable:** library, IPC, governance and installer lessons.
