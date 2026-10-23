# READER-VISUAL-DIAG-1 — The Focus/Flow reading band and the ResizeObserver flood

Read-only diagnosis, measured live on 2026-10-23 on `main` @ `77f1502c`, with `612d03f5` (before the Narrate removal) as the comparison base for H4. The file keeps the date in its specification's name. No product code was changed or committed. All instrumentation was injected at run time through the Chrome DevTools Protocol (CDP) and never touched the tree (Done-when 4's `src`/`main`/`preload.js` check prints nothing).

## Summary

| | Verdict | One-line finding |
|---|---|---|
| **H1** — band is ~3 lines instead of 5 | **Partly confirmed** | The zone height is always 5 × 24 px = 120 px, because the outer view's line-height is `normal` and the code falls back to 24. It ignores text size: the band covers 4.4 body lines at 100% and 3.6 at 120%, never 5. |
| **H2** — Focus band not tied to the cursor | **Confirmed** | The Focus band sits at a fixed 15%–34% of the view, and the cursor word was outside it in every Focus measurement (above the band at section start, at 222–256 px against a 94–214 px band after the arrival scroll). |
| **H3** — two clocks in Flow | **Confirmed in effect; cause inferred** | Over 3 minutes of play, the underlined word was outside the band in 106–136 of 177–178 one-second samples (60–77%) in all four sessions, including `612d03f5`. After an in-band run of 15–19 s early in play, the band rarely holds the cursor again; the last 89 s of S1, S2 and S4 are entirely out of band (mostly above, with 1 s flips below). The pacer's own line index is not exposed, so a drift between two clocks is an inference, not a reading. |
| **H4** — observer loop floods `error.log` | **Refuted as stated; leak found and shown causal** | None of the app's observers loops: 96.7–97.3% of their writes set an equal value. The flood stops when foliate-js **`View` ResizeObservers left on dead 0×0 section bodies** are disconnected. They are left behind because our teardown detaches the book frame before `view.close()` runs, so `View.destroy()` skips its unobserve. In S13, disconnecting the second of two such observers (the first changed nothing) took the rate from 60/s to 0/s. Which leaked observer drives the flood, and how, is not settled (H4 below); the fix disconnects both. |

**BUG-188's location** is the reading-zone mask, not `.flow-shrink-cursor`, as the census said; the measurements confirm it. **BUG-188 is the 2026-10-10 "Flow band" sighting** (`os1-owner-observations.json` S2, "the horizontal highlight cursor didn't follow the word cursor"). The intermittency the owner saw is the in-band/out-of-band run pattern measured here: the band holds the cursor for 15–19 s runs, then loses it.

## Sessions

Every session ran on a fresh scratch profile under `%TEMP%`. The owner's profile and Drive were never touched. `sourceFolder` was read from each profile's `settings.json` before the session and was empty (`[]`) in every one (the BUG-193 confound rule). The window was 1002 × 630 CSS px at device pixel ratio 1.25, on the owner's machine.

| # | Build | Route | Length | `sourceFolder` | Purpose |
|---|---|---|---|---|---|
| E | production `--dir`, base | Page → Focus → Flow, by hand | ~5 min | empty | H1, H2 probes; first flood sighting |
| S1 | production `--dir`, base | scripted (below) | 5 min | empty | H3, H4 count |
| S2 | dev, base | scripted | 5 min | empty | H3, H4 count |
| S3 | dev, `612d03f5` | scripted | 5 min | empty | H3, H4 count (A/B) |
| S4 | dev, base, instrumented | scripted | 5 min | empty | H4 per-observer counters |
| S5 | dev, base | sandbox trial of the script | — | empty | discarded (3 lines; not used) |
| S6 | production, instrumented | Page → Flow, 20 s | — | empty | route control |
| S7, S8 | production, instrumented | Page → Focus 10 s → Flow 20 s | — | empty | route, live-observer census |
| S9 | production, instrumented | as S7, then disconnect the leaked `Paginator` observers | — | empty | first leak test |
| S10–S12 | production, instrumented | as S13 | — | empty | bisection attempts that ran zero steps (script faults); not used |
| S13 | production, instrumented | Page → Focus → Flow, then disconnect observers one at a time | — | empty | H4 causal test |

The scripted sessions ran 328.4–336.6 s from start to finish, not exactly 5 minutes; rates below use the measured length.

**Scripted session (S1–S4).** The same actions every time:
1. Open the first library card (the bundled *Meditations*) and wait 15 s.
2. Jump through the contents list to INTRODUCTION and wait 8 s.
3. Focus mode, paused: 60 s.
4. Flow mode, then Play: 180 s.
5. Pause: 60 s.

**Dev and production setup.**
- **Dev:** `npx vite --port 5173` in the build's worktree, plus `electron . --remote-debugging-port=9339`. `612d03f5` predates `BLURBY_USER_DATA_DIR`, so its profile was set with Electron's `--user-data-dir`.
- **Production:** `npm run build`, then `npx electron-builder --win --x64 --dir --publish never` (both exit 0) in this worktree, launched as `release\win-unpacked\Blurby.exe --remote-debugging-port=9338` with `BLURBY_USER_DATA_DIR`.

**Instrumentation (never in the tree).** `ro-wrap.js` was injected with CDP `Page.addScriptToEvaluateOnNewDocument` and a reload. It wraps `window.ResizeObserver`:
- creation site from the stack;
- callbacks per second;
- observed target sizes;
- `observe`, `unobserve` and `disconnect`.

It also counts `setAttribute` writes of `max-block-size`, `max-column-count` and `margin`, and `setProperty` writes of `--flow-zone-*`, whether each one changed the value, and window `error` events whose message contains "ResizeObserver". The Flow sampler (`band-probe.js`) reads the band from `.rm-*-view`'s computed rect and zone properties. It reads the cursor from `.page-word--flow-cursor` / `.page-word--highlighted` in the section frame, offset by the frame's rect.

**The wrapper changes when the flood starts.** In every instrumented production run (S7, S8, S9, S10, S13), the 60/s flood starts at Focus entry, when only the Page-era leaked `View` exists. In S7 it pauses for 3.5 s at the switch to Flow and then resumes. The uninstrumented S1 logs one line at Focus entry and floods only from Flow entry. So the wrapper perturbs the loop's onset, and the instrumented runs are evidence about which observers exist and what stops the flood, not about when it starts.

**Artifacts** (outside the repository): `C:\Projects\Blurby-artifacts\reader-visual-diag-1\`. It holds every session's JSON, the screenshots, and the five scratch scripts (`band-probe.js`, `ro-wrap.js`, `session.mjs`, `prod-loop.mjs`, `leak-test.mjs`).

## Re-grep on `77f1502c` (cited sites)

| Specification cite (`a0e09189`) | Now |
|---|---|
| zone mask `focus/mode.css:34-55`, `flow/mode.css:31-52` | `focus/mode.css:34-55`, `flow/mode.css:31-52`; default `--flow-zone-top: 20%`, `--flow-zone-bottom: 45%` (overridden inline at run time) |
| `.flow-shrink-cursor` hidden (`styles/flow.css:49`, `flow/mode.css:113`) | `styles/flow.css:40-52`; `flow/mode.css:104` (`.rm-flow-shrink-cursor`) |
| `applyZoneProperties` focus `:1170-1184`, flow `:1246-1260` | unchanged lines; also `narrate/FoliateView.tsx:1299-1313` (new) |
| other `lineHeight … \|\| 24` reads | `focus:469`, `flow:499`, `narrate:530`, `flow/useModeBindings.ts:39` (`onZoneTopChange` `:34`) |
| Focus arrival `scrollIntoView({block:"center"})` `:1047-1060` | `focus/FoliateView.tsx:1054-1055` |
| observers: page `:1018`, focus `:1188`, `:1212`, flow `:1264`, `:1288` | page `:1147`; focus `:1188`, `:1212`; flow `:1264`, `:1288`; **narrate `:1317`, `:1341` (new)** — seven app observers |
| error path `App.tsx:130-143` → `preload.js:122` → `misc.js:334-336` | `App.tsx:130-137`; `preload.js:124` (`logError`); `main/ipc/misc.js:343` (`log-error`) |
| teardown | `view.close()` deferred one frame, host cleared at once: `focus/FoliateView.tsx:1086-1096`, `flow:1162-1172`, `page:1064-1074` |
| foliate-js 1.0.1 | `View` observer `paginator.js:201`, observe on load `:265`, `View.destroy` `:410-411`, `expand` `:354`; `Paginator` observer `:422`, observe `:550`, `destroy` `:1157-1158` |

## H1 — band height (Focus and Flow, 100% and 120%)

Measured on the packaged base build (session E), paused, INTRODUCTION:

| Mode | Text size | Outer view `line-height` | Zone | Zone height | Body line step (EPUB `<p>`) | Lines in band |
|---|---|---|---|---|---|---|
| Focus | 100% | `normal` | 15% → 34.05% of 629.8 px | **120.0 px** | 27 px (18 px font) | 4.4 |
| Focus | 120% | `normal` | 15% → 34.05% | **120.0 px** | 33 px (22 px font) | 3.6 |
| Flow | 100% | `normal` | 15% → 34.05% | **120.0 px** | 27 px | 4.4 |
| Flow | 120% | `normal` | 15% → 34.05% | **120.0 px** | 33 px | 3.6 |

`applyZoneProperties` reads `parseFloat(getComputedStyle(container).lineHeight) || 24`. `normal` parses to `NaN`, so the zone is `5 × 24 / viewportHeight` (`FLOW_ZONE_LINES_DEFAULT = 5`, `FLOW_ZONE_INITIAL_TOP = 0.15`), whatever the book's text size.

The specification predicted about 3.1 lines at 120%, from 38.9 px EPUB lines. The measured body lines are 33 px at 120% (22 px × 1.5), so the band covers 3.6 lines. The headings (27–33 px font) step 60–75 px, so around a heading the band covers only 1.6–2 lines.

`612d03f5` (S3) is identical: 120.1 px on a 627.4 px view. Screenshots: `h2-focus-100.png`, `h1-focus-120.png`, `h1-flow-100.png`, `h1-flow-120.png`.

The body-line steps and the 120% rows come from session E only, measured by hand on `<p>` elements. The scripted probes in S1–S4 read the zone and the INTRODUCTION heading (1.98 lines of it in band), not body lines, so they confirm the 120 px zone but not the line counts.

**Verdict: partly confirmed.** The 24 px fallback is confirmed as the cause. The band is never 5 lines and does not scale with text size. The measured number of lines (4.4 / 3.6) differs from the predicted 3.1.

## H2 — Focus band against the cursor word

Focus, paused, after opening the book and jumping to INTRODUCTION. Band 94.5–214.4 px (S1 and E):

| Session | Cursor word | Cursor top–bottom | In band? |
|---|---|---|---|
| E (at the section start, 100%) | "INTRODUCTION" (index 187) | 55.6–89.4 px | no (above) |
| E (120%) | "INTRODUCTION" | 62.4–103.4 px | no (straddles the top edge) |
| S1 (after the arrival scroll) | "INTRODUCTION" | 222.8–256.6 px | no (below) |
| S3 `612d03f5` | "INTRODUCTION" | 221.8–255.6 px | no (below) |

The band is fixed at 15% of the view, and the arrival scroll places the cursor by `scrollIntoView({ block: "center" })` (or leaves it at the section top when the section cannot scroll further). Nothing places the cursor's line inside the band. The screenshot `h2-focus-100.png` shows the bright band over four body lines while the cursor heading sits dimmed above it.

**Verdict: confirmed.**

## H3 — Flow, playing (word timer against the band)

One sample a second for 180 s of play at the default speed. The window was visible in every sample except 12 in S4 (the instrumented run). Those 12 are kept in the counts, because removing them does not change the outcome.

| Session | Samples | Underline outside the band | In band, first 20 s | Words covered | Run pattern (out/in, seconds) |
|---|---|---|---|---|---|
| S1 production, base | 177 | **136 (77%)** | 5 | 187 → 818 | above 15 · in 19 · below 27 · 1–6 s alternations · then out 89 (above 15, 41, 11, 19 with 1 s flips below) |
| S2 dev, base | 177 | **134 (76%)** | 4 | 187 → 807 | above 15 · in 18 · below 24 · alternations · **out 89, mostly above** |
| S3 dev, `612d03f5` | 177 | **106 (60%)** | 14 | 187 → 820 | above 5 · in 15 · **below 59** · in-band runs of 8–24 s · out at the end, mostly above |
| S4 dev, base (instr.) | 178 | **133 (75%)** | 5 | 187 → 779 | above 14 · in 19 · below 28 · in 12 · in 14 · **out 89, mostly above** |

Reading:
- The underline starts above the band. The play cursor begins on a heading at the section top while the band is at 15%.
- The underline is then held for 15–19 s, and drops below the band for 24–59 s.
- After that the band holds the cursor only in short runs (none at all in the last 89 s of S1, S2 and S4), and the underline sits mostly above it. That fits the specification's two-clock reading: the word timer paints the underline (`flow/ModeRuntime.ts`), while the line pacer scrolls its own line under the band and adds 150 ms per line. It does not fit a fixed offset. The run lengths do not grow steadily; the early and late phases differ.
- The pacer's line index is not exposed outside `FlowScrollEngine`, so the index-against-index comparison the specification asked for was not taken.

**Verdict: confirmed in effect** (60–77% of play time out of band, on both bases). **The cause is inferred, not measured:** a drift between two clocks fits the pattern, but the pacer was not read.

## H4 — the `error.log` flood

**Counts, 5-minute sessions, same actions:**

| Session | Length | `ResizeObserver` lines | Per minute (measured length) | When |
|---|---|---|---|---|
| S1 production, base | 328.7 s | **14,428** | **2,634** | 1 line at Focus entry (01:10:24); then a sustained 60/s from entering Flow (01:11:24) to session end, through play and pause |
| S2 dev, base | 328.4 s | 451 | 82 | 446 in an 8 s burst on entering Flow; 5 on entering Focus |
| S3 dev, `612d03f5` | 328.4 s | 499 | 91 | 495 in an 8 s burst on entering **Focus**; 4 on entering Flow |
| S4 dev, base (instr.) | 336.6 s | 750 | 134 | 748 in a 13 s burst on entering Flow |
| E production, base (by hand) | ~5 min | 4,103 | — | exploratory; same message |

The S1 counts are the lines added between the script's start and finish reads; the app kept logging until it was closed, so the file holds 14,448.

The lines are `Unhandled: ResizeObserver loop completed with undelivered notifications. at …:0`, logged through the window `error` handler (`App.tsx:130-137` → `preload.js:124` → `main/ipc/misc.js:343`). One other line appears, once per production run that enters Focus (S1, S8, S9, S10, S12, S13), about 130 ms after the Focus click: `Uncaught TypeError: Cannot destructure property 'style' of 'r' as it is null`, thrown inside foliate-js's `paginator` bundle. It is a single error, not part of the flood, and is recorded here for the fix item to recheck. The flood **predates the Narrate removal**: `612d03f5` floods at the same dev rate.

**What the flood is not.** In S4 (dev) and S7 (production), the app's observers fired only on real resizes:
- **In dev:** 85 callbacks in 53 distinct seconds, at most 3 a second, on the Flow view's 1002↔994 px scrollbar width.
- **In production:** 6 callbacks in the whole 20 s of Flow, while the page logged 1,181 errors.

Their writes are almost all equal-value:
- `max-block-size`: changed on 3 of 92 writes;
- `--flow-zone-*`: changed on 4 of 147 writes;
- `margin`: changed on 3 of 3 writes (real layout changes, too few to loop);
- frame-by-frame geometry of the Flow view, foliate-view and renderer: **0 changes in 181–182 frames** (S6, S7, S8).

So the specification's "five observers rewriting attributes with no equality check" is not the loop.

**What the flood is.**
- **Route:** going straight from Page to Flow (S6) gave 1 error in 20 s. Going Page → Focus → Flow (S7) gave 1,181. The loop follows the view that was just left.
- **Census in Flow (S8):** besides the live Flow set, foliate observers from earlier views are still observing:
  - two `Paginator` observers (`paginator.js:422`) on disconnected 0×0 `div`s;
  - three `View` observers (`paginator.js:201`): two on 0×0 `body` elements of dead section frames, and one observing nothing.
- **Causal test (S13, production, in the loop at 60.2 errors/s):** each observer was disconnected in turn, with the rate measured for 3 s after each step:
  1. leaked `Paginator`, detached div → 60.0/s
  2. leaked `View`, no target → 60.3/s
  3. leaked `View`, 0×0 body → 60.3/s
  4. leaked `Paginator`, detached div → 60.0/s
  5. **leaked `View`, 0×0 body → 0.0/s**
  6. the live observers after it (Flow ×2, Paginator, View) → 0.0/s

  The flood stopped at step 5, with the live observers still attached, and steps 6–9 came after the rate was already 0. Disconnecting the leaked `Paginator` observers did nothing (steps 1 and 4; S9 also, 59.9 → 59.9/s).

  **What this shows, and what it does not.** The steps are cumulative. Step 3 disconnected the other leaked `View` on a 0×0 body and changed nothing, so S13 shows that the flood needs the step-5 observer, or both leaked `View` observers together. It does not show that one observer alone causes it. The census does not record which mode's teardown left each observer behind, so "the Focus-era observer" is not established either.

**What is established.**
- **Where the observers come from:** foliate-js 1.0.1's `View` creates `#observer = new ResizeObserver(() => this.expand())` (`paginator.js:201`). On each section load it calls `observe(doc.body)` (`:265`).
- **Why they are never removed:** `View.destroy()` unobserves only `if (this.document)` (`:410-411`). Our mode views clear the host synchronously (`foliateHostRef.current.innerHTML = ""`, `focus/FoliateView.tsx:1096`) and defer `view.close()` by one frame (`:1094`, the S1 G6 change; Flow `:1162-1172` and Page `:1064-1074` are the same). When `close()` → `renderer.destroy()` → `View.destroy()` runs, the frame is detached, `this.document` is null, and the body stays observed.
- **A second, harmless leak:** `Paginator.destroy()` calls `unobserve(this)` (`:1158`), but the observer watches `#container` (`:550`).

**What is not established.**
- **How the leaked observer produces 60 errors a second.** The obvious account, that `expand()` keeps resizing the dead view, is contradicted by the data: each leaked `View` observer's callback ran once (`calls: 1`), S7 counted 6 callbacks against 1,181 errors, and on a detached frame `expand()` throws at its first line (`paginator.js:355`, `const { documentElement } = this.document`), so it cannot resize anything. The loop is in Chromium's delivery of notifications for that observer, by a mechanism this diagnosis did not determine.
- **Why a leak is not always a flood.** Page → Flow (S6) leaks a `View` observer too and logs 1 line.
- **Why dev and production differ.** In dev the loop stops after 8–13 s; in production it runs on.

None of the three is needed for the fix: disconnecting the leaked observers ends the flood, whatever the delivery mechanism.

**Verdict: H4 refuted as stated** (it is not the app's observers rewriting attributes). **Cause found and shown causal by intervention:** foliate-js `View` observers left on dead section bodies by our teardown order. The loop's mechanism is open.

## BUG-188 location and the 2026-10-10 sighting

- **Location (corrected):** the band is the reading-zone mask (`mask-image` on `.rm-focus-view` / `.rm-flow-view`, `focus/mode.css:34-55`, `flow/mode.css:31-52`). Its size and position come from `applyZoneProperties` (24 px fallback, fixed 15% top). `.flow-shrink-cursor` / `.rm-flow-shrink-cursor` is hidden and is not the band.
- **S2 sighting:** BUG-188 is the same defect as `os1-owner-observations.json` S2, "In Flow, the horizontal highlight cursor didn't follow the word cursor". The owner's 20 s re-check "stayed on the highlighted word's line". That matches the 15–19 s in-band runs measured here, before the band loses the cursor.

## Owner-observed confirmation (standing rule 45)

For the **next** batched smoke, not gate (2):

- **Focus and Flow band against the word cursor.** In Focus (paused) and in Flow (playing for at least 1 minute) on *Meditations* from INTRODUCTION, does the bright band contain the underlined or highlighted word?
  - Before the BAND-ALIGN-1 fix it should not, most of the time; that is this report's finding.
  - After the fix it should, every time it is checked.

---

## Fix specification — BAND-ALIGN-1 (BUG-188)

- **What, in two parts:**
  - **Part A (technical): the band's height.** The zone is sized from the loaded section's real body line step, so a 5-line band covers 5 body lines at any text size.
  - **Part B (design): where the band sits.** This part is held for the owner (below). In Focus, the band's top would follow the cursor's line on arrival and on every highlight move. In Flow, the pacer would scroll the **underlined word's** line under the band, with the word timer as the only clock, instead of keeping its own line index.
- **Why:** BUG-188, measured here.
  - The band is 120 px whatever the text size (24 px fallback), so it covers 4.4 or 3.6 body lines, never 5.
  - The Focus cursor is outside the band in every measurement.
  - In Flow, the underline is outside the band 60–77% of the time.
- **Rule 11, and the decision held for the owner:**
  - Part A is hybrid: the band's size changes visibly, toward the 5 lines the setting already promises. Recommendation: do it.
  - Part B is tier 3, front of house, and is **held for the owner's decision before dispatch**. A band that moves with the cursor in Focus is a different design from today's fixed band at 15%. The owner's S2 observation ("the horizontal highlight cursor didn't follow the word cursor") says the band should contain the cursor. It does not say whether the band should move to the cursor or the text should scroll the cursor into a fixed band.
  - Recommendation: keep the band fixed. In Focus, scroll the cursor's line into it, the way Flow already scrolls. In Flow, give the pacer the word timer's line. This keeps today's look and still meets the owner's expectation.
  - Part B's Done-when and edit sites below assume that recommendation. If the owner rules the other way, they are rewritten before dispatch.
  - Band height and line count stay the owner's call: `FLOW_ZONE_LINES_DEFAULT` (5) is unchanged.
- **Done when:**
  1. **Positive control.** New tests in `tests/readerModes/` fail on the base:
     - **(b1)** With a fake section frame whose body `<p>` line step is 27 px, and the outer view at `line-height: normal`, the zone height is 135 px (5 × 27), not 120. Repeated at 33 px, the zone height is 165 px.
     - **(b2)** In Focus, after the highlight moves to a word whose line top is at 400 px in a 630 px view, the cursor's line lies inside the band (band top ≤ line top, and line bottom ≤ band bottom).
     - **(b3)** In Flow, a fake word timer and pacer on a fixed line map run 200 ticks at the default speed. After every tick, the line under the band is the underlined word's line. The test fails if any of the 200 ticks differs.
  2. Those tests pass, and `tests/readerModes/` and `tests/flowScroll*` pass.
  3. **Live, packaged build.** This report's probes, on *Meditations* at 100% and 120%:
     - **Zone height:** at least 4.5 × the body line step, at both sizes.
     - **Focus, three checks:** (i) after the contents jump to INTRODUCTION; (ii) after 20 highlight steps forward; (iii) after a contents jump to the next contents entry after INTRODUCTION. The cursor word is inside the band in all 3.
     - **Flow:** the underline is outside the band in at most 9 of 180 one-second samples (5%), on the scripted route.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0.
  5. **Owner (next smoke):** the confirmation row above passes.
- **Edit sites** (line numbers on `77f1502c`; re-grep at dispatch):
  - **Part A, the zone line height.** It comes from the loaded section's body line step, through a helper in each mode's `helpers/` (no shared module, per the mode-isolation rules). The helper replaces `parseFloat(getComputedStyle(…).lineHeight) || 24` at:
    - `src/reader/modes/focus/FoliateView.tsx:469` and `:1171`;
    - `src/reader/modes/flow/FoliateView.tsx:499` (in `getFlowFollowOffsetPx`, `:495-505`) and `:1247`;
    - `src/reader/modes/flow/useModeBindings.ts:39`;
    - `src/reader/modes/flow/helpers/FlowScrollEngine.ts:788`;
    - `src/reader/modes/narrate/FoliateView.tsx:530` and `:1300`.
  - **Shared core: `src/utils/FlowScrollEngine.ts:788`** carries the same `|| 24`. That file is in the shared-core freeze set.
    - On `77f1502c`, nothing imports it at run time. Its only importers are `import type` lines, in `focus/helpers/foliateWordHighlight.ts:2`, `page/helpers/foliateWordHighlight.ts:2` and `src/utils/foliateWordHighlight.ts:2`, and the Flow runtime uses `flow/helpers/FlowScrollEngine.ts` (`flow/ModeRuntime.ts:79`).
    - **This item does not edit it.** Shared-Core Touches: none.
    - At dispatch, `git grep -n "from \"[./]*utils/FlowScrollEngine\"" -- src | grep -v "import type"` must print nothing. If it prints anything, the item stops and asks for a shared-core window.
  - **Part B, Focus:** scroll the cursor's line into the fixed band.
    - On arrival: `focus/FoliateView.tsx:1054-1055`, which today uses `scrollIntoView({ block: "center" })`.
    - On each highlight: the `highlightWordByIndex` path at `:987`.
  - **Part B, Flow:** one clock.
    - `flow/helpers/FlowScrollEngine.ts:746`: in the `stableWindowScroll` branch, the pacer takes its line from the underlined word's index, not from its own `lineIdx`.
    - `flow/FoliateView.tsx:495-505` (`getFlowFollowOffsetPx`).
- **Tests:** b1–b3 as above, plus the existing Flow and Focus suites.
- **Lane ownership:** Reader Engine. **Forbidden:** `src/utils/FlowScrollEngine.ts`, `src/components/ReaderContainer.tsx` and `src/types.ts`.
- **Merge order:** after the Stage 8 freeze lifts, and after the owner rules on Part B. Part A may ship alone if Part B waits. Independent of FOLIATE-OBSERVER-LEAK-1.

## Fix specification — FOLIATE-OBSERVER-LEAK-1 (BUG-187)

- **What:**
  - **`View.destroy()`:** foliate-js's `View.destroy()` disconnects its ResizeObserver (`this.#observer.disconnect()`) unconditionally. Today it calls `if (this.document) unobserve(this.document.body)`.
  - **`Paginator.destroy()`:** it disconnects its own observer. Today it calls `unobserve(this)`, on an element it never observed.
  - **How:** both changes ship as a `patch-package` patch, `patches/foliate-js+1.0.1.patch`, which the existing `postinstall` (`patch-package && …`) already applies.
  - **Not changed:** our teardown order (host cleared, `close()` one frame later; the S1 G6 change) stays as it is.
- **Why:** BUG-187, measured here.
  - The `View` observers left on dead 0×0 section bodies after a mode switch go with a "ResizeObserver loop completed with undelivered notifications" error every frame.
  - In production that is about 2,634 lines a minute, through every minute of Flow after leaving Focus.
  - Disconnecting them mid-loop stopped it (60 → 0 errors a second). The loop's mechanism is open (H4), but the intervention is decisive.
  - The flood predates the Narrate removal (`612d03f5`).
- **Done when:**
  1. **Positive control.**
     - **The test:** a new `tests/foliateObserverPatch.test.js` reads the installed `node_modules/foliate-js/paginator.js` as text.
     - **What it checks:** that the body of `View`'s `destroy()` (the method after `class View {`) and the body of `Paginator`'s `destroy()` (after `class Paginator extends HTMLElement {`) each contain `this.#observer.disconnect()`.
     - **Why a text test:** `View` is not exported (`paginator.js:200`), and jsdom has no `ResizeObserver`, so a mounted test cannot reach it.
     - **On the base:** the test fails.
  2. With the patch, that test passes, and `npx patch-package` exits 0 on a clean `npm ci`.
  3. **Live, packaged build, uninstrumented.**
     - **The route:** this report's scripted route. Open the first library card and wait 15 s. Make the contents jump to INTRODUCTION and wait 8 s. Then Focus paused for 60 s, Flow playing for 180 s, and paused for 60 s.
     - **The script:** `session.mjs` in `C:\Projects\Blurby-artifacts\reader-visual-diag-1\`. The item's close-out records the script's SHA-256 and copies the session JSON.
     - **The pass mark:** `error.log` gains **0** `ResizeObserver loop` lines during the session. The base gives 14,428.
     - **Also recorded, without a pass mark:** the count of `Cannot destructure property 'style'` lines.
  4. **Live census, with `ro-wrap.js` injected.** After Page → Focus → Flow, no ResizeObserver has a target that is disconnected or a 0×0 `body`.
  5. `npm test`, `npm run typecheck` and `npm run build` exit 0. The packaged app opens a book in all four modes.
- **Edit sites:**
  - `patches/foliate-js+1.0.1.patch` (new). It changes `node_modules/foliate-js/paginator.js` at `View.destroy` (`:410-411`) and `Paginator.destroy` (`:1157-1158`).
  - `tests/foliateObserverPatch.test.js` (new).
  - `package.json` is unchanged: `postinstall` already runs `patch-package`, and `patch-package` is already a dev dependency.
  - **Optional, and out of scope unless ruled in:** rate-limiting identical `logError` lines in `App.tsx:130-137`, so a future loop cannot flood the log. That would be a separate defence, not the fix.
- **Tests:** Done-when 1, plus the reader-mode suites.
- **Merge order:** after the Stage 8 freeze lifts, because it changes installed code. Independent of BAND-ALIGN-1.
