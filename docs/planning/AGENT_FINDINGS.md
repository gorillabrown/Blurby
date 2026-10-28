# Sprint 24: External Audit — Consolidated Findings

**Date:** 2026-03-28
**Auditors:** 4 parallel agents (code-reviewer x2, code-explorer x2)
**Scope:** Full codebase, architecture, tests, documentation
**Branch:** `sprint/24-external-audit` (read-only)

---

## Summary

| Severity | 24A Code Quality | 24B Test Coverage | 24C Architecture | 24D Documentation | **Total** |
|----------|:---:|:---:|:---:|:---:|:---:|
| **CRITICAL** | 0 | 0 | 2 | 1 | **3** |
| **HIGH** | 5 | 5 | 3 | 11 | **24** |
| **MEDIUM** | 4 | 2 | 6 | 9 | **21** |
| **LOW** | 2 | 0 | 4 | 4 | **10** |
| **Total** | 11 | 7 | 15 | 25 | **58** |

---

## CRITICAL FINDINGS (3) — All Resolved/Dismissed (2026-03-29)

### CRIT-1: `read-file-buffer` IPC Has No Path Validation [24C]

**File:** `main/ipc/library.js:135-143`

The handler accepts an arbitrary `filePath` from the renderer and reads it with zero validation. A compromised renderer (or XSS) can read any file on the filesystem — `~/.ssh/id_rsa`, auth tokens, etc.

**Fix:** Add path validation — verify the path falls within the app data directory or source folder before reading.
**Resolution:** ✅ Fixed in Sprint 24R (v0.9.1). Path allowlist validation added.

```js
const allowedRoots = [ctx.getDataPath(), settings.sourceFolder].filter(Boolean);
const resolved = path.resolve(filePath);
const allowed = allowedRoots.some(r => resolved.startsWith(path.resolve(r)));
if (!allowed) return null;
```

### CRIT-2: Placeholder OAuth Credentials in Shipped Code [24C]

**File:** `main/auth.js:13,18-19`

OAuth client IDs are literal `"YOUR_AZURE_CLIENT_ID"` / `"YOUR_GOOGLE_CLIENT_ID"` / `"YOUR_GOOGLE_CLIENT_SECRET"` placeholder strings. Cloud sync is completely non-functional. If real credentials are substituted before shipping, they'd be hardcoded in the binary.

**Fix:** Inject credentials at build time via environment variables with a CI check that fails if unset. Remove `GOOGLE_CLIENT_SECRET` — Google's PKCE flow for installed apps doesn't require it.
**Resolution:** ⏸️ Deferred — app ships local-only. OAuth placeholders are by design until cloud sync goes live (v1.1.0+).

### CRIT-3: `.workflow/` Directory Referenced Everywhere But Doesn't Exist [24D]

**Document:** CLAUDE.md (multiple sections)

CLAUDE.md references `.workflow/WORKFLOW_ORIENTATION.md`, `.workflow/session-bootstrap.md`, `.workflow/skills/`, `.workflow/docs/sprint-dispatch-template.md` — none exist. Agents directed to read these for session bootstrap and skill gate rules hit dead links.

**Fix:** Either create the `.workflow/` directory structure or strip all references from CLAUDE.md.
**Resolution:** ❌ Dismissed — `.workflow/` exists on Windows host (`C:\Users\estra\OneDrive\Projects\Blurby\.workflow`). Linux VM audit agent couldn't see it due to FUSE mount limitations.

---

## HIGH FINDINGS (24) — Fix Before v1.0.0

### Security (24C)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| H-SEC-1 | `save-library` accepts arbitrary renderer data with zero schema validation | `main/ipc/library.js:22` | Validate array shape and field types at IPC boundary |
| H-SEC-2 | `unsafe-inline` in production CSP `script-src` | `main/window-manager.js:43-46` | Remove `unsafe-inline` from `script-src`; keep in `style-src` |
| H-SEC-3 | WS pairing token leaked via `getStatus()` response | `main/ws-server.js:377-384` | Remove `token` from `getStatus()`; use `getWsPairingToken()` only |

### Code Quality (24A)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| H-CQ-1 | 4 dead imports in ReaderContainer (countWords, getStartWordIndex, resolveFoliateStartWord, BlurbySettings, ScrollReaderView) | `ReaderContainer.tsx:2,8,10,15` | Remove unused imports |
| H-CQ-2 | Constants separation violations: duplicate WORDS_PER_PAGE, hardcoded WPM 300 | `bookData.ts:3-4`, `LibraryContainer.tsx:40` | Import from constants.ts |
| H-CQ-3 | Kokoro preload uses stale initial settings (empty deps array, settings not yet loaded) | `LibraryContainer.tsx:51-57` | Add `[loaded, settings.ttsEngine]` dependency |
| H-CQ-4 | Redundant `handleToggleNarration` wrapper adds no behavior | `ReaderContainer.tsx:382-384` | Pass `handleToggleTts` directly |
| H-CQ-5 | Ctrl+0 font reset inconsistent between ReaderContainer (110% default) and StandaloneReader (60% min) | `App.tsx:96` | Add `isFinite` guard to StandaloneReader |

### Test Coverage (24B)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| H-TC-1 | All 8 IPC handler files have zero test coverage | `main/ipc/*.js` | Add handler contract tests (happy path + one error path) |
| H-TC-2 | Placeholder assertions in useProgressTracker tests (`expect(false).toBe(false)`) | `tests/useProgressTracker.test.ts:21-31` | Replace with actual engagement gating tests |
| H-TC-3 | Cloud auth flows — auth.js, cloud-onedrive.js, cloud-google.js — zero tests | `main/auth.js`, `main/cloud-*.js` | Mock providers, test token acquire/refresh/retry |
| H-TC-4 | Onboarding flow — zero tests | `src/components/OnboardingOverlay.tsx` | Add render + dismiss + persistence tests |
| H-TC-5 | folder-watcher.js symlink guard — zero tests (security-relevant) | `main/folder-watcher.js` | Mock realpath, test path traversal rejection |

### Documentation (24D)

| ID | Finding | Documents | Fix |
|----|---------|-----------|-----|
| H-DOC-1 | CLAUDE.md CT-2 not marked complete; Dependency Chain missing ✅ | CLAUDE.md | Update sprint list and chain |
| H-DOC-2 | IPC architecture description says "replaces monolithic ipc-handlers.js" but file still exists as coordinator | CLAUDE.md | Clarify thin-coordinator pattern |
| H-DOC-3 | `main/file-parsers.js` imported by main.js but not listed in architecture | CLAUDE.md | Add to module list |
| H-DOC-4 | Missing hooks from architecture list (useReadingModeInstance, useFocusTrap, narration sub-hooks) | CLAUDE.md | Add missing hooks |
| H-DOC-5 | Types directory structure wrong (`src/types.ts` root vs `src/types/` dir confusion, bridge.ts missing) | CLAUDE.md | Distinguish root types.ts from types/ subdirectory |
| H-DOC-6 | Sprint Dispatch Template path inconsistency (Rule 8 vs Other References) | CLAUDE.md | Consolidate to `.claude/agents/blurby-lead.md` |
| H-DOC-7 | ROADMAP.md Execution Order diagram still shows CT-2 as "NEXT" | ROADMAP.md | Update diagram |
| H-DOC-8 | TECHNICAL_REFERENCE.md architecture diagram stale (pre-TD-1, missing IPC split, TTS worker) | TECHNICAL_REFERENCE.md §2 | Redraw process model |
| H-DOC-9 | `src/modes/ModeInterface.ts` referenced but doesn't exist | TECHNICAL_REFERENCE.md §5 | Remove or correct reference |
| H-DOC-10 | Test inventory completely wrong: lists 27 files / 522 tests, actual is 38 files / 776 tests | TECHNICAL_REFERENCE.md §14 | Rewrite entire section |
| H-DOC-11 | Universal EPUB pipeline status contradicts between CLAUDE.md ("done") and TECHNICAL_REFERENCE.md ("design phase Sprint 27") | Both | Reconcile — partially implemented |

---

## MEDIUM FINDINGS (21)

### Code Quality (24A)

| ID | Finding | Fix |
|----|---------|-----|
| M-CQ-1 | Unused imports: `TTS_WPM_CAP`, `FOCUS_MODE_START_DELAY_MS` in ReaderContainer.tsx:3 | Remove from import line |
| M-CQ-2 | 109 inline `style={}` occurrences across 29 components (PR-7 violation) | Sweep sprint to extract to CSS classes |
| M-CQ-3 | `showUndoToast` in LibraryKeyboardActions interface — declared but never implemented or called | Remove dead interface member |
| M-CQ-4 | `useRef<any>` type erasure for kbActionsRef in LibraryContainer.tsx:188 | Type as `LibraryKeyboardActions | null` |

### Architecture (24C)

| ID | Finding | Fix |
|----|---------|-----|
| M-ARC-1 | `open-doc-source` passes sourceUrl to shell.openExternal without protocol validation | Validate http/https before calling |
| M-ARC-2 | No input size validation on `add-manual-doc` content | Check against CONTENT_SIZE_LIMIT at IPC boundary |
| M-ARC-3 | Test harness tree-shaking not verified in production build | Grep dist/ for "electron-api-stub" string |
| M-ARC-4 | `saveHistory()` / `saveSiteCookies()` fire-and-forget async (no error handling) | Add `.catch()` or debounce pattern |
| M-ARC-5 | `main/ipc-handlers.js` coordinator stub — unnecessary indirection post-migration | Remove after v1.0.0 |
| M-ARC-6 | No code splitting in Vite config — entire app in one chunk | Add React.lazy for settings pages |

### Test Coverage (24B)

| ID | Finding | Fix |
|----|---------|-----|
| M-TC-1 | useNarration hook lifecycle untested (only rate clamping + voice selection) | Test start/stop/pause/resume cycle |
| M-TC-2 | WS server pairing token auth path untested | Test valid/invalid token acceptance/rejection |

### Documentation (24D)

| ID | Finding | Fix |
|----|---------|-----|
| M-DOC-1 | Version mismatch: package.json 2.1.6 vs CLAUDE.md 2.1.7 | Reconcile |
| M-DOC-2 | Settings sub-pages: 9 files on disk vs "8" in docs (LayoutSettings.tsx unaccounted) | Audit and update count |
| M-DOC-3 | CLAUDE.md "What's Next" stale (CT-2 still listed as pending) | Update |
| M-DOC-4 | CT-2 full spec still inline in ROADMAP.md (should be archived) | Move to ROADMAP_ARCHIVE.md |
| M-DOC-5 | LESSONS_LEARNED.md has 3 fragmented Persistent Rules tables + orphaned rows | Consolidate into single table |
| M-DOC-6 | "Known Traps (Updated Sprint 24)" label collision with current Sprint 24 | Rename to date-based label |
| M-DOC-7 | No LL entry for Shift+Space modifier key interception pattern (CT-2E discovery) | Consider adding LL-046 |
| M-DOC-8 | TECHNICAL_REFERENCE.md header: version 2.1.0, branch td1 — severely stale | Update to 2.1.6 / main |
| M-DOC-9 | TECHNICAL_REFERENCE.md §8 says EPUB pipeline is "design phase" — contradicts reality | Update to reflect partial implementation |

---

## LOW FINDINGS (10)

| ID | Source | Finding |
|----|--------|---------|
| L-1 | 24A | `getStartWordIndex` may be fully dead code after H-CQ-1 fix |
| L-2 | 24A | `ESTIMATE_WPM = 225` in bookData.ts — unexplained magic number |
| L-3 | 24C | No circular dependencies detected (renderer or main) — healthy |
| L-4 | 24C | Duplicate `logToFile` function across IPC modules |
| L-5 | 24C | `regenerate-ws-pairing-token` code reads as if `generatePairingToken()` has side effect (it doesn't) |
| L-6 | 24C | Pre-19D tombstones with `deletedAtTimestamp = 0` never cleaned up |
| L-7 | 24C | Cloud sync revision counter and merge logic — architecturally sound, no issues |
| L-8 | 24D | LL-014 uses "Sprint 24" to mean old flow cursor sprint, not current audit sprint |
| L-9 | 24D | SPRINT_QUEUE.md at minimum threshold (3 entries); consuming one requires backfill |
| L-10 | 24D | Auth window has no `will-navigate` restriction (low exploitability) |

---

## Positive Findings

From 24C Architecture Review:
- **No circular dependencies** in either renderer or main process — import graph is clean
- **Cloud sync merge logic is architecturally sound** — revision counters, tombstone GC, sync queue compaction all correct
- **contextIsolation: true, nodeIntegration: false** — Electron security defaults are correct
- **preload.js is minimal** — pure context bridge, no logic

From 24A Code Quality:
- **No Node.js imports in renderer** — all system access through window.electronAPI
- **LL-014 through LL-045 anti-patterns** — no regressions detected
- **ref-based callback patterns (LL-016/017/020)** — correctly implemented throughout

From 24B Test Coverage:
- **776 tests across 38 files, all passing** — strong baseline
- **Mode verticals, narration strategies, sync engine** — well-tested
- **Test assertions are generally meaningful** — not just "doesn't throw"

---

## v1.0.0 Gate Decision

**3 CRITICALs found. CRITICALs block v1.0.0 release per Sprint 24 acceptance criteria.**

Required before release:
1. ~~Fix `read-file-buffer` path validation (CRIT-1)~~ ✅ Fixed (Sprint 24R)
2. ~~Resolve OAuth credential injection (CRIT-2)~~ ⏸️ Deferred to v1.1.0
3. ~~Fix or remove `.workflow/` dead references (CRIT-3)~~ ❌ Dismissed (false positive)

**Status (2026-03-29):** v1.0.0 shipped. All CRITs resolved or deferred.
