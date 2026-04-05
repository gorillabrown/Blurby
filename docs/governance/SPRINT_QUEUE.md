# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to >=3.

**Full specs:** `ROADMAP.md` (`TTS-7N`, `EINK-6A`, `EINK-6B`, `GOALS-6B`)

**Queue rules:** FIFO — top sprint executes next. >=3 depth maintained.

---

```
SPRINT QUEUE STATUS:
Queue depth: 4
Next sprint: TTS-7N (Kokoro Pause Semantics & Settings Link Repair)
Health: GREEN — one targeted TTS hotfix before feature work. 4 queued sprints fully spec'd.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | Findings | Summary |
|---|-----------|---------|--------|------|----------|---------|
| 1 | TTS-7N | v1.33.9 | `hotfix/tts-7n-pause-semantics-settings-links` | Quick | BUG-136, BUG-137 | **FULLY SPEC'D.** Make Kokoro pause sliders and dialogue threshold materially affect narration, and repair all Ctrl+K TTS settings links to open the dedicated `tts` page instead of stale `speed-reading` routes. |
| 2 | EINK-6A | v1.34.0 | `sprint/eink-6a-foundation` | Full | — | **FULLY SPEC'D.** Decouple e-ink from theme → independent display mode toggle. New `einkMode` setting, CSS split (behavioral vs color), ThemeSettings restructure, eink controller update. 10 tasks, 10 success criteria. |
| 3 | EINK-6B | v1.35.0 | `sprint/eink-6b-ergonomics` | Full | — | **FULLY SPEC'D.** Stepped flow (chunk advance for e-ink), burst focus (phrase grouping), adaptive refresh heuristic. 8 tasks, 10 success criteria. Depends on EINK-6A. |
| 4 | GOALS-6B | v1.36.0 | `sprint/goals-6b-tracking` | Full | — | **FULLY SPEC'D.** Reading goal system — daily pages/minutes, weekly books, streak tracking, library progress widget, goals settings page. 11 tasks, 15 success criteria. Can run parallel with EINK-6B. |

**Agent staging rule:** `TTS-7N` is Quick-tier. EINK and GOALS are Full-tier (test-runner → spec-compliance-reviewer → quality-reviewer → doc-keeper → blurby-lead).

**Dispatch status:** `TTS-7N` is dispatch-ready now. `EINK-6A` waits until the TTS hotfix clears. `EINK-6B` waits for `EINK-6A`. `GOALS-6B` can run parallel with EINK-6B after EINK-6A completes.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| TD-2 | Deferred. Mode wiring is feature work. Specs stale. Re-triage post-EINK/GOALS. |
| HOTFIX-1 | Deferred. Grid bugs may fold into a UI-FIX sprint later. |
| Sprint 23 | Partially absorbed by Phase 1. Remainder re-triage post-EINK/GOALS. |
| Sprint 25 | Deferred to Phase 5 (ROADMAP_V2). |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| TTS-7M | 2026-04-05 | PASS | Persistent resume-anchor & reopen authority. BUG-135 resolved — resumeAnchorRef replaces time-limited preservePlaybackAnchorUntilRef, captures live cursor on pause, saved position on reopen, consumed on mode start, cleared on explicit selection. Passive onLoad/onRelocate gated. 17 new tests (1,372 total). v1.33.8. |
| TTS-7N | — | READY | Kokoro pause semantics & settings link repair. BUG-136/137 open — TTS pause sliders/dialogue threshold must materially affect Kokoro narration, and Ctrl+K TTS settings links must route to `tts`. |
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
