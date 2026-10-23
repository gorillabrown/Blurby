# READER-VISUAL-DIAG-1 — The Focus/Flow reading band and the ResizeObserver flood

Read-only diagnosis, measured live on 2026-10-23 on `main` @ `77f1502c`, with `612d03f5` (before the Narrate removal) as the comparison base for H4. The file keeps the date in its specification's name. No product code was changed or committed. All instrumentation was injected at run time through the Chrome DevTools Protocol (CDP) and never touched the tree (Done-when 4's `src`/`main`/`preload.js` check prints nothing).

## Summary

| | Verdict | One-line finding |
|---|---|---|
| **H1** — band is ~3 lines instead of 5 | **Partly confirmed** | The zone height is always 5 × 24 px = 120 px, because the outer view's line-height is `normal` and the code falls back to 24. It ignores text size: the band covers 4.4 body lines at 100% and 3.6 at 120%, never 5. |
| **H2** — Focus band not tied to the cursor | **Confirmed** | The Focus band sits at a fixed 15%–34% of the view, and the cursor word was outside it in every Focus measurement (above the band at section start, at 222–256 px against a 94–214 px band after the arrival scroll). |
| **H3** — two clocks in Flow | **Confirmed in effect, partly in cause** | Over 3 minutes of play, the underlined word was outside the band in 106–136 of 177 one-second samples (60–77%) in all four sessions, including `612d03f5`. Out-of-band runs grow over the session (up to 89 s at the end). The pacer's own line index is not exposed, so the drift between the two clocks is inferred from that pattern, not read directly. |
| **H4** — observer loop floods `error.log` | **Refuted as stated; root cause found** | None of the five (now seven) app observers loops: their writes are no-op equalities in 96–99% of calls. The flood is a **leaked foliate-js `View` ResizeObserver** that keeps watching a dead 0×0 section body after a mode switch, because our teardown detaches the book frame before `view.close()` runs. Disconnecting that one observer mid-loop stopped the errors (60/s → 0/s). |

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
| S6 | production, instrumented | Page → Flow, 20 s | — | empty | route control |
| S7, S8 | production, instrumented | Page → Focus 10 s → Flow 20 s | — | empty | route, live-observer census |
| S13 | production, instrumented | Page → Focus → Flow, then disconnect observers one at a time | — | empty | H4 causal test |

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
| S1 production, base | 177 | **136 (77%)** | 5 | 187 → 818 | out 15 (above) · in 19 · out 27 · then 1–6 s alternations |
| S2 dev, base | 177 | **134 (76%)** | 4 | 187 → 807 | out 16 (above) · in 18 · out 24 · … · **out 89 (above)** |
| S3 dev, `612d03f5` | 177 | **106 (60%)** | 14 | 187 → 820 | out 6 · in 15 · **out 59 (below)** · … |
| S4 dev, base (instr.) | 178 | **133 (75%)** | 5 | 187 → 779 | out 15 (above) · in 19 · out 28 · … · **out 89 (below)** |

Reading:
- The underline starts above the band. The play cursor begins on a heading at the section top while the band is at 15%.
- The underline is held for 15–19 s.
- It then leaves the band in runs that lengthen through the session, either above or below. That fits the specification's two-clock reading: the word timer paints the underline (`flow/ModeRuntime.ts`), while the line pacer scrolls its own line under the band and adds 150 ms per line. It does not fit a fixed offset.
- The pacer's line index is not exposed outside `FlowScrollEngine`, so the index-against-index comparison the specification asked for was not taken.

**Verdict: confirmed in effect** (60–77% of play time out of band, on both bases). **The cause is partly confirmed:** a drift between two clocks, inferred from the growing run lengths, not read from the pacer.

## H4 — the `error.log` flood

**Counts, 5-minute sessions, same actions:**

| Session | `ResizeObserver` lines | Per minute | When |
|---|---|---|---|
| S1 production, base | **14,428** | **2,886** | one sustained burst at 60/s from entering Flow (01:11:24) to session end (01:15:29), through play and pause |
| S2 dev, base | 451 | 90 | 446 in an 8 s burst on entering Flow; 5 on entering Focus |
| S3 dev, `612d03f5` | 499 | 100 | 495 in an 8 s burst on entering **Focus**; 4 on entering Flow |
| S4 dev, base (instr.) | 750 | 150 | 748 in a 13 s burst on entering Flow |
| E production, base (by hand) | 4,103 | — | exploratory; same message |

Every line is `Unhandled: ResizeObserver loop completed with undelivered notifications. at …:0`, logged through the window `error` handler (`App.tsx:130-137` → `preload.js:124` → `main/ipc/misc.js:343`). The flood **predates the Narrate removal**: `612d03f5` floods at the same dev rate.

**What the flood is not.** In S4 (dev) and S7 (production), the app's observers fired only on real resizes:
- **In dev:** 85 callbacks in 53 distinct seconds, at most 3 a second, on the Flow view's 1002↔994 px scrollbar width.
- **In production:** 6 callbacks in the whole 20 s of Flow, while the page logged 1,181 errors.

Their writes are almost all equal-value:
- `max-block-size`: changed on 3 of 92 writes;
- `--flow-zone-*`: changed on 4 of 147 writes;
- frame-by-frame geometry of the Flow view, foliate-view and renderer: **0 changes in 181–1,201 frames**.

So the specification's "five observers rewriting attributes with no equality check" is not the loop.

**What the flood is.**
- **Route:** going straight from Page to Flow (S6) gave 1 error in 20 s. Going Page → Focus → Flow (S7) gave 1,181. The loop follows the view that was just left.
- **Census in Flow (S8):** besides the live Flow set, foliate observers from earlier views are still observing:
  - two `Paginator` observers (`paginator.js:422`) on disconnected 0×0 `div`s;
  - three `View` observers (`paginator.js:201`) on 0×0 `body` elements of dead section frames.
- **Causal test (S13, production, in the loop at 60.2 errors/s):** each observer was disconnected in turn, with the rate measured for 3 s after each step:
  1. leaked `Paginator`, detached div → 60.0/s
  2. leaked `View`, no target → 60.3/s
  3. leaked `View`, 0×0 body → 60.3/s
  4. leaked `Paginator`, detached div → 60.0/s
  5. **leaked `View`, 0×0 body → 0.0/s**
  6. the live observers after it (Flow ×2, Paginator, View) → 0.0/s

  Disconnecting the single leaked `View` observer from the Focus-era frame stopped the flood. Disconnecting the leaked `Paginator` observers did not (S9 also: 59.9 → 59.9/s).

**Root cause.**
- **Where the observer comes from:** foliate-js 1.0.1's `View` creates `#observer = new ResizeObserver(() => this.expand())` (`paginator.js:201`). On each section load it calls `observe(doc.body)` (`:265`).
- **Why it is never removed:** `View.destroy()` unobserves only `if (this.document)` (`:410-411`). Our mode views clear the host first (`foliateHostRef.current.innerHTML = ""`) and defer `view.close()` by one frame (`focus/FoliateView.tsx:1086-1096`, the S1 G6 change; Flow and Page are the same). When `close()` → `renderer.destroy()` → `View.destroy()` runs, the frame is detached, `this.document` is null, and the body stays observed.
- **Why it loops:** its callback, `expand()` (`:354`), keeps resizing the dead view's frame and element against a 0×0 body. Chromium reports "undelivered notifications" every frame.
- **A second, harmless leak:** `Paginator.destroy()` calls `unobserve(this)` (`:1158`), but the observer watches `#container` (`:550`).
- **Why dev and production differ:** in dev the loop stops after 8–13 s, in production it runs on. The leak is the same in both. The difference is not needed for the fix and is recorded, not explained.

**Verdict: H4 refuted as stated** (it is not the app's observers rewriting attributes). **Root cause found:** a leaked foliate-js `View` observer, left behind by teardown order.

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

- **What:** The reading band in Focus and Flow is sized from the book's real line height and placed on the cursor word's line.
  - In Focus, the band's top follows the cursor's line on arrival and on every highlight move.
  - In Flow, the pacer scrolls the **underlined word's** line under the band, with the word timer as the only clock, instead of keeping its own line index.
- **Why:** BUG-188, measured here. The band is 120 px whatever the text size (24 px fallback), so it covers 4.4 or 3.6 lines, never 5. The Focus cursor is outside the band in every measurement. In Flow the underline is outside the band 60–77% of the time, in runs that grow over a session.
- **Rule 11:** hybrid, because it changes what the reader sees. The intended behaviour (the band contains the cursor) is the owner's stated expectation (S2), so this item implements it rather than redesigning it. Any change to band height or lines is the owner's call: default 5 lines, unchanged.
- **Done when:**
  1. **Positive control:** new tests in `tests/readerModes/` fail on the base:
     - (b1) with a fake section frame whose body line height is 27 px and the outer view's `line-height: normal`, the zone height is `5 × 27` px, not 120;
     - (b2) in Focus, after the highlight moves to a word, the band's top is within one line of that word's line top;
     - (b3) in Flow, after N word-timer ticks, the line under the band is the underlined word's line, with no separate pacer index.
  2. Those tests pass. `tests/readerModes/` and `tests/flowScroll*` pass.
  3. **Live, packaged build:** this report's H1–H3 probes give:
     - zone height ≥ 4.5 × the body line step at 100% and 120%;
     - Focus cursor in band in 3 of 3 checks;
     - Flow underline outside the band in ≤ 5% of 180 one-second samples, on the scripted route.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0.
  5. **Owner (next smoke):** the confirmation row above passes.
- **Edit sites:**
  - The zone line height comes from the loaded section's body line step: a helper in each mode's `helpers/` (no shared module, per the mode-isolation rules), replacing `parseFloat(getComputedStyle(container).lineHeight) || 24` at:
    - `focus/FoliateView.tsx:469` and `:1171`;
    - `flow/FoliateView.tsx:499` and `:1247`;
    - `flow/useModeBindings.ts:39`;
    - `narrate/FoliateView.tsx:530` and `:1300`.
  - Focus places the zone at the cursor's line, at `applyZoneProperties` and in the highlight path (`:580` area).
  - Flow keeps one clock in `flow/helpers/FlowScrollEngine.ts` (`stableWindowScroll` branch) and `flow/FoliateView.tsx`'s chunk follow (`:495-505`, `:642-672` areas). This edits `src/utils/FlowScrollEngine.ts` only if that legacy copy is still imported (re-grep; it is in the shared-core set).
  - `FLOW_ZONE_LINES_DEFAULT` is unchanged.
- **Tests:** b1–b3 as above, plus the existing Flow and Focus suites.
- **Merge order:** after the Stage 8 freeze lifts. Independent of FOLIATE-OBSERVER-LEAK-1.

## Fix specification — FOLIATE-OBSERVER-LEAK-1 (BUG-187)

- **What:**
  - foliate-js's `View.destroy()` disconnects its ResizeObserver unconditionally, instead of `if (this.document) unobserve(this.document.body)`.
  - `Paginator.destroy()` disconnects its own observer, instead of `unobserve(this)` on an element it never observed.
  - Both are applied with a `patch-package` patch, `patches/foliate-js+1.0.1.patch`, which the existing `postinstall` (`patch-package && …`) already runs.
  - Our teardown order (host cleared, `close()` one frame later; the S1 G6 change) is kept as it is.
- **Why:** BUG-187, measured here. A leaked `View` observer watches a dead 0×0 section body after each mode switch. Its `expand()` callback drives Chromium's "ResizeObserver loop completed with undelivered notifications" every frame. That is 2,886 lines a minute in production, through every minute of Flow after leaving Focus. Disconnecting that observer mid-loop stopped it (60 → 0 errors a second). The flood predates the Narrate removal (`612d03f5`).
- **Done when:**
  1. **Positive control:** a test that mounts a foliate `View` (jsdom or the existing harness), loads a section, detaches its frame, calls `destroy()`, and asserts the observer was disconnected (a spied `ResizeObserver.prototype.disconnect`). It fails on the base.
  2. With the patch, that test passes. `npx patch-package --check` (or a reinstall) applies the patch cleanly.
  3. **Live, packaged build, the scripted 5-minute route** (Page → Focus 60 s → Flow 180 s → pause 60 s): `error.log` gains **0** `ResizeObserver loop` lines. The base gives 14,428.
  4. **Live census:** after Page → Focus → Flow, no ResizeObserver remains on a detached target or a 0×0 body (this report's `ro-wrap.js` census).
  5. `npm test`, `npm run typecheck` and `npm run build` exit 0. The packaged app opens a book in all four modes.
- **Edit sites:**
  - `patches/foliate-js+1.0.1.patch` (new): `node_modules/foliate-js/paginator.js` `View.destroy` (`:410-411`) and `Paginator.destroy` (`:1157-1158`).
  - `package.json` is unchanged, because `postinstall` already runs `patch-package` and `patch-package` is already a dev dependency.
  - **Optional and out of scope unless ruled in:** rate-limiting identical `logError` lines in `App.tsx:130-137`, so a future loop cannot flood the log. This is a separate defence, not the fix.
- **Tests:** Done-when 1; the reader-mode suites.
- **Merge order:** after the Stage 8 freeze lifts (it changes installed code). Independent of BAND-ALIGN-1.
