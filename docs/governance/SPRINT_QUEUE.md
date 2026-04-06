# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to >=3.

**Full specs:** `ROADMAP.md` (`EINK-6A`, `EINK-6B`, `GOALS-6B`)

**Queue rules:** FIFO — top sprint executes next. >=3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 0 — RED (below minimum 3). Backfill needed.
Next sprint: None queued — spec new sprints from IDEAS.md or Someday Backlog.
Health: RED — HOTFIX-12 complete. EINK/GOALS parked. Need 3 sprints for GREEN.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| — | *(empty)* | — | — | — | — | Queue depleted. Backfill required before next dispatch. |

**Dispatch status:** Queue depth 0 — RED. Spec 3 new sprints from IDEAS.md before resuming implementation work.

**Watch item:** EINK-6A/6B and GOALS-6B are parked (fully spec'd in ROADMAP.md, ready to re-queue when TTS/extension focus concludes).

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| EINK-6A | Parked. Fully spec'd in ROADMAP.md. Re-queue when TTS/extension focus concludes. |
| EINK-6B | Parked. Fully spec'd in ROADMAP.md. Depends on EINK-6A. |
| GOALS-6B | Parked. Fully spec'd in ROADMAP.md. Independent of EINK — can run in parallel. |
| TD-2 | Deferred. Mode wiring is feature work. Specs stale. Re-triage post-EINK/GOALS. |
| HOTFIX-1 | Deferred. Grid bugs may fold into a UI-FIX sprint later. |
| Sprint 23 | Partially absorbed by Phase 1. Remainder re-triage post-EINK/GOALS. |
| Sprint 25 | Deferred to Phase 5 (ROADMAP_V2). |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| HOTFIX-12 | 2026-04-05 | PASS | Bug report triage fixes. BUG-146/147/148/149/150 resolved — chapter dropdown narration tracking, floating return-to-narration button, position restore toast, chunked EPUB extraction (setImmediate yield), keyboard guard refined + Ctrl+Enter in bug reporter. 17 new tests (1,546 total). v1.37.1. |
| TTS-7R | 2026-04-05 | PASS | Calm narration band & cursor ownership fix. BUG-145a/b/c resolved — `lastConfirmedAudioWordRef` separates canonical audio cursor from visual cursor; `SIMPLE_NARRATION_GLIDE` removed (audio-progress glide active); fixed-size overlay band (measure-once line-height); truth-sync visual-only; per-word context CSS removed. 25 new tests (`tests/calmNarrationBand.test.ts`, 1,529 total). v1.37.0. |
| TTS-7Q | 2026-04-05 | PASS* | True glide & audio-aligned narration cursor. BUG-143/144 resolved — canonical `AudioProgressReport` type + `getAudioProgress()` on scheduler; `onChunkHandoff` callback wired through kokoroStrategy and exposed on `useNarration`; RAF-based glide loop in `FoliatePageView.tsx` drives the narration band from audio-time progress, not DOM chasing; chunk handoff is continuity-safe. New `src/utils/narrateDiagnostics.ts` + new test file `tests/audioGlide.test.ts`. 25 new tests (1,504 total). v1.36.1. Follow-on live issue tracked separately as BUG-145 (visual band still laggy / over-corrected). |
| TTS-7P | 2026-04-05 | PASS | Rolling pause-boundary planner. BUG-140 resolved — new `narrationPlanner.ts` builds local boundary plans for the active text window; `generationPipeline.ts` and `kokoroStrategy.ts` updated to consult the plan; silence injection, resume, retarget, and dialogue handling all use one consistent structure. 33 new tests (1,479 total). v1.36.0. |
| EXT-5C | 2026-04-05 | PASS | Rich article capture & hero image cards. BUG-141/142 resolved — cleaned article HTML preserved, inline images downloaded/re-written into EPUB for offline reading, shared image pipeline used by URL and extension imports, and hero image promoted to reading cards. 24 new tests (1,442 total). v1.35.0. |
| TTS-7O | 2026-04-05 | PASS | Audible pause injection & smooth narration cursor. BUG-138/139 resolved — classifyChunkBoundary + silence injection at chunk edges, 3-word narration window, CSS transitions for smooth cursor, truth-sync every 12 words. 27 new tests (1,418 total). v1.34.0. |
| TTS-7N | 2026-04-05 | PASS | Kokoro pause semantics & settings link repair. BUG-136/137 resolved — pause config drives word-weight scaling and sentence-boundary chunk snapping, Ctrl+K TTS links repaired to "tts" page. 19 new tests (1,391 total). v1.33.9. **TTS stabilization lane FULLY CLOSED.** |
| TTS-7M | 2026-04-05 | PASS | Persistent resume-anchor & reopen authority. BUG-135 resolved — resumeAnchorRef replaces time-limited preservePlaybackAnchorUntilRef, captures live cursor on pause, saved position on reopen, consumed on mode start, cleared on explicit selection. Passive onLoad/onRelocate gated. 17 new tests (1,372 total). v1.33.8. |
| TTS-7L | 2026-04-05 | PASS | Exact Foliate text-selection mapping. BUG-134 resolved — selectionchange resolves exact .page-word span with data-word-index, unified click/selection payload, first-match text fallback demoted. 15 new tests (1,343 total). v1.33.7. **TTS stabilization lane FULLY CLOSED.** |
| TTS-7K | 2026-04-05 | PASS* | EPUB global word-source promotion & page-mode isolation. BUG-131/132/133 resolved — full-book words promoted as source of truth, global index validation for start-word, onWordsReextracted source protection, page-mode isolated from section-boundary effect. 22 new tests (1,331 total). v1.33.6. Follow-up required via TTS-7L for exact Foliate text-selection mapping. |
| TTS-7J | 2026-04-04 | PASS* | Foliate section-sync ownership, word-source dedupe & initial selection protection. BUG-128/129/130 resolved — single narration section-sync owner (miss-recovery only), sectionIndex-based word dedupe, userExplicitSelectionRef guards onLoad restore, unified start-word policy via resolveFoliateStartWord. Follow-up required via TTS-7K for full-book word-source promotion and page-mode isolation. 14 new tests (1,309 total). v1.33.5. |
| TTS-7I | 2026-04-04 | PASS* | Foliate follow-scroll unification & exact miss recovery. BUG-124/125/126/127 resolved — shared `resolveWordState()` truth source, single scroll owner, exact section-based miss recovery with cooldown, return-to-narration cursor restore. Follow-up required via TTS-7J for section-sync ownership, word-source dedupe, and first-play selection protection. 8 new tests (1,295 total). v1.33.4. |
| TTS-7H | 2026-04-04 | PASS | Visible-word readiness & stable launch index. BUG-122/123 — `isWordVisibleOnPage()` replaces false-positive `isWordInDom()`, frozen launch index prevents drift, section-based fallback. 8 new tests (1,287 total). v1.33.3. |
| TTS-7G | 2026-04-04 | PASS | First-chunk IPC verification. BUG-117 verified resolved — response path < 2ms (root causes fixed by TTS-7C/NAR-5/TTS-7E). DEV instrumentation added. 6 new tests (1,279 total). v1.33.2. **TTS stabilization lane CLOSED.** |
| TTS-7F | 2026-04-04 | PASS | Proactive entry cache coverage + cruise warm. First-5-minute opening narration coverage for non-archived readings, startup repair checks, reading-open queueing, pure `isWordInDom()` probe, and single-launch token. BUG-116/118/119/120/121 resolved. 11 new tests (1,273 total). v1.33.1. |
| TTS-7D | 2026-04-04 | PASS | Integration verification. 8 integration tests, 12-cell smoke test matrix, all 15 TTS bugs verified resolved, stabilization closeout doc in TECHNICAL_REFERENCE.md. 8 new tests (1,254 total). v1.32.0. TTS stabilization lane COMPLETE. |
| TTS-7C | 2026-04-04 | PASS | Throughput & dead code. Narration start microtasks (<50ms), pause UI hidden for Kokoro, extraction dedupe, Float32Array IPC (no Array.from), pipeline backpressure. BUG-101/110/112/113/115 resolved. 12 new tests (1,246 total). v1.31.0. |
| TTS-7B | 2026-04-04 | PASS | Cursor contract. EPUB click retarget, browse-away reconciliation, Kokoro fallback teardown, pipeline pause/resume, resume-from-cursor. BUG-107/108/109/111 resolved. 13 new tests (1,234 total). v1.30.0. |
| TTS-7A | 2026-04-04 | PASS | Cache correctness. Real cached word counts (no hardcoded 148), background cacher voice key fix, override-hash identity, live cursor tracking, diagnostics fix. BUG-102/103/104/105/106/114 resolved. 12 new tests (1,221 total). v1.29.0. |
| TTS-6S | 2026-04-04 | PASS | Cursor sync, pause shaping & backlog fill hotfix. BUG-096/097/098. 13 new tests (1,209 total). v1.28.0. |
| HOTFIX-11 | 2026-04-04 | PASS | Bug reporter diagnostics. BUG-099/100. 8 new tests (1,196 total). v1.27.1. |
