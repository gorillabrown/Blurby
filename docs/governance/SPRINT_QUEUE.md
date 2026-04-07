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
Queue depth: 2 — YELLOW (backfill needed)
Next sprint: FLOW-INF-C (Cross-Book Continuous Reading)
Health: YELLOW — STAB-1A complete (v1.45.0). FLOW-INF-C → PERF-1 queued. One more sprint needed for GREEN.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | FLOW-INF-C | v1.46.0 | `sprint/flow-inf-c-cross-book` | Full | **YES** | Full spec: 14 tasks, 14 success criteria, cross-book continuous reading with transition overlay + queue auto-advance. Depends on FLOW-INF-B. |
| 2 | PERF-1 | v1.47.0 | `sprint/perf-1-audit` | Full | **YES** | Full spec: 18 tasks (2-phase: measure then remediate), 18 success criteria. Startup parallelization, renderer de-thrash, data layer debounce/LRU, Vite code splitting. |

**Dispatch status:** Queue depth 2 — YELLOW. One more sprint needed for GREEN. FLOW-INF-C → PERF-1 fully spec'd.

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
11. **Backfill queue to ≥3** — spec one more sprint to restore GREEN before dispatching FLOW-INF-C.

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