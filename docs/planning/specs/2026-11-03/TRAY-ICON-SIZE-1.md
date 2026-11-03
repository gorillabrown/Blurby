#### TRAY-ICON-SIZE-1 — The Windows tray icon fills its slot instead of rendering as a dot *(Seq 137; Full Spec, 2026-11-03, cited against RC tip `70d64237`; Platform & Maintenance; proposed P3)*

- **What:** `createTray` stops handing Electron the raw 1024×1024 PNG path. It builds the tray image from a tight square crop of the same artwork, with one representation per display scale (16 DIP at 1×, 1.25×, 1.5× and 2×), and passes that image to `new Tray(...)`. Menu, tooltip and click behaviour are unchanged.
- **Out of scope:**
  - New artwork, a monochrome or template glyph, or removing the soft glow. That would be a design change, and the item stays on the owner's existing character.
  - The app/installer icons (`assets/icon.ico`, `icon.png`).
  - macOS/Linux-specific tray work, though the same code path serves them.
- **Why (investigation, 2026-11-03):**
  - `main/window-manager.js:157` passes `assets/tray-icon.png` straight to `Tray`.
  - That file is 1024×1024 ARGB, 1,381,060 bytes, sha256 `13d2f245a68a095c0d79ad3f3ccbe37bce8b8ffbe1c8311088596febd2dc9f19`, unchanged since `3e59bdee`.
  - Its visible character occupies only x 330–716, y 346–654 (alpha > 64). That is about 38% of the canvas width; the rest is transparent and faint glow. Measured with System.Drawing, threshold sweep 16/64/128/200/240.
  - Windows draws the tray at 16 px at 100% scaling, so the character comes out about 6×5 px: the "tiny dot" of BUG-203 / SMOKE-F1.
  - PACKAGING-FIX-1 shipped the file but did not change its framing.
- **Design (engineering; no owner choice open):**
  - Crop the square `{x: 323, y: 300, width: 400, height: 400}`, centred on the character's alpha > 64 box, so the character fills about 96% of the slot.
  - Resize with `quality: "best"` to `round(16 × s)` px for s ∈ {1, 1.25, 1.5, 2} and add each image as a representation of one `nativeImage`. Windows then takes a raster near its DPI size instead of downscaling 1024 → 16.
  - Electron's own `nativeImage` API is used. It adds no dependency and no new binary asset, and it keeps the owner's artwork.
  - `createFromPath` decodes the same file `Tray(path)` already decoded synchronously at the same point, so this adds no file I/O of our own (the async-I/O rule concerns `fs`).
- **Prerequisites:** RC integration window merged to `main` (cut from that merge). PACKAGING-FIX-1 is merged (it shipped `assets/tray-icon.png` in `build.files`, `package.json` lines 43–44 at `70d64237`).
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/trayIcon.test.js` alone. On the base, `npx vitest run tests/trayIcon.test.js` exits 1: (ti1) and (ti2) fail and (ti3)–(ti4) pass. Record the output.
  2. `npx vitest run tests/trayIcon.test.js` exits 0 after the change.
  3. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  4. Rule 53 package check passes. In the packaged x64 exe on a scratch profile, the main-process log contains the single line `[window-manager] tray image: 4 representations` (added by this item) and no `Tray creation failed`.
  5. **Owner-visible check, batched to gate (2)** (memory: owner smoke batched at end). On the arm64 package at merge, the tray icon is the blob character filling its slot at 100% and at 150% display scaling, not a dot. Right-click → "Open Blurby" and "Quit" work, and left-click shows the window. The package verifier captures a zoomed screenshot of the tray at each scaling (`Snipping`/CDP-free OS screenshot) into the close-out. This row is evidence for the owner, not a mechanical gate.
- **Effort:** XS.
- **Owners:** planner; implementation agent (bounded, electron-scope); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr; owner at gate (2) for row 5.
- **Source:** BUG-203 (`docs/governance/BUG_REPORT.md:278-279`); SMOKE-F1 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:31`, `:264-271`); measurements above; code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (re-grep at the cut):**
  - `main/constants.js`. After the Window Dimensions block (`:186-195`), add a "Tray icon" block:
    - `TRAY_ICON_CROP = { x: 323, y: 300, width: 400, height: 400 }`, with the comment "square around tray-icon.png's character, alpha > 64 box x 330–716, y 346–654; re-measure if the asset changes"
    - `TRAY_ICON_DIP = 16`
    - `TRAY_ICON_SCALE_FACTORS = [1, 1.25, 1.5, 2]`

    Export all three in the `module.exports` object.
  - `main/window-manager.js`:
    - `:4`: add `nativeImage` to the `require("electron")` destructure.
    - `:7`: import the three constants.
    - Add `function buildTrayImage(iconPath)` above `createTray`. It runs `const src = nativeImage.createFromPath(iconPath)`. If `src.isEmpty()`, it returns `iconPath` (the old behaviour, so a bad decode never loses the tray). Otherwise it crops with `src.crop(TRAY_ICON_CROP)` and creates `const img = nativeImage.createEmpty()`. For each `s` of `TRAY_ICON_SCALE_FACTORS`, with `px = Math.round(TRAY_ICON_DIP * s)`, it calls `img.addRepresentation({ scaleFactor: s, width: px, height: px, buffer: cropped.resize({ width: px, height: px, quality: "best" }).toPNG() })`. It logs `[window-manager] tray image: ${TRAY_ICON_SCALE_FACTORS.length} representations` and returns `img`.
    - `:157`: `new Tray(buildTrayImage(path.join(__dirname, "..", "assets", "tray-icon.png")))`, inside the existing `try`.
    - Export `buildTrayImage` beside `createTray` (`:233`) for the test.
  - No change to `assets/`, `package.json` `build.files`, `main.js:523` or the context menu (`window-manager.js:158-165`).
- **Tests:** new `tests/trayIcon.test.js`, using the `Module._load` electron-mock pattern of `tests/einkTitleBarRefresh.test.js:8-31`.
  - The mock provides:
    - `nativeImage.createFromPath`, which returns `{ isEmpty: () => false, crop: vi.fn(() => cropped) }`.
    - `cropped.resize`, a `vi.fn(({width}) => ({ toPNG: () => Buffer.from(String(width)) }))`.
    - `nativeImage.createEmpty`, which returns `{ addRepresentation: vi.fn() }`.
    - A `Tray` class recording its constructor argument and stubbing `setToolTip`/`setContextMenu`/`on`.
    - `Menu.buildFromTemplate`, which returns its template.
    - Stubs for `BrowserWindow`, `nativeTheme` and `session`.
  - Cases:
    - **(ti1)** `createTray(null, vi.fn())` constructs `Tray` with the object from `createEmpty()`, not a string. *Fails on the base: it gets the path string.*
    - **(ti2)** `crop` is called once with `{x:323,y:300,width:400,height:400}`. `addRepresentation` is called 4 times with `(scaleFactor,width)` = (1,16), (1.25,20), (1.5,24), (2,32), each with `height === width`. *Fails on the base.*
    - **(ti3) control:** the context menu template labels are `["Open Blurby", undefined (separator), "Quit"]` and `setToolTip("Blurby")` is called. Passes on both.
    - **(ti4) asset guard:** `crypto.createHash("sha256")` of `assets/tray-icon.png` (read with `fs.promises.readFile`) equals `13d2f245…dc9f19`. Passes on both; if the artwork is ever replaced, this fails and the crop must be re-measured.
    - **(ti5)** With `createFromPath` returning `isEmpty: () => true`, `Tray` receives the path string (fallback).
- **Constants:** the three above, in `main/constants.js`.
- **Branch:** `eb/tray-icon-size-1` from `main` after the RC merge; push `HEAD:refs/heads/eb/tray-icon-size-1`.
- **Staging plan (explicit paths):** `main/window-manager.js`, `main/constants.js`, `tests/trayIcon.test.js`; at close-out `docs/governance/BUG_REPORT.md` (BUG-203 → `RESOLVED in source (TRAY-ICON-SIZE-1)`, standing rule 49) and `docs/governance/close-outs/CloseOut.TRAY-ICON-SIZE-1.<date>.md`.
- **Failure handling:**
  - **Icon still small or blurry at 150% (row 5).** This means Windows took the 1× raster and scaled it. Change the representation set to `[2]` only (a single 32 px raster that Windows downsamples) and repeat row 5 once. If it is still wrong, STOP and return to Brain1 with both screenshots.
  - **`Tray creation failed` in the package log.** STOP; the fallback in `buildTrayImage` must keep the old path behaviour, so a failure here is a code defect, not an asset one.
  - At most two repair passes.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\tray-icon-size-1`.
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged.
  - Run the 25 s x64 scratch launch with LL-165 profile proof and the live-profile hash check.
  - `npx asar list` must show `main/window-manager.js` and `main/constants.js` changed.
  - Re-run Done-when 4 on the package. Row 5's arm64 visual check is at merge on Rodney.
  - Brain1 confirms before the merge go.
- **Lane ownership:** Platform & Maintenance; execution surface D (main process).
- **Forbidden during parallel run:** `main.js`, `preload.js`, `src/`, `assets/`, `package.json`.
- **Shared-core touches:** none.
- **Merge order:** independent of every item in this batch. If another item edits `main/constants.js` at the same time, the second rebases (append-only block, no expected conflict).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests show the tray receiving the raw path with no crop or representations, controls green | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | Tray built from a cropped multi-resolution image with the old path as fallback | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, both reviews, rule 53 package evidence and tray screenshots at 100% and 150% | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **Standing rule 36:** the measured crop is tied to the asset's sha256 by (ti4), so a changed asset cannot silently invalidate it.
- **Standing rule 43 (LL-138):** (ti1)–(ti2) are red first; (ti3) and (ti4) are controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 49 (LL-148):** BUG-203's line names the item, not the merge sha.
- **Standing rule 53 (LL-167) and LL-165:** package check on a proven scratch profile; the arm64 launch at merge.
- **Standing rule 55 (LL-151/LL-166):** the visual row needs a screenshot at each scale showing the icon, compared against the base's dot. A "looks fine" without the before image does not count.
- **LL-181:** worktree placement and the push refspec.
- **Not applicable:** the remaining live lessons (Narrate/word-index LL-142, 160–162, 170, 173; registry/Notion LL-154, 155, 163, 171, 172; quit/flush LL-157, 159; evidence encoding LL-175–180) were read and do not apply.
