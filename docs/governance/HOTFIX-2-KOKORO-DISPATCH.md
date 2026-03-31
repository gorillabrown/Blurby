# HOTFIX-2 [v1.0.6] — Packaging Fixes (Kokoro + CSP + Template + Canvas)

## KEY CONTEXT
v1.0.5 released. Four issues found that work in dev but fail in the packaged .exe:

1. **Kokoro TTS stalls at 0%** — CSP `connect-src 'self'` blocks fetch to huggingface.co
2. **No error UX on download failure** — worker `load-error` is logged but never forwarded to renderer
3. **Reading Log export crashes** — template file path resolves outside asar (not in `files` array)
4. **@napi-rs/canvas native binary** — not in `asarUnpack`, PDF thumbnail generation silently fails

## PROBLEM ANALYSIS

### Issue 1: CSP blocks Kokoro download (CRITICAL)
- **File:** `main/window-manager.js` lines 43-46
- **Root cause:** Production CSP sets `connect-src 'self'` which blocks all outbound fetch. Dev mode strips CSP entirely (lines 34-41). The `@huggingface/transformers` library calls `fetch()` to download model files from `https://huggingface.co/` and `https://cdn-lfs.huggingface.co/`.
- **Evidence:** Works in dev (no CSP), stalls at 0% in packaged (CSP active). No other code difference between dev and packaged would prevent the download.
- **Fix:** Add HuggingFace domains to `connect-src`:
  ```
  connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co
  ```

### Issue 2: Silent download failure (HIGH)
- **File:** `main/tts-engine.js` line 62-64
- **Root cause:** When worker sends `load-error`, it's logged to console but NOT forwarded to renderer via IPC. User sees "0%" forever with no indication of failure.
- **Fix:** Forward `load-error` to renderer as `tts-kokoro-download-error` event. Add 30s timeout UI in renderer.

### Issue 3: Reading Log template missing from build (MEDIUM)
- **File:** `main/ipc/stats.js` lines 121, 127
- **Root cause:** Template is at `docs/project/Reading_Log_Blurby_Template.xlsx`. The `files` array in package.json only includes `main.js`, `preload.js`, `main/**/*`, `dist/**/*`. The `docs/` folder is NOT in the build. Both path resolutions fail:
  - Line 121: `path.join(__dirname, "..", "..", "docs", ...)` → points outside asar
  - Line 127: `path.join(app.getAppPath(), "docs", ...)` → `docs/` not in asar
- **Fix:** Move template to `resources/` folder (already configured as `extraResources`). Update path in stats.js to use `process.resourcesPath`.

### Issue 4: @napi-rs/canvas native binary (LOW)
- **File:** `package.json` lines 41-45
- **Root cause:** `@napi-rs/canvas` has a native `skia.win32-x64-msvc.node` binary. Native `.node` files cannot load from inside asar — they must be unpacked. Currently only `onnxruntime-node`, `kokoro-js`, and `@huggingface/transformers` are in `asarUnpack`.
- **Fix:** Add `"node_modules/@napi-rs/**"` to `asarUnpack` array.

## WHAT (Tasks)

| # | Task | Agent | Model |
|---|------|-------|-------|
| 1 | Fix CSP: add HuggingFace domains to `connect-src` in `main/window-manager.js` | electron-fixer | sonnet |
| 2 | Fix error propagation: forward `load-error` from worker → renderer IPC in `main/tts-engine.js` | electron-fixer | sonnet |
| 3 | Add download error handling in `src/components/settings/SpeedReadingSettings.tsx`: listen for `tts-kokoro-download-error`, show toast, add retry | renderer-fixer | sonnet |
| 4 | Add 30s stall detection: if progress stays at 0% for 30s, show "Download may be blocked" with retry | renderer-fixer | sonnet |
| 5 | Move Reading Log template: copy `docs/project/Reading_Log_Blurby_Template.xlsx` to `resources/Reading_Log_Blurby_Template.xlsx` | electron-fixer | sonnet |
| 6 | Fix template path in `main/ipc/stats.js`: use `process.resourcesPath` for packaged, `__dirname` fallback for dev | electron-fixer | sonnet |
| 7 | Add `"node_modules/@napi-rs/**"` to `asarUnpack` in `package.json` | electron-fixer | sonnet |
| 8 | Add `tts-kokoro-download-error` to preload.js electronAPI if not already exposed | electron-fixer | sonnet |
| 9 | Run `npx tsc --noEmit` — 0 errors | test-runner | haiku |
| 10 | Run `npm test` — all tests pass, 0 failures | test-runner | haiku |
| 11 | Run `npm run build` — clean exit | test-runner | haiku |
| 12 | Bump `package.json` version to `1.0.6` | blurby-lead | opus |
| 13 | Git: commit on `hotfix/2-kokoro-download`, merge to main `--no-ff`, tag `v1.0.6`, push with tags | blurby-lead | opus |
| 14 | Print terminal summary | blurby-lead | opus |

## WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules, architecture
2. `docs/governance/HOTFIX-2-KOKORO-DISPATCH.md` — This dispatch
3. `main/window-manager.js` lines 28-54 — CSP policy (**ROOT CAUSE**)
4. `main/tts-engine.js` — Worker orchestration, error handling (needs error forwarding)
5. `main/tts-worker.js` — Worker thread (no changes needed, just understand the flow)
6. `main/ipc/tts.js` — IPC handlers, progress broadcast
7. `main/ipc/stats.js` lines 110-144 — Reading Log template path (broken)
8. `preload.js` — Check if download-error event needs adding to electronAPI
9. `src/components/settings/SpeedReadingSettings.tsx` — Download UI (needs error/timeout handling)
10. `package.json` — `asarUnpack` and `files` arrays

## HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read dispatch, orchestrate, git ops |
| electron-fixer | sonnet | CSP fix, error forwarding, template path, asarUnpack |
| renderer-fixer | sonnet | Download error UI, stall detection, retry |
| test-runner | haiku | tsc + npm test + npm run build |

## WHEN (Execution Order)

```
[1-2, 5-8] PARALLEL (all main process fixes):
    ├─ [1] CSP connect-src fix (electron-fixer)
    ├─ [2] Error forwarding: load-error → renderer IPC (electron-fixer)
    ├─ [5] Move Reading Log template to resources/ (electron-fixer)
    ├─ [6] Fix template path in stats.js (electron-fixer)
    ├─ [7] Add @napi-rs to asarUnpack (electron-fixer)
    └─ [8] Add download-error to preload.js (electron-fixer)
    ↓
[3-4] PARALLEL (renderer fixes, depend on IPC from step 2/8):
    ├─ [3] Download error toast + retry (renderer-fixer)
    └─ [4] 30s stall detection UI (renderer-fixer)
    ↓
[9-11] SEQUENTIAL (verification):
    [9] npx tsc --noEmit (test-runner)
    [10] npm test (test-runner)
    [11] npm run build (test-runner)
    ↓
[12] Bump version to 1.0.6 (blurby-lead)
    ↓
[13] Git: commit, merge, tag, push (blurby-lead)
    ↓
[14] Terminal summary (blurby-lead)
```

## CRITICAL GUIDANCE

- **NO DIAGNOSTIC PHASE.** Root cause is confirmed from code analysis. Go directly to fixes.
- **CSP is the Kokoro root cause.** `connect-src 'self'` blocks all outbound fetch in production. Dev strips CSP entirely. This is why Kokoro works in dev but not in .exe.
- **Minimum CSP change only.** Add ONLY these domains to `connect-src`: `https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co`. Do NOT weaken any other CSP directive.
- **Template goes in `resources/` not `files`.** The `extraResources` config already copies `resources/**` to `process.resourcesPath`. This is the correct pattern — don't add `docs/` to `files`.
- **Error UX is mandatory.** Even after fixing the download, add error forwarding and stall detection. Silent failures are unacceptable.
- **preload.js is the security boundary.** Any new IPC event must be exposed through `window.electronAPI` in preload.js.
- **Branch:** `hotfix/2-kokoro-download`. Merge to main with `--no-ff`. Delete branch after merge.

## SUCCESS CRITERIA

1. ✅ CSP `connect-src` includes HuggingFace domains (and only those additions)
2. ✅ Kokoro model download progresses past 0% in packaged .exe
3. ✅ After download completes, "Kokoro AI" produces audio via Test Voice
4. ✅ Auto-download on first launch triggers and completes
5. ✅ If download fails: user sees error toast with retry option
6. ✅ If download stalls >30s at 0%: user sees "Download may be blocked" message
7. ✅ Reading Log template resolves correctly in packaged .exe (via `process.resourcesPath`)
8. ✅ Reading Log template file exists in `resources/` folder
9. ✅ `@napi-rs/**` in `asarUnpack`
10. ✅ `npx tsc --noEmit` — 0 errors
11. ✅ `npm test` — all tests pass, 0 failures
12. ✅ `npm run build` — clean exit
13. ✅ Version bumped to `1.0.6`
14. ✅ Branch merged to main `--no-ff`, tag `v1.0.6` pushed
