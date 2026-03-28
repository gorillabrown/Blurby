# HOTFIX-2: Core Feature Stabilization

**Date:** 2026-03-27
**Priority:** CRITICAL — Highest priority is stabilizing the app's core features
**Target:** v2.1.5

---

## Problem Statement

Two critical issues in the packaged exe (v2.1.4):

1. **Reading modes not working** — None of the 4 reading modes (Page, Focus, Flow, Narrate) function correctly in the released exe
2. **Kokoro TTS unavailable** — The Kokoro AI voice engine cannot be selected or used in the packaged app

These are the app's two core features. Without working reading modes and TTS, the app is non-functional.

---

## Bug 1: Reading Modes Broken

### Root Cause Analysis

Investigation found the code wiring is structurally sound — mode classes, hooks, imports, and rendering all check out. 618 tests pass. This means the bug is likely a **runtime issue** specific to the packaged exe, not a code logic bug.

**Most likely causes (in priority order):**

1. **Empty words array on EPUB load** — When the mode system receives an empty words array (e.g., EPUB cover page, slow section load, or extraction failure in packaged mode), FocusMode and FlowMode silently complete immediately via their `scheduleNext()` boundary check: `if (currentWord >= words.length - 1)` evaluates true when length is 0 (0 >= -1). The mode starts and instantly ends with no visible output.

2. **FoliatePageView file loading failure** — `FoliatePageView.tsx:313` calls `api.readFileBuffer(activeDoc.filepath!)`. If `filepath` is undefined or the file path differs between dev and packaged (e.g., ASAR path issues), the EPUB never loads, so no words are extracted, and all modes fail.

3. **foliate-js bundle not included in packaged app** — foliate-js loads from local files. If the dist build doesn't include the foliate assets, the EPUB renderer shows nothing.

4. **Stale closure / timing issue** — The `readingModeRef` pattern (ref shadows state) could cause stale mode detection in effects that run after React re-renders.

### Fix Plan

#### Fix 1A: Guard against empty words in mode classes
**Files:** `src/modes/FocusMode.ts`, `src/modes/FlowMode.ts`, `src/modes/NarrateMode.ts`

In each mode's `start()` method, add an early guard:
```typescript
start(fromWord: number): void {
  if (this.config.words.length === 0) {
    // No words to process — don't silently complete
    console.warn(`[${this.constructor.name}] Cannot start: empty words array`);
    return; // Stay in current state, don't call onComplete
  }
  // ... existing logic
}
```

#### Fix 1B: Guard against empty words in useReadingModeInstance
**File:** `src/hooks/useReadingModeInstance.ts`

In `startMode()`, reject empty words before delegating to mode class:
```typescript
if (words.length === 0) {
  console.warn("[useReadingModeInstance] Cannot start mode: no words extracted");
  return;
}
```

#### Fix 1C: Add non-EPUB empty words retry (parity with EPUB path)
**File:** `src/hooks/useReaderMode.ts`

The EPUB path has retry logic when words are empty (lines 197-204). The non-EPUB path has no such guard. Add one:
```typescript
// Non-EPUB: if words are empty, the document may not have content
if (!useFoliate && effectiveWords.length === 0) {
  console.warn("[startFocus] No words available for non-EPUB document");
  return;
}
```

#### Fix 1D: Verify FoliatePageView EPUB loading in packaged app
**File:** `src/components/FoliatePageView.tsx`

Add error handling around the file buffer load:
```typescript
try {
  const buffer = await api.readFileBuffer(activeDoc.filepath!);
  // ... load EPUB
} catch (err) {
  console.error("[FoliatePageView] Failed to load EPUB:", err);
  // Show user-facing error instead of blank screen
}
```

#### Fix 1E: Runtime diagnostics
Add a one-time diagnostic log on reader open that prints:
- `readingMode` state
- `words.length` / `foliateWords.length`
- `useFoliate` flag
- `activeDoc.filepath` and whether file exists

This helps debug any remaining issues in the packaged app.

---

## Bug 2: Kokoro TTS Unavailable in Packaged Exe

### Root Cause

**Confirmed:** The Worker thread cannot resolve `kokoro-js` and `@huggingface/transformers` modules in the packaged app.

The `asarUnpack` config correctly unpacks native binaries outside the ASAR:
```json
"asarUnpack": [
  "node_modules/onnxruntime-node/**",
  "node_modules/kokoro-js/**",
  "node_modules/@huggingface/transformers/**"
]
```

But the Worker thread (`tts-worker.js`) uses ESM dynamic imports:
```javascript
const kokoro = await import("kokoro-js");
const { env } = await import("@huggingface/transformers");
```

In the packaged app:
- Main process `require()` resolves modules inside `app.asar` or `app.asar.unpacked`
- Worker threads have their own module resolution context
- ESM `import()` in a Worker doesn't automatically resolve `app.asar.unpacked/node_modules/`
- Result: `import("kokoro-js")` fails silently, `load-error` message fires, model never loads

### Fix Plan

#### Fix 2A: Set NODE_PATH for Worker thread
**File:** `main/tts-engine.js`

Pass the correct module resolution path when creating the Worker:
```javascript
function getWorker(cacheDir) {
  if (worker) return worker;

  const { app } = require("electron");
  let workerEnv = { ...process.env };

  if (app.isPackaged) {
    // In packaged app, unpacked modules are in app.asar.unpacked/node_modules/
    const unpackedModules = path.join(process.resourcesPath, "app.asar.unpacked", "node_modules");
    workerEnv.NODE_PATH = unpackedModules;
  }

  worker = new Worker(path.join(__dirname, "tts-worker.js"), {
    env: workerEnv,
  });
  // ... rest unchanged
}
```

#### Fix 2B: Convert Worker imports to require with resolved paths (fallback)
**File:** `main/tts-worker.js`

If NODE_PATH doesn't work for ESM imports in Workers, convert to CommonJS require with explicit path resolution:
```javascript
const { workerData } = require("worker_threads");

async function loadModel(cacheDir) {
  let kokoro, transformersEnv;

  if (workerData?.modulePath) {
    // Packaged app: resolve from unpacked directory
    kokoro = require(path.join(workerData.modulePath, "kokoro-js"));
    const transformers = require(path.join(workerData.modulePath, "@huggingface", "transformers"));
    transformersEnv = transformers.env;
  } else {
    // Dev mode: normal resolution
    kokoro = await import("kokoro-js");
    const { env } = await import("@huggingface/transformers");
    transformersEnv = env;
  }
  // ... rest unchanged
}
```

And pass `workerData` from `tts-engine.js`:
```javascript
worker = new Worker(path.join(__dirname, "tts-worker.js"), {
  env: workerEnv,
  workerData: app.isPackaged ? {
    modulePath: path.join(process.resourcesPath, "app.asar.unpacked", "node_modules")
  } : undefined,
});
```

#### Fix 2C: Auto-download on app startup (not just Settings page)
**File:** `main.js`

Ensure Kokoro model auto-downloads on first launch in background:
```javascript
// After mainWindow is created and shown:
if (app.isPackaged || process.env.KOKORO_DEV === "1") {
  const ttsEngine = require("./main/tts-engine");
  const modelsDir = path.join(app.getPath("userData"), "models");
  ttsEngine.ensureModel(modelsDir).catch(err => {
    console.error("[startup] Kokoro model preload failed:", err);
  });
}
```

This fires silently — no UI, no blocking. By the time the user navigates to a book and hits Narrate, the model is ready.

#### Fix 2D: Surface Kokoro load errors to the user
**File:** `src/components/settings/SpeedReadingSettings.tsx`

When user clicks "Kokoro AI" and it fails, show a toast explaining what went wrong instead of silently falling back to nothing.

---

## Testing Requirements

### Tier: Full (new features + architecture-affecting changes)
- `npm test` — all 618+ tests pass
- `npm run build` — clean build
- **Manual smoke test in packaged exe:**
  1. Install fresh from exe
  2. Open an EPUB → verify Page mode renders
  3. Click Focus → verify RSVP display works
  4. Click Flow → verify scroll mode works
  5. Click Narrate → verify TTS starts (Kokoro or System fallback)
  6. Open a PDF → repeat mode tests
  7. Open a TXT → repeat mode tests
  8. Check Settings > Speed Reading → Kokoro AI button selectable
  9. Verify model download starts on first launch (check logs)

### New tests to add:
- Mode class `start()` with empty words array — should not call `onComplete`
- Mode class `start()` with single-word array — should work correctly
- `useReadingModeInstance.startMode()` with empty words — should no-op

---

## Acceptance Criteria

1. All 4 reading modes work in the packaged exe for EPUBs, PDFs, and TXT files
2. Kokoro AI is selectable and functional in the packaged exe
3. Kokoro model auto-downloads silently on first launch
4. Empty words arrays don't cause silent mode completion
5. Load errors surface as user-visible feedback (toasts), not silent failures
6. All existing tests pass, new guard tests added
7. v2.1.5 released and verified on installed exe

---

## Files Changed

| File | Change |
|------|--------|
| `src/modes/FocusMode.ts` | Empty words guard in `start()` |
| `src/modes/FlowMode.ts` | Empty words guard in `start()` |
| `src/modes/NarrateMode.ts` | Empty words guard in `start()` |
| `src/hooks/useReadingModeInstance.ts` | Empty words guard in `startMode()` |
| `src/hooks/useReaderMode.ts` | Non-EPUB empty words guard |
| `src/components/FoliatePageView.tsx` | Error handling on EPUB load |
| `main/tts-engine.js` | NODE_PATH + workerData for packaged app |
| `main/tts-worker.js` | Resolved path imports for packaged app |
| `main.js` | Auto-download Kokoro on startup |
| `src/components/settings/SpeedReadingSettings.tsx` | Kokoro error toast |
| `tests/modes.test.js` | Empty words array tests |
| `package.json` | Version bump to 2.1.5 |
