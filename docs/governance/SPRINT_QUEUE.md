BLURBY

# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top pointer, read the referenced Roadmap section, then execute from the full spec. After completion, remove it, log it, backfill to ≥3.

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained at all times. If depth drops below 3 after completion: Cluade Code investigates bottlenecks and issues; Cowork brainstorms and drafts specs (if next work is known) or stops to discuss (if not); Claude CLI performs work/receives dispatches. 

No dispatch fires until ≥3 pointers exist with full specs in the Roadmap, and no code-changing pointer is dispatch-ready unless its referenced spec names explicit edit-site coordinates.

**How to use:**
1. Pull the top pointer block
2. Open the Roadmap section listed on the `Read:` line — that's the full dispatch spec
3. Confirm the full spec includes explicit edit-site coordinates for every planned code change: file, function/method, approximate live anchor, and exact modification type. If any code-changing step lacks coordinates, stop and harden the spec before dispatch.
4. Execute from the Roadmap spec under `gog-lead` orchestration with the named sub-agent roster
5. After completion: doc-keeper marks the Roadmap section COMPLETED, removes the pointer, logs to completed table
6. Cowork prints the next pointer and checks queue depth


---

```
SPRINT QUEUE STATUS:
Queue depth: 2 — YELLOW
Next sprint: REFACTOR-1B (Component & Style Cleanup)
Health: YELLOW — REFACTOR-1B → TEST-COV-1 spec'd. Backfill needed to restore GREEN (≥3).
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | REFACTOR-1B | v1.49.0 | `sprint/refactor-1b-style-cleanup` | Full | **YES** | Full spec: 12 tasks (2 waves), 18 success criteria. FoliatePageView helper extraction, TTSSettings sub-components, inline style→CSS migration (179→<30), global.css split into 8 domain files. Audit findings H-1, H-2, M-1, M-4, M-7. Depends on REFACTOR-1A (complete). |
| 2 | TEST-COV-1 | v1.50.0 | `sprint/test-cov-1-critical-paths` | Full | **YES** | Full spec: 11 tasks (2 waves), 16 success criteria. Auth/cloud/queue/ErrorBoundary/foliateWordOffsets tests (≥52 new), URL scheme validation security fix. Audit findings H-4, H-5, M-5, M-6. Independent — can parallel. |

**Dispatch status:** Queue depth 2 — YELLOW. REFACTOR-1B → TEST-COV-1 fully spec'd. Backfill sprint 3 before next dispatch.

**Next Cowork actions:**
1. ~~Dispatch FLOW-INF-A to CLI~~ — COMPLETE (v1.41.0)
2. ~~Dispatch FLOW-INF-B to CLI~~ — COMPLETE (v1.42.0)
3. ~~Backfill queue to ≥3~~ — DONE (FLOW-INF-C spec'd)
4. ~~Dispatch EXT-ENR-B to CLI~~ — COMPLETE (v1.43.0)
5. ~~Backfill queue to ≥3~~ — DONE (HOTFIX-15 spec'd, queue GREEN)
6. ~~Dispatch HOTFIX-15 to CLI~~ — COMPLETE (v1.43.1)
7. ~~Dispatch NARR-TIMING to CLI~~ — COMPLETE (v1.44.0)
8. ~~Backfill queue~~ — STAB-1A spec'd (queue YELLOW, depth 2)
9. ~~Backfill queue to ≥3~~ — DONE (PERF-1 spec'd, queue GREEN depth 3)
10. ~~Dispatch STAB-1A to CLI~~ — COMPLETE (v1.45.0)
11. ~~Dispatch FLOW-INF-C to CLI~~ — COMPLETE (v1.46.0)
12. ~~Dispatch PERF-1 to CLI~~ — COMPLETE (v1.47.0)
13. ~~Backfill queue to ≥3~~ — DONE (REFACTOR-1A/1B + TEST-COV-1 spec'd from Aristotle audit, queue GREEN depth 3)
14. ~~Dispatch REFACTOR-1A to CLI~~ — COMPLETE (v1.48.0)
15. **Backfill queue to ≥3** — YELLOW, depth 2. Spec a third sprint before dispatching REFACTOR-1B.
16. **Dispatch REFACTOR-1B to CLI** — after backfill.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| HOTFIX-13 | **Dissolved.** BUG-151/152/153 absorbed into SELECTION-1. BUG-154 parked (likely not a bug — needs live verification). |
| EINK-6A | Parked. Fully spec'd in ROADMAP.md. Re-queue when e-ink becomes priority. |
| EINK-6B | Parked. Fully spec'd in ROADMAP.md. Depends on EINK-6A. |
| GOALS-6B | Parked. Fully spec'd in ROADMAP.md. Independent — can run anytime. |
| EXT-ENR-C | Documented but deferred. In-browser reader is lower priority than connection fixes. |
| APK-0 | Roadmapped, not yet execution-ready. Needs detailed WHERE/Tasks/SUCCESS CRITERIA. |
| APK-1–4 | Roadmapped, not yet execution-ready. Depend on APK-0. |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| REFACTOR-1A | 2026-04-07 | PASS | ReaderContainer decomposition: 33 useEffects → 5 custom hooks (useNarrationSync, useNarrationCaching, useFlowScrollSync, useFoliateSync, useDocumentLifecycle), fileHashes cleanup on document delete, main.js constants extracted to main/constants.js. 74 new tests (1,860 total across 100 files). v1.48.0. |
| PERF-1 | 2026-04-07 | PASS | Full performance audit & remediation: startup parallelized (`loadState`→`createWindow`→`Promise.all([initAuth,initSyncEngine])`), folder watcher before sync, `getComputedStyle` cached (3→1 call), settings saves debounced 500ms, WPM persistence debounced 300ms, EPUB chapter cache LRU 50-cap, snoozed doc Set index, voice sync deps 7→2, Vite code splitting (vendor/tts/settings, 16 chunks), `rebuildLibraryIndex` debounced 100ms. 32 new tests (1,786 total across 98 files). v1.47.0. |
| FLOW-INF-C | 2026-04-07 | PASS | Cross-book continuous reading: transition overlay (2.5s countdown), auto-open next queued book + resume flow, `getNextQueuedBook()` utility, `finishReadingWithoutExit()` for seamless book switching, Escape/click-to-cancel. 21 new tests (1,754 total across 97 files). v1.46.0. |
| STAB-1A | 2026-04-07 | PASS | Startup & flow stabilization: `.foliate-loading` CSS (pulsing backdrop), async `wrapWordsInSpans` (batched setTimeout yields), TTS preload verified wired, sentence-snap tolerance ±15→±25, FlowScrollEngine `buildLineMap()` retry (5×100ms) + instant initial scroll. BUG-162/163/164/165 resolved. 19 new tests (1,736 total across 96 files). v1.45.0. |
| NARR-TIMING | 2026-04-07 | PASS | Real word-level timestamps from Kokoro duration tensor. kokoro-js fork (patch-package), 4-layer validation, scheduler integration with heuristic fallback. BUG-161 fully resolved. 18 new tests (1,717 total across 95 files). v1.44.0. |
| HOTFIX-15 | 2026-04-07 | PASS | Narration cursor polish: colRight ancestor tightened to `p, blockquote, li, figcaption` + width guard (95% cap) + null guard (BUG-159). Proportional band height `lineHeight * 1.08` + dynamic re-measurement on word change >2px threshold (BUG-160). Truth-sync interval halved 12→6 words (BUG-161 partial). 16 new tests (1,699 total across 94 files). v1.43.1. |
| EXT-ENR-B | 2026-04-07 | PASS | Push event system for Chrome extension auto-discovery. Server emits `ws-connection-attempt` / `ws-pairing-success` events. `PairingBanner` in library screen shows pairing code with countdown, auto-dismisses on success, suppresses when already connected, 60s cooldown on dismiss. `ConnectorsSettings` polling reduced 5s→15s. 29 new tests (1,683 total across 93 files). v1.43.0. |
| FLOW-INF-B | 2026-04-06 | PASS | Timer bar cursor (5px/6px e-ink, accent glow, line-completion flash), FlowProgress computation with chapter/book percentage + estimated time remaining, ReaderBottomBar progress display. 18 new tests (1,654 total across 92 files). v1.42.0. |
| FLOW-INF-A | 2026-04-06 | PASS | CSS mask-image reading zone with configurable position/size, FlowScrollEngine dynamic zone position, ReaderBottomBar zone controls, ResizeObserver recomputation. 27 new tests (1,636 total across 91 files). v1.41.0. |
| NARR-CURSOR-1 | 2026-04-06 | PASS | Collapsing narration cursor: overlay right-edge anchored to `<p>` ancestor, left edge advances with narration, width derived per tick. CSS simplified to 2-stop gradient. NARRATION_BAND_PAD_PX removed. 16 new tests (1,609 total across 90 files). v1.40.0. |
| EXT-ENR-A | 2026-04-06 | PASS | Resilient extension connection: exponential backoff, pending article persistence, article-ack, EADDRINUSE retry cap, auth timeout, three-state UI, lifecycle hooks. 18 new tests (1,593 total across 89 files). v1.39.0. |
| HOTFIX-14 | 2026-04-06 | PASS | URL extraction fetchWithBrowser fallback (BUG-155), authenticated-only client count + 5s polling + 15s heartbeat (BUG-156). 12 new tests (1,575 total across 88 files). v1.38.2. |
| SELECTION-1 | 2026-04-06 | PASS | Word anchor contract: soft/hard/resume tiers, mode s