# Blurby — Development Roadmap

**Last updated**: 2026-04-04 — Post-TTS-6S (Cursor Sync, Pause Shaping & Backlog Fill). 1,209 tests, 67 files. Latest tagged release: v1.28.0.
**Current branch**: `main`
**Current state**: Phase 6 TTS lane complete through TTS-6S. Queue GREEN (`EINK-6A` → `EINK-6B` → `GOALS-6B`; depth 3).
**Governing roadmap**: `docs/project/ROADMAP_V2.md` (7-phase product roadmap)

> **Navigation:** Forward-looking sprint specs below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`. Phase 1 fix specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md`.

---

## Execution Order

```
Phase 1: Stabilization (AUDIT-FIX 1A–1F) ── COMPLETE (v1.4.14)
    │
    ▼
Phase 2: EPUB Content Fidelity ── COMPLETE (v1.5.1)
    │
    ▼
Phase 3: Flow Mode Redesign ── COMPLETE (v1.6.1)
    │
    ▼
Phase 4: Blurby Readings ── COMPLETE (v1.9.0)
    │
    ▼
Phase 5: Read Later + Chrome Extension
  ├── 5A ✅ E2E + Queue (v1.10.0)
  └── 5B → EXT-5B: Pairing UX ✅
    │
    ▼
Phase 6: TTS Hardening & App Polish
  ├── TTS-6C: Kokoro Native-Rate Buckets ✅ (v1.14.0)
  ├── TTS-6D: Kokoro Startup & Recovery Hardening ✅ (v1.15.0)
  ├── TTS-6E: Pronunciation Overrides Foundation ✅ (v1.16.0)
  ├── TTS-6F: Word Alignment & Narration Telemetry ✅ (v1.17.0)
  ├── TTS-6G: Narration Controls & Accessibility Polish ✅ (v1.18.0)
  ├── TTS-6I: Per-Book Pronunciation Profiles ✅ (v1.19.0)
  ├── TTS-6J: Voice Selection & Persona Consistency ✅ (v1.20.0)
  ├── TTS-6K: Narration Personalization & Quality Sweep ✅ (v1.21.0)
  ├── TTS-6L: Narration Profiles & Sharing Foundations ✅ (v1.22.0)
  ├── TTS-6M: Narration Portability & Reset Safety ✅ (v1.23.0)
  ├── TTS-6N: Narration Runtime Stability & Extraction Sync ✅ (v1.24.0)
  ├── TTS-6O: Narration Performance Budgets & Background Work Isolation ✅ (v1.25.0)
  ├── TTS-6P: Session Continuity & Recovery ✅ (v1.26.0)
  ├── TTS-6Q: Narration Diagnostics & Regression Shields ✅ (v1.27.0)
  ├── TTS-6S: Cursor Sync, Pause Shaping & Backlog Fill Hotfix ✅ (v1.28.0)
  ├── HOTFIX-11: Bug Reporter Narration Diagnostics & Console Capture (queued)
  ├── EINK-6A: E-Ink Foundation & Greyscale Runtime (queued)
  ├── EINK-6B: E-Ink Reading Ergonomics & Mode Strategy (queued)
  └── GOALS-6B: Reading Goal Tracking (queued)
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 7:                  Phase 8:
Cloud Sync Hardening      RSS/News Feeds
    │                        │
    └────────────┬───────────┘
                 ▼
Phase 9: APK Wrapper (+2 modularization sprints)
```

---

## Phase 2 — EPUB Content Fidelity

**Goal:** The existing EPUB converter preserves formatting, images, and structure from all source formats. EPUB becomes the true single canonical internal format with no legacy text fallback.

**Baseline:** `main/epub-converter.js` (769 lines) already converts TXT, MD, HTML, PDF, MOBI/AZW → EPUB. The import pipeline (`main/ipc/library.js`) routes all non-EPUB files through `convertToEpub()`. Foliate renders EPUBs. Legacy text fallback path (`main/legacy-parsers.js`) remains as dead-end for failed conversions.

**Gaps addressed:**
- BUG-033: Book formatting stripped too aggressively (bold, italic, lists, headings lost)
- BUG-034: Images in books stripped during import (not extracted or embedded)
- BUG-075/079: EPUB pipeline completion (DOCX support, URL→EPUB, single rendering path)

---

### Sprint EPUB-2A: Content Fidelity ✅ COMPLETED (v1.5.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-033/034 resolved. 18 new tests. APPROVED_WITH_CONCERNS (PDF bold/italic and image extraction limited by pdf-parse).

---

### Sprint EPUB-2B: Pipeline Completion ✅ COMPLETED (v1.5.1, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-075/079 resolved. 16 new tests. APPROVED — all SUCCESS CRITERIA met. URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path.

---

## Phase 3 — Flow Mode Redesign

**Goal:** Replace the current paginated cursor-on-pages Flow Mode with an infinite-scroll reading experience. Text flows continuously and scrolls upward at WPM speed through a reading zone in the upper third of the viewport. A shrinking underline cursor paces the reader line-by-line. Works for both plain text/HTML docs and foliate-rendered EPUBs.

**Baseline:** `FlowMode.ts` (163 lines) drives word-by-word timing via setTimeout chain. `FlowCursorController.ts` (240 lines) slides a CSS-transitioned bar across paginated lines. Both operate within PageReaderView. `FoliatePageView.tsx` hardcodes `flow="paginated"` — foliate-js supports `flow="scrolled"` natively but Blurby has never used it.

**Architecture decision:** Flow Mode gets its own scroll-based rendering path. This reverses LL-013 ("Flow belongs in Page View") — infinite scroll is fundamentally incompatible with pagination. Page Mode stays paginated. Flow Mode switches to continuous scroll. This is a clean separation: the mode vertical (`FlowMode.ts`) drives timing, a new `FlowScrollEngine` manages the scroll container and cursor rendering.

**Key design decisions:**
- **Reading zone:** Upper third of viewport. Active line ~25% from top. Upcoming text fills the bottom 75%. Already-read text scrolls off the top.
- **Shrinking underline cursor:** Full-width `var(--accent)` underline appears under the active line, contracts from left-to-right at WPM speed. When it reaches zero width → next line begins with fresh full-width underline. The cursor IS the pacer — no separate scroll speed control.
- **EPUB support via foliate scrolled mode:** `flow="scrolled"` gives us a native scrollable container. Cursor overlays on top. Narration sync deferred to FLOW-3B.
- **LL-014 still applies:** Cursor animation is imperative (class-based, not React effects). New `FlowScrollEngine` class replaces `FlowCursorController`.

---

### Sprint FLOW-3A: Flow Mode Infinite Scroll ✅ COMPLETED (v1.6.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. All 12 SUCCESS CRITERIA met. 35 new tests (932 total, 47 files). FlowScrollEngine replaces FlowCursorController. LL-013 reversed (see LL-067).

---

### Sprint FLOW-3B: Flow Mode Polish ✅ COMPLETED (v1.6.1, 2026-04-01)

> Dead code removal (FlowScrollView, FlowCursorController, FLOW_PAGE_TURN_PAUSE_MS). Edge case hardening (empty doc, zero-width lines, font size rebuild). BUG-091/084 confirmed resolved by FLOW-3A. Bottom bar verified visible. Truncation fix for FoliatePageView.tsx + useKeyboardShortcuts.ts. 8 new tests (940 total).

---

## Phase 4 — Blurby Readings

**Goal:** Transform the library into a curated reading experience. Richer card metadata, explicit reading queue, author normalization, metadata enrichment, and first-run onboarding.

**Phase 4 split:**
- READINGS-4A ✅ (cards + queue + new dot) — v1.7.0
- READINGS-4B ✅ (author normalization + folder picker) — v1.8.0
- READINGS-4C ✅ (metadata wizard) — v1.9.0

---

### Sprint READINGS-4B: Author Normalization + First-Run Folder Picker ✅ COMPLETED (v1.8.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-074/076 resolved. 16 new tests (973 total, 49 files). Author normalization on all imports, batch normalize IPC, "Normalize Authors" button in settings, folder picker step in onboarding. APPROVED.

---

### Sprint READINGS-4C: Metadata Wizard ✅ COMPLETED (v1.9.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-077 resolved. 16 new tests (989 total, 50 files). Metadata scan IPC, filename parser, batch update IPC, MetadataWizard modal, Ctrl+Shift+M shortcut. APPROVED.

---

## Phase 5 — Read Later + Chrome Extension

**Goal:** Harden the Chrome extension → desktop pipeline with automated E2E tests. Integrate extension-sourced articles with the reading queue (READINGS-4A). Articles sent from the extension auto-join the queue and display with clear "web" source attribution.

**Baseline:** Chrome extension (7 files, ~1,700 lines) already sends articles via WebSocket to `main/ws-server.js` (441 lines). Articles are extracted via Readability.js, converted to EPUB, and added to library with `source: "url"`, `unread: true`. Existing WS test file (`tests/ws-server.test.js`, 317 lines) covers frame encoding and message shapes but has no integration tests. `handleAddArticle()` (ws-server.js line 226) does NOT set `queuePosition` — articles land in library but not in the reading queue.

---

### Sprint EXT-5A: Chrome Extension E2E Tests + Queue Integration ✅ COMPLETED (v1.10.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. 33 new tests (1,022 total, 51 files). Auto-queue extension articles (queuePosition), source domain badge, E2E pipeline tests, WS protocol tests. APPROVED.

---

### Sprint EXT-5B: Extension Pairing UX Hardening ✅ COMPLETED (v1.11.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. 10 new tests (1,032 total, 51 files). 6-digit short code pairing, WS `pair` protocol, ConnectorsSettings Chrome Extension section, popup pairing flow, options.html paired/unpair UI. Phase 5 complete. APPROVED.

### Post-Phase 5 Implementation Note: TTS Smoothness Stabilization ✅ IMPLEMENTED ON `main` (2026-04-04, unreleased)

> Kokoro narration path upgraded in-place on `main`. 6 new tests (1,038 total, 51 files). This was implementation work rather than a queued release sprint, so it is recorded here as an engineering milestone rather than a tagged version.

**Delivered:**
- Predictive first-chunk priming for warm-model starts
- Cache `wordCount` metadata with lazy migration for legacy entries
- Scheduler-owned `playbackRate` for Kokoro speed changes (no restart churn)
- Boundary-aware chunk planning with schedule-time punctuation pauses
- Reading Now background cache wiring
- TTS/preload/runtime type surface restored to green (`npm run typecheck`)

**Queued follow-up:** `TTS-6C` replaces the unreleased Kokoro `playbackRate` speed path with native `1.0x` / `1.2x` / `1.5x` generation buckets before release. Smoothness remains the startup/cache/chunking foundation; `TTS-6C` owns Kokoro rate control.

**Baseline:**
- `main/ws-server.js` (450 lines) — `handleMessage()` at line 184 handles `auth` type. `generatePairingToken()` at line 320 generates 32-char hex. `_pairingToken` module var stores the long-lived token.
- `main/ipc/misc.js` — `get-ws-pairing-token` and `regenerate-ws-pairing-token` IPC handlers (lines 305-312).
- `src/components/settings/ConnectorsSettings.tsx` (85 lines) — Site logins only. No extension pairing UI.
- `chrome-extension/service-worker.js` (561 lines) — WS auth at connect time, reads `pairingToken` from `chrome.storage.local`.
- `chrome-extension/popup.js` (185 lines) — Connection status badge, no pairing UI.
- `chrome-extension/options.html` (216 lines) — Manual pairing token text input field.

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `main/ws-server.js` — `handleMessage()` (line 184), `generatePairingToken()` (line 320), `startServer()` (line 324)
5. `main/ipc/misc.js` — `get-ws-pairing-token`, `regenerate-ws-pairing-token` (lines 305-312)
6. `src/components/settings/ConnectorsSettings.tsx` — current site logins UI (85 lines)
7. `src/components/SettingsMenu.tsx` — ConnectorsSettings wiring
8. `chrome-extension/service-worker.js` — WS connect + auth flow
9. `chrome-extension/popup.html` + `popup.js` — popup UI + connection status
10. `chrome-extension/options.html` + `options.js` — manual token input

#### Tasks

| # | Agent | Task | Files |
|---|-------|------|-------|
| 1 | electron-fixer | **Short-code generation** — New `generateShortCode()` in ws-server.js: 6-digit numeric (`Math.floor(100000 + Math.random() * 900000)`). New module vars `_shortCode`, `_shortCodeExpiry`. Auto-rotates every 5 min (`SHORT_CODE_TTL_MS` in constants.js). `getShortCode()` export: returns `{code, expiresAt}`, regenerates if expired. | `main/ws-server.js`, `main/constants.js` |
| 2 | electron-fixer | **WS `pair` message handler** — In `handleMessage()`, before the auth-required gate: accept `{type:"pair", code}` from unauthenticated clients. Validate `msg.code` against `_shortCode` (string comparison). On match: generate long-lived token via `generatePairingToken()`, encrypt+persist to settings (reuse existing pattern), set `client.authenticated = true`, send `{type:"pair-ok", token}`. On mismatch: send `{type:"pair-failed", message:"Invalid code"}`. On expired code: regenerate before comparing. | `main/ws-server.js` |
| 3 | electron-fixer | **Short-code IPC** — New `get-ws-short-code` IPC handler: returns `{code, expiresAt, connected}` where `connected` = `_clients.size > 0 && [..._clients].some(c => c.authenticated)`. New `regenerate-ws-short-code` handler: force-rotates code, returns new `{code, expiresAt}`. Add to preload.js. | `main/ipc/misc.js`, `preload.js` |
| 4 | renderer-fixer | **ConnectorsSettings: Chrome Extension section** — Add section above "Logged-in Sites": heading "Chrome Extension", connection status indicator (green dot + "Connected" / red dot + "Not connected"), 6-digit code in large monospace (`font-size: 2rem; letter-spacing: 0.5em`), "Refreshes in X:XX" countdown (useEffect interval), "New Code" button calls `regenerate-ws-short-code`. Hide code when connected. Use `get-ws-short-code` IPC to fetch. | `src/components/settings/ConnectorsSettings.tsx`, `src/styles/global.css` |
| 5 | renderer-fixer | **Extension popup: pairing flow** — When `connectionStatus !== "connected"`: replace article preview area with pairing UI. Show "Enter the 6-digit code from Blurby desktop" label, 6-digit input (numeric, maxlength 6, large centered), "Pair" button. On submit: send `{type:"request-pair", code}` message to service worker. Service worker sends `{type:"pair", code}` over WS. On `pair-ok`: store received token in `chrome.storage.local` as `pairingToken`, update connection badge to green, switch to normal UI. On `pair-failed`: show inline error "Invalid code — check Blurby desktop". | `chrome-extension/popup.html`, `chrome-extension/popup.js`, `chrome-extension/service-worker.js` |
| 6 | renderer-fixer | **Extension options: replace manual token field** — Remove the raw pairing token text input. Replace with: connection status display, "Paired" with green check when token exists, "Unpair" button (clears `pairingToken` from storage, disconnects WS). Keep existing cloud sync and connection mode settings. | `chrome-extension/options.html`, `chrome-extension/options.js` |
| 7 | test-runner | **Tests** — (a) `generateShortCode()` returns 6-digit string, (b) short code rotates after TTL, (c) `pair` message with valid code → `pair-ok` with token, (d) `pair` message with invalid code → `pair-failed`, (e) `pair` message after expiry → new code generated + compared, (f) successful pair marks client authenticated, (g) IPC `get-ws-short-code` returns code + expiry, (h) IPC `regenerate-ws-short-code` returns new code. ≥10 new tests. | `tests/ws-server.test.js` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-reviewer | **Spec compliance** | — |
| 10 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. 6-digit numeric code displayed in Settings > Connectors under "Chrome Extension" section
2. Code auto-rotates every 5 minutes with visible countdown
3. "New Code" button regenerates immediately
4. Extension popup shows pairing input when not connected
5. Entering correct code in extension popup → `pair-ok` → token stored → auto-connected
6. Entering wrong code → inline error message, no crash
7. Extension reconnects automatically on restart using stored token (existing `auth` flow unchanged)
8. ConnectorsSettings shows green "Connected" status when extension is paired
9. Extension options.html no longer has raw token input field
10. ≥10 new tests covering short code generation, pair protocol, IPC handlers
11. `npm test` passes (≥1,032 tests)
12. `npm run build` succeeds
13. Existing WS tests and extension pipeline tests pass — no regressions

---

## Phase 5 Exit Gate

Phase 5A ✅ complete. Phase 5B = extension pairing UX (not RSS/News — that moved to Phase 8 backlog).

Phase 5 is complete when:
1. ✅ Extension articles auto-enter reading queue (5A)
2. ✅ E2E test coverage exists for the full article ingestion pipeline (5A)
3. Extension pairing is one-step (6-digit code, no manual token copy) (5B)
4. All existing extension functionality preserved — no regressions

---

## Phase 6 — TTS Hardening & App Polish

**Goal:** Preserve the completed Kokoro/narration hardening lane, but keep room for urgent user-confirmed hotfixes before resuming broader app-polish themes. `TTS-6S` is now active because saved in-app bug reports show real runtime regressions in sync, pause quality, and backlog fill.

---

### Sprint TTS-6S: Cursor Sync, Pause Shaping & Backlog Fill Hotfix

**Goal:** Stabilize live Kokoro narration quality by fixing the three user-reported failures now reproduced in the field: cursor/highlight drift from spoken audio, long or awkward pauses at the wrong boundaries, and audible silence when backlog/cache fill cannot keep pace with playback. Resolves BUG-096, BUG-097, and BUG-098.

**Problem:** The Phase 6 TTS lane shipped strong infrastructure, but live reports from `Ctrl+Shift+B` bug captures show Narrate is still not reliable enough in real use. On *The Return of Sherlock Holmes* (EPUB, ~115k words), users report the cursor stops following the voice, Kokoro pauses mid-clause or over-pauses in the wrong places, and the next chunk is not ready in time, producing dead air. The app now has better diagnostics from `TTS-6Q`, but the product issue is runtime quality, not observability alone. We need one focused hotfix sprint that tightens scheduler/runtime behavior before more feature work.

**Design decisions:**
- **Bug-report-driven scope:** This sprint is anchored to saved app-data bug reports plus `BUG-096`, `BUG-097`, and `BUG-098`, not speculative cleanup.
- **Keep Kokoro native-rate architecture:** Do not reintroduce `playbackRate` stretching or bypass the native-rate bucket system. Fix timing/backlog behavior inside the existing architecture.
- **Prefer runtime truth over textual guesses:** Where possible, use actual rendered chunk duration, queue depth, and scheduler diagnostics to drive behavior instead of static assumptions.
- **Backlog first, then cosmetics:** Eliminating audible dead air and obvious cursor drift is higher priority than perfect highlight smoothness.
- **No hidden resets:** Fixes must avoid stop/restart behavior that would make narration feel “better” only because playback keeps jumping.

**Baseline:**
- Saved bug reports in app data: `C:\Users\estra\AppData\Roaming\blurby\blurby-data\bug-reports\bug-2026-04-04T21-53-21Z.json` and `bug-2026-04-04T21-56-59Z.json`
- `docs/governance/BUG_REPORT.md` — `BUG-096`, `BUG-097`, `BUG-098`
- `src/hooks/useNarration.ts` — Narrate orchestration, queue handoff, cursor updates
- `src/utils/audioScheduler.ts` — source scheduling, highlight timing, pause shaping
- `src/utils/generationPipeline.ts` — chunk sizing, backlog preparation, request pacing
- `src/hooks/narration/kokoroStrategy.ts` — Kokoro strategy/runtime integration
- `src/components/ReaderContainer.tsx` — extraction handoff + narration runtime integration
- `src/utils/narrateDiagnostics.ts` and perf surfaces from `TTS-6O` / `TTS-6Q`

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — `BUG-096`, `BUG-097`, `BUG-098`
4. Saved app-data bug reports in `C:\Users\estra\AppData\Roaming\blurby\blurby-data\bug-reports\`
5. `ROADMAP.md` — this section
6. `src/hooks/useNarration.ts`
7. `src/utils/audioScheduler.ts`
8. `src/utils/generationPipeline.ts`
9. `src/hooks/narration/kokoroStrategy.ts`
10. `src/components/ReaderContainer.tsx`
11. `src/utils/narrateDiagnostics.ts`
12. runtime tests touching scheduler, backlog, and extraction handoff

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Cursor/voice sync correction** — Audit how cursor advancement is derived from scheduled source timing vs actual playback progress. Tighten the scheduler/highlight handoff so the word cursor remains aligned with Kokoro audio across longer chunks and section handoffs. Use existing diagnostics/invariants rather than adding a parallel timing model. | `src/hooks/useNarration.ts`, `src/utils/audioScheduler.ts`, related tests |
| 2 | Primary CLI (renderer-fixer scope) | **Pause-shaping correction** — Rebalance or suppress scheduler-added pauses where Kokoro audio already contains natural prosodic pause, especially around clause boundaries, sentence boundaries, and chunk joins. Mid-clause pauses should materially reduce. | `src/utils/audioScheduler.ts`, `src/utils/rhythm.ts` or related pause helpers, tests |
| 3 | Primary CLI (renderer-fixer scope / electron-fixer scope if needed) | **Backlog/cache starvation fix** — Ensure the next chunk is requested, generated, and queued early enough to avoid dead air on cache misses. Revisit chunk ramp, prebuffer threshold, and request pacing so backlog fill stays ahead of playback without duplicating chunk requests. | `src/utils/generationPipeline.ts`, `src/utils/audioScheduler.ts`, `src/hooks/narration/kokoroStrategy.ts`, cache/preload surfaces as needed |
| 4 | Primary CLI (renderer-fixer scope) | **Duplicate/stall guardrails** — Eliminate repeated identical chunk dispatches at the same cursor unless they are explicit retries with visible telemetry. Narration must not silently spin on one position while audio drains. | scheduler/pipeline integration surfaces, diagnostics/tests |
| 5 | test-runner | **Tests** — Add focused regression coverage for cursor alignment stability, pause placement at punctuation/clause joins, backlog continuity under uncached starts, and duplicate-chunk suppression. Include at least one integration-style case for a new uncached section start. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | quality-reviewer | **Runtime quality review** — Verify the fix addresses user-visible symptoms, not just internal metrics. | — |
| 9 | doc-keeper | **Documentation pass** — Mark `BUG-096`, `BUG-097`, and `BUG-098` resolved only if the symptoms are materially fixed in real narration runs. Update sprint queue and dependency chain. | `ROADMAP.md`, `docs/governance/BUG_REPORT.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Tasks 1-4 (sequential; keep runtime behavior coherent)
2. test-runner: Task 5
3. test-runner: Task 6
4. spec-compliance-reviewer: Task 7
5. quality-reviewer: Task 8
6. doc-keeper: Task 9
7. blurby-lead: Task 10
```

#### SUCCESS CRITERIA

1. Kokoro cursor/highlight stays materially aligned with spoken audio during normal long-form narration
2. Mid-clause and other inappropriate long pauses are materially reduced
3. Narration no longer produces audible dead air at ordinary uncached section starts because backlog/cache fill stays ahead of playback
4. Scheduler/pipeline no longer silently repeat identical chunk dispatches at one cursor position without forward progress
5. Fixes preserve native-rate buckets and do not reintroduce scheduler `playbackRate` stretching
6. New tests cover sync, pause placement, and backlog continuity regressions
7. `npm test` passes
8. `npm run build` succeeds

---

### Sprint HOTFIX-11: Bug Reporter Narration Diagnostics & Console Capture

**Goal:** Make bug reports filed during Narrate mode actionable by wiring the TTS-6Q diagnostics surface and recent console output into the bug report JSON. Resolves BUG-099 and BUG-100.

**Problem:** The bug reporter captures a screenshot and basic app state (docId, title, position, reading mode, engine, voice, speed) but nothing about what the narration subsystem was actually doing. TTS-6Q shipped `narrateDiagnostics.ts` with `NarrateDiagSnapshot` (engine, status, cursor, rate, rateBucket, extraction state, fallback info) and `NarrateDiagEvent` (start/stop/pause/resume/extraction-handoff/context-restore/fallback/rate-clamp), but neither is wired to the bug reporter. Console output with `[narrate]`, `[NarrateMode]`, `[TTS-6O]` tagged diagnostic lines is only visible in DevTools and lost when the user files a report.

**Design decisions:**
- **Renderer-side console ring buffer:** Intercept `console.log`/`console.warn`/`console.error` early in app startup, store last 200 entries in a ring buffer. Original console methods still fire normally (no suppression). Buffer is an in-memory array, not persisted.
- **Diagnostics snapshot at report time:** When the bug report dialog opens, call `getLatestSnapshot()` and `getDiagEvents()` from `narrateDiagnostics.ts` and include them in the `appState` payload alongside the existing fields.
- **No new IPC:** All data is renderer-side. `bugReportState.ts` already runs in the renderer. The diagnostics module is also renderer-side. Console buffer is renderer-side. Nothing needs to cross the preload bridge.
- **Backward-compatible JSON shape:** Extend `BugReportAppState` with optional fields so existing report consumers are unaffected.

**Baseline:**
- `src/utils/bugReportState.ts` (74 lines) — `BugReportAppState` interface + `gatherAppState()`. Has basic narration fields (`narrationStatus`, `ttsEngine`, `ttsVoice`, `ttsSpeed`).
- `src/utils/narrateDiagnostics.ts` (112 lines) — `NarrateDiagSnapshot`, `NarrateDiagEvent`, `getLatestSnapshot()`, `getDiagEvents()`, invariant checkers. Ring buffers: 10 snapshots, 50 events.
- `src/components/BugReportModal.tsx` — Modal UI. Receives `appState` as prop, displays key-value pairs, calls `api.saveBugReport()`.
- `src/components/LibraryContainer.tsx` — `openBugReport()` callback: captures screenshot, calls `gatherAppState()`, sets modal state.
- `main/ipc/bug-report.js` (54 lines) — `save-bug-report` IPC handler. Writes JSON to `{dataPath}/bug-reports/`.

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/utils/narrateDiagnostics.ts` — TTS-6Q diagnostics surface (NarrateDiagSnapshot, NarrateDiagEvent, getLatestSnapshot, getDiagEvents)
5. `src/utils/bugReportState.ts` — BugReportAppState interface, gatherAppState()
6. `src/components/BugReportModal.tsx` — modal UI, state display
7. `src/components/LibraryContainer.tsx` — openBugReport() callback (line ~100)
8. `main/ipc/bug-report.js` — save-bug-report IPC handler

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Console ring buffer** — Create `src/utils/consoleCapture.ts`. On import, monkey-patch `console.log`, `console.warn`, `console.error` to also push `{timestamp, level, args: serialized}` into a ring buffer (max 200 entries). Export `getConsoleBuffer(): ConsoleEntry[]` and `clearConsoleBuffer(): void`. Serialize args with `JSON.stringify` try/catch (fallback to `String(arg)`). Truncate individual entries to 500 chars. Import this module early in `src/main.tsx` (before React mount) so it captures startup logs. | `src/utils/consoleCapture.ts`, `src/main.tsx` |
| 2 | Primary CLI (renderer-fixer scope) | **Extend BugReportAppState** — Add optional fields to the interface: `narrateDiagSnapshot?: NarrateDiagSnapshot`, `narrateDiagEvents?: NarrateDiagEvent[]`, `consoleLog?: ConsoleEntry[]`. Update `gatherAppState()` to accept these and pass them through. | `src/utils/bugReportState.ts` |
| 3 | Primary CLI (renderer-fixer scope) | **Wire diagnostics into openBugReport** — In `LibraryContainer.tsx` `openBugReport()`, after capturing screenshot: import and call `getLatestSnapshot()` and `getDiagEvents()` from `narrateDiagnostics.ts`, import and call `getConsoleBuffer()` from `consoleCapture.ts`. Pass all three into `gatherAppState()`. | `src/components/LibraryContainer.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Display diagnostics in modal** — In `BugReportModal.tsx`, if `appState.narrateDiagSnapshot` exists, render a collapsible "Narration Diagnostics" section showing: engine, status, rateBucket, cursorWordIndex/totalWords, extractionComplete, fellBack. If `appState.consoleLog` exists, render a collapsible "Console Log" section with the last 50 entries (most recent first), each showing timestamp + level + message. Use `<pre>` with `max-height: 200px; overflow-y: auto` for the console section. | `src/components/BugReportModal.tsx`, `src/styles/global.css` |
| 5 | test-runner | **Tests** — (a) `consoleCapture` captures log/warn/error and respects ring buffer limit, (b) `consoleCapture` truncates long entries, (c) `gatherAppState` includes diagnostics fields when provided, (d) `gatherAppState` omits diagnostics fields when not provided (backward compat), (e) `BugReportAppState` with diagnostics serializes to valid JSON. >=8 new tests. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | doc-keeper | **Documentation pass** — Mark BUG-099 and BUG-100 as resolved. Update TECHNICAL_REFERENCE if bug report schema is documented there. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 9 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI (renderer-fixer scope): Tasks 1-4 (sequential — 1 before 2, 2 before 3, 3 before 4)
2. test-runner: Task 5 (tests)
3. test-runner: Task 6 (npm test + npm run build)
4. spec-compliance-reviewer: Task 7
5. doc-keeper: Task 8
6. blurby-lead: Task 9 (git)
```

#### SUCCESS CRITERIA

1. New `src/utils/consoleCapture.ts` intercepts console.log/warn/error into a 200-entry ring buffer
2. Console capture is initialized before React mount in `src/main.tsx`
3. `BugReportAppState` includes optional `narrateDiagSnapshot`, `narrateDiagEvents`, and `consoleLog` fields
4. `openBugReport()` in LibraryContainer populates diagnostics from `narrateDiagnostics.ts` and console from `consoleCapture.ts`
5. Bug report JSON saved to disk includes narration diagnostics when narration is/was active
6. Bug report JSON saved to disk includes recent console output
7. BugReportModal displays narration diagnostics section when data exists
8. BugReportModal displays console log section when data exists
9. Existing bug reports without diagnostics fields still load/display correctly (backward compat)
10. Original console methods still fire normally (no suppression of DevTools output)
11. >=8 new tests
12. `npm test` passes
13. `npm run build` succeeds

---

### Sprint TTS-6D: Kokoro Startup & Recovery Hardening ✅ COMPLETED (v1.15.0, 2026-04-04)

> Implemented and merged to `main`. 11 new tests (1,061 total, 53 files). Unified `tts-kokoro-engine-status` events (`warming` / `ready` / `retrying` / `error`), explicit narration warming state, 2-second delayed prewarm, reader/settings warm-up affordances, and visible crash-retry UX. `BUG-032` resolved. All 10 SUCCESS CRITERIA met.

**Goal:** Eliminate the remaining "hung" feeling around Kokoro first-use, idle re-warm, and worker recovery so narration always presents a visible, deterministic startup path instead of silent waiting.

**Problem:** `TTS-6C` fixed rate quality, but the startup/recovery story is still only partially productized. `BUG-032` remains mitigated rather than resolved. The engine now emits `tts-kokoro-loading`, but cold start, idle unload, and worker-crash recovery still need one unified renderer-side state model, clearer reader UX, and test coverage that proves narration recovers cleanly.

**Design decisions:**
- **Single Kokoro engine-status surface:** Treat cold load, idle re-warm, and crash retry as the same product state machine (`idle`, `warming`, `ready`, `error`) instead of ad hoc loading booleans.
- **Visible waiting, not silent stall:** When the user starts Kokoro before the model is ready, narration enters an explicit waiting state in the reader UI and resumes automatically when warm-up finishes.
- **Delayed prewarm, never startup-blocking:** If Kokoro was last used or is the selected engine, the app may schedule a delayed background prewarm after startup/reader-open, but never on the synchronous app-critical path.
- **Recovery is a first-class path:** Worker retry/recreate behavior must surface progress/error back to renderer and cleanly fall back only on terminal failure.

**Baseline:**
- `main/tts-engine.js` — worker lifecycle, idle timeout unload, crash retry, `sendLoadingSignal()`
- `main/ipc/tts.js` — renderer-facing TTS IPC + loading event forwarding
- `preload.js` — `onKokoroLoading` bridge
- `src/hooks/useNarration.ts` — engine selection, Kokoro readiness, start/stop/restart behavior
- `src/components/ReaderContainer.tsx` — narration start UX, loading/error affordances
- `src/components/settings/SpeedReadingSettings.tsx` — engine selection context
- `tests/` — current Kokoro engine, IPC, and narration integration coverage

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — `BUG-032`
4. `ROADMAP.md` — this section
5. `main/tts-engine.js`
6. `main/ipc/tts.js`
7. `preload.js`
8. `src/hooks/useNarration.ts`
9. `src/components/ReaderContainer.tsx`
10. `src/components/settings/SpeedReadingSettings.tsx`
11. existing TTS tests touching worker recovery/loading

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (electron-fixer scope) | **Normalize Kokoro engine lifecycle events** — Make `main/tts-engine.js` expose a single engine-status stream for warm-up start, warm-up complete, retrying, and terminal failure. Reuse the existing loading event path instead of inventing parallel signals. | `main/tts-engine.js`, `main/ipc/tts.js`, `preload.js` |
| 2 | Primary CLI (electron-fixer scope) | **Delayed prewarm policy** — Add a delayed/background prewarm path when Kokoro is selected or was last used recently. It must never block app launch or reader open, and it must no-op when the worker is already ready. | `main/tts-engine.js`, `main/ipc/tts.js`, settings access point as needed |
| 3 | Primary CLI (renderer-fixer scope) | **Narration waiting state** — In the narration hook, distinguish `warming` from `speaking`/`idle` so the reader can show "Loading Kokoro..." and auto-continue once ready. Starting narration during warm-up must not create duplicate pipeline starts. | `src/hooks/useNarration.ts`, `src/types/narration.ts` |
| 4 | Primary CLI (renderer-fixer scope) | **Reader UX for cold start and recovery** — Show a clear inline loading/error state in the reader when Kokoro is warming or failed. Keep Web Speech unchanged. Recovery after a successful re-warm should continue from the intended current word. | `src/components/ReaderContainer.tsx`, supporting styles if needed |
| 5 | Primary CLI (renderer-fixer scope) | **Settings/UI consistency** — If Kokoro is selected in settings while it is still warming, expose that status there too so first-use does not feel invisible. Keep the control lightweight; no new wizard/modal. | `src/components/settings/SpeedReadingSettings.tsx` |
| 6 | test-runner | **Tests** — Cover: cold-start waiting state, delayed prewarm not blocking startup path, idle re-warm status emission, worker crash retry surfacing status, auto-resume from intended word after warm-up, terminal failure surfacing readable error. Add integration coverage for the renderer event path. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | quality-reviewer | **Architecture + code quality review** | — |
| 10 | doc-keeper | **Documentation pass** — Mark `BUG-032` resolved only if the startup/recovery path is genuinely deterministic and visible. | `ROADMAP.md`, `docs/governance/BUG_REPORT.md`, `docs/governance/TECHNICAL_REFERENCE.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Kokoro cold-start, idle re-warm, and crash-retry all use one renderer-visible engine-status path
2. Starting Kokoro narration while the model is warming shows an explicit waiting state instead of silent dead air
3. Successful warm-up automatically continues narration from the intended current word without duplicate starts
4. Delayed/background prewarm never blocks app launch or reader-open
5. Worker retry/failure state reaches the renderer with a readable user-facing error on terminal failure
6. Web Speech startup behavior is unchanged
7. `BUG-032` is either fully resolved or left open with explicit remaining scope documented
8. New tests cover warm-up, idle re-warm, crash recovery, and auto-resume behavior
9. `npm test` passes
10. `npm run build` succeeds

---

### Sprint TTS-6E: Pronunciation Overrides Foundation ✅ COMPLETED (v1.16.0, 2026-04-04)

> Implemented and merged to `main`. 15 new tests (1,076 total, 54 files). Added `PronunciationOverride` settings state, override editor with live preview, shared `applyPronunciationOverrides()` helper, Web Speech normalization, and Kokoro cache segregation via override-hash identity. Plain-text replacements only; no SSML or phoneme editor. All 10 SUCCESS CRITERIA met.

**Goal:** Give users a first real pronunciation-control layer for Narrate mode by letting them define simple text replacements before synthesis, without introducing SSML or phoneme editing.

**Problem:** Proper names, acronyms, and domain-specific terms still get mispronounced unpredictably. The TTS audits correctly identified this as a product gap. Blurby does not need enterprise lexicons or phoneme editors yet, but it does need a simple user-owned override system that works with both Kokoro and Web Speech.

**Design decisions:**
- **Plain-text replacements, not SSML:** This sprint ships ordered phrase replacements (`from` -> `to`) only. No IPA, no phoneme editor, no markup language.
- **Global foundation first:** Store one global override list in settings. Per-book/profile overrides can come later if this proves valuable.
- **Apply before chunking/cache lookup:** Kokoro generation and cache identity must reflect override output so cached audio is never reused for pre-override text.
- **Previewable and reversible:** Users can add/remove overrides in settings and test them on sample text without needing to start narration in a book.

**Baseline:**
- `src/components/settings/SpeedReadingSettings.tsx` — existing Narrate settings surface
- `src/types.ts` / `src/constants.ts` — settings model/defaults
- `src/hooks/useNarration.ts` — narration entry point
- `src/hooks/narration/kokoroStrategy.ts` and generation pipeline/cache path — Kokoro synthesis + cache identity
- `src/hooks/narration/webSpeechStrategy.ts` — fallback synthesis path
- `src/utils/ttsCache.ts` — cache identity/storage behavior

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/TTS-AUDIT-REVIEW.md` — pronunciation exceptions disposition
4. `ROADMAP.md` — this section
5. `src/types.ts`
6. `src/constants.ts`
7. `src/components/settings/SpeedReadingSettings.tsx`
8. `src/hooks/useNarration.ts`
9. `src/hooks/narration/kokoroStrategy.ts`
10. `src/hooks/narration/webSpeechStrategy.ts`
11. `src/utils/ttsCache.ts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Settings model for pronunciation overrides** — Add a persisted global override list to settings with a compact shape such as `{ id, from, to, enabled }[]`. Define defaults, migration, and validation limits. | `src/types.ts`, `src/constants.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Settings UI** — Add a lightweight pronunciation editor to Narrate settings. Users must be able to add, edit, delete, enable/disable, and reorder overrides. Include a short sample-text preview/test action. | `src/components/settings/SpeedReadingSettings.tsx`, styles as needed |
| 3 | Primary CLI (renderer-fixer scope) | **Shared text-normalization helper** — Create one helper that applies enabled overrides in order and can be used by both engines. Keep it deterministic and easy to test. | `src/utils/` and narration consumers as needed |
| 4 | Primary CLI (renderer-fixer scope) | **Apply overrides to Web Speech** — Ensure the spoken utterance uses normalized text while word-position bookkeeping stays understandable and documented. | `src/hooks/useNarration.ts`, `src/hooks/narration/webSpeechStrategy.ts` as needed |
| 5 | Primary CLI (renderer-fixer scope / electron-fixer scope if needed) | **Apply overrides to Kokoro cache/generation path** — Make Kokoro generation use normalized text and ensure cache identity changes when the active override set changes, so stale cached audio is never reused after an override edit. | `src/hooks/narration/kokoroStrategy.ts`, `src/utils/ttsCache.ts`, cache metadata helpers as needed |
| 6 | test-runner | **Tests** — Cover ordered replacement behavior, enable/disable, preview action, Kokoro cache segregation when overrides change, and Web Speech normalized-text usage. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | quality-reviewer | **Architecture + code quality review** | — |
| 10 | doc-keeper | **Documentation pass** — Update technical reference/privacy wording if override storage or cache identity changes meaningfully. | `ROADMAP.md`, `docs/governance/TECHNICAL_REFERENCE.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Users can manage a persisted global pronunciation override list in settings
2. Overrides can be enabled/disabled and reordered without restarting the app
3. A sample preview/test action exists in settings
4. Web Speech uses normalized text produced by the shared helper
5. Kokoro generation uses normalized text before chunking/cache lookup
6. Editing the override set cannot cause stale Kokoro cached audio to be reused
7. The feature ships without adding SSML or phoneme-editing complexity
8. New tests cover override application and cache behavior
9. `npm test` passes
10. `npm run build` succeeds

---

### Sprint TTS-6F: Word Alignment & Narration Telemetry ✅ COMPLETED (v1.17.0, 2026-04-04)

> Implemented and merged to `main`. 12 new tests (1,088 total, 55 files). Added `computeWordWeights()` token-length weighting with punctuation boosts, scheduler weighted boundary distribution, and DEV-gated/test-inspectable chunk timing telemetry. All 8 SUCCESS CRITERIA met.

**Goal:** Improve narration highlight fidelity by adding measurable alignment telemetry and a better per-word timing model, without depending on unsupported Kokoro alignment metadata.

**Problem:** `TTS-6C` fixed the obvious rate/pitch problem, but highlight timing is still only as good as the scheduler's current chunk timing assumptions. We do not yet have lightweight instrumentation to understand drift, and future pronunciation work will make timing quality more visible. This sprint turns alignment from "looks okay" into something measurable and intentionally tuned.

**Design decisions:**
- **Measure before tuning:** Ship alignment telemetry and debug instrumentation first, then improve the timing heuristic in the same sprint using those measurements.
- **Scheduler stays authoritative:** Do not replace the current scheduler architecture. Improve its word-boundary estimation inputs.
- **Heuristic, not phoneme-level:** Use punctuation-aware and token-length-aware timing estimates rather than waiting for full model alignment output.
- **Debuggable but quiet in production:** Telemetry should support tests/dev diagnostics without spamming normal-user logs.

**Baseline:**
- `src/utils/audioScheduler.ts` — current word/highlight timing
- `src/utils/generationPipeline.ts` — chunk metadata assembly
- `src/hooks/narration/kokoroStrategy.ts` — scheduler + pipeline wiring
- `src/components/ReaderContainer.tsx` / narration highlight consumers
- current narration tests covering timing/highlighting

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/TTS-AUDIT-REVIEW.md` — word alignment improvement + latency instrumentation items
4. `ROADMAP.md` — this section
5. `src/utils/audioScheduler.ts`
6. `src/utils/generationPipeline.ts`
7. `src/hooks/narration/kokoroStrategy.ts`
8. narration highlight consumers/tests

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Alignment telemetry surface** — Add dev/test-safe instrumentation for chunk start latency, per-chunk highlight drift estimates, and scheduler boundary diagnostics. Keep it behind existing dev/test logging patterns or explicit debug flags. | `src/utils/audioScheduler.ts`, related helpers |
| 2 | Primary CLI (renderer-fixer scope) | **Richer chunk timing metadata** — Extend generation/pipeline metadata so the scheduler receives enough information to estimate boundaries with more than flat even spacing. | `src/utils/generationPipeline.ts`, type surfaces as needed |
| 3 | Primary CLI (renderer-fixer scope) | **Improved word timing heuristic** — Replace flat per-word distribution with a punctuation-aware/token-length-aware model that better matches natural speech timing while preserving current chunk-boundary behavior. | `src/utils/audioScheduler.ts` |
| 4 | Primary CLI (renderer-fixer scope) | **Non-regression integration** — Ensure the improved heuristic still works with native rate buckets, punctuation shaping, and section transitions. | scheduler/pipeline consumers as needed |
| 5 | test-runner | **Tests** — Add focused tests for telemetry emission, heuristic timing output, punctuation weighting, and highlight stability across `1.0x`, `1.2x`, and `1.5x`. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | quality-reviewer | **Architecture + code quality review** | — |
| 9 | doc-keeper | **Documentation pass** — Record the new timing model and any debug/telemetry hooks in the technical reference and lessons learned if a new guardrail emerges. | `ROADMAP.md`, `docs/governance/TECHNICAL_REFERENCE.md`, `docs/governance/LESSONS_LEARNED.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Narration timing instrumentation exists for tests/dev diagnostics without noisy production logging
2. Scheduler receives richer timing metadata than flat chunk duration alone
3. Per-word highlight timing uses a punctuation-aware/token-length-aware heuristic
4. Highlight timing remains stable across Kokoro `1.0x`, `1.2x`, and `1.5x`
5. Existing punctuation shaping and section transitions do not regress
6. New tests cover telemetry and timing heuristics
7. `npm test` passes
8. `npm run build` succeeds

---

### Sprint TTS-6G: Narration Controls & Accessibility Polish ✅ COMPLETED (v1.18.0, 2026-04-04)

> Implemented and merged to `main`. 8 new tests (1,096 tot
