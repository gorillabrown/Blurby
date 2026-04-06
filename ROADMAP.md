# Blurby — Development Roadmap

**Last updated**: 2026-04-06 — Roadmap finalized with investigation gates and responsibility assignments. Every item has: what we know, what we don't, what Cowork investigates before CLI executes.
**Current branch**: `main`
**Current state**: v1.37.1 stable. Queue depth 6 (GREEN). All items need Cowork investigation before CLI dispatch. BUG-157/158 are the only CLI-ready items today.
**Governing roadmap**: This file is the single source of truth. Phase overview archived from `docs/project/ROADMAP_V2_ARCHIVED.md`.

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
Phase 6: TTS Hardening & Stabilization ── COMPLETE (v1.37.1)
  ├── TTS-6C→6S + HOTFIX-11 ✅ (v1.14.0–v1.28.0)
  ├── TTS-7A→7R + EXT-5C + HOTFIX-12 ✅ (v1.29.0–v1.37.1)
  │
  │  Parked feature work (fully spec'd, not priority)
  ├── EINK-6A: E-Ink Foundation (parked)
  ├── EINK-6B: E-Ink Reading Ergonomics (parked)
  └── GOALS-6B: Reading Goal Tracking (parked)
    │
    ▼
HOTFIX-13: Reader Core Fixes (BUG-151/152/153/154)
    │
HOTFIX-14: Import & Connection Fixes (BUG-155/156/157/158)
    │
    ├───────────────────────────────────┐
    ▼                                   ▼
Track A: Flow Infinite Reader    Track B: Chrome Extension Enrichment
  ├── FLOW-INF-A: Reading Zone     ├── EXT-ENR-A: Resilient Connection
  ├── FLOW-INF-B: Timer Cursor     ├── EXT-ENR-B: Auto-Discovery Pairing
  └── FLOW-INF-C: Cross-Book       └── EXT-ENR-C: In-Browser Reader (optional)
    │                                   │
    └──────────────┬────────────────────┘
                   ▼
        Track C: Android APK
          ├── APK-0: Modularization (prerequisite)
          ├── APK-1: WebView Shell + Local Library
          ├── APK-2: All Reading Modes
          ├── APK-3: Bidirectional Sync
          └── APK-4: Mobile-Native Features
                   │
                   ▼
        Phase 7: Cloud Sync Hardening (parallel with APK-3)
                   │
                   ▼
        Phase 8: RSS/News Feeds
```

---

## Phases 2–5 — COMPLETE

> All Phase 2–5 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Phase | Sprints | Final Version | Key Deliverables |
|-------|---------|---------------|------------------|
| 2: EPUB Fidelity | EPUB-2A, EPUB-2B | v1.5.1 | Format preservation, image extraction, DOCX/URL→EPUB, single rendering path |
| 3: Flow Mode | FLOW-3A, FLOW-3B | v1.6.1 | Infinite scroll, FlowScrollEngine, dead code removal |
| 4: Readings | READINGS-4A, 4B, 4C | v1.9.0 | Card metadata, queue, author normalization, metadata wizard |
| 5: Chrome Extension | EXT-5A, EXT-5B + TTS Smoothness | v1.11.0 | E2E pipeline tests, 6-digit pairing, background cache wiring |

---

## Phase 6 — TTS Hardening & Stabilization + Follow-On Hotfixes

> All TTS-6 and TTS-7 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Lane | Sprints | Versions | Key Deliverables |
|------|---------|----------|------------------|
| TTS-6 | TTS-6C→6S + HOTFIX-11 | v1.14.0–v1.28.0 | Native-rate buckets, startup hardening, pronunciation overrides, word alignment, accessibility, profiles, portability, runtime stability, performance budgets, session continuity, diagnostics, cursor sync |
| TTS-7 (stabilization + hotfix) | TTS-7A→7L | v1.29.0–v1.33.7 | Cache correctness, cursor contract (dual ownership), throughput/backpressure, integration verification, proactive entry-cache coverage + cruise warm, clean Foliate DOM probing, first-chunk IPC verification, visible-word/startup fixes, Foliate follow-scroll unification + exact miss recovery, final Foliate section-sync / word-source dedupe / initial-selection protection, EPUB global word-source promotion, and exact text-selection mapping. TTS hotfix lane CLOSED at v1.33.7. |

**Architecture post-stabilization:** Narration state machine, cache identity contract (voice + override hash + word count), cursor ownership (playing = TTS owns, paused = user owns), pipeline pause/resume (emission gating), backpressure (TTS_QUEUE_DEPTH), narration start <50ms per microtask. Documented in TECHNICAL_REFERENCE.md § "Narrate Mode Architecture."

**Closeout note:** Live testing on 2026-04-04 showed that cold-start narration on freshly opened EPUBs still had page-jump and ramp-up continuity regressions after `TTS-7E`. `TTS-7F` closed the reactive-cache side of that gap, and `TTS-7G` verified that `BUG-117` (910ms first-chunk IPC handler) was already resolved by prior work. `TTS-7H` fixed the frozen-start-index and section-fallback pieces, `TTS-7I` unified follow-scroll ownership and exact miss recovery, `TTS-7J` resolved section-sync blink, word-source duplication, and initial-selection overwrite, `TTS-7K` promoted full-book EPUB words as the active source of truth, and `TTS-7L` closed the final selection-path gap by preserving exact word identity across click and native text selection. Phase 6 TTS is now fully stabilized and closed at `v1.33.7`.

> All TTS-7E through TTS-7R, EXT-5C, and HOTFIX-12 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`.

---

## HOTFIX-13: Reader Core Fixes (BUG-151/152/153/154)

**Goal:** Fix the three broken reading modes and establish the word selection contract.

**Bugs:**

| ID | Description | Severity | Scope |
|----|-------------|----------|-------|
| BUG-151 | Narration band spans full page height instead of single-line | High | `FoliatePageView.tsx` (measurement fallback) |
| BUG-152 | Focus mode blank screen — no RSVP display | High | `useReaderMode.ts`, `ReaderContainer.tsx` |
| BUG-153 | No word selection contract (soft/hard) — modes don't know where to start | High | `FoliatePageView.tsx`, `useReaderMode.ts`, `ReaderContainer.tsx` |
| BUG-154 | Flow should switch to scrolled layout on click, not on play | Medium | `FoliatePageView.tsx`, `useReaderMode.ts` |

### Investigation Gate (Cowork — before CLI dispatch)

| Bug | What We Know | What We Don't Know | Investigation Action |
|-----|-------------|-------------------|---------------------|
| BUG-151 | Three fallback paths (lines 571, 692, 860) use uncapped `from.height` or `currentWindow.height` when `narrationBandLineHeightRef` is 0. If user navigates away from narrated section, measurement becomes stale or fails, and the fallback produces a page-tall band. | **ROOT CAUSE CONFIRMED.** Fallback height is uncapped. When `narrationBandLineHeightRef.current === 0`, the fallback uses `currentWindow.height` (potentially hundreds of px). | **CLI-READY.** Cap all three fallback heights to 40px (~2 line-heights). Re-run `measureNarrationBandDimensions()` on section change, not just narration start. See fix spec below. |
| BUG-152 | `ReaderView` at `ReaderContainer.tsx:1362` receives `words={foliateWordStrings}` (a DOM-section slice of ~1000 words). But `wordIndex` comes from the full-book global index (e.g., 5114 from `getEffectiveWords()` which returns 173,727 words). `words[5114]` is `undefined` → `currentWord=""` → blank RSVP, only ▼/▲ arrows visible. | **ROOT CAUSE CONFIRMED.** Data-flow split: mode timer uses full-book words, but ReaderView receives DOM-slice words. Index into the wrong array → empty word. | **CLI-READY.** Change `ReaderContainer.tsx:1362` from `words={foliateWordStrings}` to `words={bookWordsRef.current?.complete ? bookWordsRef.current.words : foliateWordStrings}`. See fix spec below. |
| BUG-153 | Design contract defined (soft/hard selection, resolution order). No implementation exists today — words are only highlighted when a reading mode is active. | **Exact state shape, event wiring, and visual treatment.** How does `onLoad`/`onRelocate` determine first visible word? What CSS class for soft highlight? How does `startWord` resolution in each mode hook integrate? | **Cowork: Design spec needed.** Define: (a) state variables, (b) update events, (c) CSS classes, (d) integration points. Produce full WHERE/Tasks/SUCCESS CRITERIA for CLI. |
| BUG-154 | Code already switches layout on click: `ReaderContainer.tsx:1293` sets `flowMode={readingMode === "flow"}`, `FoliatePageView.tsx:1527` sets `flow="scrolled"`. | **Likely not a bug.** The Foliate renderer may take a moment to reflow, perceived as "doesn't switch." Or user was in narration mode where the visual difference is subtle. | **Needs live verification only.** If switch works but is slow, add loading indicator. If genuinely broken, trace `setAttribute("flow")` timing. Defer to live testing session. |

**Dispatch readiness:** BUG-151 and BUG-152 are **CLI-READY** with exact fix specs. BUG-153 needs Cowork design spec. BUG-154 needs live verification (may be non-bug).

**Design contract for BUG-153 (preliminary — to be refined during investigation):**
- **Soft selection** — First visible word on every page is always lightly highlighted. Auto-updates on page turn/scroll. Default start word for any reading mode.
- **Hard selection** — User clicks a word → distinct highlight, persists across page turns. All modes start from this word.
- **Off-page anchor** — If hard selection is on a different page, show "Jump to selection" button.
- **Resolution order:** hard selection > soft selection > word 0.

**Tier:** Quick | **Depends on:** Investigation gate cleared by Cowork

---

## HOTFIX-14: Import & Connection Fixes (BUG-155/156/157/158)

**Goal:** Fix URL extraction, false Chrome extension connection status, add disconnect/reconnect, and simplify library flap.

**Bugs:**

| ID | Description | Severity | Scope |
|----|-------------|----------|-------|
| BUG-155 | URL extraction broken — "Could not extract article" error | High | `main/url-extractor.js` |
| BUG-156 | False "Connected" status when extension not connected | Medium | `main/ws-server.js`, `ConnectorsSettings.tsx` |
| BUG-157 | No disconnect/reconnect button for Chrome extension | Medium | `ConnectorsSettings.tsx` |
| BUG-158 | Library flap shows too many categories — simplify to "Now Reading" + "Queue" | Low | `ReadingQueue.tsx` |

### Investigation Gate (Cowork — before CLI dispatch)

| Bug | What We Know | What We Don't Know | Investigation Action |
|-----|-------------|-------------------|---------------------|
| BUG-155 | Error flow mapped: `extractArticleFromHtml()` in `url-extractor.js:493-798` tries __preloadedData, JSON-LD, Readability, DOM selectors. Returns `{ error }` at line 748. IPC handler in `ipc/misc.js:152-282` wraps with user-friendly message. Technical error logged to file. | **Is this site-specific or general?** Does the fetch itself fail (network/CORS)? Or does Readability parse but return empty? The tested URL (ebsco.com) likely requires auth. | **Cowork: Live test.** Test 3-5 URLs (Wikipedia article, NYT, Medium, a simple blog, EBSCO). Check error log for technical details. Determine if general regression or site-specific. Produce fix spec or mark as expected behavior. |
| BUG-156 | `ConnectorsSettings.tsx:32` sets `connected` from `api.getWsShortCode()`. IPC handler at `ipc/misc.js:379` checks `wsServer.getClientCount() > 0`. `_clients` Set in ws-server.js tracks authenticated clients. | **Why `getClientCount()` returns >0 with no client.** Is `_clients` not cleaned up on disconnect? Is a stale/dead client remaining in the set? Is the heartbeat check failing to remove timed-out clients? | **Cowork: Code trace.** Read ws-server.js client lifecycle: (a) where clients are added to `_clients`, (b) where they're removed (disconnect, heartbeat timeout, error), (c) whether the heartbeat sweep correctly cleans stale entries. Produce exact fix spec. |
| BUG-157 | `ConnectorsSettings.tsx` has no disconnect button. `ipc/misc.js:389-397` has `regenerate-ws-pairing-token` handler already wired. | **Nothing — this is a straightforward UI addition.** | **CLI-READY.** Add "Disconnect" button that calls `regenerate-ws-pairing-token` (clears token, drops connections). Add "Generate New Code" button for re-pairing. Exact placement: below the status indicator in ConnectorsSettings. |
| BUG-158 | `ReadingQueue.tsx` has three sections at lines 146-162: "Queue" (draggable), "Continue Reading" (position > 0), "Unread" (position === 0). User wants only "Now Reading" + "Queue". | **Nothing — this is a straightforward filter change.** | **CLI-READY.** Remove "Unread" section (line 160). Rename "Continue Reading" → "Now Reading". Keep "Queue" as-is. Two-line change. |

**Dispatch readiness:** PARTIALLY READY. BUG-157 and BUG-158 are CLI-ready now. BUG-155 and BUG-156 need Cowork investigation first.

**Tier:** Quick | **Depends on:** Investigation gate cleared for BUG-155/156; BUG-157/158 can ship immediately

---

## Track A: Flow Infinite Reader (FLOW-INF)

> **Vision:** Flow mode evolves from "auto-scrolling EPUB reader" into a true infinite reading experience — a visually distinct reading zone guides the eye, a timer-bar cursor shows pacing, and finishing one book seamlessly loads the next from the reading queue.

### Current State (v1.37.1)

Flow mode today:
- **FlowMode.ts** — Timing-only class. `setTimeout` chain at WPM, emits `onWordAdvance`. Supports pause/resume, rhythm pauses (half of Focus mode duration).
- **FlowScrollEngine.ts** — Imperative class. Builds `LineInfo[]` from DOM word spans. Animates per-line: underline cursor shrinks from full width to 0px. Scrolls target line to 25% of viewport (`FLOW_READING_ZONE_POSITION`). Manual scroll detection pauses auto-advance for 2s.
- **CSS** — `.foliate-flow-cursor`: 3px accent-colored underline, `transition: transform 0.08s linear, width 0.08s linear`. No reading zone band. No de-emphasis. No timer bar.
- **Foliate integration** — `flow="scrolled"` disables pagination, single-column layout, scroll container exposed to engine.

### What's Missing

| Feature | Current | Target |
|---------|---------|--------|
| Reading zone band | Implicit (scroll position only) | Visually distinct 3-5 line band, content above/below de-emphasized |
| Timer/depletion cursor | Line width shrinks (internal) | Visible timer bar depleting left→right per line, user-facing progress |
| Cross-book reading | Stops at book end | Auto-loads next from queue, seamless transition |
| Zone position | Hardcoded 25% | User-configurable (top third, center, bottom third) |
| Progress feedback | None during flow | Persistent progress indicator (% through book, chapter) |

### Investigation Gate — Track A (Cowork — before any FLOW-INF dispatch)

| Area | What We Know | What We Don't Know | Investigation Action |
|------|-------------|-------------------|---------------------|
| FlowScrollEngine internals | Line-based animation, `LineInfo[]` built from DOM, cursor shrinks per line, reading zone at 25% viewport. 339-line class fully read. | **How to overlay a visual zone without breaking scroll.** Does Foliate's shadow DOM allow overlay elements? Can we use a CSS gradient on the scroll container, or do we need a separate positioned div? | **Cowork: Prototype.** In running app, inject a CSS gradient or overlay div at the reading zone position. Test: (a) does it scroll with content or stay fixed? (b) does it work inside Foliate's shadow DOM? Determine feasible approach. |
| De-emphasis rendering | No de-emphasis exists today. Text above/below reading zone is equally visible. | **Performance of opacity changes on large documents.** Can we apply opacity to content sections without repainting the entire Foliate view? Is a CSS-only approach possible, or does it require DOM manipulation inside shadow DOM? | **Cowork: Test.** Try `mask-image` gradient on the Foliate scroll container. Measure repaint cost. If too expensive, try a fixed overlay with gradient transparency. |
| Settings integration | `FLOW_READING_ZONE_POSITION = 0.25` is a constant. No user-facing setting exists. | **Where in settings UI.** Does it go in Reading Layout? A new Flow sub-page? Inline in the reading zone itself? | **Cowork: Design decision.** Recommend placement and spec the settings UI. |

**Dispatch readiness:** NOT READY. Needs Cowork prototyping of reading zone overlay approach before CLI can build.

### Sprint FLOW-INF-A: Reading Zone & Visual Pacing

**Goal:** Add a visually distinct reading zone to flow mode — a 3-5 line band where the active text lives, with de-emphasized content above and below.

**Responsibility:** Cowork specs → CLI executes.

**Deliverables:**
1. CSS reading zone overlay — background gradient or opacity layer marking the active 3-5 line region
2. Text de-emphasis — content above and below the reading zone rendered at reduced opacity (e.g., 40%)
3. Configurable zone position — `FLOW_READING_ZONE_POSITION` becomes a user setting (top third / center / bottom third)
4. Zone size setting — number of visible lines in the reading zone (default 5, range 3-8)
5. Smooth zone tracking — reading zone follows the active line with CSS transitions, no jarring jumps

**Key files:** `src/utils/FlowScrollEngine.ts`, `src/styles/global.css`, `src/constants.ts`, `src/components/FoliatePageView.tsx`

**Tier:** Full | **Depends on:** HOTFIX-13 + investigation gate cleared

---

### Sprint FLOW-INF-B: Timer Cursor & Pacing Feedback

**Goal:** Replace the invisible width-shrink animation with a visible timer bar that depletes left-to-right as each line is read.

**Responsibility:** Cowork specs (after FLOW-INF-A ships and UX is validated) → CLI executes.

**Deliverables:**
1. Timer bar element — visible accent-colored bar below (or overlaying) the active line
2. Left-to-right depletion animation — linear, duration = line word count / WPM
3. Line completion transition — when bar reaches right edge, smooth scroll to next line, bar resets
4. Progress indicator — subtle overlay showing % through current chapter and book
5. WPM feedback — current WPM displayed in bottom bar or reading zone margin

**Investigation gate:** Depends on FLOW-INF-A implementation. Timer bar design must respond to how the reading zone actually renders (overlay vs gradient vs DOM manipulation). Cowork specs after seeing FLOW-INF-A results.

**Key files:** `src/utils/FlowScrollEngine.ts`, `src/styles/global.css`, `src/components/ReaderBottomBar.tsx`

**Tier:** Full | **Depends on:** FLOW-INF-A

---

### Sprint FLOW-INF-C: Cross-Book Continuous Reading

**Goal:** Finishing a book in flow mode auto-loads the next from the reading queue.

**Responsibility:** Cowork specs (after FLOW-INF-B) → CLI executes.

**Deliverables:**
1. Queue-aware flow completion — when `onComplete` fires, check reading queue for next item
2. Transition UX — brief "Finished [Book A]. Starting [Book B]..." overlay (2-3s), then new book opens
3. Session continuity — reading time, page counts, and goals track across book boundaries
4. Skip/exit option — Escape or click to return to library instead of auto-advancing
5. Empty queue handling — "Reading complete" with return-to-library option

**Investigation gate:** Needs Cowork to spec: (a) how ReaderContainer handles book switching (does it unmount/remount?), (b) queue state management (who owns next-book resolution), (c) transition overlay design. These depend on how FLOW-INF-A/B land.

**Key files:** `src/hooks/useReaderMode.ts`, `src/components/ReaderContainer.tsx`, `src/hooks/useLibrary.ts`

**Tier:** Full | **Depends on:** FLOW-INF-B

---

## Track B: Chrome Extension Enrichment (EXT-ENR)

> **Vision:** The Chrome extension connection becomes effortless and resilient. No manual code entry on reconnect, no dropped connections on sleep/wake, and the app actively invites pairing when it senses an incoming connection attempt.

### Current State (v1.37.1)

- **WebSocket server** (`main/ws-server.js`) — localhost port 48924, RFC 6455, pairing token auth via `safeStorage`
- **Pairing flow** — 6-digit short code with TTL, user manually enters in extension
- **Article import** — `add-article` message type, HTML→EPUB conversion, hero image extraction, auto-queue
- **Known pain points:** Connection times out or drops on sleep/wake. Reconnect requires re-pairing. No app-side awareness of incoming connection attempts.

### Investigation Gate — Track B (Cowork — before any EXT-ENR dispatch)

| Area | What We Know | What We Don't Know | Investigation Action |
|------|-------------|-------------------|---------------------|
| WebSocket lifecycle | ws-server.js: clients added to `_clients` Set on auth, heartbeat ping/pong interval, `getClientCount()` used for status. IPC handlers in `ipc/misc.js:359-397`. | **Exact client cleanup paths.** When does a client get removed from `_clients`? On socket close? On heartbeat timeout? On error? Is there a race where a disconnected client stays in the set? | **Cowork: Code trace.** Read ws-server.js client removal logic. Map all paths from connected → removed. Identify gaps. This also resolves BUG-156. |
| Extension source code | Extension was built for Phase 5 (EXT-5A/5B). Pairing flow, article import working. | **Where is the extension code?** Is it in this repo, a separate repo, or unpublished? What reconnection logic exists today? What does the popup UI look like? | **Cowork: Locate and read.** Find the Chrome extension source. Read its WebSocket client code. Determine what reconnect logic exists. This gates EXT-ENR-A spec. |
| IPC event emission | ws-server.js doesn't proactively push state to renderer — renderer polls via `getWsShortCode()` every 1s. | **How to emit unauthenticated connection events to renderer.** Need a new IPC channel? `mainWindow.webContents.send("ws-connection-attempt")`? | **Cowork: Design.** Spec the IPC event shape and renderer handler. This gates EXT-ENR-B spec. |

**Dispatch readiness:** NOT READY. Extension source code location needed. Client lifecycle trace needed.

### Sprint EXT-ENR-A: Resilient Connection

**Goal:** The WebSocket connection survives sleep/wake, network changes, and app restarts without re-pairing.

**Responsibility:** Cowork specs (after investigation gate) → CLI executes both server-side and extension-side changes.

**Deliverables:**
1. Auto-reconnect with exponential backoff — extension retries on disconnect (1s, 2s, 4s, 8s... cap at 30s)
2. Token persistence — valid pairing token survives app restart
3. Heartbeat tuning — reduce ping interval, add grace period for missed pongs
4. Connection state machine — extension tracks: `disconnected → connecting → authenticating → connected`
5. App-side connection status — accurate "Connected" indicator (fixes BUG-156)
6. Disconnect/reconnect button (BUG-157 — CLI-ready, can ship ahead of investigation)

**Key files:** `main/ws-server.js`, `src/components/settings/ConnectorsSettings.tsx`, Chrome extension source

**Tier:** Quick | **Depends on:** Investigation gate cleared

---

### Sprint EXT-ENR-B: Auto-Discovery Pairing

**Goal:** When the extension tries to connect, Blurby surfaces the pairing code in the library screen.

**Responsibility:** Cowork specs (after EXT-ENR-A ships) → CLI executes.

**Deliverables:**
1. Incoming connection notification — ws-server emits event on unauthenticated connection attempt
2. Library-screen pairing prompt — floating card: "Chrome Extension wants to connect. Code: 123456"
3. Auto-dismiss — prompt disappears on pairing success or code expiry
4. Settings shortcut — "Pair Chrome Extension" button in library header
5. First-run experience — setup prompt on fresh install when extension detected

**Investigation gate:** Depends on EXT-ENR-A implementation. IPC event design must be validated before renderer UI can be spec'd. Cowork specs after EXT-ENR-A ships.

**Key files:** `main/ws-server.js`, `preload.js`, `src/components/LibraryContainer.tsx`, `src/styles/global.css`

**Tier:** Full | **Depends on:** EXT-ENR-A

---

### Sprint EXT-ENR-C: In-Browser Reader (Optional/Future)

**Goal:** Standalone RSVP speed-reader in the Chrome extension popup — read articles without Blurby app running.

**Deliverables:**
1. Popup RSVP view (400x500px) — play/pause, WPM slider (100-1200), progress bar
2. Readability extraction in extension — extract article text from current tab
3. Reading queue in extension — `chrome.storage.local`, 50 articles max, 5MB limit
4. Sync with desktop — when Blurby is running, sync queue bidirectionally

**Note:** This is a lower priority enhancement. EXT-ENR-A and EXT-ENR-B address the core pain points. This sprint is documented for completeness but can be deferred.

**Key files:** Chrome extension source (separate repo/directory)

**Tier:** Full | **Depends on:** EXT-ENR-B

---

## Track C: Android APK (APK)

> **Vision:** Blurby on Android — sideloaded APK first, Play Store later. All readings available, reading position synced bidirectionally, new readings addable from mobile, all four reading modes working.

### Prerequisites & Architecture Decision

**Framework decision needed:** Two specs exist:
- `docs/superpowers/specs/.Archive/2026-03-27-android-app-design.md` — React Native + Expo monorepo (better native feel, larger effort)
- `docs/superpowers/specs/.Archive/phase-10-android-app.md` — Capacitor wrapper (max code reuse, faster to ship)

**Recommendation:** Capacitor for sideload MVP. Reasons: (1) reuses existing React code directly, (2) foliate-js already runs in WebView, (3) faster path to testable APK, (4) can always migrate to React Native later if WebView performance is insufficient.

**Mandatory prerequisite:** Modularization — extract platform-independent core from Electron coupling. See APK-0 below.

### Investigation Gate — Track C (Cowork — before any APK dispatch)

| Area | What We Know | What We Don't Know | Investigation Action |
|------|-------------|-------------------|---------------------|
| Framework decision | Two specs exist (RN vs Capacitor). Recommendation: Capacitor. | **User hasn't confirmed.** Also: has Capacitor been tested with foliate-js in a WebView? Does the EPUB rendering actually work? | **Cowork: Decision + POC.** Get user confirmation on Capacitor. Then scaffold minimal Capacitor project, load foliate-js in WebView, open an EPUB. If it works → proceed. If not → re-evaluate. |
| Coupling audit | 5 problem areas identified at high level (TTS worker, auth, sync, file I/O, IPC). | **Exact coupling depth.** How many `require('electron')` calls exist? How many `fs.` calls? Which renderer code accidentally imports Node modules? What's the true scope of modularization? | **Cowork: Deep audit.** Grep for all Electron-specific imports across the codebase. Map every coupling point with file:line. Estimate LOC per abstraction layer. Produce a scoped modularization plan that CLI can execute module-by-module. |
| Mobile TTS | Kokoro uses Node worker with ONNX. Model is ~80MB. | **Does ONNX Runtime work in Capacitor WebView?** Can we use WebAssembly ONNX runtime instead of Node? What's the performance on ARM? | **Cowork: Research.** Check ONNX Runtime Web (WASM) compatibility. Test if Kokoro model loads in browser context. If not, TTS on mobile may need a different approach (Web Speech API fallback, or native ONNX via Capacitor plugin). |
| Cloud sync on mobile | Sync engine is `main/sync-engine.js`, main-process-driven with `fs.promises`. | **Can the sync protocol run in a WebView?** The transport (OneDrive/Google Drive HTTP APIs) could work from browser context, but the file storage layer assumes Node `fs`. | **Cowork: Map sync dependencies.** Identify which sync-engine functions are pure logic (portable) vs platform-bound (Node fs). Estimate extraction effort. |

**Dispatch readiness:** NOT READY. Framework POC, coupling audit, and TTS feasibility all needed before APK-0 can be spec'd to CLI-ready detail.

### Sprint APK-0: Modularization (Prerequisite)

**Goal:** Extract a platform-independent core from the Electron-coupled codebase.

**Responsibility:** Cowork audits and specs each abstraction layer → CLI executes module-by-module extraction.

**Problem areas identified by 3rd-party audit:**
1. **Kokoro TTS worker** (`main/tts-worker.js` L5-L37) — Node-specific module resolution hacks
2. **Auth** (`main/auth.js` L294-L304) — depends on Electron `BrowserWindow` for OAuth popup
3. **Sync engine** (`main/sync-engine.js`) — main-process-driven, uses `fs.promises` directly
4. **File I/O** — all via Node `fs`, no abstraction layer
5. **IPC** — tight coupling between `preload.js` bridge and main-process handlers

**Deliverables (pending investigation gate):**
1. Storage abstraction — interface for file read/write/list/delete
2. Auth abstraction — interface for OAuth flows
3. TTS abstraction — interface for Kokoro model loading and inference
4. Sync transport abstraction — decouple sync logic from Node fs
5. Shared types and constants — extract to `shared/` directory

**Estimated effort:** 2-3 sprints (each sub-module is a separate CLI dispatch)

**Tier:** Full | **Depends on:** Investigation gate cleared

---

### Sprint APK-1: WebView Shell + Local Library

**Goal:** Sideloadable APK that opens Blurby's React UI in a WebView.

**Responsibility:** Cowork specs (after APK-0 modularization lands) → CLI executes scaffolding and integration.

**Investigation gate:** Blocked on APK-0 completion + Capacitor POC from Track C investigation gate.

**Deliverables:**
1. Capacitor project scaffolding — Android project, WebView configuration, build pipeline
2. Local library storage — SQLite or JSON file via Capacitor Filesystem
3. EPUB rendering — foliate-js in WebView (validated by POC)
4. File import — Android file picker + share sheet
5. APK build — signed debug APK for sideloading

**Tier:** Full | **Depends on:** APK-0

---

### Sprint APK-2: All Reading Modes

**Responsibility:** Cowork specs (after APK-1, with mobile gesture design) → CLI executes.

**Investigation gate:** Blocked on APK-1. Touch gesture mapping needs design decisions after seeing the WebView shell.

**Deliverables:**
1. Touch gesture mapping — swipe for page turn, tap zones for mode controls
2. Focus mode — RSVP display adapted for mobile viewport
3. Flow mode — infinite scroll with touch scroll detection
4. Narrate mode — Kokoro TTS via approach determined in investigation gate
5. Bottom bar adaptation — mobile-friendly control layout

**Tier:** Full | **Depends on:** APK-1

---

### Sprint APK-3: Bidirectional Sync

**Responsibility:** Cowork specs (sync protocol design, informed by Phase 7 if available) → CLI executes.

**Investigation gate:** Blocked on APK-2. Sync protocol depends on modularization outcome from APK-0.

**Deliverables:**
1. Cloud sync integration — OneDrive/Google Drive via Capacitor HTTP + OAuth
2. Bidirectional position sync — CFI-based with last-write-wins timestamps
3. Library sync — three-tier storage (metadata local, content on-demand, user-pinned)
4. Settings sync — theme, WPM, voice preferences
5. Conflict resolution — per-field last-write-wins

**Tier:** Full | **Depends on:** APK-2

---

### Sprint APK-4: Mobile-Native Features

**Responsibility:** Cowork specs → CLI executes.

**Investigation gate:** Blocked on APK-3. Native features depend on what the platform supports after integration.

**Deliverables:**
1. Share sheet integration — "Share to Blurby" from Chrome, other apps
2. Notification for reading goals/streaks (if GOALS-6B is implemented)
3. Background TTS playback — audio continues when backgrounded
4. Deep links — `blurby://open/{docId}`
5. Offline-first — graceful degradation when no network

**Tier:** Full | **Depends on:** APK-3

---

## Idea Themes (Roadmap Placeholders)

> Ideas grouped by theme in `docs/governance/IDEAS.md`. Each theme maps to potential future sprints. Not yet spec'd — reviewed at phase pauses.

| Theme | Key Ideas | Roadmap Alignment |
|-------|-----------|-------------------|
| **A: Infinite Reader** | Reading zone, cross-book flow, paragraph jumps | → Track A (FLOW-INF) above |
| **B: Chrome Extension** | Auto-discovery, resilient connection, in-browser reader, RSS | → Track B (EXT-ENR) above |
| **C: Android & Mobile** | APK wrapper, position sync, share sheet, Chromecast | → Track C (APK) above |
| **D: Reading Intelligence** | Goals, streaks, analytics, AI recommendations | GOALS-6B parked; rest backlog |
| **E: Content & Formats** | Chapter detection, auto TOC, OCR PDFs | Backlog (Phase 10+) |
| **F: Library & UX Polish** | 3-line cards, auto-clear dots, vocab builder, annotation export | Backlog (fold into any sprint) |
| **G: Settings & Ctrl+K** | Combine settings pages, all settings searchable | Backlog (small wins) |
| **H: Reading Tweaks** | Space bar mode, arrow speed, voice cloning, AI summaries | Backlog (bundleable) |
| **I: Branding** | Remove [Sample], Blurby icon, brand theme, window controls | Backlog (cosmetic, anytime) |
| **J: Social** | Reading clubs, shared lists, group discussions | Someday (needs server) |
| **K: E-Ink** | Display mode decoupling, e-ink reading ergonomics | Parked (EINK-6A/6B spec'd) |

---

## Phase 6 Continued — E-Ink & Goals (PARKED)

> EINK-6A, EINK-6B, and GOALS-6B are fully spec'd but parked. Specs remain valid — resume after TTS/hotfix lane concludes.

---

### Sprint EINK-6A: E-Ink Foundation & Greyscale Runtime

**Goal:** Decouple e-ink display behavior from the theme system so users can pair e-ink optimizations (no animations, large targets, refresh timing) with any color theme. Currently, e-ink is a theme — selecting it forces greyscale colors. After this sprint, e-ink is an independent display mode toggle that layers on top of any theme.

**Problem:** E-ink support exists as a `[data-theme="eink"]` CSS block (200+ lines in global.css) with dedicated settings (`einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`). But it's coupled to the theme selector in ThemeSettings.tsx — you can't use dark theme with e-ink optimizations, or light theme with e-ink refresh overlay. This forces users with e-ink devices to accept the greyscale palette even when their device supports limited color (Kaleido e-ink screens). It also means non-e-ink users can't benefit from e-ink ergonomic features (reduced animation, larger targets) without losing their preferred theme.

**Design decisions:**
- **New `einkMode: boolean` setting.** Independent of `theme`. When true, applies e-ink behavioral CSS overrides (no transitions, larger targets, no hover) on top of the active theme. The existing `[data-theme="eink"]` color palette becomes an optional "E-Ink Greyscale" theme choice that users can select or skip.
- **Refactor CSS into two layers.** Split the current `[data-theme="eink"]` block into: (a) `[data-eink="true"]` — behavioral overrides (transition:none, no hover, larger targets), applied when einkMode is on regardless of theme, and (b) `[data-theme="eink"]` — color palette only (pure black/white/grey), optional theme choice. This is a CSS-only refactor with no JS behavior changes.
- **ThemeSettings restructure.** Move e-ink from theme grid to a separate toggle section: "E-Ink Display Mode" toggle above the theme selector. When on, show the existing e-ink sub-settings (WPM ceiling, refresh interval, phrase grouping). Theme selector remains independent below.
- **EinkRefreshOverlay remains as-is.** The existing `useEinkController` hook and `EinkRefreshOverlay` component work correctly — they just need to check `einkMode` instead of `theme === 'eink'`.

**Baseline:**
- `src/types.ts` — settings schema: `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping` (lines 136–139). No `einkMode` field yet.
- `src/components/settings/ThemeSettings.tsx` (150 lines) — e-ink as theme option (line 30), e-ink sub-settings panel (lines 100–147)
- `src/styles/global.css` — `[data-theme="eink"]` block (~200 lines, starts ~line 1543)
- `src/hooks/useEinkController.ts` (47 lines) — page-turn counter, refresh overlay trigger
- `src/components/EinkRefreshOverlay.tsx` (24 lines) — black/white flash overlay
- `src/components/ReaderContainer.tsx` — e-ink integration: WPM cap (line 144), eink controller (line 92), overlay render
- `src/constants.ts` — `DEFAULT_EINK_WPM_CEILING`, `DEFAULT_EINK_REFRESH_INTERVAL`, `EINK_REFRESH_FLASH_MS`, etc.

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema, eink fields
5. `src/components/settings/ThemeSettings.tsx` — current e-ink theme coupling
6. `src/styles/global.css` — `[data-theme="eink"]` block (find boundaries)
7. `src/hooks/useEinkController.ts` — refresh controller logic
8. `src/components/EinkRefreshOverlay.tsx` — overlay component
9. `src/components/ReaderContainer.tsx` — e-ink integration points
10. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **Add `einkMode` setting** — Add `einkMode: boolean` (default false) to settings schema in types.ts. Add default to constants.ts. Wire through SettingsContext. | `src/types.ts`, `src/constants.ts`, `src/contexts/SettingsContext.tsx` |
| 2 | Hephaestus (renderer-scope) | **Split CSS into behavioral and color layers** — Extract all non-color properties from `[data-theme="eink"]` into new `[data-eink="true"]` selector. Leave only color properties (`--bg`, `--fg`, `--accent`, etc.) in `[data-theme="eink"]`. Verify no visual regression when both are applied simultaneously. | `src/styles/global.css` |
| 3 | Hephaestus (renderer-scope) | **Apply `data-eink` attribute** — In the root element (App.tsx or equivalent), set `data-eink="true"` when `settings.einkMode === true`, independent of `data-theme`. | `src/App.tsx` or equivalent root |
| 4 | Hephaestus (renderer-scope) | **Restructure ThemeSettings** — Move e-ink out of theme grid. Add "E-Ink Display Mode" toggle above themes. When toggled on, show WPM ceiling / refresh interval / phrase grouping sliders. Theme grid remains below, all themes selectable regardless of einkMode. | `src/components/settings/ThemeSettings.tsx` |
| 5 | Hephaestus (renderer-scope) | **Update eink controller** — Change `useEinkController.ts` to check `settings.einkMode` instead of `theme === 'eink'`. Update ReaderContainer.tsx integration points (WPM cap, overlay render) to use `einkMode`. | `src/hooks/useEinkController.ts`, `src/components/ReaderContainer.tsx` |
| 6 | Hippocrates | **Tests** — (a) `einkMode` toggle applies `data-eink` attribute. (b) `data-eink="true"` + `data-theme="dark"` doesn't conflict. (c) E-ink behavioral CSS (transition:none) applies independently of theme. (d) WPM cap respects `einkMode`, not theme. (e) Refresh overlay fires when `einkMode` is on regardless of theme. ≥8 new tests. | `tests/` |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Herodotus | **Documentation pass** | All 6 governing docs |
| 10 | Hermes | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `einkMode` setting exists, persists, and toggles independently of theme
2. `data-eink="true"` attribute applied to root when einkMode is on
3. E-ink behavioral CSS (no transitions, larger targets, no hover) applies on any theme when einkMode is on
4. E-ink greyscale color palette applies only when `data-theme="eink"` is selected
5. WPM ceiling enforced by einkMode, not by theme
6. Refresh overlay fires based on einkMode, not theme
7. ThemeSettings shows independent einkMode toggle with sub-settings
8. ≥8 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (TTS stabilization complete)

---

### Sprint EINK-6B: E-Ink Reading Ergonomics & Mode Strategy

**Goal:** Add e-ink-aware reading mode variants that respect the physical constraints of e-ink displays: slow refresh (120–450ms), coarse pixel density, touch-only input, and ghosting artifacts. Stepped flow (chunk-based page advance) and burst focus (multi-word grouping with tuned timing) give e-ink users reading modes that feel native to their hardware instead of fighting it.

**Problem:** All four reading modes (Page, Focus, Flow, Narration) assume a fast LCD/OLED display. Flow mode's smooth per-line scroll causes severe ghosting on e-ink. Focus mode's rapid single-word RSVP flashes cause incomplete refresh cycles. Page mode works acceptably but page turns are slow. Users on e-ink devices get a degraded experience in every mode except Page, and even Page could be better with larger paragraph-level navigation.

**Design decisions:**
- **Stepped Flow mode.** When `einkMode` is on and Flow mode is active, replace per-line smooth scroll with chunk-based page advance: display N lines (configurable, default `EINK_LINES_PER_PAGE = 20`), pause for reading time based on WPM, then full-page advance to next N lines. No animation — instant replace. Cursor behavior: shrinking underline still paces within the visible chunk, but page transitions are instant.
- **Burst Focus mode.** When `einkMode` is on and Focus mode is active, group words into 2–3 word phrases (using existing `einkPhraseGrouping` setting). Display each group for the duration that single words would take at current WPM. This reduces the number of screen redraws per minute by 2–3x, making focus mode usable on e-ink.
- **Adaptive refresh heuristic.** Replace the fixed-interval refresh counter with a content-change-aware heuristic: track cumulative pixel change area across page turns (estimate from word count delta). Trigger refresh when estimated ghosting exceeds a threshold. Keep manual interval as fallback/override. New constants: `EINK_GHOSTING_THRESHOLD`, `EINK_ADAPTIVE_REFRESH_ENABLED`.
- **No changes to Narration or Page modes.** Narration is audio-driven (e-ink display updates are sparse). Page mode already works well with the behavioral CSS from EINK-6A.

**Baseline:**
- `src/modes/FlowMode.ts` — word-by-word timing, `FlowScrollEngine` integration
- `src/modes/FocusMode.ts` — single-word RSVP timing
- `src/hooks/useEinkController.ts` — fixed-interval refresh counter (from EINK-6A: now einkMode-aware)
- `src/utils/FlowScrollEngine.ts` — scroll container, cursor rendering
- `src/constants.ts` — `EINK_LINES_PER_PAGE = 20`, phrase grouping defaults

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section + EINK-6A spec
4. `src/modes/FlowMode.ts` — current word-by-word advance logic
5. `src/modes/FocusMode.ts` — current RSVP logic
6. `src/utils/FlowScrollEngine.ts` — scroll engine internals
7. `src/hooks/useEinkController.ts` — refresh controller (post-EINK-6A)
8. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **Stepped Flow mode** — In FlowMode.ts: when `einkMode` is on, switch from per-line scroll to chunk-based advance. Display `EINK_LINES_PER_PAGE` lines, pause for calculated reading time, then instant-replace with next chunk. Cursor behavior: shrinking underline paces within visible chunk. Page transitions have no animation (`transition: none` already in eink behavioral CSS). | `src/modes/FlowMode.ts`, `src/utils/FlowScrollEngine.ts` |
| 2 | Hephaestus (renderer-scope) | **Burst Focus mode** — In FocusMode.ts: when `einkMode` is on and `einkPhraseGrouping` is true, group words into 2–3 word phrases. Display each phrase for the combined word duration at current WPM. Use the existing segmentation (whitespace-based) with configurable max group size (new constant `EINK_BURST_GROUP_SIZE = 3`). | `src/modes/FocusMode.ts`, `src/constants.ts` |
| 3 | Hephaestus (renderer-scope) | **Adaptive refresh heuristic** — Extend `useEinkController.ts`: track cumulative word count across page turns since last refresh. When cumulative words exceed `EINK_GHOSTING_THRESHOLD` (new constant, default 500), trigger refresh. Existing manual interval remains as override (refresh at whichever threshold triggers first). Add `EINK_ADAPTIVE_REFRESH_ENABLED` constant (default true). | `src/hooks/useEinkController.ts`, `src/constants.ts` |
| 4 | Hippocrates | **Tests** — (a) Stepped flow: einkMode on → chunk-based advance with correct timing. (b) Stepped flow: einkMode off → normal per-line scroll (no regression). (c) Burst focus: 2–3 word grouping with combined timing. (d) Burst focus: single-word fallback when phrase grouping off. (e) Adaptive refresh: triggers at word threshold. (f) Adaptive refresh: manual interval still works as override. ≥10 new tests. | `tests/` |
| 5 | Hippocrates | **`npm test` + `npm run build`** | — |
| 6 | Solon | **Spec compliance** | — |
| 7 | Herodotus | **Documentation pass** | All 6 governing docs |
| 8 | Hermes | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Flow mode in einkMode uses chunk-based page advance (no smooth scroll)
2. Chunk size configurable via `EINK_LINES_PER_PAGE`
3. Focus mode in einkMode groups words into 2–3 word phrases when phrase grouping is on
4. Phrase display timing equals combined single-word duration at current WPM
5. Adaptive refresh triggers based on cumulative word count, not just fixed interval
6. Manual refresh interval still works as override
7. Non-eink behavior in Flow and Focus modes unchanged (no regression)
8. ≥10 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** EINK-6A

---

### Sprint GOALS-6B: Reading Goal Tracking

**Goal:** Add a lightweight reading goal system — set daily/weekly/monthly targets, track progress, and see visual feedback. Goals are optional, local-first, and non-intrusive. They surface progress without blocking reading.

**Problem:** Blurby tracks reading activity implicitly (time spent, pages turned, books in library) but gives users no way to set targets or see whether they're meeting them. Users who want to build a reading habit have no feedback loop. The reading queue (READINGS-4A) tells you what to read next; goals tell you how much to read.

**Design decisions:**
- **Three goal types.** Daily pages, daily minutes, weekly books. Each is independently configurable. Users can set zero, one, or all three. Stored in settings as a `goals` array of `ReadingGoal` objects.
- **Progress tracking via existing signals.** Pages: increment on page turn or word advance (1 page = `WORDS_PER_PAGE` words, consistent with existing pagination). Minutes: increment via `requestAnimationFrame` tick while any reading mode is active (Page, Focus, Flow, or Narration). Books: increment on book completion (existing `markComplete` action). No new data collection — we derive everything from existing events.
- **Library widget.** Compact progress bar(s) below the library header showing today's/this week's progress. Clicking opens the Goals detail view. Optionally collapsed to just an icon when goals are met.
- **Settings sub-page.** New `ReadingGoalsSettings.tsx` under Settings. Create/edit/delete goals. See current streaks. Reset daily at midnight local time; reset weekly on Monday.
- **Streak counter.** Track consecutive days meeting daily goal (or consecutive weeks meeting weekly goal). Display in settings and optionally on library widget. Stored as `currentStreak: number` and `lastStreakDate: string` in goal object.
- **No notifications in v1.** Gentle progress display only — no push notifications, no toasts, no modals. Keep it pull-based (user checks when they want to).
- **Local-first.** Goal data stored in settings JSON alongside other preferences. No cloud sync in this sprint (Phase 7 can add sync later). No IPC needed — goals are renderer-side state, computed from existing reading events.

**Baseline:**
- `src/types.ts` — settings schema (no goals fields yet)
- `src/contexts/SettingsContext.tsx` — settings propagation
- `src/components/LibraryContainer.tsx` — library header area where widget would live
- `src/components/settings/` — existing settings sub-pages (model for new GoalsSettings)
- `src/hooks/useReader.ts` — reading activity events (page turns, word advance)
- `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema (where ReadingGoal type will live)
5. `src/contexts/SettingsContext.tsx` — settings context pattern
6. `src/components/LibraryContainer.tsx` — library header for widget placement
7. `src/components/settings/SpeedReadingSettings.tsx` — model settings sub-page structure
8. `src/hooks/useReader.ts` — reading activity events
9. `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **ReadingGoal type + settings schema** — Add `ReadingGoal` interface to types.ts: `{ id: string, type: 'daily-pages' | 'daily-minutes' | 'weekly-books', target: number, currentStreak: number, lastStreakDate: string }`. Add `goals: ReadingGoal[]` to settings (default empty array). Add `goalProgress: { todayPages: number, todayMinutes: number, weekBooks: number, lastResetDate: string }` to settings for tracking state. | `src/types.ts`, `src/constants.ts` |
| 2 | Hephaestus (renderer-scope) | **useReadingGoals hook** — New hook that: reads goals + progress from settings, provides `incrementPages(count)`, `incrementMinutes(delta)`, `incrementBooks()` methods, auto-resets daily counters at midnight (check `lastResetDate` on each read), auto-resets weekly counters on Monday, updates streak on daily reset (met yesterday's goal → streak+1, else reset to 0). | `src/hooks/useReadingGoals.ts` (new) |
| 3 | Hephaestus (renderer-scope) | **Wire progress tracking** — In ReaderContainer.tsx: call `incrementPages` on page turn events, call `incrementMinutes` from a 1-minute interval while any reading mode is active, call `incrementBooks` when book is marked complete. All calls go through the `useReadingGoals` hook. | `src/components/ReaderContainer.tsx` |
| 4 | Hephaestus (renderer-scope) | **GoalProgressWidget** — Compact component for library header: one progress bar per active goal (thin, accent color, percentage fill). Show "3/10 pages today" or "45/60 min today" labels. When all goals met, collapse to checkmark icon. Click navigates to goals settings. | `src/components/GoalProgressWidget.tsx` (new), `src/styles/global.css` |
| 5 | Hephaestus (renderer-scope) | **ReadingGoalsSettings** — New settings sub-page. List active goals with edit/delete. "Add Goal" button → inline form (type selector, target number). Show current streak per goal. | `src/components/settings/ReadingGoalsSettings.tsx` (new), `src/components/SettingsMenu.tsx` |
| 6 | Hephaestus (renderer-scope) | **Wire widget into library** — Add `GoalProgressWidget` to LibraryContainer header area. Only render when `settings.goals.length > 0`. | `src/components/LibraryContainer.tsx` |
| 7 | Hippocrates | **Tests** — (a) Goal creation persists to settings. (b) Daily reset clears page/minute counters at midnight. (c) Weekly reset clears book counter on Monday. (d) Streak increments when daily goal met before reset. (e) Streak resets when daily goal not met. (f) Progress widget renders correct fill percentage. (g) Widget hidden when no goals set. (h) incrementPages/incrementMinutes/incrementBooks update correctly. ≥10 new tests. | `tests/` |
| 8 | Hippocrates | **`npm test` + `npm run build`** | — |
| 9 | Solon | **Spec compliance** | — |
| 10 | Herodotus | **Documentation pass** | All 6 governing docs |
| 11 | Hermes | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Users can create daily-pages, daily-minutes, and weekly-books goals in settings
2. Goals persist in settings and survive app restart
3. Page turns during any reading mode increment today's page count
4. Active reading time (any mode) increments today's minutes count
5. Book completion increments weekly book count
6. Daily counters reset at midnight local time
7. Weekly counters reset on Monday
8. Streak tracks consecutive days meeting daily goal
9. GoalProgressWidget shows in library header when goals exist
10. Widget shows correct progress bars with labels
11. Widget collapses to checkmark when all goals met
12. No goals → no widget (clean library header)
13. ≥10 new tests
14. `npm test` passes
15. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (independent of EINK-6A/6B — can run in parallel)
