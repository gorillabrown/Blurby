# Blurby — Manual Performance Procedures

This document covers Electron-specific performance metrics that cannot be
automated in a Node.js script. Run these procedures after any release candidate
build and record the results alongside the automated baseline output in
`tests/perf-baseline-results.json`.

---

## Startup Time

**Target:** cold start < 3 s, warm start < 1.5 s

### What to measure

| Stage | Definition |
|-------|------------|
| T0    | Process launch (first `npm start` or double-click installer) |
| T1    | `app.on('ready')` fires in main process |
| T2    | `BrowserWindow` `did-finish-load` event |
| T3    | Library grid is visible and interactive (user can click a document) |

### Procedure

1. **Cold start** — Ensure the app is fully closed (not in tray). Clear
   Electron's renderer cache if you want a true cold read:
   ```
   %APPDATA%\Blurby\Cache  (delete contents)
   ```
2. Open PowerShell and run:
   ```powershell
   Measure-Command { Start-Process ".\release\win-unpacked\Blurby.exe" }
   ```
   This gives process-launch to process-exit time, which is a rough proxy.
   For finer grain, use the instrumentation approach below.

3. **Instrumented timing** — Add temporary `console.time` calls in
   `main.js`:
   ```js
   // At top of file
   console.time('ready');
   console.time('window-loaded');

   app.on('ready', () => {
     console.timeEnd('ready');          // T0 → T1
     createWindow();
   });

   mainWindow.webContents.on('did-finish-load', () => {
     console.timeEnd('window-loaded'); // T0 → T2
   });
   ```
   Run via `npm start` and read the DevTools Console output.

4. **T3 (interactive)** — In the renderer, add to `App.tsx`:
   ```tsx
   useEffect(() => {
     if (docs.length > 0) console.timeEnd('library-interactive');
   }, [docs]);
   // At module top: console.time('library-interactive');
   ```

5. Record cold-start and warm-start (second launch without clearing cache)
   times. Expected targets: cold < 3 s, warm < 1.5 s.

---

## Memory Usage

**Target:** RSS at startup < 150 MB; after opening a 100K-word document < 300 MB

### Procedure — Task Manager (quick check)

1. Launch the app with `npm start`.
2. Open Task Manager > Details tab.
3. Find `Blurby.exe` (there will be multiple Electron processes; look for the
   one consuming the most memory — that is the renderer).
4. Record **Working Set (Memory)** at:
   - App idle (library view, no document open)
   - After opening a large EPUB or TXT file (100K+ words)
   - After closing the document and returning to library

### Procedure — Chrome DevTools Memory tab (detailed)

1. Launch with `npm start`.
2. In `main.js` (development only), add:
   ```js
   mainWindow.webContents.openDevTools();
   ```
3. In DevTools, go to **Memory** tab.
4. Take a **Heap snapshot** at:
   - App idle
   - Document open (Focus mode active, mid-document)
   - After navigating back to library (verify GC collects reader state)
5. Compare snapshot sizes. Retained heap for the reader should drop back
   toward baseline after closing a document.

### Procedure — `process.memoryUsage()` in main process

Add to `main.js` (temporarily):
```js
setInterval(() => {
  const m = process.memoryUsage();
  console.log('RSS:', (m.rss / 1024 / 1024).toFixed(1), 'MB  Heap:', (m.heapUsed / 1024 / 1024).toFixed(1), 'MB');
}, 5000);
```
Watch the output in the terminal while exercising the app.

---

## Scroll FPS (Flow Mode)

**Target:** sustained >= 55 FPS during active scrolling in Flow reading mode

### Procedure

1. Launch the app and open a large document (50K+ words recommended).
2. Enter **Flow mode** (the scroll reader).
3. Set WPM to 300 and begin reading (press Space to start).
4. Open DevTools (Ctrl+Shift+I or add `openDevTools()` temporarily).
5. Go to **Performance** tab.
6. Click **Record**, let the highlight cursor advance for 10–15 seconds,
   then click **Stop**.
7. In the flame chart, look at the **Frames** row at the top.
8. Hover over individual frames to see frame duration. A 55 FPS floor means
   frame duration should stay under ~18 ms.
9. Look for:
   - Long frames (> 33 ms = < 30 FPS) — indicates jank
   - Consistent `Recalculate Style` / `Layout` entries — indicates forced
     reflow (should be absent; the highlight uses `transform: translate3d()`)
   - `Composite Layers` should appear each frame (GPU path active)

### What to check if FPS is low

- Confirm `will-change: transform` is applied to the highlight cursor element.
- Check that `translate3d()` is used (not `top`/`left`).
- Verify `prefers-reduced-motion` is not suppressing the animation unexpectedly.
- Check for accidental synchronous DOM reads in the scroll loop
  (e.g., `getBoundingClientRect()` inside `requestAnimationFrame`).

---

## Sync Cycle Time

**Target:** full sync round-trip (upload + confirm) < 5 s on a typical broadband connection

### Automated proxy

The sync engine's pure functions (hash computation, diff generation, operation
log compaction) are exercised by `tests/sync-hardening.test.js` and
`tests/sync-queue.test.js`. Run `npm test` and check that those suites pass
within their time budgets.

### Manual procedure — Network tab

1. Configure cloud sync (OneDrive or Google Drive) in Settings > Cloud Sync.
2. Open DevTools > **Network** tab. Filter by `graph.microsoft.com` or
   `googleapis.com` depending on provider.
3. Make a small change (e.g., mark a document as favorite).
4. Trigger a sync (Settings > Cloud Sync > Sync Now, or wait for the
   background interval).
5. In the Network tab, note:
   - Time from first outbound request to final 200 response
   - Number of round-trips (should be 1–3 for a small delta sync)
   - Payload sizes (delta sync should upload only changed fields)

### Manual procedure — sync log timing

Add temporary instrumentation to `main/sync-engine.js`:
```js
const t0 = Date.now();
// ... sync logic ...
console.log(`Sync cycle completed in ${Date.now() - t0} ms`);
```
Trigger a sync and read the terminal output.

---

## Recording Results

After each manual session, append a row to the table below and commit
alongside any `tests/perf-baseline-results.json` update.

| Date | Build | Cold Start | Warm Start | Idle RSS | Doc RSS | Flow FPS | Sync ms | Notes |
|------|-------|-----------|-----------|---------|--------|---------|--------|-------|
| —    | —     | —         | —         | —       | —      | —       | —      | Baseline not yet measured |

---

## Thresholds Reference

| Metric | Target |
|--------|--------|
| Cold startup | < 3 s |
| Warm startup | < 1.5 s |
| Doc open (50K words) | < 500 ms |
| Word advance p99 | < 2 ms |
| Flow mode FPS | >= 55 FPS |
| Sync round-trip | < 5 s |
