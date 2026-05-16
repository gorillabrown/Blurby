# Roadmap Archive — Completed Phases, Deferred Tracks & Idea Themes (2026-05-15)

**Archived from ROADMAP.md to maintain document size under 30k characters. Active sprint specs remain in ROADMAP.md.**

---

## Phases 2–5 — COMPLETE

> All Phase 2–5 sprint specs archived to `docs/planning/.Archive/ROADMAP_legacy.md`. Summary below.

| Phase | Sprints | Final Version | Key Deliverables |
|-------|---------|---------------|------------------|
| 2: EPUB Fidelity | EPUB-2A, EPUB-2B | v1.5.1 | Format preservation, image extraction, DOCX/URL→EPUB, single rendering path |
| 3: Flow Mode | FLOW-3A, FLOW-3B | v1.6.1 | Infinite scroll, FlowScrollEngine, dead code removal |
| 4: Readings | READINGS-4A, 4B, 4C | v1.9.0 | Card metadata, queue, author normalization, metadata wizard |
| 5: Chrome Extension | EXT-5A, EXT-5B + TTS Smoothness | v1.11.0 | E2E pipeline tests, 6-digit pairing, background cache wiring |

---

## Phase 6 — TTS Hardening & Stabilization + Follow-On Hotfixes

> All TTS-6 and TTS-7 sprint specs archived to `docs/planning/.Archive/ROADMAP_legacy.md`. Summary below.

| Lane | Sprints | Versions | Key Deliverables |
|------|---------|----------|------------------|
| TTS-6 | TTS-6C→6S + HOTFIX-11 | v1.14.0–v1.28.0 | Native-rate buckets, startup hardening, pronunciation overrides, word alignment, accessibility, profiles, portability, runtime stability, performance budgets, session continuity, diagnostics, cursor sync |
| TTS-7 (stabilization + hotfix) | TTS-7A→7L | v1.29.0–v1.33.7 | Cache correctness, cursor contract (dual ownership), throughput/backpressure, integration verification, proactive entry-cache coverage + cruise warm, clean Foliate DOM probing, first-chunk IPC verification, visible-word/startup fixes, Foliate follow-scroll unification + exact miss recovery, final Foliate section-sync / word-source dedupe / initial-selection protection, EPUB global word-source promotion, and exact text-selection mapping. TTS hotfix lane CLOSED at v1.33.7. |

**Architecture post-stabilization:** Narration state machine, cache identity contract (voice + override hash + word count), cursor ownership (playing = TTS owns, paused = user owns), pipeline pause/resume (emission gating), backpressure (TTS_QUEUE_DEPTH), narration start <50ms per microtask. Documented in TECHNICAL_REFERENCE.md § "Narrate Mode Architecture."

**Closeout note:** Live testing on 2026-04-04 showed that cold-start narration on freshly opened EPUBs still had page-jump and ramp-up continuity regressions after `TTS-7E`. `TTS-7F` closed the reactive-cache side of that gap, and `TTS-7G` verified that `BUG-117` (910ms first-chunk IPC handler) was already resolved by prior work. `TTS-7H` fixed the frozen-start-index and section-fallback pieces, `TTS-7I` unified follow-scroll ownership and exact miss recovery, `TTS-7J` resolved section-sync blink, word-source duplication, and initial-selection overwrite, `TTS-7K` promoted full-book EPUB words as the active source of truth, and `TTS-7L` closed the final selection-path gap by preserving exact word identity across click and native text selection. Phase 6 TTS is now fully stabilized and closed at `v1.33.7`.

> All TTS-7E through TTS-7R, EXT-5C, and HOTFIX-12 sprint specs archived to `docs/planning/.Archive/ROADMAP_legacy.md`.

---


## Completed Work Summary

> Full specs for completed sprints are archived across `docs/planning/.Archive/ROADMAP_legacy.md`, `docs/planning/.Archive/ROADMAP_2026-05-02.md`, and `docs/planning/.Archive/ROADMAP_2026-05-14.md`.

| Sprint | Version | Date | Result | Archive |
|--------|---------|------|--------|--------|
| TTS-DIAG-1 | — | 2026-05-15 | Provider-neutral `tts-diagnostics-v1` narration diagnostics bundle added on pushed stacked branch `sprint/tts-diag-1-diagnostics-bundle` (`c97e446`). Bundle captures provider capabilities, engine/voice/rate, segment IDs, original/normalized hashes, cache key components, timing sidecar summaries, scheduler truth events, highlight sync decisions, and relevant errors while stripping/rejecting raw text and audio-shaped payloads. Canonical `main` merge pending until TTS-SYNC-1 lands. | [Closeout](docs/governance/close-outs/CloseOut.TTS-DIAG-1.2026-05-15.md) |
| TTS-SYNC-1 | — | 2026-05-15 | Timing metadata and highlight sync policy centralized on pushed branch `sprint/tts-sync-1-highlight-controller` (`142dc24`). `TimingMetadataStore` stores trusted/heuristic/missing timing metadata; `HighlightSyncController` allows word sync only for trusted word-native timing and downgrades heuristic/missing timing to chunk/segment decisions with no invented active word. Canonical `main` merge pending because main worktree is dirty. | [Closeout](docs/governance/close-outs/CloseOut.TTS-SYNC-1.2026-05-15.md) |
| TTS-CACHE-TIMING-1 | — | 2026-05-13 | Structured v2 TTS cache identity and `.timing.json` sidecars added while preserving legacy v1 cache reads. New entries carry schema/versioned provider, voice, rate, model, source/normalized hashes, normalizer version, pronunciation override hash, document locator, chunk ID, sample rate, and timing truth. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| TTS-NORMALIZE-1 | — | 2026-05-13 | Deterministic spoken segment normalization added with original/normalized metadata, versioned hashes, golden fixtures, and Kokoro cache identity participation while preserving original display/highlight words. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| TTS-REGISTRY-1 | — | 2026-05-12 | Provider capability truth added for Web Speech, Kokoro, disabled Qwen, MOSS-Nano, and Pocket TTS. Settings/status surfaces read scoped provider labels, posture, and readiness hints from the registry. Playback behavior and engine posture unchanged. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| KOKORO-DEEPEN-3 | — | 2026-05-11 | Weighted Kokoro voice formulas are non-viable on Blurby's current `kokoro-js` / ONNX runtime. Valid single voices pass; weighted formula strings are rejected as unknown voice IDs; no public voice-mixing UX or runtime replacement was introduced. | `docs/testing/kokoro-voice-mixing-evidence.md`; durable closeout landed |
| KOKORO-DEEPEN-2 | — | 2026-05-11 | Kokoro-backed Narrate now uses shared natural chunks, light chunk highlight, trusted-timestamp-only bold word highlight, and chunk-only fallback when timing is missing. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| KOKORO-DEEPEN-1 | — | 2026-05-11 | Kokoro readiness/preflight truth added across main process, IPC/preload, renderer settings, shared types, tests, and setup/troubleshooting docs while preserving Kokoro default playback semantics. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| POSTV2-REVIEW-1 | — | 2026-05-11 | Post-v2 remediation and CHUNK-SYNC Flow visual work reviewed, committed, merged, and pushed; governance advanced to the Kokoro Deepening lane. | `docs/governance/close-outs/CloseOut.POSTV2-AUDIT-REMEDIATION.2026-05-04.md`; active review closeout |
| EINK-6B | v1.75.2 | 2026-05-02 | E-ink Flow now advances by instant 20-line chunks instead of smooth/per-line scroll; Focus phrase grouping is shared/tested for 2-3 word bursts when `einkMode` + `einkPhraseGrouping` are enabled; adaptive ghosting refresh accumulates content-change load while preserving manual page-turn interval fallback. Verification: focused EINK/Flow slice 5 files / 93 tests, full `npm test` 151 files / 2407 tests, `npm run build`, `npm audit --audit-level=high`, `git diff --check`. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| EINK-6A | v1.75.1 | 2026-05-02 | E-ink display mode decoupled from theme; `einkMode` schema/defaults/migration added; behavioral CSS now keys off `[data-eink="true"]`; greyscale palette remains optional under `[data-theme="eink"]`. Verification: focused EINK/NARR tests 36 pass, full `npm test` 150 files / 2397 tests, `npm run build`, `npm audit --audit-level=high`, `git diff --check`. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) (full spec migrated 2026-05-02 PM) |
| SELECTION-1 | v1.38.0 | 2026-04-06 | Word anchor contract, BUG-151/152/153 resolved | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| HOTFIX-14 | v1.38.2 | 2026-04-06 | URL extraction + connection fixes, BUG-155/156/157/158 | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| NARR-CURSOR-1 | v1.40.0 | 2026-04-07 | Collapsing narration cursor | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| HOTFIX-15 | v1.43.1 | 2026-04-07 | Narration cursor polish, BUG-159/160/161 | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| STAB-1A | v1.45.0 | 2026-04-07 | Startup & flow stabilization, BUG-162/163/164/165 | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| PERF-1 | v1.47.0 | 2026-04-07 | Full performance audit & remediation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| REFACTOR-1A | v1.48.0 | 2026-04-07 | ReaderContainer decomposition, 5 custom hooks | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| REFACTOR-1B | v1.49.0 | 2026-04-07 | Component & style cleanup, CSS split | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TEST-COV-1 | v1.50.0 | 2026-04-16 | Critical path test coverage + security hardening | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| NARR-LAYER-1A | v1.51.0 | 2026-04-16 | Narration as flow layer foundation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| NARR-LAYER-1B | v1.52.0 | 2026-04-16 | Narration as flow layer consolidation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-EVAL-1 | v1.53.0 | 2026-04-16 | Flow/narration sync and audio quality harness | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-EVAL-2 | v1.54.0 | 2026-04-16 | TTS evaluation matrix & soak runner | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-EVAL-3 | v1.55.0 | 2026-04-16 | TTS quality gates & release baseline | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-HARDEN-1 | v1.56.0 | 2026-04-16 | Kokoro bootstrap truth & engine recovery | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-HARDEN-2 | v1.57.0 | 2026-04-17 | Narration handoff integrity & extraction dedupe | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-RATE-1 | v1.58.0 | 2026-04-17 | Pitch-preserving tempo for Kokoro | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| EPUB-TOKEN-1 | v1.59.0 | 2026-04-17 | Dropcap + split-token word stitching | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| FLOW-INF-A | v1.41.0 | 2026-04-07 | Reading zone & visual pacing | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| FLOW-INF-B | v1.42.0 | 2026-04-07 | Timer cursor & pacing feedback | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| EXT-ENR-A | v1.39.0 | 2026-04-07 | Resilient extension connection | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| EXT-ENR-B | v1.43.0 | 2026-04-07 | Auto-discovery pairing | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| NARR-TIMING | v1.44.0 | 2026-04-07 | Real word-level timestamps from Kokoro TTS | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-CONT-1 | v1.60.0 | 2026-04-17 | Readiness-driven section & cross-book continuity | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-RATE-2 | v1.61.0 | 2026-04-17 | Segmented live Kokoro rate response | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| TTS-START-1 | v1.62.0 | 2026-04-17 | Startup parity & opening cache contract | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| READER-4M-2 | v1.69.0 | 2026-04-18 | Standalone narrate mode & four-button controls | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| READER-4M-3 | v1.72.0 | 2026-04-19 | Global word anchor & cross-mode continuity | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| QWEN-STREAM-1 | v1.71.0 | 2026-04-18 | Streaming sidecar foundation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| QWEN-STREAM-4 | v1.75.0 | 2026-04-21 | Live validation + promotion decision (ITERATE) | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-6F | — | 2026-05-01 | Full bounded soak promotion confirmation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-HOST-1 | — | 2026-04-27 | Native/WSL runtime escape hatch | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-HOST-2 | — | 2026-04-27 | Evidence normalization + governance closeout | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-1 | — | 2026-04-28 | CPU realtime candidate bring-up | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-2 | — | 2026-04-28 | Runtime latency rescue | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-3 | — | 2026-04-28 | In-process runtime reuse & first-audio truth | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-4 | — | 2026-04-29 | Resident runtime optimization + promotion retest | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-5B | — | 2026-04-29 | Precompute + adjacent continuity closure | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-5C | — | 2026-04-29 | Segment-first soak gate | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-6E | — | 2026-04-30 | Shutdown/restart lifecycle proof | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-6D | — | 2026-04-30 | Bounded resident lifecycle / process recycling | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-6C | — | 2026-04-30 | Memory / tail-latency / lifecycle fix | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-6B | — | 2026-04-29 | Resident soak memory / lifecycle closure | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-7 | — | 2026-04-30 | Sidecar contract + IPC prototype | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-8 | — | 2026-04-30 | Narration strategy + segment timing | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-9 | — | 2026-05-01 | Cache/prefetch + continuity handoffs | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-10 | — | 2026-05-01 | Settings UX + engine selection | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-11 | — | 2026-05-01 | Productization gate + default decision | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-NANO-12 | — | 2026-05-02 | Live four-mode evidence capture | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-RCA-1 | — | 2026-04-27 | Flagship runtime root-cause autopsy | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-RUNTIME-1 | — | 2026-04-27 | Make flagship runtime real | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-0 | — | 2026-04-26 | Flagship feasibility & host truth | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-1 | — | 2026-04-26 | CPU-only runtime bring-up outside Blurby | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-2 | — | 2026-04-26 | Flagship quality & performance benchmark | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| MOSS-SPEED-1 | — | 2026-04-27 | Flagship runtime performance rescue | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| READER-4M-1 | v1.63.0 | 2026-04-18 | Infinite-scroll surface recovery + explicit four-mode foundation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| QWEN-PROT-1 | v1.64.0 | 2026-04-18 | Qwen engine surface + unavailable-state foundation | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| QWEN-PROT-2 | v1.65.0 | 2026-04-18 | Qwen sidecar runtime + live prototype playback | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| QWEN-STREAM-2 | v1.73.0 | 2026-04-20 | StreamAccumulator + streaming strategy + live playback | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| QWEN-STREAM-3 | v1.74.0 | 2026-04-20 | Streaming hardening + evidence + decision gate | [Archive](docs/planning/.Archive/ROADMAP_2026-05-02.md) |
| GOALS-6B | — | 2026-05-02 | Reading goal tracking: daily pages, daily minutes, weekly books; settings create/edit/delete; library widget; progress tracking; streak display. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| MOSS-NANO-13a | — | 2026-05-03 | Real sidecar adapter: stub replaced with Python subprocess adapter for ONNX synthesis. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| MOSS-NANO-13b | — | 2026-05-03 | Engine hardening: timeout enforcement, scope-change invalidation, cache key length-fingerprint. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| MOSS-NANO-13c | — | 2026-05-03 | Live evidence schema v2 + producer + gate provenance validation. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| MOSS-NANO-13d | — | 2026-05-04 | Live four-mode capture: real app-selected Nano evidence, gate PASS, decision NANO_RECOMMENDED_OPT_IN. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| MOSS-NANO-13e | — | 2026-05-04 | Recommended opt-in product decision closeout. Nano recommended opt-in; Kokoro default; Qwen disabled. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| POCKET-TTS-1 | — | 2026-05-04 | Pocket TTS engine integration: sidecar, IPC, strategy, settings; available opt-in third engine. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| POLISH-1 | — | 2026-05-04 | Desktop v2 polish bundle: TTS settings release posture, E-Ink switches, Goals empty states. | [Archive](docs/planning/.Archive/ROADMAP_2026-05-14.md) |
| SK-HYG-1 | — | 2026-05-02 | Roadmap hygiene & queue recovery (governance only). Archive-forward discipline, queue GREEN, Standing Rules, Desktop v2.0 conveyor. | [Review artifacts](docs/planning/roadmap-reviews/) |
| BRAND-HYG-1 | — | 2026-05-02 | Shelved / no-op. Expected brand theme edits not present in checkout. | [Review artifacts](docs/planning/roadmap-reviews/) |


## Track B: Chrome Extension Enrichment (EXT-ENR)

> **Vision:** The Chrome extension connection becomes effortless and resilient. No manual code entry on reconnect, no dropped connections on sleep/wake, and the app actively invites pairing when it senses an incoming connection attempt.

### Current State (v1.38.2)

- **WebSocket server** (`main/ws-server.js`, 529 lines) — localhost port 48924, custom RFC 6455, pairing token auth via `safeStorage`. HOTFIX-14: auth-filtered `getClientCount()`, 15s heartbeat, 5s UI polling.
- **Chrome extension** (`chrome-extension/`, in-repo) — service-worker.js (592 lines), popup.js (238 lines), popup.html, manifest.json. Flat 5s reconnect, fire-and-forget article send, no pending persistence.
- **Pairing flow** — 6-digit short code with 5min TTL, long-lived token stored in safeStorage (server) + chrome.storage.local (extension). Token survives app restart.
- **Article import** — `add-article` message type, HTML→EPUB conversion, hero image extraction, auto-queue. No delivery confirmation.
- **Known pain points (post-HOTFIX-14):** Flat 5s reconnect (no backoff), pending articles lost on service worker kill, no delivery confirmation, unbounded EADDRINUSE retry, no auth timeout, binary connected/disconnected UI.

### Investigation Gate — Track B: ✅ CLEARED

All three investigation areas resolved:
- **WebSocket lifecycle:** Fully traced. `_clients` Set: add at line 144 (pre-auth), delete on socket close (152), error (157), WS close frame (174), heartbeat fail (466), heartbeat error (473). `getClientCount()` now auth-filtered (HOTFIX-14).
- **Extension source code:** Located at `chrome-extension/` in-repo. Full reconnect logic, state vars, message flow traced.
- **IPC event emission:** Renderer polled via `get-ws-short-code` IPC every 15s (ConnectorsSettings). Push events `ws-connection-attempt` / `ws-pairing-success` now emitted by server (EXT-ENR-B, v1.43.0) — renderer subscribes via `onWsConnectionAttempt` / `onWsPairingSuccess` preload listeners.


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
- `docs/planning/specs/.Archive/2026-03-27-android-app-design.md` — React Native + Expo monorepo (better native feel, larger effort)
- `docs/planning/specs/.Archive/phase-10-android-app.md` — Capacitor wrapper (max code reuse, faster to ship)

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
| **D: Reading Intelligence** | Goals, streaks, analytics, AI recommendations | GOALS-6B active (Desktop v2.0 conveyor); rest backlog |
| **E: Content & Formats** | Chapter detection, auto TOC, OCR PDFs | Backlog (Phase 10+) |
| **F: Library & UX Polish** | 3-line cards, auto-clear dots, vocab builder, annotation export | Backlog (fold into any sprint) |
| **G: Settings & Ctrl+K** | Combine settings pages, all settings searchable | Backlog (small wins) |
| **H: Reading Tweaks** | Space bar mode, arrow speed, voice cloning, AI summaries | Backlog (bundleable) |
| **I: Branding** | Remove [Sample], Blurby icon, brand theme, window controls | Backlog (cosmetic, anytime) |
| **J: Social** | Reading clubs, shared lists, group discussions | Someday (needs server) |
| **K: E-Ink** | Display mode decoupling, e-ink reading ergonomics | Done for Desktop v2.0 (EINK-6A/6B complete) |

---
