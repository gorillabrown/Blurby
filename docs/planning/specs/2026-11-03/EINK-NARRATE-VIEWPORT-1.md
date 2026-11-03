#### EINK-NARRATE-VIEWPORT-1 — On E-ink, Narrate turns the screen once when the voice reaches its edge, instead of scrolling every word *(Seq 130.5; Full Spec 2026-11-03, cited against RC tip `70d64237`; TTS / Narration Engine; proposed P2; owner answers #12–#13 and Blurby.Brain1 ruling D, 2026-11-03)*

- **What:** with E-ink on, Narrate holds the view still while the heard word moves down the screen.
  - When the heard word's line leaves the view (below the bottom, or above the top after a jump), the view turns once. The heard line lands at the top of the screen, as Flow does on E-ink (#12).
  - Each turn is one E-ink view advance, so the E-ink flash fires once per turn (EINK-VIEW-REFRESH-1's `reportViewAdvance`), never per word.
  - Scrolling away by hand behaves as in regular Narrate (#13): following stops, and Jump back returns to the heard line.
  - A new chapter opens through the existing section follow, and the word lands at the top.
  - With E-ink off, Narrate is unchanged.
- **Out of scope:**
  - Regular-display Narrate (NARRATE-SELECTION-START-1 owns its start and follow geometry; NARRATE-BAND-SPACE-1 its band).
  - Flow's E-ink contract (EINK-FLOW-VIEWPORT-1), the flash itself and its overlay (EINK-VIEW-REFRESH-1).
  - Audio, timing and the word table: the step keys off the exact heard index only (LL-142).
  - E-ink appearance and the mode list (EINK-APPEARANCE-2, EINK-MODE-AVAILABILITY-1).
- **Why (investigation at `70d64237`):**
  - **Narrate has no E-ink code.** `git grep -n "isEink\|einkMode" -- src/reader/modes/narrate` finds nothing. Narrate on E-ink scrolls continuously, as on a regular display.
  - **The heard word.** `FoliateView.tsx:292-293` takes `narrationWordIndex` from the audio port: the word at the playing sample, from the exact word table (owner ruling #31; LL-142).
  - **Scroll-writer census (LL-139),** every writer of Narrate's viewport, `src/reader/modes/narrate/FoliateView.tsx`:

    | # | Writer | Where | When | On E-ink |
    |---|---|---|---|---|
    | W1 | Scroll-follow | `:1372-1426` | Every heard word, throttled to 500 ms (`NARRATE_SCROLL_FOLLOW_THROTTLE_MS`, `:67`). It calls `renderer.scrollToAnchor(range)`, then subtracts the zone offset (`getFlowFollowOffsetPx`, `:530-536`; applied at `:1411-1419`) | **Replaced** by the step |
    | W2 | Chunk-follow | `:690-719` | A new chunk state. Narrate's bindings always pass `chunkReadingVisualState: null` (`src/reader/modes/narrate/useModeBindings.ts:72`), so it never fires today | Guarded (skipped), so a future chunk state cannot scroll on E-ink |
    | W3 | Highlight motion | `:641-648` | A motion-allowed highlight of a word reported not visible. It calls `scrollToAnchor` with no offset, which already lands at the top | Unchanged |
    | W4 | Click / selection centre | `:657-686` | A click or selection placement | Unchanged |
    | W5 | Arrival | `:1179-1196` | Mode or section entry (`scrollIntoView` centre) | Unchanged |
    | W6 | Runtime section follow | `src/reader/modes/narrate/ModeRuntime.ts:593-600` (`followSpokenSection`) | The heard word is in another section (BUG-191 miss handler) | Unchanged; the next heard word steps per the rule |

  - **Visibility must be measured.** On the scrolled surface every word reports `visible` from the iframe's view (`FoliateView.tsx:1373-1375`, comment; `resolveWordState` at `:1394`). The E-ink test is therefore the heard span's rectangle against the container's visible box, the same geometry NARRATE-SELECTION-START-1's `recordCursorScreenY` computes.
  - **Browse-away detection** (`:1384-1391`) compares the position with `lastScrollFollowPosRef` (`:389`). On E-ink the reference is the last step, or, before any step, the position when following began. A step therefore never reads as browsing away.
  - **The E-ink input.** Narrate's view already receives the settings snapshot as its `settings` prop (`FoliateView.tsx:270`, `:305`; bound at `useModeBindings.ts:50`). E-ink is `settings.einkMode === true`, the shell's own test (`src/components/ReaderContainer.tsx:143`). No new port is needed.
  - **Flow's contract (mirrored, not imported, LL-120).** After EINK-FLOW-VIEWPORT-1, Flow holds the scroll while the word's line is in view and steps the line to the top when it leaves (`src/reader/modes/flow/helpers/FlowScrollEngine.ts:885-914` `advanceZone`, E-ink target `:897-898`).
- **Design:**
  - **Settled by the owner:** the heard line lands at the top after a turn (#12). A manual scroll-away behaves as in regular Narrate (#13).
  - **Settled by Blurby.Brain1 (ruling D):** Seq 130.5, with EINK-VIEW-REFRESH-1 as a hard prerequisite; this item hooks that item's `reportViewAdvance` signal.
  - **Engineering choices:**
    - **The step:** on E-ink, W1 skips the throttle and the zone offset. If the heard span's line is fully inside the view (top ≥ 0 and bottom ≤ view height), it writes nothing. Otherwise it runs `await renderer.scrollToAnchor(range)` once with no offset, which puts the line at the top, as W3 already does. It then records `lastScrollFollowPosRef.current = renderer.containerPosition` and calls `onViewAdvance()`.
      - No throttle: a turn is never late by up to 500 ms.
      - At most one step can be in flight. A heard word that arrives during an in-flight step is judged after it resolves.
    - **First reference:** when `lastScrollFollowPosRef.current` is null on E-ink, W1 sets it to the current position before judging, so a manual scroll from the first word on is detected.
    - **The signal hop (LL-174):** `NarrateFoliateView` prop `onViewAdvance?: () => void` → `useModeBindings` viewProps `onViewAdvance: runtime.onViewAdvance` → `NarrateModeRuntime.onViewAdvance = () => { if (this.alive) this.ports.shell.reportViewAdvance(); }`. The name is as landed by EINK-VIEW-REFRESH-1; re-grep `ReaderPorts.ts` at the cut.
    - **One turn, one flash.** Narrate's `onRelocate` reports only the relocate (`ModeRuntime.ts:510-513`). After EINK-VIEW-REFRESH-1, `reportRelocate` no longer flashes (its spec's "one reader signal"). A step's own relocate therefore adds no second flash. Done-when 5 counts the flashes; two flashes for one step is a stop.
    - **Constants:** none. The step has no margin: a line is in view or not.
- **Prerequisites:**
  - **EINK-VIEW-REFRESH-1 (Seq 130) merged** (hard; ruling D). It adds `reportViewAdvance` to the shell port, the fake ports and the app-level refresh owner.
  - **NARRATE-SELECTION-START-1 (Seq 124) merged.** It edits the same `FoliateView.tsx` (the follow effect, the resize backstop and the hold-then-catch flag) and adds the cursor-geometry helper this item reuses.
  - **EINK-FLOW-VIEWPORT-1 (Seq 128) merged.** That is the contract this item mirrors.
  - The RC integration window merged to `origin/main`; cut from the latest merge and re-grep every site (standing rule 36).
  - No open owner or technical question.
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr; each command passes only on exit 0 unless stated):
  1. **Red first (standing rule 43).** Commit `tests/narrate/narrate.einkViewport.test.tsx` alone. On the base (the merged prerequisites), `npx vitest run tests/narrate/narrate.einkViewport.test.tsx` exits 1, as follows. (n1), (n2), (n3), (n6) and (n7) fail: the base scrolls every throttled word, has no step and does not report a view advance. (n4) and the regular-display control (n5) pass. Record the output.
  2. **The change** at the edit sites below, and nowhere else.
  3. `npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts tests/readerModes/bandAlign2Cover.test.tsx` exits 0, with no existing test edited (standing rule 50).
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  5. **Live, packaged (standing rule 53; scratch profile proved before the first input, LL-165).** The probe is saved as `docs/governance/close-outs/Probe.EINK-NARRATE-VIEWPORT-1.mjs.txt` (standing rule 52). It opens the bundled sample *Meditations* with E-ink on in the scratch profile's settings, Narrate playing at the default rate, and the window at 1280 × 800. A `requestAnimationFrame` sampler records `renderer.containerPosition`, the heard span's line top in view px, and each appearance of `.eink-refresh-overlay` (a `MutationObserver`).
     - **(p1) Hold:** across the heard words of one screen, `containerPosition` is constant.
     - **(p2) Turn:** when the heard line passes the bottom, `containerPosition` changes once. The heard line's top is then within 2 px of the view's top, and `.eink-refresh-overlay` appears exactly once for that turn. Two turns are recorded.
     - **(p3) Scroll away:** a wheel scroll of one screen while playing shows the jump-back button, and `containerPosition` stays where the reader left it for the next 5 heard words. Pressing Jump back lands the heard line at the top.
     - **(p4) Regular control:** with E-ink off, the same 10 s records `containerPosition` changes on at least 3 distinct samples (the continuous follow) and no `.eink-refresh-overlay`.
     - **Detector control (standing rule 55):** the probe first proves its overlay observer by one Page turn on E-ink (exactly one overlay appearance, per EINK-VIEW-REFRESH-1). On the base package, (p1) records more than one `containerPosition` value within a screen.
     - **Stop rule:** if (p2) records two overlay appearances for one turn, stop and return to Blurby.Brain1 with the frame log. Do not suppress a flash here.
  6. Package verification (below) and Blurby.Brain1's confirmation recorded in the close-out.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly these, plus the memo and `Timing.EINK-NARRATE-VIEWPORT-1.jsonl`:
     - `M src/reader/modes/narrate/FoliateView.tsx`
     - `M src/reader/modes/narrate/useModeBindings.ts`
     - `M src/reader/modes/narrate/ModeRuntime.ts`
     - `A tests/narrate/narrate.einkViewport.test.tsx`
     - `A docs/governance/close-outs/Probe.EINK-NARRATE-VIEWPORT-1.mjs.txt`
     - and `git diff --name-only <base> -- src/reader/modes/flow src/reader/modes/focus src/reader/modes/page src/components src/types.ts src/utils src/reader/ports` prints nothing.
- **Effort:** M. One view file plus a two-line hop, but a live audio row and exact-index tests.
- **Owners:** Blurby.Roadmap (spec, merge go); Blurby.Brain1 (package confirmation, the flash stop rule); RodneySr implementation session (bounded, Narrate view); spec-compliance then quality reviewer; the owner's release gate (2) check, "on E-ink, Narrate turns the screen once at the bottom, with one flash".
- **Source:** the ROADMAP stub (`ROADMAP.md:1890`, roadmap-review worktree); owner answers #12–#13 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`); Blurby.Brain1 ruling D (2026-11-03); EINK-VIEW-REFRESH-1's full spec (`docs/planning/specs/2026-11-03/EINK-VIEW-REFRESH-1.md`); code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (line numbers on `70d64237`; the file is edited by NARRATE-SELECTION-START-1 first, so re-grep every one at the cut):**
  1. **`src/reader/modes/narrate/FoliateView.tsx`:**
     - **Props** (`:270-299`): add `/** EINK-NARRATE-VIEWPORT-1: the view turned on E-ink (one screen step). */ onViewAdvance?: () => void;`, destructure it, and keep it in a ref (`onViewAdvanceRef`), as the view does for its other callbacks.
     - **`const isEink = settings.einkMode === true;`** beside `:329`.
     - **New ref** `einkStepInFlightRef = useRef(false)`.
     - **Follow effect (`:1372-1426`).** After the browse-away check (`:1384-1391`) and `resolveWordState` (`:1394-1396`), add the E-ink branch before the throttle (`:1398`):
       - If `isEink`: when `lastScrollFollowPosRef.current == null`, set it to `view.renderer.containerPosition` and continue.
       - If `einkStepInFlightRef.current`, return.
       - Measure the heard span's line top and bottom in view px with NARRATE-SELECTION-START-1's geometry helper. If the line is fully inside the view, return.
       - Otherwise set the in-flight flag and run `(async () => { try { await view.renderer.scrollToAnchor?.(range); if (userBrowsingRef.current) return; const pos = viewRef.current?.renderer?.containerPosition; if (typeof pos === "number") lastScrollFollowPosRef.current = pos; onViewAdvanceRef.current?.(); } catch { /* section closing */ } finally { einkStepInFlightRef.current = false; } })(); return;`
       - The regular path below is untouched, including NARRATE-SELECTION-START-1's hold flag. The E-ink branch returns before it.
       - Add `isEink` to the effect's dependency list.
     - **Chunk-follow (`:695-699`):** add `&& !isEink` to the scroll condition, and `isEink` to the dependency list.
  2. **`src/reader/modes/narrate/useModeBindings.ts`** viewProps (`:48-73`): `onViewAdvance: runtime.onViewAdvance,`.
  3. **`src/reader/modes/narrate/ModeRuntime.ts`**, beside `onRelocate` (`:510`): `/** EINK-NARRATE-VIEWPORT-1: one E-ink screen step (the shell flashes once). */ onViewAdvance = (): void => { if (!this.alive) return; this.ports.shell.reportViewAdvance(); };`.
- **Tests (new `tests/narrate/narrate.einkViewport.test.tsx`, jsdom):**
  - **Harness:** copied from `tests/narrate/narrate.selectionStart.test.tsx` (as landed by NARRATE-SELECTION-START-1), which itself derives from `tests/readerModes/bandAlign2Cover.test.tsx:17-117` (standing rule 52).
  - **The fake:** a renderer exposing `containerPosition` and a `scrollToAnchor` spy that sets `containerPosition` to the span's top. The container is 600 px; each heard span has a fixed rect in 20 px lines.
  - **The audio:** `narrationWordIndex` is re-rendered one exact index at a time (LL-173), never by elapsed time. `settings` is `{ ...DEFAULT_SETTINGS, einkMode: true }` unless stated.
  - **(n1)** 20 heard words on lines 1–20 (all inside 600 px) → 0 `scrollToAnchor` calls and 0 `onViewAdvance` calls. *Base: ≥ 1 call.*
  - **(n2)** The heard word moves to line 31 (bottom 620 > 600) → exactly 1 `scrollToAnchor` call, with no zone-offset write after it (`containerPosition` equals the span's top), and 1 `onViewAdvance` call. *Base: a zone-offset write and no `onViewAdvance`.*
  - **(n3)** After a Jump back that lands above, a heard word above the view → 1 step. Two heard words inside 5 ms → still 1 step (in-flight guard, no throttle). *Base: throttled or offset.*
  - **(n4) control:** a wheel-driven `containerPosition` change of 300 px (over 0.3 × 600) → the view calls `onUserBrowseAway`, and the next 5 heard words make 0 writes (#13, unchanged behaviour).
  - **(n5) control:** `einkMode: false` → the W1 call sequence for (n1)'s 20 words equals the base's (throttled `scrollToAnchor` plus the zone offset), recorded on the base first.
  - **(n6)** The runtime hop: a `NarrateModeRuntime` built as in `tests/narrate/narrate.mode.test.ts:28-39` (copied; `createFakeInfrastructure` from `tests/readerModes/harness/fakePorts.ts`) receives `onViewAdvance()` → the fake recorder holds 1 `shell.reportViewAdvance`. *Base: no method.*
  - **(n7)** A non-null `chunkReadingVisualState` with E-ink on → no chunk scroll. *Base: scrolls.*
- **Constants:** none.
- **Branch:** `eb/eink-narrate-viewport-1` from `origin/main` after EINK-VIEW-REFRESH-1's merge. Push with `git push origin HEAD:refs/heads/eb/eink-narrate-viewport-1` (LL-181).
- **Staging plan:**
  - C1: the test (red).
  - C2: `src/reader/modes/narrate/FoliateView.tsx`, `src/reader/modes/narrate/useModeBindings.ts` and `src/reader/modes/narrate/ModeRuntime.ts`.
  - C3: the probe `.mjs.txt`, the memo and the time log.
  - Explicit paths only. Merge `--no-ff` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b).
- **Failure handling:**
  - **(p2) shows the line not at the top** (more than 2 px off): `scrollToAnchor` on this renderer lands with an offset. Record the offset and stop and return to Blurby.Brain1. Do not add a correction constant.
  - **(p2) shows two flashes per turn:** stop and return to Blurby.Brain1 (Done-when 5).
  - **(p3) shows following continuing after a manual scroll:** the E-ink branch runs before the browse-away check. Restore the order only.
  - **A narrate test on the heard word or index fails:** revert the view change and report (LL-142).
  - **Repair limit:** two repair passes per gate; then stop. Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr (rule 6b), clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\eink-narrate-viewport-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/eink-narrate-viewport-1 .worktrees/eink-narrate-viewport-1 origin/main`).
  - Host prerequisites: `npm ci`. The Kokoro model is present for the live audio row; the sample book is bundled.
  - The arm64 25 s launch runs on Rodney at merge.
- **Package verification (standing rule 53, RodneySr placement):**
  - `--dir --x64` and `--dir --arm64` builds of the final commit with `origin/main` merged.
  - A 25 s x64 scratch-profile launch with the LL-165 proof and no error or crash line.
  - The renderer bundle in `app.asar` matches `dist/`; extract in the scratchpad.
  - Done-when 5 on the packaged exe with its base detector run.
  - A "Package verification" section in the close-out, and Blurby.Brain1's confirmation before the merge go.
- **Lane ownership:** TTS / Narration Engine. Execution surface A (the Narrate view and runtime).
- **Forbidden during parallel run:** every sibling mode; `src/reader/ports/**` (EINK-VIEW-REFRESH-1 owns the port change); `src/components/**`; `src/utils/FlowScrollEngine.ts`; `src/types.ts`; `patches/`; `src/constants.ts`.
- **Shared-core touches:** none.
- **Merge order:**
  - After NARRATE-SELECTION-START-1 (124), EINK-FLOW-VIEWPORT-1 (128) and EINK-VIEW-REFRESH-1 (130).
  - Before NARRATE-BAND-SPACE-1 (141), which re-greps `FoliateView.tsx` (the follow offset and band) after it.
  - With NARRATE-PAUSED-CLICK-1 (117), whose `ModeRuntime.ts` hunk is the click path: Seq order, so it is already merged.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests: hold, one top-landing step, in-flight guard, runtime hop, chunk guard; browse-away and regular controls pass | repeat | positive-control | bounded | medium | 5m (median of 20 runs) | — | — |
| 2 | E-ink step in the follow effect, chunk guard, `onViewAdvance` prop, binding and runtime port call | novel | feature | bounded | medium | 12m | 25m | — |
| 3 | Local gates, both reviews, rule 53 pair, live probe with flash count and base detector | repeat | packaging-verify | bounded | medium | 14m (median of 4 runs) | — | — |

**Total:** chain 31m · sum 31m; 2 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-142, owner ruling #31:** the step keys off the exact heard index only; no timing estimate enters the view.
- **LL-173:** tests advance the heard index one exact step at a time, never by elapsed time.
- **LL-139:** the six-writer census precedes the guard; only W1 changes and W2 is guarded.
- **LL-120:** Narrate mirrors Flow's E-ink contract in its own file; nothing from Flow is imported.
- **LL-174:** the view-advance signal crosses three hops (view → binding → runtime → port). Each is an edit site; (n6) drives the runtime hop and the packaged row the whole chain.
- **LL-169:** the step re-reads `viewRef.current` after the await before recording the position.
- **Standing rule 36:** sites cited at `70d64237` and re-grepped after NARRATE-SELECTION-START-1 and EINK-VIEW-REFRESH-1 land.
- **Standing rule 43 (LL-138):** red first, with two controls.
- **Standing rule 48 (LL-149), 41 (LL-136), 50 (LL-156), 52 (LL-146):** as written in Done-when.
- **Standing rule 53 (LL-167) and LL-165:** package with a proven scratch profile; the bundled sample only.
- **Standing rule 54 (LL-158):** considered: nothing is persisted, so the rows read live renderer state.
- **Standing rule 55 (LL-151/LL-166):** the overlay observer is proved on a Page turn first; the base must show the continuous scroll.
- **LL-181:** worktree placement and the explicit `eb/` refspec.
