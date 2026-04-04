# Blurby — Development Roadmap

**Last updated**: 2026-04-04 — Post-TTS-6M (Narration Portability & Reset Safety). 1,141 tests, 61 files. Latest tagged release: v1.23.0.
**Current branch**: `main`
**Current state**: Phase 6 in progress (TTS-6M complete). Queue RED (TTS-6N only; depth 1 — backfill urgent).
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
  └── TTS-6N: Narration Runtime Stability & Extraction Sync (queued)
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

**Goal:** Finish the post-`TTS-6C` narration lane before dispatching the larger app-polish themes. Immediate priority is Kokoro startup/recovery hardening, then pronunciation control, then highlight/alignment quality. `EINK-6A` and `GOALS-6B` remain drafted below, but they are not the active dispatch lane yet.

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

> Implemented and merged to `main`. 8 new tests (1,096 total, 56 files). Added Kokoro bucket buttons in the bottom bar, resolved `BUG-053`, and tightened engine-aware aria labels / narration control semantics. This sprint completed the control/accessibility work only; the later docs-closure idea was not executed as a standalone sprint.

**Goal:** Finish the remaining day-to-day Narrate mode control polish so keyboard, bottom-bar controls, and settings all express the same engine-aware rate semantics and remain understandable while Kokoro/Web Speech differ underneath.

**Problem:** The core Kokoro lane is now reliable, but the control surface still had one obvious gap and a few consistency risks. `BUG-053` was open: in Narration mode, keyboard speed controls adjusted WPM instead of TTS rate. More broadly, the reader bottom bar, keyboard shortcuts, and settings needed one shared control contract so Kokoro buckets and Web Speech continuous rate behave predictably and accessibly.

**Design decisions:**
- **Engine-aware control semantics:** In Narration mode, Kokoro steps among `1.0x`, `1.2x`, `1.5x`; Web Speech steps in `0.1` increments. Non-narration modes keep WPM behavior.
- **Single rate-control path:** Keyboard shortcuts, reader controls, and settings route through the same engine-aware stepping/resolution helpers rather than re-implementing logic in multiple places.
- **Readable affordances:** The active control clearly communicates whether the user is adjusting WPM or TTS rate, and for Kokoro it shows the discrete bucket model instead of implying fine-grained values.
- **Accessibility first:** Keyboard interactions, aria labels, and visible hints make the engine-specific behavior discoverable without extra docs.

**Baseline:**
- `src/hooks/useKeyboardShortcuts.ts` — mode-aware arrow key handling
- `src/components/ReaderContainer.tsx` — narration rate updates + keyboard wiring
- `src/components/ReaderBottomBar.tsx` — mode-specific slider/label behavior
- `src/components/settings/SpeedReadingSettings.tsx` — engine/rate controls in settings
- `src/constants.ts` — Kokoro bucket helpers and Web Speech rate constants
- `docs/governance/BUG_REPORT.md` — `BUG-053`

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — `BUG-053`
4. `ROADMAP.md` — this section
5. `src/constants.ts`
6. `src/hooks/useKeyboardShortcuts.ts`
7. `src/components/ReaderContainer.tsx`
8. `src/components/ReaderBottomBar.tsx`
9. `src/components/settings/SpeedReadingSettings.tsx`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Unify narration-rate stepping helpers** — Make one engine-aware helper path for rate step up/down and display resolution so keyboard, bottom bar, and settings share the same behavior. Reuse existing Kokoro bucket helpers where appropriate. | `src/constants.ts`, shared helper location as needed |
| 2 | Primary CLI (renderer-fixer scope) | **Fix `BUG-053` keyboard behavior** — In Narration mode, Up/Down arrows adjust TTS rate instead of WPM. Kokoro snaps bucket-to-bucket; Web Speech uses `0.1` increments. Non-narration modes keep current WPM semantics. | `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderContainer.tsx` |
| 3 | Primary CLI (renderer-fixer scope) | **Reader bottom bar clarity** — Make the bottom bar label/value/hint clearly reflect whether the control is WPM or TTS rate. For Kokoro, emphasize the three discrete buckets rather than implying continuous precision. | `src/components/ReaderBottomBar.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Settings consistency pass** — Ensure Narrate settings describe Kokoro bucket behavior versus Web Speech continuous rate in plain language and stay visually synchronized with in-reader changes. | `src/components/settings/SpeedReadingSettings.tsx` |
| 5 | Primary CLI (renderer-fixer scope) | **Accessibility polish** — Add/update aria labels, keyboard hints, and any lightweight helper text needed so the narration control semantics are discoverable and testable. | `src/components/ReaderBottomBar.tsx`, `src/components/settings/SpeedReadingSettings.tsx` |
| 6 | test-runner | **Tests** — Cover: narration-mode arrow keys affect rate not WPM, Kokoro keyboard stepping snaps between three buckets, Web Speech uses `0.1` increments, bottom bar label switches correctly between WPM/rate semantics, and settings/reader stay synchronized after keyboard changes. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | quality-reviewer | **Architecture + code quality review** | — |
| 10 | doc-keeper | **Documentation pass** — Mark `BUG-053` resolved if the new control behavior is fully shipped and update reference docs if control semantics changed materially. | `ROADMAP.md`, `docs/governance/BUG_REPORT.md`, `docs/governance/TECHNICAL_REFERENCE.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `BUG-053` is resolved: Narration-mode arrow keys adjust TTS rate instead of WPM
2. Kokoro keyboard stepping moves only among `1.0x`, `1.2x`, and `1.5x`
3. Web Speech keyboard stepping uses `0.1` increments and keeps its existing continuous model
4. Non-narration reading modes keep current WPM keyboard behavior
5. Reader bottom bar clearly communicates whether the active control is WPM or TTS rate
6. Settings text and in-reader controls stay synchronized for both engines
7. Control semantics are accessible via labels/hints and do not rely on hidden assumptions
8. New tests cover keyboard stepping and control-surface synchronization
9. `npm test` passes
10. `npm run build` succeeds

---

### Sprint TTS-6I: Per-Book Pronunciation Profiles ✅ COMPLETED (v1.19.0, 2026-04-04)

> Implemented and merged to `main`. 11 new tests (1,107 total, 57 files). Added per-book `pronunciationOverrides` storage on `BlurbyDoc`, layered merge resolution, global/this-book editing scope toggle, separate narration hook setters, effective merged preview behavior, and book-aware override-hash cache identity. All 9 SUCCESS CRITERIA met.

**Goal:** Extend the global pronunciation override system so users can keep book-specific name/term pronunciations without polluting every other title in the library.

**Problem:** `TTS-6E` shipped the right foundation, but a single global override list will become noisy once users read books with conflicting names, jargon, or pronunciation conventions. A fantasy novel, technical manual, and biography should not all share the same override surface by default. The next natural step is scoped pronunciation profiles that build on the existing override pipeline and cache identity rules.

**Design decisions:**
- **Global + book override layering:** Keep the current global list as the default base. Add an optional per-book override list that applies after global overrides for the active book only.
- **Same override shape, no new phoneme system:** Reuse the existing plain-text override model and editor behaviors. This sprint is about scoping, not inventing a richer pronunciation language.
- **Book-aware cache identity:** Kokoro cache identity must distinguish different effective override sets per book so book-specific audio never reuses global-only or wrong-book cached chunks.
- **Manageable UX:** Users should edit book-specific overrides from the reader/settings context of the current book, not from a giant library-wide manager.

**Baseline:**
- `src/types.ts` / `src/constants.ts` — global pronunciation override settings
- `src/components/settings/SpeedReadingSettings.tsx` — current override editor
- `src/hooks/useNarration.ts` — active-book narration context
- `src/hooks/narration/kokoroStrategy.ts` / `src/utils/ttsCache.ts` — generation + cache identity
- current override helper/tests from `TTS-6E`

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — `TTS-6E` plus this section
4. `src/types.ts`
5. `src/constants.ts`
6. `src/components/settings/SpeedReadingSettings.tsx`
7. `src/hooks/useNarration.ts`
8. `src/hooks/narration/kokoroStrategy.ts`
9. `src/utils/ttsCache.ts`
10. tests covering `TTS-6E` override behavior

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Settings/data model extension** — Add optional per-book pronunciation overrides keyed by book identity while preserving the existing global override list and migration behavior. | `src/types.ts`, `src/constants.ts`, persistence surface as needed |
| 2 | Primary CLI (renderer-fixer scope) | **Effective override resolver** — Create one resolver that merges global overrides with current-book overrides in the correct order and returns the effective list for narration and preview. | shared helper / narration consumers |
| 3 | Primary CLI (renderer-fixer scope) | **Current-book editing UX** — Add a scoped editor entry point for the active book so users can manage book-specific overrides without leaving the familiar override workflow. | `src/components/settings/SpeedReadingSettings.tsx`, reader/settings wiring as needed |
| 4 | Primary CLI (renderer-fixer scope / electron-fixer scope if needed) | **Book-aware Kokoro cache identity** — Ensure effective per-book override state participates in cache identity so stale or cross-book audio cannot be reused. | `src/hooks/narration/kokoroStrategy.ts`, `src/utils/ttsCache.ts` |
| 5 | Primary CLI (renderer-fixer scope) | **Preview + fallback parity** — Make preview and Web Speech use the same effective merged override set as Kokoro. | preview helper / narration consumers |
| 6 | test-runner | **Tests** — Cover merge precedence, current-book isolation, cache segregation across books with different override sets, and preview parity with effective overrides. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | quality-reviewer | **Architecture + code quality review** | — |
| 10 | doc-keeper | **Documentation pass** — Update roadmap/technical reference if cache identity or settings shape changed materially. | `ROADMAP.md`, `docs/governance/TECHNICAL_REFERENCE.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Users can keep global overrides and optional current-book overrides separately
2. Effective narration text uses the merged override set in a deterministic order
3. Book-specific overrides do not leak into other books
4. Kokoro cache identity distinguishes different effective override sets across books
5. Preview, Web Speech, and Kokoro all use the same effective override logic
6. Existing global-override behavior remains intact for users who never use book-specific overrides
7. New tests cover precedence, isolation, and cache behavior
8. `npm test` passes
9. `npm run build` succeeds

---

### Sprint TTS-6J: Voice Selection & Persona Consistency ✅ COMPLETED (v1.20.0, 2026-04-04)

> Implemented and merged to `main`. 1,115 total tests across 58 files. Added `src/utils/voiceSelection.ts` with explicit `en-US` -> `en-GB` -> `en-*` -> first-voice fallback priority, refactored `useNarration.ts` to use the shared selector, updated technical reference voice tables from gender buckets to accent/persona terminology, and documented Web Speech fallback behavior. All 7 SUCCESS CRITERIA met.

**Goal:** Finish the remaining voice-selection polish so Kokoro labels, Web Speech fallback choice, and voice-facing documentation all feel intentional and consistent instead of leftover defaults.

**Problem:** Even after the big TTS fixes, the voice surface still has a few low-level inconsistencies that are better handled together than as one-off cleanup. The audit called out two real issues: Web Speech should prefer `en-US`, then `en-GB`, then `en-*`, and voice labels/docs should avoid stale gendered groupings or contradictory terminology. This is a good larger follow-on because it touches settings, fallback behavior, and documentation in one pass.

**Design decisions:**
- **Consistent voice language priority:** Web Speech fallback should always prefer `en-US`, then `en-GB`, then other English voices.
- **Persona labels, not gender buckets:** UI and docs should present voice names plus accent/descriptor, matching the shipped Kokoro labels rather than older grouped terminology.
- **Current architecture, no locale feature creep:** This sprint does not add multilingual support, locale selection, or BCP-47 mapping UI. It just makes the English-only voice story consistent and polished.
- **Settings parity:** Voice selection UI, fallback defaults, and docs should describe the same mental model.

**Baseline:**
- `src/constants.ts` — current Kokoro voice labels
- `src/hooks/useNarration.ts` — Web Speech voice selection priority
- `src/components/settings/SpeedReadingSettings.tsx` — voice selection UI
- `docs/governance/TECHNICAL_REFERENCE.md` — voice tables and terminology
- `docs/governance/TTS-AUDIT-REVIEW.md` — A8/A9 findings

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/TTS-AUDIT-REVIEW.md` — A8/A9
4. `ROADMAP.md` — this section
5. `src/constants.ts`
6. `src/hooks/useNarration.ts`
7. `src/components/settings/SpeedReadingSettings.tsx`
8. `docs/governance/TECHNICAL_REFERENCE.md`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Web Speech priority hardening** — Ensure fallback voice selection prefers `en-US`, then `en-GB`, then any `en-*`, with stable behavior when voices load asynchronously. | `src/hooks/useNarration.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Voice settings polish** — Align voice labels and any helper text in settings with the accent/persona model already used by Kokoro labels. | `src/components/settings/SpeedReadingSettings.tsx`, `src/constants.ts` if needed |
| 3 | Primary CLI (governance-doc scope) | **Technical reference voice cleanup** — Replace stale grouped terminology in docs with current voice-name/accent language and document fallback selection behavior plainly. | `docs/governance/TECHNICAL_REFERENCE.md` |
| 4 | test-runner | **Tests** — Cover Web Speech voice-priority selection and any UI-facing label assumptions that are now contractually important. | `tests/` |
| 5 | test-runner | **`npm test` + `npm run build`** | — |
| 6 | spec-compliance-reviewer | **Spec compliance** | — |
| 7 | quality-reviewer | **Architecture + code quality review** | — |
| 8 | doc-keeper | **Documentation pass** — Ensure roadmap, queue, and technical reference all describe the voice system consistently after the sprint. | `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `docs/governance/TECHNICAL_REFERENCE.md`, `CLAUDE.md` |
| 9 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Web Speech default voice selection prefers `en-US`, then `en-GB`, then any `en-*`
2. Voice selection remains stable when voices load asynchronously
3. Settings and docs describe voices using the same accent/persona terminology
4. No stale gender-bucket language remains in the current voice-facing docs/UI
5. New tests cover fallback voice-priority behavior
6. `npm test` passes
7. `npm run build` succeeds

---

### Sprint TTS-6K: Narration Personalization & Quality Sweep

**Goal:** Deliver the next bigger TTS block by combining the remaining personalization polish and repo-truth cleanup into one substantial sprint instead of scattering them across tiny follow-ups.

**Problem:** After `TTS-6J`, the TTS lane still has one class of work that matters to users and maintainers at the same time: personalization should feel coherent across controls, overrides, and voices, and the long-form docs should finally reflect the shipped Narrate mode reality. We do not need more tiny cleanup tickets; we need one deliberate pass that makes the feature feel finished.

**Design decisions:**
- **One personalization sweep:** Treat current-book overrides, voice consistency, and narration-facing docs as one “make this feel complete” block.
- **Docs ride with product truth:** This sprint explicitly includes the remaining privacy/data-flow, SSML stance, safety posture, glossary, and lessons-learned updates if they are still stale after `TTS-6J`.
- **No new speech markup system:** Stay with the existing plain-text override model and shipped control semantics. This is polish and coherence, not a new TTS substrate.
- **Ship the user-facing story, not just the code paths:** The result should leave settings, reader controls, fallback behavior, and governance docs describing the same product.

**Baseline:**
- `TTS-6I` and `TTS-6J` outputs
- `src/components/settings/SpeedReadingSettings.tsx`
- `src/components/ReaderBottomBar.tsx`
- `src/hooks/useNarration.ts`
- `docs/governance/TECHNICAL_REFERENCE.md`
- `docs/governance/LESSONS_LEARNED.md`
- `docs/governance/BUG_REPORT.md`

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — `TTS-6I`, `TTS-6J`, and this section
4. `docs/governance/TECHNICAL_REFERENCE.md`
5. `docs/governance/TTS-AUDIT-REVIEW.md`
6. active TTS UI / settings / narration files touched by `TTS-6I` and `TTS-6J`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Narration personalization consistency pass** — Ensure current-book overrides, voice selection, and narration controls present a coherent user-facing model in settings and reader surfaces. | TTS UI/settings/narration files as needed |
| 2 | Primary CLI (governance-doc scope) | **Narrate mode reference closure** — Update technical reference sections for privacy/data flow, SSML stance, safety posture, glossary, override scoping, and voice-selection behavior so they describe the shipped system exactly. | `docs/governance/TECHNICAL_REFERENCE.md` |
| 3 | Primary CLI (governance-doc scope) | **Lessons learned / bug closure sweep** — Capture the durable TTS guardrails and close or reword any remaining stale TTS bug/doc references. | `docs/governance/LESSONS_LEARNED.md`, `docs/governance/BUG_REPORT.md` |
| 4 | test-runner | **Tests** — Add or extend tests only where the consolidation changes actual behavior or locks in a new user-facing contract. | `tests/` if needed |
| 5 | test-runner | **`npm test` + `npm run build`** | — |
| 6 | spec-compliance-reviewer | **Spec compliance** | — |
| 7 | quality-reviewer | **Architecture + code quality review** | — |
| 8 | doc-keeper | **Documentation pass** — Ensure roadmap, queue, CLAUDE, technical reference, bug report, and lessons learned are all aligned after the sweep. | governing docs |
| 9 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Narration settings/controls/voice surfaces describe one coherent personalization model
2. Remaining Narrate-mode privacy/data-flow and SSML/safety docs are current
3. TTS glossary/terminology in governance docs matches shipped behavior
4. Stale TTS bug/doc references are removed or reworded accurately
5. Any new user-facing behavior is covered by tests
6. `npm test` passes
7. `npm run build` succeeds

---

### Sprint TTS-6L: Narration Profiles & Sharing Foundations

**Goal:** Turn the growing narration customization surface into a reusable profile system so voice, rate, and override choices can be saved as named listening setups instead of being managed as scattered individual settings.

**Problem:** By the time `TTS-6K` lands, Narrate mode will have native rate buckets, global overrides, book-specific overrides, fallback voice behavior, and polished controls. That is enough power that users will start wanting reusable combinations. Right now the system is expressive but not portable: there is no clean way to save “Technical Book Voice,” “Fiction Voice,” or “Fast Review” as named presets. This is the next bigger block that builds naturally on the personalization lane.

**Design decisions:**
- **Named narration profiles:** Profiles are user-created presets that bundle the narrator-facing settings we already support, rather than introducing a new speech engine capability.
- **Profiles reference current primitives:** Reuse existing voice IDs, rate values, and override structures instead of inventing another config layer.
- **Book assignment stays lightweight:** A book may optionally point to a preferred narration profile, but global/default behavior must still work when no profile is chosen.
- **Future-sharing friendly:** The data model should be export/import-ready, even if explicit cross-device sync or marketplace sharing is not part of this sprint.

**Baseline:**
- `TTS-6E` / `TTS-6I` pronunciation override systems
- `TTS-6J` voice selection consistency output
- `src/types.ts` / `src/constants.ts`
- `src/components/settings/SpeedReadingSettings.tsx`
- `src/hooks/useNarration.ts`
- any persisted book-level narration metadata already present

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — `TTS-6E`, `TTS-6I`, `TTS-6J`, `TTS-6K`, and this section
4. `src/types.ts`
5. `src/constants.ts`
6. `src/components/settings/SpeedReadingSettings.tsx`
7. `src/hooks/useNarration.ts`
8. book/settings persistence surfaces touched by narration preferences

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Narration profile data model** — Add named profile storage for narration settings, including sane defaults/migration and a clear active/default profile concept. | `src/types.ts`, `src/constants.ts`, persistence surface as needed |
| 2 | Primary CLI (renderer-fixer scope) | **Settings profile manager** — Add create/rename/delete/select flows for narration profiles in settings without making the TTS settings page unwieldy. | `src/components/settings/SpeedReadingSettings.tsx`, supporting components/styles as needed |
| 3 | Primary CLI (renderer-fixer scope) | **Profile application path** — Make narration startup apply the effective selected profile cleanly, including voice/rate/override-related settings that are already part of the shipped system. | `src/hooks/useNarration.ts`, related narration consumers |
| 4 | Primary CLI (renderer-fixer scope / electron-fixer scope if needed) | **Optional book profile assignment** — Allow a book to remember a preferred narration profile without breaking current behavior for books with no assignment. | book metadata / persistence surfaces as needed |
| 5 | Primary CLI (renderer-fixer scope) | **Export/import-ready structure** — Ensure the profile shape is explicit and stable enough for future export/import, and if low-cost, add a minimal local export/import path. | settings/profile surfaces as needed |
| 6 | test-runner | **Tests** — Cover profile creation, selection, application, deletion safety, and optional book assignment behavior. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | quality-reviewer | **Architecture + code quality review** | — |
| 10 | doc-keeper | **Documentation pass** — Update roadmap/reference docs if the narration settings model materially changes. | governing docs |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Users can create, rename, delete, and select named narration profiles
2. Narration startup applies the selected profile consistently
3. Existing users retain sensible defaults without needing to create profiles
4. Optional book-level profile assignment works without leaking settings between books
5. Profile storage is explicit and future export/import friendly
6. New tests cover profile lifecycle and application behavior
7. `npm test` passes
8. `npm run build` succeeds

---

### Sprint TTS-6M: Narration Portability & Reset Safety

**Goal:** Finish the next bigger narration block by making the growing profile and override system portable, recoverable, and safe to edit at scale.

**Problem:** After `TTS-6L`, Narrate mode will likely have named profiles, book-level assignments, global overrides, and book-specific overrides. That is enough user-authored state that people will eventually want clean backup, import, export, and reset flows. Without that layer, the system becomes powerful but fragile: users can customize deeply, but they cannot confidently move, restore, or selectively clean up their narration setup.

**Design decisions:**
- **Narration-only portability first:** Keep export/import scoped to narration data instead of trying to solve all-settings migration here.
- **Granular resets, not scorched earth:** Users should be able to reset a profile, a book assignment, or override scopes without deleting unrelated narration work.
- **Validate before mutate:** Imports should report conflicts, unsupported versions, or invalid entries before writing anything into active state.
- **No silent destructive behavior:** Backup, restore, and reset flows must preview impact and require explicit confirmation in-product.

**Baseline:**
- `TTS-6E`, `TTS-6I`, and `TTS-6L` narration data structures
- `src/components/settings/SpeedReadingSettings.tsx`
- narration/profile persistence surfaces introduced by the earlier TTS sprints
- `docs/governance/TECHNICAL_REFERENCE.md`
- `docs/governance/LESSONS_LEARNED.md`

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — `TTS-6E`, `TTS-6I`, `TTS-6L`, and this section
4. narration settings/profile persistence files
5. `src/components/settings/SpeedReadingSettings.tsx`
6. `docs/governance/TECHNICAL_REFERENCE.md`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Narration export/import model** — Define a stable narration-only payload covering profiles, global overrides, optional book-level override/profile assignments, and schema/version metadata. | persistence/type surfaces as needed |
| 2 | Primary CLI (renderer-fixer scope / electron-fixer scope if needed) | **Settings import/export flow** — Add a user-facing narration export/import workflow with validation, preview, and safe application semantics. | settings + persistence surfaces |
| 3 | Primary CLI (renderer-fixer scope) | **Granular reset actions** — Add explicit reset/clear actions for profile assignments and override scopes so users can recover from over-customization without wiping everything. | settings/narration surfaces |
| 4 | Primary CLI (governance-doc scope) | **Portability policy/docs pass** — Document exactly what narration data is portable, what is not, and how reset/import semantics work. | `docs/governance/TECHNICAL_REFERENCE.md`, related docs |
| 5 | test-runner | **Tests** — Cover payload validation, import conflict handling, reset safety, and non-destructive failure cases. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | quality-reviewer | **Architecture + code quality review** | — |
| 9 | doc-keeper | **Documentation pass** — Align roadmap, queue, CLAUDE, lessons learned, and technical reference with the shipped portability/reset model. | governing docs |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Narration data can be exported/imported through an explicit user-facing workflow
2. Imports validate payload shape/version before mutating active narration settings
3. Users can reset targeted narration state without wiping unrelated preferences
4. Failed imports or invalid payloads do not partially corrupt narration data
5. Portability/reset behavior is documented clearly in governance/reference docs
6. New tests cover import/export/reset safety
7. `npm test` passes
8. `npm run build` succeeds

---

### Sprint TTS-6N: Narration Runtime Stability & Extraction Sync

**Goal:** Make Narrate mode stable under real interactive use by fixing hook-order crashes, eliminating mid-play extraction restarts, and reducing renderer-thread blocking during live Kokoro sessions.

**Problem:** Post-`TTS-6K` manual testing shows Narrate is still fragile in ways that are more serious than polish. Three concrete issues are now confirmed. First, `useNarration.ts` can crash with `ReferenceError: Cannot access 'speakNextChunk' before initialization`, which points to a hook-order / temporal-dead-zone bug in the Kokoro auto-start path. Second, HOTFIX-6 full-book extraction can complete after narration has already started and then force `narration.updateWords(...)`, producing visible restart behavior and cursor jumps mid-play. Third, the renderer is still doing enough work during Narrate that DevTools reports repeated long `message`, `keydown`, `setTimeout`, and forced-reflow violations. This sprint is the runtime-hardening pass that should have Narrate feel dependable before more feature depth is added.

**Design decisions:**
- **Runtime correctness before more customization:** Stable playback, stable cursor position, and no hard crashes take precedence over additional Narrate features.
- **No mid-play extraction restarts:** Once Narrate has started, late-arriving full-book extraction must not visibly reset playback unless an explicit handoff contract guarantees seamless continuation.
- **Hook-order safety as a rule:** `useNarration` should not rely on callbacks before initialization; use refs or declaration order that is robust under React render/HMR behavior.
- **Reduce live DOM churn:** Rewrapping/restamping large foliate sections during active narration should be minimized, deferred, or made non-disruptive.

**Baseline:**
- `src/hooks/useNarration.ts`
- `src/components/ReaderContainer.tsx`
- `src/modes/NarrateMode.ts`
- `src/utils/audioScheduler.ts`
- HOTFIX-6 / HOTFIX-10 extraction and section-stamping paths
- manual dev logs showing TDZ crash, restart at global index handoff, and repeated long main-thread violations

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — `TTS-6K` and this section
4. `src/hooks/useNarration.ts`
5. `src/components/ReaderContainer.tsx`
6. `src/modes/NarrateMode.ts`
7. `src/utils/audioScheduler.ts`
8. HOTFIX-6 / HOTFIX-10 related tests and extraction helpers

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Fix `useNarration` initialization crash** — Remove the temporal-dead-zone / hook-order hazard around `speakNextChunk` and any similar callback dependencies so Narrate survives fresh render and HMR cycles. | `src/hooks/useNarration.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Stabilize full-book extraction handoff** — Rework HOTFIX-6 narration handoff so late extraction completion does not visibly restart or jump active narration from the user’s perspective. If a handoff is still needed, it must preserve effective position and avoid duplicate chunk starts. | `src/components/ReaderContainer.tsx`, narration handoff helpers |
| 3 | Primary CLI (renderer-fixer scope) | **Clamp Kokoro runtime rate semantics at the mode boundary** — Ensure active Kokoro narration state is normalized to supported buckets before mode start / restart paths, so continuous-rate leakage does not survive in the runtime layer. | `src/modes/NarrateMode.ts`, related helpers |
| 4 | Primary CLI (renderer-fixer scope) | **Reduce active narration renderer churn** — Audit section restamping, DOM rewrites, and any expensive sync work performed during live narration. Defer, batch, or guard it so the renderer stops stalling on ordinary Narrate use. | `src/components/ReaderContainer.tsx`, `src/utils/audioScheduler.ts`, related readers |
| 5 | test-runner | **Tests** — Add coverage for: no TDZ crash on Kokoro warm/ready auto-start path, no visible playback restart when full-book extraction completes mid-session, Kokoro runtime rate normalization, and non-regression around section-boundary navigation. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | quality-reviewer | **Architecture + code quality review** | — |
| 9 | doc-keeper | **Documentation pass** — Record the runtime guardrails and any updated Narrate handoff model in roadmap, queue, technical reference, and lessons learned. | governing docs |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Narrate no longer throws `Cannot access 'speakNextChunk' before initialization`
2. Electron dev session remains alive through Narrate start and HMR retest
3. HOTFIX-6 full-book extraction no longer causes a visible mid-play restart/jump
4. Kokoro runtime state uses supported bucket semantics on active start/restart paths
5. Main-thread violations during ordinary Narrate interaction are materially reduced
6. New tests cover crash prevention and extraction-handoff stability
7. `npm test` passes
8. `npm run build` succeeds

---

### Drafted Later Work (Not In Queue Yet)

`EINK-6A` and `GOALS-6B` remain drafted below for later phases, but they are intentionally not the next dispatches while the TTS lane is still active.

---

### Sprint EINK-6A: E-ink as Independent Display Mode

**Goal:** E-ink behavior (no animations, phrase grouping, WPM ceiling, ghosting refresh) becomes a toggle independent of the visual theme. Currently `theme: "eink"` is a theme — you lose dark/light theming to get e-ink behavior. After this sprint, any theme + e-ink mode works.

**Problem:** E-ink is bundled as `theme: "eink"` in the theme selector. All e-ink CSS is under `[data-theme="eink"]`. The `useEinkController` hook checks `settings.theme === "eink"`. Users with actual e-ink displays want the behavioral optimizations (no CSS transitions, large touch targets, periodic refresh, phrase grouping, WPM ceiling) but also want to pick their preferred color scheme.

**Design decisions:**
- **New boolean setting `einkMode`** — Independent of `theme`. When true, activates all e-ink behavioral optimizations regardless of theme.
- **CSS attribute `[data-eink="true"]`** — Applied to root alongside `[data-theme]`. E-ink behavioral styles (no transitions, large targets) move from `[data-theme="eink"]` to `[data-eink="true"]`. E-ink color palette stays as `[data-theme="eink"]` for users who want the visual look.
- **Theme "eink" becomes "eink" color scheme only** — Sets e-ink colors (warm gray background). Automatically enables `einkMode` for backward compatibility. Other themes don't set einkMode by default.
- **useEinkController** checks `settings.einkMode` instead of `settings.theme === "eink"`.
- **Settings UI** — E-ink toggle in Theme settings, below theme selector. "E-ink Display Mode" on/off. When on, shows sub-settings (phrase grouping, WPM ceiling, refresh interval) regardless of theme. Moving these out of theme-conditional rendering.

**Baseline:**
- `src/types.ts` — `theme: "dark" | "light" | "blurby" | "eink" | "system"`, plus `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`
- `src/hooks/useEinkController.ts` (42 lines) — Checks `settings.theme === "eink"`
- `src/styles/global.css` — `[data-theme="eink"]` rules (~50 selectors)
- `src/components/settings/ThemeSettings.tsx` — E-ink sub-settings only visible when theme="eink"
- `main/window-manager.js` — `getThemeColors()` has eink case

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — BlurbySettings interface (theme, eink* fields)
5. `src/hooks/useEinkController.ts` — current eink check (42 lines)
6. `src/styles/global.css` — `[data-theme="eink"]` selectors
7. `src/components/settings/ThemeSettings.tsx` — theme selector, eink sub-settings
8. `src/constants.ts` — DEFAULT_SETTINGS (eink defaults)
9. `main/window-manager.js` — `getThemeColors()`, `updateWindowTheme()`
10. `src/components/App.tsx` — `data-theme` attribute application

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Add `einkMode` setting** — New boolean field in BlurbySettings. Default: `false`. Add to DEFAULT_SETTINGS. Migration: if `theme === "eink"`, set `einkMode: true` on load. | `src/types.ts`, `src/constants.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Split CSS: behavioral vs visual** — Audit all `[data-theme="eink"]` selectors in global.css. Move behavioral rules (no transitions, no animations, large touch targets, ghosting overlay) to `[data-eink="true"]`. Keep visual rules (colors, backgrounds, borders) under `[data-theme="eink"]`. | `src/styles/global.css` |
| 3 | Primary CLI (renderer-fixer scope) | **Apply `data-eink` attribute** — In App.tsx (or wherever `data-theme` is set on the root), also set `data-eink={settings.einkMode ? "true" : "false"}`. | `src/components/App.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Update useEinkController** — Check `settings.einkMode` instead of `settings.theme === "eink"`. | `src/hooks/useEinkController.ts` |
| 5 | Primary CLI (renderer-fixer scope) | **ThemeSettings: e-ink toggle** — Add "E-ink Display Mode" toggle below theme selector. Always visible regardless of theme. When toggled on, show sub-settings (phrase grouping, WPM ceiling, refresh interval). Remove conditional rendering that hid these when theme !== "eink". | `src/components/settings/ThemeSettings.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Backward compat: theme="eink" auto-enables** — When user selects "eink" theme, auto-set `einkMode: true`. When switching away from "eink" theme, keep `einkMode` as-is (user may want to keep it). | `src/components/settings/ThemeSettings.tsx` |
| 7 | Primary CLI (electron-fixer scope) | **Window manager: einkMode awareness** — `updateWindowTheme()` should apply e-ink behavioral optimizations (disable hardware acceleration hints if applicable) based on `einkMode`, not theme. Color-only theming still uses `getThemeColors()`. | `main/window-manager.js` |
| 8 | test-runner | **Tests** — (a) `einkMode: true` + `theme: "dark"` applies both dark colors AND eink behaviors, (b) `einkMode: false` + `theme: "eink"` auto-sets einkMode on migration, (c) useEinkController responds to `einkMode` not theme, (d) CSS `[data-eink="true"]` selectors exist in output, (e) ThemeSettings shows eink sub-settings regardless of theme when einkMode=true. ≥10 new tests. | `tests/` |
| 9 | test-runner | **`npm test` + `npm run build`** | — |
| 10 | spec-compliance-reviewer | **Spec compliance** | — |
| 11 | quality-reviewer | **Architecture + code quality review** | — |
| 12 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 13 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. New `einkMode` boolean setting, default false
2. `data-eink="true"` attribute on root element when einkMode enabled
3. E-ink behavioral CSS (no transitions, large targets, refresh overlay) applies via `[data-eink="true"]`, not `[data-theme="eink"]`
4. E-ink color CSS remains under `[data-theme="eink"]`
5. User can select `theme: "dark"` + `einkMode: true` and get dark colors with e-ink behaviors
6. useEinkController checks einkMode, not theme
7. ThemeSettings shows e-ink toggle and sub-settings regardless of selected theme
8. Selecting "eink" theme auto-enables einkMode (backward compat)
9. Migration: existing `theme: "eink"` users get `einkMode: true` on upgrade
10. ≥10 new tests
11. `npm test` passes (≥1,042 tests)
12. `npm run build` succeeds
13. No regressions to any reading mode or theme

---

### Sprint GOALS-6B: Reading Goal Tracking

**Goal:** Let users set daily and weekly reading goals (minutes or pages) with visual progress indicators in the library view. Build on existing reading stats infrastructure.

**Problem:** Blurby tracks reading history (sessions, duration, pages) but doesn't surface this as goals or streaks. Users have no way to set a daily reading target or see how they're progressing toward it. Reading habit formation is one of the highest-impact features for a reading app.

**Design decisions:**
- **Two goal types:** Daily minutes and weekly books/chapters. Minutes is the primary metric because it works across all content types and reading modes.
- **Goal progress widget** in LibraryContainer header area. Circular progress ring showing today's minutes vs goal. Secondary line: "3 of 5 days this week". Compact, non-intrusive.
- **Settings page** — New "Reading Goals" section in a dedicated settings sub-page. Daily target (15/30/45/60/90 min, custom), weekly target (optional), notifications (optional — toast on goal hit).
- **Stats from existing history.json** — Reading sessions already log start/end time and word counts. Derive minutes from session data. No new tracking infrastructure needed.
- **IPC for goal progress** — `get-goal-progress` returns `{todayMinutes, dailyGoal, weekDays, weeklyGoal, streakDays}`. Computed from history.json on each call.

**Baseline:**
- `main/ipc/misc.js` — Stats IPC handlers (reading history queries)
- `src/components/LibraryContainer.tsx` — Library header area
- `src/types.ts` — BlurbySettings (no goal fields yet)
- `src/constants.ts` — DEFAULT_SETTINGS
- History data in `history.json` with session entries

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — BlurbySettings, BlurbyDoc
5. `main/ipc/misc.js` — existing stats/history IPC
6. `src/components/LibraryContainer.tsx` — library header, layout
7. `src/components/settings/` — existing settings sub-pages (pattern reference)
8. `src/styles/global.css` — component styling patterns
9. `src/constants.ts` — DEFAULT_SETTINGS

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Goal settings in BlurbySettings** — New fields: `dailyGoalMinutes: number` (default 30), `weeklyGoalDays: number` (default 5), `goalsEnabled: boolean` (default false). Add to types and DEFAULT_SETTINGS. | `src/types.ts`, `src/constants.ts` |
| 2 | Primary CLI (electron-fixer scope) | **Goal progress IPC** — New `get-goal-progress` handler. Reads history.json, computes: `todayMinutes` (sum of session durations for today), `weekMinutes` (per-day array for current week), `streakDays` (consecutive days meeting goal, counting backward from yesterday), `dailyGoal` and `weeklyGoalDays` from settings. Returns `GoalProgress` object. | `main/ipc/misc.js`, `preload.js` |
| 3 | Primary CLI (renderer-fixer scope) | **GoalProgressWidget component** — Compact widget for library header. Circular SVG progress ring (today's progress as fraction of daily goal). Text: "12 / 30 min today". Below: dots for week days (filled = goal met). Muted when goals disabled. Accessible: aria-valuenow, aria-valuemax. | `src/components/GoalProgressWidget.tsx`, `src/styles/global.css` |
| 4 | Primary CLI (renderer-fixer scope) | **Wire widget to LibraryContainer** — Fetch goal progress on mount and on window focus (user may have been reading). Display in library header between title and sort controls. Only show when `settings.goalsEnabled`. | `src/components/LibraryContainer.tsx` |
| 5 | Primary CLI (renderer-fixer scope) | **Reading Goals settings page** — New settings sub-page "Reading Goals": enable/disable toggle, daily minutes slider (15/30/45/60/90/custom), weekly days target (1-7), reset button. Add to SettingsMenu and CommandPalette. | `src/components/settings/ReadingGoalSettings.tsx`, `src/components/SettingsMenu.tsx`, `src/components/CommandPalette.tsx`, `src/components/MenuFlap.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Goal-met toast** — When reading session ends and today's total crosses the daily goal threshold, show a congratulatory toast. Check via `get-goal-progress` after session end. | `src/components/ReaderContainer.tsx` |
| 7 | test-runner | **Tests** — (a) `get-goal-progress` returns correct todayMinutes from history data, (b) streak calculation counts consecutive goal-meeting days, (c) weekly dots array reflects correct days, (d) GoalProgressWidget renders ring and dots, (e) settings page toggles/sliders work, (f) goal-met toast fires at threshold, (g) goals disabled = widget hidden. ≥12 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-compliance-reviewer | **Spec compliance** | — |
| 10 | quality-reviewer | **Architecture + code quality review** | — |
| 11 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 12 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `goalsEnabled`, `dailyGoalMinutes`, `weeklyGoalDays` in BlurbySettings with defaults
2. `get-goal-progress` IPC returns accurate progress from history.json
3. GoalProgressWidget shows circular progress ring in library header
4. Weekly dots show which days met the goal
5. Streak counter tracks consecutive days
6. Reading Goals settings page with enable toggle and minutes slider
7. Goal-met toast fires once per day when threshold crossed
8. Widget hidden when goals disabled
9. Accessible: progress ring has aria attributes
10. ≥12 new tests
11. `npm test` passes (≥1,052 tests)
12. `npm run build` succeeds
13. No regressions to library, reading modes, or existing stats

---

### Sprint TTS-6C: Kokoro Native-Rate Buckets ✅ COMPLETED (v1.14.0, 2026-04-04)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. 18 new tests (1,050 total, 52 files). Kokoro rate control replaced with 3 native buckets (1.0x/1.2x/1.5x). Cache identity includes `rateBucket`. Immediate stop/restart on Kokoro rate change. Background cacher warms active bucket only. TTSSettings shows 3-button bucket selector for Kokoro; Web Speech keeps continuous slider. All 13 SUCCESS CRITERIA met. APPROVED.

---

## Phase 2 Exit Gate

Phase 2 is complete when:
1. Import any supported format → EPUB generated → opens in foliate with formatting intact
2. URL articles → EPUB (not PDF)
3. Narration extracts words correctly from converted EPUBs
4. All 4 reading modes work on converted content
5. No legacy text rendering path remains
6. `npm test` passes, `npm run build` succeeds
7. Sprint Queue depth ≥3 with Phase 3 spec'd

---

## Sprint Status

| Sprint | Version | Status | Summary |
|--------|---------|--------|---------|
| TTS-6K | v1.21.0 | ✅ DONE | Narration personalization & quality sweep. Documentation/policy closure and user-facing Narrate coherence pass completed; follow-up runtime hardening explicitly queued as TTS-6N. |
| TTS-6J | v1.20.0 | ✅ DONE | Voice selection & persona consistency. Shared preferred-voice selector, stable Web Speech fallback priority, and accent/persona terminology cleanup in docs. 1,115 total tests, 58 files. |
| TTS-6I | v1.19.0 | ✅ DONE | Per-book pronunciation profiles. Global + book layering, merge resolver, scoped editor, book-aware cache. 11 new tests. |
| TTS-6G | v1.18.0 | ✅ DONE | Narration controls & accessibility polish. Kokoro bucket bottom-bar, BUG-053 resolved. 8 new tests. |
| TTS-6F | v1.17.0 | ✅ DONE | Word alignment telemetry + improved timing heuristic. Punctuation-aware/token-length-aware word weighting, dev telemetry. 12 new tests. |
| TTS-6E | v1.16.0 | ✅ DONE | Pronunciation overrides foundation. Global override list, settings editor, preview, cache-safe Kokoro generation. 15 new tests. |
| TTS-6D | v1.15.0 | ✅ DONE | Kokoro startup/recovery hardening. Unified engine-status events, warming state, delayed prewarm, crash recovery UX. BUG-032 resolved. 11 new tests. |
| TTS-6C | v1.14.0 | ✅ DONE | Kokoro native-rate buckets (1.0x/1.2x/1.5x). rateBucket cache identity, immediate restart on rate change, active-bucket warming. 18 new tests. |
| EXT-5A | v1.10.0 | ✅ DONE | Chrome extension E2E + queue integration. 33 new tests. Phase 5A complete. |
| READINGS-4C | v1.9.0 | ✅ DONE | Metadata Wizard — scan, filename parser, batch update, modal, Ctrl+Shift+M. 16 new tests. |
| READINGS-4B | v1.8.0 | ✅ DONE | Author normalization + first-run folder picker. BUG-074/076 resolved. 16 new tests. |
| HOTFIX-ARM | v1.7.0+ | ✅ DONE | ONNX ARM64 fix — onnxruntime-node 1.24.3 override, cpuinfo suppression. |
| READINGS-4A | v1.7.0 | ✅ DONE | Library cards, reading queue, "New" dot auto-clear. 17 new tests. |
| FLOW-3B | v1.6.1 | ✅ DONE | Flow Mode polish. Dead code removal, edge cases, truncation fix. 8 new tests. |
| FLOW-3A | v1.6.0 | ✅ DONE | Flow Mode infinite scroll. FlowScrollEngine, shrinking underline cursor, reading zone. 35 new tests. |
| EPUB-2B | v1.5.1 | ✅ DONE | URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path. 16 new tests. |
| EPUB-2A | v1.5.0 | ✅ DONE | Content fidelity — formatting, images, DOCX support. 18 new tests. |
| Phase 1 (AUDIT-FIX 1A-1F) | v1.4.9–v1.4.14 | ✅ DONE | 42 audit findings addressed. 7 CRITICAL, 8+ MAJOR, 6 MODERATE fixed. 9 MODERATE deferred. |
| HOTFIX-11 | v1.4.8 | ✅ DONE | ONNX worker thread crash patch. 863 tests / 44 files. |
| NAR-5 + prior | v1.4.7 | ✅ DONE | Narration pipeline complete. See `docs/project/ROADMAP_ARCHIVE.md`. |

**Full sprint history:** `docs/project/ROADMAP_ARCHIVE.md`

---

## Feature Backlog

Items migrated from BUG_REPORT.md — feature requests, enhancements, and architecture changes (not bugs). Grouped by phase alignment per ROADMAP_V2.

### Phase 3: Flow Mode Redesign
| ID | Feature | Description |
|----|---------|-------------|
| ~~BUG-069~~ | ~~Paragraph jump shortcuts~~ | ✅ RESOLVED (FLOW-3A) — Shift+↑/↓ jumps paragraphs in Flow Mode |
| BUG-070 | Scroll wheel word advance | Partially resolved (FLOW-3A) — mouse wheel pauses auto-scroll, resumes after 2s. Full word-advance deferred. |

### Phase 4: Blurby Readings
| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| ~~BUG-078~~ | ~~Reading Queue~~ | ✅ 4A | Ordered reading list, drag-to-reorder |
| ~~BUG-050~~ | ~~3-line library cards~~ | ✅ 4A | Title, Author, Book Data (progress %, pages, time) |
| ~~BUG-067~~ | ~~"New" dot auto-clear~~ | ✅ 4A | IntersectionObserver + seenAt timestamp |
| ~~BUG-074~~ | ~~Author name normalization~~ | ✅ 4B | Standardize to "Last, First" format |
| ~~BUG-076~~ | ~~First-run library folder picker~~ | ✅ 4B | Mandatory onboarding step |
| ~~BUG-077~~ | ~~Metadata Wizard~~ | ✅ 4C | Batch metadata enrichment (local-only, no API) |

### Phase 5: Read Later + Blurby News
| ID | Feature | Description |
|----|---------|-------------|
| BUG-055–059 | Settings/command palette UX | Combined settings pages, Ctrl+K searchable settings |

### Backlog (Unphased)
| ID | Feature | Description |
|----|---------|-------------|
| ~~BUG-037~~ | ~~E-ink as display mode~~ | ✅ Queued as EINK-6A |
| BUG-060–062 | Branding | Icon, theme, sample prefix |
| BUG-070 | Scroll wheel word advance | Mouse wheel = word advance in reading modes |
| BUG-038 | Hotkey coaching in reader | Keyboard shortcut suggestions on mouse click |

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support
- Import/export (backup library, stats to CSV)
- Streaming ZIP parsing for large EPUBs
- Time-window stats archival
- Toast queue system
- Version-pin critical dependencies
- iOS app, Firefox extension, Safari extension
